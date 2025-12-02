package router

import (
	"github.com/gorilla/mux"

	"finance-tracker/internal/handlers"
	"finance-tracker/internal/middleware"
	"finance-tracker/internal/storage"
)

// RegisterRoutes sets up all API routes and returns the configured Mux router
func RegisterRoutes(store storage.Storage) *mux.Router {
	h := handlers.NewHandler(store)
	r := mux.NewRouter()

	// Apply CORS middleware to all routes
	r.Use(middleware.CORS)

	// Health check endpoint (unversioned, always available)
	r.HandleFunc("/health", h.HealthCheck).Methods("GET", "OPTIONS")

	// API v1 routes
	api := r.PathPrefix("/v1/api").Subrouter()

	// Investment routes
	api.HandleFunc("/investments", h.InvestmentsHandler).Methods("GET", "POST", "OPTIONS")
	api.HandleFunc("/investments/{id}", h.InvestmentHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")

	// Expense routes
	api.HandleFunc("/expenses", h.ExpensesHandler).Methods("GET", "POST", "OPTIONS")
	api.HandleFunc("/expenses/{id}", h.ExpenseHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")

	// Settings routes
	api.HandleFunc("/settings", h.SettingsHandler).Methods("GET", "PUT", "OPTIONS")

	// Export/Import routes
	api.HandleFunc("/export", h.ExportData).Methods("GET", "OPTIONS")
	api.HandleFunc("/import", h.ImportData).Methods("POST", "OPTIONS")

	return r
}
