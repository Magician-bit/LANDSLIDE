import {
  RiskZone,
  DynamicTrigger,
  RiskState,
  Scenario,
  InfrastructureNode,
  InfrastructureEdge,
  FieldReport,
  TimelineStep,
  CascadingNode,
  EvacuationPlan,
  EvacuationRoute,
  RiskModelConfig,
  RiskFeatureContribution
} from '../types';

function getNum(val: number | undefined | null, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

const DEFAULT_RISK_CONFIG: RiskModelConfig = {
  weightBaseline: 0.30,
  weightRainfall: 0.32,
  weightSoilMoisture: 0.16,
  weightSlopeInstability: 0.12,
  weightSatelliteDeformation: 0.04,
  weightSeismicTrigger: 0.03,
  weightCommunityReports: 0.03
};

export function calculateDynamicRisk(
  zone?: Partial<RiskZone> | null,
  trigger?: Partial<DynamicTrigger> | null,
  scenario?: Partial<Scenario> | null,
  reports?: FieldReport[] | null,
  timelineStep: TimelineStep = 'NOW',
  config: RiskModelConfig = DEFAULT_RISK_CONFIG
): RiskState {
  const safeZone = zone || {};
  
  // Safe clamped environmental values
  const rainfall24h = Math.max(0, Math.min(450, getNum(trigger?.rainfall24h, 45.0)));
  const rainfallAnomaly = Math.max(0.4, Math.min(6, getNum(trigger?.rainfallAnomaly, 1.0)));
  const antecedentPrecipitation = Math.max(0, Math.min(350, getNum(trigger?.antecedentPrecipitation, Math.max(30, rainfall24h * 1.4))));
  const soilMoisture = Math.max(0, Math.min(100, getNum(trigger?.soilMoisture, 65.0)));
  const soilMoistureTrend = getNum(trigger?.soilMoistureTrend, 1.5);
  const slopeInstabilityFactor = Math.max(0, Math.min(100, getNum(trigger?.slopeInstabilityFactor, 55)));
  const groundDeformation = Math.max(0, Math.min(50, getNum(trigger?.groundDeformationMmMonth, 4.2)));
  const communityReportScore = Math.max(0, Math.min(100, getNum(trigger?.communityReportScore, 0)));

  const safeTrigger: DynamicTrigger = {
    rainfall1h: getNum(trigger?.rainfall1h, 4.5),
    rainfall24h,
    rainfallAnomaly,
    soilMoisture,
    soilMoistureTrend,
    antecedentPrecipitation,
    slopeInstabilityFactor,
    groundDeformationMmMonth: groundDeformation,
    groundVibration: getNum(trigger?.groundVibration, 1.0),
    temperatureAnomaly: getNum(trigger?.temperatureAnomaly, 1.2),
    nearestEarthquake: trigger?.nearestEarthquake ?? null,
    communityReportScore
  };

  const safeScenario: Scenario = {
    active: !!scenario?.active,
    type: scenario?.type || 'Baseline',
    rainfallMultiplier: getNum(scenario?.rainfallMultiplier, 1),
    duration: getNum(scenario?.duration, 24),
    soilMoistureMultiplier: getNum(scenario?.soilMoistureMultiplier, 1),
    slopeInstabilityMultiplier: getNum(scenario?.slopeInstabilityMultiplier, 1),
    groundDeformationMultiplier: getNum(scenario?.groundDeformationMultiplier, 1),
    seismicMagnitude: scenario?.seismicMagnitude,
    selectedZoneId: scenario?.selectedZoneId ?? null,
    failedInfrastructureIds: Array.isArray(scenario?.failedInfrastructureIds) ? scenario.failedInfrastructureIds : [],
  };

  const safeReports = Array.isArray(reports) ? reports : [];

  const env = safeZone.environmentalFeatures || {
    elevation: 1400,
    slope: 38,
    aspect: 'South',
    terrainRuggedness: 8.0,
    landCover: 'Forest & Steep Escarpments',
    ndviChange: -0.12,
    drainage: 'High Convergence',
    gsiSusceptibilityClass: 'High'
  };

  // Base dynamic factor calculations
  // 1. Rainfall factor (IMD/GPM): 24h precipitation, anomaly ratio, antecedent saturation
  let rainfallFactor = ((safeTrigger.rainfall24h / 60) * 50) + (0) + ((safeTrigger.antecedentPrecipitation / 120) * 20);
  
  // 2. Soil factor: upper horizon saturation & moisture delta
  let soilFactor = (safeTrigger.soilMoisture * 0.8) + (safeTrigger.soilMoistureTrend * 8);
  
  // 3. Slope shear stress: gradient angle relative to critical friction angle (35-45°)
  const slopeRatio = (env.slope / 45) * 100;
  let slopeFactor = (slopeRatio * 0.55) + ((safeTrigger.slopeInstabilityFactor || 50) * 0.45);

  // 4. Satellite InSAR deformation factor (Sentinel-1)
  let deformationFactor = Math.min(100, (safeTrigger.groundDeformationMmMonth || 0) * 8.5);

  // 5. Seismic dynamic shock factor (NCS)
  let seismicFactor = 0;
  if (safeTrigger.nearestEarthquake && safeTrigger.nearestEarthquake.distanceKm < 150) {
    const eq = safeTrigger.nearestEarthquake;
    const distAtten = Math.max(0.1, 1 - (eq.distanceKm / 150));
    seismicFactor = Math.min(100, (eq.magnitude / 6.0) * 100 * distAtten);
  }

  // 6. Community field reports factor
  let reportFactor = Math.min(100, safeTrigger.communityReportScore || 0);

  // Apply What-If scenario multipliers if active
  if (safeScenario.active) {
    const isTargetZone = !safeScenario.selectedZoneId || safeZone.id === safeScenario.selectedZoneId;
    const isRegionalCascade = safeScenario.type === 'Multi-Zone Landslide' || safeScenario.type === 'Extreme Weather Cascade';
    
    // Check if zone is in the same regional cluster as the selected target zone
    const isRegionalNeighbor = isRegionalCascade && safeScenario.selectedZoneId
      ? (safeZone.state === (safeZone.state || '') || safeZone.hillRange === (safeZone.hillRange || ''))
      : false;

    if (isTargetZone) {
      // Full scenario multipliers for the designated target sector
      if (safeScenario.type === 'Heavy Rain' || safeScenario.type === 'Heavy Rainfall') {
        rainfallFactor *= (safeScenario.rainfallMultiplier || 1.8);
        soilFactor *= 1.35;
      } else if (safeScenario.type === 'Extreme Rainfall' || safeScenario.type === 'Cloudburst Event') {
        rainfallFactor *= (safeScenario.rainfallMultiplier || 2.8);
        soilFactor *= 1.6;
        slopeFactor *= 1.3;
      } else if (safeScenario.type === 'Earthquake Trigger') {
        seismicFactor = Math.max(85, (safeScenario.seismicMagnitude || 5.8) * 14.5);
        slopeFactor *= 1.45;
        deformationFactor *= 1.5;
      } else if (safeScenario.type === 'Soil Saturation') {
        soilFactor *= (safeScenario.soilMoistureMultiplier || 1.7);
        slopeFactor *= 1.2;
      } else if (safeScenario.type === 'Slope Failure') {
        slopeFactor *= (safeScenario.slopeInstabilityMultiplier || 1.9);
        deformationFactor *= 1.8;
      } else if (safeScenario.type === 'Community Report Surge') {
        reportFactor = 95;
      } else if (safeScenario.type === 'Bridge Failure' || safeScenario.type === 'Road Blockage') {
        slopeFactor *= 1.15;
      } else if (isRegionalCascade) {
        rainfallFactor *= 2.4;
        soilFactor *= 1.6;
        slopeFactor *= 1.5;
        deformationFactor *= 1.6;
      }
    } else if (isRegionalNeighbor) {
      // Moderate attenuated cascade for connected regional neighbors
      rainfallFactor *= 1.3;
      soilFactor *= 1.2;
      slopeFactor *= 1.15;
    }
    // All other non-selected zones receive 0 scenario multipliers and remain at baseline
  }

  // Bound components to [0, 100]
  rainfallFactor = Math.max(0, Math.min(100, isNaN(rainfallFactor) ? 0 : rainfallFactor));
  soilFactor = Math.max(0, Math.min(100, isNaN(soilFactor) ? 0 : soilFactor));
  slopeFactor = Math.max(0, Math.min(100, isNaN(slopeFactor) ? 0 : slopeFactor));
  deformationFactor = Math.max(0, Math.min(100, isNaN(deformationFactor) ? 0 : deformationFactor));
  seismicFactor = Math.max(0, Math.min(100, isNaN(seismicFactor) ? 0 : seismicFactor));
  reportFactor = Math.max(0, Math.min(100, isNaN(reportFactor) ? 0 : reportFactor));

  // Dynamic Trigger Composite Score
  const triggerScore = 
    (rainfallFactor * 0.46) + 
    (soilFactor * 0.24) + 
    (slopeFactor * 0.16) + 
    (deformationFactor * 0.06) + 
    (seismicFactor * 0.04) + 
    (reportFactor * 0.04);

  const staticSusc = safeZone.staticSusceptibility ?? 70;

  // Composite Multi-Source Risk
  // Only elevate risk if there are actual dynamic triggers (rain, seismic, deformation, reports)
  const activeDynamicTriggers = rainfallFactor + deformationFactor + seismicFactor + reportFactor;
  let calculatedRisk = 0;
  if (activeDynamicTriggers > 10) {
    calculatedRisk = (staticSusc * config.weightBaseline) + (triggerScore * (1 - config.weightBaseline));
  } else {
    calculatedRisk = triggerScore * (staticSusc / 100) * 0.5; // Very low if no active triggers
  }

  // Rate of escalation (momentum)
  let momentum = Math.round(
    ((rainfallFactor - 50) * 0.14) + 
    ((soilFactor - 50) * 0.10) + 
    ((slopeFactor - 50) * 0.08) + 
    (seismicFactor > 40 ? 12 : 0)
  );

  if (safeScenario.active) {
    momentum += (safeScenario.type.includes('Extreme') || safeScenario.type.includes('Cloudburst')) ? 16 : 8;
  }

  // Multi-temporal forecast projection points
  const forecast = {
    t6: Math.max(0, Math.min(100, calculatedRisk + (momentum * 0.45))),
    t12: Math.max(0, Math.min(100, calculatedRisk + (momentum * 0.8))),
    t24: Math.max(0, Math.min(100, calculatedRisk + momentum)),
    t48: Math.max(0, Math.min(100, calculatedRisk + (momentum * 1.25)))
  };

  // Adjust for active timeline step
  let currentRisk = calculatedRisk;
  if (timelineStep === 'PAST_24H') {
    currentRisk = Math.max(15, calculatedRisk - 24);
  } else if (timelineStep === 'PAST_6H') {
    currentRisk = Math.max(20, calculatedRisk - 12);
  } else if (timelineStep === 'T_PLUS_6H') {
    currentRisk = forecast.t6;
  } else if (timelineStep === 'T_PLUS_12H') {
    currentRisk = forecast.t12;
  } else if (timelineStep === 'T_PLUS_24H') {
    currentRisk = forecast.t24;
  } else if (timelineStep === 'T_PLUS_48H') {
    currentRisk = forecast.t48;
  }

  currentRisk = Math.max(0, Math.min(100, Math.round(currentRisk)));

  // Critical hazard temporal window
  let hazardWindow: [string, string] = ['--', '--'];
  if (currentRisk >= 60) {
    const now = new Date();
    const startHourOffset = currentRisk >= 80 ? 1 : 3;
    const endHourOffset = currentRisk >= 80 ? 7 : 12;
    const start = new Date(now.getTime() + startHourOffset * 3600000);
    const end = new Date(now.getTime() + endHourOffset * 3600000);
    hazardWindow = [
      start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ];
  }

  // Consensus & confidence calculation
  const zoneReports = safeReports.filter(r => r && (r.zoneId === safeZone.id || r.state === safeZone.state));
  const verifiedCount = zoneReports.filter(r => r.verificationStatus === 'CONFIRMED').length;

  let activeDataStreams = 4; // Baseline GSI, NRSC, IMD weather, Terrain
  if (safeTrigger.nearestEarthquake) activeDataStreams++;
  if (safeTrigger.groundDeformationMmMonth && safeTrigger.groundDeformationMmMonth > 0) activeDataStreams++;
  if (zoneReports.length > 0) activeDataStreams++;

  const dataCoverage = Math.min(100, Math.round((activeDataStreams / 7) * 100));
  const confidence = Math.max(70, Math.min(96, 72 + Math.round((activeDataStreams / 7) * 20) + (verifiedCount * 2)));

  // Feature Contributions Attribution Breakdown
  const rawAttributions: RiskFeatureContribution[] = [
    {
      feature: 'Rainfall Anomaly & Rate',
      source: 'IMD AWS & NASA GPM',
      value: Number((rainfallFactor * config.weightRainfall).toFixed(1)),
      percentage: 0,
      isAvailable: true,
      statusText: `${safeTrigger.rainfall24h} mm/24h (${safeTrigger.rainfallAnomaly}x anomaly)`
    },
    {
      feature: 'Geological Baseline Susceptibility',
      source: 'GSI NLSM & NRSC Atlas',
      value: Number((staticSusc * config.weightBaseline).toFixed(1)),
      percentage: 0,
      isAvailable: true,
      statusText: `NLSM ${env.gsiSusceptibilityClass || 'High'} (${staticSusc}/100)`
    },
    {
      feature: 'Pore-Water Soil Saturation',
      source: 'Soil Moisture Hydrology Model',
      value: Number((soilFactor * config.weightSoilMoisture).toFixed(1)),
      percentage: 0,
      isAvailable: true,
      statusText: `${Math.round(safeTrigger.soilMoisture)}% capacity (trend +${safeTrigger.soilMoistureTrend}%)`
    },
    {
      feature: 'Topographic Slope & Shear',
      source: 'DEM Morphometry',
      value: Number((slopeFactor * config.weightSlopeInstability).toFixed(1)),
      percentage: 0,
      isAvailable: true,
      statusText: `${env.slope}° slope gradient (${env.terrainRuggedness}/10 ruggedness)`
    },
    {
      feature: 'Ground Surface Deformation',
      source: 'Sentinel-1 InSAR Radar',
      value: Number((deformationFactor * config.weightSatelliteDeformation).toFixed(1)),
      percentage: 0,
      isAvailable: safeTrigger.groundDeformationMmMonth !== undefined && safeTrigger.groundDeformationMmMonth > 0,
      statusText: `${safeTrigger.groundDeformationMmMonth?.toFixed(1) || 0} mm/mo displacement`
    },
    {
      feature: 'Seismic Shock Proximity',
      source: 'NCS Seismology Feed',
      value: Number((seismicFactor * config.weightSeismicTrigger).toFixed(1)),
      percentage: 0,
      isAvailable: !!safeTrigger.nearestEarthquake,
      statusText: safeTrigger.nearestEarthquake ? `M${safeTrigger.nearestEarthquake.magnitude} (${safeTrigger.nearestEarthquake.distanceKm} km)` : 'No recent epicenter'
    },
    {
      feature: 'Citizen & Field Incident Reports',
      source: 'Community Reporting Grid',
      value: Number((reportFactor * config.weightCommunityReports).toFixed(1)),
      percentage: 0,
      isAvailable: zoneReports.length > 0,
      statusText: `${zoneReports.length} reports (${verifiedCount} verified)`
    }
  ];

  const totalRaw = rawAttributions.reduce((acc, item) => acc + item.value, 0) || 1;
  const featureContributions = rawAttributions.map(item => ({
    ...item,
    percentage: Math.round((item.value / totalRaw) * 100)
  })).sort((a, b) => b.percentage - a.percentage);

  const primaryDriver = featureContributions[0]?.feature || 'Monsoon Rainfall & Slope Shear';

  // Status mapping
  let status: RiskState['status'] = 'LOW';
  if (currentRisk >= 80) status = 'CRITICAL';
  else if (currentRisk >= 68) status = 'VERY_HIGH';
  else if (currentRisk >= 52) status = 'HIGH';
  else if (currentRisk >= 35) status = 'MODERATE';

  // Transparent explanation
  const precipPct = Math.round((safeTrigger.rainfall24h / 40) * 100);
  const soilPct = Math.round(safeTrigger.soilMoisture);
  const slopeDeg = env.slope || 38;

  let explanation = `Estimated dynamic risk is ${status} (${currentRisk}/100) based on multi-source fusion: `;
  if (precipPct >= 140 && soilPct > 70) {
    explanation += `accumulated rainfall (+${precipPct - 100}% above seasonal norm) combined with ${soilPct}% soil pore-water saturation on a steep ${slopeDeg}° slope gradient.`;
  } else if (safeTrigger.nearestEarthquake && safeTrigger.nearestEarthquake.magnitude >= 4.0) {
    explanation += `seismic vibration (M${safeTrigger.nearestEarthquake.magnitude} at ${safeTrigger.nearestEarthquake.distanceKm}km) elevated geotechnical shear stress on baseline GSI ${env.gsiSusceptibilityClass} terrain.`;
  } else if (slopeDeg >= 40) {
    explanation += `high topographical slope angle (${slopeDeg}°) in GSI ${env.gsiSusceptibilityClass} zone, with continuous telemetry monitoring.`;
  } else {
    explanation += `environmental triggers and static geological susceptibility indicate normal baseline conditions with active telemetry ingestion.`;
  }

  return {
    currentRisk,
    baselineSusceptibility: staticSusc,
    triggerScore: Math.round(triggerScore),
    momentum,
    hazardWindow,
    forecast: {
      t6: Math.round(forecast.t6),
      t12: Math.round(forecast.t12),
      t24: Math.round(forecast.t24),
      t48: Math.round(forecast.t48)
    },
    confidence,
    dataCoverage,
    primaryDriver,
    featureContributions,
    explanation,
    status,
    dataSourcesUsed: ['IMD Weather AWS', 'GSI NLSM Susceptibility', 'NRSC Landslide Atlas', 'Sentinel-1 InSAR', 'NCS Seismology', 'Citizen Reports']
  };
}

export function calculateNetworkImpact(
  nodes?: InfrastructureNode[] | null,
  edges?: InfrastructureEdge[] | null,
  scenario?: Partial<Scenario> | null
) {
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const safeEdges = Array.isArray(edges) ? edges : [];
  const safeScenario: Scenario = {
    active: !!scenario?.active,
    type: scenario?.type || 'Baseline',
    rainfallMultiplier: scenario?.rainfallMultiplier ?? 1,
    duration: scenario?.duration ?? 24,
    soilMoistureMultiplier: scenario?.soilMoistureMultiplier ?? 1,
    selectedZoneId: scenario?.selectedZoneId ?? null,
    failedInfrastructureIds: Array.isArray(scenario?.failedInfrastructureIds) ? scenario.failedInfrastructureIds : [],
  };

  // Determine edge statuses
  const edgeStatusMap = new Map<string, 'active' | 'threatened' | 'blocked' | 'failed'>();
  const targetZoneId = safeScenario.selectedZoneId;

  safeEdges.forEach(e => {
    let s: 'active' | 'threatened' | 'blocked' | 'failed' = e.status || 'active';
    if (safeScenario.active) {
      const isExplicitlyFailed = 
        safeScenario.failedInfrastructureIds.includes(e.id) ||
        safeScenario.failedInfrastructureIds.includes(e.source) ||
        safeScenario.failedInfrastructureIds.includes(e.target);

      const isTargetZoneEdge = !targetZoneId || e.zoneId === targetZoneId;

      if (isExplicitlyFailed) {
        s = 'failed';
      } else if (
        isTargetZoneEdge &&
        (safeScenario.type === 'Road Blockage' || safeScenario.type === 'Road Failure') &&
        e.type === 'road'
      ) {
        s = 'failed';
      } else if (
        isTargetZoneEdge &&
        safeScenario.type === 'Bridge Failure' &&
        (e.type === 'bridge' || e.name?.toLowerCase().includes('bridge') || e.name?.toLowerCase().includes('viaduct') || e.name?.toLowerCase().includes('span') || e.source.includes('B1') || e.target.includes('B1'))
      ) {
        s = 'failed';
      } else if (isTargetZoneEdge && (safeScenario.type === 'Extreme Weather Cascade' || safeScenario.type === 'Cloudburst Event')) {
        if (e.type === 'bridge' || e.name?.toLowerCase().includes('bridge') || e.id.includes('01')) {
          s = 'failed';
        }
      }
    }
    edgeStatusMap.set(e.id, s);
  });

  const activeEdges = safeEdges.filter(e => edgeStatusMap.get(e.id) === 'active');

  // Adjacency lists for Dijkstra shortest path
  const adj = new Map<string, { target: string; weight: number; edgeId: string }[]>();
  safeNodes.forEach(n => adj.set(n.id, []));
  
  activeEdges.forEach(e => {
    if (!e.source || !e.target) return;
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)?.push({ target: e.target, weight: e.distance || 1, edgeId: e.id });
    adj.get(e.target)?.push({ target: e.source, weight: e.distance || 1, edgeId: e.id });
  });

  const settlements = safeNodes.filter(n => n.type === 'settlement');
  const medicalAndShelters = safeNodes.filter(n => n.type === 'hospital' || n.type === 'shelter');

  // Compute shortest path for each settlement
  const results = settlements.map(settlement => {
    let shortestDist = Infinity;
    let bestTarget: InfrastructureNode | null = null;
    let bestPathNodes: string[] = [];
    let bestPathEdges: string[] = [];

    medicalAndShelters.forEach(dest => {
      const dist = new Map<string, number>();
      const prev = new Map<string, { node: string; edgeId: string } | null>();
      safeNodes.forEach(n => {
        dist.set(n.id, Infinity);
        prev.set(n.id, null);
      });
      dist.set(settlement.id, 0);

      const unvisited = new Set(safeNodes.map(n => n.id));

      while (unvisited.size > 0) {
        let u: string | null = null;
        let minDist = Infinity;

        unvisited.forEach(nodeId => {
          const d = dist.get(nodeId) ?? Infinity;
          if (d < minDist) {
            minDist = d;
            u = nodeId;
          }
        });

        if (!u || minDist === Infinity) break;
        if (u === dest.id) {
          if (minDist < shortestDist) {
            shortestDist = minDist;
            bestTarget = dest;
            
            const pathN: string[] = [];
            const pathE: string[] = [];
            let curr: string | null = dest.id;
            while (curr) {
              pathN.unshift(curr);
              const p = prev.get(curr);
              if (p) {
                pathE.unshift(p.edgeId);
                curr = p.node;
              } else {
                curr = null;
              }
            }
            bestPathNodes = pathN;
            bestPathEdges = pathE;
          }
          break;
        }

        unvisited.delete(u);

        const neighbors = adj.get(u) || [];
        const currentDist = dist.get(u) ?? Infinity;

        neighbors.forEach(neighbor => {
          if (unvisited.has(neighbor.target)) {
            const alt = currentDist + (neighbor.weight || 1);
            if (alt < (dist.get(neighbor.target) ?? Infinity)) {
              dist.set(neighbor.target, alt);
              prev.set(neighbor.target, { node: u!, edgeId: neighbor.edgeId });
            }
          }
        });
      }
    });

    const isIsolated = shortestDist === Infinity || !bestTarget;

    return {
      settlementId: settlement.id,
      settlementName: settlement.name,
      population: settlement.population || 0,
      zoneId: settlement.zoneId,
      isolated: isIsolated,
      targetFacilityId: bestTarget ? (bestTarget as InfrastructureNode).id : null,
      targetFacilityName: bestTarget ? (bestTarget as InfrastructureNode).name : 'No viable route found',
      travelTimeMinutes: isIsolated ? -1 : shortestDist,
      distanceKm: isIsolated ? -1 : Number((shortestDist * 0.55).toFixed(1)),
      pathNodeIds: bestPathNodes,
      pathEdgeIds: bestPathEdges
    };
  });

  const isolatedSettlements = results.filter(r => r.isolated);
  const isolatedPopulation = isolatedSettlements.reduce((sum, r) => sum + r.population, 0);

  let maxTravelTime = 0;
  results.forEach(r => {
    if (!r.isolated && r.travelTimeMinutes > maxTravelTime) {
      maxTravelTime = r.travelTimeMinutes;
    }
  });

  const failedEdgesCount = Array.from(edgeStatusMap.values()).filter(s => s === 'failed' || s === 'blocked').length;
  const isolationScore = Math.min(100, Math.round((isolatedPopulation / 1000) * 18 + (failedEdgesCount * 12) + (maxTravelTime > 30 ? 20 : 0)));

  return {
    results,
    isolatedCommunities: isolatedSettlements.length,
    isolatedPopulation,
    maxTravelTime: maxTravelTime === Infinity ? -1 : maxTravelTime,
    isolationScore,
    edgeStatusMap: Object.fromEntries(edgeStatusMap),
    failedEdgesCount
  };
}

