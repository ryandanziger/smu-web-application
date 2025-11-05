# Render.com Deployment Guide - Step by Step

This guide will walk you through deploying your SMU Peer Evaluation app to Render.com using GitHub.

## Prerequisites

1. ✅ GitHub account
2. ✅ Render.com account (sign up at https://render.com)
3. ✅ Code pushed to GitHub repository
4. ✅ PostgreSQL database (you can use your existing DigitalOcean database or create a new one on Render)

---

## Step 1: Prepare Your GitHub Repository

### 1.1 Push Your Code to GitHub

If you haven't already:

```bash
cd /Users/ryandanziger/Desktop/smu-web-application
git init  # if not already a git repo
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 1.2 Verify .gitignore

Make sure your `.gitignore` includes:
- `node_modules/`
- `.env`
- `*.log`
- `uploads/`
- `.DS_Store`

**IMPORTANT**: Never commit `.env` files with database credentials!

---

## Step 2: Create PostgreSQL Database on Render (Optional)

If you want to use Render's PostgreSQL instead of your DigitalOcean database:

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - **Name**: `smu-peer-eval-db` (or your choice)
   - **Database**: `smu_peer_eval` (or your choice)
   - **User**: `smu_user` (or your choice)
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: Latest
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (you'll need this later)

**OR** use your existing DigitalOcean database - just use its connection string.

---

## Step 3: Deploy Backend Service

### 3.1 Create Backend Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** (if not already connected)
4. Authorize Render to access your repositories
5. Select your repository: `smu-web-application`

### 3.2 Configure Backend

**Basic Settings:**
- **Name**: `smu-peer-eval-backend`
- **Region**: Choose closest to you
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave blank (we'll handle this in build commands)
- **Runtime**: `Node`
- **Build Command**: 
  ```
  cd peer-eval-system/backend && npm install
  ```
- **Start Command**: 
  ```
  cd peer-eval-system/backend && node server.js
  ```

**Environment Variables:**
Click **"Advanced"** → **"Add Environment Variable"** and add:

```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=25060
PORT=3001
CORS_ORIGIN=https://smu-peer-eval-frontend.onrender.com
```

**Note**: Replace the database values with your actual PostgreSQL credentials.
The `CORS_ORIGIN` will be your frontend URL (we'll update this after deploying frontend).

### 3.3 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (usually 2-5 minutes)
3. Once deployed, copy your backend URL (e.g., `https://smu-peer-eval-backend.onrender.com`)

---

## Step 4: Deploy Frontend Service

### 4.1 Create Static Site

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select your repository: `smu-web-application`

### 4.2 Configure Frontend

**Basic Settings:**
- **Name**: `smu-peer-eval-frontend`
- **Branch**: `main`
- **Build Command**: 
  ```
  cd peer-eval-system/frontend-clean && npm install && npm run build
  ```
- **Publish Directory**: 
  ```
  peer-eval-system/frontend-clean/build
  ```

**Environment Variables:**
Click **"Add Environment Variable"** and add:

```
REACT_APP_API_URL=https://smu-peer-eval-backend.onrender.com
```

**Replace `https://smu-peer-eval-backend.onrender.com` with your actual backend URL from Step 3.3**

### 4.3 Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for deployment (usually 2-3 minutes)
3. Copy your frontend URL (e.g., `https://smu-peer-eval-frontend.onrender.com`)

---

## Step 5: Update CORS in Backend

After deploying the frontend, update the backend's `CORS_ORIGIN` environment variable:

1. Go to your backend service in Render dashboard
2. Go to **"Environment"** tab
3. Find `CORS_ORIGIN` variable
4. Click **"Edit"** and update to your frontend URL:
   ```
   https://smu-peer-eval-frontend.onrender.com
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy with the new environment variable

---

## Step 6: Verify Deployment

1. Visit your frontend URL
2. Try logging in
3. Check that API calls work (open browser console to see any errors)

---

## Troubleshooting

### Backend won't start
- Check build logs in Render dashboard
- Verify all environment variables are set
- Check that `package.json` has `"start": "node server.js"` script

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is set correctly
- Verify `CORS_ORIGIN` in backend matches frontend URL exactly
- Check browser console for CORS errors

### Database connection errors
- Verify all database environment variables are correct
- Check that your database allows connections from Render's IPs
- For DigitalOcean database, ensure firewall allows Render's IPs

### 404 errors
- Verify `Publish Directory` is set to `peer-eval-system/frontend-clean/build`
- Check that `npm run build` completed successfully

---

## Quick Reference: Environment Variables

### Backend (.env equivalent):
```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=25060
PORT=3001
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

---

## Cost

- **Free Tier**: 
  - Backend: Free (spins down after 15 min inactivity)
  - Frontend: Free
  - PostgreSQL: Free (limited to 90 days, then $7/month)

- **Paid Plans**: 
  - $7/month for always-on backend
  - $7/month for persistent PostgreSQL

---

## Next Steps

1. ✅ Test all functionality
2. ✅ Set up custom domain (optional)
3. ✅ Enable SSL (automatic on Render)
4. ✅ Monitor logs in Render dashboard

---

## Need Help?

- Render Docs: https://render.com/docs
- Render Support: Available in dashboard

