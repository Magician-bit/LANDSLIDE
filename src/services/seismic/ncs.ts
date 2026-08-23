import { SeismicEvent, RiskZone, DataProvenance } from '../../types';
import { getSeismic } from '../api';

export interface NearestEarthquakeResult {
  hasNearbyEvent: boolean;
  distanceKm: number;
  magnitude: number;
  depthKm: number;
  locationName: string;
  timestamp: string;
  source: string;
  dynamicTriggerMultiplier: number;
  provenance?: DataProvenance;
}

export class NCSService {
  private static instance: NCSService;

  public static getInstance(): NCSService {
    if (!NCSService.instance) {
      NCSService.instance = new NCSService();
    }
    return NCSService.instance;
  }

  public async getRecentEvents(): Promise<SeismicEvent[]> {
    const res = await getSeismic();
    if (res.status === 'LIVE' && res.data) {
      return res.data;
    }
    return [];
  }

  public async getNearestEarthquake(zone: RiskZone): Promise<NearestEarthquakeResult> {
    const [zLat, zLon] = zone.coordinates;
    const res = await getSeismic();
    
    let closestEvent: SeismicEvent | null = null;
    let minDistance = Infinity;

    if (res.status === 'LIVE' && res.data) {
      res.data.forEach((eq: any) => {
        const [eLat, eLon] = eq.coordinates;
        const dist = Math.hypot(zLat - eLat, (zLon - eLon) * Math.cos((zLat * Math.PI) / 180)) * 111.32;
        if (dist < minDistance) {
          minDistance = dist;
          closestEvent = eq;
        }
      });
    }

    if (closestEvent && minDistance < 150) {
      const eq = closestEvent as SeismicEvent;
      // Calculate dynamic shock multiplier based on magnitude and distance
      const attenuation = Math.max(0.1, 1 - minDistance / 150);
      const shockFactor = (eq.magnitude / 5.0) * attenuation;
      const multiplier = Number((1.0 + shockFactor * 0.4).toFixed(2));

      return {
        hasNearbyEvent: true,
        distanceKm: Math.round(minDistance),
        magnitude: eq.magnitude,
        depthKm: eq.depthKm || 10,
        locationName: eq.locationName,
        timestamp: eq.timestamp,
        source: eq.source || 'USGS_GLOBAL',
        dynamicTriggerMultiplier: multiplier
      };
    }

    return {
      hasNearbyEvent: false,
      distanceKm: Math.round(minDistance === Infinity ? 250 : minDistance),
      magnitude: 0,
      depthKm: 0,
      locationName: 'No Immediate Seismic Proximity',
      timestamp: new Date().toISOString(),
      source: res.status === 'LIVE' ? 'USGS / NCS Feed (No nearby)' : 'NCS Network Regional Baseline',
      dynamicTriggerMultiplier: 1.0
    };
  }
}

export const ncsService = NCSService.getInstance();

export async function fetchRecentSeismicActivity(): Promise<SeismicEvent[]> {
  return ncsService.getRecentEvents();
}

export async function calculateSeismicTriggerScore(zone: RiskZone): Promise<NearestEarthquakeResult> {
  return ncsService.getNearestEarthquake(zone);
}
