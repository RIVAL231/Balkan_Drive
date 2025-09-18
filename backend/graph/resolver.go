package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rival231/Balkan_Drive/internal/audit"
	"github.com/rival231/Balkan_Drive/internal/config"
)

type Resolver struct{
	DB *pgxpool.Pool
	AuditLogger *audit.AuditLogger
}
func (r *Resolver) ConnectDB() error {
	cfg := config.Load()
	pool, err := pgxpool.New(context.Background(), cfg.GetDBConnectionString())
	if err != nil {
		return fmt.Errorf("unable to connect: %v", err)
	}
	r.DB = pool
	r.AuditLogger = audit.NewAuditLogger(pool)
	return nil
}

