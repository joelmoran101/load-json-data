# CSRF Protection Implementation

## Overview

This document describes the CSRF (Cross-Site Request Forgery) protection implementation using the **double-submit cookie pattern** in this React application.

## What is CSRF?

CSRF is an attack where a malicious website tricks a user's browser into making unwanted requests to your application while the user is authenticated. Without CSRF protection, an attacker could:
- Transfer funds
- Change passwords
- Delete data
- Perform any state-changing action on behalf of the authenticated user

## How Our CSRF Protection Works

### Double-Submit Cookie Pattern

1. **Token Generation**: A random CSRF token is generated on app initialization
2. **Cookie Storage**: Token is stored in a readable cookie (`XSRF-TOKEN`)
3. **Header Transmission**: Token is sent in `X-CSRF-Token` header with state-changing requests
4. **Backend Validation**: Backend compares cookie value with header value

### Why This is Secure

- **Same-Origin Policy**: Attacker sites cannot read cookies from your domain
- **Custom Headers**: Attacker sites cannot set custom headers on cross-origin requests
- **Simple Requests**: CORS prevents simple requests with custom headers from attacker origins

## Implementation Details

### Frontend Components

#### 1. CSRF Token Utility (`src/utils/csrfToken.js`)

**Key Functions:**
```javascript
initializeCSRFToken()   // Initialize token on app startup
getCSRFToken()          // Get current token for requests
refreshCSRFToken()      // Generate new token (after login)
clearCSRFToken()        // Remove token (on logout)
requiresCSRFProtection() // Check if method needs CSRF
```

**Token Properties:**
- 64-character hex string (256 bits of entropy)
- Generated using `crypto.getRandomValues()`
- Stored in `XSRF-TOKEN` cookie
- 24-hour expiration
- `SameSite=Lax` attribute
- `Secure` flag in production

#### 2. API Service Integration

**JSON Express API (`src/services/api.js`):**
- Request interceptor adds `X-CSRF-Token` header to POST/PUT/DELETE/PATCH requests
- Token automatically included for all state-changing operations

**FastAPI Service (`src/services/fastApiService.js`):**
- Same CSRF protection applied
- Works identically for FastAPI backend

#### 3. Authentication Service (`src/services/authService.js`)

**Token Lifecycle:**
- **Login**: Refresh token after successful authentication
- **Logout**: Clear token on logout (success or failure)
- **Token Refresh**: Generate new CSRF token when auth token refreshes

### Protected Request Types

CSRF protection is applied to:
- ✅ POST requests
- ✅ PUT requests  
- ✅ DELETE requests
- ✅ PATCH requests

Safe methods (no CSRF protection needed):
- ⬜ GET requests (should be read-only)
- ⬜ HEAD requests
- ⬜ OPTIONS requests
- ⬜ TRACE requests

## Backend Requirements

### Express.js Backend Implementation

Your `json-express-api` backend needs to:

```javascript
const cookieParser = require('cookie-parser');

// 1. Enable cookie parser
app.use(cookieParser());

// 2. CSRF validation middleware
const validateCSRF = (req, res, next) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies['XSRF-TOKEN'];
  const headerToken = req.headers['x-csrf-token'];
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }
  
  next();
};

// 3. Apply to protected routes
app.use('/api', validateCSRF);

// 4. Set CSRF cookie on first request (optional - frontend does this)
app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  res.json({ success: true });
});
```

### FastAPI Backend Implementation

Your `fastAPI-backend` needs to:

```python
from fastapi import FastAPI, Request, HTTPException, Cookie
from fastapi.responses import JSONResponse

app = FastAPI()

# CSRF validation dependency
async def validate_csrf(
    request: Request,
    xsrf_token: str = Cookie(None, alias="XSRF-TOKEN"),
    x_csrf_token: str = Header(None, alias="X-CSRF-Token")
):
    # Skip for safe methods
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        return
    
    if not xsrf_token or not x_csrf_token or xsrf_token != x_csrf_token:
        raise HTTPException(
            status_code=403,
            detail="Invalid CSRF token"
        )

# Apply to protected routes
@app.post("/plotly/", dependencies=[Depends(validate_csrf)])
async def create_chart(chart: ChartCreate):
    # Your logic here
    pass

# Optional: Endpoint to set CSRF cookie
@app.get("/csrf-token")
async def get_csrf_token():
    token = secrets.token_hex(32)
    response = JSONResponse({"success": True})
    response.set_cookie(
        key="XSRF-TOKEN",
        value=token,
        httponly=False,  # Must be readable by JavaScript
        secure=True,     # HTTPS only in production
        samesite="lax",
        max_age=86400    # 24 hours
    )
    return response
```

