package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/google/uuid"
)

// ==========================================
// PART 1: DATA MODELS (What data looks like)
// ==========================================

// Investment represents one investment entry
// `json:"name"` tells Go how to convert to/from JSON
type Investment struct {
	ID        string  `json:"id"`        // Unique identifier
	Name      string  `json:"name"`      // e.g., "HDFC Flexi Cap"
	Type      string  `json:"type"`      // e.g., "Mutual Fund"
	Invested  float64 `json:"invested"`  // Amount invested
	Current   float64 `json:"current"`   // Current value
	Date      string  `json:"date"`      // Purchase date
	CreatedAt string  `json:"createdAt"` // When record was created
	UpdatedAt string  `json:"updatedAt"` // When record was last updated
}

// Expense represents one expense entry
type Expense struct {
	ID        string  `json:"id"`
	Desc      string  `json:"desc"`     // Description
	Amount    float64 `json:"amount"`   // How much spent
	Category  string  `json:"category"` // e.g., "Food", "Transport"
	Date      string  `json:"date"`     // When spent
	AddedBy   string  `json:"addedBy"`  // Who added this (for family sharing)
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

// Settings stores app configuration
type Settings struct {
	Categories      []string `json:"categories"`      // Expense categories
	InvestmentTypes []string `json:"investmentTypes"` // Types of investments
	Members         []string `json:"members"`         // Family members
}

// ExportData is the format for backup/restore
type ExportData struct {
	Version     string       `json:"version"`
	ExportedAt  string       `json:"exportedAt"`
	Investments []Investment `json:"investments"`
	Expenses    []Expense    `json:"expenses"`
	Settings    Settings     `json:"settings"`
}

// ==========================================
// PART 2: DATA STORE (Handles file storage)
// ==========================================

// DataStore manages all data and file operations
type DataStore struct {
	mu          sync.RWMutex // Prevents data corruption when multiple requests
	dataDir     string       // Where to store JSON files
	investments []Investment // In-memory cache of investments
	expenses    []Expense    // In-memory cache of expenses
	settings    Settings     // App settings
}

// NewDataStore creates and initializes the data store
func NewDataStore(dataDir string) *DataStore {
	ds := &DataStore{
		dataDir: dataDir,
		// Default settings for new installation
		settings: Settings{
			Categories:      []string{"Food", "Transport", "Utilities", "Shopping", "Entertainment", "Health", "EMI", "Other"},
			InvestmentTypes: []string{"Mutual Fund", "Stocks", "FD", "Gold", "PPF", "NPS", "Other"},
			Members:         []string{"Ravi", "Family"},
		},
	}
	ds.load() // Load existing data from files
	return ds
}

// load reads data from JSON files into memory
func (ds *DataStore) load() {
	// Create data directory if it doesn't exist
	os.MkdirAll(ds.dataDir, 0755)

	// Load investments from file
	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "investments.json")); err == nil {
		json.Unmarshal(data, &ds.investments)
	}

	// Load expenses from file
	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "expenses.json")); err == nil {
		json.Unmarshal(data, &ds.expenses)
	}

	// Load settings from file
	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "settings.json")); err == nil {
		json.Unmarshal(data, &ds.settings)
	}
}

// Save functions - write data to JSON files
func (ds *DataStore) saveInvestments() error {
	data, _ := json.MarshalIndent(ds.investments, "", "  ") // Pretty JSON
	return os.WriteFile(filepath.Join(ds.dataDir, "investments.json"), data, 0644)
}

func (ds *DataStore) saveExpenses() error {
	data, _ := json.MarshalIndent(ds.expenses, "", "  ")
	return os.WriteFile(filepath.Join(ds.dataDir, "expenses.json"), data, 0644)
}

func (ds *DataStore) saveSettings() error {
	data, _ := json.MarshalIndent(ds.settings, "", "  ")
	return os.WriteFile(filepath.Join(ds.dataDir, "settings.json"), data, 0644)
}

// ==========================================
// PART 3: HTTP HELPERS
// ==========================================

var store *DataStore // Global data store instance

// enableCORS allows frontend (port 3000) to call backend (port 5000)
// Without this, browser blocks the request (security feature)
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight request (browser asks "can I make this request?")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

