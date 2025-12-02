package router

import (
	"net/http"

	"finance-tracker/internal/handlers"
	"finance-tracker/internal/middleware"
	"finance-tracker/internal/storage"
)

// RegisterRoutes sets up all API routes
func RegisterRoutes(store *storage.DataStore) {
	h := handlers.NewHandler(store)

	// Investment routes
	http.HandleFunc("/api/investments", middleware.EnableCORS(h.InvestmentsHandler))
	http.HandleFunc("/api/investments/", middleware.EnableCORS(h.InvestmentHandler))

	// Expense routes
	http.HandleFunc("/api/expenses", middleware.EnableCORS(h.ExpensesHandler))
	http.HandleFunc("/api/expenses/", middleware.EnableCORS(h.ExpenseHandler))

	// Settings routes
	http.HandleFunc("/api/settings", middleware.EnableCORS(h.SettingsHandler))

	// Export/Import routes
	http.HandleFunc("/api/export", middleware.EnableCORS(h.ExportData))
	http.HandleFunc("/api/import", middleware.EnableCORS(h.ImportData))
}
