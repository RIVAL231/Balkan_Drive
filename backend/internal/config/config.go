package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Server
	Port string

	// JWT
	JWTSecret string

	// AWS
	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	S3Bucket           string

	// Rate Limiting
	RateLimit      float64 // requests per second
	RateLimitBurst int

	// Storage
	DefaultStorageQuota int64 // bytes
}

func Load() *Config {
	return &Config{
		// Database
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "admin"),
		DBPassword: getEnv("DB_PASSWORD", "admin"),
		DBName:     getEnv("DB_NAME", "graphqlmvp"),

		// Server
		Port: getEnv("PORT", "8080"),

		// JWT
		JWTSecret: getEnv("JWT_SECRET", "your-development-secret-change-in-production"),

		// AWS
		AWSRegion:          getEnv("AWS_REGION", "eu-north-1"),
		AWSAccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		S3Bucket:           getEnv("S3_BUCKET", "go-drive-v2"),

		// Rate Limiting
		RateLimit:      getEnvFloat("RATE_LIMIT", 2.0),
		RateLimitBurst: getEnvInt("RATE_LIMIT_BURST", 5),

		// Storage
		DefaultStorageQuota: getEnvInt64("DEFAULT_STORAGE_QUOTA", 10*1024*1024), // 10MB default
	}
}

func (c *Config) DatabaseURL() string {
	return "postgres://" + c.DBUser + ":" + c.DBPassword + "@" + c.DBHost + ":" + c.DBPort + "/" + c.DBName + "?sslmode=disable"
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvFloat(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

// GetDBConnectionString returns the formatted database connection string
func (c *Config) GetDBConnectionString() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}