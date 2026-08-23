import { RiskZone, InfrastructureNode, InfrastructureEdge, FieldReport, DynamicTrigger } from '../types';

export const mockZones: RiskZone[] = [
  {
    id: 'Z-042',
    name: 'Tista Valley Sector A',
    state: 'West Bengal',
    district: 'Darjeeling',
    coordinates: [27.0500, 88.2667], // Darjeeling-Tista corridor
    radius: 1200,
    staticSusceptibility: 78,
    historicalLandslideCount: 14,
    population: 2840,
    environmentalFeatures: {
      elevation: 2042,
      slope: 38,
      aspect: 'South-East',
      terrainRuggedness: 8.4,
      landCover: 'Degraded Forest Slopes',
      ndviChange: -0.12,
      drainage: 'High Convergence'
    },
    historicalEvents: [
      {
        id: 'EV-2021-04',
        date: '2021-07-14',
        severity: 'High',
        affectedArea: 4.2,
        impact: 'NH-10 blocked for 3 days, 12 houses damaged, 420 evacuated.'
      },
      {
        id: 'EV-2018-09',
        date: '2018-09-22',
        severity: 'Critical',
        affectedArea: 6.8,
        impact: 'Massive debris flow following 180mm/24h monsoon surge.'
      }
    ]
  },
  {
    id: 'Z-018',
    name: 'Kalimpong Ridge',
    state: 'West Bengal',
    district: 'Kalimpong',
    coordinates: [27.0600, 88.4700],
    radius: 1100,
    staticSusceptibility: 65,
    historicalLandslideCount: 8,
    population: 5120,
    environmentalFeatures: {
      elevation: 1250,
      slope: 25,
      aspect: 'West',
      terrainRuggedness: 5.2,
      landCover: 'Mixed Agriculture & Settlements',
      ndviChange: -0.05,
      drainage: 'Moderate'
    },
    historicalEvents: [
      {
        id: 'EV-2022-08',
        date: '2022-08-11',
        severity: 'Moderate',
        affectedArea: 1.8,
        impact: 'Road subsidence on upper ridge connector.'
      }
    ]
  },
  {
    id: 'Z-091',
    name: 'Kurseong Slopes',
    state: 'West Bengal',
    district: 'Darjeeling',
    coordinates: [26.8833, 88.2833],
    radius: 1400,
    staticSusceptibility: 82,
    historicalLandslideCount: 19,
    population: 4300,
    environmentalFeatures: {
      elevation: 1458,
      slope: 42,
      aspect: 'South',
      terrainRuggedness: 9.1,
      landCover: 'Tea Garden Escarpment',
      ndviChange: -0.15,
      drainage: 'High Convergence'
    },
    historicalEvents: [
      {
        id: 'EV-2023-01',
        date: '2023-09-02',
        severity: 'High',
        affectedArea: 3.5,
        impact: 'Major slip above tea estate; road closed for 48 hours.'
      }
    ]
  },
  {
    id: 'Z-055',
    name: 'Mirik Highway Pass',
    state: 'West Bengal',
    district: 'Darjeeling',
    coordinates: [26.8900, 88.1800],
    radius: 1250,
    staticSusceptibility: 74,
    historicalLandslideCount: 11,
    population: 3450,
    environmentalFeatures: {
      elevation: 1767,
      slope: 35,
      aspect: 'South-West',
      terrainRuggedness: 7.8,
      landCover: 'Pine Forest & Slopes',
      ndviChange: -0.08,
      drainage: 'Moderate-High'
    },
    historicalEvents: [
      {
        id: 'EV-2020-07',
        date: '2020-07-29',
        severity: 'Moderate',
        affectedArea: 2.1,
        impact: 'Arterial transit cut off between Mirik and Siliguri.'
      }
    ]
  },
  {
    id: 'Z-073',
    name: 'Lebong Spur',
    state: 'West Bengal',
    district: 'Darjeeling',
    coordinates: [27.0750, 88.2750],
    radius: 1000,
    staticSusceptibility: 79,
    historicalLandslideCount: 12,
    population: 2900,
    environmentalFeatures: {
      elevation: 1820,
      slope: 39,
      aspect: 'North-East',
      terrainRuggedness: 8.6,
      landCover: 'Steep Terraced Forest',
      ndviChange: -0.11,
      drainage: 'High Convergence'
    },
    historicalEvents: [
      {
        id: 'EV-2021-10',
        date: '2021-10-19',
        severity: 'High',
        affectedArea: 3.9,
        impact: 'Upper spur tension crack led to 20,000m³ rockfall.'
      }
    ]
  },
  {
    id: 'Z-084',
    name: 'Rangpo River Gorge',
    state: 'Sikkim',
    district: 'Pakyong',
    coordinates: [27.1700, 88.5200],
    radius: 1300,
    staticSusceptibility: 85,
    historicalLandslideCount: 22,
    population: 3800,
    environmentalFeatures: {
      elevation: 680,
      slope: 44,
      aspect: 'East',
      terrainRuggedness: 9.5,
      landCover: 'Gorge Rockface & Scrub',
      ndviChange: -0.18,
      drainage: 'Severe Funneling'
    },
    historicalEvents: [
      {
        id: 'EV-2023-10',
        date: '2023-10-04',
        severity: 'Critical',
        affectedArea: 8.2,
        impact: 'Flash flood debris surge damaged lower highway bridge.'
      }
    ]
  },
  {
    id: 'Z-029',
    name: 'Singamari Escarpment',
    state: 'West Bengal',
    district: 'Darjeeling',
    coordinates: [27.0600, 88.2500],
    radius: 950,
    staticSusceptibility: 71,
    historicalLandslideCount: 7,
    population: 2400,
    environmentalFeatures: {
      elevation: 2134,
      slope: 36,
      aspect: 'West',
      terrainRuggedness: 7.4,
      landCover: 'High Alpine Ridge & Settlements',
      ndviChange: -0.07,
      drainage: 'Moderate'
    },
    historicalEvents: [
      {
        id: 'EV-2019-06',
        date: '2019-06-18',
        severity: 'Moderate',
        affectedArea: 1.4,
        impact: 'Retaining wall collapse along hillside pedestrian links.'
      }
    ]
  }
];


