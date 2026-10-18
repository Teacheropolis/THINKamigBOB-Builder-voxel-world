import { randomBytes } from "node:crypto";

export const DEFAULT_UPLOAD_TICKET_TTL_MS = 5 * 60 * 1000;

export function createEvidenceUploadTicketStore({ ttlMs = DEFAULT_UPLOAD_TICKET_TTL_MS, now = () => Date.now(), generateToken = () => randomBytes(24).toString("base64url") } = {}) {
  const tickets = new Map();
  return Object.freeze({
    issue({ studentId, activity, allowedTypes = ["image/jpeg", "image/png", "image/webp"] }) {
      if (!studentId || !activity || !Array.isArray(allowedTypes) || !allowedTypes.length) return { ok: false, reason: "invalid-ticket-scope" };
      const token = generateToken();
      tickets.set(token, { studentId: String(studentId), activity: String(activity), allowedTypes: [...allowedTypes], expiresAt: now() + ttlMs });
      return { ok: true, token, expiresInMs: ttlMs };
    },
    consume(token, { mimeType }) {
      const ticket = tickets.get(token);
      tickets.delete(token);
      if (!ticket) return { ok: false, reason: "invalid-or-used-ticket" };
      if (now() > ticket.expiresAt) return { ok: false, reason: "expired-ticket" };
      if (!ticket.allowedTypes.includes(mimeType)) return { ok: false, reason: "type-not-authorized" };
      return { ok: true, scope: { studentId: ticket.studentId, activity: ticket.activity } };
    },
  });
}
