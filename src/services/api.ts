export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiSourceResponse<T> {
  status: 'LIVE' | 'STALE' | 'OFFLINE' | 'HISTORICAL' | 'BASELINE';
  source: string;
  timestamp: string | null;
  data: T | null;
  error?: string | null;
}

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errStr = `HTTP_${response.status}`;
      try {
        const errBody = await response.json();
        if (errBody.message) errStr = errBody.message;
        if (errBody.error) errStr = errBody.error;
      } catch (e) {}
      return { ok: false, data: null, error: errStr };
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      return { ok: false, data: null, error: 'API_RETURNED_HTML' };
    }
    
    const data = await response.json();
    return { ok: true, data, error: null };
  } catch (error) {
    return { ok: false, data: null, error: error instanceof Error ? error.message : 'NETWORK_ERROR' };
  }
};

export const getWeather = async (lat: number, lon: number): Promise<ApiSourceResponse<any>> => {
  const res = await apiFetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (res.ok) {
    return { status: 'LIVE', source: 'Open-Meteo', timestamp: new Date().toISOString(), data: res.data };
  }
  return { status: 'OFFLINE', source: 'Open-Meteo', timestamp: new Date().toISOString(), data: null, error: res.error };
};

export const getSeismic = async (): Promise<ApiSourceResponse<any[]>> => {
  const res = await apiFetch(`/api/seismic`);
  if (res.ok) {
    return { status: 'LIVE', source: 'USGS', timestamp: new Date().toISOString(), data: res.data.events || [] };
  }
  return { status: 'OFFLINE', source: 'USGS', timestamp: new Date().toISOString(), data: null, error: res.error };
};

export const getFacilities = async (lat: number, lon: number): Promise<ApiSourceResponse<any[]>> => {
  const res = await apiFetch(`/api/facilities?lat=${lat}&lon=${lon}`);
  if (res.ok) {
    return { status: 'LIVE', source: 'OSM Overpass', timestamp: new Date().toISOString(), data: res.data.facilities || [] };
  }
  return { status: 'OFFLINE', source: 'OSM Overpass', timestamp: new Date().toISOString(), data: null, error: res.error };
};

export const getSatellite = async (): Promise<ApiSourceResponse<any>> => {
  const res = await apiFetch(`/api/satellite`);
  if (res.ok) {
    return { status: 'LIVE', source: 'Copernicus Sentinel-1', timestamp: new Date().toISOString(), data: res.data };
  }
  return { status: 'OFFLINE', source: 'Copernicus Sentinel-1', timestamp: new Date().toISOString(), data: null, error: res.error };
};

export const getReports = async (): Promise<ApiSourceResponse<any>> => {
  const res = await apiFetch(`/api/reports`);
  if (res.ok) {
    return { status: 'LIVE', source: 'Supabase Database', timestamp: new Date().toISOString(), data: res.data };
  }
  return { status: 'OFFLINE', source: 'Supabase Database', timestamp: new Date().toISOString(), data: null, error: res.error };
};

export const submitReport = async (report: any): Promise<ApiSourceResponse<any>> => {
  const res = await apiFetch(`/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });
  if (res.ok) {
    return { status: 'LIVE', source: 'Supabase Database', timestamp: new Date().toISOString(), data: res.data };
  }
  return { status: 'OFFLINE', source: 'Supabase Database', timestamp: new Date().toISOString(), data: null, error: res.error };
};

export const getHealth = async (): Promise<{ status: string; geminiConfigured: boolean; timestamp?: string }> => {
  const res = await apiFetch('/api/health');
  if (res.ok && res.data) {
    return res.data;
  }
  return { status: 'error', geminiConfigured: false };
};

export const analyzeImage = async (imgData: string, locationContext: string, zoneName?: string, state?: string, explicitMimeType?: string): Promise<ApiSourceResponse<any>> => {
  let mimeType = explicitMimeType || 'image/jpeg';
  const match = imgData.match(/^data:([^;]+);base64,/);
  if (match) {
    mimeType = match[1];
  }

  const cleanBase64 = imgData.replace(/^data:[^;]+;base64,/, '').trim();

  const res = await apiFetch(`/api/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      image: cleanBase64, 
      imageBase64: cleanBase64, 
      mimeType, 
      locationContext, 
      zoneName, 
      state 
    })
  });
  if (res.ok && res.data?.success) {
    return { status: 'LIVE', source: 'Gemini 2.5 Flash', timestamp: new Date().toISOString(), data: res.data };
  }
  return { 
    status: 'OFFLINE', 
    source: 'Gemini 2.5 Flash', 
    timestamp: new Date().toISOString(), 
    data: null, 
    error: res.data?.message || res.error || 'GEMINI_UNAVAILABLE' 
  };
};

