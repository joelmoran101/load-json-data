# Authentication Testing Guide

## Demo Credentials

Your backend has the following demo credentials hardcoded:

### 1. Regular User
- **Email:** `demo@example.com`
- **Password:** `demo123`
- **Role:** `user`

### 2. Admin User
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** `admin`

## How to Test Login

### Option 1: Using the Frontend UI (Recommended)

1. **Start your development server** (if not already running):
   ```bash
   cd /Users/joelmoran/Projects/load-json-data
   npm run dev
   ```

2. **Navigate to the AuthTest component** in your app

3. **Click "Use Demo User" or "Use Admin User" buttons**
   - This will automatically fill in the email and password fields
   - Click "Login with Secure Cookies" to authenticate

4. **Verify the login worked:**
   - You should see user information displayed
   - Check browser DevTools → Application → Cookies
   - Look for `authToken` cookie (httpOnly, cannot be read by JS)

### Option 2: Using Browser DevTools

1. Open your app in the browser
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Watch for login success message: `✅ Login successful with secure httpOnly cookies!`
5. Check Application → Cookies to see the `authToken` cookie

### Option 3: Manual Form Entry

Simply type in the credentials manually:
- Email: `demo@example.com`
- Password: `demo123`

## Database Seed Script

If you want to store these users in MongoDB (instead of hardcoded):

### Run the seed script:

```bash
cd /Users/joelmoran/Desktop/json-express-api
npm run db:seed
```

This will:
- Connect to your MongoDB database
- Create/update the demo users with hashed passwords
- Display the credentials in the console

### Update the auth middleware:

After seeding, you'll need to update `middleware/auth.js` to verify credentials against the database instead of using the hardcoded `demoLogin` function.

## How the Authentication Works

### 1. Login Flow
```
Frontend (AuthTest.js)
    ↓
authService.login(email, password)
    ↓
POST /api/auth/login (with CSRF token)
    ↓
Backend validates credentials
    ↓
Backend generates JWT token
    ↓
Backend sets httpOnly cookie
    ↓
Frontend receives user data (NO token exposed)
```

### 2. Cookie Storage
- **Cookie Name:** `authToken`
- **httpOnly:** `true` (JavaScript cannot access it)
- **Secure:** `true` (production only - HTTPS only)
- **SameSite:** `lax` (CSRF protection)
- **Expiration:** 7 days

### 3. Subsequent Requests
All API requests automatically include the cookie:
```javascript
// In src/services/api.js
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true  // Sends cookies automatically
});
```

## Troubleshooting

### Login fails with "Invalid credentials"
- Verify you're using the correct email/password
- Check if backend is running
- Check browser console for errors

### Login succeeds but user info not showing
- Check browser console for errors
- Verify `/api/auth/me` endpoint is working
- Check if cookie is being set (DevTools → Application → Cookies)

### "CSRF validation failed" error
- The frontend should automatically handle CSRF tokens
- Check `src/utils/csrfToken.js` is generating tokens
- Verify `X-CSRF-Token` header is being sent with requests

### Cookie not visible in DevTools
- This is NORMAL - httpOnly cookies are hidden from JavaScript
- Check Network tab → Response Headers → Set-Cookie
- The cookie IS there, just not accessible to JS (security feature)

## Testing Authentication State

### Check if authenticated:
```javascript
const status = await authService.checkAuthStatus();
console.log(status.authenticated); // true/false
console.log(status.user); // user data or null
```

### Get current user:
```javascript
const user = await authService.getCurrentUser();
console.log(user);
```

### Refresh token:
```javascript
const user = await authService.refreshToken();
```

### Logout:
```javascript
await authService.logout();
```

## Security Features

✅ **httpOnly Cookie** - JavaScript cannot access the token (XSS protection)
✅ **Secure Flag** - Cookie only sent over HTTPS in production
✅ **SameSite=Lax** - CSRF protection
✅ **7-day expiration** - Automatic token expiration
✅ **Token refresh** - Extend session without re-login
✅ **CSRF protection** - Double-submit cookie pattern
✅ **No localStorage** - Token never exposed to frontend code

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/logout` | Logout and clear cookie | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| GET | `/api/auth/status` | Check auth status | No |
| POST | `/api/auth/refresh` | Refresh token | Yes |
| GET | `/api/auth/demo-users` | List demo users | Dev only |

## Next Steps

1. **Test the login** using the frontend UI with demo credentials
2. **Verify cookies** are being set in browser DevTools
3. **Test logout** functionality
4. **Test token refresh** by clicking "Refresh Token" button
5. **(Optional)** Run seed script to store users in MongoDB
6. **(Optional)** Implement real user registration/login against database

## Production Considerations

⚠️ **Before deploying to production:**

1. Remove hardcoded credentials from `middleware/auth.js`
2. Implement proper database authentication
3. Use bcrypt to hash passwords
4. Add rate limiting to login endpoint
5. Set up proper JWT_SECRET in environment variables
6. Enable HTTPS (Secure cookie flag)
7. Consider implementing 2FA
8. Add login attempt monitoring