export const mockNodes: InfrastructureNode[] = [
  // Settlements
  { id: 'S-1', type: 'settlement', name: 'Tista Village', coordinates: [27.0550, 88.2650], population: 1500, zoneId: 'Z-042', status: 'operational' },
  { id: 'S-2', type: 'settlement', name: 'Upper Ridge Community', coordinates: [27.0450, 88.2700], population: 1340, zoneId: 'Z-042', status: 'operational' },
  { id: 'S-3', type: 'settlement', name: 'Kalimpong Outskirts', coordinates: [27.0650, 88.4750], population: 5120, zoneId: 'Z-018', status: 'operational' },
  { id: 'S-4', type: 'settlement', name: 'Kurseong Valley Colony', coordinates: [26.8800, 88.2800], population: 4300, zoneId: 'Z-091', status: 'operational' },
  { id: 'S-5', type: 'settlement', name: 'Mirik Base Settlement', coordinates: [26.8950, 88.1750], population: 3450, zoneId: 'Z-055', status: 'operational' },
  { id: 'S-6', type: 'settlement', name: 'Lebong Enclave', coordinates: [27.0780, 88.2720], population: 2900, zoneId: 'Z-073', status: 'operational' },
  { id: 'S-7', type: 'settlement', name: 'Rangpo Riverside Sector', coordinates: [27.1720, 88.5150], population: 3800, zoneId: 'Z-084', status: 'operational' },

  // Hospitals & Medical Hubs
  { id: 'H-1', type: 'hospital', name: 'Darjeeling District Hospital', coordinates: [27.0350, 88.2500], capacity: 250, status: 'operational' },
  { id: 'H-2', type: 'hospital', name: 'Kalimpong Sub-Divisional Hospital', coordinates: [27.0700, 88.4800], capacity: 180, status: 'operational' },
  { id: 'H-3', type: 'hospital', name: 'Kurseong Trauma Medical Center', coordinates: [26.8750, 88.2900], capacity: 140, status: 'operational' },

  // Designated Disaster Shelters
  { id: 'SH-1', type: 'shelter', name: 'Tista Highland Relief Shelter', coordinates: [27.0400, 88.2600], capacity: 800, status: 'operational' },
  { id: 'SH-2', type: 'shelter', name: 'Kalimpong Sports Complex Shelter', coordinates: [27.0750, 88.4700], capacity: 2500, status: 'operational' },
  { id: 'SH-3', type: 'shelter', name: 'Kurseong Central Public Hall', coordinates: [26.8850, 88.2750], capacity: 1500, status: 'operational' },
  { id: 'SH-4', type: 'shelter', name: 'Mirik Municipal Gymnasium', coordinates: [26.9000, 88.1850], capacity: 1200, status: 'operational' },

  // Critical Bridges
  { id: 'B-17', type: 'bridge', name: 'Tista Suspension Bridge B-17', coordinates: [27.0500, 88.2600], status: 'operational', zoneId: 'Z-042' },
  { id: 'B-22', type: 'bridge', name: 'Rangpo Canyon Span B-22', coordinates: [27.1680, 88.5220], status: 'operational', zoneId: 'Z-084' },
  { id: 'B-09', type: 'bridge', name: 'Kurseong Valley Arch Bridge B-09', coordinates: [26.8780, 88.2850], status: 'operational', zoneId: 'Z-091' }
];

