# Architecture Documentation

This document describes the system architecture, design decisions, and technical implementation details of the Multi-Backend Plotly Dashboard.

---

## 🏗️ System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│                  (Vite + React 19)                      │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Pages     │  │  Components │  │   Hooks     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │ 
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                       │                                 │
│              ┌────────┴────────┐                        │
│              │                 │                        │
│      ┌───────▼──────┐  ┌──────▼────────┐                │
│      │  Services    │  │    Utils      │                │
│      │  (API Layer) │  │ (Utilities)   │                │
│      └───────┬──────┘  └───────────────┘                │
└──────────────┼──────────────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼──────────┐  ┌───────▼────────┐
│ Express.js   │  │    FastAPI     │
│   Backend    │  │    Backend     │
│  (Node.js)   │  │   (Python)     │
└───┬──────────┘  └───────┬────────┘
    │                     │
    └──────────┬──────────┘
               │
       ┌───────▼────────┐
       │  MongoDB Atlas │
       │   (Database)   │
       └────────────────┘
```

---

## 🎯 Design Principles

### 1. Modularity

**Principle:** Each module has a single responsibility and can be replaced independently.

**Benefits:**
- Easy to understand and maintain
- Simple to test in isolation
- Flexible to change or upgrade
- Reusable across the application

**Example:**
```javascript
// Services handle ONLY API communication
// src/services/api.js
export const fetchCharts = () => api.get('/charts');

// Hooks handle ONLY data management
// src/hooks/useChartData.js
export const useChartData = () => {
  const [data, setData] = useState(null);
  // ... fetch and manage state
  return { data, loading, error };
};

// Components handle ONLY UI rendering
// src/components/ChartViewer.js
const ChartViewer = ({ data }) => {
  return <Plot data={data.data} layout={data.layout} />;
};
```

### 2. Separation of Concerns

**Layers:**
1. **Presentation Layer** (Components, Pages) - UI only
2. **Business Logic Layer** (Hooks, Utils) - State management and data processing
3. **Data Layer** (Services) - API communication
4. **Backend Layer** (Express/FastAPI) - Business logic and database access

### 3. Security by Design

**Principles:**
- Database credentials never exposed to frontend
- Authentication via httpOnly cookies
- CSRF protection on all state-changing requests
- Environment-specific configurations
- Input validation on backend

### 4. Performance First

**Optimizations:**
- Client-side filtering (no server round-trips)
- Lazy loading of charts
- Code splitting (automatic with Vite)
- Memoization for expensive computations
- Efficient data structures

---

## 📂 Directory Structure

```
load-json-data/
├── public/                    # Static assets
│   ├── images/
│   │   ├── screenshots/       # Application screenshots
│   │   └── architecture-diagram/
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── fastapi/          # FastAPI-specific components
│   │   │   ├── PlotlyChartViewer.js
│   │   │   └── ChartList.js
│   │   ├── ChartSelector.js  # JSON Express chart selector
│   │   ├── ErrorDisplay.js   # Error handling UI
│   │   ├── Loading.js        # Loading spinner
│   │   └── AuthTest.js       # Authentication testing component
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useChartData.js   # JSON Express data management
│   │   └── useFastAPICharts.js # FastAPI data management
│   │
│   ├── pages/                 # Page-level components
│   │   ├── JSONExpressPage.js # JSON Express interface
│   │   └── FastAPIPage.js     # FastAPI interface
│   │
│   ├── services/              # API communication layer
│   │   ├── api.js            # Express.js API client
│   │   ├── fastApiService.js # FastAPI client
│   │   ├── authService.js    # Authentication service
│   │   └── chartService.js   # Chart-specific operations
│   │
│   ├── utils/                 # Utility functions
│   │   ├── csrfToken.js      # CSRF token management
│   │   └── envValidation.js  # Environment validation
│   │
│   ├── data/                  # Static/fallback data
│   │   └── plotlyData.js     # Fallback chart data
│   │
│   ├── App.js                 # Main application component
│   ├── App.css                # Global styles
│   ├── index.js               # Application entry point
│   └── index.css              # Base CSS
│
├── .env.example               # Environment template
├── .env.development           # Development config
├── .gitignore
├── package.json
├── vite.config.js            # Vite configuration
│
└── Documentation/
    ├── README.md              # Main documentation (this file is in root)
    ├── ARCHITECTURE.md        # System architecture (you are here)
    ├── SECURITY.md            # Security features
    ├── DEVELOPMENT.md         # Development guide
    └── CSRF_IMPLEMENTATION.md # CSRF details
