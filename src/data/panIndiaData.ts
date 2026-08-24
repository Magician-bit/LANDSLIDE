import {
  RiskZone,
  InfrastructureNode,
  InfrastructureEdge,
  FieldReport,
  SeismicEvent,
  SatelliteObservation,
  DynamicTrigger,
  DataSourceInfo
} from '../types';

export const panIndiaDataSources: DataSourceInfo[] = [
  {
    id: 'src-imd',
    name: 'India Meteorological Department (IMD)',
    provider: 'Ministry of Earth Sciences, Govt of India',
    category: 'METEOROLOGY',
    status: 'LIVE',
    lastUpdated: '12 mins ago',
    freshnessMinutes: 12,
    coverage: 'Pan-India Automatic Weather Stations (AWS) & Doppler Radars',
    description: 'Real-time rainfall rates, 24h accumulated precipitation, temperature, and 48h meteorological forecast feeds.',
    isRealLive: true,
    endpointUrl: 'https://api.imd.gov.in/v1/aws',
    requiresAuth: true,
    authConfigured: false
  },
  {
    id: 'src-nrsc',
    name: 'NRSC / ISRO Landslide Atlas of India',
    provider: 'National Remote Sensing Centre / ISRO',
    category: 'HISTORICAL',
    status: 'HISTORICAL',
    lastUpdated: 'National Landslide Atlas Baseline',
    freshnessMinutes: 0,
    coverage: '80,000+ Geo-tagged historical landslide events across 17 Indian States/UTs',
    description: 'Validated satellite-derived historical landslide density, spatial frequency, and geomorphological inventories.',
    isRealLive: false,
    endpointUrl: 'https://bhuvan.nrsc.gov.in/disaster/landslide',
    requiresAuth: false,
    authConfigured: true
  },
  {
    id: 'src-gsi',
    name: 'Geological Survey of India (GSI) NLSM',
    provider: 'Geological Survey of India (Ministry of Mines)',
    category: 'GEOLOGY',
    status: 'BASELINE',
    lastUpdated: 'National Landslide Susceptibility Mapping (1:50,000)',
    freshnessMinutes: 0,
    coverage: 'Macro-scale Landslide Susceptibility Baseline across 0.42M sq km of hilly terrain',
    description: 'Static geological predisposition based on lithology, structural faults, slope morphometry, and relative relief.',
    isRealLive: false,
    endpointUrl: 'https://bhukosh.gsi.gov.in',
    requiresAuth: false,
    authConfigured: true
  },
  {
    id: 'src-ncs',
    name: 'National Centre for Seismology (NCS)',
    provider: 'Ministry of Earth Sciences, Govt of India',
    category: 'SEISMIC',
    status: 'LIVE',
    lastUpdated: '8 mins ago',
    freshnessMinutes: 8,
    coverage: 'National Seismological Network (150+ broadband stations)',
    description: 'Real-time seismic origin times, focal depth, magnitude, and epicentral distance across Himalayan & peninsular belts.',
    isRealLive: true,
    endpointUrl: 'https://seismo.gov.in/api/v1/earthquakes',
    requiresAuth: false,
    authConfigured: true
  },
  {
    id: 'src-sentinel',
    name: 'Copernicus Sentinel-1 / 2 Earth Observation',
    provider: 'European Space Agency (ESA) Open Access Hub',
    category: 'SATELLITE',
    status: 'PARTIAL',
    lastUpdated: '3 hours ago',
    freshnessMinutes: 180,
    coverage: 'C-band Synthetic Aperture Radar (SAR) & Multi-Spectral Optical Imagery',
    description: 'Ground deformation estimation (InSAR line-of-sight velocity) and post-monsoon vegetation disturbance.',
    isRealLive: true,
    endpointUrl: 'https://dataspace.copernicus.eu/api',
    requiresAuth: true,
    authConfigured: false
  },
  {
    id: 'src-gpm',
    name: 'NASA GPM (Global Precipitation Measurement)',
    provider: 'NASA / JAXA Precipitation Processing System',
    category: 'METEOROLOGY',
    status: 'CONNECTED',
    lastUpdated: '25 mins ago',
    freshnessMinutes: 25,
    coverage: 'IMERG Early Run Multi-Satellite Precipitation Calibration',
    description: 'High-resolution spatial satellite rainfall grid used as fallback calibration when ground radar is shadowed by high terrain.',
    isRealLive: true,
    endpointUrl: 'https://gpm.nasa.gov/data',
    requiresAuth: false,
    authConfigured: true
  },
  {
    id: 'src-community',
    name: 'Community Landslide Reporting Grid',
    provider: 'Decentralized Field Network & Citizen Observers',
    category: 'COMMUNITY',
    status: 'LIVE',
    lastUpdated: 'Real-time ingestion active',
    freshnessMinutes: 2,
    coverage: 'Crowdsourced field reports with geo-tagging, photo verification, and spatial clustering',
    description: 'Rapid on-the-ground observations of slope movement, road blockages, mudslides, and tension cracks.',
    isRealLive: true,
    requiresAuth: false,
    authConfigured: true
  }
];

