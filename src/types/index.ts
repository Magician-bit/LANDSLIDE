export type AppView =
  | 'live'
  | 'forecast'
  | 'simulate'
  | 'respond'
  | 'ai'
  | 'reports'
  | 'data'
  | 'alerts';

export type Region =
  | 'india'
  | 'western-ghats'
  | 'western-himalayas'
  | 'eastern-himalayas'
  | 'northeast-hills'
  | 'nilgiris-eastern';

export type AppMode = 'LIVE' | 'FORECAST' | 'SIMULATE' | 'RESPOND';

export type TimelineStep = 'PAST_24H' | 'PAST_6H' | 'NOW' | 'T_PLUS_6H' | 'T_PLUS_12H' | 'T_PLUS_24H' | 'T_PLUS_48H';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';

export type RegionCategory =
  | 'Western Himalayas'
  | 'Eastern Himalayas'
  | 'Northeast Hills'
  | 'Western Ghats'
  | 'Eastern Ghats & Nilgiris'
  | 'Central Indian Highlands';

export type IncidentType =
  | 'Landslide'
  | 'Rockfall'
  | 'Mudslide'
  | 'Mudflow'
  | 'Road Blocked'
  | 'Road Blockage'
  | 'Ground Crack'
  | 'Tension Cracks'
  | 'Slope Failure'
  | 'Slope Subsidence'
  | 'Debris Flow'
  | 'Unknown';

export type IncidentSeverity = 'Minor' | 'Low' | 'Moderate' | 'Severe' | 'Critical';

export type ReportStatus = 'UNVERIFIED' | 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED';

export type ProvenanceKind =
  | 'OBSERVED_NWP'      // e.g. Open-Meteo Global NWP with ECMWF / GFS assimilation
  | 'GOVERNMENT_AWS'    // direct IMD AWS station telemetry if available
  | 'SEISMIC_TELEMETRY' // USGS / NCS automated earthquake feeds
  | 'INSAR_RADAR'       // Copernicus Sentinel-1 InSAR surface deformation
  | 'GEOLOGY_BASELINE'  // Geological Survey of India (GSI) 1:50k NLSM Atlas
  | 'SATELLITE_ATLAS'   // NRSC ISRO National Landslide Susceptibility & Inventory
  | 'COMMUNITY_REPORT'  // Citizen ground observations & volunteer reports
  | 'MODELLED_FUSION'   // Dynamic Multi-Factor Risk fusion output
  | 'CALIBRATED_NORM';  // Offline climatological reference / regional baseline

export interface DataProvenance {
  sourceName: string;
  providerAgency: string;
  dataType: 'OBSERVED' | 'FORECAST' | 'MODELLED' | 'HISTORICAL' | 'COMMUNITY' | 'BASELINE';
  provenanceKind: ProvenanceKind;
  isLive: boolean;
  isObserved: boolean;
  isForecast: boolean;
  isModelled: boolean;
  isGovernmentFeed: boolean;
  timestamp: string;
  confidenceScore: number; // 0 - 100
  freshnessSeconds?: number;
  attributionUrl?: string;
  disclaimer?: string;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  agency: string;
  type: string;
  status: 'LIVE' | 'CONNECTED' | 'PARTIAL' | 'BASELINE' | 'HISTORICAL' | 'OFFLINE' | 'STALE' | 'NOT_CONFIGURED';
  lastUpdated: string;
  details: string;
  coverage: string;
  disclaimer?: string;
  requiresKey?: boolean;
  isLive?: boolean;
}

export interface DataSourceInfo {
  id: string;
  name: string;
  provider: string;
  category: 'METEOROLOGY' | 'SATELLITE' | 'SEISMIC' | 'GEOLOGY' | 'HISTORICAL' | 'COMMUNITY';
  status: DataSourceStatus['status'];
  lastUpdated: string;
  freshnessMinutes: number;
  coverage: string;
  description: string;
  isRealLive: boolean;
  endpointUrl?: string;
  requiresAuth: boolean;
  authConfigured: boolean;
}

export interface NormalizedObservation {
  source: string;
  name: string;
  value: string | number;
  unit?: string;
  status: 'LIVE' | 'STALE' | 'OFFLINE' | 'BASELINE';
  timestamp: string;
}

export interface EnvironmentalFeatures {
  elevation: number; // meters
  slope: number; // degrees
  aspect: string;
  terrainRuggedness: number; // 0-10 index
  landCover: string;
  ndviChange: number; // vegetation index delta
  drainage: string;
  lithology?: string;
  geologicalFormation?: string;
  geologicalUnit?: string;
  gsiSusceptibilityClass?: 'Very High' | 'High' | 'Moderate' | 'Low';
  soilType?: string;
  faultDistanceKm?: number;
}

export interface HistoricalEvent {
  id: string;
  date: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  affectedArea: number; // sq km
  impact: string;
  source?: 'NRSC_ATLAS' | 'GSI_INVENTORY' | 'STATE_SDMA' | 'COMMUNITY_RECORD';
  triggerType?: 'Monsoon Rainfall' | 'Cloudburst' | 'Cyclone' | 'Seismic' | 'Anthropogenic';
}

