import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldAlert,
  BarChart2,
  Activity,
  Users,
  Mountain,
  Zap,
  HelpCircle,
  Sliders,
  Compass,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Navigation,
  ShieldCheck,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RiskZone, RiskState } from '../types';

export default function LocationIntelligence({
  intel,
  onClose
}: {
  intel: any;
  onClose: () => void;
}) {
  const zones: RiskZone[] = Array.isArray(intel?.zones) ? intel.zones : [];
  const selectedZoneId: string | null = intel?.selectedZoneId;
  const zone: RiskZone | undefined = zones.find(z => z.id === selectedZoneId);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EXPLANATION' | 'HISTORY'>('OVERVIEW');

  const getRiskColor = (risk: number) => {
    if (risk >= 75) return '#ef4444';
    if (risk >= 60) return '#f97316';
    if (risk >= 40) return '#eab308';
    return '#10b981';
  };

  const getRiskBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border border-red-800/80';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border border-orange-800/80';
      case 'MODERATE':
        return 'bg-yellow-950/80 text-yellow-400 border border-yellow-800/80';
      default:
        return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80';
    }
  };

  // -------------------------------------------------------------
  // If NO zone is selected, render the LIVE MONITORING OVERVIEW panel
  // -------------------------------------------------------------
  if (!zone) {
    let criticalZonesCount = 0;
    let highRiskZonesCount = 0;
    if (intel?.riskStates) {
      Object.values(intel.riskStates).forEach((rs: any) => {
        if (rs) {
          if (rs.currentRisk >= 75) criticalZonesCount++;
          else if (rs.currentRisk >= 60) highRiskZonesCount++;
        }
      });
    }

    const activeAlerts = Array.isArray(intel?.alerts) ? intel.alerts.length : 0;

    return (
      <div id="location-intelligence-panel" className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-start shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.5 rounded">
                TELEMETRY NETWORK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-semibold uppercase">
                LIVE SENSORS
              </span>
            </div>
            <h2 className="font-bold text-lg text-white mt-1 flex items-center gap-2">
              <Activity size={18} className="text-blue-400" />
              Live Monitoring
            </h2>
            <p className="text-xs text-slate-400">
              Real-time regional telemetry &amp; sensor feeds
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

        {/* Overview Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Active Alerts</span>
              <div className="text-xl font-extrabold font-mono text-red-400 mt-1">{activeAlerts}</div>
              <span className="text-[9px] text-slate-500">Live Warnings</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Critical Zones</span>
              <div className="text-xl font-extrabold font-mono text-orange-400 mt-1">{criticalZonesCount}</div>
              <span className="text-[9px] text-slate-500">&ge; 75/100 Risk</span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">High Risk Zones</span>
              <div className="text-xl font-extrabold font-mono text-amber-400 mt-1">{highRiskZonesCount}</div>
              <span className="text-[9px] text-slate-500">&ge; 60/100 Risk</span>
            </div>
          </div>

          {/* Prompt */}
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-200 flex items-center gap-2.5">
            <Compass size={18} className="text-blue-400 shrink-0" />
            <p className="leading-relaxed">
              Select any monitored zone on the map or from the list below to inspect its live geological condition.
            </p>
          </div>

          {/* Monitored Zones Quick Select List */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
                <Mountain size={14} className="text-blue-400" />
                Monitored Mountain Sectors ({zones.length})
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Click to inspect</span>
            </div>

            <div className="space-y-1.5">
              {zones.map(z => {
                const rs = intel?.riskStates?.[z.id] || { currentRisk: z.staticSusceptibility, status: 'MODERATE' };
                return (
                  <div
                    key={z.id}
                    onClick={() => intel?.setSelectedZoneId(z.id)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {z.id}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{z.name}</span>
                        <span className="text-[10px] text-slate-400">Pop: {z.population.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{rs.currentRisk}%</span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${getRiskBadge(rs.status || 'MODERATE')}`}>
                        {rs.status || 'MOD'}
                      </span>
                      <ArrowRight size={13} className="text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // If a zone IS selected, render the ZONE INSPECTION & TELEMETRY
  // -------------------------------------------------------------
  const state: RiskState = intel?.riskStates?.[zone.id] || {
    currentRisk: zone.staticSusceptibility || 50,
    triggerScore: 50,
    momentum: 0,
    hazardWindow: ['--', '--'] as [string, string],
    forecast: { t6: 50, t12: 50, t24: 50, t48: 50 },
    confidence: 88,
    primaryDriver: 'Slope Susceptibility',
    featureContributions: [],
    explanation: 'Risk is at baseline equilibrium.',
    status: 'MODERATE'
  };

  const env = zone.environmentalFeatures || {
    elevation: 2042,
    slope: 38,
    aspect: 'South-East',
    terrainRuggedness: 8.4,
    landCover: 'Degraded Forest Slopes',
    ndviChange: -0.12,
    drainage: 'High Convergence'
  };

  const chartData = [
    { time: 'T-24h', risk: Math.max(10, (state.currentRisk ?? 50) - 22) },
    { time: 'T-6h', risk: Math.max(15, (state.currentRisk ?? 50) - 10) },
    { time: 'Now', risk: state.currentRisk ?? 50 },
    { time: '+6h', risk: state.forecast?.t6 ?? 50 },
    { time: '+12h', risk: state.forecast?.t12 ?? 50 },
    { time: '+24h', risk: state.forecast?.t24 ?? 50 },
    { time: '+48h', risk: state.forecast?.t48 ?? 50 }
  ];

  return (
    <div id="location-intelligence-panel" className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.5 rounded">
              {zone.id}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getRiskBadge(state.status || 'MODERATE')}`}>
              {state.status || 'MODERATE'} RISK
            </span>
          </div>
          <h2 className="font-bold text-lg text-white mt-1">{zone.name}</h2>
          <p className="text-xs text-slate-400 font-mono">
            {zone.coordinates?.[0]?.toFixed(4)}°N, {zone.coordinates?.[1]?.toFixed(4)}°E • Elev: {env.elevation}m ASL
          </p>
        </div>
        <button
          onClick={() => intel?.setSelectedZoneId(null)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Deselect zone"
        >
          <X size={18} />
        </button>
      </div>

      {/* Primary Action Buttons: FORECAST | SIMULATE | RESPOND */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            intel?.setSelectedZoneId(zone.id);
            intel?.setActiveMode('FORECAST');
            intel?.run24HForecast(zone.id);
          }}
          className="py-2 px-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
        >
          <Zap size={13} />
          Forecast
        </button>

        <button
          onClick={() => {
            intel?.setSelectedZoneId(zone.id);
            intel?.setActiveMode('SIMULATE');
          }}
          className="py-2 px-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
        >
          <Sliders size={13} />
          Simulate
        </button>

        <button
          onClick={() => {
            intel?.setSelectedZoneId(zone.id);
            intel?.setActiveMode('RESPOND');
          }}
          className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
        >
          <ShieldCheck size={13} />
          Respond
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Dynamic Risk Score Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-md">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Current Risk</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono" style={{ color: getRiskColor(state.currentRisk ?? 50) }}>
                {state.currentRisk ?? 50}
              </span>
              <span className="text-slate-500 text-xs font-mono">/ 100</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium">
              {(state.momentum ?? 0) > 0 ? (
                <span className="text-red-400 flex items-center">
                  <TrendingUp size={12} className="mr-0.5 inline" /> +{state.momentum} escalating
                </span>
              ) : (
                <span className="text-slate-400">→ Stable equilibrium</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-md">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">24h Forecast Risk</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-white">
                {state.forecast?.t24 ?? 50}
              </span>
              <span className="text-slate-500 text-xs font-mono">/ 100</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400 truncate">
              Peak: {Math.max(state.currentRisk, state.forecast?.t6 || 0, state.forecast?.t12 || 0, state.forecast?.t24 || 0)}%
            </div>
          </div>
        </div>

        {/* Primary Driver & Explanation */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-md space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Primary Risk Driver</span>
            <span className="text-xs font-bold text-amber-300 font-mono">{state.primaryDriver}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {state.explanation}
          </p>
        </div>

        {/* Environmental Telemetry */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-md space-y-2.5">
          <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
            <Compass size={14} className="text-blue-400" />
            Environmental Feeds
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Slope Angle</span>
              <span className="font-bold text-white font-mono">{env.slope}°</span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Exposed Pop.</span>
              <span className="font-bold text-white font-mono">{zone.population?.toLocaleString()}</span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Terrain Ruggedness</span>
              <span className="font-bold text-white font-mono">{env.terrainRuggedness}/10</span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Drainage Runoff</span>
              <span className="font-bold text-white">{env.drainage}</span>
            </div>
          </div>
        </div>

        {/* Mini Trajectory Chart */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-300">Risk Timeline Evolution</span>
            <span className="text-[10px] font-mono text-slate-500">T-24h to +48h</span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#liveGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