```

---

## 🔄 Data Flow

### JSON Express API Flow

```
User Interaction
       │
       ▼
JSONExpressPage.js (Page Component)
       │
       ▼
useChartData() (Custom Hook)
       │
       ├─ Manages state (loading, error, data)
       ├─ Auto-refetch every 5 minutes
       └─ Provides chart selection functions
       │
       ▼
chartService.js (Service Layer)
       │
       ├─ getAllCharts()
       ├─ getChartById()
       └─ Uses api.js for HTTP requests
       │
       ▼
api.js (HTTP Client)
       │
       ├─ Axios instance with baseURL
       ├─ Adds CSRF token to requests
       ├─ Handles authentication errors
       └─ withCredentials: true
       │
       ▼
Express.js Backend
       │
       ├─ Route handling
       ├─ CSRF validation
       ├─ Authentication check
       └─ MongoDB query
       │
       ▼
MongoDB Atlas
       │
       └─ Chart data storage
       │
       ▼
Response flows back up the chain
       │
       ▼
useChartData() updates state
       │
       ▼
React re-renders with new data
       │
       ▼
PlotlyChartViewer displays chart
```

### FastAPI Flow

```
User Interaction
       │
       ▼
FastAPIPage.js (Page Component)
       │
       ▼
useFastAPICharts() (Custom Hook)
       │
       ├─ Connection status management
       ├─ Chart CRUD operations
       └─ Selection management
       │
       ▼
fastApiService.js (Service Layer)
       │
       ├─ healthCheck()
       ├─ plotly.getAllCharts()
       ├─ plotly.createChart()
       ├─ plotly.updateChart()
       ├─ plotly.deleteChart()
       └─ Adds CSRF token via interceptor
       │
       ▼
FastAPI Backend
       │
       ├─ Pydantic validation
       ├─ CSRF validation (if implemented)
       ├─ Business logic
       └─ MongoDB operations
       │
       ▼
MongoDB Atlas
       │
       └─ Chart data storage
```

---

## 🔐 Authentication Flow

### Login Process

```
1. User submits login form (email + password)
   │
   ▼
2. AuthTest.js → authService.login()
   │
   ▼
3. POST /api/auth/login
   │
   ├─ CSRF token included in X-CSRF-Token header
   ├─ Credentials sent in request body
   └─ withCredentials: true
   │
   ▼
4. Backend validates credentials
   │
   ├─ Check email exists
   ├─ Verify password hash
   └─ Generate session token
   │
   ▼
5. Backend sets httpOnly cookie
   │
   ├─ Name: 'session' (or configured name)
   ├─ httpOnly: true (JavaScript cannot access)
   ├─ Secure: true (HTTPS only in production)
   ├─ SameSite: 'Lax' (CSRF protection)
   └─ Max-Age: 7 days
   │
   ▼
6. Backend returns user data (NOT the token)
   │
   └─ { success: true, data: { user: {...} } }
   │
   ▼
7. Frontend stores user in React state
   │
   ├─ setUser(userData)
   ├─ Refresh CSRF token
   └─ NO localStorage usage
   │
   ▼
8. Subsequent requests automatically include cookie
   │
   └─ Browser handles this, not JavaScript
```

### Authenticated Request Flow

```
1. User action triggers API call
   │
   ▼
2. Axios interceptor adds CSRF token
   │
   ├─ Reads XSRF-TOKEN cookie
   └─ Adds X-CSRF-Token header
   │
   ▼
3. Browser automatically includes session cookie
   │
   └─ withCredentials: true enables this
   │
   ▼
4. Backend validates request
   │
   ├─ Check session cookie is valid
   ├─ Verify CSRF tokens match
   └─ Check user permissions
   │
   ▼
5. Backend processes request and responds
```

---

## 🎨 Component Architecture

### Component Hierarchy

```
App.js (Root)
│
├─ Navigation/Routing
│
├─ JSONExpressPage.js
│   │
│   ├─ useChartData() hook
│   │
│   ├─ ChartSelector
│   │   ├─ Dropdown for chart selection
│   │   └─ Chart metadata display
│   │
│   └─ PlotlyChartViewer
│       ├─ Plot component (Plotly)
│       ├─ Filter controls
│       └─ Error/Loading states
│
└─ FastAPIPage.js
    │
    ├─ useFastAPICharts() hook
    │
    ├─ Connection status indicator
    │
    └─ ChartList
        ├─ List of available charts
        ├─ Selection checkboxes
        └─ PlotlyChartViewer (for each selected chart)
            ├─ Plot component
            ├─ Filter controls
            └─ CRUD operations
