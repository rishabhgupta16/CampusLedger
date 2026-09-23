/**
 * Catches any request that didn't match a route and forwards a 404 error
 * into the centralized error handler below it in the middleware chain.
 */
export function notFound(req, res, next) {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}
