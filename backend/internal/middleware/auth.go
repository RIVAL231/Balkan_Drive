// Package middleware provides HTTP middleware components for the Balkan Drive system.
// This package includes authentication, authorization, and security middleware
// that protect API endpoints and manage user sessions through JWT tokens.
//
// The middleware components handle user authentication, role-based access control,
// and context management for authenticated requests throughout the application.
package middleware

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// contextKey is a custom type for context keys to avoid collisions.
type contextKey string

// UserContextKey is the context key used to store authenticated user information.
const UserContextKey contextKey = "user"

// User represents an authenticated user with their profile information.
// This struct is stored in the request context after successful authentication
// and used throughout the request lifecycle for authorization decisions.
type User struct {
	// ID is the unique identifier of the user
	ID       string `json:"id"`
	// Username is the user's chosen username
	Username string `json:"username"`
	// Email is the user's email address
	Email    string `json:"email"`
	// Role defines the user's permission level (e.g., "user", "admin")
	Role     string `json:"role"`
}

// Claims represents the JWT token claims structure.
// This struct defines the custom claims embedded in JWT tokens for
// user authentication and contains user identification and role information.
type Claims struct {
	// UserID is the unique identifier of the authenticated user
	UserID   string `json:"user_id"`
	// Username is the user's chosen username
	Username string `json:"username"`
	// Email is the user's email address
	Email    string `json:"email"`
	// Role defines the user's permission level
	Role     string `json:"role"`
	// RegisteredClaims contains standard JWT claims (expiry, issued at, etc.)
	jwt.RegisteredClaims
}

// AuthMiddleware creates an HTTP middleware that handles JWT-based authentication.
// This middleware validates JWT tokens, extracts user information, and stores it
// in the request context for use by downstream handlers.
//
// The middleware performs the following operations:
// 1. Extracts JWT tokens from Authorization headers (Bearer format)
// 2. Validates token signatures and expiration
// 3. Verifies user existence in the database
// 4. Stores authenticated user information in request context
//
// Special handling:
// - Allows unauthenticated access to GraphQL endpoint for login/register mutations
// - Skips authentication for CORS preflight requests (OPTIONS)
// - Bypasses auth for introspection and playground endpoints
//
// Parameters:
//   - db: PostgreSQL connection pool for user verification
//
// Returns an HTTP middleware function that can be chained with other middleware.
// The middleware responds with 401 Unauthorized for invalid or missing tokens.
func AuthMiddleware(db *pgxpool.Pool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for introspection and playground
			if r.URL.Path == "/" {
				next.ServeHTTP(w, r)
				return
			}

			// Allow CORS preflight requests
			if r.Method == "OPTIONS" {
				next.ServeHTTP(w, r)
				return
			}

			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				// For GraphQL endpoint, allow without auth - the resolvers will handle auth checks
				// This allows login/register mutations to work
				if r.URL.Path == "/query" {
					next.ServeHTTP(w, r)
					return
				}
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Extract token from "Bearer <token>"
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]
			jwtSecret := os.Getenv("JWT_SECRET")
			if jwtSecret == "" {
				jwtSecret = "srainvkaalp2630185amrahs" // Default for development
			}

			// Parse and validate token
			token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(*Claims)
			if !ok {
				http.Error(w, "Invalid token claims", http.StatusUnauthorized)
				return
			}

			// Verify user still exists in database
			var userExists bool
			err = db.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", claims.UserID).Scan(&userExists)
			if err != nil || !userExists {
				http.Error(w, "User not found", http.StatusUnauthorized)
				return
			}

			// Add user to context
			user := &User{
				ID:       claims.UserID,
				Username: claims.Username,
				Email:    claims.Email,
				Role:     claims.Role,
			}

			ctx := context.WithValue(r.Context(), UserContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserFromContext extracts the authenticated user from the request context.
// This function retrieves user information that was stored by the AuthMiddleware
// during the authentication process. It's used by GraphQL resolvers and other
// handlers to access authenticated user details.
//
// Parameters:
//   - ctx: Request context containing user information
//
// Returns the authenticated User object and nil error on success.
// Returns error if no authenticated user is found in the context.
func GetUserFromContext(ctx context.Context) (*User, error) {
	user, ok := ctx.Value(UserContextKey).(*User)
	if !ok {
		return nil, fmt.Errorf("user not found in context")
	}
	return user, nil
}

// RequireAdmin checks if the authenticated user has administrative privileges.
// This function performs both authentication and authorization checks,
// ensuring the user is authenticated and has the "admin" role.
//
// Used by admin-only endpoints and operations that require elevated permissions
// such as user management, system statistics, and audit log access.
//
// Parameters:
//   - ctx: Request context containing user information
//
// Returns the authenticated admin User object on success.
// Returns error if user is not authenticated or lacks admin privileges.
func RequireAdmin(ctx context.Context) (*User, error) {
	user, err := GetUserFromContext(ctx)
	if err != nil {
		return nil, err
	}
	if user.Role != "admin" {
		return nil, fmt.Errorf("admin privileges required")
	}
	return user, nil
}

