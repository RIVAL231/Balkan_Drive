package middleware

import (
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// RateLimiter implements a token bucket rate limiter for HTTP requests.
// It provides per-user and per-IP rate limiting capabilities using the
// golang.org/x/time/rate package. The limiter maintains separate token
// buckets for different keys (users or IP addresses) and includes
// automatic cleanup of unused limiters to prevent memory leaks.
type RateLimiter struct {
	// limiters maps keys to individual rate limiter instances
	limiters map[string]*rate.Limiter
	// mu protects concurrent access to the limiters map
	mu       sync.RWMutex
	// rate defines the token refill rate (requests per second)
	rate     rate.Limit
	// burst defines the maximum number of tokens in the bucket
	burst    int
}

// NewRateLimiter creates a new rate limiter with the specified rate and burst parameters.
// The rate limiter uses a token bucket algorithm where tokens are replenished at
// the specified rate and up to 'burst' tokens can be consumed at once.
//
// Parameters:
//   - requestsPerSecond: Number of requests allowed per second (token refill rate)
//   - burst: Maximum number of requests allowed in a burst
//
// Returns a configured RateLimiter instance ready for use.
func NewRateLimiter(requestsPerSecond float64, burst int) *RateLimiter {
	return &RateLimiter{
		limiters: make(map[string]*rate.Limiter),
		rate:     rate.Limit(requestsPerSecond),
		burst:    burst,
	}
}

// getLimiter retrieves or creates a rate limiter for the specified key.
// This method implements a thread-safe lazy initialization pattern with
// double-checked locking to ensure efficient access to rate limiters
// while preventing race conditions during creation.
//
// Parameters:
//   - key: Unique identifier for the rate limiter (user ID or IP address)
//
// Returns the rate limiter instance for the specified key.
func (rl *RateLimiter) getLimiter(key string) *rate.Limiter {
	rl.mu.RLock()
	limiter, exists := rl.limiters[key]
	rl.mu.RUnlock()

	if !exists {
		rl.mu.Lock()
		// Double-check pattern
		if limiter, exists = rl.limiters[key]; !exists {
			limiter = rate.NewLimiter(rl.rate, rl.burst)
			rl.limiters[key] = limiter
		}
		rl.mu.Unlock()
	}

	return limiter
}

// Allow checks if a request is allowed for the specified key.
// This method consumes a token from the rate limiter bucket for the given key.
// If no tokens are available, the request is denied.
//
// Parameters:
//   - key: Unique identifier for the rate limiter check
//
// Returns true if the request is allowed, false if rate limit is exceeded.
func (rl *RateLimiter) Allow(key string) bool {
	return rl.getLimiter(key).Allow()
}

// cleanup periodically removes unused rate limiters to prevent memory leaks.
// This method runs in a separate goroutine and removes rate limiters that
// have returned to their full token capacity, indicating they haven't been
// used recently. The cleanup runs every 10 minutes.
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute * 10)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		for key, limiter := range rl.limiters {
			if limiter.TokensAt(time.Now()) == float64(rl.burst) {
				delete(rl.limiters, key)
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimitMiddleware creates an HTTP middleware that enforces rate limiting.
// This middleware provides intelligent rate limiting with per-user limits for
// authenticated requests and per-IP limits for anonymous requests.
//
// The middleware automatically starts a cleanup goroutine to prevent memory
// leaks from unused rate limiters. When rate limits are exceeded, it responds
// with HTTP 429 Too Many Requests and includes standard rate limit headers.
//
// Rate limiting strategy:
// - Authenticated requests: Limited per user ID
// - Anonymous requests: Limited per client IP address
// - IP extraction supports proxy headers (X-Forwarded-For, X-Real-IP)
//
// Parameters:
//   - requestsPerSecond: Maximum requests allowed per second
//   - burst: Maximum burst size for token bucket
//
// Returns an HTTP middleware function that enforces the specified rate limits.
func RateLimitMiddleware(requestsPerSecond float64, burst int) func(http.Handler) http.Handler {
	rateLimiter := NewRateLimiter(requestsPerSecond, burst)
	
	// Start cleanup goroutine
	go rateLimiter.cleanup()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get user ID from context for per-user rate limiting
			var key string
			if user, err := GetUserFromContext(r.Context()); err == nil {
				key = "user:" + user.ID
			} else {
				// Use IP address for non-authenticated requests
				key = "ip:" + getClientIP(r)
			}

			if !rateLimiter.Allow(key) {
				w.Header().Set("X-RateLimit-Limit", strconv.Itoa(int(requestsPerSecond)))
				w.Header().Set("X-RateLimit-Remaining", "0")
				w.Header().Set("Retry-After", "1")
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// getClientIP extracts the real client IP address from HTTP headers.
// This function handles various proxy configurations and header formats
// to determine the actual client IP address for rate limiting purposes.
//
// The function checks headers in the following priority order:
// 1. X-Forwarded-For (takes the first IP for multi-proxy chains)
// 2. X-Real-IP (common in reverse proxy setups)
// 3. RemoteAddr (direct connection fallback)
//
// Parameters:
//   - r: HTTP request containing headers and connection information
//
// Returns the client IP address as a string.
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header first
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		// Take the first IP in the list
		ips := strings.Split(xff, ",")
		return strings.TrimSpace(ips[0])
	}

	// Check X-Real-IP header
	xri := r.Header.Get("X-Real-IP")
	if xri != "" {
		return xri
	}

	// Fall back to RemoteAddr
	ip := r.RemoteAddr
	if colon := strings.LastIndex(ip, ":"); colon != -1 {
		ip = ip[:colon]
	}
	return ip
}