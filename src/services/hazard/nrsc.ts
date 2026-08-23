import { RiskZone, HistoricalEvent } from '../../types';
import { panIndiaZones } from '../../data/panIndiaData';

export interface NRSCAtlasStats {
  totalHistoricalEvents: number;
  highestSeverityEvent: HistoricalEvent | null;
  landslideDensityScore: number;
  dataFreshness: string;
}

export class NRSCAtlasService {
  private static instance: NRSCAtlasService;

  public static getInstance(): NRSCAtlasService {
    if (!NRSCAtlasService.instance) {
      NRSCAtlasService.instance = new NRSCAtlasService();
    }
    return NRSCAtlasService.instance;
  }

  public getHistoricalLandslidesForZone(zone: RiskZone): NRSCAtlasStats {
    const events = zone.historicalEvents || [];
    const criticalEvent = events.find((e) => e.severity === 'Critical') || events[0] || null;
    const densityScore = Math.min(100, Math.round((zone.historicalLandslideCount / 25) * 100));

    return {
      totalHistoricalEvents: zone.historicalLandslideCount,
      highestSeverityEvent: criticalEvent,
      landslideDensityScore: densityScore,
      dataFreshness: 'NRSC ISRO Landslide Atlas National Inventory 2023-2024'
    };
  }

  public getAllHistoricalLandslidePoints(): { id: string; name: string; coordinates: [number, number]; count: number; state: string }[] {
    return panIndiaZones.map((z) => ({
      id: `NRSC-${z.id}`,
      name: `${z.name} Inventory Cluster`,
      coordinates: z.coordinates,
      count: z.historicalLandslideCount,
      state: z.state
    }));
  }
}

export const nrscService = NRSCAtlasService.getInstance();

export function getNrscHistoricalInventory(zone: RiskZone): NRSCAtlasStats {
  return nrscService.getHistoricalLandslidesForZone(zone);
}
