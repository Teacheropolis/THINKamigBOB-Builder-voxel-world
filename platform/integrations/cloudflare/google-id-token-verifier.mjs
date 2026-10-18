import { webcrypto } from "node:crypto";

const DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration";
const GOOGLE_ISSUERS = new Set(["https://accounts.google.com", "accounts.google.com"]);
const MAX_DOCUMENT_BYTES = 64 * 1024;
const subtle = globalThis.crypto?.subtle || webcrypto.subtle;

function decodePart(value) {
  try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")); } catch { throw new Error("invalid-google-id-token"); }
}

async function boundedJson(response, error) {
  if (!response.ok) throw new Error(error);
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > MAX_DOCUMENT_BYTES) throw new Error(error);
  const reader = response.body?.getReader();
  if (!reader) throw new Error(error);
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_DOCUMENT_BYTES) { await reader.cancel(); throw new Error(error); }
    chunks.push(Buffer.from(value));
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new Error(error); }
}

function authoritativeEmail(payload) {
  const email = String(payload.email || "").toLowerCase();
  return payload.email_verified === true && (email.endsWith("@gmail.com") || Boolean(payload.hd));
}

export function createGoogleIdTokenVerifier({ clientId, fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  if (!String(clientId || "").trim() || typeof fetchImpl !== "function") throw new Error("google-signin-client-required");

  return Object.freeze({
    async verify(token) {
      const encoded = String(token || "");
      if (!encoded || encoded.length > 16_000) throw new Error("invalid-google-id-token");
      const parts = encoded.split(".");
      if (parts.length !== 3) throw new Error("invalid-google-id-token");
      const header = decodePart(parts[0]);
      const payload = decodePart(parts[1]);
      if (header.alg !== "RS256" || !String(header.kid || "")) throw new Error("unsupported-google-token-signature");

      const discovery = await boundedJson(await fetchImpl(DISCOVERY_URL, { headers: { Accept: "application/json" }, redirect: "manual" }), "google-discovery-unavailable");
      if (discovery.issuer !== "https://accounts.google.com" || !String(discovery.jwks_uri || "").startsWith("https://www.googleapis.com/")) throw new Error("invalid-google-discovery");
      const jwks = await boundedJson(await fetchImpl(discovery.jwks_uri, { headers: { Accept: "application/json" }, redirect: "manual" }), "google-signing-keys-unavailable");
      const key = Array.isArray(jwks.keys) ? jwks.keys.find((item) => item.kid === header.kid && item.kty === "RSA" && item.use === "sig" && item.alg === "RS256") : null;
      if (!key) throw new Error("google-signing-key-not-found");
      const cryptoKey = await subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
      const valid = await subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, Buffer.from(parts[2], "base64url"), Buffer.from(`${parts[0]}.${parts[1]}`));
      const seconds = Math.floor(now() / 1000);
      if (!valid || !GOOGLE_ISSUERS.has(payload.iss) || payload.aud !== clientId || !Number.isFinite(payload.exp) || payload.exp <= seconds || !String(payload.sub || "") || String(payload.sub).length > 255 || !authoritativeEmail(payload)) throw new Error("invalid-google-id-token");
      return Object.freeze({ subject: String(payload.sub), email: String(payload.email).toLowerCase(), hostedDomain: payload.hd ? String(payload.hd).toLowerCase().slice(0, 253) : null });
    },
  });
}

export const GOOGLE_IDENTITY_DISCOVERY_URL = DISCOVERY_URL;
