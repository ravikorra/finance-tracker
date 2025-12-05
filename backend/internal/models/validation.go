package models

import "errors"

// Validate checks if an Investment is valid
func (inv *Investment) Validate() error {
	if inv.Name == "" {
		return errors.New("investment name is required")
	}
	if inv.Type == "" {
		return errors.New("investment type is required")
	}
	if inv.Invested <= 0 {
		return errors.New("invested amount must be greater than 0")
	}
	if inv.Current < 0 {
		return errors.New("current value cannot be negative")
	}
	if inv.Date == "" {
		return errors.New("investment date is required")
	}
	return nil
}

// Validate checks if an Expense is valid
func (exp *Expense) Validate() error {
	if exp.Desc == "" {
		return errors.New("expense description is required")
	}
	if exp.Amount <= 0 {
		return errors.New("expense amount must be greater than 0")
	}
	if exp.Category == "" {
		return errors.New("expense category is required")
	}
	if exp.Date == "" {
		return errors.New("expense date is required")
	}
	if exp.AddedBy == "" {
		return errors.New("added by (member name) is required")
	}
	return nil
}

// Validate checks if an Income is valid
func (inc *Income) Validate() error {
	if inc.Source == "" {
		return errors.New("income source is required")
	}
	if inc.Amount <= 0 {
		return errors.New("income amount must be greater than 0")
	}
	if inc.Category == "" {
		return errors.New("income category is required")
	}
	if inc.Date == "" {
		return errors.New("income date is required")
	}
	if inc.AddedBy == "" {
		return errors.New("added by (member name) is required")
	}
	return nil
}