export interface RiskZone {
  id: string;
  name: string;
  state: string;
  district: string;
  hillRange?: 'Western Himalayas' | 'Eastern Himalayas' | 'Northeast Hills' | 'Western Ghats' | 'Eastern Ghats' | 'Nilgiri Hills' | 'Central Indian Highlands';
  regionCategory?: RegionCategory;
  coordinates: [number, number];
  radius: number; // meters
  staticSusceptibility: number; // 0-100 GSI/NRSC baseline
  baselineSusceptibilityClass?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
  gsiSusceptibilityClass?: 'Very High' | 'High' | 'Moderate' | 'Low';
  environmentalFeatures: EnvironmentalFeatures;
  historicalEvents: HistoricalEvent[];
  historicalLandslideCount: number;
  historicalLandslidesCount?: number;
  nrscInventoryDensity?: number;
  population: number;
}

export interface DynamicTrigger {
  rainfall1h: number; // mm
  rainfall3h?: number; // mm
  rainfall6h?: number; // mm
  rainfall24h: number; // mm
  rainfall72h?: number; // mm
  rainfall7d?: number; // mm
  rainfallAnomaly: number; // ratio vs normal (1.0 = normal)
  forecastRainfall24h?: number; // mm
  soilMoisture: number; // 0-100% saturation
  soilMoistureTrend: number; // % change per 6h
  antecedentPrecipitation: number; // API index mm
  slopeInstabilityFactor?: number; // 0-100
  groundDeformationRateMm?: number; // mm/month from InSAR
  groundDeformationMmMonth?: number; // mm/month from InSAR Sentinel-1
  groundVibration?: number; // seismic acceleration / PGA
  nearestEarthquake?: {
    magnitude: number;
    distanceKm: number;
    time: string;
    depthKm: number;
    locationName: string;
  } | null;
  temperatureAnomaly?: number;
  communityReportScore?: number; // 0-100 based on clustered reports
  communityReportActivity?: number;
}

export interface RiskFeatureContribution {
  feature: string;
  source: string;
  value: number;
  percentage: number;
  isAvailable: boolean;
  statusText: string;
}

export interface RiskState {
  currentRisk: number; // 0-100 dynamic composite
  baselineSusceptibility?: number; // 0-100 static GSI/NRSC
  triggerScore?: number; // 0-100 dynamic triggers
  momentum?: number; // rate of change
  hazardWindow: [string, string];
  forecast: {
    t6: number;
    t12: number;
    t24: number;
    t48: number;
  };
  confidence: number; // data coverage & consensus %
  dataCoverage?: number; // % of data sources available
  primaryDriver: string;
  featureContributions: RiskFeatureContribution[];
  explanation: string;
  status: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
  dataSourcesUsed?: string[];
}

export interface FieldReport {
  id: string;
  reporter?: string;
  reporterName?: string;
  reporterContact?: string;
  timestamp: string;
  location: [number, number];
  locationName: string;
  state: string;
  district?: string;
  zoneId?: string;
  type?: IncidentType;
  incidentType?: IncidentType;
  severity: IncidentSeverity;
  description: string;
  imageUrl?: string;
  status?: ReportStatus;
  verificationStatus?: ReportStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  impactFlags?: {
    roadAffected: boolean;
    buildingAffected: boolean;
    riverBlocked: boolean;
    peopleTrapped: boolean;
    evacuationRequired: boolean;
  };
  affectedRoad?: boolean;
  affectedBuilding?: boolean;
  riverBlocked?: boolean;
  peopleTrapped?: boolean;
  evacuationRequired?: boolean;
  clusterCount?: number;
}

export interface SeismicEvent {
  id: string;
  magnitude: number;
  depthKm: number;
  timestamp: string;
  locationName: string;
  state: string;
  coordinates: [number, number];
  source: 'NCS_INDIA' | 'USGS_GLOBAL';
  intensityCategory: 'LIGHT' | 'MODERATE' | 'STRONG' | 'MAJOR';
}

export interface SatelliteObservation {
  id: string;
  satellite: 'Sentinel-1 SAR' | 'Sentinel-2 Optical' | 'Landsat-8/9' | 'ISRO Cartosat';
  timestamp: string;
  targetRegion: string;
  coordinates: [number, number];
  observationType: 'InSAR Surface Deformation' | 'Optical Land Cover & Scars' | 'Soil Moisture Radar';
  value: string;
  deformationRateMmMonth?: number;
  status: 'AVAILABLE' | 'PARTIAL' | 'CLOUD_OBSCURED' | 'NO_RECENT_PASS';
  confidenceScore: number;
}

export interface InfrastructureNode {
  id: string;
  type: 'settlement' | 'hospital' | 'shelter' | 'bridge' | 'road' | 'power' | 'communication';
  name: string;
  state?: string;
  district?: string;
  coordinates: [number, number];
  population?: number;
  capacity?: number;
  zoneId?: string;
  status?: 'operational' | 'threatened' | 'failed' | 'isolated';
}

