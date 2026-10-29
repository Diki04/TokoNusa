import {
  DomainError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  createApiResponse,
} from '@tokonusa/common';

/**
 * Centralized error handler middleware for API Gateway.
 * Transforms domain errors, proxy errors, and unexpected exceptions into standard API responses.
 */
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (err instanceof ValidationError) {
    statusCode = 400;
    errorCode = err.code || 'VALIDATION_ERROR';
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    errorCode = err.code || 'UNAUTHORIZED';
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    errorCode = err.code || 'FORBIDDEN';
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    errorCode = err.code || 'NOT_FOUND';
  } else if (err instanceof ConflictError) {
    statusCode = 409;
    errorCode = err.code || 'CONFLICT';
  } else if (err instanceof DomainError) {
    statusCode = 400;
    errorCode = err.code || 'DOMAIN_ERROR';
  } else if (err.status || err.statusCode) {
    statusCode = err.status || err.statusCode;
    errorCode = err.code || (statusCode === 429 ? 'RATE_LIMIT_EXCEEDED' : 'ERROR');
  } else if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ENOTFOUND' ||
    err.code === 'ETIMEDOUT' ||
    err.code === 'ECONNRESET'
  ) {
    statusCode = 502;
    errorCode = 'BAD_GATEWAY';
  }

  const errorPayload = {
    message: err.message || 'Internal Server Error',
    code: errorCode,
    details: err.details || null,
  };

  if (!res.headersSent) {
    res.status(statusCode).json(createApiResponse(false, null, errorPayload));
  }
}

/**
 * 404 Not Found handler for unmatched gateway routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json(
    createApiResponse(false, null, {
      message: `Cannot ${req.method} ${req.originalUrl || req.url}`,
      code: 'NOT_FOUND',
      details: null,
    })
  );
}
