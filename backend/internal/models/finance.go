package models

// Investment represents one investment entry
type Investment struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Invested  float64 `json:"invested"`
	Current   float64 `json:"current"`
	Date      string  `json:"date"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

// Expense represents one expense entry
type Expense struct {
	ID        string  `json:"id"`
	Desc      string  `json:"desc"`
	Amount    float64 `json:"amount"`
	Category  string  `json:"category"`
	Date      string  `json:"date"`
	AddedBy   string  `json:"addedBy"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

// Settings stores app configuration
type Settings struct {
	Categories      []string `json:"categories"`
	InvestmentTypes []string `json:"investmentTypes"`
	Members         []string `json:"members"`
}

// ExportData is the format for backup/restore
type ExportData struct {
	Version     string       `json:"version"`
	ExportedAt  string       `json:"exportedAt"`
	Investments []Investment `json:"investments"`
	Expenses    []Expense    `json:"expenses"`
	Settings    Settings     `json:"settings"`
}