## CORS Configuration

Both backends must allow credentials:

**Express.js:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Requested-With']
}));
```

**FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Content-Type", "X-CSRF-Token", "X-Requested-With"]
)
```

## Testing CSRF Protection

### Manual Testing

**1. Check token initialization:**
```javascript
// Open browser console
document.cookie // Should see XSRF-TOKEN
```

**2. Test protected request:**
```javascript
// In browser console
fetch('http://localhost:3001/api/some-endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': 'WRONG_TOKEN'
  },
  body: JSON.stringify({data: 'test'})
})
// Should receive 403 Forbidden
```

**3. Check logs in development:**
- Look for: `🔒 CSRF token initialized`
- Look for: `🔒 CSRF token added to POST request`

### Automated Testing

Create test file `src/utils/csrfToken.test.js`:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCSRFToken,
  requiresCSRFProtection,
  getCSRFTokenFromCookie
} from './csrfToken';

describe('CSRF Token Utilities', () => {
  it('generates 64-character hex token', () => {
    const token = generateCSRFToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('identifies methods requiring CSRF protection', () => {
    expect(requiresCSRFProtection('POST')).toBe(true);
    expect(requiresCSRFProtection('PUT')).toBe(true);
    expect(requiresCSRFProtection('DELETE')).toBe(true);
    expect(requiresCSRFProtection('GET')).toBe(false);
    expect(requiresCSRFProtection('HEAD')).toBe(false);
  });
});
```

## Security Considerations

### ✅ Strengths

1. **Defense in Depth**: Combines with httpOnly cookies and SameSite
2. **Simple Implementation**: No server-side session storage needed
3. **Framework Agnostic**: Works with any backend
4. **Automatic**: Developers don't manually add tokens

### ⚠️ Limitations

1. **Subdomain Attacks**: Vulnerable if attacker controls a subdomain
2. **XSS Still Dangerous**: If attacker can execute JS, they can read the cookie
3. **Cookie Dependency**: Requires cookies to be enabled

### 🛡️ Additional Recommendations

1. **Use HTTPS**: Always in production (enforced by Secure flag)
2. **Set SameSite=Strict**: For maximum protection (currently Lax for compatibility)
3. **Short Token Lifetime**: Current 24 hours, consider reducing
4. **Monitor Failed Attempts**: Log and alert on CSRF validation failures
5. **Content Security Policy**: Add CSP headers to prevent XSS
6. **Regular Token Rotation**: Rotate on sensitive operations

## Production Checklist

Before deploying to production:

- [ ] Backend CSRF validation implemented and tested
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configured with specific origins (no wildcards)
- [ ] Cookie `Secure` flag enabled in production
- [ ] Consider `SameSite=Strict` if compatible with your use case
- [ ] CSRF validation errors logged for monitoring
- [ ] Rate limiting enabled to prevent brute force
- [ ] CSP headers configured
- [ ] Regular security audits scheduled

## Troubleshooting

### Issue: "Invalid CSRF token" errors

**Possible Causes:**
1. Backend not reading `XSRF-TOKEN` cookie
2. Backend expecting different header name
3. CORS not allowing credentials
4. Cookie not being set (check browser dev tools)

**Solutions:**
- Verify `withCredentials: true` in axios config
- Check backend CORS allows credentials
- Ensure cookie name matches (`XSRF-TOKEN`)
- Check header name matches (`X-CSRF-Token`)

### Issue: Token not being sent with requests

**Possible Causes:**
1. Token not initialized on app startup
2. Request method is safe (GET/HEAD)
3. Cookie expired or was cleared

**Solutions:**
- Check `initializeCSRFToken()` called in `src/index.js`
- Verify cookie exists in browser dev tools
- Check console for initialization logs in dev mode

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

## Support

For questions or issues with CSRF implementation:
1. Check browser console for debug logs (development mode)
2. Verify backend validation is implemented correctly
3. Review this document's troubleshooting section
4. Check network tab to confirm tokens are being sent
