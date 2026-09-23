import jwt from 'jsonwebtoken';

/**
 * Signs a JWT containing only the minimum needed to identify the user —
 * no financial data, no password, no other PII in the payload.
 */
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}
