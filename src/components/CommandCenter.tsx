import React from 'react';
import {
  AlertTriangle,
  Users,
  MapPin,
  Activity,
  ShieldAlert,
  FileText,
  Navigation,
  Sliders,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { AppMode, RiskZone } from '../types';

export default function CommandCenter({
  intel,
  onNavigateToMap
}: {
  intel: any;
  onNavigateToMap: (mode?: AppMode) => void;
}) {
  const activeAlerts = Array.isArray(intel?.alerts) ? intel.alerts.length : 0;
  
  let criticalZones = 0;
  let highRiskZones = 0;
  if (intel?.riskStates) {
    Object.values(intel.riskStates).forEach((rs: any) => {
      if (rs) {
        if (rs.currentRisk >= 75) criticalZones++;
        else if (rs.currentRisk >= 60) highRiskZones++;
      }
    });
  }

  const safeZones: RiskZone[] = Array.isArray(intel?.zones) ? intel.zones : [];
  const populationExposed = safeZones.reduce((sum: number, z: any) => {
    const risk = intel?.riskStates?.[z.id]?.currentRisk ?? 0;
    return sum + (risk > 50 ? (z.population || 0) : 0);
  }, 0);

  const isolationScore = intel?.networkImpact?.isolationScore ?? 0;
  const isolatedCommunities = intel?.networkImpact?.isolatedCommunities ?? 0;
  const isolatedPopulation = intel?.networkImpact?.isolatedPopulation ?? 0;

  const handleAlertClick = (alert: any) => {
    if (alert.zoneId) {
      intel?.setSelectedZoneId(alert.zoneId);
    }
    if (alert.type === 'ISOLATION_WARNING') {
      intel?.setActiveMode('RESPOND');
    } else {
      intel?.setActiveMode('LIVE');
    }
    onNavigateToMap();
  };

  const getRiskBadge = (risk: number) => {
    if (risk >= 75) return 'bg-red-950/90 text-red-400 border border-red-800 font-bold';
    if (risk >= 60) return 'bg-orange-950/90 text-orange-400 border border-orange-800 font-bold';
    if (risk >= 40) return 'bg-yellow-950/90 text-yellow-400 border border-yellow-800 font-medium';
    return 'bg-emerald-950/90 text-emerald-400 border border-emerald-800 font-medium';
  };

  return (
    <div id="command-center-dashboard" className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Quick Mode Launchers */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
              OPERATIONAL COMMAND
            </span>
            <span className="text-xs text-slate-500 font-mono">
              REGION: DARJEELING-KALIMPONG-KURSEONG HIMALAYA
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Disaster Intelligence Operations
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Multi-Source Landslide Prediction, Real-Time GIS Telemetry, and Dijkstra Evacuation Engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              intel?.setActiveMode('LIVE');
              onNavigateToMap('LIVE');
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
          >
            <Activity size={14} className="text-blue-400" />
            Live GIS
          </button>

          <button
            onClick={() => {
              intel?.setActiveMode('FORECAST');
              intel?.run24HForecast('Z-042');
              onNavigateToMap('FORECAST');
            }}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Sparkles size={14} />
            Run 24h Forecast
          </button>

          <button
            onClick={() => {
              intel?.setActiveMode('SIMULATE');
              onNavigateToMap('SIMULATE');
            }}
            className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-amber-600/20"
          >
            <Sliders size={14} />
            Simulate Disaster
          </button>

          <button
            onClick={() => {
              intel?.setActiveMode('RESPOND');
              onNavigateToMap('RESPOND');
            }}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
          >
            <ShieldCheck size={14} />
            Evacuation Plan
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Active Priority Alerts</span>
            <div className="p-1.5 bg-red-950/80 border border-red-900 text-red-400 rounded-lg">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{activeAlerts}</div>
          <p className="text-[11px] text-slate-500 mt-1">Real-time hazard notifications</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Critical Sectors</span>
            <div className="p-1.5 bg-orange-950/80 border border-orange-900 text-orange-400 rounded-lg">
              <MapPin size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-orange-400 font-mono">
            {criticalZones} <span className="text-xs font-normal text-slate-500">/ {safeZones.length} zones</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Risk index &ge; 75/100 threshold</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Population Exposed</span>
            <div className="p-1.5 bg-blue-950/80 border border-blue-900 text-blue-400 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-300 font-mono">
            {populationExposed.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Residents in elevated hazard corridors</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Isolation Impact</span>
            <div className="p-1.5 bg-purple-950/80 border border-purple-900 text-purple-400 rounded-lg">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-300 font-mono">
            {isolatedCommunities} <span className="text-xs font-normal text-slate-500">villages</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isolatedPopulation > 0 ? `${isolatedPopulation.toLocaleString()} citizens cut off` : 'All corridors currently accessible'}
          </p>
        </div>
      </div>

      {/* Main Grid: Monitored Sectors Table & Priority Response Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monitored Mountain Sectors Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-blue-400" />
                  Monitored Mountain Sectors
                </h3>
                <p className="text-xs text-slate-400">Deterministic risk indices across 7 active telemetry zones</p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                7 Active Sectors
              </span>
            </div>

            <div className="space-y-2">
              {safeZones.map(zone => {
                const rs = intel?.riskStates?.[zone.id] || { currentRisk: zone.staticSusceptibility, status: 'MODERATE' };
                const isSelected = intel?.selectedZoneId === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => {
                      intel?.setSelectedZoneId(zone.id);
                      onNavigateToMap();
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 shadow-md'
                        : 'bg-slate-950/80 hover:bg-slate-850 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {zone.id}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-white block">{zone.name}</span>
                        <span className="text-[11px] text-slate-400">
                          Pop: {zone.population.toLocaleString()} • Slope: {zone.environmentalFeatures.slope}°
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-white block">
                          {rs.currentRisk}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          +24h: {rs.forecast?.t24 ?? rs.currentRisk}%
                        </span>
                      </div>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${getRiskBadge(rs.currentRisk)}`}>
                        {rs.status || 'MODERATE'}
                      </span>
                      <ArrowRight size={14} className="text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority Response Queue & Clickable Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-400" />
                  Priority Response Queue
                </h3>
                <p className="text-xs text-slate-400">Click any alert to zoom and open analysis</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                LIVE ALERTS
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {Array.isArray(intel?.alerts) && intel.alerts.map((a: any, i: number) => (
                <div
                  key={a.id || i}
                  onClick={() => handleAlertClick(a)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 p-3.5 rounded-lg cursor-pointer transition-all flex items-start gap-3 group"
                >
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${a.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-900' : 'bg-orange-950 text-orange-400 border border-orange-900'}`}>
                    <AlertTriangle size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-200 text-xs group-hover:text-blue-300 transition-colors">
                        {a.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
                        {a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {a.description}
                    </p>
                    <span className="text-[10px] text-blue-400 font-semibold mt-1.5 inline-flex items-center gap-1 group-hover:underline">
                      Inspect Sector on GIS Map →
                    </span>
                  </div>
                </div>
              ))}

              {(!intel?.alerts || intel.alerts.length === 0) && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  All monitored mountain corridors operating within baseline safety limits.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Demo Workflow & Guided Exploration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-2">
            <Sparkles size={15} className="text-blue-400" />
            Interactive Disaster Intelligence Lifecycle (Detect → Predict → Simulate → Respond)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">10-Step Operational Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
            <span className="font-mono text-blue-400 font-bold block text-[10px] uppercase">1. DETECT</span>
            <p className="text-slate-300 font-semibold mt-0.5">Location Selection &amp; GIS</p>
            <p className="text-slate-500 text-[11px] mt-1">Select Tista Valley Sector A (Z-042) to inspect real-time risk.</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
            <span className="font-mono text-indigo-400 font-bold block text-[10px] uppercase">2. PREDICT</span>
            <p className="text-slate-300 font-semibold mt-0.5">24h Forecast Engine</p>
            <p className="text-slate-500 text-[11px] mt-1">Click [24h Forecast] to run the 8-step predictive diagnostic model.</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
            <span className="font-mono text-amber-400 font-bold block text-[10px] uppercase">3. SIMULATE</span>
            <p className="text-slate-300 font-semibold mt-0.5">What-If Disaster Cascades</p>
            <p className="text-slate-500 text-[11px] mt-1">Apply "Heavy Rainfall" or fail Bridge B-17 to test network isolation.</p>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
            <span className="font-mono text-emerald-400 font-bold block text-[10px] uppercase">4. RESPOND</span>
            <p className="text-slate-300 font-semibold mt-0.5">Dijkstra Evacuation</p>
            <p className="text-slate-500 text-[11px] mt-1">Inspect shortest safe evacuation routes and mountain relief shelters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
