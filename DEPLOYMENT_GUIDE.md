# Deployment Guide - Fastest Options

## Option 1: Render.com (Recommended - Easiest)
**Deploy both frontend and backend on Render.com**

### Backend Setup (Render):
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Name**: `smu-peer-eval-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd peer-eval-system/backend && npm install`
   - **Start Command**: `cd peer-eval-system/backend && node server.js`
   - **Root Directory**: Leave blank (or set to `peer-eval-system/backend`)
5. Add Environment Variables:
   - `PORT` (Render provides this automatically, but you can set to 3001)
   - `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
   - Add CORS origin: `CORS_ORIGIN` = your frontend URL
6. Deploy!

### Frontend Setup (Render):
1. Click "New +" → "Static Site"
2. Connect your GitHub repo
3. Settings:
   - **Name**: `smu-peer-eval-frontend`
   - **Build Command**: `cd peer-eval-system/frontend-clean && npm install && npm run build`
   - **Publish Directory**: `peer-eval-system/frontend-clean/build`
4. Add Environment Variable:
   - `REACT_APP_API_URL` = your backend URL (e.g., `https://smu-peer-eval-backend.onrender.com`)
5. Deploy!

---

## Option 2: Vercel (Frontend) + Railway (Backend) - Fastest
**Vercel is fastest for React, Railway is easy for Node.js**

### Backend on Railway:
1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Railway auto-detects Node.js
5. Add Environment Variables:
   - `PORT` = 3000 (Railway sets this automatically)
   - `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT`
   - `CORS_ORIGIN` = your Vercel frontend URL
6. Set Root Directory: `peer-eval-system/backend`
7. Deploy!

### Frontend on Vercel:
1. Go to https://vercel.com and sign up with GitHub
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Settings:
   - **Framework Preset**: React
   - **Root Directory**: `peer-eval-system/frontend-clean`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   - `REACT_APP_API_URL` = your Railway backend URL
6. Deploy! (takes ~2 minutes)

---

## Option 3: DigitalOcean App Platform
**If you already have DigitalOcean account**

1. Go to https://cloud.digitalocean.com/apps
2. Create App → GitHub
3. Add Components:
   - **Backend**: Web Service
     - Source: `peer-eval-system/backend`
     - Build Command: `npm install`
     - Run Command: `node server.js`
   - **Frontend**: Static Site
     - Source: `peer-eval-system/frontend-clean`
     - Build Command: `npm install && npm run build`
     - Output Directory: `build`
4. Add environment variables for both
5. Deploy!

---

## Required Changes Before Deployment

### 1. Update Backend CORS
Update `server.js` to allow production frontend URL:

```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
```

### 2. Update Frontend API URL
Update all API calls to use environment variable:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

Then replace all `http://localhost:3001` with `${API_URL}`

### 3. Add Start Script to Backend
Update `peer-eval-system/backend/package.json`:

```json
"scripts": {
  "start": "node server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### 4. Database
- Use your existing PostgreSQL database (DigitalOcean Managed Database)
- Or create a new one on Render/Railway/Supabase

---

## Quick Checklist

- [x] Update backend CORS to accept production frontend URL ✅ DONE
- [x] Replace hardcoded `localhost:3001` with environment variable in frontend ✅ DONE
- [x] Add `start` script to backend package.json ✅ DONE
- [ ] Ensure `.env` files are NOT committed to Git
- [ ] Set all environment variables in deployment platform
- [ ] Test locally with production-like environment variables

## ✅ Pre-Deployment Changes Completed

I've already made these changes for you:
1. ✅ Backend CORS now uses `process.env.CORS_ORIGIN`
2. ✅ Frontend uses `config.js` with `REACT_APP_API_URL` environment variable
3. ✅ All API calls updated to use the config
4. ✅ Backend has `start` script in package.json

---

## Estimated Time
- **Render.com**: 15-20 minutes (both services)
- **Vercel + Railway**: 10-15 minutes (fastest)
- **DigitalOcean**: 20-25 minutes

