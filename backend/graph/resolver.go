// Package graph provides GraphQL resolver implementations for the Balkan Drive file storage system.
// This file contains the main resolver struct and database connection logic.
//
// This file will not be regenerated automatically.
// It serves as dependency injection for your app, add any dependencies you require here.
package graph

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rival231/Balkan_Drive/internal/audit"
	"github.com/rival231/Balkan_Drive/internal/config"
)

// Resolver is the main GraphQL resolver struct that holds all dependencies
// required for GraphQL query and mutation execution.
// It implements the ResolverRoot interface and provides access to database
// connections and audit logging functionality.
type Resolver struct {
	// DB is the PostgreSQL connection pool used for all database operations
	DB *pgxpool.Pool
	// AuditLogger handles audit trail logging for security and compliance
	AuditLogger *audit.AuditLogger
}

// ConnectDB establishes a connection to the PostgreSQL database and initializes
// the audit logger. It loads the database configuration and creates a connection pool
// that will be used throughout the application lifecycle.
//
// Returns an error if the database connection fails or if the configuration
// cannot be loaded properly.
func (r *Resolver) ConnectDB() error {
	cfg := config.Load()
	pool, err := pgxpool.New(context.Background(), cfg.GetDBConnectionString())
	if err != nil {
		return fmt.Errorf("unable to connect: %v", err)
	}
	fmt.Println("Connected to database!")
	r.DB = pool
	r.AuditLogger = audit.NewAuditLogger(pool)
	return nil
}

