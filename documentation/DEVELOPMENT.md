# Development Documentation

This document contains development notes, troubleshooting guides, and best practices for working with this codebase.

---

## 🤖 AI-Assisted Development

### Overview

This React app was built with the help of AI tools, primarily Warp AI in VS Code, along with other AI assistants for code review and validation.

### AI Tools Used

- **Warp AI** - Primary co-pilot
- **ChatGPT / Claude / DeepSeek** - Code review and documentation
- **GitHub Copilot** - Code suggestions
- **Windsurf / Cursor** - Code explanations

---

## ⚠️ Challenges with AI Coding

### 1. Outdated Frameworks

**Problem:**
- AI may suggest deprecated or unmaintained frameworks
- Example: This app was initially built with Create React App (CRA), which is deprecated

**Solution:**
- ✅ Always verify framework/library status
- ✅ Check official documentation for deprecation notices
- ✅ Cross-reference with current best practices
- ✅ This project migrated from CRA to Vite for this reason

### 2. False Confidence Risk

**Problem:**
- AI-generated code may run but not be correct
- "It works" doesn't mean "it's secure" or "it's optimal"

**Example:**
```javascript
// AI might suggest this (works but insecure)
localStorage.setItem('token', response.data.token);

// Better approach (secure)
// Server sets httpOnly cookie automatically
// Frontend never touches the token directly
```

### 3. Inconsistent Code Quality

**Problem:**
- AI-generated code can be clean in one place, messy in another
- Difficult to maintain consistent patterns

**Solution:**
- ✅ Establish coding standards early
- ✅ Use linters (ESLint, Prettier)
- ✅ Review all AI suggestions before accepting
- ✅ Refactor for consistency

### 4. Hard to Debug

**Problem:**
- AI-generated code can be difficult to understand
- May not know *why* it works

**Solution:**
- ✅ Ask AI to explain the code
- ✅ Use "Generate Docstring" features
- ✅ Add comments for complex logic
- ✅ Break down large AI-generated functions

---

## ✅ Best Practices for AI Coding

### Before Accepting AI Code

Ask yourself:
1. **Do I understand what this code does?**
2. **Does this follow best practices?**
3. **Are there security implications?**
4. **Is this maintainable?**
5. **Does it fit the existing architecture?**

### Validation Checklist

- [ ] Cross-reference with official documentation
- [ ] Run security checks (`npm audit`)
- [ ] Test the code thoroughly
- [ ] Review for outdated patterns
- [ ] Check for hardcoded values
- [ ] Verify error handling
- [ ] Ensure proper types/validation

### Use AI Prompts Effectively

**Good Prompts:**
```
"Explain how this authentication flow works step-by-step"
"Check this code for potential security vulnerabilities"
"Why does this approach work better than [alternative]?"
"What are the trade-offs of this implementation?"
```

**Poor Prompts:**
```
"Write a login system" (too vague)
"Make it work" (no context)
"Fix this" (no explanation of the issue)
```

---

## 🛠️ Development Setup

### Prerequisites

```bash
# Check versions
node --version  # Should be 16+
npm --version   # Should be 7+
git --version
```

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd load-json-data

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.development

# Start development server
npm run dev
```

### Backend Setup

**MongoDB Atlas:**
## Make sure that MOngoDB Atlas is running and includes your current IP address

**JSON Express API:**
```bash
# In separate terminal
cd /path/to/json-express-api
npm install
npm run dev
or
node app.js
```

**FastAPI Backend:**
```bash
# In separate terminal
cd /path/to/fastAPI-backend
pip install -r requirements.txt
python3 run.py
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Network Error" / Cannot Connect to Backend

**Symptoms:**
```
API Error: Network Error
ERR_CONNECTION_REFUSED
```

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Backend not running | Start backend with `npm run dev` or `node app.js` and `python3 run.py` |
| Wrong port | Check `.env` file has correct port (3001 for Express, 8000 for FastAPI) |
| MongoDB Atlas is not running | Start / LogIn MongoDB Atlas - make sure that the current IP address is included in the list |
| CORS issues | Verify backend CORS config allows `localhost:5173` |
| Firewall blocking | Check firewall settings, allow local connections |

**Quick Check:**
```bash
# Test if backend is responding
curl http://localhost:3001/api/health
curl http://localhost:8000/health
```

#### 2. MongoDB Connection Issues

**Symptoms:**
```
MongoServerError: bad auth
MongoNetworkError: connection refused
```

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Cluster paused | Wake up MongoDB Atlas cluster |
| IP not whitelisted | Add current IP to MongoDB Atlas Network Access |
| Invalid credentials | Check `MONGODB_URI` in backend `.env` |
| Network issues | Check internet connection |

