# Multi-Backend Plotly Dashboard

A React application that displays interactive Plotly charts stored in MongoDB Atlas and Supabase, connecting to three different backend APIs (Express.js, FastAPI, and Supabase) with dynamic filtering capabilities.

## 🎯 What Does This App Do?

This dashboard fetches and displays Plotly JSON chart data from MongoDB Atlas or Supabase without modifying the original database. You can:

- **View charts** from three different backend systems
• ChartSelector shows list of available charts
• User clicks a chart
• PlotlyChartViewer renders the Plotly chart
- **Filter data** by date ranges, companies, and metrics (client-side)
• User adjusts date range, company, or metrics; still needs
refinements
• Filters run in the browser (not in database)
• Chart updates instantly
- **Preserve data integrity** - all filtering happens in memory, never touching the database

⚠️ This project has been bootstrapped with Vite for better performance and modern tooling.
Vite offers:

⚡ Lightning-fast development server (222ms startup vs several seconds). It makes coding a lot faster
🔥 Instant hot module replacement (HMR)
📦 Optimized production builds with better tree-shaking
🎯 Native ES modules support
🛠️ Modern tooling that's actively maintained

![Architecture Diagram](./public/images/architecture-diagram/Architecture_Diagram.png)

## Deployment Test
- ** I used Vercel to deploy the frontend React App (load-json-data) 
    https://load-json-data.vercel.app/

The ReactExpress backend (json-express-api) and the second backend api, fastAPI are both deployed on Render.

- ** ReactExpress json-express-api (The following link below may have to be clicked to re-activate on Render deployment)
    https://json-express-api.onrender.com/

- ** The second fastAPI-backend (Python) (The following link below may have to be clicked to re-activate on Render deployment)
    https://fastapi-plotly-backend.onrender.com/

- ** A third party API (from Nataly) has been included 
    VITE_SUPABASE_URL=https://your-project.supabase.co + the API secret key.

- ** My MongoDB Atlas has to be running and allows access to the IP whitelist, 0.0.0.0/0, to able to test the deployment links above. And cluster(0) has to be connected. The Supabase API has been set in the .env files so it should connect automatically to the frontend app.

![MongoDB Atlas Cluster(0)](./public/images/screenshots/MongoDB-Atlas-Cluster.png)

Why Render is better for FastAPI

•  ✅ Persistent server - No cold starts, always running
•  ✅ Better for databases - Maintains connection pools
•  ✅ Longer execution times - No strict timeouts
•  ✅ WebSocket support - If needed in the future
•  ✅ Free tier includes 750 hours/month - Enough for 24/7 operation


## 📚 Documentation

- **[SECURITY.md](./documentation/SECURITY.md)** - Security features, authentication, CSRF protection
- **[CSRF_IMPLEMENTATION.md](./documentation/CSRF_IMPLEMENTATION.md)** - Detailed CSRF protection guide  
- **[ARCHITECTURE.md](./documentation/ARCHITECTURE.md)** - System architecture, data flow, filtering
- **[DEVELOPMENT.md](./documentation/DEVELOPMENT.md)** - Development notes, troubleshooting, AI coding tips
- ** [SUPABASE_SETUP.md](./documentation/SUPABASE_SETUP.md)** - Integration of Supabase notes, troubleshooting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas connection
- Backend APIs running (JSON Express & FastAPI)

### Installation

```bash
# Clone and navigate
git clone <repository-url>
cd load-json-data

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URLs

# Start development server
npm run dev
```
### Remember to Check MongoDB Atlas connection is running and includes  Whitelist address!!!

### Available Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run tests with Vitest
```

---

### Backend Integration

**JSON Express API** (`http://localhost:3001/api`)
- Legacy system with basic REST API
- Simple, fast data retrieval

**FastAPI** (`http://localhost:8000`)
- Modern Python backend
- Better error handling and validation

**Supabase API** 3rd Party API from Nataly

All three backend APIs feed the same React components - that's the power of modular architecture!

---

## 📁 Project Structure
```

load-json-data/       # Root Directory
├── documentation/    # All .md files (except README)
├── scripts/          # Development scripts
├── src/              # React source code
├── public/           # Static assets
├── README.md         # Main documentation
└── [config files]    # package.json, vite.config.js, etc.
```

```

src/.                      # React source code
├── services/              # API communication layer
│   ├── api.js             # Express.js API client
│   ├── fastApiService.js  # FastAPI client
│   ├── supabaseService.js # SupabaseAPI client
│   └── authService.js     # Authentication service
│
├── hooks/                  # Custom React hooks for data management
│   ├── useChartData.js     # JSON Express data
│   └── useFastAPICharts.js # FastAPI data
│
├── components/         # Reusable UI components
│   ├── fastapi/
│   │   ├── PlotlyChartViewer.js
│   │   └── ChartList.js
│   ├── ChartSelector.js
│   ├── ErrorDisplay.js
│   └── Loading.js
│
├── pages/              # Page-level components
│   ├── JSONExpressPage.js
│   └── FastAPIPage.js
│
└── utils/              # Utility functions
    ├── envValidation.js
    ├── envValidation.test.js
    ├── basic.test.js
    └── csrfToken.js
```

