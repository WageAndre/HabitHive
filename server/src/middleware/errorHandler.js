export function errorHandler(error, _request, response, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected error occurred';
  let details = error.details;

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  } else if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else if (['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
    statusCode = 401;
    message = 'Your session is invalid or has expired';
  }

  if (statusCode >= 500) console.error(error);

  response.status(statusCode).json({
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: error.stack } : {}),
  });
}
