# Frontend Still Using Localhost - Final Fix

## The Problem
Frontend is still calling `http://localhost:3001` even after setting environment variable.

This means `REACT_APP_API_URL` is either:
1. Not set in Render
2. Set incorrectly
3. Frontend wasn't rebuilt after setting it

## The Fix - Step by Step

### Step 1: Verify Environment Variable in Render

**Go to Render dashboard:**
1. Click on `smu-web-application-1` (frontend)
2. Click **Environment** tab
3. Look for `REACT_APP_API_URL`
4. **What value does it show?**
   - If it's missing → Add it
   - If it shows `http://localhost:3001` → Change it
   - If it shows blank → Set it

### Step 2: Set It Correctly

**In Frontend Environment tab, add/update:**
```
REACT_APP_API_URL=https://smu-web-application.onrender.com
```

**CRITICAL:**
- No quotes around the value
- No trailing slash
- Must be `https://` not `http://`
- Exact match: `https://smu-web-application.onrender.com`

### Step 3: Force Rebuild

**After setting the variable:**
1. Go to frontend service
2. Click **Manual Deploy**
3. Click **Deploy latest commit**
4. **IMPORTANT**: Wait for build to complete (3-5 minutes)
5. Check build logs - should show "Build completed successfully"

### Step 4: Verify It Worked

**After rebuild:**
1. Open `https://smu-web-application-1.onrender.com`
2. Open browser console (F12)
3. Look for: `🔧 API Configuration:`
4. Should show: `Using API_URL: https://smu-web-application.onrender.com`

**If it still shows `localhost:3001`:**
- The environment variable wasn't set correctly
- Or the build didn't pick it up
- Try clearing browser cache and hard refresh (Ctrl+Shift+R)

## Alternative: Hardcode Temporarily

If environment variable keeps failing, we can hardcode it temporarily:

In `config.js`, change:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

To:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://smu-web-application.onrender.com';
```

Then commit and push - this will make it use the Render URL by default.

