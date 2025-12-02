package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"finance-tracker/internal/config"
	"finance-tracker/internal/logger"
	"finance-tracker/internal/router"
	"finance-tracker/internal/storage"
)

func main() {
	// Load configuration from config.json (or environment variables)
	cfg := config.Load()

	// Initialize logger with configuration
	log := logger.New(cfg.LogLevel, cfg.Debug, cfg.LogDir)
	defer log.Close() // Ensure log file is closed on exit

	// Log configuration
	log.Info("Configuration: Port=%s, DataDir=%s, LogLevel=%s, LogDir=%s",
		cfg.Port, cfg.DataDir, cfg.LogLevel, cfg.LogDir)

	// Initialize data store
	store := storage.NewDataStore(cfg.DataDir)
	log.Info("Data store initialized at %s", cfg.DataDir)

	// Register all routes and get Mux router
	r := router.RegisterRoutes(store)
	log.Info("Routes registered")

	// Start server
	fmt.Printf("✅ Backend running at http://localhost:%s\n", cfg.Port)
	fmt.Println("📁 Data stored in: " + cfg.DataDir)
	fmt.Println("📝 Logs stored in: " + cfg.LogDir)
	fmt.Println("\nAPI Endpoints:")
	fmt.Println("  GET/POST   /api/investments")
	fmt.Println("  PUT/DELETE /api/investments/{id}")
	fmt.Println("  GET/POST   /api/expenses")
	fmt.Println("  PUT/DELETE /api/expenses/{id}")
	fmt.Println("  GET/PUT    /api/settings")
	fmt.Println("  GET        /api/export")
	fmt.Println("  POST       /api/import")

	log.Info("Starting server on port %s", cfg.Port)

	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		log.Info("Shutting down server gracefully...")
		os.Exit(0)
	}()

	// Start HTTP server with Mux router
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Error("Server error: %v", err)
	}
}
