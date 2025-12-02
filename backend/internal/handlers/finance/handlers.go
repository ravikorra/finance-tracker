package finance

import (
	"encoding/json"
	"net/http"
	"time"

	"finance-tracker/backend/internal/models"
	"finance-tracker/backend/pkg/logger"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

var store *DataStore

// InitializeFinanceStore initializes the finance data store
func InitializeFinanceStore(dataDir string) {
	store = NewDataStore(dataDir)
	logger.Info("Finance data store initialized", zap.String("dataDir", dataDir))
}

// EnableCORS allows frontend to call backend
func EnableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func errorResponse(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
	logger.Error("API error", zap.String("message", msg), zap.Int("code", code))
}

// Investment Handlers
func GetInvestments(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()
	defer store.mu.RUnlock()
	jsonResponse(w, store.investments)
}

func CreateInvestment(w http.ResponseWriter, r *http.Request) {
	var inv models.Investment
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	inv.ID = uuid.New().String()
	inv.CreatedAt = time.Now().Format(time.RFC3339)
	inv.UpdatedAt = inv.CreatedAt

	store.investments = append(store.investments, inv)
	store.saveInvestments()

	logger.Info("Investment created", zap.String("id", inv.ID), zap.String("name", inv.Name))
	w.WriteHeader(http.StatusCreated)
	jsonResponse(w, inv)
}

func UpdateInvestment(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/investments/"):]

	var updates models.Investment
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	for i, inv := range store.investments {
		if inv.ID == id {
			updates.ID = id
			updates.CreatedAt = inv.CreatedAt
			updates.UpdatedAt = time.Now().Format(time.RFC3339)
			store.investments[i] = updates
			store.saveInvestments()
			logger.Info("Investment updated", zap.String("id", id))
			jsonResponse(w, updates)
			return
		}
	}
	errorResponse(w, "Investment not found", http.StatusNotFound)
}

func DeleteInvestment(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/investments/"):]

	store.mu.Lock()
	defer store.mu.Unlock()

	for i, inv := range store.investments {
		if inv.ID == id {
			store.investments = append(store.investments[:i], store.investments[i+1:]...)
			store.saveInvestments()
			logger.Info("Investment deleted", zap.String("id", id))
			jsonResponse(w, map[string]bool{"success": true})
			return
		}
	}
	errorResponse(w, "Investment not found", http.StatusNotFound)
}

// Expense Handlers
func GetExpenses(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()
	defer store.mu.RUnlock()
	jsonResponse(w, store.expenses)
}

func CreateExpense(w http.ResponseWriter, r *http.Request) {
	var exp models.Expense
	if err := json.NewDecoder(r.Body).Decode(&exp); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	exp.ID = uuid.New().String()
	exp.CreatedAt = time.Now().Format(time.RFC3339)
	exp.UpdatedAt = exp.CreatedAt

	store.expenses = append(store.expenses, exp)
	store.saveExpenses()

	logger.Info("Expense created", zap.String("id", exp.ID), zap.String("desc", exp.Desc))
	w.WriteHeader(http.StatusCreated)
	jsonResponse(w, exp)
}

func UpdateExpense(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/expenses/"):]

	var updates models.Expense
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	for i, exp := range store.expenses {
		if exp.ID == id {
			updates.ID = id
			updates.CreatedAt = exp.CreatedAt
			updates.UpdatedAt = time.Now().Format(time.RFC3339)
			store.expenses[i] = updates
			store.saveExpenses()
			logger.Info("Expense updated", zap.String("id", id))
			jsonResponse(w, updates)
			return
		}
	}
	errorResponse(w, "Expense not found", http.StatusNotFound)
}

func DeleteExpense(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/expenses/"):]

	store.mu.Lock()
	defer store.mu.Unlock()

	for i, exp := range store.expenses {
		if exp.ID == id {
			store.expenses = append(store.expenses[:i], store.expenses[i+1:]...)
			store.saveExpenses()
			logger.Info("Expense deleted", zap.String("id", id))
			jsonResponse(w, map[string]bool{"success": true})
			return
		}
	}
	errorResponse(w, "Expense not found", http.StatusNotFound)
}

// Settings Handlers
func GetSettings(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()
	defer store.mu.RUnlock()
	jsonResponse(w, store.settings)
}

func UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var settings models.Settings
	if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	store.settings = settings
	store.saveSettings()
	logger.Info("Settings updated")
	jsonResponse(w, settings)
}

// Export/Import Handlers
func HandleExportData(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()
	defer store.mu.RUnlock()

	export := models.ExportData{
		Version:     "1.0",
		ExportedAt:  time.Now().Format(time.RFC3339),
		Investments: store.investments,
		Expenses:    store.expenses,
		Settings:    store.settings,
	}
	jsonResponse(w, export)
}

func HandleImportData(w http.ResponseWriter, r *http.Request) {
	var data models.ExportData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	if len(data.Investments) > 0 {
		store.investments = data.Investments
		store.saveInvestments()
	}
	if len(data.Expenses) > 0 {
		store.expenses = data.Expenses
		store.saveExpenses()
	}
	if len(data.Settings.Categories) > 0 {
		store.settings = data.Settings
		store.saveSettings()
	}

	logger.Info("Data imported successfully")
	jsonResponse(w, map[string]bool{"success": true})
}