export function generateCascadingEffectsChain(
  scenario: Scenario,
  zones: RiskZone[],
  riskStates: Record<string, RiskState>,
  networkImpact: ReturnType<typeof calculateNetworkImpact>
): CascadingNode[] {
  // Directly bind cascading effects to the target simulation zone if specified
  const targetZone = (scenario.selectedZoneId && zones.find(z => z.id === scenario.selectedZoneId))
    || zones.reduce((prev, curr) => {
      const prevRisk = riskStates[prev.id]?.currentRisk ?? 0;
      const currRisk = riskStates[curr.id]?.currentRisk ?? 0;
      return currRisk > prevRisk ? curr : prev;
    }, zones[0] || { id: 'Z-WAY-01', name: 'Chooralmala-Meppadi Escarpment', district: 'Wayanad', state: 'Kerala', coordinates: [11.5320, 76.1530], environmentalFeatures: { slope: 41 } } as RiskZone);

  const topRiskState = riskStates[targetZone.id] || { currentRisk: 82, primaryDriver: 'Monsoon Surge' };
  const isolatedCount = networkImpact?.isolatedCommunities || 0;
  const isolatedPop = networkImpact?.isolatedPopulation || 0;

  const isRainEvent = scenario.active && (scenario.type === 'Heavy Rain' || scenario.type === 'Heavy Rainfall' || scenario.type === 'Extreme Rainfall' || scenario.type === 'Cloudburst Event');
  const isExtreme = scenario.active && (scenario.type === 'Extreme Rainfall' || scenario.type === 'Cloudburst Event' || scenario.type === 'Extreme Weather Cascade');
  const isEarthquake = scenario.active && scenario.type === 'Earthquake Trigger';

  return [
    {
      id: 'CASC-1',
      title: isEarthquake 
        ? `M5.8 Seismic Tremor & Ground Acceleration` 
        : isExtreme 
        ? `Severe Cloudburst & Extreme Rain (${targetZone.district})` 
        : isRainEvent 
        ? `Monsoon Precipitation Surge (${targetZone.name})` 
        : 'Baseline IMD Meteorological Telemetry',
      subtitle: isEarthquake
        ? `Peak ground acceleration along active fault line in ${targetZone.district}, ${targetZone.state}`
        : isRainEvent 
        ? `Precipitation +${Math.round((scenario.rainfallMultiplier - 1) * 100)}% over 24h threshold in ${targetZone.district}` 
        : `Normal baseline meteorological feeds active for ${targetZone.name}`,
      category: 'TRIGGER',
      targetType: 'general',
      severity: isExtreme || isEarthquake ? 'CRITICAL' : isRainEvent ? 'ELEVATED' : 'NORMAL'
    },
    {
      id: 'CASC-2',
      title: 'Pore-Water Pressure & Saturation Spike',
      subtitle: `Subsurface soil moisture reaching ${isRainEvent ? '94%' : '65%'} capacity across ${targetZone.district} terrain`,
      category: 'SOIL',
      targetType: 'zone',
      targetId: targetZone.id,
      severity: isRainEvent || isEarthquake ? 'CRITICAL' : 'ELEVATED',
      coordinates: targetZone.coordinates
    },
    {
      id: 'CASC-3',
      title: 'Slope Shear Stress & Factor of Safety Reduction',
      subtitle: `Critical shear threshold on ${targetZone.environmentalFeatures?.slope || 40}° gradient (${targetZone.hillRange || 'Mountain Sector'})`,
      category: 'STABILITY',
      targetType: 'zone',
      targetId: targetZone.id,
      severity: topRiskState.currentRisk > 75 ? 'CRITICAL' : 'ELEVATED',
      coordinates: targetZone.coordinates
    },
    {
      id: 'CASC-4',
      title: `Multi-Source Landslide Risk Peak (${topRiskState.currentRisk}/100)`,
      subtitle: `${targetZone.name} reaches critical instability threshold`,
      category: 'HAZARD',
      targetType: 'zone',
      targetId: targetZone.id,
      severity: topRiskState.currentRisk > 75 ? 'CRITICAL' : 'ELEVATED',
      coordinates: targetZone.coordinates
    },
    {
      id: 'CASC-5',
      title: scenario.failedInfrastructureIds.length > 0 ? 'Road / Bridge Corridor Failure' : 'Downslope Transit Route Threatened',
      subtitle: scenario.failedInfrastructureIds.length > 0 
        ? `${scenario.failedInfrastructureIds.join(', ')} severed in ${targetZone.district}`
        : `Primary arterial in ${targetZone.name} debris runout zone`,
      category: 'INFRASTRUCTURE',
      targetType: 'edge',
      targetId: scenario.failedInfrastructureIds[0] || 'E-WAY-01',
      severity: scenario.failedInfrastructureIds.length > 0 ? 'CRITICAL' : 'ELEVATED'
    },
    {
      id: 'CASC-6',
      title: isolatedCount > 0 ? `${isolatedCount} Communities Isolated` : 'Settlement Accessibility Constrained',
      subtitle: isolatedCount > 0 ? `${isolatedPop.toLocaleString()} citizens cut off from direct medical access in ${targetZone.district}` : 'Travel times elevated on mountain roads',
      category: 'COMMUNITY',
      targetType: 'node',
      targetId: networkImpact?.results.find(r => r.isolated)?.settlementId || 'N-WAY-S1',
      severity: isolatedCount > 0 ? 'CRITICAL' : 'ELEVATED'
    },
    {
      id: 'CASC-7',
      title: 'Dynamic Evacuation & Multi-Agency Response',
      subtitle: `Shortest-path Dijkstra routing calculated for designated disaster relief shelters in ${targetZone.state}`,
      category: 'RESPONSE',
      targetType: 'node',
      targetId: 'N-WAY-SH1',
      severity: 'NORMAL'
    }
  ];
}

