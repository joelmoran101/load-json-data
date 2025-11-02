# Security Documentation

This document describes the security features and best practices implemented in this application.

## 🔒 Security Architecture

### Overview

This application implements defense-in-depth security with multiple layers:

1. **Secure Authentication** - httpOnly cookies
2. **CSRF Protection** - Double-submit cookie pattern
3. **Environment Isolation** - Separate dev/prod configurations
4. **Secure Data Flow** - Database credentials never exposed to frontend
5. **HTTPS Enforcement** - Production-only secure connections

---

## 🔐 Authentication System

### httpOnly Cookie Authentication

**How it works:**
- User logs in with email/password
- Backend sets httpOnly cookie with session token
- Browser automatically sends cookie with subsequent requests
- Frontend never has direct access to the token

**Benefits:**
- ✅ **XSS Protection** - JavaScript cannot access the token
- ✅ **Automatic Management** - Browser handles cookie storage/transmission
- ✅ **Secure Transmission** - `Secure` flag ensures HTTPS-only in production
- ✅ **CSRF Protection** - Combined with SameSite attribute

**Implementation:**

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,  // Send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Authentication Flow

```
1. User submits login form
   ↓
2. authService.login(email, password)
   ↓
3. POST /api/auth/login
   ↓
4. Backend validates credentials
   ↓
5. Backend sets httpOnly cookie
   ↓
6. Frontend stores user data in React state (NOT localStorage)
   ↓
7. Subsequent requests automatically include cookie
```

### Session Management

**Token Lifecycle:**
- **Creation**: On successful login
- **Refresh**: Automatic or manual via `/auth/refresh`
- **Expiration**: 7 days (configurable on backend)
- **Destruction**: On logout or expiration

**Automatic Session Monitoring:**
```javascript
// Listen for session expiration
window.addEventListener('auth:session-expired', (event) => {
  // Redirect to login
  // Show notification
});
```

---

## 🛡️ CSRF Protection

### Double-Submit Cookie Pattern

This app implements CSRF protection using the double-submit cookie pattern. See [CSRF_IMPLEMENTATION.md](./CSRF_IMPLEMENTATION.md) for complete details.

**Quick Summary:**
1. Random CSRF token generated on app startup
2. Token stored in readable cookie (`XSRF-TOKEN`)
3. Token sent in `X-CSRF-Token` header with state-changing requests
4. Backend validates cookie matches header

**Protected Methods:**
- POST
- PUT
- DELETE
- PATCH

**Safe Methods (no CSRF protection):**
- GET
- HEAD
- OPTIONS

**Files:**
- `src/utils/csrfToken.js` - Token management
- `src/services/api.js` - Automatic header injection
- `src/services/fastApiService.js` - FastAPI client protection
- `src/services/authService.js` - Token lifecycle

---

## 🌍 Environment Variables

### Environment Isolation

Different configurations for development vs production:

**Development (`.env.development`):**
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FASTAPI_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

**Production (`.env.production`):**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_FASTAPI_URL=https://fastapi.yourdomain.com
VITE_ENVIRONMENT=production
```

### Runtime Validation

Environment variables are validated on app startup:

```javascript
// src/utils/envValidation.js
validateEnvironmentVariables({
  VITE_API_BASE_URL: 'Base URL for the JSON Express API',
  VITE_FASTAPI_URL: 'Base URL for the FastAPI server',
  VITE_ENVIRONMENT: 'Application environment'
});
```

**Production Checks:**
- ✅ URLs must use HTTPS
- ✅ No localhost URLs allowed
- ✅ All required variables present

### What NOT to Store in Frontend

❌ **NEVER put these in React app:**
- Database connection strings
- API keys or secrets
- User passwords
- JWT signing secrets

✅ **Safe to include:**
- API endpoint URLs (they're public anyway)
- Application name
- Environment flag (development/production)

**Why?**
- Frontend code is publicly accessible (view source, DevTools)
- Vite bundles env vars directly into JavaScript files
- Anyone can inspect your production bundle

---

## 🔐 Database Security

### Secure Architecture

```
MongoDB Atlas ← Backend APIs ← React Frontend
                   (secured)      (public)
```

**Key Points:**
- MongoDB credentials stored ONLY in backend `.env` files
- React app never connects directly to MongoDB
- Backend validates and sanitizes all requests
- Database connection happens server-side only

### Backend Configuration

**JSON Express API (`.env`):**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=3001
JWT_SECRET=your-secret-key
```

**FastAPI Backend (`.env`):**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
SECRET_KEY=your-secret-key
```

---

## 🔒 CORS Configuration

### Backend Requirements

Both backends must properly configure CORS to allow credentials:

**Express.js:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Requested-With']
}));
```

