package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"

	"finance-tracker/internal/middleware"
	"finance-tracker/internal/models"
	"finance-tracker/internal/storage"
)

// Handler wraps the storage and provides HTTP handlers
type Handler struct {
	store storage.Storage
}

// NewHandler creates a new handler with the given storage
func NewHandler(store storage.Storage) *Handler {
	return &Handler{store: store}
}

// ----- INVESTMENTS -----

// GetInvestments handles GET /api/investments
func (h *Handler) GetInvestments(w http.ResponseWriter, r *http.Request) {
	investments := h.store.GetInvestments()
	middleware.JSONResponse(w, investments, http.StatusOK)
}

// CreateInvestment handles POST /api/investments
func (h *Handler) CreateInvestment(w http.ResponseWriter, r *http.Request) {
	var inv models.Investment
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		middleware.ErrorResponse(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	inv.ID = uuid.New().String()
	inv.CreatedAt = time.Now().Format(time.RFC3339)
	inv.UpdatedAt = inv.CreatedAt

	// Validate investment
	if err := inv.Validate(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Validation error: %v", err), http.StatusBadRequest)
		return
	}

	if err := h.store.AddInvestment(inv); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to add investment: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveInvestments(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save investment: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.JSONResponse(w, inv, http.StatusCreated)
}

// UpdateInvestment handles PUT /api/investments/{id}
func (h *Handler) UpdateInvestment(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/investments/"):]

	var updates models.Investment
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		middleware.ErrorResponse(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get original investment to preserve creation time
	investments := h.store.GetInvestments()
	var original models.Investment
	found := false
	for _, inv := range investments {
		if inv.ID == id {
			original = inv
			found = true
			break
		}
	}

	if !found {
		middleware.ErrorResponse(w, "Investment not found", http.StatusNotFound)
		return
	}

	updates.ID = id
	updates.CreatedAt = original.CreatedAt
	updates.UpdatedAt = time.Now().Format(time.RFC3339)

	// Validate before updating
	if err := updates.Validate(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Validation error: %v", err), http.StatusBadRequest)
		return
	}

	if err := h.store.UpdateInvestment(id, updates); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to update investment: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveInvestments(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save investment: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.JSONResponse(w, updates, http.StatusOK)
}

// DeleteInvestment handles DELETE /api/investments/{id}
func (h *Handler) DeleteInvestment(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/investments/"):]

	if err := h.store.DeleteInvestment(id); err != nil {
		middleware.ErrorResponse(w, "Investment not found", http.StatusNotFound)
		return
	}

	if err := h.store.SaveInvestments(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save investment: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.SuccessMessage(w, "Investment deleted successfully")
}

// ----- EXPENSES -----

// GetExpenses handles GET /api/expenses
func (h *Handler) GetExpenses(w http.ResponseWriter, r *http.Request) {
	expenses := h.store.GetExpenses()
	middleware.JSONResponse(w, expenses, http.StatusOK)
}

// CreateExpense handles POST /api/expenses
func (h *Handler) CreateExpense(w http.ResponseWriter, r *http.Request) {
	var exp models.Expense
	if err := json.NewDecoder(r.Body).Decode(&exp); err != nil {
		middleware.ErrorResponse(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	exp.ID = uuid.New().String()
	exp.CreatedAt = time.Now().Format(time.RFC3339)
	exp.UpdatedAt = exp.CreatedAt

	// Validate expense
	if err := exp.Validate(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Validation error: %v", err), http.StatusBadRequest)
		return
	}

	if err := h.store.AddExpense(exp); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to add expense: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveExpenses(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save expense: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.JSONResponse(w, exp, http.StatusCreated)
}

// UpdateExpense handles PUT /api/expenses/{id}
func (h *Handler) UpdateExpense(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/expenses/"):]

	var updates models.Expense
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		middleware.ErrorResponse(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	expenses := h.store.GetExpenses()
	var original models.Expense
	found := false
	for _, exp := range expenses {
		if exp.ID == id {
			original = exp
			found = true
			break
		}
	}

	if !found {
		middleware.ErrorResponse(w, "Expense not found", http.StatusNotFound)
		return
	}

	updates.ID = id
	updates.CreatedAt = original.CreatedAt
	updates.UpdatedAt = time.Now().Format(time.RFC3339)

	// Validate before updating
	if err := updates.Validate(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Validation error: %v", err), http.StatusBadRequest)
		return
	}

	if err := h.store.UpdateExpense(id, updates); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to update expense: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveExpenses(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save expense: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.JSONResponse(w, updates, http.StatusOK)
}

// DeleteExpense handles DELETE /api/expenses/{id}
func (h *Handler) DeleteExpense(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/expenses/"):]

	if err := h.store.DeleteExpense(id); err != nil {
		middleware.ErrorResponse(w, "Expense not found", http.StatusNotFound)
		return
	}

	if err := h.store.SaveExpenses(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save expense: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.SuccessMessage(w, "Expense deleted successfully")
}

// ----- SETTINGS -----

// GetSettings handles GET /api/settings
func (h *Handler) GetSettings(w http.ResponseWriter, r *http.Request) {
	settings := h.store.GetSettings()
	middleware.JSONResponse(w, settings, http.StatusOK)
}

// UpdateSettings handles PUT /api/settings
func (h *Handler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var settings models.Settings
	if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
		middleware.ErrorResponse(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.store.UpdateSettings(settings); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to update settings: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveSettings(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save settings: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.JSONResponse(w, settings, http.StatusOK)
}

// ----- EXPORT/IMPORT -----

// ExportData handles GET /api/export
func (h *Handler) ExportData(w http.ResponseWriter, r *http.Request) {
	data := h.store.GetExportData()
	data.Version = "1.0"
	data.ExportedAt = time.Now().Format(time.RFC3339)
	middleware.JSONResponse(w, data, http.StatusOK)
}

// ImportData handles POST /api/import
func (h *Handler) ImportData(w http.ResponseWriter, r *http.Request) {
	var data models.ExportData
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		middleware.ErrorResponse(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.store.ImportData(data); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to import data: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveInvestments(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save investments: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveExpenses(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save expenses: %v", err), http.StatusInternalServerError)
		return
	}

	if err := h.store.SaveSettings(); err != nil {
		middleware.ErrorResponse(w, fmt.Sprintf("Failed to save settings: %v", err), http.StatusInternalServerError)
		return
	}

	middleware.SuccessMessage(w, "Data imported successfully")
}

// ----- ROUTING HELPERS -----

// InvestmentsHandler routes investment requests
func (h *Handler) InvestmentsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		h.GetInvestments(w, r)
	case "POST":
		h.CreateInvestment(w, r)
	default:
		middleware.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// InvestmentHandler routes single investment requests
func (h *Handler) InvestmentHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "PUT":
		h.UpdateInvestment(w, r)
	case "DELETE":
		h.DeleteInvestment(w, r)
	default:
		middleware.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// ExpensesHandler routes expense requests
func (h *Handler) ExpensesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		h.GetExpenses(w, r)
	case "POST":
		h.CreateExpense(w, r)
	default:
		middleware.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// ExpenseHandler routes single expense requests
func (h *Handler) ExpenseHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "PUT":
		h.UpdateExpense(w, r)
	case "DELETE":
		h.DeleteExpense(w, r)
	default:
		middleware.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// SettingsHandler routes settings requests
func (h *Handler) SettingsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		h.GetSettings(w, r)
	case "PUT":
		h.UpdateSettings(w, r)
	default:
		middleware.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
