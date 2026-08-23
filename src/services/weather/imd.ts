import { RiskZone, DataProvenance } from '../../types';
import { getWeather } from '../api';

export interface WeatherObservation {
  rainfall1h: number | null;
  rainfall24h: number | null;
  rainfallAnomaly: number | null;
  forecast24h: number | null;
  forecast48h?: number | null;
  temperature: number | null;
  humidity: number | null;
  hourly?: any[];
  sourceProvider: string;
  stationName: string;
  isRealLive: boolean;
  statusText: string;
  provenance?: DataProvenance;
}

export class IMDWeatherService {
  private static instance: IMDWeatherService;

  public static getInstance(): IMDWeatherService {
    if (!IMDWeatherService.instance) {
      IMDWeatherService.instance = new IMDWeatherService();
    }
    return IMDWeatherService.instance;
  }

  public async getObservationForZone(zone: RiskZone): Promise<WeatherObservation> {
    const [lat, lon] = zone.coordinates;
    const res = await getWeather(lat, lon);

    if (res.status === 'LIVE' && res.data?.success && res.data?.data) {
      const d = res.data.data;
      const prov = res.data.provenance;
      return {
        ...d,
        sourceProvider: prov?.sourceName || 'Open-Meteo Global NWP',
        stationName: `${zone.district} Grid (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`,
        isRealLive: true,
        statusText: 'LIVE OBSERVATION (NWP)',
        provenance: prov
      };
    }

    return {
      rainfall1h: null,
      rainfall24h: null,
      rainfallAnomaly: null,
      forecast24h: null,
      temperature: null,
      humidity: null,
      sourceProvider: 'Weather Service Offline',
      stationName: `${zone.district} Grid`,
      isRealLive: false,
      statusText: 'OFFLINE',
      provenance: {
        sourceName: 'System Offline',
        providerAgency: 'None',
        dataType: 'OBSERVED',
        provenanceKind: 'OBSERVED_NWP',
        isLive: false,
        isObserved: false,
        isForecast: false,
        isModelled: false,
        isGovernmentFeed: false,
        timestamp: new Date().toISOString(),
        confidenceScore: 0,
        disclaimer: 'Live meteorological telemetry is currently unreachable. No data available.'
      }
    };
  }
}

export const imdService = IMDWeatherService.getInstance();

export async function fetchMeteorologicalData(zone: RiskZone): Promise<WeatherObservation> {
  return imdService.getObservationForZone(zone);
}
