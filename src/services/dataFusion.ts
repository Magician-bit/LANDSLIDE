import {
  RiskZone,
  DynamicTrigger,
  RiskState,
  Scenario,
  TimelineStep,
  RiskModelConfig
} from '../types';
import { IMDWeatherService } from './weather/imd';
import { SentinelService } from './satellite/sentinel';
import { NCSService } from './seismic/ncs';
import { NRSCAtlasService } from './hazard/nrsc';
import { GSINLSMService } from './hazard/gsi';
import { CommunityReportsService } from './reports/reports';
import { calculateDynamicRisk } from '../intelligence/engine';

export class DataFusionService {
  private static instance: DataFusionService;
  private weatherService: IMDWeatherService;
  private sentinelService: SentinelService;
  private seismicService: NCSService;
  private nrscService: NRSCAtlasService;
  private gsiService: GSINLSMService;
  private reportsService: CommunityReportsService;

  private constructor() {
    this.weatherService = IMDWeatherService.getInstance();
    this.sentinelService = SentinelService.getInstance();
    this.seismicService = NCSService.getInstance();
    this.nrscService = NRSCAtlasService.getInstance();
    this.gsiService = GSINLSMService.getInstance();
    this.reportsService = CommunityReportsService.getInstance();
  }

  public static getInstance(): DataFusionService {
    if (!DataFusionService.instance) {
      DataFusionService.instance = new DataFusionService();
    }
    return DataFusionService.instance;
  }

  /**
   * Synthesize a multi-source normalized trigger for a specific Pan-India zone
   */
  public async getFusedTriggerForZone(zone: RiskZone, liveWeather = true): Promise<DynamicTrigger> {
    let weatherObs = {
      rainfall1h: 4.5,
      rainfall24h: 45.0,
      rainfallAnomaly: 1.2,
      forecast24h: 50.0,
      soilMoisture: 60.0
    };

    if (liveWeather) {
      const live = await this.weatherService.getObservationForZone(zone);
      weatherObs = {
        rainfall1h: (live.rainfall1h || 0),
        rainfall24h: (live.rainfall24h || 0),
        rainfallAnomaly: (live.rainfallAnomaly || 1),
        forecast24h: (live.forecast24h || 0),
        soilMoisture: Math.min(95, Math.max(30, ((live.rainfall24h || 0) * 0.65) + 30))
      };
    }

    const insar = await this.sentinelService.getInSARForZone(zone);
    const seismic = await this.seismicService.getNearestEarthquake(zone);
    const reports = this.reportsService.getReportsForZone(zone);

    // Calculate community report score (verified/severe reports boost confidence & local activity score)
    let reportScore = 0;
    if (reports.length > 0) {
      const verified = reports.filter(r => r.verificationStatus === 'CONFIRMED').length;
      const critical = reports.filter(r => r.severity === 'Critical' || r.severity === 'Severe').length;
      reportScore = Math.min(100, (reports.length * 15) + (verified * 25) + (critical * 20));
    }

    return {
      rainfall1h: weatherObs.rainfall1h,
      rainfall3h: Number((weatherObs.rainfall1h * 2.6).toFixed(1)),
      rainfall6h: Number((weatherObs.rainfall1h * 4.8).toFixed(1)),
      rainfall24h: (weatherObs.rainfall24h || 0),
      rainfall72h: Number(((weatherObs.rainfall24h || 0) * 1.8).toFixed(1)),
      rainfall7d: Number(((weatherObs.rainfall24h || 0) * 3.2).toFixed(1)),
      rainfallAnomaly: (weatherObs.rainfallAnomaly || 1),
      forecastRainfall24h: weatherObs.forecast24h,
      soilMoisture: weatherObs.soilMoisture,
      soilMoistureTrend: 1.8,
      antecedentPrecipitation: Math.max(25, Number(((weatherObs.rainfall24h || 0) * 1.3).toFixed(1))),
      slopeInstabilityFactor: Math.min(100, (zone.environmentalFeatures.slope / 45) * 60 + 20),
      groundDeformationMmMonth: Math.abs(insar.deformationRateMmMonth),
      groundVibration: seismic.hasNearbyEvent ? (seismic.magnitude * 0.4) : 1.0,
      nearestEarthquake: seismic.hasNearbyEvent ? {
        magnitude: seismic.magnitude,
        distanceKm: seismic.distanceKm,
        depthKm: seismic.depthKm,
        time: seismic.timestamp,
        locationName: seismic.locationName
      } : null,
      temperatureAnomaly: 1.1,
      communityReportScore: reportScore
    };
  }

  /**
   * Complete multi-source assessment for a zone
   */
  public evaluateZoneRisk(
    zone: RiskZone,
    trigger: DynamicTrigger,
    scenario?: Partial<Scenario> | null,
    timelineStep: TimelineStep = 'NOW',
    config?: RiskModelConfig
  ): RiskState {
    const reports = this.reportsService.getReportsForZone(zone);
    return calculateDynamicRisk(zone, trigger, scenario, reports, timelineStep, config);
  }
}
