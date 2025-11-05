# Fix for Frontend Refresh Issue on Render

## The Problem
When you refresh a page (like `/dashboard` or `/evaluation-selection`), you get a 404 because the server tries to find that route, but React Router handles routing client-side.

## The Solution

For Render static sites, you need to configure it to serve `index.html` for all routes.

### Option 1: Using _redirects file (Already Created)
I've created `peer-eval-system/frontend-clean/public/_redirects` with:
```
/*    /index.html   200
```

This file will be included in your build and Render will use it.

### Option 2: Manual Configuration in Render Dashboard
1. Go to your **frontend static site** in Render
2. Go to **Settings** → **Redirects/Rewrites**
3. Add a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Status Code**: `200`

### Option 3: Update Build Output
If the above doesn't work, you can also set this in Render's build settings:
- In your static site settings, ensure **"Publish Directory"** is: `peer-eval-system/frontend-clean/build`

## After Making Changes
1. Commit and push the `_redirects` file to GitHub
2. Render will auto-deploy
3. Test by refreshing a route like `/dashboard`

