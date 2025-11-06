# 🚨 URGENT FIX - Frontend Using Wrong API URL

## The Problem
Your frontend is trying to call `http://localhost:3001` instead of your Render backend URL!

## The Fix (2 Steps)

### Step 1: Set Frontend Environment Variable

Go to Render dashboard → **Frontend static site** → **Environment** tab

**Add/Update this variable:**
```
REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com
```

**Replace `YOUR-BACKEND-URL.onrender.com` with your actual backend URL!**

Example: `https://smu-peer-eval-backend.onrender.com`

### Step 2: Set Backend CORS

Go to Render dashboard → **Backend service** → **Environment** tab

**Add/Update this variable:**
```
CORS_ORIGIN=https://smu-web-application-1.onrender.com
```

(Your frontend URL is `https://smu-web-application-1.onrender.com`)

### Step 3: Redeploy

After setting environment variables:
1. **Frontend**: Manual Deploy → Deploy latest commit
2. **Backend**: Manual Deploy → Deploy latest commit
3. Wait 3-5 minutes

### Step 4: Test

1. Open `https://smu-web-application-1.onrender.com`
2. Open browser console (F12)
3. Try to login
4. Check console - should now show your backend URL, not localhost!

## Quick Reference

**Frontend Environment Variable:**
```
REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com
```

**Backend Environment Variable:**
```
CORS_ORIGIN=https://smu-web-application-1.onrender.com
```

## Why This Happened

The frontend code has a fallback:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

If `REACT_APP_API_URL` is not set, it defaults to localhost. That's why you're seeing `localhost:3001` in the error!