**Quick Check:**
```bash
# In backend directory
echo $MONGODB_URI  # Verify connection string is set
```

#### 3. CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**

Backend must allow frontend origin:

**Express.js:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**FastAPI:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True
)
```

#### 4. Environment Variables Not Loading

**Symptoms:**
```
undefined
VITE_API_BASE_URL is undefined
```

**Solutions:**

1. **Check file exists:**
   ```bash
   ls -la .env.development
   ```

2. **Verify variable names start with `VITE_`:**
   ```bash
   # ❌ Wrong
   API_URL=http://localhost:3001
   
   # ✅ Correct
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

3. **Restart dev server after changing .env:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev  # Restart
   ```

#### 5. CSRF Token Errors

**Symptoms:**
```
403 Forbidden
Invalid CSRF token
```

**Solutions:**

1. **Check token exists:**
   ```javascript
   // Browser console
   document.cookie  // Should see XSRF-TOKEN
   ```

2. **Verify backend validation:**
   - Backend must read `XSRF-TOKEN` cookie
   - Backend must check `X-CSRF-Token` header
   - Both must match

3. **Check CORS allows credentials:**
   ```javascript
   // Frontend
   withCredentials: true
   
   // Backend
   credentials: true
   ```

#### 6. Module Not Found Errors

**Symptoms:**
```
Cannot find module 'axios'
Module not found: Can't resolve './Component'
```

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check import paths:**
   ```javascript
   // ❌ Wrong
   import Component from './components/Component'
   
   // ✅ Correct
   import Component from './components/Component.js'
   ```

3. **Verify file exists:**
   ```bash
   ls -la src/components/Component.js
   ```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

**Component Test Example:**
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading Component', () => {
  it('renders loading message', () => {
    render(<Loading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

**Service Test Example:**
```javascript
import { describe, it, expect, vi } from 'vitest';
import { getCSRFToken } from '../utils/csrfToken';

describe('CSRF Token', () => {
  it('generates valid token', () => {
    const token = getCSRFToken();
    expect(token).toHaveLength(64);
    expect(token).toMatch(/^[0-9a-f]+$/);
  });
});
```

---

## 🎨 Code Style & Standards

### ESLint Configuration

```bash
# Run linter
npm run lint

# Fix automatically
npm run lint -- --fix
```

### Prettier Configuration

```bash
# Format all files
npx prettier --write "src/**/*.{js,jsx,json,css,md}"
```

### Naming Conventions

**Files:**
- Components: `PascalCase.js` (e.g., `ChartSelector.js`)
- Services: `camelCase.js` (e.g., `authService.js`)
- Hooks: `useCamelCase.js` (e.g., `useChartData.js`)
- Utils: `camelCase.js` (e.g., `csrfToken.js`)

**Variables:**
- Constants: `UPPER_SNAKE_CASE`
- React components: `PascalCase`
- Functions/variables: `camelCase`
- Private functions: `_camelCase` (prefix with underscore)

---

## 🚀 Common Development Tasks

### Adding a New API Endpoint

1. **Create service method:**
   ```javascript
   // src/services/api.js
   export const getNewData = async () => {
     const response = await api.get('/new-endpoint');
     return response.data;
   };
   ```

2. **Create custom hook (optional):**
   ```javascript
   // src/hooks/useNewData.js
   export const useNewData = () => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(false);
     
     useEffect(() => {
       const fetchData = async () => {
         setLoading(true);
         const result = await getNewData();
         setData(result);
         setLoading(false);
       };
       fetchData();
     }, []);
     
     return { data, loading };
   };
   ```

3. **Use in component:**
   ```javascript
   const MyComponent = () => {
     const { data, loading } = useNewData();
     
     if (loading) return <Loading />;
     return <div>{/* Render data */}</div>;
   };
   ```

### Adding a New Component

1. **Create component file:**
   ```javascript
   // src/components/NewComponent.js
   import React from 'react';
   import './NewComponent.css';
   
   const NewComponent = ({ prop1, prop2 }) => {
     return (
       <div className="new-component">
         {/* Component content */}
       </div>
     );
   };
   
   export default NewComponent;
   ```

2. **Create CSS file:**
   ```css
   /* src/components/NewComponent.css */
   .new-component {
     /* Styles */
   }
   ```

3. **Import and use:**
   ```javascript
   import NewComponent from './components/NewComponent';
   
   <NewComponent prop1="value" prop2={data} />
   ```

### Adding Filtering Logic

1. **Extract filter values:**
   ```javascript
   const { availableFilters } = useMemo(() => {
     if (!chartData?.data) return { availableFilters: [] };
     
     const filters = chartData.data.map(trace => ({
       name: trace.name,
       type: trace.type
     }));
     
     return { availableFilters: filters };
   }, [chartData]);
   ```

2. **Create filter state:**
   ```javascript
   const [selectedFilters, setSelectedFilters] = useState([]);
   ```

3. **Apply filter:**
   ```javascript
   const filteredData = useMemo(() => {
     if (!selectedFilters.length) return chartData;
     
     return {
       ...chartData,
       data: chartData.data.filter(trace =>
         selectedFilters.includes(trace.name)
       )
     };
   }, [chartData, selectedFilters]);
   ```

### Debugging Tips

**1. Use Browser DevTools:**
```javascript
// Add breakpoint in code
debugger;

