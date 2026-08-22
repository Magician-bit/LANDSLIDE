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
  EvacuationRoute
} from '../types';

function getNum(val: number | undefined | null, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

export function calculateDynamicRisk(
  zone?: Partial<RiskZone> | null,
  trigger?: Partial<DynamicTrigger> | null,
  scenario?: Partial<Scenario> | null,
  reports?: FieldReport[] | null,
  timelineStep: TimelineStep = 'NOW'
): RiskState {
  const safeZone = zone || {};
  
  // Safe clamped values to prevent NaN or undefined
  const rainfall24h = Math.max(0, Math.min(250, getNum(trigger?.rainfall24h, 36.5)));
  const rainfallAnomaly = Math.max(0.5, Math.min(5, getNum(trigger?.rainfallAnomaly, Math.max(0.8, Number((rainfall24h / 25).toFixed(2))))));
  const antecedentPrecipitation = Math.max(0, Math.min(250, getNum(trigger?.antecedentPrecipitation, Math.max(30, rainfall24h * 1.6))));
  const soilMoisture = Math.max(0, Math.min(100, getNum(trigger?.soilMoisture, 62.0)));
  const soilMoistureTrend = getNum(trigger?.soilMoistureTrend, 1.2);
  const slopeInstabilityFactor = Math.max(0, Math.min(100, getNum(trigger?.slopeInstabilityFactor, 55)));

  const safeTrigger: DynamicTrigger = {
    rainfall1h: getNum(trigger?.rainfall1h, 4.2),
    rainfall24h,
    rainfallAnomaly,
    soilMoisture,
    soilMoistureTrend,
    antecedentPrecipitation,
    slopeInstabilityFactor,
    groundVibration: getNum(trigger?.groundVibration, 1.1),
    temperatureAnomaly: getNum(trigger?.temperatureAnomaly, 1.8)
  };

  const safeScenario: Scenario = {
    active: !!scenario?.active,
    type: scenario?.type || 'Baseline',
    rainfallMultiplier: getNum(scenario?.rainfallMultiplier, 1),
    duration: getNum(scenario?.duration, 24),
    soilMoistureMultiplier: getNum(scenario?.soilMoistureMultiplier, 1),
    slopeInstabilityMultiplier: getNum(scenario?.slopeInstabilityMultiplier, 1),
    selectedZoneId: scenario?.selectedZoneId ?? null,
    failedInfrastructureIds: Array.isArray(scenario?.failedInfrastructureIds) ? scenario.failedInfrastructureIds : [],
  };

  const safeReports = Array.isArray(reports) ? reports : [];

  const env = safeZone.environmentalFeatures || {
    elevation: 1500,
    slope: 35,
    aspect: 'South',
    terrainRuggedness: 7.5,
    landCover: 'Forest Slopes',
    ndviChange: -0.1,
    drainage: 'High Convergence'
  };

  // Base factor calculations
  // Rainfall factor based on 24h mm, anomaly, and antecedent precipitation
  let rainfallFactor = ((safeTrigger.rainfall24h / 50) * 60) + ((safeTrigger.rainfallAnomaly - 1) * 30) + ((safeTrigger.antecedentPrecipitation / 100) * 20);
  
  // Soil saturation factor
  let soilFactor = (safeTrigger.soilMoisture * 0.8) + (safeTrigger.soilMoistureTrend * 10);
  
  // Slope shear & instability factor
  const slopeRatio = (env.slope / 45) * 100;
  let slopeFactor = (slopeRatio * 0.5) + ((safeTrigger.slopeInstabilityFactor || 50) * 0.5);

  // Apply scenario multipliers if active
  if (safeScenario.active) {
    if (safeScenario.type === 'Heavy Rainfall') {
      rainfallFactor *= (safeScenario.rainfallMultiplier || 1.6);
      soilFactor *= 1.25;
    } else if (safeScenario.type === 'Extreme Rainfall') {
      rainfallFactor *= (safeScenario.rainfallMultiplier || 2.2);
      soilFactor *= 1.5;
      slopeFactor *= 1.2;
    } else if (safeScenario.type === 'Soil Saturation') {
      soilFactor *= (safeScenario.soilMoistureMultiplier || 1.6);
      slopeFactor *= 1.15;
    } else if (safeScenario.type === 'Slope Failure') {
      slopeFactor *= (safeScenario.slopeInstabilityMultiplier || 1.6);
    } else if (safeScenario.type === 'Multi-Zone Landslide' || safeScenario.type === 'Extreme Weather Cascade') {
      rainfallFactor *= 2.0;
      soilFactor *= 1.5;
      slopeFactor *= 1.4;
    }
  }

  // Bound components to [0, 100]
  rainfallFactor = Math.max(0, Math.min(100, isNaN(rainfallFactor) ? 0 : rainfallFactor));
  soilFactor = Math.max(0, Math.min(100, isNaN(soilFactor) ? 0 : soilFactor));
  slopeFactor = Math.max(0, Math.min(100, isNaN(slopeFactor) ? 0 : slopeFactor));

  // Dynamic Trigger composite score (45% Rainfall, 35% Soil, 20% Slope dynamic)
  const triggerScore = (rainfallFactor * 0.45) + (soilFactor * 0.35) + (slopeFactor * 0.20);
  const staticSusc = safeZone.staticSusceptibility ?? 65;

  // Base raw risk
  let calculatedRisk = (staticSusc * 0.35) + (triggerScore * 0.65);

  // Calculate rate of escalation (momentum)
  let momentum = Math.round(((rainfallFactor - 50) * 0.15) + ((soilFactor - 50) * 0.12) + ((slopeFactor - 50) * 0.1));
  if (safeScenario.active) {
    momentum += safeScenario.type === 'Extreme Rainfall' || safeScenario.type === 'Extreme Weather Cascade' ? 14 : 7;
  }

  // Forecast points
  const forecast = {
    t6: Math.max(0, Math.min(100, calculatedRisk + (momentum * 0.45))),
    t12: Math.max(0, Math.min(100, calculatedRisk + (momentum * 0.8))),
    t24: Math.max(0, Math.min(100, calculatedRisk + momentum)),
    t48: Math.max(0, Math.min(100, calculatedRisk + (momentum * 1.25)))
  };

  // Adjust currentRisk based on timeline step
  let currentRisk = calculatedRisk;
  if (timelineStep === 'PAST_24H') {
    currentRisk = Math.max(15, calculatedRisk - 22);
  } else if (timelineStep === 'PAST_6H') {
    currentRisk = Math.max(20, calculatedRisk - 10);
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

  // Probabilistic hazard critical window
  let hazardWindow: [string, string] = ['--', '--'];
  if (currentRisk > 60) {
    const now = new Date();
    const startHourOffset = currentRisk > 80 ? 1 : 4;
    const endHourOffset = currentRisk > 80 ? 8 : 14;
    const start = new Date(now.getTime() + startHourOffset * 3600000);
    const end = new Date(now.getTime() + endHourOffset * 3600000);
    hazardWindow = [
      start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ];
  }

  // Model Consistency / Confidence calculation
  // Evaluated deterministically from indicator consensus
  const zoneId = safeZone.id || '';
  const zoneReports = safeReports.filter(r => r && r.zoneId === zoneId);
  const verifiedCount = zoneReports.filter(r => r.verificationStatus === 'Verified').length;

  let supportingIndicators = 0;
  const totalIndicators = 6;
  if (rainfallFactor > 50) supportingIndicators++;
  if (soilFactor > 50) supportingIndicators++;
  if (env.slope > 30) supportingIndicators++;
  if (env.terrainRuggedness > 7) supportingIndicators++;
  if (staticSusc > 60) supportingIndicators++;
  if (verifiedCount > 0 || (safeTrigger.antecedentPrecipitation > 50)) supportingIndicators++;

  const consistencyRate = Math.round((supportingIndicators / totalIndicators) * 100);
  const confidence = Math.max(72, Math.min(96, 75 + Math.round((supportingIndicators / totalIndicators) * 18) + (verifiedCount * 2)));

  // Feature Contributions (Deterministic attribution breakdown)
  const rawAttributions = [
    { feature: 'Rainfall Anomaly & Rate', raw: rainfallFactor * 0.32 },
    { feature: 'Terrain Slope Gradient', raw: (env.slope / 45) * 100 * 0.26 },
    { feature: 'Soil Saturation Index', raw: soilFactor * 0.22 },
    { feature: 'Historical Susceptibility', raw: staticSusc * 0.12 },
    { feature: 'Terrain Ruggedness & NDVI', raw: ((env.terrainRuggedness / 10) * 70 + Math.abs(env.ndviChange || 0) * 30) * 0.08 }
  ];

  const totalRaw = rawAttributions.reduce((acc, item) => acc + item.raw, 0) || 1;
  const featureContributions = rawAttributions.map(item => ({
    feature: item.feature,
    value: Number(item.raw.toFixed(1)),
    percentage: Math.round((item.raw / totalRaw) * 100)
  })).sort((a, b) => b.percentage - a.percentage);

  const primaryDriver = featureContributions[0]?.feature || 'Rainfall & Slope Shear';

  // Human readable explanation
  const precipPct = Math.round((safeTrigger.rainfall24h / 30) * 100);
  const soilPct = Math.round(safeTrigger.soilMoisture);
  const slopeDeg = env.slope || 35;
  
  let riskLevelStr = 'moderate';
  let status: RiskState['status'] = 'LOW';
  if (currentRisk >= 75) {
    riskLevelStr = 'critical';
    status = 'CRITICAL';
  } else if (currentRisk >= 60) {
    riskLevelStr = 'high';
    status = 'HIGH';
  } else if (currentRisk >= 40) {
    riskLevelStr = 'moderate';
    status = 'MODERATE';
  }

  let explanation = `Risk is ${riskLevelStr} (${currentRisk}/100) because `;
  if (precipPct > 120 && soilPct > 60) {
    explanation += `accumulated precipitation (+${precipPct - 100}% anomaly) has saturated the upper soil layer (${soilPct}% moisture) on an inherently steep ${slopeDeg}° slope gradient.`;
  } else if (slopeDeg >= 38) {
    explanation += `the steep topographical gradient (${slopeDeg}°) and high terrain ruggedness amplify slope shear stress under elevated moisture conditions (${soilPct}%).`;
  } else {
    explanation += `environmental triggers and static geological susceptibility indicate baseline stability with continuous moisture monitoring active.`;
  }

  return {
    currentRisk,
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
    primaryDriver,
    featureContributions,
    explanation,
    status
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
  safeEdges.forEach(e => {
    let s: 'active' | 'threatened' | 'blocked' | 'failed' = e.status || 'active';
    if (safeScenario.active) {
      const isExplicitlyFailed = 
        safeScenario.failedInfrastructureIds.includes(e.id) ||
        safeScenario.failedInfrastructureIds.includes(e.source) ||
        safeScenario.failedInfrastructureIds.includes(e.target);

      if (isExplicitlyFailed) {
        s = 'failed';
      } else if (
        (safeScenario.type === 'Road Blockage' && e.id === 'R-01') ||
        (safeScenario.type === 'Bridge Failure' && (
          e.source === 'B-17' || e.target === 'B-17' ||
          e.source === 'B-22' || e.target === 'B-22' ||
          e.source === 'B-09' || e.target === 'B-09' ||
          e.id === 'R-01' || e.id === 'R-09' || e.id === 'R-17'
        ))
      ) {
        s = 'failed';
      } else if (safeScenario.type === 'Extreme Weather Cascade' && (e.id === 'R-01' || e.id === 'R-09' || e.id === 'R-17')) {
        s = 'failed';
      }
    }
    edgeStatusMap.set(e.id, s);
  });

  const activeEdges = safeEdges.filter(e => edgeStatusMap.get(e.id) === 'active');

  // Adjacency lists for Dijkstra
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

  // Compute shortest route for each settlement using standard Dijkstra
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
            
            // Reconstruct path
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
  const topZone = zones.reduce((prev, curr) => {
    const prevRisk = riskStates[prev.id]?.currentRisk ?? 0;
    const currRisk = riskStates[curr.id]?.currentRisk ?? 0;
    return currRisk > prevRisk ? curr : prev;
  }, zones[0] || { id: 'Z-042', name: 'Tista Valley Sector A', coordinates: [27.0500, 88.2667] });

  const topRiskState = riskStates[topZone.id] || { currentRisk: 78, primaryDriver: 'Rainfall Surge' };
  const isolatedCount = networkImpact?.isolatedCommunities || 0;
  const isolatedPop = networkImpact?.isolatedPopulation || 0;

  const isRainEvent = scenario.active && (scenario.type === 'Heavy Rainfall' || scenario.type === 'Extreme Rainfall' || scenario.type === 'Extreme Weather Cascade');
  const isExtreme = scenario.active && (scenario.type === 'Extreme Rainfall' || scenario.type === 'Extreme Weather Cascade');

  return [
    {
      id: 'CASC-1',
      title: isExtreme ? 'Extreme Precipitation Surge' : 'Monsoon Precipitation Anomaly',
      subtitle: isRainEvent ? `Rainfall rate +${Math.round((scenario.rainfallMultiplier - 1) * 100)}% over 24h window` : 'Baseline rainfall 36.5 mm/24h',
      category: 'TRIGGER',
      targetType: 'general',
      severity: isExtreme ? 'CRITICAL' : isRainEvent ? 'ELEVATED' : 'NORMAL'
    },
    {
      id: 'CASC-2',
      title: 'Pore-Water Saturation Rising',
      subtitle: `Subsurface soil moisture at ${isRainEvent ? '88%' : '62%'} capacity`,
      category: 'SOIL',
      targetType: 'zone',
      targetId: topZone.id,
      severity: isRainEvent ? 'CRITICAL' : 'ELEVATED',
      coordinates: topZone.coordinates
    },
    {
      id: 'CASC-3',
      title: 'Slope Shear Reduction',
      subtitle: `Factor of Safety declining on ${topZone.environmentalFeatures.slope}° gradient`,
      category: 'STABILITY',
      targetType: 'zone',
      targetId: topZone.id,
      severity: topRiskState.currentRisk > 75 ? 'CRITICAL' : 'ELEVATED',
      coordinates: topZone.coordinates
    },
    {
      id: 'CASC-4',
      title: `Landslide Risk Peak (${topRiskState.currentRisk}/100)`,
      subtitle: `${topZone.name} reaches critical instability threshold`,
      category: 'HAZARD',
      targetType: 'zone',
      targetId: topZone.id,
      severity: topRiskState.currentRisk > 75 ? 'CRITICAL' : 'ELEVATED',
      coordinates: topZone.coordinates
    },
    {
      id: 'CASC-5',
      title: scenario.failedInfrastructureIds.length > 0 ? 'Arterial Road / Bridge Blockage' : 'Downslope Transit Corridor Threatened',
      subtitle: scenario.failedInfrastructureIds.length > 0 
        ? `${scenario.failedInfrastructureIds.join(', ')} compromised by debris accumulation`
        : 'Primary evacuation route R-01 in debris shadow zone',
      category: 'INFRASTRUCTURE',
      targetType: 'edge',
      targetId: scenario.failedInfrastructureIds[0] || 'R-01',
      severity: scenario.failedInfrastructureIds.length > 0 ? 'CRITICAL' : 'ELEVATED'
    },
    {
      id: 'CASC-6',
      title: isolatedCount > 0 ? `${isolatedCount} Communities Isolated` : 'Settlement Accessibility Constrained',
      subtitle: isolatedCount > 0 ? `${isolatedPop.toLocaleString()} citizens cut off from direct hospital access` : 'Travel times increased by 45%',
      category: 'COMMUNITY',
      targetType: 'node',
      targetId: networkImpact?.results.find(r => r.isolated)?.settlementId || 'S-1',
      severity: isolatedCount > 0 ? 'CRITICAL' : 'ELEVATED'
    },
    {
      id: 'CASC-7',
      title: 'Alternative Route Guidance & Shelter Dispatch',
      subtitle: 'Dynamic Dijkstra routing activated for designated mountain shelters',
      category: 'RESPONSE',
      targetType: 'node',
      targetId: 'SH-1',
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

  // Total exposed population in high/critical zones
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

  // Calculate routes for each settlement to both primary and backup destinations
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

      // Backup route (to an alternate shelter if available)
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

  const sheltersRequired = Math.max(1, Math.ceil(requiringEvac / 1200));

  const activeShelters = shelters.map(sh => ({
    id: sh.id,
    name: sh.name,
    capacity: sh.capacity || 1000,
    assignedPopulation: Math.min(sh.capacity || 1000, Math.round(requiringEvac / shelters.length)),
    coordinates: sh.coordinates
  }));

  const actionProtocol = [
    {
      step: 1,
      phase: 'IMMEDIATE (0-2h)',
      title: 'Sound Early Evacuation Sirens for Red Zones',
      description: 'Activate local broadcast sirens and mobile alert broadcasts for Tista Valley Sector A (Z-042) and Kurseong Slopes (Z-091).',
      priority: 'IMMEDIATE' as const
    },
    {
      step: 2,
      phase: 'DEPLOYMENT (1-4h)',
      title: 'Secure Primary Evacuation Corridors',
      description: 'Deploy NDRF and local road clearance teams to bypass routes R-02 and R-04 with earthmoving gear on standby.',
      priority: 'IMMEDIATE' as const
    },
    {
      step: 3,
      phase: 'TRIAGE (2-6h)',
      title: 'Mobilize Mountain Shelters & Food Logistics',
      description: 'Open Kalimpong Sports Complex and Tista Highland Relief Shelter; stage medical triage kits and auxiliary generators.',
      priority: 'HIGH' as const
    },
    {
      step: 4,
      phase: 'AIRLIFT & ISOLATION RESPONSE',
      title: 'Helicopter Aerial Relief for Cut-off Pockets',
      description: 'Stage emergency air-drop drops for settlements isolated by bridge B-17 or road R-01 collapse.',
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
