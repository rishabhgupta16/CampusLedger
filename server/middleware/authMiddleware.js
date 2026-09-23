import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Reads `Authorization: Bearer <token>`, verifies it, and loads the
 * authenticated user onto req.user. Any missing/invalid/expired token
 * rejects with 401 through the centralized error handler (which already
 * knows how to turn JsonWebTokenError/TokenExpiredError into clean 401s).
 */
export async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Not authorized, user no longer exists');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    // JsonWebTokenError / TokenExpiredError are mapped to clean 401s
    // by the centralized error handler.
    next(error);
  }
}
