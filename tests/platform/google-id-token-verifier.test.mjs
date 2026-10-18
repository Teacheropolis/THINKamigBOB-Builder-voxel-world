import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { createGoogleIdTokenVerifier, GOOGLE_IDENTITY_DISCOVERY_URL } from "../../platform/integrations/cloudflare/google-id-token-verifier.mjs";

async function signedToken(overrides = {}) {
  const pair = await webcrypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = await webcrypto.subtle.exportKey("jwk", pair.publicKey);
  Object.assign(jwk, { kid: "key-1", use: "sig", alg: "RS256" });
  const header = Buffer.from(JSON.stringify({ alg: "RS256", kid: "key-1", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ iss: "https://accounts.google.com", aud: "client-1", exp: 2000, sub: "google-user-1", email: "teacher@gmail.com", email_verified: true, ...overrides })).toString("base64url");
  const signature = await webcrypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, Buffer.from(`${header}.${payload}`));
  return { token: `${header}.${payload}.${Buffer.from(signature).toString("base64url")}`, jwk };
}

function fetcher(jwk) {
  return async (url, options) => {
    assert.equal(options.redirect, "manual");
    if (String(url) === GOOGLE_IDENTITY_DISCOVERY_URL) return Response.json({ issuer: "https://accounts.google.com", jwks_uri: "https://www.googleapis.com/oauth2/v3/certs" });
    return Response.json({ keys: [jwk] });
  };
}

test("Google verifier validates signature, issuer, audience, expiry, and authoritative email", async () => {
  const fixture = await signedToken();
  const verifier = createGoogleIdTokenVerifier({ clientId: "client-1", fetchImpl: fetcher(fixture.jwk), now: () => 1_000_000 });
  assert.deepEqual(await verifier.verify(fixture.token), { subject: "google-user-1", email: "teacher@gmail.com", hostedDomain: null });
});

test("Google verifier rejects wrong audience and non-authoritative external email", async () => {
  const wrongAudience = await signedToken({ aud: "other-client" });
  await assert.rejects(createGoogleIdTokenVerifier({ clientId: "client-1", fetchImpl: fetcher(wrongAudience.jwk), now: () => 1_000_000 }).verify(wrongAudience.token), /invalid-google-id-token/);
  const external = await signedToken({ email: "teacher@example.org", email_verified: true });
  await assert.rejects(createGoogleIdTokenVerifier({ clientId: "client-1", fetchImpl: fetcher(external.jwk), now: () => 1_000_000 }).verify(external.token), /invalid-google-id-token/);
});