**Key Principles:**
- **Services** handle all network requests
- **Hooks** manage state and data fetching
- **Components** focus purely on UI
- **Pages** compose everything together

See [ARCHITECTURE.md](./documentation/ARCHITECTURE.md) for detailed explanations.

---

## 🌍 Environment Configuration

### Vite Environment Variables

Create `.env.development` for local development:

```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FASTAPI_URL=http://localhost:8000
VITE_ENVIRONMENT=development
VITE_APP_NAME=Financial Data Tracker
```

For production, create `.env.production`:

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_FASTAPI_URL=https://your-fastapi-domain.com
VITE_ENVIRONMENT=production
VITE_APP_NAME=Financial Data Tracker
```

⚠️ **Important**: MongoDB connection strings are stored in the **backend** `.env` files, not in this React app. The React app only knows about API endpoints.

---

## 📸 Screenshots

### Login Screen
![Login](./public/images/screenshots/25795765-F9D8-4E68-8676-C18459B06EF3.png)

### Dashboard Overview
![Dashboard](./public/images/screenshots/9E0EA8B0-24E3-4F42-8754-B27198A060EA.png)

### Chart Display
![Charts](./public/images/screenshots/492438F4-35E6-42BD-9E14-AB54FF9A808A.png)

---

## 🔒 Security Highlights

- ✅ **httpOnly Cookies** - Session tokens never accessible to JavaScript
- ✅ **CSRF Protection** - Double-submit cookie pattern (see [CSRF_IMPLEMENTATION.md](./documentation/CSRF_IMPLEMENTATION.md))
- ✅ **Secure Architecture** - Database credentials never exposed to frontend
- ✅ **Environment Validation** - Runtime checks for required configuration
- ✅ **HTTPS Enforcement** - Production builds validate secure connections

See [SECURITY.md](./documentation/SECURITY.md) for complete security documentation.

---

## 🛠️ Development

### Backend Setup

**Start JSON Express API:**
```bash
cd /path/to/json-express-api
npm run dev
or
node app.js
```

**Start FastAPI:**
```bash
cd /path/to/fastAPI-backend
python3 run.py
```

### Common Issues

| Issue            | Solution                                                 |
|------------------|----------------------------------------------------------|
| "Network Error"  | Ensure backend APIs are running                          |
| CORS errors      | Check backend CORS configuration allows `localhost:5173` |
| Missing charts   | Verify MongoDB Atlas connection in backend               |
| Auth failures    | Check backend authentication endpoints                   |

See [DEVELOPMENT.md](./documentation/DEVELOPMENT.md) for detailed troubleshooting.

---

## 🚀 Deployment

- [ ] Deployed React app Frontend and ReactExpress Backend (Vercel)
        https://load-json-data.vercel.app/
- [ ] Deployed fastAPI Backend on Render
        https://fastapi-plotly-backend.onrender.com/


### Pre-Production Checklist

- [ ] Create `.env.production` with production API URLs
- [ ] Deploy backend APIs (Heroku, AWS, Railway, etc.)
- [ ] Update MongoDB connection strings in backend `.env` files
- [ ] Test production build locally: `npm run build && npm run preview`
- [ ] Verify HTTPS is enforced
- [ ] Test CSRF protection
- [ ] Monitor application logs

---

## 🎯 Why This Architecture?

### Modular Design Benefits

1. **Easy to Understand** - Each file has one job
2. **Easy to Change** - Modify one part without breaking others
3. **Easy to Test** - Test components independently
4. **Reusable** - Same components work for both APIs

### Why Two Backends?

- **JSON Express** - Demonstrates legacy system integration
- **FastAPI** - Shows modern backend with better validation
- **Flexibility** - Same frontend works with different backend technologies. Will be integrating another backend API...

---

## 📋 Tech Stack

**Frontend:**
- React 19
- Vite (build tool)
- Plotly.js (charts)
- Axios (HTTP client)
- Vitest (testing)

**Backend (separate repositories):**
- Express.js + MongoDB (JSON Express API)
- FastAPI + MongoDB (FastAPI backend)

**Security:**
- httpOnly cookies
- CSRF protection
- Environment validation

---

## 🤝 Contributing

This is a personal learning project demonstrating:
- Multi-backend integration
- Secure authentication patterns
- Modular React architecture
- AI-assisted development

See [DEVELOPMENT.md](./documentation/DEVELOPMENT.md) for notes on AI-assisted coding practices.

---

## 📝 License

MIT License - feel free to use this project as a learning resource.

---

## 🙋 Questions?

- Check the inline code comments - each module is documented
- Review the detailed documentation files linked above
- Get in touch with me. https://www.linkedin.com/in/joel-moran-ph/

**The modular structure guides you to the right file!**
