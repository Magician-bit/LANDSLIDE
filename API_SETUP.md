# API and Deployment Architecture

This application is designed to be fully live and dynamically retrieve data from various geospatial APIs. To ensure the live data engine functions correctly in production, the architecture has been migrated from a local `server.ts` Express application to serverless Netlify Functions.

## 1. Environment Variables

Create a `.env` file in the root directory (for local dev) and configure these variables in your Netlify dashboard:

```env
# URL for the API backend (leave empty for same-site deployment on Netlify)
VITE_API_BASE_URL=

# Gemini Vision AI (Required for image analysis)
GEMINI_API_KEY=your_gemini_api_key

# Supabase (Required for persistent community reports)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Copernicus Sentinel (Optional, for authenticated satellite data)
COPERNICUS_CLIENT_ID=
COPERNICUS_CLIENT_SECRET=
```

Note: NEVER put `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` into `VITE_` prefixed variables. These belong securely on the backend (Netlify Functions).

## 2. Live Data Sources

- **Weather & Forecast**: [Open-Meteo](https://open-meteo.com) (No API key required)
- **Seismic Activity**: [USGS Earthquake Hazards Program GeoJSON](https://earthquake.usgs.gov) (No API key required)
- **Facilities & Shelters**: [OpenStreetMap via Overpass API](https://overpass-api.de) (No API key required)
- **Geological / Terrain Baseline**: GSI / NRSC (Currently utilizing static regional baselines based on official domain parameters)
- **Image Analysis**: Google Gemini 2.5 Flash Multimodal

## 3. Production Deployment (Netlify)

The platform is designed to be deployed instantly on Netlify.
Netlify will automatically build the Vite frontend (to `/dist`) and provision the backend APIs (from `/netlify/functions`).

The `netlify.toml` automatically proxies all `/api/*` frontend requests to `/.netlify/functions/*`.

## 4. GitHub Pages Deployment

If deploying the frontend statically to GitHub Pages, the frontend cannot execute backend code.
1. Deploy the repository to Netlify FIRST (to act as your API backend).
2. Note the Netlify URL (e.g., `https://my-landslide-api.netlify.app`).
3. Set `VITE_API_BASE_URL=https://my-landslide-api.netlify.app` in your GitHub Pages build secrets.
4. The GitHub Pages static frontend will now route all live requests securely to your Netlify backend.

## 5. Local Development

Run the frontend and backend locally:
```bash
npm install
npm run dev
```

The Vite preview uses an integrated `server.ts` Express backend for rapid local prototyping without needing the Netlify CLI.
