package storage

import "finance-tracker/internal/models"

// Storage defines the interface for data storage operations
// This allows for testing with mock implementations
type Storage interface {
	// Investments
	GetInvestments() []models.Investment
	AddInvestment(inv models.Investment) error
	UpdateInvestment(id string, updated models.Investment) error
	DeleteInvestment(id string) error
	SaveInvestments() error

	// Expenses
	GetExpenses() []models.Expense
	AddExpense(exp models.Expense) error
	UpdateExpense(id string, updated models.Expense) error
	DeleteExpense(id string) error
	SaveExpenses() error

	// Settings
	GetSettings() models.Settings
	UpdateSettings(settings models.Settings) error
	SaveSettings() error

	// Export/Import
	GetExportData() models.ExportData
	ImportData(data models.ExportData) error
}
