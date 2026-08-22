import { RiskZone, DynamicTrigger, RiskState, Scenario, InfrastructureNode, InfrastructureEdge, FieldReport, Alert } from '../types';

export function calculateDynamicRisk(zone: RiskZone, trigger: DynamicTrigger, scenario: Scenario, reports: FieldReport[]): RiskState {
  // Base trigger score
  let rainfallFactor = (trigger.rainfall24h / 50) * 100; // Normalizing 50mm to 100 score
  
  if (scenario.active) {
    if (scenario.type === 'Heavy Rainfall') {
      rainfallFactor *= scenario.rainfallMultiplier;
    }
  }

  let soilFactor = trigger.soilMoisture;
  if (scenario.active && scenario.type === 'Soil Saturation') {
    soilFactor *= scenario.soilMoistureMultiplier;
  }

  // Cap factors
  rainfallFactor = Math.min(100, rainfallFactor);
  soilFactor = Math.min(100, soilFactor);

  const triggerScore = (rainfallFactor * 0.6) + (soilFactor * 0.4);
  const currentRisk = (zone.staticSusceptibility * 0.4) + (triggerScore * 0.6);

  // Momentum
  let momentum = 0;
  if (scenario.active) {
    if (scenario.type === 'Heavy Rainfall') momentum = Math.round(rainfallFactor * 0.2);
    if (scenario.type === 'Soil Saturation') momentum = Math.round(soilFactor * 0.1);
  }

  // Forecast
  const forecast = {
    t6: Math.min(100, currentRisk + (momentum * 0.5)),
    t12: Math.min(100, currentRisk + (momentum * 0.8)),
    t24: Math.min(100, currentRisk + momentum)
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
  const zoneReports = reports.filter(r => r.zoneId === zone.id);
  if (zoneReports.length > 0) {
    const verified = zoneReports.filter(r => r.verificationStatus === 'Verified').length;
    confidence = Math.min(99, 85 + (verified * 5) + (zoneReports.length * 2));
  }

  // Feature contributions
  const featureContributions = [
    { feature: 'Rainfall 24h', value: rainfallFactor * 0.6 * 0.6 },
    { feature: 'Soil Moisture', value: soilFactor * 0.4 * 0.6 },
    { feature: 'Static Slope', value: (zone.environmentalFeatures.slope / 60) * 100 * 0.2 * 0.4 },
    { feature: 'Ruggedness', value: (zone.environmentalFeatures.terrainRuggedness / 10) * 100 * 0.1 * 0.4 },
    { feature: 'NDVI', value: Math.abs(zone.environmentalFeatures.ndviChange) * 100 * 0.1 * 0.4 }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const primaryDriver = featureContributions[0].feature;

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
  nodes: InfrastructureNode[],
  edges: InfrastructureEdge[],
  scenario: Scenario
) {
  // Basic Dijkstra prototype for finding shortest path to hospitals
  
  // Apply scenario failures
  const activeEdges = edges.map(e => {
    let status = e.status;
    if (scenario.active) {
      if (scenario.type === 'Road Blockage' && scenario.failedInfrastructureIds.includes(e.id)) {
        status = 'blocked';
      }
      if (scenario.type === 'Bridge Failure' && scenario.failedInfrastructureIds.includes(e.source || e.target)) {
        status = 'failed';
      }
      if (scenario.type === 'Multiple Failures' && scenario.failedInfrastructureIds.includes(e.id)) {
        status = 'failed';
      }
    }
    return { ...e, status };
  }).filter(e => e.status === 'active');

  // Adjacency list
  const adj = new Map<string, { target: string, weight: number }[]>();
  nodes.forEach(n => adj.set(n.id, []));
  activeEdges.forEach(e => {
    adj.get(e.source)?.push({ target: e.target, weight: e.distance });
    adj.get(e.target)?.push({ target: e.source, weight: e.distance }); // assuming undirected for simplicity
  });

  const hospitals = nodes.filter(n => n.type === 'hospital');
  const settlements = nodes.filter(n => n.type === 'settlement');
  
  const results = settlements.map(settlement => {
    // Find shortest path to any hospital
    let minDistance = Infinity;
    
    // Dijkstra
    hospitals.forEach(h => {
      const dist = new Map<string, number>();
      nodes.forEach(n => dist.set(n.id, Infinity));
      dist.set(settlement.id, 0);
      
      const unvisited = new Set(nodes.map(n => n.id));
      
      while (unvisited.size > 0) {
        let u: string | null = null;
        let minDist = Infinity;
        unvisited.forEach(node => {
          if (dist.get(node)! < minDist) {
            minDist = dist.get(node)!;
            u = node;
          }
        });
        
        if (!u) break;
        if (u === h.id) {
          minDistance = Math.min(minDistance, dist.get(u as string)!);
          break;
        }
        
        unvisited.delete(u);
        
        const neighbors = adj.get(u) || [];
        neighbors.forEach(neighbor => {
          if (unvisited.has(neighbor.target)) {
            const alt = dist.get(u as string)! + neighbor.weight;
            if (alt < dist.get(neighbor.target)!) {
              dist.set(neighbor.target, alt);
            }
          }
        });
      }
    });
    
    return {
      settlementId: settlement.id,
      isolated: minDistance === Infinity,
      hospitalTravelTime: minDistance
    };
  });

  const isolatedSettlements = results.filter(r => r.isolated);
  const isolatedPopulation = isolatedSettlements.reduce((sum, r) => {
    const s = settlements.find(set => set.id === r.settlementId);
    return sum + (s?.population || 0);
  }, 0);

  let maxTravelTime = 0;
  results.forEach(r => {
    if (!r.isolated && r.hospitalTravelTime > maxTravelTime) maxTravelTime = r.hospitalTravelTime;
  });

  const isolationScore = Math.min(100, (isolatedPopulation / 1000) * 20 + (maxTravelTime > 60 ? 30 : 0));

  return {
    results,
    isolatedCommunities: isolatedSettlements.length,
    isolatedPopulation,
    maxTravelTime: maxTravelTime === Infinity ? -1 : maxTravelTime,
    isolationScore: Math.round(isolationScore)
  };
}
