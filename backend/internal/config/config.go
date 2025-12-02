package config

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
)

// Config holds application configuration
type Config struct {
	Port     string `json:"port"`
	DataDir  string `json:"data_dir"`
	LogLevel string `json:"log_level"`
	LogDir   string `json:"log_dir"`
	Debug    bool   `json:"debug"`
}

// Load reads configuration from config.json file
// Falls back to environment variables and defaults if file not found
func Load() *Config {
	cfg := &Config{
		Port:     "5000",
		DataDir:  "./data",
		LogLevel: "info",
		LogDir:   "./logs",
		Debug:    false,
	}

	// Try to load from config.json
	configPath := getConfigPath()
	if data, err := os.ReadFile(configPath); err == nil {
		if err := json.Unmarshal(data, cfg); err != nil {
			log.Printf("Warning: Failed to parse config.json: %v. Using defaults.", err)
		} else {
			log.Printf("Configuration loaded from: %s", configPath)
		}
	} else {
		log.Printf("Config file not found at %s. Using defaults.", configPath)
	}

	// Environment variables can override config file
	if port := os.Getenv("PORT"); port != "" {
		cfg.Port = port
	}
	if dataDir := os.Getenv("DATA_DIR"); dataDir != "" {
		cfg.DataDir = dataDir
	}
	if logLevel := os.Getenv("LOG_LEVEL"); logLevel != "" {
		cfg.LogLevel = logLevel
	}
	if logDir := os.Getenv("LOG_DIR"); logDir != "" {
		cfg.LogDir = logDir
	}
	if debug := os.Getenv("DEBUG"); debug == "true" {
		cfg.Debug = true
	}

	return cfg
}

// getConfigPath returns the path to config.json
// Looks in ./config/config.json or ../config/config.json
func getConfigPath() string {
	// Try current directory first
	if _, err := os.Stat("config/config.json"); err == nil {
		return "config/config.json"
	}

	// Try parent directory (for when running from cmd/server)
	if _, err := os.Stat("../../config/config.json"); err == nil {
		return "../../config/config.json"
	}

	// Default location
	return "config/config.json"
}

// Save writes current configuration to config.json
func (c *Config) Save() error {
	configPath := getConfigPath()

	// Ensure config directory exists
	dir := filepath.Dir(configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// Marshal config to JSON with indentation
	data, err := json.MarshalIndent(c, "", "    ")
	if err != nil {
		return err
	}

	// Write to file
	return os.WriteFile(configPath, data, 0644)
}
