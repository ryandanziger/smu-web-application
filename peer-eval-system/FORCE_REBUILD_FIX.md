# Fix: Frontend Still Using Old Render URL

## Problem
After redeploy, the frontend is still using `https://smu-web-application.onrender.com` instead of relative URLs. This means the old build is being served.

## Root Cause
The old build files have the Render URL baked into the JavaScript bundle. The build needs to be completely regenerated.

## Solution Steps

### Step 1: Check Railway Environment Variables

1. Go to Railway Dashboard
2. Your Service → **Variables** tab
3. **DELETE** `REACT_APP_API_URL` if it exists
   - This variable should NOT be set when frontend/backend are served together
4. Save changes

### Step 2: Force Clean Rebuild

The build script now automatically cleans the old build first. You need to trigger a fresh rebuild:

**Option A: Push Changes (Recommended)**
```bash
# Commit the changes
git add .
git commit -m "Fix: Force clean frontend rebuild with relative URLs"
git push
```

Railway will automatically rebuild.

**Option B: Manual Redeploy in Railway**
1. Go to Railway Dashboard
2. Your Service → **Deployments** tab
3. Click **"Redeploy"** or **"New Deployment"**
4. Make sure to check the logs to see if `npm run build` runs

### Step 3: Verify Build is Running

In Railway logs, you should see:
```
> smu-peer-eval@1.0.0 build
> cd frontend-clean && rm -rf build && npm install && npm run build
```

Then build output:
```
Creating an optimized production build...
Compiled successfully!
```

### Step 4: Clear Browser Cache

After rebuild, **hard refresh** your browser:
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or open in Incognito/Private window

### Step 5: Verify It's Fixed

Open browser console (F12) and look for:
```
🔧 API Configuration:
  Hostname: [your-railway-domain]
  Is Production: true
  REACT_APP_API_URL env: undefined
  Using API_URL: (relative - same origin)
  Final API URL will be: relative /api/...
```

**Should show**: `API_URL: (relative - same origin)` or empty string
**Should NOT show**: `https://smu-web-application.onrender.com`

## Troubleshooting

### If it still shows Render URL:

1. **Check Railway Build Logs**
   - Did the build actually run?
   - Did it complete successfully?
   - Look for "Compiled successfully!" message

2. **Check if build folder is in git**
   ```bash
   git ls-files | grep "frontend-clean/build"
   ```
   - If build files are committed, remove them:
   ```bash
   git rm -r frontend-clean/build
   git commit -m "Remove build folder from git"
   git push
   ```

3. **Verify Railway Root Directory**
   - Railway Settings → Root Directory should be: `peer-eval-system`
   - NOT `peer-eval-system/backend` or `peer-eval-system/frontend-clean`

4. **Check Railway Build Command**
   - Settings → Build Command should be: `npm run build`
   - Or Railway should auto-detect from `package.json`

## After Fix

Once the API URL shows as relative, login should work. If you still get 500 errors, check Railway logs for database errors.

