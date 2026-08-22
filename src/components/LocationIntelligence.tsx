import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Clock, ShieldAlert, BarChart2, Activity, Info, Users, MapPin, Camera } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LocationIntelligence({ intel, onClose }: { intel: any, onClose: () => void }) {
  const zone = intel.zones.find((z: any) => z.id === intel.selectedZoneId);
  const state = intel.riskStates[intel.selectedZoneId];
  const [showImage, setShowImage] = useState(false);

  if (!zone || !state) return null;

  const chartData = [
    { time: 'Now', risk: state.currentRisk },
    { time: '+6h', risk: state.forecast.t6 },
    { time: '+12h', risk: state.forecast.t12 },
    { time: '+24h', risk: state.forecast.t24 },
  ];

  const getRiskColor = (risk: number) => {
    if (risk > 80) return 'text-red-500';
    if (risk > 60) return 'text-orange-500';
    if (risk > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const reports = intel.reports.filter((r: any) => r.zoneId === zone.id);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
        <div>
          <h2 className="font-bold text-lg text-slate-100">{zone.name}</h2>
          <p className="text-xs text-slate-400 font-mono">{zone.id} | {zone.coordinates[0]}, {zone.coordinates[1]}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Imagery */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 group cursor-pointer" onClick={() => setShowImage(!showImage)}>
          <img src={`https://picsum.photos/seed/${zone.id}/600/300`} alt="Location Terrain" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Camera size={16} className="text-slate-300" />
            <span className="text-sm font-medium text-slate-200">Prototype Terrain View</span>
          </div>
        </div>

        {showImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-8" onClick={() => setShowImage(false)}>
            <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
               <img src={`https://picsum.photos/seed/${zone.id}/1200/800`} alt="Full Terrain" className="w-full h-auto" />
               <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
                 <p className="text-slate-300">Representative Imagery for {zone.name}</p>
                 <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Close</button>
               </div>
            </div>
          </div>
        )}

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-xs uppercase text-slate-500 font-bold mb-1">Dynamic Risk</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${getRiskColor(state.currentRisk)}`}>{state.currentRisk}</span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              {state.momentum > 0 ? (
                <span className="text-red-400 flex items-center"><TrendingUp size={14} className="mr-1"/> +{state.momentum}</span>
              ) : state.momentum < 0 ? (
                <span className="text-green-400 flex items-center"><TrendingDown size={14} className="mr-1"/> {state.momentum}</span>
              ) : (
                <span className="text-slate-400 flex items-center">→ Stable</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <h3 className="text-xs uppercase text-slate-500 font-bold mb-1">Hazard Window</h3>
            <div className="flex items-center gap-2 h-9">
              <Clock className={state.currentRisk > 75 ? 'text-red-400' : 'text-slate-500'} size={20} />
              <span className={`font-bold ${state.currentRisk > 75 ? 'text-red-400' : 'text-slate-400'}`}>
                {state.hazardWindow[0]} - {state.hazardWindow[1]}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Probabilistic timeframe</div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Activity size={16} className="text-blue-500"/> Risk Forecast</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#riskGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability (SHAP-style) */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2"><BarChart2 size={16} className="text-purple-500"/> Model Explanation</h3>
          <p className="text-xs text-slate-400 mb-4">SHAP-style feature attribution (Prototype)</p>
          
          <div className="space-y-3">
            {state.featureContributions.map((fc: any, i: number) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{fc.feature}</span>
                  <span className={fc.value > 0 ? 'text-red-400' : 'text-green-400'}>{fc.value > 0 ? '+' : ''}{fc.value.toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className={`h-full ${fc.value > 0 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, Math.abs(fc.value))}%`, marginLeft: fc.value < 0 ? 'auto' : '0' }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-lg">
            <div className="text-xs text-indigo-300 font-medium uppercase tracking-wider mb-1">Primary Driver</div>
            <p className="text-sm text-slate-200">{state.primaryDriver} is currently the strongest contributor to predicted risk.</p>
          </div>
        </div>

        {/* Impact Engine */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><Users size={16} className="text-emerald-500"/> Impact Exposure</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase">Population Exposed</div>
              <div className="text-xl font-bold text-slate-200">{zone.population.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase">Static Susceptibility</div>
              <div className="text-xl font-bold text-slate-200">{zone.staticSusceptibility}/100</div>
            </div>
          </div>
        </div>

        {/* Ground Truth */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2"><ShieldAlert size={16} className="text-yellow-500"/> Ground Evidence</h3>
          
          <div className="flex justify-between items-center mb-4 p-3 bg-slate-900 rounded-lg">
            <span className="text-sm text-slate-400">Model Confidence</span>
            <span className="text-lg font-bold text-slate-200">{state.confidence}%</span>
          </div>

          <div className="space-y-3">
            {reports.map((report: any) => (
              <div key={report.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-300 px-2 py-0.5 bg-slate-800 rounded">{report.type}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${report.verificationStatus === 'Verified' ? 'bg-green-950 text-green-400' : 'bg-yellow-950 text-yellow-400'}`}>
                    {report.verificationStatus}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{report.description}</p>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{report.reporter}</span>
                  <span>{new Date(report.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4">No recent field reports in this zone.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
