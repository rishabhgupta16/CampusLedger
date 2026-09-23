/**
 * Centralized Express error handler. Every route/controller can simply
 * `throw` or call `next(error)` and it lands here — no per-route try/catch
 * boilerplate needed for common cases (Express 5 forwards rejected promises
 * from async route handlers automatically).
 *
 * Always responds with the consistent shape: { success: false, message }.
 * Never leaks stack traces, secrets, or raw driver errors in production.
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal server error';

  // Mongoose: invalid ObjectId cast (e.g. malformed :id param)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  // Mongoose: schema validation failure
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose: duplicate unique key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with that ${field} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  console.error(`[Error] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
