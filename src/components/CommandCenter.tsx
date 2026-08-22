import React from 'react';
import { AlertTriangle, Users, MapPin, Activity, ShieldAlert, FileText } from 'lucide-react';

export default function CommandCenter({ intel, onNavigate }: { intel: any, onNavigate: () => void }) {
  const activeAlerts = intel.alerts.length;
  let criticalZones = 0;
  Object.values(intel.riskStates).forEach((rs: any) => {
    if (rs.currentRisk > 75) criticalZones++;
  });
  const populationExposed = intel.zones.reduce((sum: number, z: any) => sum + (intel.riskStates[z.id].currentRisk > 50 ? z.population : 0), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Command Center</h2>
          <p className="text-slate-400 mt-1">Real-time mountain disaster intelligence overview.</p>
        </div>
        <button onClick={onNavigate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <MapPin size={18} />
          View Live Map
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Active Alerts</h3>
            <div className="p-2 bg-red-950 text-red-500 rounded-lg"><AlertTriangle size={20} /></div>
          </div>
          <div className="text-4xl font-bold text-slate-100">{activeAlerts}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Critical Zones</h3>
            <div className="p-2 bg-orange-950 text-orange-500 rounded-lg"><MapPin size={20} /></div>
          </div>
          <div className="text-4xl font-bold text-slate-100">{criticalZones}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Population Exposed</h3>
            <div className="p-2 bg-blue-950 text-blue-500 rounded-lg"><Users size={20} /></div>
          </div>
          <div className="text-4xl font-bold text-slate-100">{populationExposed.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Isolation Risk</h3>
            <div className="p-2 bg-purple-950 text-purple-500 rounded-lg"><ShieldAlert size={20} /></div>
          </div>
          <div className="text-4xl font-bold text-slate-100">{intel.networkImpact.isolationScore}/100</div>
          <p className="text-sm text-slate-500 mt-2">{intel.networkImpact.isolatedCommunities} communities isolated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity className="text-blue-500" /> Response Queue
          </h3>
          <div className="space-y-4">
            {intel.alerts.map((a: any, i: number) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-start gap-4">
                <div className={`p-2 rounded-lg mt-1 ${a.severity === 'CRITICAL' ? 'bg-red-950 text-red-500' : 'bg-orange-950 text-orange-500'}`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-200">{a.title}</h4>
                    <span className="text-xs text-slate-500">{new Date(a.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{a.description}</p>
                </div>
              </div>
            ))}
            {intel.alerts.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No active priority responses.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <FileText className="text-blue-500" /> Intelligence Architecture
          </h3>
          <div className="bg-slate-950 rounded-lg p-6 font-mono text-xs text-slate-400 leading-relaxed border border-slate-800">
            <div className="text-blue-400">Environmental Monitoring</div>
            <div className="ml-4">↓</div>
            <div className="text-indigo-400">Feature Engineering</div>
            <div className="ml-4">↓</div>
            <div className="text-emerald-400">Susceptibility Detection</div>
            <div className="ml-4">↓</div>
            <div className="text-yellow-400">Trigger Detection</div>
            <div className="ml-4">↓</div>
            <div className="text-orange-400">Risk Forecasting</div>
            <div className="ml-4">↓</div>
            <div className="text-red-400">Impact Engine & Isolation Detection</div>
            <div className="ml-4">↓</div>
            <div className="text-purple-400">Response Prioritization</div>
          </div>
        </div>
      </div>
    </div>
  );
}
