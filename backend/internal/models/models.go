package models

// Investment represents one investment entry
type Investment struct {
	ID         string  `json:"id"`         // Unique identifier
	Name       string  `json:"name"`       // e.g., "HDFC Flexi Cap"
	Type       string  `json:"type"`       // e.g., "Mutual Fund"
	Invested   float64 `json:"invested"`   // Amount invested
	Current    float64 `json:"current"`    // Current value
	Date       string  `json:"date"`       // Purchase date
	SchemeCode string  `json:"schemeCode"` // MF API scheme code for NAV updates
	Units      float64 `json:"units"`      // Number of units purchased
	CreatedAt  string  `json:"createdAt"`  // When record was created
	UpdatedAt  string  `json:"updatedAt"`  // When record was last updated
}

// Income represents one income entry
type Income struct {
	ID            string  `json:"id"`
	Source        string  `json:"source"`        // e.g., "Salary", "Rent", "Freelance"
	Amount        float64 `json:"amount"`        // How much received
	Category      string  `json:"category"`      // e.g., "Salary", "Business", "Rental"
	Date          string  `json:"date"`          // When received
	AddedBy       string  `json:"addedBy"`       // Who added this
	PaymentMethod string  `json:"paymentMethod"` // e.g., "Online", "Cash", "UPI"
	CreatedAt     string  `json:"createdAt"`
	UpdatedAt     string  `json:"updatedAt"`
}

// Expense represents one expense entry
type Expense struct {
	ID            string  `json:"id"`
	Desc          string  `json:"desc"`          // Description
	Amount        float64 `json:"amount"`        // How much spent
	Category      string  `json:"category"`      // e.g., "Food", "Transport"
	Date          string  `json:"date"`          // When spent
	AddedBy       string  `json:"addedBy"`       // Who added this (for family sharing)
	PaymentMethod string  `json:"paymentMethod"` // e.g., "Online", "Cash", "UPI"
	CreatedAt     string  `json:"createdAt"`
	UpdatedAt     string  `json:"updatedAt"`
}

// Settings stores app configuration
type Settings struct {
	Categories       []string `json:"categories"`       // Expense categories
	InvestmentTypes  []string `json:"investmentTypes"`  // Types of investments
	IncomeCategories []string `json:"incomeCategories"` // Income categories
	PaymentMethods   []string `json:"paymentMethods"`   // Payment methods
	Members          []string `json:"members"`          // Family members
}

// ExportData is the format for backup/restore
type ExportData struct {
	Version     string       `json:"version"`
	ExportedAt  string       `json:"exportedAt"`
	Investments []Investment `json:"investments"`
	Incomes     []Income     `json:"incomes"`
	Expenses    []Expense    `json:"expenses"`
	Settings    Settings     `json:"settings"`
}