```

### Component Communication

**Props Down, Events Up:**
```javascript
// Parent passes data down
<PlotlyChartViewer 
  chart={selectedChart}
  onFilter={handleFilter}
/>

// Child emits events up
const PlotlyChartViewer = ({ chart, onFilter }) => {
  return (
    <button onClick={() => onFilter(newFilters)}>
      Apply Filters
    </button>
  );
};
```

**Context for Global State (if needed):**
```javascript
// Future enhancement
const AuthContext = createContext();

<AuthContext.Provider value={{ user, login, logout }}>
  <App />
</AuthContext.Provider>
```

---

## 🎛️ Filtering System

### Architecture

**Principle:** Never modify database data; filter in memory on the client.

### Filter Types

#### 1. Date Range Filter

**Implementation:**
```javascript
const [dateRange, setDateRange] = useState({
  start: null,
  end: null
});

const filteredByDate = useMemo(() => {
  if (!dateRange.start || !dateRange.end) return chartData;
  
  return {
    ...chartData,
    data: chartData.data.map(trace => ({
      ...trace,
      x: trace.x.filter((date, i) => {
        const d = new Date(date);
        return d >= dateRange.start && d <= dateRange.end;
      }),
      y: trace.y.filter((_, i) => {
        const d = new Date(trace.x[i]);
        return d >= dateRange.start && d <= dateRange.end;
      })
    }))
  };
}, [chartData, dateRange]);
```

**Why useMemo?**
- Filtering is expensive for large datasets
- Only recalculate when data or filters change
- Prevents unnecessary re-renders

#### 2. Company/Category Filter

**Implementation:**
```javascript
const [selectedCompanies, setSelectedCompanies] = useState([]);

const filteredByCompany = useMemo(() => {
  if (!selectedCompanies.length) return chartData;
  
  return {
    ...chartData,
    data: chartData.data.filter(trace =>
      selectedCompanies.includes(trace.name)
    )
  };
}, [chartData, selectedCompanies]);
```

#### 3. Metric Filter

**Implementation:**
```javascript
const [selectedMetrics, setSelectedMetrics] = useState([]);

const filteredByMetric = useMemo(() => {
  if (!selectedMetrics.length) return chartData;
  
  return {
    ...chartData,
    data: chartData.data.filter(trace =>
      selectedMetrics.some(metric => 
        trace.name.toLowerCase().includes(metric.toLowerCase())
      )
    )
  };
}, [chartData, selectedMetrics]);
```

### Composite Filtering

**Chain filters together:**
```javascript
const filteredData = useMemo(() => {
  let data = chartData;
  
  // Apply date filter
  if (dateRange.start && dateRange.end) {
    data = filterByDate(data, dateRange);
  }
  
  // Apply company filter
  if (selectedCompanies.length) {
    data = filterByCompany(data, selectedCompanies);
  }
  
  // Apply metric filter
  if (selectedMetrics.length) {
    data = filterByMetric(data, selectedMetrics);
  }
  
  return data;
}, [chartData, dateRange, selectedCompanies, selectedMetrics]);
```

### Filter Performance

**Optimizations:**
1. **Memoization** - Cache filter results
2. **Debouncing** - Delay filter application during typing
3. **Virtualization** - Render only visible items for large lists
4. **Progressive Loading** - Load and filter in chunks

---

## 🔌 API Service Layer

### Design Pattern: Facade Pattern

**Purpose:** Provide a simplified interface to complex HTTP operations.

### Structure

```javascript
// src/services/api.js
import axios from 'axios';
import { getCSRFToken, requiresCSRFProtection } from '../utils/csrfToken';

// 1. Create configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// 2. Request interceptor - add CSRF token
api.interceptors.request.use(config => {
  if (requiresCSRFProtection(config.method)) {
    config.headers['X-CSRF-Token'] = getCSRFToken();
  }
  return config;
});

// 3. Response interceptor - handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Methods

**Chart Service:**
```javascript
// src/services/chartService.js
import api from './api';

export const chartService = {
  getAllCharts: async () => {
    const response = await api.get('/charts');
    return response.data;
  },
  
  getChartById: async (id) => {
    const response = await api.get(`/charts/${id}`);
    return response.data;
  },
  
  createChart: async (chartData) => {
    const response = await api.post('/charts', chartData);
    return response.data;
  }
};
```

---

## 📊 State Management

### Current Approach: React Hooks + Context (Minimal)

