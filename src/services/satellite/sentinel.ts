import { SatelliteObservation, RiskZone } from '../../types';
import { getSatellite } from '../api';

export interface SatelliteObservationResult {
  hasObservation: boolean;
  deformationRateMmMonth: number;
  confidenceScore: number;
  satelliteName: string;
  timestamp: string;
  status: 'AVAILABLE' | 'PARTIAL' | 'NO_RECENT_PASS';
  description: string;
}

export class SentinelService {
  private static instance: SentinelService;
  public static getInstance(): SentinelService {
    if (!SentinelService.instance) {
      SentinelService.instance = new SentinelService();
    }
    return SentinelService.instance;
  }

  public async getInSARForZone(zone: RiskZone): Promise<SatelliteObservationResult> {
    const res = await getSatellite();
    
    if (res.status === 'LIVE' && res.data && res.data.deformationRateMmMonth !== null) {
      return {
        hasObservation: true,
        deformationRateMmMonth: res.data.deformationRateMmMonth,
        confidenceScore: 85,
        satelliteName: 'Sentinel-1 SAR',
        timestamp: res.timestamp || new Date().toISOString(),
        status: 'AVAILABLE',
        description: `Active deformation detected: ${res.data.deformationRateMmMonth} mm/month`
      };
    }
    
    return {
      hasObservation: false,
      deformationRateMmMonth: 0,
      confidenceScore: 0,
      satelliteName: 'Sentinel-1 SAR',
      timestamp: res.timestamp || new Date().toISOString(),
      status: 'NO_RECENT_PASS',
      description: 'NO RECENT OBSERVATION'
    };
  }
}
export const sentinelService = SentinelService.getInstance();
export async function getSatelliteDeformationSignal(zone: RiskZone): Promise<SatelliteObservationResult> {
  return sentinelService.getInSARForZone(zone);
}
