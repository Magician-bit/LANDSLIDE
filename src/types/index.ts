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

export interface EnvironmentalFeatures {
  elevation: number;
  slope: number;
  aspect: string;
  terrainRuggedness: number;
  landCover: string;
  ndviChange: number;
  drainage: string;
}

export interface DynamicTrigger {
  rainfall1h: number;
  rainfall24h: number;
  rainfallAnomaly: number;
  soilMoisture: number;
  soilMoistureTrend: number;
  antecedentPrecipitation: number;
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
  };
  confidence: number;
  primaryDriver: string;
  featureContributions: { feature: string; value: number }[];
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

export interface HistoricalEvent {
  id: string;
  date: string;
  severity: string;
  affectedArea: number;
  impact: string;
}

export interface InfrastructureNode {
  id: string;
  type: 'settlement' | 'hospital' | 'shelter' | 'bridge' | 'road' | 'power' | 'communication';
  name: string;
  coordinates: [number, number];
  population?: number;
  capacity?: number;
}

export interface InfrastructureEdge {
  id: string;
  source: string;
  target: string;
  type: 'road' | 'bridge';
  distance: number; // roughly travel time in minutes
  status: 'active' | 'blocked' | 'failed';
}

export interface Scenario {
  active: boolean;
  type: 'Baseline' | 'Heavy Rainfall' | 'Soil Saturation' | 'Landslide' | 'Road Blockage' | 'Bridge Failure' | 'Multiple Failures';
  rainfallMultiplier: number;
  duration: number; // hours
  soilMoistureMultiplier: number;
  selectedZoneId: string | null;
  failedInfrastructureIds: string[];
}

export interface Alert {
  id: string;
  type: 'RISK_ESCALATION' | 'INFRASTRUCTURE_FAILURE' | 'ISOLATION_WARNING';
  zoneId: string | null;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
}
