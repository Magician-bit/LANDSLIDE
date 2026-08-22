import { useState, useMemo } from 'react';
import { mockZones, mockNodes, mockEdges, mockFieldReports, initialDynamicTrigger } from '../data/mockData';
import { calculateDynamicRisk, calculateNetworkImpact } from '../intelligence/engine';
import { Scenario, Alert } from '../types';

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

  // Computed Risk States
  const riskStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof calculateDynamicRisk>> = {};
    (mockZones || []).forEach(zone => {
      if (zone?.id) {
        states[zone.id] = calculateDynamicRisk(zone, initialDynamicTrigger, scenario, mockFieldReports);
      }
    });
    return states;
  }, [scenario]);

  // Computed Network Impact
  const networkImpact = useMemo(() => {
    return calculateNetworkImpact(mockNodes, mockEdges, scenario);
  }, [scenario]);

  // Priority Alerts
  const alerts = useMemo(() => {
    const a: Alert[] = [];
    if (networkImpact?.isolatedCommunities > 0) {
      a.push({
        id: 'A-ISOLATION',
        type: 'ISOLATION_WARNING',
        zoneId: null,
        title: 'Community Isolation Detected',
        description: `${networkImpact.isolatedPopulation.toLocaleString()} citizens potentially isolated across ${networkImpact.isolatedCommunities} mountain settlements.`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString()
      });
    }

    (mockZones || []).forEach(z => {
      const rs = riskStates[z.id];
      if (rs && rs.currentRisk > 75) {
        a.push({
          id: `A-RISK-${z.id}`,
          type: 'RISK_ESCALATION',
          zoneId: z.id,
          title: `Risk Alert: ${z.name}`,
          description: `${z.name} landslide risk reached critical threshold (${rs.currentRisk}/100) driven by ${rs.primaryDriver}.`,
          severity: rs.currentRisk > 85 ? 'CRITICAL' : 'HIGH',
          timestamp: new Date().toISOString()
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
