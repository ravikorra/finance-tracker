package config

import (
	"os"
	"strconv"
)

// Config holds application configuration
type Config struct {
	Port     string
	DataDir  string
	LogLevel string
	Debug    bool
}

// Load reads configuration from environment variables with sensible defaults
func Load() *Config {
	return &Config{
		Port:     getEnv("PORT", "5000"),
		DataDir:  getEnv("DATA_DIR", "./data"),
		LogLevel: getEnv("LOG_LEVEL", "info"),
		Debug:    getBoolEnv("DEBUG", false),
	}
}

// getEnv returns environment variable or default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getBoolEnv returns boolean environment variable or default
func getBoolEnv(key string, defaultValue bool) bool {
	val := os.Getenv(key)
	if val == "" {
		return defaultValue
	}
	b, err := strconv.ParseBool(val)
	if err != nil {
		return defaultValue
	}
	return b
}
