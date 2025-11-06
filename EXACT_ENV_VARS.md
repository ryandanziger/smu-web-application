# Exact Environment Variables to Set

## Frontend Environment Variables

**Service**: Frontend Static Site (`smu-web-application-1`)

**Environment Tab** → Add/Update:

```
REACT_APP_API_URL=https://smu-web-application.onrender.com
```

**Important**: 
- No trailing slash
- Must be exactly: `https://smu-web-application.onrender.com`

---

## Backend Environment Variables

**Service**: Backend Web Service (`smu-web-application`)

**Environment Tab** → Add/Update:

```
CORS_ORIGIN=https://smu-web-application-1.onrender.com
```

**Important**:
- No trailing slash
- Must be exactly: `https://smu-web-application-1.onrender.com`
- This is your frontend URL

---

## Steps to Fix

1. **Frontend**:
   - Go to `smu-web-application-1` service
   - Environment tab
   - Set: `REACT_APP_API_URL=https://smu-web-application.onrender.com`
   - Save

2. **Backend**:
   - Go to `smu-web-application` service
   - Environment tab
   - Set: `CORS_ORIGIN=https://smu-web-application-1.onrender.com`
   - Save

3. **Redeploy Both**:
   - Frontend: Manual Deploy → Deploy latest commit
   - Backend: Manual Deploy → Deploy latest commit
   - Wait 3-5 minutes

4. **Test**:
   - Open: `https://smu-web-application-1.onrender.com`
   - Open browser console (F12)
   - Try to login
   - Should see: "Fetching professors from: https://smu-web-application.onrender.com/api/professors"

---

## Summary

✅ Frontend `REACT_APP_API_URL` = `https://smu-web-application.onrender.com`
✅ Backend `CORS_ORIGIN` = `https://smu-web-application-1.onrender.com`

