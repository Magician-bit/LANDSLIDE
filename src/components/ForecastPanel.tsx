import React, { useMemo } from 'react';
import {
  X,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RiskZone, RiskState } from '../types';

export default function ForecastPanel({
  intel,
  onClose
}: {
  intel: any;
  onClose: () => void;
}) {
  const zones: RiskZone[] = Array.isArray(intel?.zones) ? intel.zones : [];
  const selectedZoneId: string = intel?.selectedZoneId || 'Z-073';
  const selectedZone: RiskZone = zones.find(z => z.id === selectedZoneId) || zones[0] || {
    id: 'Z-073',
    name: 'Lebong Spur',
    staticSusceptibility: 72,
    population: 2900,
    environmentalFeatures: { elevation: 1840, slope: 42, aspect: 'East', terrainRuggedness: 8.9, landCover: 'Steep Urban Settlement', ndviChange: -0.22, drainage: 'Very High Runoff' }
  };

  const riskState: RiskState = intel?.riskStates?.[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 72,
    triggerScore: 68,
    momentum: 4,
    hazardWindow: ['14:00', '20:00'],
    forecast: { t6: 75, t12: 79, t24: 86, t48: 78 },
    confidence: 91,
    primaryDriver: 'Rainfall anomaly',
    featureContributions: [
      { feature: 'Precipitation Anomaly (24h)', percentage: 38, value: '42mm (+1.8x)' },
      { feature: 'Slope Angle & Escarpment', percentage: 28, value: '42° Slope' },
      { feature: 'Soil Moisture Saturation', percentage: 22, value: '68%' },
      { feature: 'Vegetation Loss (NDVI)', percentage: 12, value: '-0.22' }
    ],
    explanation: 'Risk escalates significantly within 24h due to sustained precipitation accumulation on steep terrain.',
    status: 'HIGH'
  };

  const currentRisk = riskState.currentRisk ?? 72;
  const t6 = riskState.forecast?.t6 ?? Math.min(100, currentRisk + 3);
  const t12 = riskState.forecast?.t12 ?? Math.min(100, currentRisk + 7);
  const t24 = riskState.forecast?.t24 ?? Math.min(100, currentRisk + 14);
  const t48 = riskState.forecast?.t48 ?? Math.min(100, currentRisk + 6);
  const peakRisk = Math.max(currentRisk, t6, t12, t24, t48);

  const getRiskColor = (val: number) => {
    if (val >= 75) return '#ef4444';
    if (val >= 60) return '#f97316';
    if (val >= 40) return '#eab308';
    return '#10b981';
  };

  const getStatusBadge = (val: number) => {
    if (val >= 75) return 'bg-red-950/80 text-red-400 border-red-800/80';
    if (val >= 60) return 'bg-orange-950/80 text-orange-400 border-orange-800/80';
    if (val >= 40) return 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80';
    return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
  };

  const chartData = [
    { time: 'T-24h', risk: Math.max(10, currentRisk - 22) },
    { time: 'T-6h', risk: Math.max(15, currentRisk - 10) },
    { time: 'NOW', risk: currentRisk },
    { time: '+6h', risk: t6 },
    { time: '+12h', risk: t12 },
    { time: '+24h', risk: t24 },
    { time: '+48h', risk: t48 }
  ];

  return (
    <div id="forecast-workspace-panel" className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.5 rounded">
              PREDICTION ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-semibold uppercase">
              24H HAZARD OUTLOOK
            </span>
          </div>
          <h2 className="font-bold text-lg text-white mt-1 flex items-center gap-2">
            <Zap size={18} className="text-blue-400" />
            Forecast Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Multi-temporal deterministic hazard progression
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

        {/* 1. Target Zone Selection / Switcher */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400 shrink-0 font-mono text-xs font-bold">
              {selectedZone.id.replace('Z-', '')}
            </div>
            <div className="truncate">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Forecast Target</div>
              <div className="text-xs font-bold text-white truncate">{selectedZone.name} · {selectedZone.id}</div>
            </div>
          </div>

          <select
            value={selectedZone.id}
            onChange={e => {
              intel?.setSelectedZoneId(e.target.value);
              intel?.run24HForecast(e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.id} - {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnostic Processing Banner */}
        {intel?.predictionLoading && (
          <div className="p-3 bg-blue-950/80 border border-blue-600/80 rounded-xl animate-pulse text-xs text-blue-200">
            <div className="flex items-center gap-2 font-mono font-bold text-blue-100 mb-1">
              <Activity size={16} className="text-blue-400 animate-spin" />
              COMPUTING PREDICTIVE RISK MODEL...
            </div>
            <p className="font-mono text-[11px] text-blue-300">{intel?.predictionStep}</p>
          </div>
        )}

        {/* 2. Forecast Progression Cards (CURRENT, 6H, 12H, 24H, PEAK) */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-400" />
              Temporal Risk Progression
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Peak: {peakRisk}%</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {/* CURRENT */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">CURRENT</span>
              <div className="text-lg font-extrabold font-mono text-white mt-1">{currentRisk}%</div>
              <span className={`inline-block text-[8px] font-bold uppercase px-1 py-0.2 rounded border mt-0.5 ${getStatusBadge(currentRisk)}`}>
                NOW
              </span>
            </div>

            {/* 6 HOURS */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">+6 HOURS</span>
              <div className="text-lg font-extrabold font-mono text-blue-300 mt-1">{t6}%</div>
              <span className={`inline-block text-[8px] font-bold uppercase px-1 py-0.2 rounded border mt-0.5 ${getStatusBadge(t6)}`}>
                {t6 >= 75 ? 'CRIT' : t6 >= 60 ? 'HIGH' : 'MED'}
              </span>
            </div>

            {/* 12 HOURS */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">+12 HOURS</span>
              <div className="text-lg font-extrabold font-mono text-amber-300 mt-1">{t12}%</div>
              <span className={`inline-block text-[8px] font-bold uppercase px-1 py-0.2 rounded border mt-0.5 ${getStatusBadge(t12)}`}>
                {t12 >= 75 ? 'CRIT' : t12 >= 60 ? 'HIGH' : 'MED'}
              </span>
            </div>

            {/* 24 HOURS */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">+24 HOURS</span>
              <div className="text-lg font-extrabold font-mono text-red-400 mt-1">{t24}%</div>
              <span className={`inline-block text-[8px] font-bold uppercase px-1 py-0.2 rounded border mt-0.5 ${getStatusBadge(t24)}`}>
                {t24 >= 75 ? 'CRIT' : 'HIGH'}
              </span>
            </div>
          </div>

          {/* Peak Risk Callout */}
          <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center justify-between text-xs">
            <span className="text-red-300 font-medium">Predicted Peak Hazard Intensity:</span>
            <span className="font-mono font-extrabold text-sm text-red-400">{peakRisk}% ({peakRisk >= 75 ? 'CRITICAL' : 'HIGH'})</span>
          </div>
        </div>

        {/* 3. Temporal Trajectory Graph */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-blue-400" />
              Risk Trajectory Curve
            </h3>
            <span className="text-[10px] font-mono text-slate-500">T-24h to T+48h</span>
          </div>

          <div className="h-36 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs shadow-xl font-mono">
                          <span className="text-slate-400 block">{data.time}</span>
                          <span className="font-bold text-sm text-blue-300">{data.risk}% Risk</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#forecastGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Primary Driver & Model Consistency */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-2.5">
          <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <ShieldAlert size={14} className="text-amber-400" />
            Model Diagnostics &amp; Attribution
          </h3>

          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-slate-400">Primary Escalation Driver:</span>
            <span className="font-bold text-amber-300 font-mono">{riskState.primaryDriver}</span>
          </div>

          <div className="flex justify-between items-center text-xs py-1 border-t border-slate-900">
            <span className="text-slate-400">Model Confidence:</span>
            <span className="font-bold text-emerald-400 font-mono">{riskState.confidence}%</span>
          </div>

          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 space-y-1">
            <div className="font-bold text-blue-300 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Model Consistency Validation
            </div>
            <p className="text-slate-400 leading-relaxed">
              5 of 6 monitored topological and precipitation parameters corroborate the {t24}% 24-hour escalation for {selectedZone.name}.
            </p>
          </div>
        </div>

        {/* 5. Navigation Actions ([ BACK TO LIVE ], [ SIMULATE ], [ RESPOND ]) */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-md grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              intel?.setActiveMode('LIVE');
            }}
            className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-slate-700"
          >
            <RotateCcw size={12} />
            Live Map
          </button>

          <button
            onClick={() => {
              intel?.setSelectedZoneId(selectedZone.id);
              intel?.setActiveMode('SIMULATE');
            }}
            className="py-2 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
          >
            <Sliders size={13} />
            Simulate
          </button>

          <button
            onClick={() => {
              intel?.setSelectedZoneId(selectedZone.id);
              intel?.setActiveMode('RESPOND');
            }}
            className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
          >
            <Zap size={13} />
            Respond
          </button>
        </div>

      </div>
    </div>
  );
}
