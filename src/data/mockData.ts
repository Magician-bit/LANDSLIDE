import { RiskZone, InfrastructureNode, InfrastructureEdge, FieldReport } from '../types';

export const mockZones: RiskZone[] = [
  {
    id: 'Z-042',
    name: 'Tista Valley Sector A',
    coordinates: [27.0500, 88.2667], // near Darjeeling
    radius: 1200,
    staticSusceptibility: 78,
    population: 2840,
    environmentalFeatures: {
      elevation: 2042,
      slope: 38,
      aspect: 'South-East',
      terrainRuggedness: 8.4,
      landCover: 'Degraded Forest',
      ndviChange: -0.12,
      drainage: 'High Convergence'
    },
    historicalEvents: [
      {
        id: 'EV-2021-04',
        date: '2021-07-14',
        severity: 'High',
        affectedArea: 4.2,
        impact: 'Road blocked for 3 days, 12 houses damaged'
      }
    ]
  },
  {
    id: 'Z-018',
    name: 'Kalimpong Ridge',
    coordinates: [27.0600, 88.4700],
    radius: 900,
    staticSusceptibility: 65,
    population: 5120,
    environmentalFeatures: {
      elevation: 1250,
      slope: 25,
      aspect: 'West',
      terrainRuggedness: 5.2,
      landCover: 'Mixed Agriculture',
      ndviChange: -0.05,
      drainage: 'Moderate'
    },
    historicalEvents: []
  },
  {
    id: 'Z-091',
    name: 'Kurseong Slopes',
    coordinates: [26.8833, 88.2833],
    radius: 1500,
    staticSusceptibility: 82,
    population: 4300,
    environmentalFeatures: {
      elevation: 1458,
      slope: 42,
      aspect: 'South',
      terrainRuggedness: 9.1,
      landCover: 'Tea Garden',
      ndviChange: -0.15,
      drainage: 'High Convergence'
    },
    historicalEvents: [
      {
        id: 'EV-2023-01',
        date: '2023-09-02',
        severity: 'Moderate',
        affectedArea: 1.5,
        impact: 'Minor debris flow, no casualties'
      }
    ]
  }
];

export const mockNodes: InfrastructureNode[] = [
  { id: 'S-1', type: 'settlement', name: 'Tista Village', coordinates: [27.0550, 88.2650], population: 1500 },
  { id: 'S-2', type: 'settlement', name: 'Upper Ridge Community', coordinates: [27.0450, 88.2700], population: 1340 },
  { id: 'H-1', type: 'hospital', name: 'District Hospital', coordinates: [27.0350, 88.2500], capacity: 200 },
  { id: 'S-3', type: 'settlement', name: 'Kalimpong Outskirts', coordinates: [27.0650, 88.4750], population: 5120 },
  { id: 'H-2', type: 'hospital', name: 'Kalimpong Med', coordinates: [27.0700, 88.4800], capacity: 150 },
  { id: 'B-17', type: 'bridge', name: 'Tista Bridge B-17', coordinates: [27.0500, 88.2600] }
];

export const mockEdges: InfrastructureEdge[] = [
  { id: 'E-1', source: 'S-1', target: 'B-17', type: 'road', distance: 10, status: 'active' },
  { id: 'E-2', source: 'B-17', target: 'H-1', type: 'road', distance: 15, status: 'active' },
  { id: 'E-3', source: 'S-2', target: 'S-1', type: 'road', distance: 12, status: 'active' },
  { id: 'E-4', source: 'S-2', target: 'H-1', type: 'road', distance: 35, status: 'active' }, // Alternative longer route
  { id: 'E-5', source: 'S-3', target: 'H-2', type: 'road', distance: 8, status: 'active' }
];

export const mockFieldReports: FieldReport[] = [
  {
    id: 'R-1001',
    reporter: 'Field Team Alpha',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    location: [27.0510, 88.2660],
    zoneId: 'Z-042',
    type: 'Slope Crack',
    description: 'Tension crack observed on upper slope, approximately 15cm wide.',
    aiClassification: 'High Risk Tension Crack',
    aiConfidence: 92,
    verificationStatus: 'Verified',
    imageUrl: `${import.meta.env.BASE_URL}images/reports/crack.jpg`
  }
];

export const initialDynamicTrigger = {
  rainfall1h: 0,
  rainfall24h: 12,
  rainfallAnomaly: 1.2,
  soilMoisture: 45,
  soilMoistureTrend: 0.5,
  antecedentPrecipitation: 45
};