**FastAPI:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Content-Type", "X-CSRF-Token", "X-Requested-With"]
)
```

**Security Considerations:**
- ⚠️ Never use wildcard (`*`) for `allow_origins` with `credentials: true`
- ✅ Specify exact frontend origin
- ✅ Update for production domains
- ✅ Include CSRF header in allowed headers

---

## 🚀 Production Security Checklist

### Pre-Deployment

- [ ] **HTTPS Everywhere**
  - [ ] Backend APIs use HTTPS
  - [ ] Frontend served over HTTPS
  - [ ] Certificate is valid and not self-signed

- [ ] **Environment Variables**
  - [ ] `.env.production` created with production URLs
  - [ ] All secrets moved to backend
  - [ ] HTTPS validation passes
  - [ ] No hardcoded secrets in code

- [ ] **Authentication**
  - [ ] httpOnly flag enabled on auth cookies
  - [ ] Secure flag enabled in production
  - [ ] SameSite=Lax (or Strict) configured
  - [ ] Token expiration appropriate (7 days default)
  - [ ] Session refresh working

- [ ] **CSRF Protection**
  - [ ] Backend CSRF validation implemented
  - [ ] CSRF tokens generated and validated
  - [ ] CORS properly configured
  - [ ] Test with actual POST/PUT/DELETE requests

- [ ] **Database Security**
  - [ ] MongoDB Atlas IP whitelist configured
  - [ ] Database user has least-privilege permissions
  - [ ] Connection string in backend `.env` only
  - [ ] No database credentials in frontend

- [ ] **Headers & CSP**
  - [ ] HSTS header configured
  - [ ] X-Frame-Options set
  - [ ] Content-Security-Policy header
  - [ ] X-Content-Type-Options: nosniff

- [ ] **Monitoring**
  - [ ] Error logging configured
  - [ ] Security events monitored
  - [ ] Failed login attempts tracked
  - [ ] CSRF validation failures logged

### Post-Deployment

- [ ] Test authentication flow in production
- [ ] Verify HTTPS certificate
- [ ] Test CSRF protection
- [ ] Check for mixed content warnings
- [ ] Review security headers
- [ ] Test from different networks/devices

---

## 🛡️ Additional Security Recommendations

### 1. Content Security Policy (CSP)

Add CSP headers to prevent XSS:

```javascript
// Express.js example
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

### 2. Rate Limiting

Protect authentication endpoints:

```javascript
// Express.js example
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.'
});

app.post('/api/auth/login', loginLimiter, authController.login);
```

### 3. Input Validation

Always validate and sanitize on backend:

```javascript
// Express.js example
const { body, validationResult } = require('express-validator');

app.post('/api/auth/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process login...
  }
);
```

### 4. Secure Cookie Configuration

```javascript
// Backend cookie settings
res.cookie('session', token, {
  httpOnly: true,          // Prevent JavaScript access
  secure: true,            // HTTPS only
  sameSite: 'lax',        // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/',
  domain: '.yourdomain.com' // Subdomain support
});
```

### 5. Regular Security Audits

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically where possible
npm audit fix

# Review manual fixes
npm audit fix --force
```

---

## 🔍 Security Testing

### Manual Tests

**1. Authentication:**
```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Test authenticated request
curl http://localhost:3001/api/charts \
  -b cookies.txt
```

**2. CSRF Protection:**
```bash
# Should fail without CSRF token
curl -X POST http://localhost:3001/api/charts \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Should succeed with CSRF token
curl -X POST http://localhost:3001/api/charts \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-token-here" \
  -d '{"title":"Test"}'
```

### Automated Security Scans

```bash
# OWASP Dependency Check
npm install -g owasp-dependency-check
owasp-dependency-check --scan .

# Snyk security scan
npm install -g snyk
snyk test
```

---

## 📋 Security Incident Response

### If Credentials are Compromised

1. **Immediate Actions:**
   - Rotate all API keys and secrets
   - Revoke all active sessions
   - Change database passwords
   - Update backend `.env` files
   - Restart all services

2. **Investigation:**
   - Review access logs
   - Check for unauthorized access
   - Identify scope of compromise

3. **Prevention:**
   - Review security practices
   - Update documentation
   - Implement additional monitoring

### If XSS Vulnerability Found

1. **Immediate:** Remove vulnerable code
2. **Sanitize:** All user inputs
3. **Implement:** CSP headers
4. **Test:** With security scanner

### If CSRF Attack Detected

1. **Verify:** CSRF protection is enabled
2. **Check:** Backend validation logic
3. **Review:** CORS configuration
4. **Monitor:** Failed CSRF attempts

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CSRF_IMPLEMENTATION.md](./CSRF_IMPLEMENTATION.md) - Detailed CSRF guide

---

## 🆘 Support

For security concerns or questions:
1. Review this documentation
2. Check [CSRF_IMPLEMENTATION.md](./CSRF_IMPLEMENTATION.md) for CSRF-specific issues
3. Review backend security configuration
4. Test with browser DevTools Network tab
