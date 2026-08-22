import React, { useState } from 'react';
import { useIntelligence } from './hooks/useIntelligence';
import MapComponent from './components/MapComponent';
import { MapErrorBoundary } from './components/MapErrorBoundary';
import CommandCenter from './components/CommandCenter';
import LocationIntelligence from './components/LocationIntelligence';
import ScenarioSimulator from './components/ScenarioSimulator';
import { Activity, Map, AlertTriangle, GitMerge } from 'lucide-react';

function App() {
  const intel = useIntelligence();
  const [activeTab, setActiveTab] = useState<'map' | 'command' | 'scenario'>('map');

  const alertsCount = Array.isArray(intel?.alerts) ? intel.alerts.length : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-300 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 z-50">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-red-600/30 mb-2">
          LD
        </div>
        
        <button 
          title="Geospatial Map"
          onClick={() => setActiveTab('map')} 
          className={`p-3 rounded-xl transition-all ${activeTab === 'map' ? 'bg-slate-800 text-blue-400 shadow-md border border-slate-700/60' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
        >
          <Map size={22} />
        </button>

        <button 
          title="Command Center"
          onClick={() => setActiveTab('command')} 
          className={`p-3 rounded-xl transition-all ${activeTab === 'command' ? 'bg-slate-800 text-blue-400 shadow-md border border-slate-700/60' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
        >
          <Activity size={22} />
        </button>

        <button 
          title="Scenario Simulator"
          onClick={() => setActiveTab('scenario')} 
          className={`p-3 rounded-xl transition-all ${activeTab === 'scenario' ? 'bg-slate-800 text-blue-400 shadow-md border border-slate-700/60' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
        >
          <GitMerge size={22} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center px-6 justify-between absolute top-0 left-0 right-0 z-40">
          <div>
            <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-wider">LANDSLIDE DETECTOR</h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest hidden sm:block">Mountain Disaster Intelligence &amp; Resilience Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">System Active</span>
            </div>
            {alertsCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-950/70 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-900/80 shadow-sm">
                <AlertTriangle size={13} />
                {alertsCount} ALERTS
              </div>
            )}
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 flex mt-16 h-[calc(100vh-4rem)]">
          {/* Geospatial Map Area */}
          <div className="flex-1 relative">
            <MapErrorBoundary>
              <MapComponent intel={intel} />
            </MapErrorBoundary>
            
            {/* Overlay Panels based on active tab */}
            {activeTab === 'command' && (
              <div className="absolute inset-0 z-30 bg-slate-950/95 overflow-y-auto backdrop-blur-sm">
                <CommandCenter intel={intel} onNavigate={() => setActiveTab('map')} />
              </div>
            )}
            
            {activeTab === 'scenario' && (
              <div className="absolute left-4 md:left-6 top-4 md:top-6 bottom-4 md:bottom-6 w-80 md:w-96 z-30 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-y-auto flex flex-col">
                <ScenarioSimulator intel={intel} onClose={() => setActiveTab('map')} />
              </div>
            )}
          </div>

          {/* Location Intelligence Sidebar (Right) */}
          {intel?.selectedZoneId && (
            <div className="w-80 md:w-96 lg:w-[440px] bg-slate-900 border-l border-slate-800 z-30 shadow-2xl flex flex-col overflow-y-auto">
              <LocationIntelligence intel={intel} onClose={() => intel.setSelectedZoneId(null)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
