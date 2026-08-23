export async function fetchFacilities(lat: number, lon: number, radiusKm: number = 10) {
  try {
    const radiusMeters = radiusKm * 1000;
    // Query hospitals, fire stations, police stations in radius
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        node["amenity"="fire_station"](around:${radiusMeters},${lat},${lon});
        node["amenity"="police"](around:${radiusMeters},${lat},${lon});
        node["amenity"="school"](around:${radiusMeters},${lat},${lon});
        node["amenity"="shelter"](around:${radiusMeters},${lat},${lon});
      );
      out body 20;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      const facilities = (data.elements || []).map((el: any) => ({
        id: el.id,
        name: el.tags?.name || 'Unnamed Facility',
        type: el.tags?.amenity || 'unknown',
        coordinates: [el.lat, el.lon],
        distance: Math.round(Math.hypot(lat - el.lat, (lon - el.lon) * Math.cos(lat * Math.PI / 180)) * 111.32 * 10) / 10,
        source: 'OpenStreetMap (Overpass)'
      }));

      return {
        success: true,
        count: facilities.length,
        facilities,
        provenance: {
          sourceName: 'OpenStreetMap',
          providerAgency: 'Overpass API',
          dataType: 'OBSERVED',
          isLive: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (e) {
    console.error("Facilities fetch failed:", e);
  }
  return null;
}
