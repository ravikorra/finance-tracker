package main

import (
	financeservice "finance-tracker/backend/internal/handlers/finance"
	"finance-tracker/backend/internal/router"
	"finance-tracker/backend/pkg/logger"
	"net/http"

	"go.uber.org/zap"
)

func main() {

	// Initialize the logger
	if err := logger.Initialize(); err != nil {
		panic(err)
	}

	logger.Info("Application starting...")

	defer logger.Sync() // Ensure logs are flushed before the program exits

	// Initialize finance data store
	financeservice.InitializeFinanceStore("./backend/data")

	r := router.InitRouter()

	logger.Info("Server is starting", zap.String("url", "http://localhost:4100"))

	// Start the server
	if err := http.ListenAndServe(":4100", r); err != nil {
		logger.Error("Server failed to start", zap.Error(err))
		logger.Sync() // Ensure logs are flushed before exiting
	}

}