export const panIndiaZones: RiskZone[] = [
  // 1. Western Ghats - Wayanad, Kerala (Chooralmala-Meppadi)
  {
    id: 'Z-WAY-01',
    name: 'Chooralmala-Meppadi Escarpment',
    state: 'Kerala',
    district: 'Wayanad',
    hillRange: 'Western Ghats',
    coordinates: [11.5320, 76.1530],
    radius: 2200,
    staticSusceptibility: 88,
    baselineSusceptibilityClass: 'VERY_HIGH',
    population: 4800,
    historicalLandslideCount: 14,
    environmentalFeatures: {
      elevation: 950,
      slope: 41,
      aspect: 'South-West',
      terrainRuggedness: 8.9,
      landCover: 'Tea Plantations & Chundale Slopes',
      ndviChange: -0.18,
      drainage: 'High Valley Convergence (Iruvanipuzha tributary)',
      lithology: 'Weathered Charnockite & Lateritic Soil Layer',
      geologicalFormation: 'Precambrian Crystalline Complex',
      gsiSusceptibilityClass: 'Very High',
      soilType: 'Loose Humus Overlying Clay Horizon (1.5-3m depth)',
      faultDistanceKm: 3.2
    },
    historicalEvents: [
      {
        id: 'EV-KL-2024-01',
        date: '2024-07-30',
        severity: 'Critical',
        affectedArea: 9.4,
        impact: 'Massive debris flow triggered by 372mm/24h rain; Mundakkai & Chooralmala bridges washed out.',
        source: 'NRSC_ATLAS',
        triggerType: 'Monsoon Rainfall'
      },
      {
        id: 'EV-KL-2019-02',
        date: '2019-08-08',
        severity: 'High',
        affectedArea: 5.2,
        impact: 'Puthumala debris avalanche displaced 1,200 residents; road communication severed.',
        source: 'GSI_INVENTORY',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 2. Western Ghats - Munnar / Rajamala, Idukki, Kerala
  {
    id: 'Z-IDK-02',
    name: 'Rajamala-Pettimudi Ridge',
    state: 'Kerala',
    district: 'Idukki',
    hillRange: 'Western Ghats',
    coordinates: [10.1520, 77.0210],
    radius: 1900,
    staticSusceptibility: 82,
    baselineSusceptibilityClass: 'VERY_HIGH',
    population: 3200,
    historicalLandslideCount: 11,
    environmentalFeatures: {
      elevation: 1680,
      slope: 44,
      aspect: 'North-West',
      terrainRuggedness: 9.2,
      landCover: 'Steep Tea Estate & Shola Grassland Boundary',
      ndviChange: -0.12,
      drainage: 'High Velocity Mountain Chutes',
      lithology: 'Hornblende-Biotite Gneiss with deep colluvial mantle',
      geologicalFormation: 'Madurai Granulite Block',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 4.8
    },
    historicalEvents: [
      {
        id: 'EV-KL-2020-03',
        date: '2020-08-06',
        severity: 'Critical',
        affectedArea: 4.8,
        impact: 'Pettimudi landslide engulfed plantation settlement; 66 casualties; SH-17 blocked.',
        source: 'NRSC_ATLAS',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 3. Western Ghats - Mahabaleshwar / Raigad, Maharashtra
  {
    id: 'Z-MAH-03',
    name: 'Mahad-Taliye Escarpment Corridor',
    state: 'Maharashtra',
    district: 'Raigad',
    hillRange: 'Western Ghats',
    coordinates: [18.0250, 73.5410],
    radius: 2400,
    staticSusceptibility: 84,
    baselineSusceptibilityClass: 'VERY_HIGH',
    population: 3900,
    historicalLandslideCount: 9,
    environmentalFeatures: {
      elevation: 720,
      slope: 39,
      aspect: 'West',
      terrainRuggedness: 8.5,
      landCover: 'Konkan Scarp & Degraded Forest',
      ndviChange: -0.14,
      drainage: 'Savitri River Basin Chutes',
      lithology: 'Deccan Traps Basalt (Compound Flow with Intertrappean red boles)',
      geologicalFormation: 'Deccan Volcanic Province',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 6.1
    },
    historicalEvents: [
      {
        id: 'EV-MH-2021-01',
        date: '2021-07-22',
        severity: 'Critical',
        affectedArea: 6.2,
        impact: 'Taliye village hill collapse after 480mm rain in 36h; 87 lives lost.',
        source: 'NRSC_ATLAS',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 4. Nilgiri Hills - Ooty / Coonoor, Tamil Nadu
  {
    id: 'Z-NIL-04',
    name: 'Coonoor-Mettupalayam Ghat Section',
    state: 'Tamil Nadu',
    district: 'Nilgiris',
    hillRange: 'Nilgiri Hills',
    coordinates: [11.3530, 76.7960],
    radius: 1700,
    staticSusceptibility: 76,
    baselineSusceptibilityClass: 'HIGH',
    population: 4100,
    historicalLandslideCount: 16,
    environmentalFeatures: {
      elevation: 1850,
      slope: 36,
      aspect: 'South',
      terrainRuggedness: 7.9,
      landCover: 'Steep Road Cuttings & Eucalyptus Slopes',
      ndviChange: -0.09,
      drainage: 'Bhavani River Basin Tributaries',
      lithology: 'Charnockite Massif with thick saprolitic overburden',
      gsiSusceptibilityClass: 'High',
      faultDistanceKm: 2.7
    },
    historicalEvents: [
      {
        id: 'EV-TN-2009-01',
        date: '2009-11-08',
        severity: 'Critical',
        affectedArea: 8.5,
        impact: 'Over 1,150 individual slope failures during cyclone surge; Nilgiri Mountain Railway cut off for 6 weeks.',
        source: 'GSI_INVENTORY',
        triggerType: 'Cyclone'
      }
    ]
  },
  // 5. Western Himalayas - Joshimath-Helang, Chamoli, Uttarakhand
  {
    id: 'Z-UTK-05',
    name: 'Joshimath-Helang Subsidence Zone',
    state: 'Uttarakhand',
    district: 'Chamoli',
    hillRange: 'Western Himalayas',
    coordinates: [30.5560, 79.5670],
    radius: 2600,
    staticSusceptibility: 91,
    baselineSusceptibilityClass: 'CRITICAL',
    population: 6200,
    historicalLandslideCount: 22,
    environmentalFeatures: {
      elevation: 2150,
      slope: 42,
      aspect: 'North-East',
      terrainRuggedness: 9.6,
      landCover: 'Old Landslide Debris Overburden & Urbanized Slopes',
      ndviChange: -0.22,
      drainage: 'Alaknanda & Dhauliganga Gorge Confluence',
      lithology: 'Central Crystallines (Biotite Gneiss, Schist, Quartzite with morainic deposits)',
      geologicalFormation: 'Main Central Thrust (MCT) Tectonic Zone',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 1.4
    },
    historicalEvents: [
      {
        id: 'EV-UK-2023-01',
        date: '2023-01-05',
        severity: 'Critical',
        affectedArea: 5.8,
        impact: 'Massive differential land subsidence; 868 structures developed severe fissures; NH-58 closed.',
        source: 'NRSC_ATLAS',
        triggerType: 'Anthropogenic'
      },
      {
        id: 'EV-UK-2021-02',
        date: '2021-02-07',
        severity: 'Critical',
        affectedArea: 12.0,
        impact: 'Rishi Ganga - Dhauliganga rock/ice avalanche flash flood.',
        source: 'NRSC_ATLAS',
        triggerType: 'Seismic'
      }
    ]
  },
  // 6. Western Himalayas - Shimla / Kinnaur, Himachal Pradesh
  {
    id: 'Z-HP-06',
    name: 'Nigulsari-Kinnaur NH-5 Highway Scarp',
    state: 'Himachal Pradesh',
    district: 'Kinnaur',
    hillRange: 'Western Himalayas',
    coordinates: [31.5280, 77.9250],
    radius: 2100,
    staticSusceptibility: 89,
    baselineSusceptibilityClass: 'VERY_HIGH',
    population: 2900,
    historicalLandslideCount: 18,
    environmentalFeatures: {
      elevation: 2350,
      slope: 48,
      aspect: 'South',
      terrainRuggedness: 9.8,
      landCover: 'Bare Rock Face & Highway Road Cuttings',
      ndviChange: -0.15,
      drainage: 'Satluj River Canyon',
      lithology: 'Jeori-Wangtu Gneissic Complex with steep joint planes',
      geologicalFormation: 'Higher Himalayan Crystalline Zone',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 3.1
    },
    historicalEvents: [
      {
        id: 'EV-HP-2021-01',
        date: '2021-08-11',
        severity: 'Critical',
        affectedArea: 3.4,
        impact: 'Massive rock avalanche on NH-5; multiple vehicles struck; corridor closed 5 days.',
        source: 'NRSC_ATLAS',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 7. Western Himalayas - Ramban-Banihal, Jammu & Kashmir (NH-44)
  {
    id: 'Z-JK-07',
    name: 'Ramban-Nashri Landslide Sector',
    state: 'Jammu & Kashmir',
    district: 'Ramban',
    hillRange: 'Western Himalayas',
    coordinates: [33.2420, 75.1950],
    radius: 2500,
    staticSusceptibility: 87,
    baselineSusceptibilityClass: 'VERY_HIGH',
    population: 5300,
    historicalLandslideCount: 31,
    environmentalFeatures: {
      elevation: 1150,
      slope: 43,
      aspect: 'West',
      terrainRuggedness: 9.1,
      landCover: 'Active Scree & Highly Fractured Mudstone',
      ndviChange: -0.16,
      drainage: 'Chenab River Gorge Funnel',
      lithology: 'Murree Group (Fragile Shale, Siltstone and Sandstone alternating bands)',
      geologicalFormation: 'Sub-Himalayan Tectonic Thrust Belt',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 1.8
    },
    historicalEvents: [
      {
        id: 'EV-JK-2023-03',
        date: '2023-07-09',
        severity: 'High',
        affectedArea: 7.2,
        impact: 'NH-44 Jammu-Srinagar arterial link severed by multiple landslides for 72 hours.',
        source: 'GSI_INVENTORY',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 8. Eastern Himalayas - Tista Valley / Darjeeling-Kalimpong, West Bengal
  {
    id: 'Z-DAR-08',
    name: 'Tista Valley Corridor (NH-10 Sector A)',
    state: 'West Bengal',
    district: 'Darjeeling',
    hillRange: 'Eastern Himalayas',
    coordinates: [27.0500, 88.2667],
    radius: 1800,
    staticSusceptibility: 83,
    baselineSusceptibilityClass: 'VERY_HIGH',
    population: 3400,
    historicalLandslideCount: 19,
    environmentalFeatures: {
      elevation: 1980,
      slope: 41,
      aspect: 'South-East',
      terrainRuggedness: 8.7,
      landCover: 'Degraded Forest Slopes & Terraced Settlements',
      ndviChange: -0.14,
      drainage: 'High Convergence (Tista Basin)',
      lithology: 'Darjeeling Gneiss & Daling Phyllite/Schist',
      geologicalFormation: 'Main Boundary Thrust (MBT) Vicinity',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 2.2
    },
    historicalEvents: [
      {
        id: 'EV-WB-2023-01',
        date: '2023-10-04',
        severity: 'Critical',
        affectedArea: 8.8,
        impact: 'Glacial lake outburst flood & torrential rainfall triggered massive landslides; NH-10 submerged.',
        source: 'NRSC_ATLAS',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 9. Eastern Himalayas - Mangan / Dzongu, North Sikkim
  {
    id: 'Z-SKM-09',
    name: 'Mangan-Dzongu River Valley Sector',
    state: 'Sikkim',
    district: 'Mangan',
    hillRange: 'Eastern Himalayas',
    coordinates: [27.5050, 88.5320],
    radius: 2800,
    staticSusceptibility: 92,
    baselineSusceptibilityClass: 'CRITICAL',
    population: 3100,
    historicalLandslideCount: 24,
    environmentalFeatures: {
      elevation: 1420,
      slope: 46,
      aspect: 'East',
      terrainRuggedness: 9.9,
      landCover: 'Steep Gorge Slopes & Glacial Colluvium',
      ndviChange: -0.25,
      drainage: 'Severe Tista & Kanaka River Valley Funneling',
      lithology: 'Chungthang Formation (Calc-granulites, Pelitic Schists, Amphibolites)',
      geologicalFormation: 'Higher Himalayan Tectonic Belt',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 1.1
    },
    historicalEvents: [
      {
        id: 'EV-SK-2024-02',
        date: '2024-06-13',
        severity: 'Critical',
        affectedArea: 11.2,
        impact: 'Over 50 simultaneous slope failures isolated North Sikkim; Sankalang bridge collapsed; 1,500 tourists evacuated.',
        source: 'NRSC_ATLAS',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 10. Northeast Hills - Dima Hasao (Haflong), Assam
  {
    id: 'Z-ASM-10',
    name: 'Haflong Hill Section & Lumding Railway Link',
    state: 'Assam',
    district: 'Dima Hasao',
    hillRange: 'Northeast Hills',
    coordinates: [25.1780, 93.0220],
    radius: 2300,
    staticSusceptibility: 85,
    baselineSusceptibilityClass: 'VERY_HIGH',
    population: 4600,
    historicalLandslideCount: 15,
    environmentalFeatures: {
      elevation: 780,
      slope: 38,
      aspect: 'North',
      terrainRuggedness: 8.2,
      landCover: 'Sub-tropical Pine & Railway Embankment Cuttings',
      ndviChange: -0.19,
      drainage: 'Diyung River Sub-basin',
      lithology: 'Tertiary Barail & Surma Group Shales/Sandstones (High Clay Content)',
      geologicalFormation: 'Assam-Arakan Fold Belt',
      gsiSusceptibilityClass: 'Very High',
      faultDistanceKm: 3.5
    },
    historicalEvents: [
      {
        id: 'EV-AS-2022-01',
        date: '2022-05-16',
        severity: 'Critical',
        affectedArea: 9.1,
        impact: 'Unprecedented pre-monsoon landslides submerged New Haflong railway station; Barak Valley link severed for 2 months.',
        source: 'NRSC_ATLAS',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 11. Northeast Hills - Shillong / Cherrapunji, Meghalaya
  {
    id: 'Z-MEG-11',
    name: 'Sohra-Mawkdok Gorge Corridor',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    hillRange: 'Northeast Hills',
    coordinates: [25.3210, 91.7340],
    radius: 2000,
    staticSusceptibility: 78,
    baselineSusceptibilityClass: 'HIGH',
    population: 3800,
    historicalLandslideCount: 13,
    environmentalFeatures: {
      elevation: 1380,
      slope: 45,
      aspect: 'South',
      terrainRuggedness: 9.4,
      landCover: 'Plateau Escarpment & Rainforest Gorges',
      ndviChange: -0.08,
      drainage: 'Extreme Runoff Surface Channels',
      lithology: 'Khasi Group Sandstone & Shella Formation Limestones',
      geologicalFormation: 'Shillong Plateau Tectonic Horst',
      gsiSusceptibilityClass: 'High',
      faultDistanceKm: 4.1
    },
    historicalEvents: [
      {
        id: 'EV-ML-2022-02',
        date: '2022-06-18',
        severity: 'High',
        affectedArea: 4.6,
        impact: 'Continuous 800mm rain in 48h caused multiple slips on Shillong-Dawki Highway.',
        source: 'GSI_INVENTORY',
        triggerType: 'Monsoon Rainfall'
      }
    ]
  },
  // 12. Eastern Ghats - Araku Valley, Andhra Pradesh / Koraput, Odisha
  {
    id: 'Z-EG-12',
    name: 'Araku-Ananthagiri Ghat Escarpment',
    state: 'Andhra Pradesh',
    district: 'Alluri Sitharama Raju',
    hillRange: 'Eastern Ghats',
    coordinates: [18.2350, 82.9850],
    radius: 1900,
    staticSusceptibility: 68,
    baselineSusceptibilityClass: 'MODERATE',
    population: 3500,
    historicalLandslideCount: 7,
    environmentalFeatures: {
      elevation: 910,
      slope: 32,
      aspect: 'East',
      terrainRuggedness: 6.8,
      landCover: 'Coffee Plantations & Deciduous Scrub Slopes',
      ndviChange: -0.06,
      drainage: 'Gosthani River Headwaters',
      lithology: 'Khondalite Suite (Garnet-Sillimanite Gneiss with deep bauxitic weathering)',
      geologicalFormation: 'Eastern Ghats Mobile Belt',
      gsiSusceptibilityClass: 'Moderate',
      faultDistanceKm: 7.2
    },
    historicalEvents: [
      {
        id: 'EV-AP-2018-01',
        date: '2018-10-12',
        severity: 'Moderate',
        affectedArea: 2.8,
        impact: 'Cyclone Titli triggered slope wash & railway boulder falls on KK Line.',
        source: 'GSI_INVENTORY',
        triggerType: 'Cyclone'
      }
    ]
  }
];

export const panIndiaNodes: InfrastructureNode[] = [
  // Western Ghats (Wayanad)
  { id: 'N-WAY-S1', type: 'settlement', name: 'Chooralmala Settlement', state: 'Kerala', district: 'Wayanad', coordinates: [11.5350, 76.1550], population: 2400, zoneId: 'Z-WAY-01', status: 'operational' },
  { id: 'N-WAY-S2', type: 'settlement', name: 'Mundakkai Hamlet', state: 'Kerala', district: 'Wayanad', coordinates: [11.5280, 76.1620], population: 1800, zoneId: 'Z-WAY-01', status: 'operational' },
  { id: 'N-WAY-H1', type: 'hospital', name: 'Meppadi Community Health Centre', state: 'Kerala', district: 'Wayanad', coordinates: [11.5510, 76.1280], capacity: 160, status: 'operational' },
  { id: 'N-WAY-SH1', type: 'shelter', name: 'St. Joseph Higher Secondary Relief Shelter', state: 'Kerala', district: 'Wayanad', coordinates: [11.5540, 76.1240], capacity: 1800, status: 'operational' },
  { id: 'N-WAY-B1', type: 'bridge', name: 'Chooralmala Bailey Span (Emergency Bridge)', state: 'Kerala', district: 'Wayanad', coordinates: [11.5340, 76.1520], status: 'operational', zoneId: 'Z-WAY-01' },

  // Western Himalayas (Chamoli / Joshimath)
  { id: 'N-UTK-S1', type: 'settlement', name: 'Joshimath Upper Bazaar', state: 'Uttarakhand', district: 'Chamoli', coordinates: [30.5590, 79.5690], population: 3800, zoneId: 'Z-UTK-05', status: 'operational' },
  { id: 'N-UTK-S2', type: 'settlement', name: 'Helang Valley Village', state: 'Uttarakhand', district: 'Chamoli', coordinates: [30.5280, 79.5240], population: 1600, zoneId: 'Z-UTK-05', status: 'operational' },
  { id: 'N-UTK-H1', type: 'hospital', name: 'Joshimath Sub-District Hospital', state: 'Uttarakhand', district: 'Chamoli', coordinates: [30.5620, 79.5620], capacity: 200, status: 'operational' },
  { id: 'N-UTK-SH1', type: 'shelter', name: 'Tapovan Multi-Purpose Relief Complex', state: 'Uttarakhand', district: 'Chamoli', coordinates: [30.5050, 79.6250], capacity: 2200, status: 'operational' },
  { id: 'N-UTK-B1', type: 'bridge', name: 'Helang Alaknanda Bridge (NH-58)', state: 'Uttarakhand', district: 'Chamoli', coordinates: [30.5310, 79.5300], status: 'operational', zoneId: 'Z-UTK-05' },

  // Eastern Himalayas (Darjeeling / Tista)
  { id: 'N-DAR-S1', type: 'settlement', name: 'Tista Bazaar Village', state: 'West Bengal', district: 'Darjeeling', coordinates: [27.0550, 88.2650], population: 1900, zoneId: 'Z-DAR-08', status: 'operational' },
  { id: 'N-DAR-S2', type: 'settlement', name: 'Kalimpong Ridge Settlement', state: 'West Bengal', district: 'Kalimpong', coordinates: [27.0650, 88.4750], population: 4200, zoneId: 'Z-DAR-08', status: 'operational' },
  { id: 'N-DAR-H1', type: 'hospital', name: 'Darjeeling District Hospital', state: 'West Bengal', district: 'Darjeeling', coordinates: [27.0350, 88.2500], capacity: 250, status: 'operational' },
  { id: 'N-DAR-SH1', type: 'shelter', name: 'Tista Highland Relief Shelter', state: 'West Bengal', district: 'Darjeeling', coordinates: [27.0400, 88.2600], capacity: 1500, status: 'operational' },
  { id: 'N-DAR-B1', type: 'bridge', name: 'Tista Suspension Bridge B-17', state: 'West Bengal', district: 'Darjeeling', coordinates: [27.0500, 88.2600], status: 'operational', zoneId: 'Z-DAR-08' },

  // Himachal Pradesh (Kinnaur)
  { id: 'N-HP-S1', type: 'settlement', name: 'Nigulsari Enclave', state: 'Himachal Pradesh', district: 'Kinnaur', coordinates: [31.5250, 77.9210], population: 1450, zoneId: 'Z-HP-06', status: 'operational' },
  { id: 'N-HP-H1', type: 'hospital', name: 'Reckong Peo Regional Hospital', state: 'Himachal Pradesh', district: 'Kinnaur', coordinates: [31.5420, 78.2750], capacity: 180, status: 'operational' },
  { id: 'N-HP-SH1', type: 'shelter', name: 'Taranda Community Emergency Shelter', state: 'Himachal Pradesh', district: 'Kinnaur', coordinates: [31.5120, 77.8950], capacity: 1200, status: 'operational' },

  // Jammu & Kashmir (Ramban)
  { id: 'N-JK-S1', type: 'settlement', name: 'Ramban Town Settlement', state: 'Jammu & Kashmir', district: 'Ramban', coordinates: [33.2450, 75.1980], population: 3100, zoneId: 'Z-JK-07', status: 'operational' },
  { id: 'N-JK-H1', type: 'hospital', name: 'Ramban District Hospital', state: 'Jammu & Kashmir', district: 'Ramban', coordinates: [33.2380, 75.1900], capacity: 150, status: 'operational' },
  { id: 'N-JK-SH1', type: 'shelter', name: 'Chanderkote Disaster Shelter', state: 'Jammu & Kashmir', district: 'Ramban', coordinates: [33.2100, 75.1800], capacity: 2000, status: 'operational' },

  // Northeast (Assam / Dima Hasao)
  { id: 'N-ASM-S1', type: 'settlement', name: 'Haflong Railway Colony', state: 'Assam', district: 'Dima Hasao', coordinates: [25.1820, 93.0250], population: 2800, zoneId: 'Z-ASM-10', status: 'operational' },
  { id: 'N-ASM-H1', type: 'hospital', name: 'Haflong Civil Hospital', state: 'Assam', district: 'Dima Hasao', coordinates: [25.1680, 93.0150], capacity: 140, status: 'operational' },
  { id: 'N-ASM-SH1', type: 'shelter', name: 'District Sports Association Shelter', state: 'Assam', district: 'Dima Hasao', coordinates: [25.1750, 93.0200], capacity: 1600, status: 'operational' },

  // Idukki / Munnar (Z-IDK-02)
  { id: 'N-IDK-S1', type: 'settlement', name: 'Pettimudi Plantation Settlement', state: 'Kerala', district: 'Idukki', coordinates: [10.1560, 77.0250], population: 1950, zoneId: 'Z-IDK-02', status: 'operational' },
  { id: 'N-IDK-H1', type: 'hospital', name: 'Munnar General Hospital', state: 'Kerala', district: 'Idukki', coordinates: [10.0880, 77.0590], capacity: 180, status: 'operational' },
  { id: 'N-IDK-SH1', type: 'shelter', name: 'Rajamala Community Relief Hall', state: 'Kerala', district: 'Idukki', coordinates: [10.1420, 77.0180], capacity: 1400, status: 'operational' },
  { id: 'N-IDK-B1', type: 'bridge', name: 'Pettimudi Chute Culvert Span', state: 'Kerala', district: 'Idukki', coordinates: [10.1540, 77.0220], status: 'operational', zoneId: 'Z-IDK-02' },

  // Raigad / Mahad (Z-MAH-03)
  { id: 'N-MAH-S1', type: 'settlement', name: 'Taliye Hill Settlement', state: 'Maharashtra', district: 'Raigad', coordinates: [18.0280, 73.5450], population: 2200, zoneId: 'Z-MAH-03', status: 'operational' },
  { id: 'N-MAH-H1', type: 'hospital', name: 'Mahad Sub-District Hospital', state: 'Maharashtra', district: 'Raigad', coordinates: [18.0820, 73.4180], capacity: 210, status: 'operational' },
  { id: 'N-MAH-SH1', type: 'shelter', name: 'Taliye Gram Relief Shelter', state: 'Maharashtra', district: 'Raigad', coordinates: [18.0320, 73.5380], capacity: 1500, status: 'operational' },
  { id: 'N-MAH-B1', type: 'bridge', name: 'Savitri River Approach Bridge', state: 'Maharashtra', district: 'Raigad', coordinates: [18.0350, 73.5410], status: 'operational', zoneId: 'Z-MAH-03' },

  // Nilgiris / Coonoor (Z-NIL-04)
  { id: 'N-NIL-S1', type: 'settlement', name: 'Coonoor Upper Ghat Settlement', state: 'Tamil Nadu', district: 'Nilgiris', coordinates: [11.3550, 76.7950], population: 2600, zoneId: 'Z-NIL-04', status: 'operational' },
  { id: 'N-NIL-H1', type: 'hospital', name: 'Lawley Government Hospital Coonoor', state: 'Tamil Nadu', district: 'Nilgiris', coordinates: [11.3510, 76.7980], capacity: 160, status: 'operational' },
  { id: 'N-NIL-SH1', type: 'shelter', name: 'Mettupalayam Relief Base', state: 'Tamil Nadu', district: 'Nilgiris', coordinates: [11.3020, 76.9410], capacity: 1800, status: 'operational' },
  { id: 'N-NIL-B1', type: 'bridge', name: 'Runnymede Mountain Viaduct', state: 'Tamil Nadu', district: 'Nilgiris', coordinates: [11.3480, 76.8120], status: 'operational', zoneId: 'Z-NIL-04' },

  // Sikkim / Mangan (Z-SKM-09)
  { id: 'N-SKM-S1', type: 'settlement', name: 'Dzongu River Valley Settlement', state: 'Sikkim', district: 'Mangan', coordinates: [27.5080, 88.5360], population: 2100, zoneId: 'Z-SKM-09', status: 'operational' },
  { id: 'N-SKM-H1', type: 'hospital', name: 'Mangan District Hospital', state: 'Sikkim', district: 'Mangan', coordinates: [27.5120, 88.5280], capacity: 170, status: 'operational' },
  { id: 'N-SKM-SH1', type: 'shelter', name: 'Phodong Multi-Purpose Relief Shelter', state: 'Sikkim', district: 'Mangan', coordinates: [27.4200, 88.5800], capacity: 1600, status: 'operational' },
  { id: 'N-SKM-B1', type: 'bridge', name: 'Sankalang Bailey Bridge', state: 'Sikkim', district: 'Mangan', coordinates: [27.5050, 88.5330], status: 'operational', zoneId: 'Z-SKM-09' },

  // Meghalaya / Sohra (Z-MEG-11)
  { id: 'N-MEG-S1', type: 'settlement', name: 'Sohra Gorge Settlement', state: 'Meghalaya', district: 'East Khasi Hills', coordinates: [25.3240, 91.7380], population: 2300, zoneId: 'Z-MEG-11', status: 'operational' },
  { id: 'N-MEG-H1', type: 'hospital', name: 'Cherrapunji Community Health Centre', state: 'Meghalaya', district: 'East Khasi Hills', coordinates: [25.2950, 91.7200], capacity: 150, status: 'operational' },
  { id: 'N-MEG-SH1', type: 'shelter', name: 'Mawkdok Highland Relief Complex', state: 'Meghalaya', district: 'East Khasi Hills', coordinates: [25.3500, 91.7550], capacity: 1700, status: 'operational' },
  { id: 'N-MEG-B1', type: 'bridge', name: 'Umshiang Gorge Bridge', state: 'Meghalaya', district: 'East Khasi Hills', coordinates: [25.3220, 91.7350], status: 'operational', zoneId: 'Z-MEG-11' },

  // Andhra Pradesh / Araku (Z-EG-12)
  { id: 'N-EG-S1', type: 'settlement', name: 'Araku Valley Tribal Hamlet', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju', coordinates: [18.2380, 82.9890], population: 2150, zoneId: 'Z-EG-12', status: 'operational' },
  { id: 'N-EG-H1', type: 'hospital', name: 'Araku Area Hospital', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju', coordinates: [18.3280, 82.8800], capacity: 130, status: 'operational' },
  { id: 'N-EG-SH1', type: 'shelter', name: 'Ananthagiri Mountain Relief Camp', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju', coordinates: [18.2250, 83.0100], capacity: 1400, status: 'operational' },
  { id: 'N-EG-B1', type: 'bridge', name: 'Gosthani River Ghat Span', state: 'Andhra Pradesh', district: 'Alluri Sitharama Raju', coordinates: [18.2360, 82.9860], status: 'operational', zoneId: 'Z-EG-12' }
];

export const panIndiaEdges: InfrastructureEdge[] = [
  // Wayanad road network
  { id: 'E-WAY-01', name: 'Chooralmala to Bailey Bridge Link', source: 'N-WAY-S1', target: 'N-WAY-B1', type: 'road', distance: 6, lengthKm: 2.8, status: 'active', zoneId: 'Z-WAY-01' },
  { id: 'E-WAY-02', name: 'Mundakkai Upper Scarp Track', source: 'N-WAY-S2', target: 'N-WAY-S1', type: 'road', distance: 8, lengthKm: 3.4, status: 'active', zoneId: 'Z-WAY-01' },
  { id: 'E-WAY-03', name: 'Bailey Bridge to Meppadi CHC Arterial', source: 'N-WAY-B1', target: 'N-WAY-H1', type: 'highway', highwayRef: 'SH-59', distance: 14, lengthKm: 7.2, status: 'active', zoneId: 'Z-WAY-01' },
  { id: 'E-WAY-04', name: 'Meppadi Hospital to Relief Shelter Route', source: 'N-WAY-H1', target: 'N-WAY-SH1', type: 'road', distance: 5, lengthKm: 1.8, status: 'active', zoneId: 'Z-WAY-01' },

  // Chamoli / Joshimath road network
  { id: 'E-UTK-01', name: 'Joshimath Bazaar to District Hospital', source: 'N-UTK-S1', target: 'N-UTK-H1', type: 'road', distance: 8, lengthKm: 3.1, status: 'active', zoneId: 'Z-UTK-05' },
  { id: 'E-UTK-02', name: 'Joshimath to Helang Bridge (NH-58)', source: 'N-UTK-S1', target: 'N-UTK-B1', type: 'highway', highwayRef: 'NH-58', distance: 16, lengthKm: 9.8, status: 'active', zoneId: 'Z-UTK-05' },
  { id: 'E-UTK-03', name: 'Helang Village to Alaknanda Bridge', source: 'N-UTK-S2', target: 'N-UTK-B1', type: 'road', distance: 7, lengthKm: 2.9, status: 'active', zoneId: 'Z-UTK-05' },
  { id: 'E-UTK-04', name: 'Helang Bridge to Tapovan Shelter', source: 'N-UTK-B1', target: 'N-UTK-SH1', type: 'road', distance: 19, lengthKm: 11.5, status: 'active', zoneId: 'Z-UTK-05' },

  // Darjeeling / Tista network
  { id: 'E-DAR-01', name: 'Tista Village to Suspension Bridge', source: 'N-DAR-S1', target: 'N-DAR-B1', type: 'road', distance: 7, lengthKm: 3.2, status: 'active', zoneId: 'Z-DAR-08' },
  { id: 'E-DAR-02', name: 'Tista Bridge to Darjeeling Hospital (NH-10)', source: 'N-DAR-B1', target: 'N-DAR-H1', type: 'highway', highwayRef: 'NH-10', distance: 15, lengthKm: 8.5, status: 'active', zoneId: 'Z-DAR-08' },
  { id: 'E-DAR-03', name: 'Tista Village to Highland Relief Shelter', source: 'N-DAR-S1', target: 'N-DAR-SH1', type: 'road', distance: 10, lengthKm: 4.8, status: 'active', zoneId: 'Z-DAR-08' },

  // HP Kinnaur network
  { id: 'E-HP-01', name: 'Nigulsari to Taranda Shelter (NH-5)', source: 'N-HP-S1', target: 'N-HP-SH1', type: 'highway', highwayRef: 'NH-5', distance: 12, lengthKm: 6.4, status: 'active', zoneId: 'Z-HP-06' },
  { id: 'E-HP-02', name: 'Nigulsari to Reckong Peo Hospital', source: 'N-HP-S1', target: 'N-HP-H1', type: 'highway', highwayRef: 'NH-5', distance: 35, lengthKm: 22.0, status: 'active', zoneId: 'Z-HP-06' },

  // J&K Ramban network
  { id: 'E-JK-01', name: 'Ramban Town to District Hospital', source: 'N-JK-S1', target: 'N-JK-H1', type: 'road', distance: 6, lengthKm: 2.1, status: 'active', zoneId: 'Z-JK-07' },
  { id: 'E-JK-02', name: 'Ramban Town to Chanderkote Shelter (NH-44)', source: 'N-JK-S1', target: 'N-JK-SH1', type: 'highway', highwayRef: 'NH-44', distance: 11, lengthKm: 5.9, status: 'active', zoneId: 'Z-JK-07' },

  // Assam Dima Hasao network
  { id: 'E-ASM-01', name: 'Haflong Colony to Civil Hospital', source: 'N-ASM-S1', target: 'N-ASM-H1', type: 'road', distance: 9, lengthKm: 3.8, status: 'active', zoneId: 'Z-ASM-10' },
  { id: 'E-ASM-02', name: 'Haflong Colony to Sports Shelter', source: 'N-ASM-S1', target: 'N-ASM-SH1', type: 'road', distance: 6, lengthKm: 2.4, status: 'active', zoneId: 'Z-ASM-10' },

  // Idukki network (Z-IDK-02)
  { id: 'E-IDK-01', name: 'Pettimudi Settlement to Culvert Bridge', source: 'N-IDK-S1', target: 'N-IDK-B1', type: 'road', distance: 6, lengthKm: 2.2, status: 'active', zoneId: 'Z-IDK-02' },
  { id: 'E-IDK-02', name: 'Culvert Bridge to Munnar Hospital (SH-17)', source: 'N-IDK-B1', target: 'N-IDK-H1', type: 'highway', highwayRef: 'SH-17', distance: 18, lengthKm: 12.0, status: 'active', zoneId: 'Z-IDK-02' },
  { id: 'E-IDK-03', name: 'Pettimudi to Rajamala Shelter Route', source: 'N-IDK-S1', target: 'N-IDK-SH1', type: 'road', distance: 8, lengthKm: 4.1, status: 'active', zoneId: 'Z-IDK-02' },

  // Raigad / Mahad network (Z-MAH-03)
  { id: 'E-MAH-01', name: 'Taliye Hill to Savitri Bridge', source: 'N-MAH-S1', target: 'N-MAH-B1', type: 'road', distance: 7, lengthKm: 3.0, status: 'active', zoneId: 'Z-MAH-03' },
  { id: 'E-MAH-02', name: 'Savitri Bridge to Mahad Hospital (NH-66)', source: 'N-MAH-B1', target: 'N-MAH-H1', type: 'highway', highwayRef: 'NH-66', distance: 16, lengthKm: 9.4, status: 'active', zoneId: 'Z-MAH-03' },
  { id: 'E-MAH-03', name: 'Taliye Settlement to Gram Relief Shelter', source: 'N-MAH-S1', target: 'N-MAH-SH1', type: 'road', distance: 5, lengthKm: 1.9, status: 'active', zoneId: 'Z-MAH-03' },

  // Nilgiris network (Z-NIL-04)
  { id: 'E-NIL-01', name: 'Coonoor Upper Ghat to Viaduct', source: 'N-NIL-S1', target: 'N-NIL-B1', type: 'road', distance: 5, lengthKm: 2.1, status: 'active', zoneId: 'Z-NIL-04' },
  { id: 'E-NIL-02', name: 'Viaduct to Lawley Hospital Coonoor', source: 'N-NIL-B1', target: 'N-NIL-H1', type: 'highway', highwayRef: 'NH-181', distance: 8, lengthKm: 3.8, status: 'active', zoneId: 'Z-NIL-04' },
  { id: 'E-NIL-03', name: 'Coonoor to Mettupalayam Relief Base', source: 'N-NIL-S1', target: 'N-NIL-SH1', type: 'road', distance: 22, lengthKm: 14.5, status: 'active', zoneId: 'Z-NIL-04' },

  // Sikkim network (Z-SKM-09)
  { id: 'E-SKM-01', name: 'Dzongu Valley to Sankalang Bridge', source: 'N-SKM-S1', target: 'N-SKM-B1', type: 'road', distance: 8, lengthKm: 3.5, status: 'active', zoneId: 'Z-SKM-09' },
  { id: 'E-SKM-02', name: 'Sankalang Bridge to Mangan Hospital', source: 'N-SKM-B1', target: 'N-SKM-H1', type: 'highway', highwayRef: 'NH-310A', distance: 14, lengthKm: 7.6, status: 'active', zoneId: 'Z-SKM-09' },
  { id: 'E-SKM-03', name: 'Dzongu to Phodong Relief Shelter', source: 'N-SKM-S1', target: 'N-SKM-SH1', type: 'road', distance: 24, lengthKm: 16.0, status: 'active', zoneId: 'Z-SKM-09' },

  // Meghalaya network (Z-MEG-11)
  { id: 'E-MEG-01', name: 'Sohra Gorge to Umshiang Bridge', source: 'N-MEG-S1', target: 'N-MEG-B1', type: 'road', distance: 6, lengthKm: 2.6, status: 'active', zoneId: 'Z-MEG-11' },
  { id: 'E-MEG-02', name: 'Umshiang Bridge to Cherrapunji CHC', source: 'N-MEG-B1', target: 'N-MEG-H1', type: 'highway', highwayRef: 'SH-5', distance: 12, lengthKm: 6.8, status: 'active', zoneId: 'Z-MEG-11' },
  { id: 'E-MEG-03', name: 'Sohra to Mawkdok Relief Complex', source: 'N-MEG-S1', target: 'N-MEG-SH1', type: 'road', distance: 15, lengthKm: 9.2, status: 'active', zoneId: 'Z-MEG-11' },

  // Andhra Pradesh network (Z-EG-12)
  { id: 'E-EG-01', name: 'Araku Hamlet to Gosthani Span', source: 'N-EG-S1', target: 'N-EG-B1', type: 'road', distance: 5, lengthKm: 2.0, status: 'active', zoneId: 'Z-EG-12' },
  { id: 'E-EG-02', name: 'Gosthani Span to Araku Area Hospital', source: 'N-EG-B1', target: 'N-EG-H1', type: 'highway', highwayRef: 'SH-39', distance: 16, lengthKm: 10.5, status: 'active', zoneId: 'Z-EG-12' },
  { id: 'E-EG-03', name: 'Araku to Ananthagiri Relief Camp', source: 'N-EG-S1', target: 'N-EG-SH1', type: 'road', distance: 10, lengthKm: 5.4, status: 'active', zoneId: 'Z-EG-12' }
];

export const panIndiaReports: FieldReport[] = [
  {
    id: 'REP-KL-001',
    reporterName: 'Anil Kumar (Local Resident)',
    reporterContact: '+91 98471 XXXXX',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    location: [11.5335, 76.1542],
    locationName: 'Chooralmala Tea Garden Slopes, Wayanad',
    state: 'Kerala',
    district: 'Wayanad',
    zoneId: 'Z-WAY-01',
    incidentType: 'Ground Crack',
    severity: 'Severe',
    description: '30-meter longitudinal tension crack observed across upper tea estate terrace following heavy overnight downpour. Soil slurry oozing at foot of slope.',
    verificationStatus: 'UNDER_REVIEW',
    clusterCount: 3,
    impactFlags: {
      roadAffected: true,
      buildingAffected: false,
      riverBlocked: false,
      peopleTrapped: false,
      evacuationRequired: true
    }
  },
  {
    id: 'REP-KL-002',
    reporterName: 'Manoj P. (Civil Defense Volunteer)',
    reporterContact: '+91 94462 XXXXX',
    timestamp: new Date(Date.now() - 85 * 60000).toISOString(),
    location: [11.5310, 76.1580],
    locationName: 'Mundakkai School Road, Wayanad',
    state: 'Kerala',
    district: 'Wayanad',
    zoneId: 'Z-WAY-01',
    incidentType: 'Mudslide',
    severity: 'Critical',
    description: 'Debris slurry overflowing road culvert; small mudslide has partially blocked single-lane access to Mundakkai bridge.',
    verificationStatus: 'CONFIRMED',
    verifiedAt: new Date(Date.now() - 40 * 60000).toISOString(),
    verifiedBy: 'Wayanad District Disaster Management Authority (DDMA)',
    clusterCount: 3,
    impactFlags: {
      roadAffected: true,
      buildingAffected: true,
      riverBlocked: true,
      peopleTrapped: false,
      evacuationRequired: true
    }
  },
  {
    id: 'REP-UTK-003',
    reporterName: 'Sunil Negi (GREF Road Inspector)',
    reporterContact: '+91 97581 XXXXX',
    timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
    location: [30.5540, 79.5640],
    locationName: 'NH-58 Milepost 284, Joshimath',
    state: 'Uttarakhand',
    district: 'Chamoli',
    zoneId: 'Z-UTK-05',
    incidentType: 'Slope Failure',
    severity: 'Moderate',
    description: 'Continuous rock rattling and minor scree sliding from uphill cut above Alaknanda gorge. Retaining gabion wall showing bulge.',
    verificationStatus: 'UNDER_REVIEW',
    clusterCount: 1,
    impactFlags: {
      roadAffected: true,
      buildingAffected: false,
      riverBlocked: false,
      peopleTrapped: false,
      evacuationRequired: false
    }
  },
  {
    id: 'REP-SKM-004',
    reporterName: 'Tashi Lepcha (Panchayat Head)',
    reporterContact: '+91 94340 XXXXX',
    timestamp: new Date(Date.now() - 210 * 60000).toISOString(),
    location: [27.5020, 88.5300],
    locationName: 'Dzongu North Flank, Sikkim',
    state: 'Sikkim',
    district: 'Mangan',
    zoneId: 'Z-SKM-09',
    incidentType: 'Rockfall',
    severity: 'Severe',
    description: 'Boulder cascade blocked primary culvert connector. River Kanaka water turbidity turned dark brown indicating upstream slope shearing.',
    verificationStatus: 'CONFIRMED',
    verifiedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    verifiedBy: 'Sikkim State Disaster Management Authority (SSDMA)',
    clusterCount: 2,
    impactFlags: {
      roadAffected: true,
      buildingAffected: false,
      riverBlocked: true,
      peopleTrapped: false,
      evacuationRequired: true
    }
  }
];

export const panIndiaSeismicEvents: SeismicEvent[] = [
  {
    id: 'EQ-NCS-2026-081',
    magnitude: 4.4,
    depthKm: 12,
    timestamp: new Date(Date.now() - 48 * 60000).toISOString(),
    locationName: 'North of Chamoli, Garhwal Himalaya',
    state: 'Uttarakhand',
    coordinates: [30.6800, 79.6200],
    source: 'NCS_INDIA',
    intensityCategory: 'LIGHT'
  },
  {
    id: 'EQ-NCS-2026-082',
    magnitude: 3.6,
    depthKm: 8,
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    locationName: 'Near Mangan, North Sikkim',
    state: 'Sikkim',
    coordinates: [27.5400, 88.5800],
    source: 'NCS_INDIA',
    intensityCategory: 'LIGHT'
  },
  {
    id: 'EQ-NCS-2026-079',
    magnitude: 2.8,
    depthKm: 5,
    timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
    locationName: 'Idukki Fault Zone, Western Ghats',
    state: 'Kerala',
    coordinates: [9.9200, 76.9800],
    source: 'NCS_INDIA',
    intensityCategory: 'LIGHT'
  }
];

export const panIndiaSatelliteObservations: SatelliteObservation[] = [
  {
    id: 'SAT-S1-001',
    satellite: 'Sentinel-1 SAR',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    targetRegion: 'Joshimath-Chamoli Subsidence Bowl',
    coordinates: [30.5560, 79.5670],
    observationType: 'InSAR Surface Deformation',
    value: '-14.8 mm/month (Elevated Line-of-Sight Subsidence)',
    deformationRateMmMonth: -14.8,
    status: 'AVAILABLE',
    confidenceScore: 89
  },
  {
    id: 'SAT-S1-002',
    satellite: 'Sentinel-1 SAR',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    targetRegion: 'Wayanad Chooralmala Slope Sector',
    coordinates: [11.5320, 76.1530],
    observationType: 'InSAR Surface Deformation',
    value: '+9.2 mm/month (Active Colluvial Creep)',
    deformationRateMmMonth: 9.2,
    status: 'AVAILABLE',
    confidenceScore: 84
  },
  {
    id: 'SAT-S2-003',
    satellite: 'Sentinel-2 Optical',
    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    targetRegion: 'Mangan-Dzongu Gorge, Sikkim',
    coordinates: [27.5050, 88.5320],
    observationType: 'Optical Land Cover & Scars',
    value: 'Crown scar expansion & NDVI drop (-0.25 delta)',
    status: 'AVAILABLE',
    confidenceScore: 92
  }
];

export const mockSeismicEvents = panIndiaSeismicEvents;
export const mockDeformationEvents = panIndiaSatelliteObservations;
export const mockZones = panIndiaZones;
export const mockNodes = panIndiaNodes;
export const mockEdges = panIndiaEdges;
export const mockFieldReports = panIndiaReports;
