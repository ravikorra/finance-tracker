# Family Access Setup Guide

## Overview

This Finance Tracker can now be accessed by:
1. **You (Developer)** - Via `http://localhost:5173` (localhost only)
2. **Family Members** - Via `http://192.168.1.100:5173` (same WiFi network)

Both configurations work seamlessly - just change one environment variable!

---

## Quick Start

### For Localhost Access Only (Default)

**No changes needed!** Everything is configured for localhost by default.

```powershell
# Terminal 1 - Backend
cd backend
go run ./cmd/server

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access: `http://localhost:5173`

---

### For Family Network Access

**Step 1: Find your PC's IP address**
```powershell
ipconfig | findstr "IPv4"
```
Look for something like `192.168.1.100`

**Step 2: Update the configuration**

Edit `frontend/.env.local` and uncomment the family network line:

```
# Replace with your actual IP from Step 1
VITE_API_URL=http://192.168.1.100:5000/v1/api
```

**Step 3: Restart the frontend**
```powershell
cd frontend
npm run dev
```

**Step 4: Family accesses via**
- From same PC: `http://localhost:5173`
- From other devices: `http://192.168.1.100:5173`

---

## Configuration Options

### Option A: Using `.env.local` (Recommended)

Edit `frontend/.env.local`:

**For localhost:**
```
VITE_API_URL=http://localhost:5000/v1/api
```

**For family network:**
```
VITE_API_URL=http://192.168.1.100:5000/v1/api
```

### Option B: Using Command Line

```powershell
# Localhost
$env:VITE_API_URL = "http://localhost:5000/v1/api"
npm run dev

# Family network
$env:VITE_API_URL = "http://192.168.1.100:5000/v1/api"
npm run dev
```

### Option C: Edit api.js Directly

In `frontend/src/api.js`, manually change line 14:

```javascript
// Localhost:
let BASE_URL = 'http://localhost:5000/v1/api'

// Family network:
let BASE_URL = 'http://192.168.1.100:5000/v1/api'
```

---

## Network Setup Details

### Backend Configuration ✅
- ✅ Already listens on all interfaces (`0.0.0.0`)
- ✅ Accessible from network (no changes needed)
- ✅ Port: 5000 (configurable via PORT env var)

### Frontend Configuration ✅
- ✅ Now listens on `0.0.0.0` (all interfaces)
- ✅ Environment variable support added
- ✅ Port: 5173 (falls back to next available if busy)

### API Endpoints ✅
- ✅ CORS enabled (allows cross-origin requests)
- ✅ No authentication yet (add later if needed)

---

## Testing Network Access

**Check if backend is accessible:**
```powershell
# From another device on WiFi, test:
curl http://192.168.1.100:5000/health
```

**Expected response:**
```json
{"status": "ok"}
```

---

## Troubleshooting

### Family can't access the app

**Problem**: Connected to WiFi but can't reach `http://192.168.1.100:5173`

**Solutions**:
1. ✅ Verify your IP: `ipconfig | findstr "IPv4"`
2. ✅ Verify backend is running: `http://192.168.1.100:5000/health`
3. ✅ Check firewall - allow ports 5000 and 5173
4. ✅ Restart frontend: `npm run dev`

### Backend connection fails

**Problem**: Frontend shows "Failed to connect to backend"

**Solution**: Update `.env.local` with correct IP address and restart frontend

### Port already in use

**Problem**: "Port 5173 is already in use"

**Solution**: Vite will automatically use the next available port (5174, 5175, etc.)

---

## Security Notes

⚠️ **Important for Production**:

1. **No Authentication Yet**
   - Any family member on WiFi can see all data
   - Consider adding login/authentication later

2. **Network Access**
   - Only works on same WiFi network
   - Not accessible from outside your home (by design)

3. **Future Enhancements**
   - Add PIN/password protection
   - Add user roles (admin, viewer, editor)
   - Add data encryption
   - Add request logging

---

## File Changes Summary

Files modified for family access:

1. **frontend/src/api.js** - Now supports `VITE_API_URL` environment variable
2. **frontend/vite.config.js** - Set server to listen on `0.0.0.0`
3. **frontend/.env.example** - Template for environment variables
4. **frontend/.env.local** - Local configuration (git-ignored)
5. **frontend/NETWORK_CONFIG.md** - Network configuration guide
6. **FAMILY_ACCESS_SETUP.md** - This file

Backend didn't need changes - it already listens on all interfaces!

---

## Next Steps

1. ✅ Test with localhost first
2. ✅ Configure `.env.local` with your network IP
3. ✅ Test access from another device on WiFi
4. ✅ Share the app URL with family
5. ⚠️ Consider adding authentication for security

---

**Questions?** Check `NETWORK_CONFIG.md` for additional configuration options.