export interface InfrastructureEdge {
  id: string;
  name?: string;
  source: string;
  target: string;
  type: 'road' | 'bridge' | 'highway';
  highwayRef?: string;
  distance: number; // travel time minutes
  lengthKm?: number;
  status: 'active' | 'threatened' | 'blocked' | 'failed';
  riskScore?: number;
  zoneId?: string;
}

export interface Scenario {
  active: boolean;
  type:
    | 'Baseline'
    | 'Heavy Rain'
    | 'Heavy Rainfall'
    | 'Extreme Rainfall'
    | 'Cloudburst Event'
    | 'Earthquake Trigger'
    | 'Soil Saturation'
    | 'Slope Failure'
    | 'Road Failure'
    | 'Road Blockage'
    | 'Bridge Failure'
    | 'Community Report Surge'
    | 'Multi-Zone Landslide'
    | 'Extreme Weather Cascade'
    | 'Multiple Failures'
    | 'Custom Simulation';
  rainfallMultiplier: number;
  duration: number; // hours
  soilMoistureMultiplier: number;
  slopeInstabilityMultiplier?: number;
  groundDeformationMultiplier?: number;
  seismicMagnitude?: number;
  seismicTriggerActive?: boolean;
  communityReportMultiplier?: number;
  selectedZoneId: string | null;
  failedInfrastructureIds: string[];
}

export interface Alert {
  id: string;
  type:
    | 'RISK_ESCALATION'
    | 'EXTREME_RAINFALL'
    | 'SEISMIC_TRIGGER'
    | 'SATELLITE_DEFORMATION'
    | 'INFRASTRUCTURE_FAILURE'
    | 'ISOLATION_WARNING'
    | 'COMMUNITY_REPORT_CLUSTER';
  zoneId: string | null;
  zoneName?: string;
  state?: string;
  infrastructureId?: string | null;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  coordinates?: [number, number];
  source?: string;
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  timeDisplay: string;
  type: 'EARTHQUAKE' | 'RAINFALL_ANOMALY' | 'COMMUNITY_REPORT' | 'SATELLITE_DEFORMATION' | 'INFRASTRUCTURE_ALERT' | 'SYSTEM_UPDATE';
  title: string;
  location: string;
  coordinates?: [number, number];
  zoneId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

export interface PredictionResult {
  zoneId: string;
  zoneName: string;
  state?: string;
  currentRisk: number;
  predictedRisk: number;
  escalation: number;
  criticalWindow: [string, string];
  confidence: number;
  consistencyReason: string;
  timelineEvolution: {
    time: string;
    risk: number;
    rainfall: number;
    soilMoisture: number;
    status: string;
  }[];
  primaryDrivers: { feature: string; contribution: number }[];
}

export interface CascadingNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'TRIGGER' | 'SOIL' | 'STABILITY' | 'HAZARD' | 'INFRASTRUCTURE' | 'COMMUNITY' | 'RESPONSE';
  targetType: 'zone' | 'edge' | 'node' | 'general';
  targetId?: string;
  severity: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  coordinates?: [number, number];
}

export interface EvacuationRoute {
  sourceSettlementId: string;
  sourceName: string;
  targetFacilityId: string;
  targetName: string;
  targetType: 'hospital' | 'shelter';
  pathNodeIds: string[];
  pathEdgeIds: string[];
  distanceKm: number;
  estimatedTimeMin: number;
  isBlocked: boolean;
  riskFactor: number;
}

export interface EvacuationPlan {
  totalPopulationExposed: number;
  populationRequiringEvacuation: number;
  sheltersRequired: number;
  availableShelterCapacity: number;
  activeShelters: {
    id: string;
    name: string;
    capacity: number;
    assignedPopulation: number;
    coordinates: [number, number];
  }[];
  routes: {
    settlementId: string;
    settlementName: string;
    population: number;
    isolated: boolean;
    primaryRoute: EvacuationRoute | null;
    backupRoute: EvacuationRoute | null;
  }[];
  isolatedCommunitiesCount: number;
  isolatedPopulation: number;
  threatenedInfrastructureCount: number;
  actionProtocol: {
    step: number;
    phase: string;
    title: string;
    description: string;
    priority: 'IMMEDIATE' | 'HIGH' | 'ROUTINE';
  }[];
}

export interface ActionLog {
  id: string;
  timestamp: string;
  timeDisplay: string;
  action: string;
  details: string;
  mode: AppMode;
}

export interface RiskModelConfig {
  weightBaseline: number; // default 0.30 (GSI / NRSC static)
  weightRainfall: number; // default 0.35 (IMD / GPM precip + anomaly)
  weightSoilMoisture: number; // default 0.15
  weightSlopeInstability: number; // default 0.10
  weightSatelliteDeformation: number; // default 0.05
  weightSeismicTrigger: number; // default 0.03
  weightCommunityReports: number; // default 0.02
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  distance: number;
  source: string;
}
