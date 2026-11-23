import jwt from 'jsonwebtoken';

/**
 * Signs a JWT containing the user's id. Kept in one place so the payload
 * shape and expiry are consistent everywhere a token is issued.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' // short: refresh tokens keep the user signed in,
  });
};

export default generateToken;
