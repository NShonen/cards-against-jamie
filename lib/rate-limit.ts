import { NextResponse } from "next/server";
import { AppError } from "./error-utils";

interface RateLimitConfig {
  maxRequests: number; // Maximum number of requests allowed
  windowMs: number; // Time window in milliseconds
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // per minute
};

class RateLimiter {
  private requests: Map<string, number[]>;
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.requests = new Map();
    this.config = { ...defaultConfig, ...config };
  }

  check(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing timestamps for this key
    let timestamps = this.requests.get(key) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Check if we're over the limit
    if (timestamps.length >= this.config.maxRequests) {
      return false;
    }

    // Add current timestamp
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Create rate limiters with different configurations
export const apiLimiter = new RateLimiter();
export const authLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 5 requests per minute for auth endpoints
});
export const gameLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 10 * 1000, // 50 requests per 10 seconds for game actions
});

export function checkRateLimit(
  key: string,
  limiter: RateLimiter = apiLimiter
): void {
  if (!limiter.check(key)) {
    throw new AppError(
      "Too many requests. Please try again later.",
      "RATE_LIMIT_EXCEEDED"
    );
  }
}

export function handleRateLimit(
  request: Request,
  limiter: RateLimiter = apiLimiter
): NextResponse | null {
  try {
    // Use IP address as rate limit key
    // In production, you might want to use a more sophisticated key
    const key = request.headers.get("x-forwarded-for") || "unknown";
    checkRateLimit(key, limiter);
    return null;
  } catch (error) {
    if (error instanceof AppError && error.code === "RATE_LIMIT_EXCEEDED") {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: 429 }
      );
    }
    throw error;
  }
}
