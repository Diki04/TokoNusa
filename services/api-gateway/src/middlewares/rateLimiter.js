import { createApiResponse } from '@tokonusa/common';

/**
 * Sliding-window in-memory rate limiter middleware.
 * Tracks IP request timestamps, cleans up old windows, and returns 429 when threshold is exceeded.
 */
export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 100,
  keyGenerator = (req) =>
    req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1',
  message = 'Too many requests, please try again later',
  code = 'RATE_LIMIT_EXCEEDED',
} = {}) {
  const store = new Map();

  // Periodic cleanup of expired client records to prevent memory leak
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const active = timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        store.delete(key);
      } else {
        store.set(key, active);
      }
    }
  }, windowMs);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  const rateLimiterMiddleware = (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    const timestamps = store.get(key) || [];
    // Retain only requests within current sliding window
    const recentTimestamps = timestamps.filter((t) => t > windowStart);

    if (recentTimestamps.length >= max) {
      const oldestInWindow = recentTimestamps[0];
      const resetTime = oldestInWindow + windowMs;
      const retryAfterSec = Math.max(1, Math.ceil((resetTime - now) / 1000));

      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));

      return res.status(429).json(
        createApiResponse(false, null, {
          message,
          code,
          details: {
            retryAfter: retryAfterSec,
            limit: max,
            windowMs,
          },
        })
      );
    }

    recentTimestamps.push(now);
    store.set(key, recentTimestamps);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - recentTimestamps.length));

    next();
  };

  rateLimiterMiddleware.reset = () => {
    store.clear();
  };

  return rateLimiterMiddleware;
}

export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests to authentication endpoints, please try again later',
});
