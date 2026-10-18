import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { GOOGLE_OAUTH_REQUIRED_SCOPE } from "./evidence-google-oauth-readiness.mjs";

export const MAX_PILOT_IMAGE_BYTES = 8 * 1024 * 1024;
export const PILOT_IMAGE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"]);
export const DEFAULT_EVIDENCE_LAUNCH_TTL_MS = 4 * 60 * 60 * 1000;

function send(response, status, body, origin) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
  });
  response.end(JSON.stringify(body));
}

function safeSegment(value, fallback) {
  const normalized = String(value || "").trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized.slice(0, 80) || fallback;
}

async function readBoundedBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_PILOT_IMAGE_BYTES) throw new Error("upload-too-large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readJson(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 16_384) throw new Error("request-too-large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

const STATIC_CONTENT_TYPES = Object.freeze({
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp",
});

async function serveStatic(response, pathname, staticRoot) {
  const rootPath = resolve(staticRoot instanceof URL ? fileURLToPath(staticRoot) : staticRoot);
  const relativePath = pathname === "/" ? "platform/index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  const filePath = resolve(rootPath, relativePath);
  if (filePath !== rootPath && !filePath.startsWith(`${rootPath}${sep}`)) return false;
  try {
    const bytes = await readFile(filePath);
    response.writeHead(200, { "Content-Type": STATIC_CONTENT_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(bytes);
    return true;
  } catch {
    return false;
  }
}

export function createEvidenceUploadBroker({ host = "127.0.0.1", port = 0, platformOrigin, teacherKey, ticketStore, folderId, driveClient, staticRoot, launchTtlMs = DEFAULT_EVIDENCE_LAUNCH_TTL_MS, now = () => Date.now() }) {
  if (!platformOrigin || !teacherKey || typeof ticketStore?.issue !== "function" || typeof ticketStore?.consume !== "function" || !folderId || typeof driveClient?.uploadImage !== "function") {
    throw new Error("complete-broker-configuration-required");
  }
  let activeLaunch = null;
  const evidenceRecords = [];
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (staticRoot && request.method === "GET" && !requestUrl.pathname.startsWith("/api/")) {
      if (await serveStatic(response, requestUrl.pathname, staticRoot)) return;
      return send(response, 404, { error: "not-found" }, platformOrigin);
    }
    const origin = request.headers.origin || requestUrl.origin;
    if (origin !== platformOrigin) return send(response, 403, { error: "origin-not-approved" }, platformOrigin);
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": platformOrigin,
        "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, x-evidence-filename, x-evidence-type, x-evidence-teacher-key",
        ...(request.headers["access-control-request-private-network"] === "true" ? { "Access-Control-Allow-Private-Network": "true" } : {}),
        Vary: "Origin",
      });
      return response.end();
    }
    if (requestUrl.pathname.startsWith("/api/evidence/google/v1/")) {
      return send(response, 503, { status: "setup-required", scope: GOOGLE_OAUTH_REQUIRED_SCOPE, productionOAuthEnabled: false }, platformOrigin);
    }
    if (request.url === "/api/evidence/v1/health" && request.method === "GET") {
      return send(response, 200, { status: "ready", destination: "teacher-owned-drive", pilot: "fictional-image-only" }, platformOrigin);
    }
    if (requestUrl.pathname === "/api/evidence/v1/evidence" && request.method === "GET") {
      if (request.headers["x-evidence-teacher-key"] !== teacherKey) return send(response, 401, { error: "teacher-key-required" }, platformOrigin);
      try {
        const records = typeof driveClient.listImages === "function" ? await driveClient.listImages({ folderId }) : evidenceRecords.map(({ bytes, ...record }) => record);
        return send(response, 200, { ok: true, evidence: records.slice(0, 50) }, platformOrigin);
      } catch {
        return send(response, 502, { error: "drive-list-failed" }, platformOrigin);
      }
    }
    const previewMatch = requestUrl.pathname.match(/^\/api\/evidence\/v1\/evidence\/([^/]+)\/content$/);
    if (previewMatch && request.method === "GET") {
      if (request.headers["x-evidence-teacher-key"] !== teacherKey) return send(response, 401, { error: "teacher-key-required" }, platformOrigin);
      try {
        const evidenceId = decodeURIComponent(previewMatch[1]);
        const record = evidenceRecords.find((item) => item.id === evidenceId);
        const content = record || (typeof driveClient.getImage === "function" ? await driveClient.getImage({ folderId, fileId: evidenceId }) : null);
        if (!content) return send(response, 404, { error: "evidence-not-found" }, platformOrigin);
        response.writeHead(200, { "Content-Type": content.mimeType, "Content-Length": content.bytes.length, "Cache-Control": "no-store", "Access-Control-Allow-Origin": platformOrigin, Vary: "Origin" });
        return response.end(content.bytes);
      } catch {
        return send(response, 502, { error: "drive-preview-failed" }, platformOrigin);
      }
    }
    if (request.url === "/api/evidence/v1/launch" && request.method === "PUT") {
      if (request.headers["x-evidence-teacher-key"] !== teacherKey) return send(response, 401, { error: "teacher-key-required" }, platformOrigin);
      try {
        const body = await readJson(request);
        const activity = String(body.activity || "").trim();
        if (!activity || activity.length > 120) return send(response, 422, { error: "valid-activity-required" }, platformOrigin);
        activeLaunch = { id: `launch-${now().toString(36)}`, activity, expiresAt: now() + launchTtlMs };
        return send(response, 200, { ok: true, launch: { id: activeLaunch.id, activity, expiresInMs: launchTtlMs } }, platformOrigin);
      } catch (error) {
        return send(response, 400, { error: error.message === "request-too-large" ? error.message : "invalid-json" }, platformOrigin);
      }
    }
    if (request.url === "/api/evidence/v1/launch" && request.method === "GET") {
      if (!activeLaunch || now() > activeLaunch.expiresAt) return send(response, 404, { error: "no-active-launch" }, platformOrigin);
      return send(response, 200, { ok: true, launch: { id: activeLaunch.id, activity: activeLaunch.activity, expiresInMs: activeLaunch.expiresAt - now() } }, platformOrigin);
    }
    if (request.url === "/api/evidence/v1/tickets" && request.method === "POST") {
      if (!activeLaunch || now() > activeLaunch.expiresAt) return send(response, 409, { error: "no-active-launch" }, platformOrigin);
      try {
        const body = await readJson(request);
        const studentId = String(body.studentId || "").trim();
        if (body.launchId !== activeLaunch.id || !studentId || studentId.length > 100) return send(response, 422, { error: "valid-fictional-student-launch-required" }, platformOrigin);
        const issued = ticketStore.issue({ studentId, activity: activeLaunch.activity, allowedTypes: PILOT_IMAGE_TYPES });
        if (!issued.ok) return send(response, 422, { error: issued.reason }, platformOrigin);
        return send(response, 201, { ok: true, ticket: issued.token, expiresInMs: issued.expiresInMs }, platformOrigin);
      } catch (error) {
        return send(response, 400, { error: error.message === "request-too-large" ? error.message : "invalid-json" }, platformOrigin);
      }
    }
    if (request.url !== "/api/evidence/v1/uploads" || request.method !== "POST") {
      return send(response, 404, { error: "not-found" }, platformOrigin);
    }
    const ticket = String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!ticket) {
      return send(response, 401, { error: "valid-upload-session-required" }, platformOrigin);
    }
    const mimeType = String(request.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    if (!PILOT_IMAGE_TYPES.includes(mimeType)) return send(response, 415, { error: "pilot-image-type-not-allowed" }, platformOrigin);
    const authorization = ticketStore.consume(ticket, { mimeType });
    if (!authorization.ok) return send(response, 401, { error: authorization.reason }, platformOrigin);
    const studentId = safeSegment(authorization.scope.studentId, "fictional-student");
    const activity = safeSegment(authorization.scope.activity, "pilot-activity");
    const originalName = safeSegment(request.headers["x-evidence-filename"], "evidence-image");
    const evidenceType = ["Photo", "Screenshot"].includes(request.headers["x-evidence-type"]) ? request.headers["x-evidence-type"] : "Photo";
    try {
      const bytes = await readBoundedBody(request);
      if (!bytes.length) return send(response, 422, { error: "empty-upload" }, platformOrigin);
      const result = await driveClient.uploadImage({ folderId, bytes, mimeType, fileName: originalName, activity, studentId, evidenceType });
      evidenceRecords.unshift({ id: String(result.id), name: String(result.name), mimeType, size: bytes.length, studentId, activity, evidenceType, savedAt: new Date(now()).toISOString(), bytes });
      if (evidenceRecords.length > 50) evidenceRecords.length = 50;
      return send(response, 201, { ok: true, evidence: { id: result.id, name: result.name, mimeType, size: bytes.length } }, platformOrigin);
    } catch (error) {
      const status = error.message === "upload-too-large" ? 413 : 502;
      return send(response, status, { error: error.message === "upload-too-large" ? error.message : "drive-upload-failed" }, platformOrigin);
    }
  });
  return Object.freeze({
    listen: () => new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, host, () => resolve(server.address())); }),
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  });
}
