# Backend Not Responding - Diagnostic Steps

## The Problem
- ✅ Frontend is using correct URL: `https://smu-web-application.onrender.com`
- ❌ Backend returns 404 on `/api/login`
- ❌ CORS error (no Access-Control-Allow-Origin header)

This means the backend either:
1. Isn't running
2. Isn't running the latest code
3. CORS_ORIGIN isn't set correctly

## Immediate Tests

### Test 1: Is Backend Running?

Open in browser:
```
https://smu-web-application.onrender.com/
```

**What do you see?**
- ✅ JSON with endpoints → Backend is running
- ❌ 404 or error → Backend not running or wrong route

### Test 2: Check Backend Logs

1. Render dashboard → Backend service (`smu-web-application`)
2. **Logs** tab
3. Look for:
   - `Server running on http://localhost:3001`
   - `CORS Configuration:`
   - Any error messages

**What do you see?**
- If you see "Server running" → Backend started ✅
- If you see errors → Backend crashed ❌
- If you see nothing → Backend didn't start ❌

### Test 3: Check Environment Variables

1. Render dashboard → Backend service
2. **Environment** tab
3. Verify `CORS_ORIGIN` is set to:
   ```
   https://smu-web-application-1.onrender.com
   ```
   (exact match, no quotes, no trailing slash)

## Most Likely Fix

### Step 1: Set CORS_ORIGIN (if not set)
```
CORS_ORIGIN=https://smu-web-application-1.onrender.com
```

### Step 2: Redeploy Backend
1. **Manual Deploy** → **Deploy latest commit**
2. Wait 3-5 minutes
3. Check logs for "Server running"

### Step 3: Test Again
- Try `https://smu-web-application.onrender.com/` in browser
- Should show JSON
- Then try login from frontend

## If Backend Still Returns 404

The `/api/login` route exists in the code, so if it's returning 404:
1. Backend isn't running the latest code
2. Backend server crashed during startup
3. Check backend logs for any startup errors

## Share With Me

Please share:
1. What you see at `https://smu-web-application.onrender.com/` (should be JSON)
2. What backend logs show (especially "Server running" message)
3. Whether `CORS_ORIGIN` is set in backend environment variables

