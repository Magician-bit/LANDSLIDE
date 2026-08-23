export async function fetchSeismic() {
  try {
    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const geojson = await apiRes.json();
      const features = (geojson.features || []).filter((f: any) => {
        const [lon, lat] = f.geometry?.coordinates || [0, 0];
        return lat >= 5 && lat <= 38 && lon >= 68 && lon <= 98;
      });

      const events = features.slice(0, 20).map((f: any) => ({
        id: f.id,
        magnitude: f.properties?.mag || 3.0,
        depthKm: f.geometry?.coordinates?.[2] || 10,
        timestamp: new Date(f.properties?.time || Date.now()).toISOString(),
        locationName: f.properties?.place || 'Regional Tectonic Margin',
        state: 'Indian Plate Margin',
        coordinates: [f.geometry?.coordinates?.[1] || 25, f.geometry?.coordinates?.[0] || 80],
        source: 'USGS',
        intensityCategory: (f.properties?.mag || 0) >= 5 ? 'MAJOR' : (f.properties?.mag || 0) >= 4 ? 'STRONG' : 'MODERATE'
      }));

      return {
        success: true,
        count: events.length,
        events,
        provenance: {
          sourceName: 'USGS Real-Time Earthquake Hazards Program',
          providerAgency: 'USGS',
          dataType: 'OBSERVED',
          provenanceKind: 'SEISMIC_TELEMETRY',
          isLive: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (e) {
    console.error("Seismic fetch failed:", e);
  }
  return null;
}