export const mockEdges: InfrastructureEdge[] = [
  // Tista Valley network
  { id: 'R-01', name: 'Tista Upper Connector', source: 'S-1', target: 'B-17', type: 'road', distance: 8, lengthKm: 4.2, status: 'active', zoneId: 'Z-042' },
  { id: 'R-02', name: 'Tista-Hospital Arterial', source: 'B-17', target: 'H-1', type: 'road', distance: 14, lengthKm: 7.8, status: 'active', zoneId: 'Z-042' },
  { id: 'R-03', name: 'Ridge Access Road', source: 'S-2', target: 'S-1', type: 'road', distance: 10, lengthKm: 5.1, status: 'active', zoneId: 'Z-042' },
  { id: 'R-04', name: 'Tista Mountain Bypass', source: 'S-2', target: 'SH-1', type: 'road', distance: 18, lengthKm: 9.4, status: 'active', zoneId: 'Z-042' },
  { id: 'R-05', name: 'Highland Shelter Link', source: 'SH-1', target: 'H-1', type: 'road', distance: 12, lengthKm: 6.0, status: 'active', zoneId: 'Z-042' },

  // Kalimpong network
  { id: 'R-06', name: 'Kalimpong City Main', source: 'S-3', target: 'H-2', type: 'road', distance: 7, lengthKm: 3.5, status: 'active', zoneId: 'Z-018' },
  { id: 'R-07', name: 'Kalimpong Sports Shelter Access', source: 'S-3', target: 'SH-2', type: 'road', distance: 9, lengthKm: 4.8, status: 'active', zoneId: 'Z-018' },
  { id: 'R-08', name: 'Kalimpong Cross-Valley Route', source: 'SH-2', target: 'H-2', type: 'road', distance: 6, lengthKm: 3.1, status: 'active', zoneId: 'Z-018' },

  // Kurseong network
  { id: 'R-09', name: 'Kurseong Tea Estate Route', source: 'S-4', target: 'B-09', type: 'road', distance: 11, lengthKm: 5.9, status: 'active', zoneId: 'Z-091' },
  { id: 'R-10', name: 'Kurseong Bridge to Hospital', source: 'B-09', target: 'H-3', type: 'road', distance: 12, lengthKm: 6.4, status: 'active', zoneId: 'Z-091' },
  { id: 'R-11', name: 'Kurseong Community Shelter Bypass', source: 'S-4', target: 'SH-3', type: 'road', distance: 15, lengthKm: 8.2, status: 'active', zoneId: 'Z-091' },
  { id: 'R-12', name: 'Kurseong Shelter to Trauma Link', source: 'SH-3', target: 'H-3', type: 'road', distance: 9, lengthKm: 4.5, status: 'active', zoneId: 'Z-091' },

  // Mirik network
  { id: 'R-13', name: 'Mirik Highway Main Line', source: 'S-5', target: 'SH-4', type: 'road', distance: 13, lengthKm: 6.9, status: 'active', zoneId: 'Z-055' },
  { id: 'R-14', name: 'Mirik to Kurseong Regional Link', source: 'SH-4', target: 'H-3', type: 'road', distance: 28, lengthKm: 16.5, status: 'active', zoneId: 'Z-055' },

  // Lebong network
  { id: 'R-15', name: 'Lebong Spur Transit Road', source: 'S-6', target: 'S-1', type: 'road', distance: 16, lengthKm: 8.5, status: 'active', zoneId: 'Z-073' },
  { id: 'R-16', name: 'Lebong Direct Hospital Access', source: 'S-6', target: 'H-1', type: 'road', distance: 24, lengthKm: 13.0, status: 'active', zoneId: 'Z-073' },

  // Rangpo network
  { id: 'R-17', name: 'Rangpo Gorge Highway', source: 'S-7', target: 'B-22', type: 'road', distance: 10, lengthKm: 5.2, status: 'active', zoneId: 'Z-084' },
  { id: 'R-18', name: 'Rangpo to Kalimpong Trans-Corridor', source: 'B-22', target: 'SH-2', type: 'road', distance: 32, lengthKm: 19.8, status: 'active', zoneId: 'Z-084' }
];

