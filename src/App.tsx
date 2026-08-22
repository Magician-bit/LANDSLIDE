import React, { useState } from 'react';
import { useIntelligence } from './hooks/useIntelligence';
import MapComponent from './components/MapComponent';
import { MapErrorBoundary } from './components/MapErrorBoundary';
import CommandCenter from './components/CommandCenter';
import LocationIntelligence from './components/LocationIntelligence';
import ForecastPanel from './components/ForecastPanel';
import ScenarioSimulator from './components/ScenarioSimulator';
import EvacuationPanel from './components/EvacuationPanel';
import TimelineBar from './components/TimelineBar';
import {
  Activity,
  Map as MapIcon,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  RotateCcw,
  Menu,
  X,
  Compass,
  Radio,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { AppMode } from './types';

function App() {
  const intel = useIntelligence();
  const [viewMode, setViewMode] = useState<'map' | 'command'>('map');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(true);

  const alertsCount = Array.isArray(intel?.alerts) ? intel.alerts.length : 0;
  const activeMode: AppMode = intel?.activeMode || 'LIVE';

  const handleModeSwitch = (mode: AppMode) => {
    intel.setActiveMode(mode);
    setViewMode('map');
    setMobileDrawerOpen(true);
  };

  return (
    <div id="landslide-platform-root" className="flex h-screen overflow-hidden bg-slate-950 text-slate-300 font-sans select-none">
      {/* 1. Left Vertical Navigation Rail */}
      <nav className="w-16 md:w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4 z-50 shrink-0">
        {/* Brand Icon */}
        <div
          onClick={() => {
            setViewMode('command');
          }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-black text-white shadow-lg shadow-red-600/30 cursor-pointer hover:scale-105 transition-transform"
          title="Command Center Dashboard"
        >
          <Radio size={20} className="text-white" />
        </div>

        <div className="w-8 h-[1px] bg-slate-800 my-1"></div>

        {/* Dashboard Overview */}
        <button
          title="Command Center Dashboard"
          onClick={() => setViewMode('command')}
          className={`p-3 rounded-xl transition-all relative ${
            viewMode === 'command'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard size={20} />
        </button>

        {/* Live GIS Map */}
        <button
          title="LIVE Telemetry Map Workspace"
          onClick={() => handleModeSwitch('LIVE')}
          className={`p-3 rounded-xl transition-all relative ${
            viewMode === 'map' && activeMode === 'LIVE'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MapIcon size={20} />
        </button>

        {/* Forecast Mode */}
        <button
          title="24h Prediction & Forecast Workspace"
          onClick={() => {
            handleModeSwitch('FORECAST');
            intel.run24HForecast(intel.selectedZoneId || 'Z-042');
          }}
          className={`p-3 rounded-xl transition-all relative ${
            viewMode === 'map' && activeMode === 'FORECAST'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap size={20} />
        </button>

        {/* Scenario Simulator Mode */}
        <button
          title="What-If Disaster Simulation Workspace"
          onClick={() => handleModeSwitch('SIMULATE')}
          className={`p-3 rounded-xl transition-all relative ${
            viewMode === 'map' && activeMode === 'SIMULATE'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders size={20} />
        </button>

        {/* Evacuation Mode */}
        <button
          title="Evacuation & Disaster Response Workspace"
          onClick={() => handleModeSwitch('RESPOND')}
          className={`p-3 rounded-xl transition-all relative ${
            viewMode === 'map' && activeMode === 'RESPOND'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck size={20} />
        </button>

        {/* Reset Action */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            title="Reset All Parameters to Baseline"
            onClick={() => intel.resetSimulation()}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </nav>

      {/* 2. Main Workspace Container */}
      <main className="flex-1 flex flex-col relative h-full min-w-0">
        {/* Top Operational Header */}
        <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center px-4 md:px-6 justify-between z-40 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm md:text-base font-extrabold text-white tracking-wider uppercase flex items-center gap-2">
              <span className="text-red-500 font-mono">HIMALAYA</span>
              <span className="hidden sm:inline">LANDSLIDE DETECTOR</span>
            </h1>

            {/* 4 Mode Pills Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 ml-1 md:ml-4">
              <button
                onClick={() => handleModeSwitch('LIVE')}
                className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  viewMode === 'map' && activeMode === 'LIVE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                LIVE
              </button>
              <button
                onClick={() => {
                  handleModeSwitch('FORECAST');
                  intel.run24HForecast(intel.selectedZoneId || 'Z-042');
                }}
                className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  viewMode === 'map' && activeMode === 'FORECAST'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FORECAST
              </button>
              <button
                onClick={() => handleModeSwitch('SIMULATE')}
                className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  viewMode === 'map' && activeMode === 'SIMULATE'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SIMULATE
              </button>
              <button
                onClick={() => handleModeSwitch('RESPOND')}
                className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  viewMode === 'map' && activeMode === 'RESPOND'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RESPOND
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {intel?.scenario?.active && (
              <div className="hidden lg:flex items-center gap-1.5 bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                <Sliders size={13} />
                <span>SCENARIO: {intel.scenario.type.toUpperCase()}</span>
              </div>
            )}

            <button
              onClick={() => setViewMode('command')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                viewMode === 'command'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Command Center</span>
            </button>

            {alertsCount > 0 && (
              <button
                onClick={() => {
                  setViewMode('command');
                }}
                className="flex items-center gap-1.5 bg-red-950/80 text-red-400 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-bold border border-red-900 shadow-sm hover:bg-red-900/60 transition-colors"
              >
                <AlertTriangle size={13} />
                <span>{alertsCount} ALERTS</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Workspace Body */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Geospatial Map Canvas Workspace */}
          <div className="flex-1 relative h-full min-w-0">
            <MapErrorBoundary>
              <MapComponent intel={intel} />
            </MapErrorBoundary>

            {/* Docked Time Travel Timeline Bar on Map bottom */}
            {viewMode === 'map' && (
              <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[400] max-w-[95vw] pointer-events-auto">
                <TimelineBar
                  timelineStep={intel.timelineStep}
                  setTimelineStep={intel.setTimelineStep}
                />
              </div>
            )}

            {/* Command Center Full-Screen Overlay View */}
            {viewMode === 'command' && (
              <div className="absolute inset-0 z-30 bg-slate-950/98 overflow-y-auto backdrop-blur-md">
                <CommandCenter
                  intel={intel}
                  onNavigateToMap={(mode?: AppMode) => {
                    if (mode) intel.setActiveMode(mode);
                    setViewMode('map');
                  }}
                />
              </div>
            )}
          </div>

          {/* RIGHT CONTEXTUAL WORKSPACE PANEL (Desktop Side-by-Side, Mobile Sliding Sheet) */}
          {viewMode === 'map' && (
            <div
              className={`
                fixed md:relative inset-x-0 bottom-0 md:inset-auto z-40 md:z-30
                w-full md:w-96 lg:w-[420px] xl:w-[450px]
                bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 shadow-2xl
                flex flex-col overflow-hidden shrink-0 transition-transform duration-300
                ${mobileDrawerOpen ? 'h-[75vh] md:h-full translate-y-0' : 'h-12 md:h-full translate-y-[calc(100%-3rem)] md:translate-y-0'}
              `}
            >
              {/* Mobile Drawer Toggle Header Bar */}
              <div
                className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between cursor-pointer"
                onClick={() => setMobileDrawerOpen(prev => !prev)}
              >
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                  {activeMode} WORKSPACE {mobileDrawerOpen ? '(Tap to minimize)' : '(Tap to expand)'}
                </span>
                {mobileDrawerOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </div>

              {/* Workspace Content Slot */}
              <div className="flex-1 overflow-hidden">
                {activeMode === 'LIVE' && (
                  <LocationIntelligence
                    intel={intel}
                    onClose={() => intel.setSelectedZoneId(null)}
                  />
                )}

                {activeMode === 'FORECAST' && (
                  <ForecastPanel
                    intel={intel}
                    onClose={() => intel.setActiveMode('LIVE')}
                  />
                )}

                {activeMode === 'SIMULATE' && (
                  <ScenarioSimulator
                    intel={intel}
                    onClose={() => intel.setActiveMode('LIVE')}
                  />
                )}

                {activeMode === 'RESPOND' && (
                  <EvacuationPanel
                    intel={intel}
                    onClose={() => intel.setActiveMode('LIVE')}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
