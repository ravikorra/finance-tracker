package middleware

import (
	"encoding/json"
	"net/http"
)

// APIResponse is the standard API response format
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// JSONResponse sends a successful JSON response
func JSONResponse(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	resp := APIResponse{
		Success: status >= 200 && status < 300,
		Data:    data,
	}
	json.NewEncoder(w).Encode(resp)
}

// ErrorResponse sends an error JSON response
func ErrorResponse(w http.ResponseWriter, message string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	resp := APIResponse{
		Success: false,
		Error:   message,
	}
	json.NewEncoder(w).Encode(resp)
}

// SuccessMessage sends a success message
func SuccessMessage(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	resp := APIResponse{
		Success: true,
		Message: message,
	}
	json.NewEncoder(w).Encode(resp)
}
