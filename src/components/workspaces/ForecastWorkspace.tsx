import React, { useState } from 'react';
import {
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
  Sparkles,
  MapPin,
  HelpCircle,
  Eye,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import { RiskZone, RiskState, AppView } from '../../types';

interface ForecastWorkspaceProps {
  intel: any;
  onNavigateToLiveMap: (zoneId?: string) => void;
}

export default function ForecastWorkspace({ intel, onNavigateToLiveMap }: ForecastWorkspaceProps) {
  const zones: RiskZone[] = Array.isArray(intel?.zones) ? intel.zones : [];
  const selectedZoneId: string = intel?.selectedZoneId || 'Z-WAY-01';
  const selectedZone: RiskZone = zones.find((z) => z.id === selectedZoneId) || zones[0] || {
    id: 'Z-WAY-01',
    name: 'Chooralmala-Meppadi Escarpment',
    state: 'Kerala',
    district: 'Wayanad',
    hillRange: 'Western Ghats',
    staticSusceptibility: 88,
    population: 4800,
    environmentalFeatures: {
      elevation: 1450,
      slope: 41,
      aspect: 'South-West',
      terrainRuggedness: 8.8,
      landCover: 'Tea Plantations & Escarpments',
      ndviChange: -0.24,
      drainage: 'Very High Runoff',
      lithology: 'Charnockite & Gneiss Complex',
      gsiSusceptibilityClass: 'Very High'
    }
  };

  const riskState: RiskState = intel?.riskStates?.[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 75,
    baselineSusceptibility: selectedZone.staticSusceptibility || 75,
    triggerScore: 72,
    momentum: 6,
    hazardWindow: ['14:00', '20:00'] as [string, string],
    forecast: { t6: 78, t12: 83, t24: 89, t48: 82 },
    confidence: 91,
    dataCoverage: 88,
    primaryDriver: 'IMD Rain Anomaly & Soil Saturation',
    featureContributions: [],
    explanation: 'Risk escalates significantly within 24h due to sustained precipitation accumulation on steep terrain.',
    status: 'CRITICAL',
    dataSourcesUsed: []
  };

  const currentRisk = riskState.currentRisk ?? 75;
  const t6 = riskState.forecast?.t6 ?? Math.min(100, currentRisk + 3);
  const t12 = riskState.forecast?.t12 ?? Math.min(100, currentRisk + 7);
  const t24 = riskState.forecast?.t24 ?? Math.min(100, currentRisk + 14);
  const t48 = riskState.forecast?.t48 ?? Math.min(100, currentRisk + 6);
  const peakRisk = Math.max(currentRisk, t6, t12, t24, t48);

  const getRiskColor = (val: number) => {
    if (val >= 80) return '#ef4444';
    if (val >= 65) return '#f97316';
    if (val >= 50) return '#eab308';
    return '#10b981';
  };

  const chartData = [
    { time: 'T-24h', risk: Math.max(10, currentRisk - 22), rainfall: 18, soilMoisture: 48 },
    { time: 'T-6h', risk: Math.max(15, currentRisk - 10), rainfall: 35, soilMoisture: 62 },
    { time: 'NOW', risk: currentRisk, rainfall: intel?.environmentalConditions?.rainfall24h || 78, soilMoisture: intel?.environmentalConditions?.soilMoisture || 74 },
    { time: '+6h', risk: t6, rainfall: Math.round((intel?.environmentalConditions?.rainfall24h || 78) * 1.25), soilMoisture: Math.min(95, (intel?.environmentalConditions?.soilMoisture || 74) + 8) },
    { time: '+12h', risk: t12, rainfall: Math.round((intel?.environmentalConditions?.rainfall24h || 78) * 1.45), soilMoisture: Math.min(98, (intel?.environmentalConditions?.soilMoisture || 74) + 14) },
    { time: '+24h', risk: t24, rainfall: Math.round((intel?.environmentalConditions?.rainfall24h || 78) * 1.6), soilMoisture: Math.min(100, (intel?.environmentalConditions?.soilMoisture || 74) + 18) },
    { time: '+48h', risk: t48, rainfall: Math.round((intel?.environmentalConditions?.rainfall24h || 78) * 1.3), soilMoisture: Math.min(92, (intel?.environmentalConditions?.soilMoisture || 74) + 10) }
  ];

  return (
    <div id="forecast-workspace" className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              PREDICTIVE ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">
              24H &amp; 48H MULTI-SOURCE FORECAST
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp size={28} className="text-cyan-400" />
            Landslide Hazard Forecasting Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Simulates dynamic trigger trajectory (Precipitation accumulation, Soil pore-pressure buildup, and Sentinel-1 InSAR creep rate) against GSI 1:50,000 baseline terrain fragility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Target Zone Selector */}
          <select
            id="forecast-target-zone-select"
            value={selectedZone.id}
            onChange={(e) => {
              intel?.setSelectedZoneId(e.target.value);
              intel?.run24HForecast(e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.state})
              </option>
            ))}
          </select>

          {/* Run Diagnostic Forecast Button */}
          <button
            id="run-forecast-analysis-btn"
            onClick={() => intel?.run24HForecast(selectedZone.id)}
            disabled={intel?.predictionLoading}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/30 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={15} className={intel?.predictionLoading ? 'animate-spin' : ''} />
            <span>{intel?.predictionLoading ? 'Computing Diagnostics...' : 'Run 24h Diagnostic'}</span>
          </button>

          {/* Inspect on Live Map */}
          <button
            id="inspect-forecast-live-map-btn"
            onClick={() => onNavigateToLiveMap(selectedZone.id)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <Eye size={14} className="text-blue-400" />
            <span>View on Map</span>
          </button>
        </div>
      </div>

      {/* Real-Time Processing Diagnostic Banner */}
      {intel?.predictionLoading && (
        <div className="bg-cyan-950/70 border border-cyan-800 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-300">DIAGNOSTIC PIPELINE IN PROGRESS</div>
            <div className="text-xs text-cyan-200 font-mono mt-0.5">{intel.predictionStep || 'PROCESSING FUSION MATRIX...'}</div>
          </div>
        </div>
      )}

      {/* Target Zone KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Current Composite Risk</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono" style={{ color: getRiskColor(currentRisk) }}>
              {currentRisk}%
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {riskState.status || 'HIGH'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Static GSI Baseline: {selectedZone.staticSusceptibility}%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Projected Peak Risk (T+24h)</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono" style={{ color: getRiskColor(t24) }}>
              {t24}%
            </span>
            <span className={`text-xs font-mono font-bold ${t24 >= currentRisk ? 'text-red-400' : 'text-emerald-400'}`}>
              {t24 >= currentRisk ? `+${t24 - currentRisk}%` : `${t24 - currentRisk}%`}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Momentum: +{riskState.momentum || 6} pts/6h
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Critical Hazard Window</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 flex items-center gap-1.5">
            <Clock size={16} />
            {riskState.hazardWindow ? `${riskState.hazardWindow[0]} - ${riskState.hazardWindow[1]}` : '14:00 - 22:00 IST'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            High pore-pressure saturation window
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Model Consensus &amp; Confidence</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-emerald-400">
              {riskState.confidence || 91}%
            </span>
            <span className="text-xs font-mono text-slate-400">6 Feeds Active</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Data Coverage: {riskState.dataCoverage || 88}%
          </div>
        </div>
      </div>

      {/* Forecast Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 48-Hour Multi-Parameter Hazard Curve */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-cyan-400" />
                48-Hour Multi-Parameter Evolution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic curve tracking Risk %, Precipitation (mm), and Soil Saturation (%)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-1 bg-cyan-400 rounded"></span> Risk (%)
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-1 bg-blue-500 rounded"></span> Rain (mm)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-1 bg-amber-500 rounded"></span> Soil (%)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#riskGrad)" name="Risk Score" />
                <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Precipitation (mm)" />
                <Line type="monotone" dataKey="soilMoisture" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Soil Moisture (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Primary Driver Decomposition */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders size={18} className="text-amber-400" />
              Primary Risk Drivers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explainable feature weights for {selectedZone.name}
            </p>
          </div>

          <div className="space-y-3 my-auto">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">24h Precip + Anomaly</span>
                <span className="text-cyan-400 font-bold">35%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">GSI Baseline Susceptibility</span>
                <span className="text-red-400 font-bold">30%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Soil Moisture Pore-Pressure</span>
                <span className="text-amber-400 font-bold">15%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Slope &amp; Geomorphology (41°)</span>
                <span className="text-emerald-400 font-bold">10%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Sentinel-1 InSAR Surface Creep</span>
                <span className="text-purple-400 font-bold">5%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">NCS Seismology Proximity</span>
                <span className="text-indigo-400 font-bold">5%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-white font-mono">Expert Synthesis: </span>
            {riskState.explanation}
          </div>
        </div>
      </div>

      {/* Multi-Zone Comparative Grid */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass size={18} className="text-blue-400" />
              Pan-India 24H Projected Landslide Risk by Sector
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative escalation matrix across all active mountain observation zones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {zones.map((z) => {
            const zRisk = intel?.riskStates?.[z.id]?.currentRisk ?? z.staticSusceptibility;
            const zForecast = intel?.riskStates?.[z.id]?.forecast?.t24 ?? Math.min(100, zRisk + 10);
            const isSelected = z.id === selectedZone.id;
            return (
              <div
                key={z.id}
                onClick={() => {
                  intel?.setSelectedZoneId(z.id);
                  intel?.run24HForecast(z.id);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-cyan-500/80 shadow-md shadow-cyan-950'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400 uppercase font-bold truncate">
                    {z.district}, {z.state}
                  </span>
                  <span
                    className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold"
                    style={{
                      backgroundColor: `${getRiskColor(zForecast)}20`,
                      color: getRiskColor(zForecast),
                      border: `1px solid ${getRiskColor(zForecast)}40`
                    }}
                  >
                    T+24h: {zForecast}%
                  </span>
                </div>
                <div className="font-bold text-xs text-white truncate">{z.name}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <span>Current: {zRisk}%</span>
                  <span className={zForecast >= zRisk ? 'text-red-400' : 'text-emerald-400'}>
                    &Delta; {zForecast >= zRisk ? `+${zForecast - zRisk}` : `${zForecast - zRisk}`} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
