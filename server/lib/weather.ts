export async function fetchWeather(lat: number, lon: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,temperature_2m,relative_humidity_2m,surface_pressure&daily=precipitation_sum,precipitation_probability_max&hourly=precipitation,temperature_2m,precipitation_probability&timezone=Asia%2FKolkata&forecast_days=3`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      const currentRain = data.current?.precipitation || 0;
      const dailySum = data.daily?.precipitation_sum?.[0] || 0;
      const forecast24h = data.daily?.precipitation_sum?.[1] || 0;
      const forecast48h = data.daily?.precipitation_sum?.[2] || 0;
      const temp = data.current?.temperature_2m || null;
      const humidity = data.current?.relative_humidity_2m || null;
      
      const hourly = data.hourly?.time?.map((t: string, i: number) => ({
        time: t,
        precipitation: data.hourly.precipitation[i],
        temperature: data.hourly.temperature_2m[i],
        prob: data.hourly.precipitation_probability[i]
      })) || [];

      return {
        success: true,
        data: {
          rainfall1h: Number(currentRain.toFixed(1)),
          rainfall24h: Number(dailySum.toFixed(1)),
          forecast24h: Number(forecast24h.toFixed(1)),
          forecast48h: Number(forecast48h.toFixed(1)),
          temperature: temp,
          humidity,
          hourly,
          isObserved: true,
          isLive: true
        },
        provenance: {
          sourceName: 'Open-Meteo Global NWP (ECMWF IFS & GFS assimilation)',
          providerAgency: 'Open-Meteo / ECMWF',
          dataType: 'OBSERVED',
          provenanceKind: 'OBSERVED_NWP',
          isLive: true,
          isObserved: true,
          isForecast: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (e) {
    console.error("Weather fetch failed:", e);
  }
  return null;
}
