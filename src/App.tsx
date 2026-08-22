import React, { useState } from 'react';
import { useIntelligence } from './hooks/useIntelligence';
import MapComponent from './components/MapComponent';
import CommandCenter from './components/CommandCenter';
import LocationIntelligence from './components/LocationIntelligence';
import ScenarioSimulator from './components/ScenarioSimulator';
import { Activity, Map, AlertTriangle, GitMerge, FileText } from 'lucide-react';

function App() {
  const intel = useIntelligence();
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-300 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-16 md:w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-8 z-50">
        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white mb-4">
          LD
        </div>
        <button onClick={() => setActiveTab('map')} className={`p-3 rounded-xl transition-colors ${activeTab === 'map' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <Map size={24} />
        </button>
        <button onClick={() => setActiveTab('command')} className={`p-3 rounded-xl transition-colors ${activeTab === 'command' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <Activity size={24} />
        </button>
        <button onClick={() => setActiveTab('scenario')} className={`p-3 rounded-xl transition-colors ${activeTab === 'scenario' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
          <GitMerge size={24} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-6 justify-between absolute top-0 left-0 right-0 z-40">
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-wide">LANDSLIDE DETECTOR</h1>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Mountain Disaster Intelligence & Resilience Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">System Active</span>
            </div>
            {intel.alerts.length > 0 && (
              <div className="flex items-center gap-2 bg-red-950/50 text-red-400 px-3 py-1 rounded-full text-xs font-semibold border border-red-900">
                <AlertTriangle size={14} />
                {intel.alerts.length} ALERTS
              </div>
            )}
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 flex mt-16 h-[calc(100vh-4rem)]">
          {/* Map is always mounted but might be obscured by other full-screen tabs if we wanted. But here we'll keep it as the primary background and overlay panels */}
          <div className="flex-1 relative">
            <MapComponent intel={intel} />
            
            {/* Overlay Panels based on active tab */}
            {activeTab === 'command' && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 overflow-y-auto">
                <CommandCenter intel={intel} onNavigate={() => setActiveTab('map')} />
              </div>
            )}
            
            {activeTab === 'scenario' && (
              <div className="absolute left-6 top-6 bottom-6 w-96 z-30 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl overflow-y-auto flex flex-col">
                <ScenarioSimulator intel={intel} onClose={() => setActiveTab('map')} />
              </div>
            )}
          </div>

          {/* Location Intelligence Sidebar (Right) */}
          {intel.selectedZoneId && (
            <div className="w-96 lg:w-[450px] bg-slate-900 border-l border-slate-800 z-30 shadow-2xl flex flex-col overflow-y-auto">
              <LocationIntelligence intel={intel} onClose={() => intel.setSelectedZoneId(null)} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
