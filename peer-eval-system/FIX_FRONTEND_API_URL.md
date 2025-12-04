# Fix: Frontend Using Wrong API URL

## Problem
The frontend is trying to call `https://smu-web-application.onrender.com/api/login` instead of using a relative URL. This happens because an old build has the Render URL baked into it.

## Solution

### Step 1: Remove REACT_APP_API_URL from Railway (if set)

1. Go to your Railway project
2. Open your service
3. Go to **Variables** tab
4. **Delete** `REACT_APP_API_URL` if it exists (or set it to empty)
5. The frontend should NOT have this variable set when frontend/backend are served together

### Step 2: Rebuild the Frontend

The frontend needs to be rebuilt. Railway will do this automatically on the next deploy, but you can trigger it:

**Option A: Push to trigger rebuild**
- Commit the config.js change
- Push to your git repository
- Railway will automatically rebuild

**Option B: Manual rebuild in Railway**
- Go to Railway dashboard
- Your service → Deployments → New Deployment
- Or restart the service to trigger a rebuild

### Step 3: Check Railway Logs for 500 Error

While waiting for rebuild, check Railway logs to see why `/api/login` is returning 500:

1. Go to Railway dashboard
2. Open your service
3. Go to **Deployments** tab
4. Click latest deployment
5. Open **Logs** tab
6. Look for lines like:
   - `[API] POST /api/login`
   - `[LOGIN] ERROR:`
   - Database error messages

Share those error messages so we can fix the database issue.

## After Rebuild

After the rebuild, the browser console should show:
```
🔧 API Configuration:
  Hostname: [your-railway-domain]
  Is Production: true
  REACT_APP_API_URL env: undefined
  Using API_URL: (relative - same origin)
```

And login attempts should go to: `/api/login` (relative URL, not Render URL)

## Test Database Connection

You can also test the database directly by visiting:
```
https://[your-railway-url]/api/test-db
```

This will show if database queries are working.

