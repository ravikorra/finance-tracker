package storage

import (
	"encoding/json"
	"fmt"
	"log"
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
	incomes     []models.Income
	expenses    []models.Expense
	settings    models.Settings
}

// NewDataStore creates and initializes the data store
func NewDataStore(dataDir string) *DataStore {
	ds := &DataStore{
		dataDir: dataDir,
		settings: models.Settings{
			Categories:       []string{"Food", "Transport", "Utilities", "Shopping", "Entertainment", "Health", "EMI", "Household", "Other"},
			InvestmentTypes:  []string{"Mutual Fund", "Stocks", "FD", "Gold", "PPF", "NPS", "Other"},
			IncomeCategories: []string{"Salary", "Business", "Rental", "Freelance", "Interest", "Dividend", "Other"},
			PaymentMethods:   []string{"Online", "Cash", "Card", "UPI", "Bank Transfer"},
			Members:          []string{"Ravi", "Family"},
		},
	}
	ds.load()
	return ds
}

// load reads data from JSON files into memory
func (ds *DataStore) load() {
	if err := os.MkdirAll(ds.dataDir, 0755); err != nil {
		log.Printf("Warning: Failed to create data directory: %v", err)
	}

	// Load investments
	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "investments.json")); err == nil {
		if err := json.Unmarshal(data, &ds.investments); err != nil {
			log.Printf("Warning: Failed to load investments: %v", err)
			ds.investments = []models.Investment{}
		}
	} else if !os.IsNotExist(err) {
		log.Printf("Warning: Error reading investments file: %v", err)
	}

	// Load incomes
	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "incomes.json")); err == nil {
		if err := json.Unmarshal(data, &ds.incomes); err != nil {
			log.Printf("Warning: Failed to load incomes: %v", err)
			ds.incomes = []models.Income{}
		}
	} else if !os.IsNotExist(err) {
		log.Printf("Warning: Error reading incomes file: %v", err)
	}

	// Load expenses
	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "expenses.json")); err == nil {
		if err := json.Unmarshal(data, &ds.expenses); err != nil {
			log.Printf("Warning: Failed to load expenses: %v", err)
			ds.expenses = []models.Expense{}
		}
	} else if !os.IsNotExist(err) {
		log.Printf("Warning: Error reading expenses file: %v", err)
	}

	// Load settings
	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "settings.json")); err == nil {
		if err := json.Unmarshal(data, &ds.settings); err != nil {
			log.Printf("Warning: Failed to load settings: %v", err)
		}
	} else if !os.IsNotExist(err) {
		log.Printf("Warning: Error reading settings file: %v", err)
	}
}

// SaveInvestments writes investments to file
func (ds *DataStore) SaveInvestments() error {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	data, err := json.MarshalIndent(ds.investments, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal investments: %w", err)
	}
	filePath := filepath.Join(ds.dataDir, "investments.json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write investments file: %w", err)
	}
	return nil
}

// SaveExpenses writes expenses to file
func (ds *DataStore) SaveExpenses() error {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	data, err := json.MarshalIndent(ds.expenses, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal expenses: %w", err)
	}
	filePath := filepath.Join(ds.dataDir, "expenses.json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write expenses file: %w", err)
	}
	return nil
}

// SaveIncomes writes incomes to file
func (ds *DataStore) SaveIncomes() error {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	data, err := json.MarshalIndent(ds.incomes, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal incomes: %w", err)
	}
	filePath := filepath.Join(ds.dataDir, "incomes.json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write incomes file: %w", err)
	}
	return nil
}

// SaveSettings writes settings to file
func (ds *DataStore) SaveSettings() error {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	data, err := json.MarshalIndent(ds.settings, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}
	filePath := filepath.Join(ds.dataDir, "settings.json")
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write settings file: %w", err)
	}
	return nil
}

// GetInvestments returns all investments
func (ds *DataStore) GetInvestments() []models.Investment {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.investments
}

