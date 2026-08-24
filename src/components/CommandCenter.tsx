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
  ShieldCheck,
  Mountain,
  Satellite,
  CloudRain,
  Database,
  Crosshair,
  HelpCircle
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
    if (risk >= 80) return 'bg-red-950/90 text-red-400 border border-red-800 font-bold';
    if (risk >= 65) return 'bg-orange-950/90 text-orange-400 border border-orange-800 font-bold';
    if (risk >= 50) return 'bg-yellow-950/90 text-yellow-400 border border-yellow-800 font-medium';
    return 'bg-emerald-950/90 text-emerald-400 border border-emerald-800 font-medium';
  };

  // Group zones by Hill Range
  const hillRangeGroups = [
    { range: 'Western Ghats', state: 'Kerala / Karnataka / Maharashtra / TN', icon: '🌿' },
    { range: 'Garhwal & Kumaon Himalaya', state: 'Uttarakhand', icon: '🏔️' },
    { range: 'Pir Panjal & Dhauladhar', state: 'Himachal Pradesh', icon: '⛰️' },
    { range: 'Eastern Himalaya & Darjeeling', state: 'Sikkim / West Bengal', icon: '🌲' },
    { range: 'Northeastern Hills', state: 'Meghalaya / Mizoram / Assam / Nagaland', icon: '🌧️' }
  ];

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
              NATIONAL GEOSPATIAL HAZARD GRID
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Pan-India Disaster Management Platform
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Real-time multi-source data fusion (IMD AWS, Sentinel-1 InSAR, NCS Seismology, GSI NLSM baseline, NRSC Atlas) with Dijkstra isolation routing and Citizen Ground Reporting.
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
            Live GIS Map
          </button>

          <button
            onClick={() => {
              intel?.setActiveMode('FORECAST');
              intel?.run24HForecast(intel?.selectedZoneId || 'Z-WAY-01');
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
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Exposed Population</span>
            <div className="p-1.5 bg-blue-950/80 border border-blue-900 text-blue-400 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {populationExposed.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Residents in moderate/high sectors</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Isolated Settlements</span>
            <div className="p-1.5 bg-purple-950/80 border border-purple-900 text-purple-400 rounded-lg">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            {isolatedCommunities} <span className="text-xs font-normal text-slate-500">({isolatedPopulation.toLocaleString()} pop)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Zero traversable road corridors</p>
        </div>
      </div>

      {/* Main Grid: Priority Alerts (Left) + Hill Ranges Directory (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Alerts Feed */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h2 className="text-base font-bold text-white">Live Hazard Alerts & Seismic Triggers</h2>
            </div>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {intel?.alerts?.length || 0} active
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {intel?.alerts && intel.alerts.length > 0 ? (
              intel.alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        alert.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-orange-950 text-orange-400 border-orange-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Source: {alert.source || 'Data Fusion Engine'} • {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold">
                    <span>Inspect Sector</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No critical hazard alerts active at this moment.
              </div>
            )}
          </div>
        </div>

        {/* Pan-India Hill Range Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Mountain size={18} className="text-blue-400" />
              <h2 className="text-base font-bold text-white">Mountain Belts & Sectors</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">{safeZones.length} Sectors</span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {safeZones.map(zone => {
              const rs = intel?.riskStates?.[zone.id] || { currentRisk: zone.staticSusceptibility, status: 'MODERATE' };
              return (
                <div
                  key={zone.id}
                  onClick={() => {
                    intel?.setSelectedZoneId(zone.id);
                    intel?.setActiveMode('LIVE');
                    onNavigateToMap('LIVE');
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-white">{zone.name}</h3>
                    <p className="text-[11px] text-slate-400">{zone.district}, {zone.state} ({zone.hillRange})</p>
                    <p className="text-[10px] text-slate-500">Pop: {zone.population?.toLocaleString()} • Slope: {zone.environmentalFeatures.slope}°</p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block text-xs font-mono font-bold px-2 py-0.5 rounded border ${getRiskBadge(rs.currentRisk)}`}>
                      {rs.currentRisk}%
                    </span>
                    <span className="block text-[9px] text-slate-500 uppercase mt-0.5">
                      {rs.status}
                    </span>
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
