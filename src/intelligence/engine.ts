import { RiskZone, DynamicTrigger, RiskState, Scenario, InfrastructureNode, InfrastructureEdge, FieldReport } from '../types';

export function calculateDynamicRisk(
  zone?: Partial<RiskZone> | null,
  trigger?: Partial<DynamicTrigger> | null,
  scenario?: Partial<Scenario> | null,
  reports?: FieldReport[] | null
): RiskState {
  const safeZone = zone || {};
  const safeTrigger: DynamicTrigger = {
    rainfall1h: trigger?.rainfall1h ?? 0,
    rainfall24h: trigger?.rainfall24h ?? 0,
    rainfallAnomaly: trigger?.rainfallAnomaly ?? 1,
    soilMoisture: trigger?.soilMoisture ?? 0,
    soilMoistureTrend: trigger?.soilMoistureTrend ?? 0,
    antecedentPrecipitation: trigger?.antecedentPrecipitation ?? 0,
  };
  const safeScenario: Scenario = {
    active: !!scenario?.active,
    type: scenario?.type || 'Baseline',
    rainfallMultiplier: scenario?.rainfallMultiplier ?? 1,
    duration: scenario?.duration ?? 24,
    soilMoistureMultiplier: scenario?.soilMoistureMultiplier ?? 1,
    selectedZoneId: scenario?.selectedZoneId ?? null,
    failedInfrastructureIds: scenario?.failedInfrastructureIds ?? [],
  };
  const safeReports = Array.isArray(reports) ? reports : [];

  // Base trigger score
  let rainfallFactor = (safeTrigger.rainfall24h / 50) * 100; // Normalizing 50mm to 100 score
  
  if (safeScenario.active) {
    if (safeScenario.type === 'Heavy Rainfall') {
      rainfallFactor *= safeScenario.rainfallMultiplier;
    }
  }

  let soilFactor = safeTrigger.soilMoisture;
  if (safeScenario.active && safeScenario.type === 'Soil Saturation') {
    soilFactor *= safeScenario.soilMoistureMultiplier;
  }

  // Cap factors
  rainfallFactor = Math.max(0, Math.min(100, isNaN(rainfallFactor) ? 0 : rainfallFactor));
  soilFactor = Math.max(0, Math.min(100, isNaN(soilFactor) ? 0 : soilFactor));

  const triggerScore = (rainfallFactor * 0.6) + (soilFactor * 0.4);
  const staticSusc = safeZone.staticSusceptibility ?? 50;
  const currentRisk = Math.max(0, Math.min(100, (staticSusc * 0.4) + (triggerScore * 0.6)));

  // Momentum
  let momentum = 0;
  if (safeScenario.active) {
    if (safeScenario.type === 'Heavy Rainfall') momentum = Math.round(rainfallFactor * 0.2);
    if (safeScenario.type === 'Soil Saturation') momentum = Math.round(soilFactor * 0.1);
  }

  // Forecast
  const forecast = {
    t6: Math.min(100, Math.max(0, currentRisk + (momentum * 0.5))),
    t12: Math.min(100, Math.max(0, currentRisk + (momentum * 0.8))),
    t24: Math.min(100, Math.max(0, currentRisk + momentum))
  };

  // Hazard Window
  let hazardWindow: [string, string] = ['--', '--'];
  if (currentRisk > 75) {
    const now = new Date();
    const start = new Date(now.getTime() + 2 * 3600000);
    const end = new Date(now.getTime() + 8 * 3600000);
    hazardWindow = [
      start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ];
  }

  // Confidence & Ground Evidence
  let confidence = 85;
  const zoneId = safeZone.id || '';
  const zoneReports = safeReports.filter(r => r && r.zoneId === zoneId);
  if (zoneReports.length > 0) {
    const verified = zoneReports.filter(r => r.verificationStatus === 'Verified').length;
    confidence = Math.min(99, 85 + (verified * 5) + (zoneReports.length * 2));
  }

  const env = safeZone.environmentalFeatures || {
    elevation: 1000,
    slope: 30,
    aspect: 'South',
    terrainRuggedness: 5,
    landCover: 'Vegetation',
    ndviChange: 0,
    drainage: 'Moderate'
  };

  // Feature contributions
  const featureContributions = [
    { feature: 'Rainfall 24h', value: Number((rainfallFactor * 0.6 * 0.6).toFixed(1)) },
    { feature: 'Soil Moisture', value: Number((soilFactor * 0.4 * 0.6).toFixed(1)) },
    { feature: 'Static Slope', value: Number(((env.slope / 60) * 100 * 0.2 * 0.4).toFixed(1)) },
    { feature: 'Ruggedness', value: Number(((env.terrainRuggedness / 10) * 100 * 0.1 * 0.4).toFixed(1)) },
    { feature: 'NDVI Change', value: Number((Math.abs(env.ndviChange || 0) * 100 * 0.1 * 0.4).toFixed(1)) }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const primaryDriver = featureContributions[0]?.feature || 'Environmental Slope';

  return {
    currentRisk: Math.round(currentRisk),
    triggerScore: Math.round(triggerScore),
    momentum,
    hazardWindow,
    forecast: {
      t6: Math.round(forecast.t6),
      t12: Math.round(forecast.t12),
      t24: Math.round(forecast.t24)
    },
    confidence,
    primaryDriver,
    featureContributions
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

  // Apply scenario failures
  const activeEdges = safeEdges.map(e => {
    let status = e.status || 'active';
    if (safeScenario.active) {
      if (safeScenario.type === 'Road Blockage' && safeScenario.failedInfrastructureIds.includes(e.id)) {
        status = 'blocked';
      }
      if (safeScenario.type === 'Bridge Failure' && (safeScenario.failedInfrastructureIds.includes(e.source) || safeScenario.failedInfrastructureIds.includes(e.target))) {
        status = 'failed';
      }
      if (safeScenario.type === 'Multiple Failures' && safeScenario.failedInfrastructureIds.includes(e.id)) {
        status = 'failed';
      }
    }
    return { ...e, status };
  }).filter(e => e.status === 'active');

  // Adjacency list
  const adj = new Map<string, { target: string; weight: number }[]>();
  safeNodes.forEach(n => adj.set(n.id, []));
  
  activeEdges.forEach(e => {
    if (!e.source || !e.target) return;
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)?.push({ target: e.target, weight: e.distance || 1 });
    adj.get(e.target)?.push({ target: e.source, weight: e.distance || 1 });
  });

  const hospitals = safeNodes.filter(n => n.type === 'hospital');
  const settlements = safeNodes.filter(n => n.type === 'settlement');
  
  const results = settlements.map(settlement => {
    let minDistance = Infinity;
    
    // Dijkstra across all accessible hospitals
    hospitals.forEach(h => {
      const dist = new Map<string, number>();
      safeNodes.forEach(n => dist.set(n.id, Infinity));
      dist.set(settlement.id, 0);
      
      const unvisited = new Set(safeNodes.map(n => n.id));
      
      while (unvisited.size > 0) {
        let u: string | null = null;
        let minDist = Infinity;
        
        unvisited.forEach(node => {
          const d = dist.get(node) ?? Infinity;
          if (d < minDist) {
            minDist = d;
            u = node;
          }
        });
        
        if (!u || minDist === Infinity) break;
        if (u === h.id) {
          minDistance = Math.min(minDistance, dist.get(u) ?? Infinity);
          break;
        }
        
        unvisited.delete(u);
        
        const neighbors = adj.get(u) || [];
        const currentDist = dist.get(u) ?? Infinity;
        
        neighbors.forEach(neighbor => {
          if (unvisited.has(neighbor.target)) {
            const alt = currentDist + (neighbor.weight || 0);
            const neighborDist = dist.get(neighbor.target) ?? Infinity;
            if (alt < neighborDist) {
              dist.set(neighbor.target, alt);
            }
          }
        });
      }
    });
    
    return {
      settlementId: settlement.id,
      isolated: minDistance === Infinity || hospitals.length === 0,
      hospitalTravelTime: minDistance === Infinity ? -1 : minDistance
    };
  });

  const isolatedSettlements = results.filter(r => r.isolated);
  const isolatedPopulation = isolatedSettlements.reduce((sum, r) => {
    const s = settlements.find(set => set.id === r.settlementId);
    return sum + (s?.population || 0);
  }, 0);

  let maxTravelTime = 0;
  results.forEach(r => {
    if (!r.isolated && r.hospitalTravelTime > maxTravelTime) {
      maxTravelTime = r.hospitalTravelTime;
    }
  });

  const isolationScore = Math.min(100, Math.round((isolatedPopulation / 1000) * 20 + (maxTravelTime > 60 ? 30 : 0)));

  return {
    results,
    isolatedCommunities: isolatedSettlements.length,
    isolatedPopulation,
    maxTravelTime: maxTravelTime === Infinity ? -1 : maxTravelTime,
    isolationScore
  };
}
