package db

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect() (*pgxpool.Pool, error) {
	url := "postgres://admin:admin@localhost:5432/graphqlmvp"
	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return nil, fmt.Errorf("unable to connect: %v", err)
	}
	fmt.Println("Connected to database!")
	return pool, nil
}
