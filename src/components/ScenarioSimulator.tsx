import React from 'react';
import { X, Play, RotateCcw, CloudRain, Droplets, Mountain, ShieldAlert } from 'lucide-react';
import { Scenario } from '../types';

export default function ScenarioSimulator({ intel, onClose }: { intel: any, onClose: () => void }) {
  
  const handleActivate = (type: Scenario['type'], updates: Partial<Scenario>) => {
    intel.setScenario({
      ...intel.scenario,
      active: true,
      type,
      ...updates
    });
  };

  const handleReset = () => {
    intel.resetScenario();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
        <div>
          <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <Play size={18} className="text-blue-500"/>
            Scenario Simulator
          </h2>
          <p className="text-xs text-slate-400">Interactive Impact Engine</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {intel.scenario.active && (
          <div className="bg-blue-950/30 border border-blue-900/50 p-4 rounded-xl flex items-start justify-between">
            <div>
              <div className="text-xs text-blue-400 font-bold uppercase mb-1">Active Scenario</div>
              <div className="font-bold text-slate-200">{intel.scenario.type}</div>
            </div>
            <button onClick={handleReset} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-2 text-sm transition-colors">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        )}

        {/* Heavy Rainfall */}
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-950">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <CloudRain size={18} className="text-blue-400" />
            Heavy Rainfall Event
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Intensity Increase</label>
              <div className="grid grid-cols-4 gap-2">
                {[1.5, 2, 2.5, 3].map(mult => (
                  <button 
                    key={mult}
                    onClick={() => handleActivate('Heavy Rainfall', { rainfallMultiplier: mult, duration: intel.scenario.duration })}
                    className={`py-1.5 rounded text-xs font-bold border transition-colors ${intel.scenario.active && intel.scenario.type === 'Heavy Rainfall' && intel.scenario.rainfallMultiplier === mult ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  >
                    +{(mult - 1) * 100}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {[6, 12, 24, 48].map(dur => (
                  <button 
                    key={dur}
                    onClick={() => handleActivate('Heavy Rainfall', { duration: dur, rainfallMultiplier: intel.scenario.active && intel.scenario.type === 'Heavy Rainfall' ? intel.scenario.rainfallMultiplier : 1.5 })}
                    className={`py-1.5 rounded text-xs font-bold border transition-colors ${intel.scenario.active && intel.scenario.type === 'Heavy Rainfall' && intel.scenario.duration === dur ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                  >
                    {dur}h
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Soil Saturation */}
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-950">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Droplets size={18} className="text-teal-400" />
            Soil Saturation
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[ {label: 'Elevated', m: 1.2}, {label: 'High', m: 1.5}, {label: 'Saturated', m: 2.0} ].map(opt => (
              <button 
                key={opt.label}
                onClick={() => handleActivate('Soil Saturation', { soilMoistureMultiplier: opt.m })}
                className={`py-2 rounded text-xs font-bold border transition-colors ${intel.scenario.active && intel.scenario.type === 'Soil Saturation' && intel.scenario.soilMoistureMultiplier === opt.m ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Infrastructure Failure */}
        <div className="border border-slate-800 rounded-xl p-4 bg-slate-950">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
            <ShieldAlert size={18} className="text-orange-400" />
            Infrastructure Failure
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Road Blockage</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value) handleActivate('Road Blockage', { failedInfrastructureIds: [e.target.value] });
                }}
                value={intel.scenario.active && intel.scenario.type === 'Road Blockage' ? intel.scenario.failedInfrastructureIds[0] || '' : ''}
              >
                <option value="">Select a road to block...</option>
                {intel.edges.filter((e: any) => e.type === 'road').map((e: any) => (
                  <option key={e.id} value={e.id}>Road {e.id} ({e.source} → {e.target})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Bridge Failure</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                onChange={(e) => {
                  if (e.target.value) handleActivate('Bridge Failure', { failedInfrastructureIds: [e.target.value] });
                }}
                value={intel.scenario.active && intel.scenario.type === 'Bridge Failure' ? intel.scenario.failedInfrastructureIds[0] || '' : ''}
              >
                <option value="">Select a bridge to fail...</option>
                {intel.nodes.filter((n: any) => n.type === 'bridge').map((n: any) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