export function computeComprehensiveEvacuationPlan(
  zones: RiskZone[],
  nodes: InfrastructureNode[],
  edges: InfrastructureEdge[],
  riskStates: Record<string, RiskState>,
  networkImpact: ReturnType<typeof calculateNetworkImpact>
): EvacuationPlan {
  const settlements = nodes.filter(n => n.type === 'settlement');
  const shelters = nodes.filter(n => n.type === 'shelter');
  const hospitals = nodes.filter(n => n.type === 'hospital');
  const totalShelterCap = shelters.reduce((sum, sh) => sum + (sh.capacity || 0), 0);

  let totalExposed = 0;
  let requiringEvac = 0;

  zones.forEach(z => {
    const risk = riskStates[z.id]?.currentRisk ?? 0;
    if (risk > 50) {
      totalExposed += (z.population || 0);
    }
    if (risk >= 75) {
      requiringEvac += Math.round((z.population || 0) * 0.85);
    } else if (risk >= 60) {
      requiringEvac += Math.round((z.population || 0) * 0.45);
    }
  });

  const routeResults = settlements.map(settlement => {
    const impactRes = networkImpact?.results?.find(r => r.settlementId === settlement.id);
    const isIsolated = !!impactRes?.isolated;

    let primaryRoute: EvacuationRoute | null = null;
    let backupRoute: EvacuationRoute | null = null;

    if (!isIsolated && impactRes) {
      const primaryTarget = nodes.find(n => n.id === impactRes.targetFacilityId);
      if (primaryTarget) {
        primaryRoute = {
          sourceSettlementId: settlement.id,
          sourceName: settlement.name,
          targetFacilityId: primaryTarget.id,
          targetName: primaryTarget.name,
          targetType: (primaryTarget.type === 'hospital' ? 'hospital' : 'shelter'),
          pathNodeIds: impactRes.pathNodeIds,
          pathEdgeIds: impactRes.pathEdgeIds,
          distanceKm: impactRes.distanceKm,
          estimatedTimeMin: impactRes.travelTimeMinutes,
          isBlocked: false,
          riskFactor: 20
        };
      }

      const altShelter = shelters.find(sh => sh.id !== impactRes.targetFacilityId) || hospitals.find(h => h.id !== impactRes.targetFacilityId);
      if (altShelter) {
        backupRoute = {
          sourceSettlementId: settlement.id,
          sourceName: settlement.name,
          targetFacilityId: altShelter.id,
          targetName: `${altShelter.name} (Secondary Contingency)`,
          targetType: altShelter.type as any,
          pathNodeIds: [settlement.id, altShelter.id],
          pathEdgeIds: [],
          distanceKm: Number(((impactRes.distanceKm || 5) * 1.4).toFixed(1)),
          estimatedTimeMin: Math.round((impactRes.travelTimeMinutes || 15) * 1.4),
          isBlocked: false,
          riskFactor: 35
        };
      }
    }

    return {
      settlementId: settlement.id,
      settlementName: settlement.name,
      population: settlement.population || 0,
      isolated: isIsolated,
      primaryRoute,
      backupRoute
    };
  });

  const sheltersRequired = Math.max(1, Math.ceil(requiringEvac / 1500));

  const activeShelters = shelters.map(sh => ({
    id: sh.id,
    name: sh.name,
    capacity: sh.capacity || 1000,
    assignedPopulation: Math.min(sh.capacity || 1000, Math.round(requiringEvac / (shelters.length || 1))),
    coordinates: sh.coordinates
  }));

  const actionProtocol = [
    {
      step: 1,
      phase: 'IMMEDIATE (0-2h)',
      title: 'Sound Multi-Channel Early Warning Sirens',
      description: 'Activate local broadcast sirens, wireless emergency alerts (CAP), and mobile notification for red-tier critical sectors.',
      priority: 'IMMEDIATE' as const
    },
    {
      step: 2,
      phase: 'DEPLOYMENT (1-4h)',
      title: 'Secure Primary Evacuation Corridors',
      description: 'Deploy NDRF and State Disaster Response Force (SDRF) heavy earthmoving machinery to clear key arterial highway routes.',
      priority: 'IMMEDIATE' as const
    },
    {
      step: 3,
      phase: 'TRIAGE (2-6h)',
      title: 'Mobilize Designated Relief Shelters & Triage Kits',
      description: 'Open designated high-capacity relief shelters, stage trauma kits, auxiliary power generators, and potable water bowsers.',
      priority: 'HIGH' as const
    },
    {
      step: 4,
      phase: 'AIRLIFT & ISOLATION RESPONSE',
      title: 'Helicopter Aerial Relief for Cut-off Pockets',
      description: 'Stage IAF / Coast Guard emergency aerial airdrops and hoist rescue for settlements isolated by bridge washouts.',
      priority: 'HIGH' as const
    }
  ];

  return {
    totalPopulationExposed: totalExposed,
    populationRequiringEvacuation: requiringEvac,
    sheltersRequired,
    availableShelterCapacity: totalShelterCap,
    activeShelters,
    routes: routeResults,
    isolatedCommunitiesCount: networkImpact?.isolatedCommunities || 0,
    isolatedPopulation: networkImpact?.isolatedPopulation || 0,
    threatenedInfrastructureCount: networkImpact?.failedEdgesCount || 0,
    actionProtocol
  };
}
