package router

import (
	authenticationhandler "finance-tracker/backend/internal/handlers/authentication"
	financehandler "finance-tracker/backend/internal/handlers/finance"
	"net/http"

	"github.com/gorilla/mux"
)

// InitRouter initializes and returns the mux router
func InitRouter() *mux.Router {
	r := mux.NewRouter()

	// Apply global middleware
	//r.Use(middleware.LoggingMiddleware)

	// Authentication routes
	r.HandleFunc("/home", authenticationhandler.HomeHandler).Methods("GET")

	// Finance API routes
	// Investments
	r.HandleFunc("/api/investments", financehandler.EnableCORS(financehandler.GetInvestments)).Methods("GET")
	r.HandleFunc("/api/investments", financehandler.EnableCORS(financehandler.CreateInvestment)).Methods("POST")
	r.HandleFunc("/api/investments/{id}", financehandler.EnableCORS(financehandler.UpdateInvestment)).Methods("PUT")
	r.HandleFunc("/api/investments/{id}", financehandler.EnableCORS(financehandler.DeleteInvestment)).Methods("DELETE")

	// Expenses
	r.HandleFunc("/api/expenses", financehandler.EnableCORS(financehandler.GetExpenses)).Methods("GET")
	r.HandleFunc("/api/expenses", financehandler.EnableCORS(financehandler.CreateExpense)).Methods("POST")
	r.HandleFunc("/api/expenses/{id}", financehandler.EnableCORS(financehandler.UpdateExpense)).Methods("PUT")
	r.HandleFunc("/api/expenses/{id}", financehandler.EnableCORS(financehandler.DeleteExpense)).Methods("DELETE")

	// Settings
	r.HandleFunc("/api/settings", financehandler.EnableCORS(financehandler.GetSettings)).Methods("GET")
	r.HandleFunc("/api/settings", financehandler.EnableCORS(financehandler.UpdateSettings)).Methods("PUT")

	// Export/Import
	r.HandleFunc("/api/export", financehandler.EnableCORS(financehandler.HandleExportData)).Methods("GET")
	r.HandleFunc("/api/import", financehandler.EnableCORS(financehandler.HandleImportData)).Methods("POST")

	// Handle OPTIONS for CORS preflight
	r.Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
	})

	return r
}
