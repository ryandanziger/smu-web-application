# How to View Railway Logs

## Method 1: Web Dashboard (Recommended)

1. **Go to Railway**: https://railway.app
2. **Login** to your account
3. **Open your project** (should see "smu-peer-eval" or similar)
4. **Click on your service** (the one running your app)
5. **Go to the "Deployments" tab** (left sidebar)
6. **Click on the latest deployment** (most recent one at the top)
7. **Click the "Logs" tab** or scroll down to see the log viewer

You'll see logs in real-time showing:
- `[DB] ✅ Connected` - Database connection status
- `[API] POST /api/login` - API requests
- `[LOGIN] ERROR:` - Any errors that occur
- Build logs and deployment info

## Method 2: Railway CLI

If you have Railway CLI installed:

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (if not already linked)
railway link

# View logs in real-time
railway logs

# Or follow logs continuously
railway logs --follow
```

## What to Look For

When testing login/signup from the frontend, watch for these log messages:

1. **Database Connection**:
   - `[DB] ✅ Connected` - Good!
   - `[DB] ❌ Connection failed:` - Database issue

2. **API Requests**:
   - `[API] POST /api/login` - Request received
   - `[LOGIN] Database connection acquired` - DB connection obtained
   - `[LOGIN] Querying user: username` - Query executing

3. **Errors**:
   - `[LOGIN] ERROR:` - Look for error message, code, and detail
   - Database error codes:
     - `ECONNREFUSED` - Can't reach database
     - `28P01` - Authentication failed
     - `3D000` - Database doesn't exist
     - `42P01` - Table doesn't exist

## Method 3: Browser Console (Frontend Errors)

The browser console shows errors from the frontend:

1. **Open your Railway site** in a browser
2. **Open Developer Tools**:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - **Safari**: Enable Developer menu first, then `Cmd+Option+C`
3. **Go to "Console" tab**
4. **Try to login/signup** and watch for errors

Look for:
- `🔧 API Configuration:` - Shows what API URL is being used
- `🔐 LOGIN ATTEMPT:` - Shows login request details
- `Failed to parse JSON response` - Backend returned non-JSON error
- Red error messages showing HTTP status codes (400, 500, etc.)

## Troubleshooting Tips

- **Filter logs**: Use the search box in Railway dashboard to filter for specific terms like "ERROR" or "LOGIN"
- **Check timestamps**: Match log times with when you tried to interact
- **Copy error messages**: Full error messages help diagnose the issue
- **Check both places**: Railway logs show backend errors, browser console shows frontend errors
