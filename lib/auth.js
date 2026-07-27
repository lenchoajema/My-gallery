import crypto from "crypto";

// Owner access for each page is a slug + password. Instead of a sessions
// table, we hand back a small signed token after a successful password
// check and store it in an httpOnly cookie named `owner_<slug>`. The token
// is just the slug + an expiry, HMAC-signed with SESSION_SECRET, so the
// server can verify it on every request without looking anything up.

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error(
      "Missing SESSION_SECRET environment variable. Set it in .env.local (see .env.example)."
    );
  }
  return value;
}

export function ownerCookieName(slug) {
  return `owner_${slug}`;
}

export function signOwnerToken(slug) {
  const expires = Date.now() + WEEK_MS;
  const payload = `${slug}.${expires}`;
  const signature = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyOwnerToken(slug, token) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenSlug, expires, signature] = parts;
  if (tokenSlug !== slug) return false;
  if (Date.now() > Number(expires)) return false;

  const payload = `${tokenSlug}.${expires}`;
  const expected = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
