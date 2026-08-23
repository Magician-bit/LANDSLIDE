import React from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Flame,
  Building2,
  HeartPulse,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { InfrastructureNode, InfrastructureEdge, RiskZone } from '../../types';

interface SimulationWorkspaceProps {
  intel: any;
  onNavigateToLiveMap: (zoneId?: string) => void;
  onNavigateToResponse: () => void;
}

export default function SimulationWorkspace({
  intel,
  onNavigateToLiveMap,
  onNavigateToResponse
}: SimulationWorkspaceProps) {
  const scenario = intel?.scenario || {};
  const env = intel?.environmentalConditions || {};
  const zones: RiskZone[] = Array.isArray(intel?.zones) ? intel.zones : [];
  const nodes: InfrastructureNode[] = Array.isArray(intel?.nodes) ? intel.nodes : [];
  const edges: InfrastructureEdge[] = Array.isArray(intel?.edges) ? intel.edges : [];
  const failedIds: string[] = Array.isArray(scenario.failedInfrastructureIds) ? scenario.failedInfrastructureIds : [];
  const impact = intel?.networkImpact || { isolatedPopulation: 0, isolatedNodesCount: 0, criticalRouteFailures: 0 };
  const cascading = intel?.cascadingEffects || [];

  const presets = [
    { name: 'Baseline', icon: '🟢', label: 'Clear Weather Baseline', desc: 'Standard seasonal conditions' },
    { name: 'Heavy Rain', icon: '🌧️', label: 'Heavy Monsoon (+40%)', desc: 'Continuous rainfall with elevated pore pressure' },
    { name: 'Extreme Monsoon', icon: '⛈️', label: 'Extreme Monsoon (+80%)', desc: 'High risk of shallow translational landslides' },
    { name: 'Cloudburst', icon: '🌊', label: 'Flash Flood & Cloudburst (2.5x)', desc: 'Intense localized torrential downpour' },
    { name: 'Earthquake Trigger', icon: '⚡', label: 'M5.2 Seismic Trigger', desc: 'Ground shaking induces slope liquefaction' },
    { name: 'Bridge Collapse', icon: '🌉', label: 'Main Bailey Bridge Collapse', desc: 'Key valley access corridor severed' },
    { name: 'Catastrophic Cascade', icon: '🚨', label: 'Catastrophic Multi-Failure', desc: 'Compound debris flow + grid failure' }
  ];

  return (
    <div id="simulation-workspace" className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
              SCENARIO ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">
              STRESS TESTING &amp; WHAT-IF SIMULATION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sliders size={28} className="text-amber-400" />
            Disaster Scenario Simulation Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Simulate extreme rainfall, slope shear failures, and transit corridor destructions in real time. Observe compound network impact and Dijkstra re-routing changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="sim-reset-to-baseline-btn"
            onClick={() => intel?.resetSimulation()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Baseline</span>
          </button>

          <button
            id="sim-view-on-map-btn"
            onClick={() => onNavigateToLiveMap()}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
          >
            <Eye size={14} />
            <span>Inspect on Map</span>
          </button>
        </div>
      </div>

      {/* Scenario Presets Bar */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Quick Preset Scenarios
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {presets.map((p) => {
            const isActive = scenario.type === p.name || (!scenario.active && p.name === 'Baseline');
            return (
              <button
                key={p.name}
                id={`preset-btn-${p.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => intel?.applyScenarioPreset(p.name)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-950/60 border-amber-500/80 text-white shadow-md shadow-amber-950'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="text-lg mb-1">{p.icon}</div>
                <div className="font-bold text-xs truncate text-white">{p.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Impact Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Isolated Population</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-red-400">
              {(impact.isolatedPopulation || 0).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400">Civilians Cut Off</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {impact.isolatedNodesCount || 0} Settlements Stranded
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Impaired Road Corridors</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-amber-400">
              {failedIds.length}
            </span>
            <span className="text-xs font-mono text-slate-400">Routes Blocked</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {impact.criticalRouteFailures || 0} Key Lifelines Severed
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Simulation Multiplier</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-cyan-400">
              {(scenario.rainfallMultiplier || 1).toFixed(1)}x
            </span>
            <span className="text-xs font-mono text-slate-400">Rainfall Volume</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Soil Saturation: {(env.soilMoisture || 74).toFixed(0)}%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Emergency Dispatch Status</div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={onNavigateToResponse}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck size={15} />
              <span>Deploy Evacuation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Road Network Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Sliders */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders size={18} className="text-amber-400" />
              Dynamic Trigger Calibration
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tune parameters to test slope failure resilience
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">24-Hour Precipitation</span>
                <span className="text-cyan-400 font-bold">{(env.rainfall24h || 78).toFixed(1)} mm</span>
              </div>
              <input
                id="slider-rainfall24h"
                type="range"
                min="10"
                max="350"
                step="5"
                value={env.rainfall24h || 78}
                onChange={(e) => intel?.updateEnvironmentalVariable('rainfall24h', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Soil Moisture Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Soil Moisture Pore-Pressure</span>
                <span className="text-amber-400 font-bold">{(env.soilMoisture || 74).toFixed(0)}%</span>
              </div>
              <input
                id="slider-soil-moisture"
                type="range"
                min="20"
                max="100"
                step="1"
                value={env.soilMoisture || 74}
                onChange={(e) => intel?.updateEnvironmentalVariable('soilMoisture', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Ground Deformation Rate */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">Sentinel-1 InSAR Surface Creep</span>
                <span className="text-purple-400 font-bold">{(env.groundDeformationRateMm || 14.2).toFixed(1)} mm/mo</span>
              </div>
              <input
                id="slider-ground-deformation"
                type="range"
                min="1"
                max="80"
                step="1"
                value={env.groundDeformationRateMm || 14.2}
                onChange={(e) => intel?.updateEnvironmentalVariable('groundDeformationRateMm', parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Ground Vibration / Seismic */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300">NCS Seismic Peak Acceleration</span>
                <span className="text-red-400 font-bold">{(env.groundVibration || 1.2).toFixed(1)} g</span>
              </div>
              <input
                id="slider-ground-vibration"
                type="range"
                min="0"
                max="8"
                step="0.2"
                value={env.groundVibration || 1.2}
                onChange={(e) => intel?.updateEnvironmentalVariable('groundVibration', parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Infrastructure Impairment / Failure Grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-red-400" />
                Transit Corridors &amp; Bridges Blockade Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any bridge or ghat highway segment to simulate structural collapse or debris blockage
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">
              {edges.length} Monitored Segments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {edges.map((edge) => {
              const isFailed = failedIds.includes(edge.id);
              return (
                <div
                  key={edge.id}
                  onClick={() => intel?.simulateInfrastructureFailure(edge.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isFailed
                      ? 'bg-red-950/70 border-red-600 text-white shadow-md shadow-red-950'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isFailed ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                        }`}
                      ></span>
                      <span className="font-bold text-xs truncate text-white">{edge.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {edge.type.toUpperCase()} &bull; {edge.lengthKm || 4.2} km &bull; {edge.distance} mins transit
                    </div>
                  </div>

                  <button
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 transition-colors ${
                      isFailed
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {isFailed ? 'IMPAIRED' : 'OPERATIONAL'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cascading Effects Chain */}
      {cascading && cascading.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-400" />
            <h2 className="text-base font-bold text-white">Cascading Failure Impact Chain</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cascading.map((c: any, i: number) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-orange-400 font-mono">Phase {i + 1} Cascade</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-mono font-bold">
                    {c.severity || 'CRITICAL'}
                  </span>
                </div>
                <div className="font-bold text-xs text-white">{c.title || c.impact}</div>
                <p className="text-[11px] text-slate-400">{c.description || c.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
