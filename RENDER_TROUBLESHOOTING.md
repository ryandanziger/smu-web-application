# Render.com Fetch Failure - Troubleshooting Guide

If your app works locally but fails to fetch on Render, follow these steps:

## Step 1: Verify Backend Environment Variables

Go to your **backend service** in Render dashboard → **Environment** tab:

### Required Variables:
```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=25060
PORT=3001
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**CRITICAL**: 
- `CORS_ORIGIN` must be your **exact frontend URL** (e.g., `https://smu-peer-eval-frontend.onrender.com`)
- No trailing slash!
- Must use `https://` not `http://`

## Step 2: Verify Frontend Environment Variables

Go to your **frontend static site** in Render dashboard → **Environment** tab:

### Required Variable:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**CRITICAL**:
- Replace `your-backend-url.onrender.com` with your actual backend URL
- Must use `https://` not `http://`
- No trailing slash!

## Step 3: Check Backend Logs

1. Go to backend service → **Logs** tab
2. Look for:
   - "Server running on port 3001"
   - Any CORS errors
   - Database connection errors

## Step 4: Check Frontend Build Logs

1. Go to frontend static site → **Logs** tab
2. Verify:
   - Build completed successfully
   - No errors about `REACT_APP_API_URL`

## Step 5: Test Backend Directly

1. Open your backend URL in browser: `https://your-backend-url.onrender.com/api/professors`
2. Should see JSON response (even if empty array)
3. If you see 404 or error, backend route isn't working

## Step 6: Common Issues & Fixes

### Issue 1: CORS Error in Browser Console
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Fix**:
- Verify `CORS_ORIGIN` in backend matches frontend URL exactly
- Check for typos (http vs https, trailing slashes)
- Redeploy backend after changing environment variables

### Issue 2: Network Error / Failed to Fetch
**Error**: `Failed to fetch` or `NetworkError when attempting to fetch resource`

**Fix**:
- Verify `REACT_APP_API_URL` is set correctly in frontend
- Check backend is actually running (check logs)
- Verify backend URL is correct (no typos)

### Issue 3: 404 Not Found
**Error**: `404` when calling API endpoints

**Fix**:
- Check backend logs to see if routes are registered
- Verify backend build completed successfully
- Check that `server.js` is in the correct location

### Issue 4: Backend Spinning Down
**Error**: First request works, then fails

**Fix**:
- Render free tier spins down after 15 min inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading to paid plan for always-on

## Step 7: Verify Environment Variables Format

### Backend CORS_ORIGIN:
```
✅ CORRECT: https://smu-peer-eval-frontend.onrender.com
❌ WRONG: http://smu-peer-eval-frontend.onrender.com
❌ WRONG: https://smu-peer-eval-frontend.onrender.com/
❌ WRONG: smu-peer-eval-frontend.onrender.com
```

### Frontend REACT_APP_API_URL:
```
✅ CORRECT: https://smu-peer-eval-backend.onrender.com
❌ WRONG: http://smu-peer-eval-backend.onrender.com
❌ WRONG: https://smu-peer-eval-backend.onrender.com/
❌ WRONG: smu-peer-eval-backend.onrender.com
```

## Step 8: Force Redeploy

After changing environment variables:
1. Backend: Go to **Manual Deploy** → **Deploy latest commit**
2. Frontend: Go to **Manual Deploy** → **Deploy latest commit**

Wait for both to complete, then test again.

## Quick Debug Checklist

- [ ] Backend `CORS_ORIGIN` = exact frontend URL (https://, no trailing slash)
- [ ] Frontend `REACT_APP_API_URL` = exact backend URL (https://, no trailing slash)
- [ ] Backend logs show "Server running"
- [ ] Backend URL directly accessible in browser
- [ ] Both services redeployed after env var changes
- [ ] Browser console shows specific error (not just "Failed to fetch")

## Still Not Working?

1. Check browser console for exact error message
2. Check backend logs for any errors
3. Verify both services are "Live" (not "Building" or "Failed")
4. Try accessing backend URL directly: `https://your-backend.onrender.com/api/professors`