**Why not Redux/MobX?**
- Application state is relatively simple
- Most state is component-local
- Hooks provide sufficient state management
- Reduces bundle size and complexity

### State Organization

**Local State (useState):**
- UI state (modals, dropdowns, form inputs)
- Temporary data
- Component-specific state

**Custom Hooks (useChartData):**
- Data fetching
- Caching
- Derived state
- Shared logic between components

**Context (Future):**
- Authentication state
- Theme preferences
- Global settings

### Example: useChartData Hook

```javascript
const useChartData = () => {
  // State
  const [allCharts, setAllCharts] = useState([]);
  const [selectedChartIds, setSelectedChartIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch data
  const fetchAllCharts = useCallback(async () => {
    setLoading(true);
    try {
      const charts = await chartService.getAllCharts();
      setAllCharts(charts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Effects
  useEffect(() => {
    fetchAllCharts();
  }, [fetchAllCharts]);
  
  // Computed values
  const selectedCharts = useMemo(() =>
    allCharts.filter(chart => selectedChartIds.includes(chart.id)),
    [allCharts, selectedChartIds]
  );
  
  // Return interface
  return {
    allCharts,
    selectedCharts,
    loading,
    error,
    selectChart: (id) => setSelectedChartIds([id]),
    refetch: fetchAllCharts
  };
};
```

---

## 🔧 Configuration Management

### Environment-Based Configuration

**Development:**
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FASTAPI_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

**Production:**
```bash
VITE_API_BASE_URL=https://api.production.com/api
VITE_FASTAPI_URL=https://fastapi.production.com
VITE_ENVIRONMENT=production
```

### Runtime Validation

```javascript
// src/utils/envValidation.js
export const validateEnvironmentVariables = () => {
  const required = {
    VITE_API_BASE_URL: 'API base URL',
    VITE_FASTAPI_URL: 'FastAPI URL',
    VITE_ENVIRONMENT: 'Environment'
  };
  
  const missing = [];
  Object.entries(required).forEach(([key, description]) => {
    if (!import.meta.env[key]) {
      missing.push({ key, description });
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${
      missing.map(m => m.key).join(', ')
    }`);
  }
  
  // Production-specific checks
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl.startsWith('https://')) {
      console.warn('⚠️  API should use HTTPS in production');
    }
  }
};
```

---

## 🚀 Performance Considerations

### Bundle Size Optimization

**Code Splitting:**
```javascript
// Automatic with Vite
const FastAPIPage = lazy(() => import('./pages/FastAPIPage'));
```

**Tree Shaking:**
- Vite automatically removes unused code
- Use named imports: `import { specific } from 'lib'`

### Runtime Performance

**Memoization:**
```javascript
// Expensive calculations
const filteredData = useMemo(() => {
  return expensiveFilterOperation(data, filters);
}, [data, filters]);

// Callbacks
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);
```

**Lazy Loading:**
- Charts load on demand
- Images use native lazy loading
- Components split by route

---

## 🔮 Future Enhancements

### Potential Improvements (AI suggestions)

1. **State Management:**
   - Add Context API for global state
   - Consider Zustand for complex state

2. **Testing:**
   - Increase test coverage
   - Add E2E tests with Playwright
   - Integration tests for hooks

3. **Performance:**
   - Implement virtual scrolling for large lists
   - Add service worker for offline support
   - Optimize Plotly chart rendering

4. **Features:**
   - Real-time updates with WebSockets
   - Chart export functionality
   - Advanced filtering with query builder
   - User preferences persistence

5. **Developer Experience:**
   - Storybook for component documentation
   - Better TypeScript integration
   - Automated deployment pipeline

---

## 📚 Additional Resources

- [React Architecture](https://react.dev/learn/thinking-in-react)
- [Vite Guide](https://vitejs.dev/guide/)
- [API Design Best Practices](https://restfulapi.net/)
- [Component Design Patterns](https://reactpatterns.com/)

---

## 🎯 Key Architectural Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| Vite over CRA | Faster dev server, better DX, actively maintained | Migration effort, different config |
| Client-side filtering | Fast UX, no server load, works offline | Memory usage, doesn't scale to huge datasets |
| httpOnly cookies | Security (XSS protection) | Requires CORS configuration, backend dependency |
| Two backends | Demonstrates flexibility, learning opportunity | More complexity, two codebases to maintain |
| Modular structure | Easy to understand and maintain | More files, requires discipline |
| No state library | Simplicity, smaller bundle | Manual prop drilling, may need refactor later |

---

**This architecture prioritizes security, maintainability, and developer experience while keeping complexity manageable for a learning project.**
