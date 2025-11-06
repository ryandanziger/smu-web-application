# Final Fix - 404 and CORS Issues

## Good News!
✅ Frontend is now using the correct URL: `https://smu-web-application.onrender.com`

## Two Issues Remaining

### Issue 1: 404 on `/api/login`
The backend route isn't being found. This means either:
- Backend isn't running the latest code
- Backend server crashed/not started
- Route not registered

### Issue 2: CORS Error
"No 'Access-Control-Allow-Origin' header is present" means:
- `CORS_ORIGIN` not set in backend environment variables
- Or backend CORS middleware isn't working

## The Fix

### Step 1: Check Backend Logs

1. Go to Render dashboard → Backend service (`smu-web-application`)
2. Click **Logs** tab
3. Look for:
   - `Server running on http://localhost:3001`
   - `CORS Configuration:`
   - Any error messages

**What do you see?**
- If you see "Server running" → Backend is running ✅
- If you see errors → Backend crashed
- If you see nothing → Backend didn't start

### Step 2: Set Backend CORS Environment Variable

1. Go to Render dashboard → Backend service
2. Click **Environment** tab
3. Add/Update:
   ```
   CORS_ORIGIN=https://smu-web-application-1.onrender.com
   ```
4. **IMPORTANT**: No quotes, no trailing slash, exact match

### Step 3: Redeploy Backend

After setting CORS_ORIGIN:
1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment (3-5 minutes)
3. Check logs - should see:
   ```
   CORS Configuration:
     CORS_ORIGIN: https://smu-web-application-1.onrender.com
   ```

### Step 4: Test Backend Directly

After redeploy, test in browser:
1. `https://smu-web-application.onrender.com/` → Should show JSON
2. `https://smu-web-application.onrender.com/api/login` → Should show error (405 is OK, 404 means route not registered)

## If Backend Shows 404

If `/api/login` returns 404:
1. Check backend logs for "Server running" message
2. Verify backend is using latest code (check build logs)
3. Try accessing `/api/professors` - if that works, login route might be missing

## Quick Checklist

- [ ] Backend `CORS_ORIGIN` = `https://smu-web-application-1.onrender.com`
- [ ] Backend logs show "Server running"
- [ ] Backend logs show "CORS Configuration"
- [ ] Backend `/api/login` endpoint accessible (405 OK, 404 bad)
- [ ] Backend redeployed after setting CORS_ORIGIN

