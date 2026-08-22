export type AppMode = 'LIVE' | 'FORECAST' | 'SIMULATE' | 'RESPOND';

export type TimelineStep = 'PAST_24H' | 'PAST_6H' | 'NOW' | 'T_PLUS_6H' | 'T_PLUS_12H' | 'T_PLUS_24H' | 'T_PLUS_48H';

export interface EnvironmentalFeatures {
  elevation: number;
  slope: number;
  aspect: string;
  terrainRuggedness: number;
  landCover: string;
  ndviChange: number;
  drainage: string;
}

export interface HistoricalEvent {
  id: string;
  date: string;
  severity: string;
  affectedArea: number;
  impact: string;
}

export interface RiskZone {
  id: string;
  name: string;
  coordinates: [number, number];
  radius: number;
  staticSusceptibility: number;
  environmentalFeatures: EnvironmentalFeatures;
  historicalEvents: HistoricalEvent[];
  population: number;
}

export interface DynamicTrigger {
  rainfall1h: number;
  rainfall24h: number;
  rainfallAnomaly: number;
  soilMoisture: number;
  soilMoistureTrend: number;
  antecedentPrecipitation: number;
  slopeInstabilityFactor?: number;
  groundVibration?: number;
  temperatureAnomaly?: number;
}

export interface RiskState {
  currentRisk: number;
  triggerScore: number;
  momentum: number;
  hazardWindow: [string, string];
  forecast: {
    t6: number;
    t12: number;
    t24: number;
    t48: number;
  };
  confidence: number;
  primaryDriver: string;
  featureContributions: { feature: string; value: number; percentage: number }[];
  explanation: string;
  status: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface FieldReport {
  id: string;
  reporter: string;
  timestamp: string;
  location: [number, number];
  zoneId: string;
  type: string;
  description: string;
  aiClassification: string;
  aiConfidence: number;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
  imageUrl: string;
}

export interface InfrastructureNode {
  id: string;
  type: 'settlement' | 'hospital' | 'shelter' | 'bridge' | 'road' | 'power' | 'communication';
  name: string;
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
  type: 'road' | 'bridge';
  distance: number; // roughly travel time in minutes
  lengthKm?: number;
  status: 'active' | 'threatened' | 'blocked' | 'failed';
  riskScore?: number;
  zoneId?: string;
}

export interface Scenario {
  active: boolean;
  type: 'Baseline' | 'Heavy Rain' | 'Heavy Rainfall' | 'Extreme Rainfall' | 'Soil Saturation' | 'Slope Failure' | 'Road Failure' | 'Road Blockage' | 'Bridge Failure' | 'Multi-Zone Landslide' | 'Multiple Failures' | 'Extreme Weather Cascade' | 'Custom Simulation';
  rainfallMultiplier: number;
  duration: number; // hours
  soilMoistureMultiplier: number;
  slopeInstabilityMultiplier?: number;
  selectedZoneId: string | null;
  failedInfrastructureIds: string[];
}

export interface Alert {
  id: string;
  type: 'RISK_ESCALATION' | 'INFRASTRUCTURE_FAILURE' | 'ISOLATION_WARNING' | 'WEATHER_ALERT';
  zoneId: string | null;
  infrastructureId?: string | null;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  coordinates?: [number, number];
}

export interface PredictionResult {
  zoneId: string;
  zoneName: string;
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
