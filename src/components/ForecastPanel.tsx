import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useIntelligence } from '../hooks/useIntelligence';
import { Clock, TrendingUp, CloudRain, RotateCcw, Sliders, Zap } from 'lucide-react';

export const ForecastPanel: React.FC = () => {
  const intel = useIntelligence();
  
  if (!intel?.selectedZone) return null;
  const zone = intel.selectedZone;
  const weather = intel.fusedZoneState?.weather;
  const isOffline = !weather || !weather.isRealLive || weather.statusText === 'OFFLINE';

  let chartData: any[] = [];
  
  if (!isOffline && weather?.hourly && weather.hourly.length > 0) {
    // Find current time index
    const nowStr = new Date().toISOString().substring(0, 13); // e.g. 2026-08-23T09
    const startIndex = weather.hourly.findIndex((h: any) => h.time.startsWith(nowStr)) || 0;
    const s = Math.max(0, startIndex);
    
    // Get next 72 hours
    const slice = weather.hourly.slice(s, s + 72).filter((_: any, i: number) => i % 6 === 0 || i === 0 || i === 1 || i === 3);
    chartData = slice.map((h: any, i: number) => {
      let label = `+${Math.round(i === 0 ? 0 : (new Date(h.time).getTime() - new Date(slice[0].time).getTime()) / 3600000)}h`;
      if (i === 0) label = 'NOW';
      
      // Calculate a simple predicted hazard based on forecast rain + baseline
      const baseRisk = intel.fusedZoneState?.riskState?.currentRisk || 0;
      const rainFactor = Math.min(100, (h.precipitation / 10) * 40);
      let predictedRisk = Math.min(100, (zone.staticSusceptibility * 0.3) + rainFactor);
      if (predictedRisk < baseRisk * 0.5) predictedRisk = baseRisk; // don't drop suddenly
      
      return {
        time: label,
        rain: h.precipitation,
        prob: h.prob,
        risk: Math.round(predictedRisk)
      };
    });
  }

  return (
    <div className="absolute right-4 top-20 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        <div className="p-4 border-b border-slate-700/50 flex flex-col space-y-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                Forecast Analytics
              </h2>
              <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                {zone.name}, {zone.district}
              </div>
            </div>
            {isOffline ? (
              <span className="px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/60 text-[9px] font-bold">OFFLINE</span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-800/60 text-[9px] font-bold">LIVE API</span>
            )}
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {isOffline ? (
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center text-xs text-slate-400">
              Live forecast telemetry is currently unavailable for this region.
            </div>
          ) : (
            <>
              {/* Predicted Rain & Risk */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
                <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5 mb-3">
                  <CloudRain size={14} className="text-blue-400" />
                  Precipitation Forecast
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {chartData.slice(0, 4).map((d, i) => (
                    <div key={i} className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">{d.time}</span>
                      <div className="text-sm font-extrabold font-mono text-blue-300 mt-1">{d.rain}</div>
                      <span className="text-[8px] text-slate-400">mm</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trajectory */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-amber-400" />
                    Predicted Hazard
                  </h3>
                </div>
                <div className="h-32 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
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
                                <span className="font-bold text-sm text-amber-400">{data.risk}% Hazard</span>
                                <span className="block text-blue-300 mt-1">{data.rain} mm rain</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#forecastGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-md grid grid-cols-3 gap-2">
            <button onClick={() => intel.setActiveMode('LIVE')} className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-slate-700">
              <RotateCcw size={12} /> Map
            </button>
            <button onClick={() => intel.setActiveMode('SIMULATE')} className="py-2 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
              <Sliders size={13} /> Simulate
            </button>
            <button onClick={() => intel.setActiveMode('RESPOND')} className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
              <Zap size={13} /> Respond
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
