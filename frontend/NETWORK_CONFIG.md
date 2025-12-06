# Frontend Configuration

## API Base URL

Configure which backend server the frontend connects to:

### Development (Localhost only)
```javascript
const BASE_URL = 'http://localhost:5000/v1/api';
```

### Family Network Access
Replace `192.168.1.100` with your actual PC IP address:
```javascript
const BASE_URL = 'http://192.168.1.100:5000/v1/api';
```

### To find your PC IP:
```powershell
ipconfig | findstr "IPv4"
```

## How to Change

Edit `frontend/src/api.js` line 11 to use your desired configuration.

### Development Setup (localhost)
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Family: Cannot access

### Family Setup (Network)
1. Find PC IP: `ipconfig | findstr "IPv4"` (e.g., 192.168.1.100)
2. Update `api.js`: `const BASE_URL = 'http://192.168.1.100:5000/v1/api';`
3. Frontend: `http://192.168.1.100:5173`
4. Family accesses: `http://192.168.1.100:5173`

## Environment Variables (Alternative)

You can also set via environment variables:

```powershell
# Frontend (Vite)
$env:VITE_API_URL = "http://192.168.1.100:5000/v1/api"
npm run dev

# Backend
$env:PORT = "5000"
go run ./cmd/server
```
