const IDENTITY_PREFIXES = ["/api/auth/", "/api/classrooms/"];
const EVIDENCE_PREFIX = "/api/evidence/";

function json(status, value) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function routeFor(pathname, env) {
  if (IDENTITY_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return { matched: true, service: env.PLATFORM_IDENTITY };
  if (pathname.startsWith(EVIDENCE_PREFIX)) return { matched: true, service: env.EVIDENCE_API };
  return { matched: false, service: null };
}

export async function onRequest({ request, env }) {
  const { matched, service } = routeFor(new URL(request.url).pathname, env);
  if (!matched) return json(404, { error: "not-found" });
  if (typeof service?.fetch !== "function") return json(503, { status: "connection-setup-required" });
  return service.fetch(request);
}

export const PAGES_API_BINDINGS = Object.freeze({
  identity: "PLATFORM_IDENTITY",
  evidence: "EVIDENCE_API",
});
