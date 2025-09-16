package main

import (
	"log"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/rival231/Balkan_Drive/graph"
	"github.com/rival231/Balkan_Drive/internal/config"
	"github.com/rival231/Balkan_Drive/internal/middleware"
	"github.com/vektah/gqlparser/v2/ast"
)

func main() {
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

	// Apply middleware to GraphQL endpoint
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", rateLimitMiddleware(authMiddleware(srv)))

	log.Printf("🚀 Server starting on http://localhost:%s", cfg.Port)
	log.Printf("📊 GraphQL Playground: http://localhost:%s/", cfg.Port)
	log.Printf("🔍 GraphQL Endpoint: http://localhost:%s/query", cfg.Port)
	log.Printf("⚡ Rate Limit: %.1f req/sec, Burst: %d", cfg.RateLimit, cfg.RateLimitBurst)
	log.Printf("💾 Storage Quota: %d MB per user", cfg.DefaultStorageQuota/(1024*1024))

	log.Fatal(http.ListenAndServe(":"+cfg.Port, nil))
}
