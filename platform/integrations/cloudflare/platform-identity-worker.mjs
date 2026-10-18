import { timingSafeEqual } from "node:crypto";
import { createGoogleIdTokenVerifier } from "./google-id-token-verifier.mjs";
import { platformSessionCookie, PLATFORM_SESSION_COOKIE } from "./platform-auth-d1-repository.mjs";
import { PLATFORM_IDENTITY_INTERNAL_PATHS } from "./platform-auth-worker.mjs";

const GOOGLE_PATH = "/api/auth/v1/google";
const STUDENT_PATH = "/api/auth/v1/student";
const SIGNOUT_PATH = "/api/auth/v1/signout";
const SESSION_PATH = "/api/auth/v1/session";
const HEALTH_PATH = "/api/auth/v1/health";
const CLASSROOMS_PATH = "/api/classrooms/v1";
const LESSON_STEPS_PATH = "/api/classrooms/v1/lesson-steps";
const MAX_BODY_BYTES = 65_536;

function json(status, value, headers = {}) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers } });
}

function redirect(location, cookie) {
  return new Response(null, { status: 303, headers: { location, "set-cookie": cookie, "cache-control": "no-store", "referrer-policy": "no-referrer" } });
}

async function boundedText(request) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) throw Object.assign(new Error("request-too-large"), { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw Object.assign(new Error("request-too-large"), { status: 413 });
  return text;
}

function cookie(request, name) {
  const values = String(request.headers.get("cookie") || "").split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  return values.length === 1 ? decodeURIComponent(values[0].slice(name.length + 1)) : null;
}

function sameSecret(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

function googleCsrfAccepted(request, form) {
  const cookieHeader = String(request.headers.get("cookie") || "");
  const cookieToken = cookie(request, "g_csrf_token");
  const formToken = form.get("g_csrf_token");
  if (sameSecret(cookieToken, formToken)) return true;
  const cookieWasBlocked = !cookieHeader.split(";").some((part) => part.trim().startsWith("g_csrf_token="));
  return cookieWasBlocked
    && Boolean(formToken)
    && request.headers.get("origin") === "https://accounts.google.com";
}

async function internal(binding, path, body, request, method = "POST") {
  const headers = new Headers({ "content-type": "application/json", accept: "application/json" });
  const sessionCookie = request.headers.get("cookie");
  if (sessionCookie) headers.set("cookie", sessionCookie);
  const response = await binding.fetch(new Request(`https://platform-auth.internal${path}`, { method, headers, body: method === "GET" ? undefined : JSON.stringify(body) }));
  const text = await response.text();
  if (text.length > MAX_BODY_BYTES) throw new Error("platform-auth-response-too-large");
  let value;
  try { value = JSON.parse(text); } catch { throw new Error("invalid-platform-auth-response"); }
  if (!response.ok) return { ok: false, status: response.status, value };
  return { ok: true, status: response.status, value };
}

function ready(env) {
  try {
    const origin = new URL(env?.PLATFORM_ORIGIN);
    return env?.PRODUCTION_ENABLED === "true" && origin.protocol === "https:" && typeof env?.PLATFORM_AUTH?.fetch === "function" && Boolean(env?.GOOGLE_SIGNIN_CLIENT_ID) && allowedTeacherEmails(env).size > 0;
  } catch { return false; }
}

function allowedTeacherEmails(env) {
  return new Set(String(env?.ALLOWED_TEACHER_EMAILS || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean));
}

export function createPlatformIdentityWorker({ verifierFactory = (options) => createGoogleIdTokenVerifier(options) } = {}) {
  return Object.freeze({
    async fetch(request, env) {
      const url = new URL(request.url);
      if (url.pathname === HEALTH_PATH && request.method === "GET") return json(200, { ok: true, productionReady: ready(env) });
      if (![GOOGLE_PATH, STUDENT_PATH, SIGNOUT_PATH, SESSION_PATH, CLASSROOMS_PATH, LESSON_STEPS_PATH].includes(url.pathname)) return json(404, { error: "not-found" });
      if (!ready(env)) return json(503, { status: "setup-required" });
      const origin = new URL(env.PLATFORM_ORIGIN).origin;
      try {
        if (url.pathname === SESSION_PATH && request.method === "GET") {
          const result = await internal(env.PLATFORM_AUTH, PLATFORM_IDENTITY_INTERNAL_PATHS.session, {}, request, "GET");
          if (!result.ok) return json(result.status, result.value);
          return json(200, result.value);
        }

        if (url.pathname === GOOGLE_PATH && request.method === "POST") {
          const form = new URLSearchParams(await boundedText(request));
          if (!googleCsrfAccepted(request, form)) return json(403, { error: "google-signin-csrf-check-failed" });
          const identity = await verifierFactory({ clientId: env.GOOGLE_SIGNIN_CLIENT_ID }).verify(form.get("credential"));
          if (!allowedTeacherEmails(env).has(identity.email)) return json(403, { error: "teacher-account-not-approved" });
          const result = await internal(env.PLATFORM_AUTH, PLATFORM_IDENTITY_INTERNAL_PATHS.teacherSession, identity, request);
          if (!result.ok) return json(502, { error: "teacher-session-unavailable" });
          return redirect(`${origin}/platform/index.html#/teacher/dashboard`, platformSessionCookie(result.value.token));
        }

        if (url.pathname === STUDENT_PATH && request.method === "POST") {
          if (env.STUDENT_ACCESS_ENABLED !== "true") return json(503, { status: "student-access-not-open" });
          if (request.headers.get("origin") !== origin) return json(403, { error: "same-origin-request-required" });
          let input;
          try { input = JSON.parse(await boundedText(request)); } catch { return json(400, { error: "invalid-json" }); }
          if (typeof env.STUDENT_ENTRY_RATE_LIMIT?.limit !== "function") return json(503, { status: "setup-required" });
          const rate = await env.STUDENT_ENTRY_RATE_LIMIT.limit({ key: `student-entry:${String(input.classCode || "").trim().toUpperCase().slice(0, 32)}` });
          if (!rate.success) return json(429, { error: "too-many-classroom-entry-attempts" }, { "retry-after": "60" });
          const result = await internal(env.PLATFORM_AUTH, PLATFORM_IDENTITY_INTERNAL_PATHS.studentSession, { classCode: input.classCode, studentCode: input.studentCode }, request);
          if (!result.ok) return json(result.status === 401 ? 401 : 502, { error: result.status === 401 ? "classroom-entry-not-recognized" : "student-session-unavailable" });
          return json(201, { ok: true, redirect: `${origin}/platform/index.html#/student/dashboard` }, { "set-cookie": platformSessionCookie(result.value.token) });
        }

        if (url.pathname === SIGNOUT_PATH && request.method === "POST") {
          if (request.headers.get("origin") !== origin) return json(403, { error: "same-origin-request-required" });
          await internal(env.PLATFORM_AUTH, PLATFORM_IDENTITY_INTERNAL_PATHS.revokeSession, {}, request);
          return json(200, { ok: true }, { "set-cookie": `${PLATFORM_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` });
        }

        if (url.pathname === CLASSROOMS_PATH && request.method === "POST") {
          if (request.headers.get("origin") !== origin) return json(403, { error: "same-origin-request-required" });
          let input;
          try { input = JSON.parse(await boundedText(request)); } catch { return json(400, { error: "invalid-json" }); }
          const result = await internal(env.PLATFORM_AUTH, PLATFORM_IDENTITY_INTERNAL_PATHS.classrooms, { name: input.name, studentLabels: input.studentLabels }, request);
          if (!result.ok) return json(result.status, result.value);
          return json(201, result.value);
        }

        if (url.pathname === CLASSROOMS_PATH && request.method === "GET") {
          const result = await internal(env.PLATFORM_AUTH, PLATFORM_IDENTITY_INTERNAL_PATHS.classrooms, {}, request, "GET");
          if (!result.ok) return json(result.status, result.value);
          return json(200, result.value);
        }

        if (url.pathname === LESSON_STEPS_PATH && request.method === "POST") {
          if (request.headers.get("origin") !== origin) return json(403, { error: "same-origin-request-required" });
          let input;
          try { input = JSON.parse(await boundedText(request)); } catch { return json(400, { error: "invalid-json" }); }
          const result = await internal(env.PLATFORM_AUTH, PLATFORM_IDENTITY_INTERNAL_PATHS.lessonSteps, { classId: input.classId, step: input.step }, request);
          if (!result.ok) return json(result.status, result.value);
          return json(201, result.value);
        }

        if (url.pathname === LESSON_STEPS_PATH && request.method === "GET") {
          const classId = url.searchParams.get("classId");
          const path = classId ? `${PLATFORM_IDENTITY_INTERNAL_PATHS.lessonSteps}?classId=${encodeURIComponent(classId)}` : PLATFORM_IDENTITY_INTERNAL_PATHS.lessonSteps;
          const result = await internal(env.PLATFORM_AUTH, path, {}, request, "GET");
          if (!result.ok) return json(result.status, result.value);
          return json(200, result.value);
        }
        return json(405, { error: "method-not-allowed" });
      } catch (error) {
        const status = Number(error?.status) || 401;
        const safeIdentityReasons = new Set([
          "google-signin-client-required",
          "invalid-google-id-token",
          "unsupported-google-token-signature",
          "google-discovery-unavailable",
          "invalid-google-discovery",
          "google-signing-keys-unavailable",
          "google-signing-key-not-found",
        ]);
        const rawReason = String(error?.message || "");
        const reason = safeIdentityReasons.has(rawReason)
          ? rawReason
          : rawReason && /^[A-Za-z0-9 .:_-]{1,120}$/.test(rawReason)
            ? rawReason
            : status >= 500 ? "internal-error" : "identity-rejected";
        console.error(JSON.stringify({ event: "platform-identity-error", path: url.pathname, status, reason }));
        return json(status, { error: status === 413 ? "request-too-large" : "identity-not-verified" });
      }
    },
  });
}

export default createPlatformIdentityWorker();

export const PLATFORM_IDENTITY_ENDPOINTS = Object.freeze({ health: HEALTH_PATH, google: GOOGLE_PATH, student: STUDENT_PATH, signout: SIGNOUT_PATH, session: SESSION_PATH, classrooms: CLASSROOMS_PATH, lessonSteps: LESSON_STEPS_PATH });
