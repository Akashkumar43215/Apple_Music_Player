import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

const DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 30;
const hash = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

/** Creates a session and returns the raw token (shown to the client once, never stored). */
export const issueRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(48).toString('base64url');
  await RefreshToken.create({
    user: userId,
    tokenHash: hash(raw),
    expiresAt: new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000),
  });
  return raw;
};

/** Returns the session's user id, or null if the token is unknown or expired. */
export const findRefreshSession = async (raw) => {
  if (typeof raw !== 'string' || raw.length < 20 || raw.length > 200) return null;
  const doc = await RefreshToken.findOne({ tokenHash: hash(raw), expiresAt: { $gt: new Date() } });
  return doc ? doc.user : null;
};

export const revokeRefreshToken = (raw) =>
  typeof raw === 'string' ? RefreshToken.deleteOne({ tokenHash: hash(raw) }) : null;

export const revokeAllRefreshTokens = (userId) => RefreshToken.deleteMany({ user: userId });
