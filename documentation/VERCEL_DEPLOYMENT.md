# Vercel Deployment Configuration

## Current Setup

- **Frontend:** https://load-json-data.vercel.app
- **Backend:** https://json-express-api.vercel.app

## ⚠️ Cross-Domain Cookie Issue

Cookies (including httpOnly auth cookies and CSRF tokens) **don't work across different domains**, even with CORS configured. This is a browser security feature.

### Current Problem:
- Backend sets cookies for `json-express-api.vercel.app`
- Frontend on `load-json-data.vercel.app` cannot read/send those cookies
- Result: CSRF validation fails, authentication doesn't work

## Solutions

### Option 1: Use Custom Domain (RECOMMENDED)

Deploy both frontend and backend under the same domain:

1. **Buy a domain** (e.g., `yourdomain.com`)
2. **Configure Vercel:**
   - Frontend: `app.yourdomain.com` or `yourdomain.com`
   - Backend: `api.yourdomain.com`
3. **Update cookie domain:**
   - Backend: Set cookie domain to `.yourdomain.com` (note the leading dot)
   - This allows cookies to work across subdomains

#### Backend Cookie Configuration:
```javascript
// In json-express-api/middleware/auth.js
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  domain: '.yourdomain.com',  // Add this
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

### Option 2: Proxy Backend Through Frontend (QUICK FIX)

Make the backend appear to be on the same domain as frontend:

1. **Update frontend `.env.production`:**
```bash
# Instead of direct backend URL
VITE_API_BASE_URL=/api
```

2. **Create `vercel.json` in frontend project:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://json-express-api.vercel.app/api/:path*"
    }
  ]
}
```

This makes requests to `load-json-data.vercel.app/api/*` proxy to the backend, keeping everything same-domain.

### Option 3: Deploy as Monorepo

Combine frontend and backend in one Vercel project with multiple deployments.

## Quick Implementation: Proxy Setup

Let me implement Option 2 (proxy) for you:

### Step 1: Create vercel.json in frontend

See the `vercel.json` file created in your project root.

### Step 2: Update .env.production

```bash
# Use relative path - Vercel will proxy to backend
VITE_API_BASE_URL=/api
VITE_ENVIRONMENT=production
VITE_APP_NAME=Financial Data Tracker
```

### Step 3: Deploy frontend

```bash
npm run build
vercel --prod
```

### Step 4: Test

Visit https://load-json-data.vercel.app and try logging in with:
- Email: `demo@example.com`
- Password: `demo123`

## How Proxy Fixes the Issue

**Without Proxy:**
```
Browser → https://load-json-data.vercel.app (frontend)
       → https://json-express-api.vercel.app (backend - different domain!)
       ❌ Cookies blocked
```

**With Proxy:**
```
Browser → https://load-json-data.vercel.app (frontend)
       → https://load-json-data.vercel.app/api/* (same domain)
       → Vercel proxies to https://json-express-api.vercel.app
       ✅ Cookies work!
```

## Backend Environment Variables

Your backend on Vercel should have:

```bash
# In json-express-api Vercel environment variables
CORS_ORIGIN=https://load-json-data.vercel.app,http://localhost:5173
NODE_ENV=production
JWT_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
```

To update Vercel environment variables:
1. Go to https://vercel.com
2. Select your backend project (json-express-api)
3. Settings → Environment Variables
4. Add/Update the variables above

## Testing Locally with Production Backend

If you want to test locally against production backend, you have two options:

### Option A: Use Vite Proxy (Development)

Update `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://json-express-api.vercel.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});
```

Then use `.env.development`:
```bash
VITE_API_BASE_URL=/api
```

### Option B: Run Backend Locally

```bash
cd /Users/joelmoran/Desktop/json-express-api
npm run dev
```

Then use:
```bash
VITE_API_BASE_URL=http://localhost:3001/api
```

## Troubleshooting

### CSRF Still Failing

1. **Check cookies in DevTools:**
   - Open DevTools → Application → Cookies
   - Look for `XSRF-TOKEN` cookie
   - Check the domain - should match your frontend domain

2. **Check Network tab:**
   - Look at the request headers
   - Should see `X-CSRF-Token` header
   - Should see `Cookie` header with `XSRF-TOKEN`

3. **Check CORS:**
   - Response should have `Access-Control-Allow-Credentials: true`
   - Response should have `Access-Control-Allow-Origin` matching frontend URL

### Authentication Not Working

1. **Check authToken cookie:**
   - Should have `httpOnly`, `Secure`, `SameSite=Lax`
   - Domain should match

2. **Check backend logs:**
   - Vercel dashboard → your backend project → Logs
   - Look for authentication errors

## Next Steps

1. ✅ Create `vercel.json` with proxy configuration
2. ✅ Update `.env.production` to use `/api`
3. ✅ Deploy frontend: `vercel --prod`
4. ✅ Test login with demo credentials
5. (Optional) Buy custom domain for cleaner URLs
