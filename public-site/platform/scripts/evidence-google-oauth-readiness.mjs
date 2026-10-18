export const GOOGLE_OAUTH_ENDPOINTS = Object.freeze({
  status: "/api/evidence/google/v1/status",
  start: "/api/evidence/google/v1/connect/start",
  callback: "/api/evidence/google/v1/connect/callback",
  disconnect: "/api/evidence/google/v1/connect/disconnect",
});

export const GOOGLE_OAUTH_REQUIRED_SCOPE = "https://www.googleapis.com/auth/drive.file";

export const GOOGLE_OAUTH_GATES = Object.freeze([
  Object.freeze({ id: "public-origin", label: "Published HTTPS platform domain" }),
  Object.freeze({ id: "oauth-client", label: "Production Google OAuth client" }),
  Object.freeze({ id: "server-secret", label: "Client secret stored only on the server" }),
  Object.freeze({ id: "token-vault", label: "Encrypted teacher token storage" }),
  Object.freeze({ id: "verified-brand", label: "Verified domain, privacy policy, and OAuth brand" }),
  Object.freeze({ id: "revoke-flow", label: "Teacher disconnect and token revocation" }),
  Object.freeze({ id: "monitoring", label: "Connection monitoring and guided reconnect" }),
]);

function isHttpsOrigin(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function assessGoogleOAuthReadiness(configuration = {}) {
  const ready = new Set();
  if (isHttpsOrigin(configuration.publicOrigin)) ready.add("public-origin");
  if (configuration.oauthClientConfigured === true) ready.add("oauth-client");
  if (configuration.serverSecretConfigured === true) ready.add("server-secret");
  if (configuration.encryptedTokenVaultConfigured === true) ready.add("token-vault");
  if (configuration.verifiedBrandConfigured === true) ready.add("verified-brand");
  if (configuration.revocationConfigured === true) ready.add("revoke-flow");
  if (configuration.monitoringConfigured === true) ready.add("monitoring");
  const gates = GOOGLE_OAUTH_GATES.map((gate) => ({ ...gate, ready: ready.has(gate.id) }));
  return Object.freeze({
    productionReady: gates.every((gate) => gate.ready),
    readyCount: ready.size,
    totalCount: gates.length,
    scope: GOOGLE_OAUTH_REQUIRED_SCOPE,
    gates,
  });
}

export function publicGoogleOAuthStatus(configuration = {}) {
  const assessment = assessGoogleOAuthReadiness(configuration);
  return Object.freeze({
    status: assessment.productionReady ? "ready" : "setup-required",
    readyCount: assessment.readyCount,
    totalCount: assessment.totalCount,
    scope: assessment.scope,
    endpoints: GOOGLE_OAUTH_ENDPOINTS,
  });
}
