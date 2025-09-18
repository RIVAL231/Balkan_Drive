package graph

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

import (
	"context"
	"fmt"

	// "github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rival231/Balkan_Drive/internal/audit"
	// "github.com/rival231/Balkan_Drive/graph/model"
	// "golang.org/x/crypto/bcrypt"
)

type Resolver struct{
	DB *pgxpool.Pool
	AuditLogger *audit.AuditLogger
}
func (r *Resolver) ConnectDB() error {
	pool, err := pgxpool.New(context.Background(), "postgres://admin:admin@localhost:5432/graphqlmvp")
	if err != nil {
		return fmt.Errorf("unable to connect: %v", err)
	}
	r.DB = pool
	r.AuditLogger = audit.NewAuditLogger(pool)
	return nil
}
// func (r *Resolver) Mutation() MutationResolver {
// 	return &mutationResolver{r}
// }
// func (r *Resolver) Query() QueryResolver {
// 	return &queryResolver{r}
// }

// The struct declarations are moved to schema.resolvers.go