export const mockFieldReports: FieldReport[] = [
  {
    id: 'R-1001',
    reporter: 'Field Team Alpha (GSI Survey)',
    reporterName: 'Field Team Alpha (GSI Survey)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    location: [27.0510, 88.2660],
    locationName: 'Tista Valley Upper Ridge',
    state: 'West Bengal',
    district: 'Darjeeling',
    zoneId: 'Z-042',
    type: 'Tension Cracks',
    incidentType: 'Tension Cracks',
    severity: 'Severe',
    description: 'Fresh transverse tension crack observed on upper slope ridge, approximately 15cm wide with 8cm vertical displacement.',
    verificationStatus: 'CONFIRMED',
    status: 'CONFIRMED',
    impactFlags: {
      roadAffected: true,
      buildingAffected: false,
      riverBlocked: false,
      peopleTrapped: false,
      evacuationRequired: true
    }
  },
  {
    id: 'R-1002',
    reporter: 'Kalimpong Forest Patrol',
    reporterName: 'Kalimpong Forest Patrol',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    location: [27.0620, 88.4680],
    locationName: 'Kalimpong Outer Flank',
    state: 'West Bengal',
    district: 'Kalimpong',
    zoneId: 'Z-018',
    type: 'Mudflow',
    incidentType: 'Mudflow',
    severity: 'Moderate',
    description: 'Unusual subterranean water discharge emerging above road embankment; toe saturation escalating rapidly.',
    verificationStatus: 'CONFIRMED',
    status: 'CONFIRMED',
    impactFlags: {
      roadAffected: true,
      buildingAffected: false,
      riverBlocked: false,
      peopleTrapped: false,
      evacuationRequired: false
    }
  },
  {
    id: 'R-1003',
    reporter: 'Disaster Rapid Response Kurseong',
    reporterName: 'Disaster Rapid Response Kurseong',
    timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
    location: [26.8840, 88.2820],
    locationName: 'Kurseong Tea Terrace',
    state: 'West Bengal',
    district: 'Darjeeling',
    zoneId: 'Z-091',
    type: 'Slope Failure',
    incidentType: 'Slope Failure',
    severity: 'Severe',
    description: 'Stone masonry retaining wall along tea terrace bowed outwards by 22cm following overnight showers.',
    verificationStatus: 'CONFIRMED',
    status: 'CONFIRMED',
    impactFlags: {
      roadAffected: true,
      buildingAffected: true,
      riverBlocked: false,
      peopleTrapped: false,
      evacuationRequired: true
    }
  }
];


export const initialDynamicTrigger: DynamicTrigger = {
  rainfall1h: 4.2,
  rainfall24h: 36.5,
  rainfallAnomaly: 1.45,
  soilMoisture: 62.0,
  soilMoistureTrend: 1.2,
  antecedentPrecipitation: 68.0,
  slopeInstabilityFactor: 55,
  groundVibration: 1.1,
  temperatureAnomaly: 1.8
};
