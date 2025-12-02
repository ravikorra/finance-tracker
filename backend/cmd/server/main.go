package main

import (
	"fmt"
	"net/http"

	"finance-tracker/internal/config"
	"finance-tracker/internal/logger"
	"finance-tracker/internal/router"
	"finance-tracker/internal/storage"
)

func main() {
	// Load configuration from environment
	cfg := config.Load()

	// Initialize logger
	log := logger.New(cfg.LogLevel, cfg.Debug)

	// Initialize data store
	store := storage.NewDataStore(cfg.DataDir)
	log.Info("Data store initialized at %s", cfg.DataDir)

	// Register all routes
	router.RegisterRoutes(store)
	log.Info("Routes registered")

	// Start server
	fmt.Printf("✅ Backend running at http://localhost:%s\n", cfg.Port)
	fmt.Println("📁 Data stored in: " + cfg.DataDir)
	fmt.Println("\nAPI Endpoints:")
	fmt.Println("  GET/POST   /api/investments")
	fmt.Println("  PUT/DELETE /api/investments/{id}")
	fmt.Println("  GET/POST   /api/expenses")
	fmt.Println("  PUT/DELETE /api/expenses/{id}")
	fmt.Println("  GET/PUT    /api/settings")
	fmt.Println("  GET        /api/export")
	fmt.Println("  POST       /api/import")

	log.Info("Starting server on port %s", cfg.Port)
	log.Error("Server error: %v", http.ListenAndServe(":"+cfg.Port, nil))
}
