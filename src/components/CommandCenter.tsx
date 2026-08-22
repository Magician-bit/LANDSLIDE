import React from 'react';
import { AlertTriangle, Users, MapPin, Activity, ShieldAlert, FileText } from 'lucide-react';

export default function CommandCenter({ intel, onNavigate }: { intel: any; onNavigate: () => void }) {
  const activeAlerts = Array.isArray(intel?.alerts) ? intel.alerts.length : 0;
  
  let criticalZones = 0;
  if (intel?.riskStates) {
    Object.values(intel.riskStates).forEach((rs: any) => {
      if (rs && rs.currentRisk > 75) criticalZones++;
    });
  }

  const safeZones = Array.isArray(intel?.zones) ? intel.zones : [];
  const populationExposed = safeZones.reduce((sum: number, z: any) => {
    const risk = intel?.riskStates?.[z.id]?.currentRisk ?? 0;
    return sum + (risk > 50 ? (z.population || 0) : 0);
  }, 0);

  const isolationScore = intel?.networkImpact?.isolationScore ?? 0;
  const isolatedCommunities = intel?.networkImpact?.isolatedCommunities ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">Command Center</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time mountain disaster intelligence overview and emergency metrics.</p>
        </div>
        <button
          onClick={onNavigate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20 self-start sm:self-auto"
        >
          <MapPin size={18} />
          View Live Geospatial Map
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 text-sm font-medium">Active Alerts</h3>
            <div className="p-2 bg-red-950/70 border border-red-900 text-red-400 rounded-lg"><AlertTriangle size={18} /></div>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-slate-100">{activeAlerts}</div>
          <p className="text-xs text-slate-500 mt-2">Active response notifications</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 text-sm font-medium">Critical Sectors</h3>
            <div className="p-2 bg-orange-950/70 border border-orange-900 text-orange-400 rounded-lg"><MapPin size={18} /></div>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-slate-100">{criticalZones}</div>
          <p className="text-xs text-slate-500 mt-2">Risk threshold &gt; 75/100</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 text-sm font-medium">Population Exposed</h3>
            <div className="p-2 bg-blue-950/70 border border-blue-900 text-blue-400 rounded-lg"><Users size={18} /></div>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-slate-100">{populationExposed.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-2">In elevated hazard zones</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-400 text-sm font-medium">Network Isolation Risk</h3>
            <div className="p-2 bg-purple-950/70 border border-purple-900 text-purple-400 rounded-lg"><ShieldAlert size={18} /></div>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-slate-100">{isolationScore}/100</div>
          <p className="text-xs text-slate-500 mt-2">{isolatedCommunities} settlements isolated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} /> Priority Response Queue
          </h3>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {Array.isArray(intel?.alerts) && intel.alerts.map((a: any, i: number) => (
              <div key={a.id || i} className="bg-slate-950 border border-slate-800/80 p-4 rounded-lg flex items-start gap-3.5">
                <div className={`p-2 rounded-lg mt-0.5 ${a.severity === 'CRITICAL' ? 'bg-red-950/80 text-red-400 border border-red-900/50' : 'bg-orange-950/80 text-orange-400 border border-orange-900/50'}`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-200 text-sm">{a.title}</h4>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.description}</p>
                </div>
              </div>
            ))}
            {(!intel?.alerts || intel.alerts.length === 0) && (
              <div className="text-center py-12 text-slate-500 text-sm">
                No active critical alerts. All monitored sectors operating within standard baseline limits.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
            <FileText className="text-blue-500" size={20} /> Intelligence Architecture
          </h3>
          <div className="bg-slate-950 rounded-lg p-5 font-mono text-xs text-slate-300 leading-relaxed border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-blue-400 font-semibold">
              <span>[01] Multi-Source Sensory Ingestion</span>
              <span className="text-[10px] text-slate-500">24h Precip, Soil Moisture, Anomaly</span>
            </div>
            <div className="text-slate-600 pl-4">↓</div>
            <div className="flex items-center justify-between text-indigo-400 font-semibold">
              <span>[02] Topographical Feature Engine</span>
              <span className="text-[10px] text-slate-500">Slope 38-42°, Aspect, Convergence</span>
            </div>
            <div className="text-slate-600 pl-4">↓</div>
            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span>[03] Dynamic Risk &amp; Forecasting</span>
              <span className="text-[10px] text-slate-500">SHAP Attributions, +6h / +12h / +24h</span>
            </div>
            <div className="text-slate-600 pl-4">↓</div>
            <div className="flex items-center justify-between text-amber-400 font-semibold">
              <span>[04] Dijkstra Topological Impact</span>
              <span className="text-[10px] text-slate-500">Bridge / Road Cascades, Isolation Index</span>
            </div>
            <div className="text-slate-600 pl-4">↓</div>
            <div className="flex items-center justify-between text-rose-400 font-semibold">
              <span>[05] Ground-Truth Fusion &amp; Triage</span>
              <span className="text-[10px] text-slate-500">Verified Tension Cracks, Evacuation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
