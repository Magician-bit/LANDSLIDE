import React, { useMemo } from 'react';
import {
  X,
  RotateCcw,
  CloudRain,
  Droplets,
  ShieldAlert,
  Sliders,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  MapPin,
  ChevronRight,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';
import { Scenario, DynamicTrigger, RiskZone, CascadingNode, RiskState } from '../types';

export default function ScenarioSimulator({ intel, onClose }: { intel: any; onClose: () => void }) {
  const env: DynamicTrigger = intel?.environmentalConditions || {
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

  const scenario: Scenario = intel?.scenario || {
    active: false,
    type: 'Baseline',
    rainfallMultiplier: 1,
    duration: 24,
    soilMoistureMultiplier: 1,
    slopeInstabilityMultiplier: 1,
    selectedZoneId: null,
    failedInfrastructureIds: []
  };

  const zones: RiskZone[] = intel?.zones || [];
  const selectedZoneId: string = intel?.selectedZoneId || 'Z-042';
  const selectedZone: RiskZone = zones.find(z => z.id === selectedZoneId) || zones[0] || {
    id: 'Z-042',
    name: 'Tista Valley Sector A',
    staticSusceptibility: 68,
    population: 3420,
    environmentalFeatures: { elevation: 1420, slope: 38, aspect: 'South-East', terrainRuggedness: 8.2, landCover: 'Steep Tea Terraces', ndviChange: -0.18, drainage: 'High Convergence' }
  };

  const baselineRiskStates: Record<string, RiskState> = intel?.baselineRiskStates || {};
  const simulationRiskStates: Record<string, RiskState> = intel?.simulationRiskStates || intel?.riskStates || {};
  const networkImpact = intel?.networkImpact || { isolatedCommunities: 0, isolatedPopulation: 0, results: [] };
  const cascadingNodes: CascadingNode[] = intel?.cascadingEffects || [];

  // Selected Zone Risk: Baseline vs Simulated
  const selectedBaseRiskState: RiskState = baselineRiskStates[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 65,
    status: 'HIGH',
    primaryDriver: 'Historical Susceptibility',
    confidence: 90,
    featureContributions: []
  } as any;

  const selectedSimRiskState: RiskState = simulationRiskStates[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 65,
    status: 'HIGH',
    primaryDriver: 'Rainfall Anomaly',
    confidence: 92,
    featureContributions: []
  } as any;

  const baseRisk = selectedBaseRiskState.currentRisk;
  const simRisk = selectedSimRiskState.currentRisk;
  const riskDelta = simRisk - baseRisk;

  // Status styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-800/80';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'MODERATE':
        return 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80';
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
    }
  };

  // Determine top primary driver dynamically from featureContributions or delta
  const primaryDriver = useMemo(() => {
    if (selectedSimRiskState.featureContributions && selectedSimRiskState.featureContributions.length > 0) {
      const sorted = [...selectedSimRiskState.featureContributions].sort((a, b) => b.percentage - a.percentage);
      return sorted[0]?.feature || selectedSimRiskState.primaryDriver;
    }
    return selectedSimRiskState.primaryDriver || 'Rainfall Rate & Soil Saturation';
  }, [selectedSimRiskState]);

  // Network route impact for the selected zone
  const zoneNetworkResult = useMemo(() => {
    const results = networkImpact.results || [];
    // Match settlement corresponding to this zone
    const target = results.find((r: any) => 
      (selectedZone.id === 'Z-042' && r.settlementId === 'S-1') ||
      (selectedZone.id === 'Z-091' && r.settlementId === 'S-4') ||
      (selectedZone.id === 'Z-084' && r.settlementId === 'S-7') ||
      (selectedZone.id === 'Z-018' && r.settlementId === 'S-3') ||
      (selectedZone.id === 'Z-055' && r.settlementId === 'S-5') ||
      (selectedZone.id === 'Z-073' && r.settlementId === 'S-6')
    ) || results[0];

    return target;
  }, [networkImpact, selectedZone]);

  const presets = [
    {
      id: 'Heavy Rain',
      title: 'Heavy Rain',
      desc: '+92mm precipitation surge over 24h window',
      icon: CloudRain,
      active: scenario.active && (scenario.type === 'Heavy Rainfall' || scenario.type === 'Heavy Rain'),
      color: 'border-blue-500/80 bg-blue-950/50 text-blue-300'
    },
    {
      id: 'Slope Failure',
      title: 'Slope Failure',
      desc: '92% shear stress on steep terrain escarpment',
      icon: Activity,
      active: scenario.active && scenario.type === 'Slope Failure',
      color: 'border-amber-500/80 bg-amber-950/50 text-amber-300'
    },
    {
      id: 'Bridge Failure',
      title: 'Bridge Failure',
      desc: 'Structural collapse on primary sector river span',
      icon: ShieldAlert,
      active: scenario.active && scenario.type === 'Bridge Failure',
      color: 'border-red-500/80 bg-red-950/50 text-red-300'
    }
  ];

  return (
    <div id="scenario-simulator-panel" className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
              WHAT-IF ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-semibold uppercase">
              ZONE SIMULATION
            </span>
          </div>
          <h2 className="font-bold text-lg text-white mt-1 flex items-center gap-2">
            <Sliders size={18} className="text-amber-400" />
            Scenario Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Interactive Hazard Triggering &amp; Infrastructure Stress-Testing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => intel?.resetSimulation()}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 hover:text-white"
            title="Reset to baseline conditions"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* 1. Target Zone Selection / Indicator */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0 font-mono text-xs font-bold">
              {selectedZone.id.replace('Z-', '')}
            </div>
            <div className="truncate">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Sector</div>
              <div className="text-xs font-bold text-white truncate">{selectedZone.name}</div>
            </div>
          </div>

          {/* Quick Zone Switcher */}
          <select
            value={selectedZone.id}
            onChange={e => intel?.setSelectedZoneId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.id} - {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. THREE PRIMARY SLIDERS (Immediate Recalculation) */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders size={14} className="text-blue-400" />
              Dynamic Environmental Triggers
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Live Recalculation</span>
          </div>

          {/* 1. Rainfall Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <CloudRain size={14} className="text-blue-400" /> Rainfall (24h)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm text-blue-300">{env.rainfall24h} mm</span>
                <span className="text-[10px] text-slate-500 font-mono">({env.rainfallAnomaly}x normal)</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              value={env.rainfall24h}
              onChange={e => intel?.updateEnvironmentalVariable('rainfall24h', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0 mm (Dry)</span>
              <span>100 mm (Severe)</span>
              <span>200 mm (Extreme)</span>
            </div>
          </div>

          {/* 2. Soil Moisture Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Droplets size={14} className="text-teal-400" /> Soil Moisture Saturation
              </span>
              <span className="font-mono font-bold text-sm text-teal-300">{env.soilMoisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={env.soilMoisture}
              onChange={e => intel?.updateEnvironmentalVariable('soilMoisture', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>10% (Porous)</span>
              <span>60% (Field Capacity)</span>
              <span>100% (Liquefied)</span>
            </div>
          </div>

          {/* 3. Slope Instability Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Activity size={14} className="text-amber-400" /> Slope Instability Factor
              </span>
              <span className="font-mono font-bold text-sm text-amber-300">{env.slopeInstabilityFactor || 55}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={env.slopeInstabilityFactor || 55}
              onChange={e => intel?.updateEnvironmentalVariable('slopeInstabilityFactor', Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0% (Stable)</span>
              <span>50% (Baseline Shear)</span>
              <span>100% (Imminent Slip)</span>
            </div>
          </div>
        </div>

        {/* 3. BEFORE vs AFTER COMPARISON CARD */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-amber-400" />
              Before vs After Comparison ({selectedZone.id})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {riskDelta === 0 ? 'Baseline Identical' : riskDelta > 0 ? 'Hazard Escalating' : 'Hazard Mitigated'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
            {/* CURRENT BASELINE */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Current</span>
              <div className="my-1.5">
                <div className="text-xl font-extrabold font-mono text-slate-300">{baseRisk}%</div>
                <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border mt-1 ${getStatusBadge(selectedBaseRiskState.status)}`}>
                  {selectedBaseRiskState.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Live Telemetry</span>
            </div>

            {/* SIMULATED */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Simulated</span>
              <div className="my-1.5">
                <div className={`text-xl font-extrabold font-mono ${simRisk >= 75 ? 'text-red-400' : simRisk >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {simRisk}%
                </div>
                <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border mt-1 ${getStatusBadge(selectedSimRiskState.status)}`}>
                  {selectedSimRiskState.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">What-If State</span>
            </div>

            {/* CHANGE DELTA */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Change</span>
              <div className="my-1.5">
                <div className={`text-xl font-extrabold font-mono ${riskDelta > 0 ? 'text-red-400' : riskDelta < 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`}
                </div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase truncate">
                  {selectedBaseRiskState.status} → {selectedSimRiskState.status}
                </div>
              </div>
              <span className={`text-[10px] font-semibold ${riskDelta > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {riskDelta > 0 ? 'Escalation' : 'Stable'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. THREE WORKING PRESETS */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Simulation Presets
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Applies to {selectedZone.id}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {presets.map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => intel?.applyScenarioPreset(p.id, selectedZone.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                    p.active
                      ? `${p.color} ring-1 ring-white/30 shadow-md`
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                  }`}
                >
                  <Icon size={16} className={p.active ? 'text-white' : 'text-slate-400'} />
                  <span className="font-bold text-xs leading-tight">{p.title}</span>
                  <span className="text-[9px] font-mono text-slate-400 line-clamp-1">
                    {p.active ? 'ACTIVE' : 'Apply'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. INFRASTRUCTURE & NETWORK CONSEQUENCES (Dijkstra Impact) */}
        {scenario.failedInfrastructureIds.length > 0 && (
          <div className="bg-red-950/40 border border-red-800/80 p-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-2">
              <ShieldAlert size={15} />
              Infrastructure Disruption ({scenario.failedInfrastructureIds.join(', ')})
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-red-900/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Network Consequence:</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[10px] ${
                  zoneNetworkResult?.isolated
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {zoneNetworkResult?.isolated ? 'COMMUNITY ISOLATED' : 'PRIMARY ROUTE CHANGED'}
                </span>
              </div>

              {zoneNetworkResult && (
                <div className="text-xs space-y-1 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Target Facility:</span>
                    <span className="font-semibold text-white">{zoneNetworkResult.targetFacilityName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Safe Transit Time:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {zoneNetworkResult.travelTimeMinutes > 0 ? `${zoneNetworkResult.travelTimeMinutes} mins (${zoneNetworkResult.distanceKm} km)` : 'No Safe Route'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. CASCADING EFFECTS CHAIN */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Layers size={14} className="text-blue-400" />
              Cascading Effect Chain
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Dynamic Trigger Response</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[10px] font-mono overflow-x-auto py-1">
            {/* 1. Rain */}
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center flex-1 min-w-[70px]">
              <span className="text-blue-400 block font-bold">RAIN</span>
              <span className="text-white text-xs font-bold block mt-0.5">{env.rainfall24h} mm</span>
              <span className={`text-[9px] ${env.rainfall24h > 60 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                {env.rainfall24h > 60 ? '↑ HIGH' : 'NORMAL'}
              </span>
            </div>

            <ArrowRight size={12} className="text-slate-600 shrink-0" />

            {/* 2. Soil */}
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center flex-1 min-w-[70px]">
              <span className="text-teal-400 block font-bold">SOIL SAT</span>
              <span className="text-white text-xs font-bold block mt-0.5">{env.soilMoisture}%</span>
              <span className={`text-[9px] ${env.soilMoisture > 75 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                {env.soilMoisture > 75 ? '↑ SAT' : 'MED'}
              </span>
            </div>

            <ArrowRight size={12} className="text-slate-600 shrink-0" />

            {/* 3. Slope */}
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center flex-1 min-w-[70px]">
              <span className="text-amber-400 block font-bold">STABILITY</span>
              <span className="text-white text-xs font-bold block mt-0.5">{env.slopeInstabilityFactor || 55}%</span>
              <span className={`text-[9px] ${(env.slopeInstabilityFactor || 55) > 70 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                {(env.slopeInstabilityFactor || 55) > 70 ? '↓ SHEAR' : 'NOM'}
              </span>
            </div>

            <ArrowRight size={12} className="text-slate-600 shrink-0" />

            {/* 4. Risk */}
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center flex-1 min-w-[70px]">
              <span className="text-red-400 block font-bold">DISASTER</span>
              <span className="text-white text-xs font-bold block mt-0.5">{simRisk}%</span>
              <span className={`text-[9px] font-bold ${simRisk >= 75 ? 'text-red-400' : 'text-amber-400'}`}>
                {selectedSimRiskState.status}
              </span>
            </div>
          </div>
        </div>

        {/* 7. SCENARIO RESULT SUMMARY */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" />
              Scenario Result Summary
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Active Evaluation</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Current Risk (Baseline):</span>
              <span className="font-mono font-bold text-slate-200">{baseRisk}% ({selectedBaseRiskState.status})</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Simulated Risk:</span>
              <span className={`font-mono font-bold ${simRisk >= 75 ? 'text-red-400' : 'text-amber-400'}`}>
                {simRisk}% ({selectedSimRiskState.status})
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Risk Delta:</span>
              <span className={`font-mono font-bold ${riskDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Top Primary Driver:</span>
              <span className="font-semibold text-amber-300">{primaryDriver}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Infrastructure Result:</span>
              <span className="font-semibold text-slate-200">
                {scenario.failedInfrastructureIds.length > 0
                  ? zoneNetworkResult?.isolated
                    ? '1 Community Isolated'
                    : 'Primary Route Changed (+Transit Delay)'
                  : 'All Corridors Operational'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Reset & Respond */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => intel?.resetSimulation()}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <RotateCcw size={14} />
              Reset Baseline
            </button>
            <button
              onClick={() => {
                intel?.setSelectedZoneId(selectedZone.id);
                intel?.setActiveMode('RESPOND');
              }}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <ShieldCheck size={15} />
              Respond (Evacuate)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
