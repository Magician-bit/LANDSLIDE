import { useState, useMemo } from 'react';
import { mockZones, mockNodes, mockEdges, mockFieldReports, initialDynamicTrigger } from '../data/mockData';
import { calculateDynamicRisk, calculateNetworkImpact } from '../intelligence/engine';
import { Scenario } from '../types';

export function useIntelligence() {
  const [scenario, setScenario] = useState<Scenario>({
    active: false,
    type: 'Baseline',
    rainfallMultiplier: 1,
    duration: 24,
    soilMoistureMultiplier: 1,
    selectedZoneId: null,
    failedInfrastructureIds: []
  });

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Computed Risk
  const riskStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof calculateDynamicRisk>> = {};
    mockZones.forEach(zone => {
      states[zone.id] = calculateDynamicRisk(zone, initialDynamicTrigger, scenario, mockFieldReports);
    });
    return states;
  }, [scenario]);

  // Computed Network
  const networkImpact = useMemo(() => {
    return calculateNetworkImpact(mockNodes, mockEdges, scenario);
  }, [scenario]);

  // Alerts
  const alerts = useMemo(() => {
    const a = [];
    if (networkImpact.isolatedCommunities > 0) {
      a.push({
        id: 'A1', type: 'ISOLATION_WARNING', zoneId: null,
        title: 'Isolation Warning',
        description: `${networkImpact.isolatedPopulation} people potentially isolated in ${networkImpact.isolatedCommunities} communities.`,
        severity: 'CRITICAL', timestamp: new Date().toISOString()
      });
    }
    mockZones.forEach(z => {
      const rs = riskStates[z.id];
      if (rs.currentRisk > 80) {
        a.push({
          id: `A-${z.id}`, type: 'RISK_ESCALATION', zoneId: z.id,
          title: 'Risk Escalation',
          description: `${z.name} risk is critically high (${rs.currentRisk}/100)`,
          severity: 'HIGH', timestamp: new Date().toISOString()
        });
      }
    });
    return a;
  }, [networkImpact, riskStates]);

  const resetScenario = () => {
    setScenario({
      active: false,
      type: 'Baseline',
      rainfallMultiplier: 1,
      duration: 24,
      soilMoistureMultiplier: 1,
      selectedZoneId: null,
      failedInfrastructureIds: []
    });
  };

  return {
    zones: mockZones,
    nodes: mockNodes,
    edges: mockEdges,
    reports: mockFieldReports,
    scenario,
    setScenario,
    resetScenario,
    selectedZoneId,
    setSelectedZoneId,
    riskStates,
    networkImpact,
    alerts
  };
}
