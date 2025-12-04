package router

import (
	"net/http"

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
	r.HandleFunc("/health", h.HealthCheck).Methods("GET")

	// API v1 routes
	api := r.PathPrefix("/v1/api").Subrouter()

	// Catch-all OPTIONS handler for CORS preflight requests
	// This must be registered BEFORE specific routes
	api.PathPrefix("").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
	}).Methods("OPTIONS")

	// Investment routes
	api.HandleFunc("/investments", h.InvestmentsHandler).Methods("GET", "POST")
	api.HandleFunc("/investments/{id}", h.InvestmentHandler).Methods("GET", "PUT", "DELETE")

	// Expense routes
	api.HandleFunc("/expenses", h.ExpensesHandler).Methods("GET", "POST")
	api.HandleFunc("/expenses/{id}", h.ExpenseHandler).Methods("GET", "PUT", "DELETE")

	// Settings routes
	api.HandleFunc("/settings", h.SettingsHandler).Methods("GET", "PUT")

	// Export/Import routes
	api.HandleFunc("/export", h.ExportData).Methods("GET")
	api.HandleFunc("/import", h.ImportData).Methods("POST")

	return r
}
