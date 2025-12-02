# 🚀 Quick Start Guide

## ⚡ 60-Second Setup

### 1. Install Dependencies (1 minute)
```bash
./scripts/setup.sh
```

### 2. Terminal 1: Backend
```bash
cd backend
go run ./cmd/server/main.go
```
✅ Server on: `http://localhost:4100`

### 3. Terminal 2: Frontend  
```bash
cd frontend
npm run dev
```
✅ Frontend on: `http://localhost:5173`

### 4. Open Browser
Visit: `http://localhost:5173`

🎉 **Done!** App is running!

---

## 📚 Essential Files

| File | What It Does |
|------|-------------|
| `backend/cmd/server/main.go` | App starts here |
| `backend/internal/handlers/finance/` | Finance API logic |
| `backend/internal/models/finance.go` | Data structures |
| `backend/internal/router/router.go` | URL routing |
| `frontend/src/services/api.js` | Calls backend API |
| `frontend/src/App.jsx` | Main React component |

---

## ⌨️ Useful Commands

### Using Make (Recommended)
```bash
make dev              # Start everything
make backend-run      # Backend only
make frontend-run     # Frontend only
make build            # Build for production
make clean            # Remove build artifacts
make logs             # View backend logs
make help             # Show all commands
```

### Manual Commands
```bash
cd backend && go run ./cmd/server/main.go
cd frontend && npm run dev
cd backend && go build -o app ./cmd/server
cd frontend && npm run build
```

---

## 🔧 Adding New Features

### Add a Finance API Endpoint

**1. Create Handler** (`backend/internal/handlers/finance/handlers.go`)
```go
func GetBalance(w http.ResponseWriter, r *http.Request) {
    // Your logic here
    jsonResponse(w, map[string]interface{}{"balance": 50000})
}
```

**2. Add Route** (`backend/internal/router/router.go`)
```go
r.HandleFunc("/api/balance", financehandler.EnableCORS(financehandler.GetBalance)).Methods("GET")
```

**3. Add API Call** (`frontend/src/services/api.js`)
```javascript
getBalance: () => request('/balance'),
```

**4. Use in Component** (`frontend/src/App.jsx`)
```javascript
const balance = await api.getBalance();
```

---

## 📖 Documentation

- **Starting Out?** → Read `README.md`
- **Want to Understand Structure?** → Read `STRUCTURE_TREE.md`
- **Need Architecture Details?** → Read `docs/ARCHITECTURE.md`
- **Ready to Code?** → Read `docs/DEVELOPMENT.md`
- **What Changed?** → Read `docs/MIGRATION.md`
- **First Time?** → Read `VERIFICATION_CHECKLIST.md`

---

## 🐛 Common Issues & Fixes

### Backend won't start - "port already in use"
```bash
# Windows
netstat -ano | findstr :4100

# macOS/Linux
lsof -i :4100
```

### Frontend shows "API Error"
- Make sure backend is running on `:4100`
- Check browser console for CORS errors
- Verify `frontend/src/services/api.js` has correct BASE_URL

### `go: cannot find module`
```bash
cd backend
go mod tidy
go mod download
```

### `npm: command not found`
- Install Node.js from nodejs.org
- Verify: `node --version`

---

## 📁 Project Structure at a Glance

```
Go Microservice Starter
│
├── backend/               ← All Go code
│   ├── cmd/server/        ← Starts here
│   ├── internal/          ← Business logic
│   ├── pkg/               ← Reusable code
│   ├── config/            ← Settings
│   └── data/              ← Saved files
│
├── frontend/              ← React app
│   └── src/
│       ├── services/      ← Backend calls
│       ├── components/    ← UI parts
│       ├── pages/         ← Page layouts
│       └── ...
│
├── docs/                  ← Guides
├── scripts/               ← Helper scripts
├── Makefile               ← Quick commands
└── README.md              ← Full docs
```

---

## 🎯 Your Next Steps

### Right Now
1. ✅ Run setup: `./scripts/setup.sh`
2. ✅ Start backend: `make backend-run`
3. ✅ Start frontend: `make frontend-run`
4. ✅ Open http://localhost:5173

### Today
- [ ] Explore the code
- [ ] Read `README.md` for API endpoints
- [ ] Try adding a new feature

### This Week
- [ ] Build something new
- [ ] Share the code
- [ ] Show employers/clients
- [ ] Consider database instead of JSON

---

## 💡 Tips

**Tip 1:** Use `make help` to see all available commands

**Tip 2:** Logs are in `backend/log/application.log`

**Tip 3:** Add new handlers in `backend/internal/handlers/`

**Tip 4:** Use React DevTools extension for debugging

**Tip 5:** Check `docs/` for detailed guides

---

## 🎉 You're All Set!

Your project is now:
- ✅ Professionally organized
- ✅ Well documented
- ✅ Ready to scale
- ✅ Portfolio-worthy

**Happy coding! 🚀**

---

**Need Help?**
- Check `VERIFICATION_CHECKLIST.md` for setup issues
- Read `docs/DEVELOPMENT.md` for coding guidelines  
- Review `README.md` for API reference
- See `STRUCTURE_TREE.md` for folder guide
