// Package main implements the HTTP server for the Balkan Drive file storage system.
// This package sets up and configures the GraphQL server with all necessary middleware,
// CORS handling, and health check endpoints. It serves as the main entry point for
// the backend application.
//
// The server provides:
// - GraphQL API endpoint with authentication and rate limiting
// - GraphQL Playground for API exploration and testing
// - Health check endpoint for monitoring and load balancing
// - CORS support for cross-origin requests from web clients
// - File upload capabilities with configurable size limits
package main

import (
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"

	"github.com/rival231/Balkan_Drive/graph"
	"github.com/rival231/Balkan_Drive/internal/config"
	"github.com/rival231/Balkan_Drive/internal/middleware"
	"github.com/vektah/gqlparser/v2/ast"
)

// setupCORS configures Cross-Origin Resource Sharing (CORS) headers for HTTP responses.
// This function wraps HTTP handlers to add necessary CORS headers that allow web browsers
// to make cross-origin requests to the GraphQL API from different domains.
//
// The function handles:
// - Permissive origin policy for development (allows all origins)
// - Standard HTTP methods (GET, POST, OPTIONS)
// - Authorization headers for JWT token authentication
// - Preflight request handling for complex CORS requests
//
// Parameters:
//   - h: HTTP handler function to wrap with CORS headers
//
// Returns a new HTTP handler function with CORS support enabled.
func setupCORS(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		
		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		h(w, r)
	}
}

// main is the entry point for the Balkan Drive backend server.
// This function orchestrates the complete server setup including:
//
// 1. Environment Configuration:
//    - Loads environment variables from .env file
//    - Initializes application configuration
//    - Sets up database connections
//
// 2. GraphQL Server Setup:
//    - Creates GraphQL schema with resolvers
//    - Configures transport layers (GET, POST, multipart)
//    - Sets up caching and performance optimizations
//    - Enables introspection and automatic persisted queries
//
// 3. Middleware Configuration:
//    - JWT authentication middleware
//    - Rate limiting protection
//    - CORS headers for browser compatibility
//
// 4. HTTP Endpoints:
//    - GraphQL API endpoint (/query)
//    - GraphQL Playground for development (/)
//    - Health check endpoint (/health)
//
// 5. Server Startup:
//    - Binds to configured port
//    - Displays startup information
//    - Begins serving HTTP requests
//
// The server runs indefinitely until terminated or encounters a fatal error.
func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	// Load configuration
	cfg := config.Load()
	// Initialize resolver with database connection
	resolver := &graph.Resolver{}
	if err := resolver.ConnectDB(); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	// Create GraphQL server
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	// Add transports
	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{
		MaxMemory:     50 << 20,  // 50MB
		MaxUploadSize: 100 << 20, // 100MB
	})

	// Add caching and extensions
	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// Create middleware chain
	authMiddleware := middleware.AuthMiddleware(resolver.DB)
	rateLimitMiddleware := middleware.RateLimitMiddleware(cfg.RateLimit, cfg.RateLimitBurst)

	// Apply middleware to GraphQL endpoint and playground
	// Wrap both the playground root and the /query endpoint with CORS so
	// browser preflight requests receive the necessary Access-Control headers.
	http.Handle("/", setupCORS(playground.Handler("GraphQL playground", "/query")))
	http.Handle("/query", setupCORS(http.HandlerFunc(rateLimitMiddleware(authMiddleware(srv)).ServeHTTP)))
	
	// Serve static GraphQL schema documentation
	// This serves the SpectaQL generated documentation from the public directory
	http.Handle("/docs/", http.StripPrefix("/docs/", http.FileServer(http.Dir("./public/"))))
	
	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"balkan-drive-backend"}`))
	})

	log.Printf(" Server starting on http://localhost:%s", cfg.Port)
	log.Printf(" GraphQL Playground: http://localhost:%s/", cfg.Port)
	log.Printf(" GraphQL Endpoint: http://localhost:%s/query", cfg.Port)
	log.Printf(" Schema Documentation: http://localhost:%s/docs/", cfg.Port)
	log.Printf(" Rate Limit: %.1f req/sec, Burst: %d", cfg.RateLimit, cfg.RateLimitBurst)
	log.Printf(" Storage Quota: %d MB per user", cfg.DefaultStorageQuota/(1024*1024))

	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}