// jsonResponse sends JSON data back to frontend
func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// errorResponse sends error message back to frontend
func errorResponse(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

// ==========================================
// PART 4: API HANDLERS (Business Logic)
// ==========================================

// ----- INVESTMENTS -----

// GET /api/investments - Get all investments
func getInvestments(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()         // Lock for reading (multiple can read)
	defer store.mu.RUnlock() // Unlock when function ends
	jsonResponse(w, store.investments)
}

// POST /api/investments - Create new investment
func createInvestment(w http.ResponseWriter, r *http.Request) {
	var inv Investment

	// Parse JSON from request body
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock() // Lock for writing (only one can write)
	defer store.mu.Unlock()

	// Generate unique ID and timestamps
	inv.ID = uuid.New().String()
	inv.CreatedAt = time.Now().Format(time.RFC3339)
	inv.UpdatedAt = inv.CreatedAt

	// Add to list and save
	store.investments = append(store.investments, inv)
	store.saveInvestments()

	w.WriteHeader(http.StatusCreated) // 201 Created
	jsonResponse(w, inv)
}

// PUT /api/investments/{id} - Update existing investment
func updateInvestment(w http.ResponseWriter, r *http.Request) {
	// Extract ID from URL: /api/investments/abc123 -> abc123
	id := r.URL.Path[len("/api/investments/"):]

	var updates Investment
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	// Find and update the investment
	for i, inv := range store.investments {
		if inv.ID == id {
			updates.ID = id
			updates.CreatedAt = inv.CreatedAt // Keep original creation time
			updates.UpdatedAt = time.Now().Format(time.RFC3339)
			store.investments[i] = updates
			store.saveInvestments()
			jsonResponse(w, updates)
			return
		}
	}
	errorResponse(w, "Investment not found", http.StatusNotFound)
}

// DELETE /api/investments/{id} - Delete investment
func deleteInvestment(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/investments/"):]

	store.mu.Lock()
	defer store.mu.Unlock()

	// Find and remove the investment
	for i, inv := range store.investments {
		if inv.ID == id {
			// Remove from slice (append everything before and after)
			store.investments = append(store.investments[:i], store.investments[i+1:]...)
			store.saveInvestments()
			jsonResponse(w, map[string]bool{"success": true})
			return
		}
	}
	errorResponse(w, "Investment not found", http.StatusNotFound)
}

// ----- EXPENSES (same pattern as investments) -----

func getExpenses(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()
	defer store.mu.RUnlock()
	jsonResponse(w, store.expenses)
}

func createExpense(w http.ResponseWriter, r *http.Request) {
	var exp Expense
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

	w.WriteHeader(http.StatusCreated)
	jsonResponse(w, exp)
}

func updateExpense(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/expenses/"):]

	var updates Expense
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
			jsonResponse(w, updates)
			return
		}
	}
	errorResponse(w, "Expense not found", http.StatusNotFound)
}

func deleteExpense(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/api/expenses/"):]

	store.mu.Lock()
	defer store.mu.Unlock()

	for i, exp := range store.expenses {
		if exp.ID == id {
			store.expenses = append(store.expenses[:i], store.expenses[i+1:]...)
			store.saveExpenses()
			jsonResponse(w, map[string]bool{"success": true})
			return
		}
	}
	errorResponse(w, "Expense not found", http.StatusNotFound)
}

// ----- SETTINGS -----

func getSettings(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()
	defer store.mu.RUnlock()
	jsonResponse(w, store.settings)
}

func updateSettings(w http.ResponseWriter, r *http.Request) {
	var settings Settings
	if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	store.mu.Lock()
	defer store.mu.Unlock()

	store.settings = settings
	store.saveSettings()
	jsonResponse(w, settings)
}

// ----- EXPORT/IMPORT (Backup & Restore) -----

func exportData(w http.ResponseWriter, r *http.Request) {
	store.mu.RLock()
	defer store.mu.RUnlock()

	export := ExportData{
		Version:     "1.0",
		ExportedAt:  time.Now().Format(time.RFC3339),
		Investments: store.investments,
		Expenses:    store.expenses,
		Settings:    store.settings,
	}
	jsonResponse(w, export)
}

func importData(w http.ResponseWriter, r *http.Request) {
	var data ExportData
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

	jsonResponse(w, map[string]bool{"success": true})
}

// ==========================================
// PART 5: ROUTING (URL -> Handler mapping)
// ==========================================

// Route /api/investments (without ID)
func investmentsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		getInvestments(w, r)
	case "POST":
		createInvestment(w, r)
	default:
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// Route /api/investments/{id} (with ID)
func investmentHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "PUT":
		updateInvestment(w, r)
	case "DELETE":
		deleteInvestment(w, r)
	default:
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func expensesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		getExpenses(w, r)
	case "POST":
		createExpense(w, r)
	default:
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func expenseHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "PUT":
		updateExpense(w, r)
	case "DELETE":
		deleteExpense(w, r)
	default:
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func settingsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		getSettings(w, r)
	case "PUT":
		updateSettings(w, r)
	default:
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// ==========================================
// PART 6: MAIN (Start the server)
// ==========================================

func main() {
	// Initialize data store with ./data directory
	store = NewDataStore("./data")

	// Register all routes
	http.HandleFunc("/api/investments", enableCORS(investmentsHandler))
	http.HandleFunc("/api/investments/", enableCORS(investmentHandler))
	http.HandleFunc("/api/expenses", enableCORS(expensesHandler))
	http.HandleFunc("/api/expenses/", enableCORS(expenseHandler))
	http.HandleFunc("/api/settings", enableCORS(settingsHandler))
	http.HandleFunc("/api/export", enableCORS(exportData))
	http.HandleFunc("/api/import", enableCORS(importData))

	// Start server
	port := "5000"
	fmt.Printf("✅ Backend running at http://localhost:%s\n", port)
	fmt.Println("📁 Data stored in: ./data")
	fmt.Println("\nAPI Endpoints:")
	fmt.Println("  GET/POST   /api/investments")
	fmt.Println("  PUT/DELETE /api/investments/{id}")
	fmt.Println("  GET/POST   /api/expenses")
	fmt.Println("  PUT/DELETE /api/expenses/{id}")
	fmt.Println("  GET/PUT    /api/settings")
	fmt.Println("  GET        /api/export")
	fmt.Println("  POST       /api/import")

	log.Fatal(http.ListenAndServe(":"+port, nil))
}
