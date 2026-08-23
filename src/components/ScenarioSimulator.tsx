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
    rainfall1h: 4.5,
    rainfall24h: 45.0,
    rainfallAnomaly: 1.3,
    soilMoisture: 65.0,
    soilMoistureTrend: 1.5,
    antecedentPrecipitation: 75.0,
    slopeInstabilityFactor: 55,
    groundDeformationMmMonth: 4.2,
    groundVibration: 1.1,
    temperatureAnomaly: 1.2
  };

  const scenario: Scenario = intel?.scenario || {
    active: false,
    type: 'Baseline',
    rainfallMultiplier: 1,
    duration: 24,
    soilMoistureMultiplier: 1,
    slopeInstabilityMultiplier: 1,
    groundDeformationMultiplier: 1,
    selectedZoneId: null,
    failedInfrastructureIds: []
  };

  const zones: RiskZone[] = intel?.zones || [];
  const selectedZoneId: string = intel?.selectedZoneId || 'Z-WAY-01';
  const selectedZone: RiskZone = zones.find(z => z.id === selectedZoneId) || zones[0] || {
    id: 'Z-WAY-01',
    name: 'Chooralmala-Meppadi Escarpment',
    state: 'Kerala',
    district: 'Wayanad',
    hillRange: 'Western Ghats',
    staticSusceptibility: 88,
    population: 4800,
    environmentalFeatures: { elevation: 1450, slope: 41, aspect: 'South-West', terrainRuggedness: 8.8, landCover: 'Tea Plantations & Escarpments', ndviChange: -0.24, drainage: 'Very High Runoff', lithology: 'Charnockite & Gneiss Complex', gsiSusceptibilityClass: 'Critical' }
  };

  const baselineRiskStates: Record<string, RiskState> = intel?.baselineRiskStates || {};
  const simulationRiskStates: Record<string, RiskState> = intel?.simulationRiskStates || intel?.riskStates || {};
  const networkImpact = intel?.networkImpact || { isolatedCommunities: 0, isolatedPopulation: 0, results: [] };
  const cascadingNodes: CascadingNode[] = intel?.cascadingEffects || [];

  // Selected Zone Risk: Baseline vs Simulated
  const selectedBaseRiskState: RiskState = baselineRiskStates[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 75,
    status: 'HIGH',
    primaryDriver: 'GSI Geological Susceptibility',
    confidence: 90,
    featureContributions: []
  } as any;

  const selectedSimRiskState: RiskState = simulationRiskStates[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 75,
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
      case 'VERY_HIGH':
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

  const presets = [
    {
      id: 'Cloudburst Event',
      title: 'Cloudburst & Extreme Rain',
      desc: '+140mm intense storm surge with road/bridge washouts',
      icon: CloudRain,
      active: scenario.active && (scenario.type === 'Cloudburst Event' || scenario.type === 'Extreme Rainfall'),
      color: 'border-blue-500/80 bg-blue-950/50 text-blue-300'
    },
    {
      id: 'Earthquake Trigger',
      title: 'M5.8 Seismic Shockwave',
      desc: 'Ground vibration inducing instantaneous slope failure',
      icon: Activity,
      active: scenario.active && scenario.type === 'Earthquake Trigger',
      color: 'border-orange-500/80 bg-orange-950/50 text-orange-300'
    },
    {
      id: 'Bridge Failure',
      title: 'Bridge Structural Severing',
      desc: 'Sever primary bridge span cutting valley access',
      icon: ShieldAlert,
      active: scenario.active && scenario.type === 'Bridge Failure',
      color: 'border-red-500/80 bg-red-950/50 text-red-300'
    },
    {
      id: 'Community Report Surge',
      title: 'Citizen Report Cluster',
      desc: 'Multiple confirmed field reports of slope fissures',
      icon: Flame,
      active: scenario.active && scenario.type === 'Community Report Surge',
      color: 'border-purple-500/80 bg-purple-950/50 text-purple-300'
    }
  ];

  return (
    <div id="scenario-simulator-workspace-panel" className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
              SIMULATION ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/80 rounded font-semibold uppercase">
              WHAT-IF MODELING
            </span>
          </div>
          <h2 className="font-bold text-lg text-white mt-1 flex items-center gap-2">
            <Sliders size={18} className="text-amber-400" />
            What-If Scenario Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Simulate extreme cloudbursts, seismic shocks, and corridor severing
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Target Sector Selector */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0 font-mono text-xs font-bold">
              {selectedZone.id.replace('Z-', '')}
            </div>
            <div className="truncate">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Simulation Target Sector</div>
              <div className="text-xs font-bold text-white truncate">{selectedZone.name} ({selectedZone.state})</div>
            </div>
          </div>

          <select
            value={selectedZone.id}
            onChange={e => intel?.setSelectedZoneId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer max-w-[140px] truncate"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.state})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Simulation Status Banner & Controls */}
        <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
          scenario.active
            ? 'bg-amber-950/70 border-amber-500/80 text-amber-200 shadow-lg shadow-amber-950/40'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${scenario.active ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {scenario.active ? `Simulating: ${scenario.type}` : 'Live Telemetry Baseline Active'}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {scenario.active ? `Risk Escalation: +${riskDelta}% over baseline` : 'Select a preset below or adjust sliders'}
              </div>
            </div>
          </div>

          {scenario.active && (
            <button
              onClick={() => intel.resetSimulation()}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>

        {/* 3. Preset Scenario Cards */}
        <div className="space-y-2">
          <div className="text-xs uppercase font-bold text-slate-300 flex items-center justify-between">
            <span>Disaster Stress Presets</span>
            <span className="text-[10px] text-slate-500 font-mono">1-Click Scenarios</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => intel.applyPresetScenario(p.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1.5 transition-all ${
                    p.active
                      ? `${p.color} ring-1 ring-amber-500 shadow-md`
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon size={16} className={p.active ? 'text-white' : 'text-slate-400'} />
                    {p.active && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{p.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Dual Risk Delta Comparison Box */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="text-xs uppercase font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
            <span>Risk Delta Analysis</span>
            <span className="font-mono text-[10px] text-slate-400">Baseline vs What-If</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Baseline</span>
              <div className="text-lg font-extrabold font-mono text-slate-300 mt-1">{baseRisk}%</div>
              <span className="text-[8px] font-mono text-slate-500">{selectedBaseRiskState.status}</span>
            </div>

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">What-If Risk</span>
              <div className="text-lg font-extrabold font-mono text-amber-400 mt-1">{simRisk}%</div>
              <span className={`inline-block text-[8px] font-bold uppercase px-1 py-0.2 rounded border mt-0.5 ${getStatusBadge(selectedSimRiskState.status)}`}>
                {selectedSimRiskState.status}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Net Delta</span>
              <div className={`text-lg font-extrabold font-mono mt-1 ${riskDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {riskDelta > 0 ? `+${riskDelta}%` : '0%'}
              </div>
              <span className="text-[8px] font-mono text-slate-400">Escalation</span>
            </div>
          </div>

          {/* Network Impact Callout */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Isolated Communities:</span>
              <span className="font-bold font-mono text-red-400">{networkImpact.isolatedCommunities} settlements</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Isolated Citizens:</span>
              <span className="font-bold font-mono text-red-400">{networkImpact.isolatedPopulation.toLocaleString()} pop</span>
            </div>
          </div>
        </div>

        {/* 5. Cascading Disaster Chain */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <GitBranch size={14} className="text-amber-400" />
              Cascading Disaster Effects Chain
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{cascadingNodes.length} Stages</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {cascadingNodes.map((node, index) => (
              <div
                key={node.id}
                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start gap-2.5 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-amber-950 border border-amber-700/80 text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold text-white leading-tight">{node.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{node.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Navigation Actions */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-md grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              intel?.setActiveMode('LIVE');
            }}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <RotateCcw size={13} />
            Live Map
          </button>

          <button
            onClick={() => {
              intel?.setSelectedZoneId(selectedZone.id);
              intel?.setActiveMode('RESPOND');
            }}
            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <ShieldCheck size={14} />
            Evacuation Plan →
          </button>
        </div>
      </div>
    </div>
  );
}