// Console logging
console.log('Data:', data);
console.table(arrayData);
console.dir(objectData);
```

**2. React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state
- Track component renders

**3. Network Tab:**
- Check request/response
- Verify headers (CSRF token, cookies)
- Check status codes

**4. Application Tab:**
- Inspect cookies
- Check localStorage/sessionStorage
- Verify service workers

---

## 📊 Performance Optimization

### Current Optimizations

1. **Code Splitting** - Automatic with Vite
2. **Lazy Loading** - Charts load on demand
3. **Memoization** - `useMemo` for expensive calculations
4. **Client-Side Filtering** - No server round-trips

### Monitoring Performance (AI recommendation; not yet tried)

```javascript
// Use React Profiler
import { Profiler } from 'react';

const onRender = (id, phase, actualDuration) => {
  console.log(`${id} took ${actualDuration}ms`);
};

<Profiler id="ChartViewer" onRender={onRender}>
  <ChartViewer />
</Profiler>
```

### Performance Tips (AI recommendation; not yet tried)

1. **Avoid unnecessary re-renders:**
   ```javascript
   const MemoizedComponent = React.memo(Component);
   ```

2. **Debounce user input:**
   ```javascript
   const debouncedSearch = useMemo(
     () => debounce(handleSearch, 300),
     []
   );
   ```

3. **Optimize Plotly charts:**
   ```javascript
   // Reduce data points for large datasets
   const optimizedData = largeDataset.filter((_, i) => i % 10 === 0);
   ```

---

## 🔄 Migration Notes

### CRA to Vite Migration

**Key Changes:**
1. `process.env` → `import.meta.env`
2. `REACT_APP_` → `VITE_` prefix
3. `index.html` moved to root
4. New dev server (faster!)

**Benefits:**
- ⚡ 10x faster dev server startup
- 🔥 Instant HMR
- 📦 Better production builds
- 🎯 Native ESM support

---

## 📝 Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Merge to main (after testing)
git checkout main
git merge feature/new-feature
git push origin main
```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat: Add CSRF protection with double-submit pattern

- Implement csrfToken utility
- Update API services with interceptors
- Add token lifecycle management in authService

Closes #123
```

---

## 🆘 Getting Help

### Resources

1. **Official Docs:**
   - [React](https://react.dev/)
   - [Vite](https://vitejs.dev/)
   - [Plotly.js](https://plotly.com/javascript/)

2. **AI Assistants:**
   - Use "Explain this code" prompts
   - Ask for documentation
   - Request best practices

3. **Debugging:**
   - Check browser console
   - Review network requests
   - Inspect component state

4. **Code Comments:**
   - Each module has inline documentation
   - Use AI to generate docstrings

---

## 📚 Learning Resources

### Recommended Reading

- **Security:** [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- **React Patterns:** [React Patterns](https://reactpatterns.com/)
- **Vite Guide:** [Vite Documentation](https://vitejs.dev/guide/)
- **CSRF:** [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

### Project-Specific Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [SECURITY.md](./SECURITY.md) - Security features
- [CSRF_IMPLEMENTATION.md](./CSRF_IMPLEMENTATION.md) - CSRF details

---

## 🎯 Key Takeaways

1. **AI is a tool, not a replacement** - Always validate and understand AI-generated code
2. **Security first** - Never trust AI suggestions blindly for security-critical code
3. **Test everything** - AI code needs testing just like human-written code
4. **Document as you go** - Help your future self and teammates
5. **Stay updated** - AI may suggest outdated patterns, always cross-reference

**Remember:** The goal is to learn and build maintainable, secure software, not just to make things work quickly.
