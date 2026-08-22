import { useState, useMemo, useCallback } from 'react';
import {
  mockZones,
  mockNodes,
  mockEdges,
  mockFieldReports,
  initialDynamicTrigger
} from '../data/mockData';
import {
  calculateDynamicRisk,
  calculateNetworkImpact,
  generateCascadingEffectsChain,
  computeComprehensiveEvacuationPlan
} from '../intelligence/engine';
import {
  AppMode,
  TimelineStep,
  Scenario,
  Alert,
  DynamicTrigger,
  PredictionResult,
  ActionLog,
  InfrastructureNode,
  InfrastructureEdge
} from '../types';

export function useIntelligence() {
  // Mode Management
  const [activeMode, setActiveMode] = useState<AppMode>('LIVE');
  const [timelineStep, setTimelineStep] = useState<TimelineStep>('NOW');

  // Selection states
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('Z-042');
  const [selectedInfrastructureId, setSelectedInfrastructureId] = useState<string | null>(null);
  const [selectedCascadingNodeId, setSelectedCascadingNodeId] = useState<string | null>(null);
  const [highlightedPathEdges, setHighlightedPathEdges] = useState<string[] | null>(null);

  // Baseline environmental state (immutable baseline)
  const baselineEnvironment: DynamicTrigger = useMemo(() => ({ ...initialDynamicTrigger }), []);

  // Environmental sliders state for simulation/interactive conditions
  const [environmentalConditions, setEnvironmentalConditions] = useState<DynamicTrigger>(initialDynamicTrigger);

  // Scenario simulation state
  const [scenario, setScenario] = useState<Scenario>({
    active: false,
    type: 'Baseline',
    rainfallMultiplier: 1,
    duration: 24,
    soilMoistureMultiplier: 1,
    slopeInstabilityMultiplier: 1,
    selectedZoneId: null,
    failedInfrastructureIds: []
  });

  // Action logs
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([
    {
      id: 'LOG-INIT',
      timestamp: new Date().toISOString(),
      timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action: 'System Initialized',
      details: 'Connected to Himalayan Geological Telemetry Network with 7 active risk sectors.',
      mode: 'LIVE'
    }
  ]);

  const addActionLog = useCallback((action: string, details: string, mode: AppMode = activeMode) => {
    const newLog: ActionLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      details,
      mode
    };
    setActionLogs(prev => [newLog, ...prev.slice(0, 40)]);
  }, [activeMode]);

  // Prediction diagnostic processing state
  const [predictionLoading, setPredictionLoading] = useState<boolean>(false);
  const [predictionStep, setPredictionStep] = useState<string>('');
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);

  // Computed Baseline Risk States (Always reflects true baseline environment)
  const baselineRiskStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof calculateDynamicRisk>> = {};
    (mockZones || []).forEach(zone => {
      if (zone?.id) {
        states[zone.id] = calculateDynamicRisk(
          zone,
          baselineEnvironment,
          { active: false, type: 'Baseline', rainfallMultiplier: 1, duration: 24, soilMoistureMultiplier: 1, slopeInstabilityMultiplier: 1, selectedZoneId: null, failedInfrastructureIds: [] },
          mockFieldReports,
          timelineStep
        );
      }
    });
    return states;
  }, [baselineEnvironment, timelineStep]);

  // Computed Simulation Risk States (Reflects simulated environment & active scenario)
  const simulationRiskStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof calculateDynamicRisk>> = {};
    (mockZones || []).forEach(zone => {
      if (zone?.id) {
        states[zone.id] = calculateDynamicRisk(
          zone,
          environmentalConditions,
          scenario,
          mockFieldReports,
          timelineStep
        );
      }
    });
    return states;
  }, [environmentalConditions, scenario, timelineStep]);

  // Active risk states for current view mode (in LIVE mode, show baseline; in SIMULATE, show simulation)
  const riskStates = useMemo(() => {
    if (activeMode === 'LIVE') {
      return baselineRiskStates;
    }
    return simulationRiskStates;
  }, [activeMode, baselineRiskStates, simulationRiskStates]);

  // Baseline Network Impact
  const baselineNetworkImpact = useMemo(() => {
    return calculateNetworkImpact(mockNodes, mockEdges, {
      active: false,
      type: 'Baseline',
      rainfallMultiplier: 1,
      duration: 24,
      soilMoistureMultiplier: 1,
      selectedZoneId: null,
      failedInfrastructureIds: []
    });
  }, []);

  // Computed Network Impact via Dijkstra (incorporates scenario failed infrastructure)
  const networkImpact = useMemo(() => {
    if (activeMode === 'LIVE') {
      return baselineNetworkImpact;
    }
    return calculateNetworkImpact(mockNodes, mockEdges, scenario);
  }, [activeMode, scenario, baselineNetworkImpact]);

  // Computed Cascading Effects Chain
  const cascadingEffects = useMemo(() => {
    return generateCascadingEffectsChain(scenario, mockZones, simulationRiskStates, networkImpact);
  }, [scenario, simulationRiskStates, networkImpact]);

  // Computed Evacuation Plan
  const evacuationPlan = useMemo(() => {
    return computeComprehensiveEvacuationPlan(mockZones, mockNodes, mockEdges, riskStates, networkImpact);
  }, [riskStates, networkImpact]);

  // Priority Alerts
  const alerts = useMemo(() => {
    const a: Alert[] = [];
    
    // Critical Isolation Alert
    if (networkImpact?.isolatedCommunities > 0) {
      a.push({
        id: 'A-ISOLATION-CRITICAL',
        type: 'ISOLATION_WARNING',
        zoneId: selectedZoneId || 'Z-042',
        title: `${networkImpact.isolatedCommunities} Mountain Communities Isolated`,
        description: `${networkImpact.isolatedPopulation.toLocaleString()} residents cut off from primary medical centers due to compromised corridors.`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        coordinates: [27.0550, 88.2650]
      });
    }

    // High Risk Zones Alert
    (mockZones || []).forEach(z => {
      const rs = riskStates[z.id];
      if (rs && rs.currentRisk >= 75) {
        a.push({
          id: `A-RISK-${z.id}`,
          type: 'RISK_ESCALATION',
          zoneId: z.id,
          title: `Critical Landslide Risk: ${z.name}`,
          description: `${z.name} instability reached ${rs.currentRisk}/100. Primary driver: ${rs.primaryDriver}. Evacuation protocols recommended.`,
          severity: rs.currentRisk > 85 ? 'CRITICAL' : 'HIGH',
          timestamp: new Date().toISOString(),
          coordinates: z.coordinates
        });
      }
    });

    // Infrastructure Failure Alert
    if (scenario.failedInfrastructureIds.length > 0) {
      a.push({
        id: 'A-INFRA-FAIL',
        type: 'INFRASTRUCTURE_FAILURE',
        zoneId: null,
        title: 'Infrastructure Disruption Active',
        description: `${scenario.failedInfrastructureIds.join(', ')} reported impassable. Alternate routing engaged.`,
        severity: 'HIGH',
        timestamp: new Date().toISOString()
      });
    }

    return a;
  }, [networkImpact, riskStates, scenario.failedInfrastructureIds, selectedZoneId]);

  // Update environmental variables with clamping and immediate simulation activation
  const updateEnvironmentalVariable = useCallback((key: keyof DynamicTrigger, value: number) => {
    let clampedValue = value;
    if (key === 'rainfall24h' || key === 'rainfall1h' || key === 'antecedentPrecipitation') {
      clampedValue = Math.max(0, Math.min(250, value));
    } else if (key === 'soilMoisture' || key === 'slopeInstabilityFactor') {
      clampedValue = Math.max(0, Math.min(100, value));
    }

    setEnvironmentalConditions(prev => ({
      ...prev,
      [key]: clampedValue,
      ...(key === 'rainfall24h' ? { rainfallAnomaly: Math.max(0.8, Number((clampedValue / 25).toFixed(2))) } : {})
    }));

    setScenario(prev => ({
      ...prev,
      active: true,
      type: prev.type === 'Baseline' ? 'Custom Simulation' as any : prev.type,
      selectedZoneId: selectedZoneId || prev.selectedZoneId || 'Z-042'
    }));

    addActionLog('Environmental Adjusted', `Parameter [${String(key)}] set to ${clampedValue}.`, 'SIMULATE');
  }, [selectedZoneId, addActionLog]);

  // Run 24H Forecast with step-by-step diagnostic sequence
  const run24HForecast = useCallback(async (zoneId?: string) => {
    const targetId = zoneId || selectedZoneId || 'Z-042';
    const targetZone = mockZones.find(z => z.id === targetId) || mockZones[0];
    const targetState = riskStates[targetId] || calculateDynamicRisk(targetZone, environmentalConditions, scenario, mockFieldReports);

    setPredictionLoading(true);

    const steps = [
      'COLLECTING SATELLITE & SENSOR SIGNALS...',
      'ANALYZING DIGITAL ELEVATION & SLOPE GRADIENT...',
      'EVALUATING 24H PRECIPITATION ANOMALY...',
      'MEASURING SUBSURFACE SOIL MOISTURE SATURATION...',
      'CALCULATING SLOPE SHEAR STABILITY...',
      'EVALUATING HISTORICAL GEOLOGICAL SUSCEPTIBILITY...',
      'RUNNING DETERMINISTIC RISK MODEL...',
      'SIMULATING DOWNSTREAM INFRASTRUCTURE IMPACT...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setPredictionStep(steps[i]);
      await new Promise(res => setTimeout(res, 140));
    }

    const currentRisk = targetState.currentRisk;
    const predictedRisk = targetState.forecast.t24;
    const escalation = predictedRisk - currentRisk;

    const result: PredictionResult = {
      zoneId: targetZone.id,
      zoneName: targetZone.name,
      currentRisk,
      predictedRisk,
      escalation,
      criticalWindow: targetState.hazardWindow,
      confidence: targetState.confidence,
      consistencyReason: `High Model Consistency — 5 of 6 monitored environmental & topological indicators support the predicted escalation.`,
      timelineEvolution: [
        { time: 'T-24H', risk: Math.max(10, currentRisk - 22), rainfall: 12, soilMoisture: 42, status: 'LOW' },
        { time: 'T-6H', risk: Math.max(15, currentRisk - 10), rainfall: 24, soilMoisture: 52, status: 'MODERATE' },
        { time: 'NOW', risk: currentRisk, rainfall: environmentalConditions.rainfall24h, soilMoisture: environmentalConditions.soilMoisture, status: targetState.status },
        { time: '+6H', risk: targetState.forecast.t6, rainfall: Math.round(environmentalConditions.rainfall24h * 1.25), soilMoisture: Math.min(95, environmentalConditions.soilMoisture + 8), status: targetState.forecast.t6 > 75 ? 'CRITICAL' : 'HIGH' },
        { time: '+12H', risk: targetState.forecast.t12, rainfall: Math.round(environmentalConditions.rainfall24h * 1.45), soilMoisture: Math.min(98, environmentalConditions.soilMoisture + 14), status: 'CRITICAL' },
        { time: '+24H', risk: targetState.forecast.t24, rainfall: Math.round(environmentalConditions.rainfall24h * 1.6), soilMoisture: Math.min(100, environmentalConditions.soilMoisture + 18), status: 'CRITICAL' },
        { time: '+48H', risk: targetState.forecast.t48, rainfall: Math.round(environmentalConditions.rainfall24h * 1.3), soilMoisture: Math.min(92, environmentalConditions.soilMoisture + 10), status: targetState.forecast.t48 > 75 ? 'CRITICAL' : 'HIGH' }
      ],
      primaryDrivers: targetState.featureContributions.map(fc => ({ feature: fc.feature, contribution: fc.percentage }))
    };

    setActivePrediction(result);
    setPredictionLoading(false);
    setPredictionStep('');
    setActiveMode('FORECAST');
    addActionLog('Prediction Executed', `24H Forecast computed for ${targetZone.name} (${targetZone.id}): Predicted Risk ${predictedRisk}/100.`, 'FORECAST');
  }, [selectedZoneId, riskStates, environmentalConditions, scenario, addActionLog]);

  // Infrastructure Failure Simulation
  const simulateInfrastructureFailure = useCallback((id: string) => {
    setScenario(prev => {
      const alreadyFailed = prev.failedInfrastructureIds.includes(id);
      const updated = alreadyFailed
        ? prev.failedInfrastructureIds.filter(fid => fid !== id)
        : [...prev.failedInfrastructureIds, id];
      
      return {
        ...prev,
        active: updated.length > 0 || prev.rainfallMultiplier > 1,
        type: updated.length > 0 ? 'Multiple Failures' : 'Baseline',
        failedInfrastructureIds: updated
      };
    });
    addActionLog('Infrastructure Toggled', `Infrastructure corridor [${id}] status toggled.`, 'SIMULATE');
  }, [addActionLog]);

  // Scenario Presets targeted dynamically to the active zone
  const applyScenarioPreset = useCallback((preset: Scenario['type'] | string, targetZoneId?: string) => {
    const zoneId = targetZoneId || selectedZoneId || 'Z-042';

    if (preset === 'Baseline') {
      setScenario({
        active: false,
        type: 'Baseline',
        rainfallMultiplier: 1,
        duration: 24,
        soilMoistureMultiplier: 1,
        slopeInstabilityMultiplier: 1,
        selectedZoneId: null,
        failedInfrastructureIds: []
      });
      setEnvironmentalConditions(initialDynamicTrigger);
      addActionLog('Scenario Reset', 'Reset all parameters and infrastructure to Baseline operational state.', 'SIMULATE');
      return;
    }

    if (preset === 'Heavy Rainfall' || preset === 'Heavy Rain') {
      setScenario({
        active: true,
        type: 'Heavy Rainfall',
        rainfallMultiplier: 1.8,
        duration: 24,
        soilMoistureMultiplier: 1.4,
        slopeInstabilityMultiplier: 1.2,
        selectedZoneId: zoneId,
        failedInfrastructureIds: []
      });
      setEnvironmentalConditions(prev => ({
        ...prev,
        rainfall24h: 92,
        rainfallAnomaly: 2.8,
        soilMoisture: 78,
        antecedentPrecipitation: 96
      }));
      addActionLog('Preset Applied', `Activated [Heavy Rain] preset (+92mm rainfall) for ${zoneId}.`, 'SIMULATE');
    } else if (preset === 'Slope Failure') {
      setScenario({
        active: true,
        type: 'Slope Failure',
        rainfallMultiplier: 1.2,
        duration: 12,
        soilMoistureMultiplier: 1.4,
        slopeInstabilityMultiplier: 1.9,
        selectedZoneId: zoneId,
        failedInfrastructureIds: []
      });
      setEnvironmentalConditions(prev => ({
        ...prev,
        slopeInstabilityFactor: 92,
        soilMoisture: 82,
        groundVibration: 2.8
      }));
      addActionLog('Preset Applied', `Activated [Slope Failure] preset (92% slope shear) for ${zoneId}.`, 'SIMULATE');
    } else if (preset === 'Bridge Failure') {
      // Pick the primary bridge/artery for the selected zone
      let targetBridgeId = 'B-17';
      if (zoneId === 'Z-091') targetBridgeId = 'B-09';
      else if (zoneId === 'Z-084') targetBridgeId = 'B-22';
      else if (zoneId === 'Z-018') targetBridgeId = 'R-06';
      else if (zoneId === 'Z-055') targetBridgeId = 'R-13';
      else if (zoneId === 'Z-073') targetBridgeId = 'R-15';

      setScenario({
        active: true,
        type: 'Bridge Failure',
        rainfallMultiplier: 1.2,
        duration: 24,
        soilMoistureMultiplier: 1.2,
        slopeInstabilityMultiplier: 1.2,
        selectedZoneId: zoneId,
        failedInfrastructureIds: [targetBridgeId]
      });
      addActionLog('Preset Applied', `Activated [Bridge Failure] on ${targetBridgeId} for ${zoneId}.`, 'SIMULATE');
    } else if (preset === 'Extreme Rainfall') {
      setScenario({
        active: true,
        type: 'Extreme Rainfall',
        rainfallMultiplier: 2.6,
        duration: 48,
        soilMoistureMultiplier: 1.8,
        slopeInstabilityMultiplier: 1.5,
        selectedZoneId: zoneId,
        failedInfrastructureIds: ['R-01']
      });
      setEnvironmentalConditions(prev => ({
        ...prev,
        rainfall24h: 145,
        rainfallAnomaly: 3.8,
        soilMoisture: 94,
        antecedentPrecipitation: 140,
        slopeInstabilityFactor: 85
      }));
      addActionLog('Preset Applied', `Activated [Extreme Rainfall] preset for ${zoneId}.`, 'SIMULATE');
    } else if (preset === 'Road Failure') {
      setScenario({
        active: true,
        type: 'Road Failure',
        rainfallMultiplier: 1.2,
        duration: 24,
        soilMoistureMultiplier: 1.2,
        slopeInstabilityMultiplier: 1.1,
        selectedZoneId: zoneId,
        failedInfrastructureIds: ['R-01', 'R-03']
      });
      addActionLog('Preset Applied', `Activated [Road Failure] preset for ${zoneId}.`, 'SIMULATE');
    } else if (preset === 'Multi-Zone Landslide' || preset === 'Extreme Weather Cascade') {
      setScenario({
        active: true,
        type: preset as Scenario['type'],
        rainfallMultiplier: 3.0,
        duration: 48,
        soilMoistureMultiplier: 2.0,
        slopeInstabilityMultiplier: 1.8,
        selectedZoneId: zoneId,
        failedInfrastructureIds: ['R-01', 'B-17', 'R-09']
      });
      setEnvironmentalConditions(prev => ({
        ...prev,
        rainfall24h: 180,
        rainfallAnomaly: 4.5,
        soilMoisture: 98,
        antecedentPrecipitation: 160,
        slopeInstabilityFactor: 95,
        groundVibration: 3.2
      }));
      addActionLog('Preset Applied', `Activated [${preset}] catastrophic cascade for ${zoneId}.`, 'SIMULATE');
    }
  }, [selectedZoneId, addActionLog]);

  // Clean full reset
  const resetSimulation = useCallback(() => {
    setScenario({
      active: false,
      type: 'Baseline',
      rainfallMultiplier: 1,
      duration: 24,
      soilMoistureMultiplier: 1,
      slopeInstabilityMultiplier: 1,
      selectedZoneId: null,
      failedInfrastructureIds: []
    });
    setEnvironmentalConditions(initialDynamicTrigger);
    setTimelineStep('NOW');
    setSelectedInfrastructureId(null);
    setSelectedCascadingNodeId(null);
    setHighlightedPathEdges(null);
    addActionLog('Full Reset', 'Simulation reverted to live baseline conditions.', 'LIVE');
  }, [addActionLog]);

  // Select zone handler with logging
  const handleSelectZone = useCallback((zoneId: string | null) => {
    setSelectedZoneId(zoneId);
    if (zoneId) {
      const z = mockZones.find(item => item.id === zoneId);
      if (z) {
        addActionLog('Zone Selected', `Inspecting ${z.name} (${z.id}) - Population: ${z.population.toLocaleString()}.`);
      }
    }
  }, [addActionLog]);

  return {
    // Data collections
    zones: mockZones,
    nodes: mockNodes,
    edges: mockEdges,
    reports: mockFieldReports,

    // Modes & timeline
    activeMode,
    setActiveMode,
    timelineStep,
    setTimelineStep,

    // Selections
    selectedZoneId,
    setSelectedZoneId: handleSelectZone,
    selectedInfrastructureId,
    setSelectedInfrastructureId,
    selectedCascadingNodeId,
    setSelectedCascadingNodeId,
    highlightedPathEdges,
    setHighlightedPathEdges,

    // Intelligence state
    baselineEnvironment,
    environmentalConditions,
    updateEnvironmentalVariable,
    scenario,
    setScenario,
    applyScenarioPreset,
    resetSimulation,

    // Computed Intelligence
    riskStates,
    baselineRiskStates,
    simulationRiskStates,
    networkImpact,
    baselineNetworkImpact,
    cascadingEffects,
    evacuationPlan,
    alerts,

    // Predictions & Diagnostics
    predictionLoading,
    predictionStep,
    activePrediction,
    run24HForecast,
    simulateInfrastructureFailure,

    // Logs
    actionLogs,
    addActionLog
  };
}
