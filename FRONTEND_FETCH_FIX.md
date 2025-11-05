# Fix Frontend Fetch Issue on Render

## The Problem
Backend is working (you can see the JSON response), but frontend can't fetch data.

## Most Common Causes

### 1. CORS Configuration Issue

**Check Backend Environment Variables:**
- Go to Render dashboard → Backend service → Environment tab
- Verify `CORS_ORIGIN` is set to your **exact frontend URL**
- Example: `https://smu-peer-eval-frontend.onrender.com`
- **NO trailing slash!**
- **Must be https:// not http://**

### 2. Frontend API URL Not Set

**Check Frontend Environment Variables:**
- Go to Render dashboard → Frontend static site → Environment tab
- Verify `REACT_APP_API_URL` is set to your **backend URL**
- Example: `https://smu-peer-eval-backend.onrender.com`
- **NO trailing slash!**
- **Must be https:// not http://**

### 3. Frontend Not Rebuilt After Setting Environment Variable

**Fix:**
1. After setting `REACT_APP_API_URL`, the frontend must be rebuilt
2. Go to frontend → Manual Deploy → Deploy latest commit
3. Wait for build to complete

## Debugging Steps

### Step 1: Check Browser Console
1. Open your frontend URL
2. Open browser console (F12)
3. Look for:
   - "Fetching professors from: [URL]" - Should show your backend URL
   - Any CORS errors
   - Any network errors

### Step 2: Test Backend Directly
1. Open: `https://your-backend.onrender.com/api/professors`
2. Should see JSON response
3. If you see CORS error in browser, CORS_ORIGIN is wrong

### Step 3: Verify Environment Variables

**Backend:**
```
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**Frontend:**
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

### Step 4: Check Render Logs

**Backend Logs:**
- Look for "CORS blocked origin" messages
- Should show allowed origins on startup

**Frontend Logs:**
- Check if build completed successfully
- Look for any errors during build

## Quick Fix Checklist

1. [ ] Backend `CORS_ORIGIN` = exact frontend URL (https://, no trailing slash)
2. [ ] Frontend `REACT_APP_API_URL` = exact backend URL (https://, no trailing slash)
3. [ ] Both services redeployed after setting environment variables
4. [ ] Frontend rebuilt (static sites rebuild automatically, but verify)
5. [ ] Browser console shows the correct API URL being called

## Common Mistakes

❌ `CORS_ORIGIN=http://frontend.onrender.com` (should be https)
❌ `CORS_ORIGIN=https://frontend.onrender.com/` (no trailing slash)
❌ `REACT_APP_API_URL=backend.onrender.com` (missing https://)
❌ `REACT_APP_API_URL=https://backend.onrender.com/` (no trailing slash)

✅ `CORS_ORIGIN=https://smu-peer-eval-frontend.onrender.com`
✅ `REACT_APP_API_URL=https://smu-peer-eval-backend.onrender.com`

## Still Not Working?

1. Share the exact error message from browser console
2. Check if backend logs show CORS blocking
3. Verify both URLs are correct (no typos)
4. Try accessing backend URL directly in browser

