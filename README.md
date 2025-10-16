# Multi-Backend Plotly Dashboard

A React app that displays interactive Plotly charts stored in MongoDB Atlas. It connects to two different backend APIs and lets users filter data dynamically.

## 🚀 **Vite Migration Complete!**

**⚠️ Important Update**: This project has been successfully migrated from Create React App (CRA) to **Vite** for better performance and modern tooling.

- **Original CRA version**: Available on `fastAPI` branch 
- **Current Vite version**: On `vite-migration` branch (recommended)

### Why We Migrated to Vite

Create React App was officially **deprecated** and is no longer maintained. Vite offers:
- ⚡ **Lightning-fast development server** (222ms startup vs several seconds)
- 🔥 **Instant hot module replacement (HMR)**
- 📦 **Optimized production builds** with better tree-shaking
- 🎯 **Native ES modules** support
- 🛠️ **Modern tooling** that's actively maintained

## Available Scripts

### Development
```bash
npm run dev      # Start development server (Vite)
npm run start    # Alternative development command
```

### Production
```bash
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Testing
```bash
npm run test     # Run tests with Vitest
```

---

## React load-json-data created with the help of AI tools

This react app has been created using AI tools, mainly Warp as co-pilot in VS Code. Other AI were also used to counter-check code snippets proposed by warp.

### Problems with AI coding:
- **Outdated frameworks**: Some codes generated are outdated or based on deprecated frameworks. For example, this React app was initially built using Create React App (CRA), which was already officially deprecated and is no longer maintained. It is working but will no longer get updated.
- **For this reason**: I decided to create a new branch (`vite-migration`) and migrated the project to the **Vite framework**.
- **False confidence risk**: Because AI can generate working code fast. "It runs" doesn't mean "it's correct."

### Precautions taken while AI coding:
- ✅ **Never accept code proposed by AI co-pilot blindly**
- ✅ **Cross-referencing with official documentations** 
- ✅ **Always prompted "Check for Potential Vulnerabilities"** - and yet, double-checking the results is still very crucial. Once, after getting an okay from warp, I pushed to GitHub only to get an email message 30 minutes later that "Possible valid secrets detected"! I pushed without updating .gitignore. This is just a very small application with no real sensitive data at stake yet. Nevertheless…
- ✅ **Keep the Human-in-the-Loop Mindset**
- ✅ **Before accepting generated code, ask:**
  - "Do I understand what this line does?"
  - "Does this match recommended architecture and best practice conventions?"
  - Use "explain this code" or "why this works" prompts with your AI.

### However:
Being a novice code developer, I could not have completed a working prototype of this React App dashboard on my own in such a short period (less than two months). The different AI tools were practical to use. Sifting through the immense compilation of official documentations is not easy. Gen AIs like deepSeek, chatGPT, claude and others helped me narrow down quickly to the relevant information.

Realize that code AI co-pilots such as warp, emergent, windsurf, [bolt.new](https://bolt.new) etc. hallucinate and they can generate code that seems to work — but difficult for developers to understand. Developers may not even understand how or why. Debugging or explaining AI-generated code is hard because of this. AI-generated code can be inconsistent: clean in one place, messy in another.

---

## 🎯 What is the Main Objective in creating this React App Dashboard?

This dashboard is intended to fetch Plotly JSON chart data from MongoDB and displays it as is. The backend data is preserved so that the integrity is not compromised. You can filter by date ranges, companies, and metrics without changing the original database data. The app works with two backend systems: a JSON Express.js API and a FastAPI backend.

## 🔧 Why Modular Architecture?

This app was built using a modular structure. Each piece has one job and can be replaced or upgraded independently.

### The Benefits
1. **Easier to Understand**
   * Each file does one thing. Need to fix the FastAPI connection? Just open `fastApiService.js`.
   * New team members can learn one part at a time instead of untangling spaghetti code.

2. **Easy to Change**
   * Want to add a third backend? Just copy the FastAPI folder structure and swap out the service.
   * Frontend filters broken? Fix them without touching the API code.

3. **Easy to Test**
   * Test the API connection separately from the UI components.
   * Catch bugs faster because problems are isolated.

4. **Reusable Code**
   * The same `PlotlyChartViewer` component works for both APIs.
   * Write once, use everywhere.

## 📁 How the Code is Organized

```
src/
├── services/           # Connect and "Talk" to backend APIs
│   ├── api.js         # Connects to Express.js
│   └── fastApiService.js  # Connects to FastAPI
│
├── hooks/             # Manage data and state
│   ├── useChartData.js    # Handles JSON Express data
│   └── useFastAPICharts.js # Handles FastAPI data
│
├── components/        # UI building blocks
│   ├── fastapi/
│   │   ├── PlotlyChartViewer.js  # Shows plotly JSON data charts from the fastAPI process as is configured from the backend
│   │   └── ChartList.js          # List of available charts
│   ├── ChartSelector.js   # JSON Express chart picker for both API Plotly JSON data
│   ├── ErrorDisplay.js    # Shows errors nicely
│   └── Loading.js         # Loading spinner
│
├── pages/             # Full page views
│   ├── JSONExpressPage.js
│   └── FastAPIPage.js
│
├── utils/             # 🆕 Utility functions
│   └── envValidation.js   # Environment variable validation
│
└── App.js             # Navigation and routing
```

### Why This Structure?
- **Services** handle all network requests - if the API changes, we only update this folder
- **Hooks** manage data fetching and state - keeps React components simple
- **Components** focus on display - easy to redesign without touching data logic
- **Pages** assemble everything together, for each API separately
- **Utils** *(new)* provide shared functionality like environment validation

## 🔄 Step-by-Step: How Data Flows from the backend APIs

### JSON Express Integration

**Start the backend server**: Run the server from the terminal in project directory (`json-express-api`)
```bash
node app.js
```

1. **User Opens Page**
   * Navigate to JSON Express page
   * `JSONExpressPage.js` component loads
   * `useChartData.js` hook checks if json-express-api is running

2. **Fetch Data**
   * `useChartData` hook wakes up
   * Calls `api.js` service
   * Service sends request to backend
   * Backend queries MongoDB Atlas
   * Data comes back to the hook

3. **Display Charts**
   * `ChartSelector` shows list of available charts
   * User clicks a chart
   * `PlotlyChartViewer` renders the Plotly chart

4. **Apply Filters**
   * User adjusts date range, company, or metrics; still needs refinements
   * Filters run in the browser (not in database)
   * Chart updates instantly

*Why this way?* Separating each step means you can improve the filtering without touching how data is fetched.

### FastAPI Python Integration

**Run the backend server application**: Run the server from the terminal in project directory (`fastAPI-backend`)
```bash
python3 run.py
```

1. **User Opens Page**
   * `FastAPIPage.js` loads
   * `useFastAPICharts` hook checks if FastAPI is running
   * Shows status indicator to user

2. **Load Charts**
   * If backend is healthy, fetch chart list
   * `fastApiService.js` makes the API call
   * Returns structured, validated data

3. **User Interaction**
   * `ChartList` shows available charts
   * User selects chart
   * `PlotlyChartViewer` displays it with filter options

4. **Smart Filtering**
   * Some filters run on backend (validated)
   * Some filters run on frontend (instant)
   * Best of both worlds

*Why this way?* FastAPI provides better error handling and data validation, so we use those features while keeping the frontend flexible.

### Two APIs, One Interface

| Feature | JSON Express.js | FastAPI |
|---------|----------------|----------|
| Use Case | The "legacy" system | New modern backend |
| Speed | Fast and simple | Fast with validation |
| Error Messages | Basic | Detailed and helpful |
| Filtering | Frontend only | Backend + Frontend |

Both APIs feed the same frontend components - that's the advantage of modularity.

## 🎛️ Filtering: The Smart Way

The app never changes data in MongoDB. Instead:
1. Original chart data loads from database
2. User applies filters (date, company, metrics)
3. JavaScript filters the data in memory
4. Plotly re-renders with filtered data (still need refinement, especially for the date range selector)
5. Original data stays safe in database

```javascript
// Original data from database - never touched
// Extract available companies and date range from chart data
const { availableCompanies, availableDates, hasTimeSeriesData } = useMemo(() => {
  if (!chart?.data) return { availableCompanies: [], availableDates: [], hasTimeSeriesData: false };
  // With frontend filters for companies, metrics and date range, Plotly shows only filtered portion in the dashboard
```

---

## 🚀 Getting Started

### What You Need
- Node.js 16 or newer
- MongoDB Atlas connection
- Both backend APIs running

### Quick Setup
```bash
# 1. Get the code
git clone <repository-url>
cd load-json-data

# 2. Switch to Vite version (recommended)
git checkout vite-migration

# 3. Install packages
npm install

# 4. Configure connections
cp .env.example .env
# Edit .env with your API URLs

# 5. Start the app
npm run dev
```

## 🌍 Environment Configuration

### 🆕 **Vite Environment Variables** (Updated)

After migration to Vite, environment variables now use the `VITE_` prefix:

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FASTAPI_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_APP_NAME=Financial Data Tracker
```

### 🔒 **Security Improvements**

- ✅ **Environment validation**: Added runtime validation for required environment variables
- ✅ **Secure .gitignore**: Environment files are now properly excluded from version control
- ✅ **HTTPS validation**: Production deployments are validated for HTTPS usage
- ✅ **No vulnerabilities**: All packages updated to latest secure versions

### Where MongoDB Data is Being Fetched

The MongoDB data is **NOT** being fetched directly from the React frontend.

#### Data Fetching Flow
```
MongoDB Atlas ← Backend APIs ← React Frontend
```

#### React Frontend Components (Data Requesters)

**For JSON Express API:**
- File: `src/hooks/useChartData.js`
- Component: Uses `src/services/api.js`
- What it does: Makes HTTP requests to `http://localhost:3001/api`

**For FastAPI Backend:**
- File: `src/hooks/useFastAPICharts.js`
- Component: Uses `src/services/fastApiService.js`
- What it does: Makes HTTP requests to `http://localhost:8000`

#### Backend APIs (MongoDB Connection Layer)

The actual MongoDB connections happen in your backend servers, not in React:

**JSON Express API Backend**
- Location: `/Users/joelmoran/Desktop/json-express-api` (separate repository)
- MongoDB Connection: Configured in the backend server files
- Endpoint: Exposes REST API at `http://localhost:3001/api`

**FastAPI Backend**
- Location: `/Users/joelmoran/Projects/fastAPI-backend` (separate repository) 
- MongoDB Connection: Configured in `database.py` or similar backend files
- Endpoint: Exposes REST API at `http://localhost:8000`

### 🔧 Troubleshooting

**If JSON Express API backend is running, but cannot connect to MongoDB Atlas…**
Check MongoDB Atlas connection, it could be:

1. MongoDB Atlas cluster is paused/sleeping
2. Network connection issues
3. Database credentials expired
4. IP whitelist issues (Network Access - add/include current IP address)

### MongoDB Connection Strings Location

The MongoDB Atlas connection strings are stored in the backend servers, not in the React app:

**For JSON Express API:**
```bash
# In your json-express-api project
/Users/joelmoran/Desktop/json-express-api/.env
```

**For FastAPI Backend:**
```bash
# In your fastAPI-backend project  
/Users/joelmoran/Projects/fastAPI-backend/.env
```

### React Environment Variables

In your React app, you only have API endpoint URLs:

```bash
# React app only knows about the backend API URLs
VITE_API_BASE_URL=http://localhost:3001/api       # JSON Express API
VITE_FASTAPI_URL=http://localhost:8000            # FastAPI Backend
```

## 🔒 Security Benefits

This architecture is secure because:
- ✅ No database credentials in frontend code
- ✅ Database connections happen server-side only
- ✅ MongoDB Atlas connection strings are protected in backend .env files
- ✅ React app only communicates via HTTP APIs
- ✅ **httpOnly Cookie Authentication** - Tokens stored securely on server-side
- ✅ **CSRF Protection** - `X-Requested-With` headers prevent CSRF attacks
- ✅ **Environment validation** - Runtime checks for required configuration

### Summary

- **MongoDB data fetching**: Happens in the backend servers (`json-express-api` & `fastAPI-backend`)
- **MongoDB connection strings**: Stored only in backend `.env` files
- **React components**: Only make HTTP requests to backend APIs
- **React environment variables**: Only contain API endpoint URLs

---

## 📋 Environment File Strategy

### Reasons for Using .env.development

| Advantage | Description | Example |
|-----------|-------------|---------|
| Environment Isolation | Different configs for dev/prod | Dev: localhost:3001, Prod: api.company.com |
| Team Collaboration | Shared dev settings, personal prod | Everyone uses same dev URLs |
| Security | Sensitive prod URLs not in dev | API keys, production domains |
| Testing | Easy switching between environments | Test with staging APIs |
| CI/CD Integration | Automated deployments use correct env | GitHub Actions picks .env.production |

### ✅ Safe to Commit:
```bash
# .env.development (public development URLs)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FASTAPI_URL=http://localhost:8000
```

### ⚠️ Consider Carefully:
```bash
# .env.production (production URLs - depends on sensitivity)
VITE_API_BASE_URL=https://api.yourcompany.com/api
VITE_FASTAPI_URL=https://fastapi.yourcompany.com
```

### 🚫 NEVER Commit:
```bash
# .env.local or .env (sensitive/personal data) 
VITE_DEBUG_MODE=true
VITE_API_KEY=<secret-key-123>
```

---

## 📋 Pre-Production Checklist

1. ✅ Create `.env.production` with production API URLs
2. ✅ Deploy backend APIs to production (Heroku, AWS, etc.)
3. ✅ Update MongoDB connection strings in backend `.env` files
4. ✅ Test production build locally: `npm run build && npx serve build`
5. ✅ Deploy React app to hosting service (Vercel, Netlify, etc.)

## 🎯 Key Takeaway

- **React environment files**: Only contain API endpoint URLs
- **Backend environment files**: Contain MongoDB connection strings  
- **`.env.development`**: Perfect for local development consistency (public development URLs)
- **`.env.production`**: Required for production deployments
- **MongoDB URLs**: Always stay in backend, never in React!

---

## 🛠️ Common Tasks

### Debugging Connection Issues
1. Check `src/services/` - is the API URL correct?
2. Check browser console - what error appears?
3. Check `src/hooks/` - is error handling working?

Each layer is independent, so you pinpoint problems fast.

### Adding a New Filter (still to be tested)
1. Open `PlotlyChartViewer.js`
2. Add new filter state: `const [newFilter, setNewFilter] = useState('');`
3. Add filter UI element
4. Update filtering logic
5. Done - no backend changes needed

### Styling Changes
1. All UI is in `src/components/`
2. Change CSS/styling without touching data logic
3. Components are self-contained

### Performance Tips
- Charts load lazily (only when needed)
- Filters run in browser (no server round-trips)
- Plotly handles large datasets efficiently (up to 16MB should be no problem)
- Code splitting keeps initial load fast
- **Vite's HMR** provides instant feedback during development

---

## 🎯 Key Takeaways

1. **Modular = Flexible**: Change one piece without breaking others
2. **Two APIs, One Goal**: Different backends, same user experience  
3. **Filter Smart**: Keep original data safe, filter in memory
4. **Build Fast**: Add new features by copying existing patterns
5. **Vite Power**: Lightning-fast development with modern tooling
6. **Security First**: Environment validation and secure authentication

**Questions?** Check the code comments - each module is documented. If more explanation is needed, you could install an extension like Windsurf code AI assistant in VS Code. Click "Explain" or "Generate Docstring" above the code snippet you want more explanation.

The structure guides you to the right file.
