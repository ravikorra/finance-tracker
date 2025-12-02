package finance

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"

	"finance-tracker/backend/internal/models"
	"finance-tracker/backend/pkg/logger"

	"go.uber.org/zap"
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
		logger.Info("Loaded investments", zap.Int("count", len(ds.investments)))
	}

	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "expenses.json")); err == nil {
		json.Unmarshal(data, &ds.expenses)
		logger.Info("Loaded expenses", zap.Int("count", len(ds.expenses)))
	}

	if data, err := os.ReadFile(filepath.Join(ds.dataDir, "settings.json")); err == nil {
		json.Unmarshal(data, &ds.settings)
		logger.Info("Loaded settings")
	}
}

func (ds *DataStore) saveInvestments() error {
	data, _ := json.MarshalIndent(ds.investments, "", "  ")
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
