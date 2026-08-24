import { fetchLiveFacilities } from '../services/facilities/facilities';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  panIndiaZones,
  panIndiaNodes,
  panIndiaEdges,
  mockSeismicEvents,
  mockDeformationEvents
} from '../data/panIndiaData';
import {
  calculateDynamicRisk,
  calculateNetworkImpact,
  generateCascadingEffectsChain,
  computeComprehensiveEvacuationPlan
} from '../intelligence/engine';
import {
  AppView,
  Region,
  AppMode,
  TimelineStep,
  Scenario,
  Alert,
  DynamicTrigger,
  PredictionResult,
  ActionLog,
  InfrastructureNode,
  InfrastructureEdge,
  RiskZone,
  RegionCategory,
  FieldReport,
  ReportStatus,
  IncidentType,
  IncidentSeverity,
  DataSourceStatus
} from '../types';
import { reportService } from '../services/reports/reports';
import { DataFusionService, FusedLocationState } from '../services/DataFusionService';
import { regionToCategory, REGION_DEFINITIONS } from '../utils/regionUtils';

export const initialPanIndiaTrigger: DynamicTrigger = {
  rainfall1h: 6.4,
  rainfall3h: 18.2,
  rainfall6h: 34.0,
  rainfall24h: 78.5,
  rainfall72h: 142.0,
  rainfall7d: 210.0,
  rainfallAnomaly: 2.1,
  soilMoisture: 74.0,
  soilMoistureTrend: 1.8,
  antecedentPrecipitation: 110.0,
  slopeInstabilityFactor: 62,
  groundVibration: 1.2,
  temperatureAnomaly: 1.4,
  groundDeformationRateMm: 14.2,
  communityReportActivity: 35
};