// AddInvestment adds a new investment
func (ds *DataStore) AddInvestment(inv models.Investment) error {
	if err := inv.Validate(); err != nil {
		return fmt.Errorf("invalid investment: %w", err)
	}
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.investments = append(ds.investments, inv)
	return nil
}

// UpdateInvestment updates an existing investment
func (ds *DataStore) UpdateInvestment(id string, updated models.Investment) error {
	if err := updated.Validate(); err != nil {
		return fmt.Errorf("invalid investment: %w", err)
	}
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, inv := range ds.investments {
		if inv.ID == id {
			ds.investments[i] = updated
			return nil
		}
	}
	return fmt.Errorf("investment not found")
}

// DeleteInvestment removes an investment
func (ds *DataStore) DeleteInvestment(id string) error {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, inv := range ds.investments {
		if inv.ID == id {
			ds.investments = append(ds.investments[:i], ds.investments[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("investment not found")
}

// GetIncomes returns all incomes
func (ds *DataStore) GetIncomes() []models.Income {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.incomes
}

// AddIncome adds a new income
func (ds *DataStore) AddIncome(inc models.Income) error {
	if err := inc.Validate(); err != nil {
		return fmt.Errorf("invalid income: %w", err)
	}
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.incomes = append(ds.incomes, inc)
	return nil
}

// UpdateIncome updates an existing income
func (ds *DataStore) UpdateIncome(id string, updated models.Income) error {
	if err := updated.Validate(); err != nil {
		return fmt.Errorf("invalid income: %w", err)
	}
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, inc := range ds.incomes {
		if inc.ID == id {
			ds.incomes[i] = updated
			return nil
		}
	}
	return fmt.Errorf("income not found")
}

// DeleteIncome removes an income
func (ds *DataStore) DeleteIncome(id string) error {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, inc := range ds.incomes {
		if inc.ID == id {
			ds.incomes = append(ds.incomes[:i], ds.incomes[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("income not found")
}

// GetExpenses returns all expenses
func (ds *DataStore) GetExpenses() []models.Expense {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.expenses
}

// AddExpense adds a new expense
func (ds *DataStore) AddExpense(exp models.Expense) error {
	if err := exp.Validate(); err != nil {
		return fmt.Errorf("invalid expense: %w", err)
	}
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.expenses = append(ds.expenses, exp)
	return nil
}

// UpdateExpense updates an existing expense
func (ds *DataStore) UpdateExpense(id string, updated models.Expense) error {
	if err := updated.Validate(); err != nil {
		return fmt.Errorf("invalid expense: %w", err)
	}
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, exp := range ds.expenses {
		if exp.ID == id {
			ds.expenses[i] = updated
			return nil
		}
	}
	return fmt.Errorf("expense not found")
}

// DeleteExpense removes an expense
func (ds *DataStore) DeleteExpense(id string) error {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	for i, exp := range ds.expenses {
		if exp.ID == id {
			ds.expenses = append(ds.expenses[:i], ds.expenses[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("expense not found")
}

// GetSettings returns current settings
func (ds *DataStore) GetSettings() models.Settings {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.settings
}

// UpdateSettings updates settings
func (ds *DataStore) UpdateSettings(settings models.Settings) error {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.settings = settings
	return nil
}

// GetExportData returns all data for export
func (ds *DataStore) GetExportData() models.ExportData {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return models.ExportData{
		Investments: ds.investments,
		Incomes:     ds.incomes,
		Expenses:    ds.expenses,
		Settings:    ds.settings,
	}
}

// ImportData imports data from export
func (ds *DataStore) ImportData(data models.ExportData) error {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	if len(data.Investments) > 0 {
		ds.investments = data.Investments
	}
	if len(data.Incomes) > 0 {
		ds.incomes = data.Incomes
	}
	if len(data.Expenses) > 0 {
		ds.expenses = data.Expenses
	}
	if len(data.Settings.Categories) > 0 {
		ds.settings = data.Settings
	}
	return nil
}
