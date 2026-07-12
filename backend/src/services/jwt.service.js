import jwt from 'jsonwebtoken';

/**
 * Generates a short-lived access token (expires in 15 minutes).
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Generates a persistent refresh token (expires in 7 days).
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Verifies access token signatures.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verifies refresh token signatures.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
