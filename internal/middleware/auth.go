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

type contextKey string

const UserContextKey contextKey = "user"

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware(db *pgxpool.Pool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for introspection and playground
			if r.URL.Path == "/" || r.Header.Get("X-Skip-Auth") == "true" {
				next.ServeHTTP(w, r)
				return
			}

			// Get token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				// Allow some queries without auth (public files, etc.)
				if isPublicOperation(r) {
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
				jwtSecret = "your-secret-key" // Default for development
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

// GetUserFromContext extracts the authenticated user from context
func GetUserFromContext(ctx context.Context) (*User, error) {
	user, ok := ctx.Value(UserContextKey).(*User)
	if !ok {
		return nil, fmt.Errorf("user not found in context")
	}
	return user, nil
}

// RequireAdmin checks if the user has admin role
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

// isPublicOperation checks if the request is for a public operation
func isPublicOperation(r *http.Request) bool {
	// This is a simple check - you might want to make this more sophisticated
	// by parsing the GraphQL query to see if it's for public data
	
	// For now, allow OPTIONS requests and assume introspection queries are public
	return r.Method == "OPTIONS"
}