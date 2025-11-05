# Quick Fix for Render Fetch Issues

## The Problem
Your app works locally but fails to fetch on Render. This is almost always a configuration issue.

## The Fix (5 Minutes)

### 1. Get Your URLs
Note down your Render URLs:
- **Backend URL**: `https://smu-peer-eval-backend.onrender.com` (or whatever Render gave you)
- **Frontend URL**: `https://smu-peer-eval-frontend.onrender.com` (or whatever Render gave you)

### 2. Fix Backend Environment Variables
1. Go to Render dashboard → Your **backend service**
2. Click **"Environment"** tab
3. Find or add `CORS_ORIGIN`
4. Set it to: `https://your-actual-frontend-url.onrender.com`
   - **NO trailing slash**
   - **MUST start with https://**
   - Replace with your actual frontend URL

### 3. Fix Frontend Environment Variables
1. Go to Render dashboard → Your **frontend static site**
2. Click **"Environment"** tab
3. Find or add `REACT_APP_API_URL`
4. Set it to: `https://your-actual-backend-url.onrender.com`
   - **NO trailing slash**
   - **MUST start with https://**
   - Replace with your actual backend URL

### 4. Redeploy Both Services
After changing environment variables:
1. **Backend**: Click **"Manual Deploy"** → **"Deploy latest commit"**
2. **Frontend**: Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 3-5 minutes for both to finish

### 5. Test
1. Open your frontend URL
2. Open browser console (F12)
3. Try logging in or loading a page
4. Check for errors

## Common Mistakes

❌ `CORS_ORIGIN=http://...` (must be https)
❌ `CORS_ORIGIN=https://.../` (no trailing slash)
❌ `REACT_APP_API_URL=localhost:3001` (must be your Render backend URL)

✅ `CORS_ORIGIN=https://smu-peer-eval-frontend.onrender.com`
✅ `REACT_APP_API_URL=https://smu-peer-eval-backend.onrender.com`

## If Still Not Working

1. **Test backend directly**: Open `https://your-backend.onrender.com/api/professors` in browser
   - Should see JSON (even if empty array)
   - If 404, backend routes aren't working

2. **Check backend logs**: Render dashboard → Backend → Logs tab
   - Look for "Server running on port 3001"
   - Look for any errors

3. **Check browser console**: F12 → Console tab
   - Look for exact error message
   - Share the error if you need help

4. **Verify both services are "Live"**: Not "Building" or "Failed"

