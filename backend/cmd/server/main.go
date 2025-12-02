package main

import (
	"fmt"
	"log"
	"net/http"

	"finance-tracker/internal/router"
	"finance-tracker/internal/storage"
)

func main() {
	// Initialize data store
	store := storage.NewDataStore("./data")

	// Register all routes
	router.RegisterRoutes(store)

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
