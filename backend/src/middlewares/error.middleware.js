import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || []);
  }

  const response = {
    success: error.success,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export { errorMiddleware };