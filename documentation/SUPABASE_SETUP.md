# Supabase Integration Setup

This document explains how to integrate the Supabase API (created by Nataly's Python backend) with this React frontend.

## Overview

The app now supports a third data source: **Supabase**, where Nataly stores Plotly JSON chart data using her Python backend.

## Quick Start

### 1. Get Supabase Credentials

Ask Nataly for:
- **Supabase URL** (e.g., `https://your-project.supabase.co`)
- **Supabase Anon Key** (public API key)

### 2. Configure Environment Variables

Add these to your `.env.development` or `.env.production` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Expected Supabase Table Structure

The integration expects a table named `plotly_charts` with the following columns:

```sql
CREATE TABLE plotly_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  plot_data JSONB,      -- or 'data'
  plot_layout JSONB,    -- or 'layout'
  plot_config JSONB,    -- or 'config'
  plot_frames JSONB,    -- or 'frames'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Note:** The service supports both naming conventions:
- `plot_data` / `plot_layout` / `plot_config` / `plot_frames`
- `data` / `layout` / `config` / `frames`

### 4. Start the App

```bash
npm run dev
```

Visit `http://localhost:5173/supabase-charts` to view charts from Supabase.

## Features

### Read-Only Access
- View all charts stored in Supabase
- Search charts by title or description
- Select and display charts in single or grid view
- Real-time connection status

### No Write Operations
The frontend only reads data from Supabase. Chart creation/editing/deletion is handled by Nataly's Python backend.

## Architecture

```
┌─────────────────────┐
│  React Frontend     │
│  (This App)         │
└──────────┬──────────┘
           │
           │ HTTP/REST
           ▼
┌─────────────────────┐
│  Supabase API       │
│  (Postgres + REST)  │
└──────────┬──────────┘
           │
           │ SQL INSERT
           ▼
┌─────────────────────┐
│  Nataly's Python    │
│  Backend            │
└─────────────────────┘
```

## Files Created

1. **`src/services/supabaseService.js`** - Supabase API client
2. **`src/hooks/useSupabaseCharts.js`** - React hook for chart management
3. **`src/pages/SupabasePage.js`** - UI page for Supabase charts
4. **`src/App.js`** - Updated with new route

## Troubleshooting

### "Supabase not configured"
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your `.env` file
- Restart the dev server after adding environment variables

### "Table 'plotly_charts' does not exist"
- Ask Nataly to verify the table name in Supabase
- Update the table name in `src/services/supabaseService.js` if different

### CORS Errors
- Supabase automatically handles CORS for allowed domains
- Ask Nataly to add your domain to the allowed list in Supabase settings

### Connection Failed
- Verify the Supabase URL is correct
- Check that the anon key has read permissions on the `plotly_charts` table
- Ensure Row Level Security (RLS) policies allow public read access if needed

## Python Backend (Nataly's Side)

Here's example Python code for Nataly to store charts in Supabase:

```python
from supabase import create_client, Client
import json

# Initialize Supabase
url = "https://your-project.supabase.co"
key = "your-service-role-key"  # Use service role for write operations
supabase: Client = create_client(url, key)

# Insert a Plotly chart
chart_data = {
    "title": "Sample Chart",
    "description": "This is a sample Plotly chart",
    "plot_data": [{"x": [1, 2, 3], "y": [4, 5, 6], "type": "scatter"}],
    "plot_layout": {"title": "My Chart", "xaxis": {"title": "X"}, "yaxis": {"title": "Y"}},
    "plot_config": {"displayModeBar": True},
    "plot_frames": []
}

response = supabase.table("plotly_charts").insert(chart_data).execute()
print(f"Chart inserted with ID: {response.data[0]['id']}")
```

## Security Notes

- The frontend uses the **anon key** (public, read-only)
- Nataly's Python backend should use the **service role key** (private, write access)
- Never commit actual credentials to version control
- Use environment variables for all sensitive data

## Next Steps

1. Ask Nataly for Supabase credentials
2. Update your `.env` file
3. Test the connection at `/supabase-charts`
4. Coordinate with Nataly on the exact table schema if needed
