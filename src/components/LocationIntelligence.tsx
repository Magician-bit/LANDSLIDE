import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Clock, ShieldAlert, BarChart2, Activity, Users, Camera, Mountain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LocationIntelligence({ intel, onClose }: { intel: any; onClose: () => void }) {
  const zone = intel?.zones?.find((z: any) => z.id === intel.selectedZoneId);
  const state = intel?.riskStates?.[intel.selectedZoneId] || {
    currentRisk: zone?.staticSusceptibility || 50,
    triggerScore: 50,
    momentum: 0,
    hazardWindow: ['--', '--'] as [string, string],
    forecast: { t6: 50, t12: 50, t24: 50 },
    confidence: 85,
    primaryDriver: 'Slope Susceptibility',
    featureContributions: []
  };

  const [showImage, setShowImage] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!zone) return null;

  const chartData = [
    { time: 'Now', risk: state.currentRisk ?? 50 },
    { time: '+6h', risk: state.forecast?.t6 ?? 50 },
    { time: '+12h', risk: state.forecast?.t12 ?? 50 },
    { time: '+24h', risk: state.forecast?.t24 ?? 50 },
  ];

  const getRiskColor = (risk: number) => {
    if (risk > 80) return 'text-red-500';
    if (risk > 60) return 'text-orange-500';
    if (risk > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const reports = Array.isArray(intel?.reports)
    ? intel.reports.filter((r: any) => r && r.zoneId === zone.id)
    : [];

  const env = zone.environmentalFeatures || {
    elevation: 2000,
    slope: 35,
    aspect: 'South',
    terrainRuggedness: 8,
    landCover: 'Forest Slopes',
    ndviChange: -0.1,
    drainage: 'High Convergence'
  };

  // Safe image path
  const imageSrc = `${import.meta.env.BASE_URL}images/locations/${zone.id}.svg`;

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/60">
        <div>
          <h2 className="font-bold text-lg text-slate-100">{zone.name}</h2>
          <p className="text-xs text-slate-400 font-mono">{zone.id} | {zone.coordinates?.[0]?.toFixed(4)}, {zone.coordinates?.[1]?.toFixed(4)}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Terrain Visual */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 group cursor-pointer bg-slate-950" onClick={() => setShowImage(!showImage)}>
          {!imgError ? (
            <img 
              src={imageSrc} 
              alt={`Terrain of ${zone.name}`} 
              className="w-full h-40 object-cover" 
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
              <Mountain className="text-slate-600 mb-2" size={36} />
              <span className="text-xs font-semibold text-slate-300">{zone.name} Topography</span>
              <span className="text-[11px] text-slate-500">{env.slope}° Slope Gradient • {env.elevation}m ASL</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
            <Camera size={16} className="text-slate-300" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Sector Elevation &amp; Terrain</span>
          </div>
        </div>

        {showImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-6" onClick={() => setShowImage(false)}>
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              {!imgError ? (
                <img src={imageSrc} alt="Full Terrain" className="w-full h-auto max-h-[70vh] object-cover" />
              ) : (
                <div className="p-8 text-center bg-slate-950">
                  <Mountain className="mx-auto text-slate-500 mb-3" size={48} />
                  <p className="text-slate-300 font-bold">{zone.name}</p>
                  <p className="text-slate-500 text-xs mt-1">Slope: {env.slope}° | Aspect: {env.aspect} | Elevation: {env.elevation}m</p>
                </div>
              )}
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                <p className="text-sm text-slate-300 font-medium">{zone.name} Topographic Model</p>
                <button onClick={() => setShowImage(false)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-md transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
            <h3 className="text-xs uppercase text-slate-500 font-bold mb-1">Dynamic Risk</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getRiskColor(state.currentRisk ?? 50)}`}>{state.currentRisk ?? 50}</span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              {(state.momentum ?? 0) > 0 ? (
                <span className="text-red-400 flex items-center"><TrendingUp size={14} className="mr-1"/> +{state.momentum} escalating</span>
              ) : (state.momentum ?? 0) < 0 ? (
                <span className="text-green-400 flex items-center"><TrendingDown size={14} className="mr-1"/> {state.momentum} declining</span>
              ) : (
                <span className="text-slate-400 flex items-center">→ Stable equilibrium</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
            <h3 className="text-xs uppercase text-slate-500 font-bold mb-1">Hazard Window</h3>
            <div className="flex items-center gap-2 h-9">
              <Clock className={(state.currentRisk ?? 0) > 75 ? 'text-red-400' : 'text-slate-500'} size={20} />
              <span className={`font-bold text-sm ${((state.currentRisk ?? 0) > 75) ? 'text-red-400' : 'text-slate-300'}`}>
                {state.hazardWindow?.[0] || '--'} - {state.hazardWindow?.[1] || '--'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">Probabilistic risk window</div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Activity size={16} className="text-blue-500"/> 24h Risk Forecast</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', fontSize: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#riskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability (SHAP-style) */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2"><BarChart2 size={16} className="text-purple-500"/> Model Feature Attribution</h3>
          <p className="text-xs text-slate-400 mb-4">SHAP-style contribution breakdown</p>
          
          <div className="space-y-3">
            {Array.isArray(state.featureContributions) && state.featureContributions.map((fc: any, i: number) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{fc.feature}</span>
                  <span className={fc.value > 0 ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                    {fc.value > 0 ? '+' : ''}{Number(fc.value).toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full ${fc.value > 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${Math.min(100, Math.max(5, Math.abs(fc.value)))}%`, marginLeft: fc.value < 0 ? 'auto' : '0' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-lg">
            <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">Primary Hazard Driver</div>
            <p className="text-xs text-slate-300 leading-relaxed"><span className="font-semibold text-white">{state.primaryDriver}</span> is currently the dominant factor escalating susceptibility in this sector.</p>
          </div>
        </div>

        {/* Impact Exposure */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Users size={16} className="text-emerald-500"/> Impact Exposure</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Population Exposed</div>
              <div className="text-xl font-bold text-slate-200 mt-1">{zone.population?.toLocaleString() ?? 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-semibold">Static Susceptibility</div>
              <div className="text-xl font-bold text-slate-200 mt-1">{zone.staticSusceptibility ?? 50}/100</div>
            </div>
          </div>
        </div>

        {/* Ground Truth / Evidence */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><ShieldAlert size={16} className="text-yellow-500"/> Ground Evidence Verification</h3>
          
          <div className="flex justify-between items-center mb-4 p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
            <span className="text-xs text-slate-400">Integrated Model Confidence</span>
            <span className="text-base font-bold text-slate-200">{state.confidence ?? 85}%</span>
          </div>

          <div className="space-y-3">
            {reports.map((report: any) => (
              <div key={report.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900/90">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-bold text-slate-300 px-2 py-0.5 bg-slate-800 rounded">{report.type}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${report.verificationStatus === 'Verified' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' : 'bg-yellow-950 text-yellow-400 border border-yellow-900/60'}`}>
                    {report.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{report.description}</p>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{report.reporter}</span>
                  <span>{report.timestamp ? new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-4">No recent field reports filed for this sector.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
