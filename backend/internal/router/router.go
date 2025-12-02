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

	// Investment routes
	r.HandleFunc("/api/investments", h.InvestmentsHandler).Methods("GET", "POST", "OPTIONS")
	r.HandleFunc("/api/investments/{id}", h.InvestmentHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")

	// Expense routes
	r.HandleFunc("/api/expenses", h.ExpensesHandler).Methods("GET", "POST", "OPTIONS")
	r.HandleFunc("/api/expenses/{id}", h.ExpenseHandler).Methods("GET", "PUT", "DELETE", "OPTIONS")

	// Settings routes
	r.HandleFunc("/api/settings", h.SettingsHandler).Methods("GET", "PUT", "OPTIONS")

	// Export/Import routes
	r.HandleFunc("/api/export", h.ExportData).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/import", h.ImportData).Methods("POST", "OPTIONS")

	return r
}