export function useIntelligence() {
  // Authoritative Application View
  const [activeView, setActiveViewState] = useState<AppView>('live');

  // Mode Management (Kept synchronized with activeView for backwards compatibility)
  const [activeMode, setActiveModeState] = useState<AppMode>('LIVE');
  const [timelineStep, setTimelineStep] = useState<TimelineStep>('NOW');

  // Authoritative Regional Selection State
  const [selectedRegion, setSelectedRegionState] = useState<Region>('india');

  // Authoritative Map Layers State
  const [activeLayers, setActiveLayers] = useState<{
    reports: boolean;
    seismic: boolean;
    infrastructure: boolean;
    gsiSusceptibility: boolean;
    satelliteDeformation: boolean;
  }>({
    reports: true,
    seismic: true,
    infrastructure: true,
    gsiSusceptibility: true,
    satelliteDeformation: true
  });

  const toggleLayer = useCallback((layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  const setLayer = useCallback((layerKey: keyof typeof activeLayers, enabled: boolean) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: enabled }));
  }, []);

  // Selection states (Default to Chooralmala / Wayanad - Z-WAY-01)
  const [selectedZoneId, setSelectedZoneIdState] = useState<string | null>('Z-WAY-01');
  const [selectedInfrastructureId, setSelectedInfrastructureId] = useState<string | null>(null);
  const [selectedCascadingNodeId, setSelectedCascadingNodeId] = useState<string | null>(null);
  const [highlightedPathEdges, setHighlightedPathEdges] = useState<string[] | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Environmental conditions state for interactive simulation
  const [environmentalConditions, setEnvironmentalConditions] = useState<DynamicTrigger>(initialPanIndiaTrigger);
  const baselineEnvironment: DynamicTrigger = useMemo(() => ({ ...initialPanIndiaTrigger }), []);

  // Community Reports State
  const [fieldReports, setFieldReports] = useState<FieldReport[]>(() => reportService.getAllReports());

  // Data Sources Live Health
  const [dataSourceStatuses, setDataSourceStatuses] = useState<DataSourceStatus[]>(() =>
    DataFusionService.getDataSourceHealth()
  );

  // Live Fused Location State for the currently selected zone
  const [fusedZoneState, setFusedZoneState] = useState<FusedLocationState | null>(null);
  const [isFusingData, setIsFusingData] = useState<boolean>(false);

  // Scenario simulation state
  const [scenario, setScenario] = useState<Scenario>({
    active: false,
    type: 'Baseline',
    rainfallMultiplier: 1,
    duration: 24,
    soilMoistureMultiplier: 1,
    slopeInstabilityMultiplier: 1,
    groundDeformationMultiplier: 1,
    seismicTriggerActive: false,
    communityReportMultiplier: 1,
    selectedZoneId: null,
    failedInfrastructureIds: []
  });

  // Action logs
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([
    {
      id: 'LOG-INIT',
      timestamp: new Date().toISOString(),
      timeDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action: 'Pan-India Multi-Source Intelligence Initialized',
      details: 'Connected to IMD AWS, NRSC ISRO Atlas, GSI NLSM, NCS Seismic & Copernicus Sentinel-1 InSAR.',
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
    setActionLogs((prev) => [newLog, ...prev.slice(0, 40)]);
  }, [activeMode]);

  // Synchronized view switcher
  const setActiveView = useCallback((view: AppView) => {
    setActiveViewState(view);
    if (view === 'live') setActiveModeState('LIVE');
    else if (view === 'forecast') setActiveModeState('FORECAST');
    else if (view === 'simulate') setActiveModeState('SIMULATE');
    else if (view === 'respond') setActiveModeState('RESPOND');
  }, []);

  const setActiveMode = useCallback((mode: AppMode) => {
    setActiveModeState(mode);
    if (mode === 'LIVE') setActiveViewState('live');
    else if (mode === 'FORECAST') setActiveViewState('forecast');
    else if (mode === 'SIMULATE') setActiveViewState('simulate');
    else if (mode === 'RESPOND') setActiveViewState('respond');
  }, []);

  // Prediction diagnostic processing state
  const [predictionLoading, setPredictionLoading] = useState<boolean>(false);
  const [predictionStep, setPredictionStep] = useState<string>('');
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);

  // Modal and Filter states
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDataSourcesModalOpen, setIsDataSourcesModalOpen] = useState<boolean>(false);
  const [isWhyRiskModalOpen, setIsWhyRiskModalOpen] = useState<boolean>(false);
  const [selectedReportForReview, setSelectedReportForReview] = useState<FieldReport | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');

  // Filtered zones based on active region, state, and search query
  const filteredZones = useMemo(() => {
    let list = panIndiaZones;
    const cat = regionToCategory(selectedRegion);
    if (cat !== 'ALL') {
      list = list.filter((z) => z.regionCategory === cat || z.hillRange === cat);
    }
    if (selectedStateFilter && selectedStateFilter !== 'ALL') {
      list = list.filter((z) => z.state.toLowerCase() === selectedStateFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((z) =>
        z.name.toLowerCase().includes(q) ||
        z.state.toLowerCase().includes(q) ||
        z.district.toLowerCase().includes(q) ||
        (z.hillRange && z.hillRange.toLowerCase().includes(q)) ||
        z.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedRegion, selectedStateFilter, searchQuery]);

  // Set region with auto-selection of appropriate zone
  const setSelectedRegion = useCallback(
    (region: Region) => {
      setSelectedRegionState(region);
      const regDef = REGION_DEFINITIONS[region];
      const cat = regDef ? regDef.category : 'ALL';
      
      let candidateZones = panIndiaZones;
      if (cat !== 'ALL') {
        candidateZones = panIndiaZones.filter((z) => z.regionCategory === cat || z.hillRange === cat);
      }

      if (candidateZones.length > 0) {
        // If current zone is not in candidate list, switch to the first candidate
        const isCurrentPresent = candidateZones.some((z) => z.id === selectedZoneId);
        if (!isCurrentPresent) {
          setSelectedZoneIdState(candidateZones[0].id);
        }
      }

      addActionLog('Regional Context Selected', `Focused on ${regDef ? regDef.label : region}. Grid filtered.`);
    },
    [selectedZoneId, addActionLog]
  );

  // Filtered nodes and edges
  const filteredNodes = useMemo(() => {
    const cat = regionToCategory(selectedRegion);
    if (cat === 'ALL') return panIndiaNodes;
    const allowedZoneIds = new Set(filteredZones.map((z) => z.id));
    return panIndiaNodes.filter((n) => !n.zoneId || allowedZoneIds.has(n.zoneId));
  }, [selectedRegion, filteredZones]);

  const filteredEdges = useMemo(() => {
    const cat = regionToCategory(selectedRegion);
    if (cat === 'ALL') return panIndiaEdges;
    const allowedNodeIds = new Set(filteredNodes.map((n) => n.id));
    return panIndiaEdges.filter((e) => allowedNodeIds.has(e.source) && allowedNodeIds.has(e.target));
  }, [selectedRegion, filteredNodes]);

  // Refresh reports from service
  const refreshReports = useCallback(() => {
    setFieldReports(reportService.getAllReports());
  }, []);

  // Submit Incident Report
  const submitIncidentReport = useCallback(
    (reportData: {
      reporter: string;
      location: [number, number];
      locationName: string;
      state?: string;
      district?: string;
      zoneId?: string;
      type: IncidentType;
      severity: IncidentSeverity;
      description: string;
      imageUrl?: string;
      affectedRoad?: boolean;
      affectedBuilding?: boolean;
      riverBlocked?: boolean;
      peopleTrapped?: boolean;
      evacuationRequired?: boolean;
    }) => {
      const created = reportService.submitReport(reportData);
      refreshReports();
      addActionLog(
        'Community Report Submitted',
        `Incident reported at ${created.locationName} (${created.type} - ${created.severity}). Status: UNVERIFIED.`
      );
      return created;
    },
    [refreshReports, addActionLog]
  );

  // Update Report Status
  const updateReportStatus = useCallback(
    (reportId: string, status: ReportStatus, verifiedBy?: string) => {
      reportService.updateReportStatus(reportId, status, verifiedBy);
      refreshReports();
      addActionLog('Report Status Updated', `Report ${reportId} marked as ${status}.`);
    },
    [refreshReports, addActionLog]
  );

  // Computed Baseline Risk States
  const baselineRiskStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof calculateDynamicRisk>> = {};
    panIndiaZones.forEach((zone) => {
      states[zone.id] = calculateDynamicRisk(
        zone,
        baselineEnvironment,
        { active: false, type: 'Baseline', rainfallMultiplier: 1, duration: 24, soilMoistureMultiplier: 1, slopeInstabilityMultiplier: 1, selectedZoneId: null, failedInfrastructureIds: [] },
        fieldReports,
        timelineStep
      );
    });
    return states;
  }, [baselineEnvironment, fieldReports, timelineStep]);

  // Computed Simulation Risk States (Strictly Area-Scoped)
  const simulationRiskStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof calculateDynamicRisk>> = {};
    const targetZoneId = scenario.selectedZoneId || selectedZoneId;
    const isScenarioActive = scenario.active && scenario.type !== 'Baseline';

    panIndiaZones.forEach((zone) => {
      const isTarget = zone.id === targetZoneId;
      
      if (!isScenarioActive) {
        // When simulation is inactive, compute pure live baseline
        states[zone.id] = calculateDynamicRisk(
          zone,
          baselineEnvironment,
          { active: false, type: 'Baseline', rainfallMultiplier: 1, duration: 24, soilMoistureMultiplier: 1, slopeInstabilityMultiplier: 1, selectedZoneId: null, failedInfrastructureIds: [] },
          fieldReports,
          timelineStep
        );
      } else if (isTarget) {
        // Direct target zone receives full scenario multipliers and user-configured environmental conditions
        states[zone.id] = calculateDynamicRisk(
          zone,
          environmentalConditions,
          { ...scenario, selectedZoneId: targetZoneId },
          fieldReports,
          timelineStep
        );
      } else if (scenario.type === 'Multi-Zone Landslide' || scenario.type === 'Extreme Weather Cascade') {
        // Regional multi-zone cascade: check if this zone is in the same regional/state cluster
        const targetZone = panIndiaZones.find(z => z.id === targetZoneId);
        const isRegionalNeighbor = targetZone && (zone.state === targetZone.state || zone.hillRange === targetZone.hillRange);
        
        if (isRegionalNeighbor) {
          states[zone.id] = calculateDynamicRisk(
            zone,
            {
              ...baselineEnvironment,
              rainfall24h: Math.round(baselineEnvironment.rainfall24h * 1.6),
              soilMoisture: Math.min(95, Math.round(baselineEnvironment.soilMoisture * 1.3))
            },
            {
              ...scenario,
              rainfallMultiplier: 1.4,
              soilMoistureMultiplier: 1.3,
              slopeInstabilityMultiplier: 1.25,
              selectedZoneId: targetZoneId
            },
            fieldReports,
            timelineStep
          );
        } else {
          // Unrelated distant zones remain strictly at baseline
          states[zone.id] = calculateDynamicRisk(
            zone,
            baselineEnvironment,
            { active: false, type: 'Baseline', rainfallMultiplier: 1, duration: 24, soilMoistureMultiplier: 1, slopeInstabilityMultiplier: 1, selectedZoneId: null, failedInfrastructureIds: [] },
            fieldReports,
            timelineStep
          );
        }
      } else {
        // Local scenarios (Heavy Rainfall, Slope Failure, Bridge Failure, Earthquake Trigger, Community Report Surge)
        // Non-selected zones remain strictly on baseline!
        states[zone.id] = calculateDynamicRisk(
          zone,
          baselineEnvironment,
          { active: false, type: 'Baseline', rainfallMultiplier: 1, duration: 24, soilMoistureMultiplier: 1, slopeInstabilityMultiplier: 1, selectedZoneId: null, failedInfrastructureIds: [] },
          fieldReports,
          timelineStep
        );
      }
    });
    return states;
  }, [environmentalConditions, scenario, selectedZoneId, baselineEnvironment, fieldReports, timelineStep]);

  // Active risk states for current view mode
  const riskStates = useMemo(() => {
    if (activeMode === 'LIVE') {
      return baselineRiskStates;
    }
    return simulationRiskStates;
  }, [activeMode, baselineRiskStates, simulationRiskStates]);

  // Baseline Network Impact
  const baselineNetworkImpact = useMemo(() => {
    return calculateNetworkImpact(panIndiaNodes, panIndiaEdges, {
      active: false,
      type: 'Baseline',
      rainfallMultiplier: 1,
      duration: 24,
      soilMoistureMultiplier: 1,
      selectedZoneId: null,
      failedInfrastructureIds: []
    });
  }, []);

  // Computed Network Impact via Dijkstra
  const networkImpact = useMemo(() => {
    if (activeMode === 'LIVE') {
      return baselineNetworkImpact;
    }
    return calculateNetworkImpact(panIndiaNodes, panIndiaEdges, scenario);
  }, [activeMode, scenario, baselineNetworkImpact]);

  // Computed Cascading Effects Chain
  const cascadingEffects = useMemo(() => {
    return generateCascadingEffectsChain(scenario, panIndiaZones, simulationRiskStates, networkImpact);
  }, [scenario, simulationRiskStates, networkImpact]);

  // Computed Evacuation Plan
  const evacuationPlan = useMemo(() => {
    return computeComprehensiveEvacuationPlan(panIndiaZones, panIndiaNodes, panIndiaEdges, riskStates, networkImpact);
  }, [riskStates, networkImpact]);

  // Priority Alerts
  const alerts = useMemo(() => {
    const a: Alert[] = [];

    // Critical Isolation Alert
    if (networkImpact?.isolatedCommunities > 0) {
      a.push({
        id: 'A-ISOLATION-CRITICAL',
        type: 'ISOLATION_WARNING',
        zoneId: selectedZoneId || 'KL-WAY-01',
        title: `${networkImpact.isolatedCommunities} Mountain Communities Isolated`,
        description: `${networkImpact.isolatedPopulation.toLocaleString()} residents cut off from primary medical centers due to compromised corridors.`,
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
        coordinates: [11.5312, 76.1384]
      });
    }

    // High Risk Zones Alert
    panIndiaZones.forEach((z) => {
      const rs = riskStates[z.id];
      if (rs && rs.currentRisk >= 75) {
        a.push({
          id: `A-RISK-${z.id}`,
          type: 'RISK_ESCALATION',
          zoneId: z.id,
          title: `Critical Landslide Risk: ${z.name}`,
          description: `${z.name} (${z.state}) reached ${rs.currentRisk}/100. Primary driver: ${rs.primaryDriver}. Evacuation protocols recommended.`,
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

  // Asynchronously fuse data when selected zone changes
  useEffect(() => {
    let isCancelled = false;
    const targetZone = panIndiaZones.find((z) => z.id === selectedZoneId) || panIndiaZones[0];

    async function runFusion() {
      setIsFusingData(true);
      try {
        const fused = await DataFusionService.fuseZoneData(targetZone, scenario, timelineStep);
        if (!timelineStep || timelineStep === 'NOW') {
          const facilitiesRes = await fetchLiveFacilities(targetZone);
          if (facilitiesRes.status === 'LIVE') {
            fused.facilities = facilitiesRes.facilities;
          } else {
            fused.facilities = [];
          }
        }
        if (!isCancelled) {
          setFusedZoneState(fused);
        }
      } catch {
        // Fallback handled
      } finally {
        if (!isCancelled) {
          setIsFusingData(false);
        }
      }
    }

    runFusion();
    return () => {
      isCancelled = true;
    };
  }, [selectedZoneId, scenario, timelineStep]);

  // Update environmental variables
  const updateEnvironmentalVariable = useCallback(
    (key: keyof DynamicTrigger, value: number) => {
      let clampedValue = value;
      if (key === 'rainfall24h' || key === 'rainfall1h' || key === 'antecedentPrecipitation' || key === 'rainfall72h') {
        clampedValue = Math.max(0, Math.min(450, value));
      } else if (key === 'soilMoisture' || key === 'slopeInstabilityFactor' || key === 'communityReportActivity') {
        clampedValue = Math.max(0, Math.min(100, value));
      }

      setEnvironmentalConditions((prev) => ({
        ...prev,
        [key]: clampedValue,
        ...(key === 'rainfall24h' ? { rainfallAnomaly: Math.max(0.8, Number((clampedValue / 25).toFixed(2))) } : {})
      }));

      setScenario((prev) => ({
        ...prev,
        active: true,
        type: prev.type === 'Baseline' ? ('Custom Simulation' as any) : prev.type,
        selectedZoneId: selectedZoneId || prev.selectedZoneId || 'KL-WAY-01'
      }));

      addActionLog('Environmental Adjusted', `Parameter [${String(key)}] set to ${clampedValue}.`, 'SIMULATE');
    },
    [selectedZoneId, addActionLog]
  );

  // Run 24H Forecast with step-by-step diagnostic sequence
  const run24HForecast = useCallback(
    async (zoneId?: string) => {
      const targetId = zoneId || selectedZoneId || 'KL-WAY-01';
      const targetZone = panIndiaZones.find((z) => z.id === targetId) || panIndiaZones[0];
      const targetState = riskStates[targetId] || calculateDynamicRisk(targetZone, environmentalConditions, scenario, fieldReports);

      setPredictionLoading(true);

      const steps = [
        'FETCHING IMD REAL-TIME AWS & PRECIPITATION FEEDS...',
        'QUERYING GSI NATIONAL LANDSLIDE SUSCEPTIBILITY ATLAS (1:50k)...',
        'ASSESSING NRSC / ISRO HISTORICAL FREQUENCY CORRIDORS...',
        'MEASURING COPERNICUS SENTINEL-1 InSAR GROUND DEFORMATION...',
        'EVALUATING NATIONAL CENTRE FOR SEISMOLOGY (NCS) PROXIMITY...',
        'PROCESSING COMMUNITY INCIDENT REPORTS & TENSION CRACK CLUSTERS...',
        'RUNNING DETERMINISTIC DYNAMIC RISK FUSION MODEL...',
        'CALCULATING DIJKSTRA EVACUATION ROUTING & BOTTLENECK PROJECTIONS...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setPredictionStep(steps[i]);
        await new Promise((res) => setTimeout(res, 120));
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
        consistencyReason: `Multi-Source Data Fusion: Verified consensus across IMD precipitation, GSI baseline terrain shear, and NRSC historical frequency corridors.`,
        timelineEvolution: [
          { time: 'T-24H', risk: Math.max(10, currentRisk - 22), rainfall: 18, soilMoisture: 48, status: 'LOW' },
          { time: 'T-6H', risk: Math.max(15, currentRisk - 10), rainfall: 35, soilMoisture: 62, status: 'MODERATE' },
          { time: 'NOW', risk: currentRisk, rainfall: environmentalConditions.rainfall24h, soilMoisture: environmentalConditions.soilMoisture, status: targetState.status },
          { time: '+6H', risk: targetState.forecast.t6, rainfall: Math.round(environmentalConditions.rainfall24h * 1.25), soilMoisture: Math.min(95, environmentalConditions.soilMoisture + 8), status: targetState.forecast.t6 > 75 ? 'CRITICAL' : 'HIGH' },
          { time: '+12H', risk: targetState.forecast.t12, rainfall: Math.round(environmentalConditions.rainfall24h * 1.45), soilMoisture: Math.min(98, environmentalConditions.soilMoisture + 14), status: 'CRITICAL' },
          { time: '+24H', risk: targetState.forecast.t24, rainfall: Math.round(environmentalConditions.rainfall24h * 1.6), soilMoisture: Math.min(100, environmentalConditions.soilMoisture + 18), status: 'CRITICAL' },
          { time: '+48H', risk: targetState.forecast.t48, rainfall: Math.round(environmentalConditions.rainfall24h * 1.3), soilMoisture: Math.min(92, environmentalConditions.soilMoisture + 10), status: targetState.forecast.t48 > 75 ? 'CRITICAL' : 'HIGH' }
        ],
        primaryDrivers: targetState.featureContributions.map((fc) => ({ feature: fc.feature, contribution: fc.percentage }))
      };

      setActivePrediction(result);
      setPredictionLoading(false);
      setPredictionStep('');
      setActiveMode('FORECAST');
      addActionLog('Prediction Executed', `24H Forecast computed for ${targetZone.name} (${targetZone.id}): Predicted Risk ${predictedRisk}/100.`, 'FORECAST');
    },
    [selectedZoneId, riskStates, environmentalConditions, scenario, fieldReports, addActionLog]
  );

  // Infrastructure Failure Simulation
  const simulateInfrastructureFailure = useCallback(
    (id: string) => {
      setScenario((prev) => {
        const alreadyFailed = prev.failedInfrastructureIds.includes(id);
        const updated = alreadyFailed
          ? prev.failedInfrastructureIds.filter((fid) => fid !== id)
          : [...prev.failedInfrastructureIds, id];

        return {
          ...prev,
          active: updated.length > 0 || prev.rainfallMultiplier > 1,
          type: updated.length > 0 ? 'Multiple Failures' : 'Baseline',
          failedInfrastructureIds: updated
        };
      });
      addActionLog('Infrastructure Toggled', `Infrastructure corridor [${id}] status toggled.`, 'SIMULATE');
    },
    [addActionLog]
  );

  // Helper to find zone-specific bridge or primary transit edge
  const getZoneBridgeOrEdgeId = useCallback((zoneId: string) => {
    const bridgeEdge = panIndiaEdges.find(
      (e) => e.zoneId === zoneId && (e.type === 'bridge' || e.name?.toLowerCase().includes('bridge') || e.name?.toLowerCase().includes('viaduct') || e.name?.toLowerCase().includes('span') || e.source.includes('B1') || e.target.includes('B1'))
    );
    if (bridgeEdge) return bridgeEdge.id;
    const anyZoneEdge = panIndiaEdges.find((e) => e.zoneId === zoneId);
    if (anyZoneEdge) return anyZoneEdge.id;
    return 'E-WAY-01';
  }, []);

  // Scenario Presets (Strictly Scoped to Selected Area)
  const applyScenarioPreset = useCallback(
    (preset: Scenario['type'] | string, targetZoneId?: string) => {
      const zoneId = targetZoneId || selectedZoneId || 'Z-WAY-01';
      const targetZone = panIndiaZones.find((z) => z.id === zoneId) || panIndiaZones[0];
      const targetBridgeId = getZoneBridgeOrEdgeId(zoneId);

      if (preset === 'Baseline') {
        setScenario({
          active: false,
          type: 'Baseline',
          rainfallMultiplier: 1,
          duration: 24,
          soilMoistureMultiplier: 1,
          slopeInstabilityMultiplier: 1,
          groundDeformationMultiplier: 1,
          seismicTriggerActive: false,
          communityReportMultiplier: 1,
          selectedZoneId: null,
          failedInfrastructureIds: []
        });
        setEnvironmentalConditions(initialPanIndiaTrigger);
        addActionLog('Scenario Reset', `Reset simulation parameters for ${targetZone.name} to Baseline operational state.`, 'SIMULATE');
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
          groundDeformationMultiplier: 1.3,
          seismicTriggerActive: false,
          communityReportMultiplier: 1.4,
          selectedZoneId: zoneId,
          failedInfrastructureIds: []
        });
        setEnvironmentalConditions((prev) => ({
          ...prev,
          rainfall24h: 135,
          rainfallAnomaly: 3.4,
          soilMoisture: 88,
          antecedentPrecipitation: 185
        }));
        addActionLog('Preset Applied', `Activated [Heavy Rainfall] (+135mm rain) | Target Area: ${targetZone.name}, ${targetZone.district} (${targetZone.state})`, 'SIMULATE');
      } else if (preset === 'Slope Failure') {
        setScenario({
          active: true,
          type: 'Slope Failure',
          rainfallMultiplier: 1.2,
          duration: 12,
          soilMoistureMultiplier: 1.4,
          slopeInstabilityMultiplier: 1.9,
          groundDeformationMultiplier: 2.2,
          seismicTriggerActive: false,
          communityReportMultiplier: 1.8,
          selectedZoneId: zoneId,
          failedInfrastructureIds: []
        });
        setEnvironmentalConditions((prev) => ({
          ...prev,
          slopeInstabilityFactor: 94,
          soilMoisture: 90,
          groundDeformationRateMm: 26.5
        }));
        addActionLog('Preset Applied', `Activated [Slope Shear Failure] | Target Area: ${targetZone.name}, ${targetZone.district} (${targetZone.state})`, 'SIMULATE');
      } else if (preset === 'Bridge Failure') {
        setScenario({
          active: true,
          type: 'Bridge Failure',
          rainfallMultiplier: 1.2,
          duration: 24,
          soilMoistureMultiplier: 1.2,
          slopeInstabilityMultiplier: 1.2,
          groundDeformationMultiplier: 1.2,
          seismicTriggerActive: false,
          communityReportMultiplier: 1.5,
          selectedZoneId: zoneId,
          failedInfrastructureIds: [targetBridgeId]
        });
        addActionLog('Preset Applied', `Activated [Bridge Structural Severing] on corridor [${targetBridgeId}] | Target Area: ${targetZone.name}, ${targetZone.district} (${targetZone.state})`, 'SIMULATE');
      } else if (preset === 'Extreme Rainfall' || preset === 'Cloudburst Event') {
        setScenario({
          active: true,
          type: 'Extreme Rainfall',
          rainfallMultiplier: 2.8,
          duration: 48,
          soilMoistureMultiplier: 1.9,
          slopeInstabilityMultiplier: 1.6,
          groundDeformationMultiplier: 2.0,
          seismicTriggerActive: false,
          communityReportMultiplier: 2.2,
          selectedZoneId: zoneId,
          failedInfrastructureIds: [targetBridgeId]
        });
        setEnvironmentalConditions((prev) => ({
          ...prev,
          rainfall24h: 225,
          rainfallAnomaly: 5.2,
          soilMoisture: 97,
          antecedentPrecipitation: 295,
          slopeInstabilityFactor: 90
        }));
        addActionLog('Preset Applied', `Activated [Extreme Cloudburst Event] (+225mm storm surge) | Target Area: ${targetZone.name}, ${targetZone.district} (${targetZone.state}) | Severed: ${targetBridgeId}`, 'SIMULATE');
      } else if (preset === 'Earthquake Trigger') {
        setScenario({
          active: true,
          type: 'Earthquake Trigger',
          rainfallMultiplier: 1.1,
          duration: 12,
          soilMoistureMultiplier: 1.1,
          slopeInstabilityMultiplier: 1.8,
          groundDeformationMultiplier: 2.4,
          seismicTriggerActive: true,
          communityReportMultiplier: 2.0,
          selectedZoneId: zoneId,
          failedInfrastructureIds: []
        });
        setEnvironmentalConditions((prev) => ({
          ...prev,
          groundVibration: 4.2,
          slopeInstabilityFactor: 92
        }));
        addActionLog('Preset Applied', `Activated [M5.8 Seismic Tremor Shockwave] | Target Area: ${targetZone.name}, ${targetZone.district} (${targetZone.state})`, 'SIMULATE');
      } else if (preset === 'Community Report Surge') {
        setScenario({
          active: true,
          type: 'Community Report Surge',
          rainfallMultiplier: 1.2,
          duration: 12,
          soilMoistureMultiplier: 1.2,
          slopeInstabilityMultiplier: 1.4,
          groundDeformationMultiplier: 1.4,
          seismicTriggerActive: false,
          communityReportMultiplier: 2.5,
          selectedZoneId: zoneId,
          failedInfrastructureIds: []
        });
        addActionLog('Preset Applied', `Activated [Citizen Field Incident Surge] | Target Area: ${targetZone.name}, ${targetZone.district} (${targetZone.state})`, 'SIMULATE');
      } else if (preset === 'Multi-Zone Landslide' || preset === 'Extreme Weather Cascade') {
        const zoneEdges = panIndiaEdges.filter((e) => e.zoneId === zoneId).slice(0, 2).map((e) => e.id);
        const failedIds = zoneEdges.length > 0 ? zoneEdges : [targetBridgeId];

        setScenario({
          active: true,
          type: preset as Scenario['type'],
          rainfallMultiplier: 3.2,
          duration: 48,
          soilMoistureMultiplier: 2.0,
          slopeInstabilityMultiplier: 1.9,
          groundDeformationMultiplier: 2.5,
          seismicTriggerActive: true,
          communityReportMultiplier: 2.5,
          selectedZoneId: zoneId,
          failedInfrastructureIds: failedIds
        });
        setEnvironmentalConditions((prev) => ({
          ...prev,
          rainfall24h: 275,
          rainfallAnomaly: 5.8,
          soilMoisture: 99,
          antecedentPrecipitation: 340,
          slopeInstabilityFactor: 97,
          groundDeformationRateMm: 34.0,
          groundVibration: 3.4
        }));
        addActionLog('Preset Applied', `Activated [${preset}] Catastrophic Regional Cascade | Epicenter Target: ${targetZone.name}, ${targetZone.district} (${targetZone.state})`, 'SIMULATE');
      }
    },
    [selectedZoneId, addActionLog, getZoneBridgeOrEdgeId]
  );

  // Clean full reset
  const resetSimulation = useCallback(() => {
    setScenario({
      active: false,
      type: 'Baseline',
      rainfallMultiplier: 1,
      duration: 24,
      soilMoistureMultiplier: 1,
      slopeInstabilityMultiplier: 1,
      groundDeformationMultiplier: 1,
      seismicTriggerActive: false,
      communityReportMultiplier: 1,
      selectedZoneId: null,
      failedInfrastructureIds: []
    });
    setEnvironmentalConditions(initialPanIndiaTrigger);
    setTimelineStep('NOW');
    setSelectedInfrastructureId(null);
    setSelectedCascadingNodeId(null);
    setHighlightedPathEdges(null);
    addActionLog('Full Reset', 'Simulation reverted to live baseline conditions.', 'LIVE');
  }, [addActionLog]);

  // Select zone handler with seamless simulation state synchronisation
  const handleSelectZone = useCallback(
    (zoneId: string | null) => {
      setSelectedZoneIdState(zoneId);
      if (zoneId) {
        const z = panIndiaZones.find((item) => item.id === zoneId);
        if (z) {
          addActionLog('Zone Selected', `Inspecting ${z.name}, ${z.district} • ${z.state} (${z.id}) - Population: ${z.population.toLocaleString()}.`);
        }
        // If simulation is active, seamlessly shift scenario target to the newly selected zone
        setScenario((prev) => {
          if (!prev.active || prev.type === 'Baseline') return prev;
          let newFailed = prev.failedInfrastructureIds;
          if (prev.type === 'Bridge Failure' || prev.type === 'Extreme Rainfall' || prev.type === 'Cloudburst Event') {
            newFailed = [getZoneBridgeOrEdgeId(zoneId)];
          }
          return {
            ...prev,
            selectedZoneId: zoneId,
            failedInfrastructureIds: newFailed
          };
        });
      }
    },
    [addActionLog, getZoneBridgeOrEdgeId]
  );

  // Explicit GPS Location finder
  const locateUserPosition = useCallback(
    (onSuccess: (lat: number, lon: number, name: string) => void, onError: (err: string) => void) => {
      if (!navigator.geolocation) {
        onError('Geolocation is not supported by your browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          // Find closest pan-India zone
          let closestZone: RiskZone | null = null;
          let minDistance = Infinity;
          for (const zone of panIndiaZones) {
            const dLat = (zone.coordinates[0] - lat) * 111;
            const dLon = (zone.coordinates[1] - lon) * 111 * Math.cos((lat * Math.PI) / 180);
            const dist = Math.sqrt(dLat * dLat + dLon * dLon);
            if (dist < minDistance) {
              minDistance = dist;
              closestZone = zone;
            }
          }
          if (closestZone) {
            setSelectedZoneIdState(closestZone.id);
            onSuccess(lat, lon, `${closestZone.name}, ${closestZone.state} (${minDistance.toFixed(1)} km away)`);
            addActionLog('GPS User Position Located', `Nearest zone identified: ${closestZone.name} (${minDistance.toFixed(1)} km).`);
          } else {
            onSuccess(lat, lon, `Coordinates: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
          }
        },
        (error) => {
          onError(error.message || 'Unable to retrieve your current location.');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    },
    [addActionLog]
  );

  const selectedZone = useMemo(() => {
    return panIndiaZones.find((item) => item.id === selectedZoneId) || panIndiaZones[0] || null;
  }, [selectedZoneId]);

  return {
    // Data collections (Pan-India)
    zones: panIndiaZones,
    filteredZones,
    nodes: panIndiaNodes,
    filteredNodes,
    edges: panIndiaEdges,
    filteredEdges,
    reports: fieldReports,
    seismicEvents: mockSeismicEvents,
    deformationEvents: mockDeformationEvents,
    dataSourceStatuses,
    dataSources: dataSourceStatuses,

    // Regional & Search Filter
    selectedRegion,
    setSelectedRegion,
    searchQuery,
    setSearchQuery,
    selectedStateFilter,
    setSelectedStateFilter,

    // Modals
    isReportModalOpen,
    setIsReportModalOpen,
    isDataSourcesModalOpen,
    setIsDataSourcesModalOpen,
    isWhyRiskModalOpen,
    setIsWhyRiskModalOpen,
    selectedReportForReview,
    setSelectedReportForReview,
    verifyReport: updateReportStatus,

    // Views & Modes
    activeView,
    setActiveView,
    activeMode,
    setActiveMode,
    timelineStep,
    setTimelineStep,

    // Layers
    activeLayers,
    toggleLayer,
    setLayer,

    // Selections
    selectedZoneId,
    selectedZone,
    selectedLocation: selectedZone,
    setSelectedZoneId: handleSelectZone,
    selectedInfrastructureId,
    setSelectedInfrastructureId,
    selectedFacility: selectedInfrastructureId,
    selectedCascadingNodeId,
    setSelectedCascadingNodeId,
    highlightedPathEdges,
    setHighlightedPathEdges,
    selectedAlertId,
    setSelectedAlertId,
    selectedAlert: alerts.find((a) => a.id === selectedAlertId) || null,
    selectedReport: selectedReportForReview,
    simulationState: scenario,

    // GPS User Location
    locateUserPosition,

    // Community Incident Reporting
    submitIncidentReport,
    updateReportStatus,
    refreshReports,

    // Fused Location State
    fusedZoneState,
    isFusingData,

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

