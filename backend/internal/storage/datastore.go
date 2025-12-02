package storage

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	"finance-tracker/internal/models"
)

// DataStore manages all data and file operations
type DataStore struct {
	mu          sync.RWMutex
	dataDir     string
	investments []models.Investment
	expenses    []models.Expense
	settings    models.Settings
}

// NewDataStore creates and initializes the data store
func NewDataStore(dataDir string) *DataStore {
	ds := &DataStore{
		dataDir: dataDir,
		settings: models.Settings{
			Categories:      []string{"Food", "Transport", "Utilities", "Shopping", "Entertainment", "Health", "EMI", "Other"},
			InvestmentTypes: []string{"Mutual Fund", "Stocks", "FD", "Gold", "PPF", "NPS", "Other"},
			Members:         []string{"Ravi", "Family"},
		},
	}
	ds.load()
	return ds
}

// load reads data from JSON files into memory
func (ds *DataStore) load() {
	os.MkdirAll(ds.dataDir, 0755)

	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "investments.json")); err == nil {
		json.Unmarshal(data, &ds.investments)
	}

	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "expenses.json")); err == nil {
		json.Unmarshal(data, &ds.expenses)
	}

	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "settings.json")); err == nil {
		json.Unmarshal(data, &ds.settings)
	}
}

// SaveInvestments writes investments to file
func (ds *DataStore) SaveInvestments() error {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	data, _ := json.MarshalIndent(ds.investments, "", "  ")
	return os.WriteFile(filepath.Join(ds.dataDir, "investments.json"), data, 0644)
}

// SaveExpenses writes expenses to file
func (ds *DataStore) SaveExpenses() error {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	data, _ := json.MarshalIndent(ds.expenses, "", "  ")
	return os.WriteFile(filepath.Join(ds.dataDir, "expenses.json"), data, 0644)
}

// SaveSettings writes settings to file
func (ds *DataStore) SaveSettings() error {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	data, _ := json.MarshalIndent(ds.settings, "", "  ")
	return os.WriteFile(filepath.Join(ds.dataDir, "settings.json"), data, 0644)
}

// GetInvestments returns all investments
func (ds *DataStore) GetInvestments() []models.Investment {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.investments
}

// AddInvestment adds a new investment
func (ds *DataStore) AddInvestment(inv models.Investment) {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.investments = append(ds.investments, inv)
}

// UpdateInvestment updates an existing investment
func (ds *DataStore) UpdateInvestment(id string, updated models.Investment) bool {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, inv := range ds.investments {
		if inv.ID == id {
			ds.investments[i] = updated
			return true
		}
	}
	return false
}

// DeleteInvestment removes an investment
func (ds *DataStore) DeleteInvestment(id string) bool {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, inv := range ds.investments {
		if inv.ID == id {
			ds.investments = append(ds.investments[:i], ds.investments[i+1:]...)
			return true
		}
	}
	return false
}

// GetExpenses returns all expenses
func (ds *DataStore) GetExpenses() []models.Expense {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.expenses
}

// AddExpense adds a new expense
func (ds *DataStore) AddExpense(exp models.Expense) {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.expenses = append(ds.expenses, exp)
}

// UpdateExpense updates an existing expense
func (ds *DataStore) UpdateExpense(id string, updated models.Expense) bool {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, exp := range ds.expenses {
		if exp.ID == id {
			ds.expenses[i] = updated
			return true
		}
	}
	return false
}

// DeleteExpense removes an expense
func (ds *DataStore) DeleteExpense(id string) bool {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, exp := range ds.expenses {
		if exp.ID == id {
			ds.expenses = append(ds.expenses[:i], ds.expenses[i+1:]...)
			return true
		}
	}
	return false
}

// GetSettings returns current settings
func (ds *DataStore) GetSettings() models.Settings {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.settings
}

// UpdateSettings updates settings
func (ds *DataStore) UpdateSettings(settings models.Settings) {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.settings = settings
}

// GetExportData returns all data for export
func (ds *DataStore) GetExportData() models.ExportData {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return models.ExportData{
		Investments: ds.investments,
		Expenses:    ds.expenses,
		Settings:    ds.settings,
	}
}

// ImportData imports data from export
func (ds *DataStore) ImportData(data models.ExportData) {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	if len(data.Investments) > 0 {
		ds.investments = data.Investments
	}
	if len(data.Expenses) > 0 {
		ds.expenses = data.Expenses
	}
	if len(data.Settings.Categories) > 0 {
		ds.settings = data.Settings
	}
}
