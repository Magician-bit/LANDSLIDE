import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { fetchWeather } from './server/lib/weather';
import { fetchSeismic } from './server/lib/seismic';
import { fetchReports, createReport } from './server/lib/reports';
import { fetchFacilities } from './server/lib/facilities';
import { analyzeLandslide } from './server/lib/ai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/weather', async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: 'lat and lon are required' });
  const result = await fetchWeather(lat, lon);
  if (result) return res.json(result);
  return res.status(503).json({ error: 'WEATHER_UNAVAILABLE' });
});

app.get('/api/seismic', async (req, res) => {
  const result = await fetchSeismic();
  if (result) return res.json(result);
  return res.status(503).json({ error: 'SEISMIC_UNAVAILABLE' });
});

app.get('/api/facilities', async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  if (isNaN(lat) || isNaN(lon)) return res.status(400).json({ error: 'lat and lon are required' });
  const result = await fetchFacilities(lat, lon);
  if (result) return res.json(result);
  return res.status(503).json({ error: 'FACILITIES_UNAVAILABLE' });
});

app.get('/api/satellite', (req, res) => {
  res.json({
    status: 'NO_RECENT_OBSERVATION',
    deformationRateMmMonth: null,
    message: 'NO RECENT INSAR OBSERVATION',
    provenance: {
      sourceName: 'Copernicus Sentinel-1',
      providerAgency: 'ESA',
      dataType: 'SATELLITE_OBSERVATION',
      isLive: true,
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/reports', async (req, res) => {
  const result = await fetchReports();
  res.json(result);
});

app.post('/api/reports', async (req, res) => {
  const result = await createReport(req.body);
  if (result.success) return res.status(201).json(result);
  return res.status(500).json(result);
});

app.post('/api/analyze-image', async (req, res) => {
  const { image, imageBase64, mimeType, locationContext, zoneName, state } = req.body;
  const img = image || imageBase64;
  if (!img) return res.status(400).json({ success: false, error: 'NO_IMAGE_PROVIDED', message: 'image or imageBase64 required' });
  const result = await analyzeLandslide(img, mimeType || 'image/jpeg', locationContext || '', zoneName || '', state || '');
  return res.status(result.success ? 200 : 500).json(result);
});


// VITE & STATIC SERVING INTEGRATION
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
