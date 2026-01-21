/**
 * Rate limiting configuration using Upstash Redis
 * Priority 1 - GAP-004
 * 
 * Note: Requires environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if rate limiting is configured
const isRateLimitEnabled =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis client (only if configured)
const redis = isRateLimitEnabled
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

/**
 * Rate limiter for chat endpoint
 * Limit: 10 requests per minute per user
 */
export const chatRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'ratelimit:chat',
    })
    : null;

/**
 * Rate limiter for document upload endpoint
 * Limit: 5 uploads per minute per user
 */
export const uploadRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ratelimit:upload',
    })
    : null;

/**
 * General rate limiter for other endpoints
 * Limit: 60 requests per minute per user
 */
export const generalRateLimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        analytics: true,
        prefix: 'ratelimit:general',
    })
    : null;

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Check rate limit for a given identifier
 * Returns success=true if rate limiting is disabled or limit not exceeded
 */
export async function checkRateLimit(
    identifier: string,
    limiter: Ratelimit | null
): Promise<RateLimitResult> {
    // If rate limiting is not configured, allow all requests
    if (!limiter) {
        console.warn('Rate limiting not configured - allowing request');
        return {
            success: true,
            limit: 0,
            remaining: 0,
            reset: 0,
        };
    }

    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return {
        success,
        limit,
        remaining,
        reset,
    };
}

/**
 * Helper to get rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
    };
}
