import React from 'react';
import {
  Mountain,
  Crosshair,
  Sparkles,
  PlusCircle,
  AlertTriangle,
  Database,
  Search,
  CheckCircle2,
  RefreshCw,
  Layers,
  MapPin
} from 'lucide-react';
import { AppView, Region } from '../../types';
import { REGION_LIST } from '../../utils/regionUtils';

interface TopBarProps {
  intel: any;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedRegion: Region;
  onSelectRegion: (reg: Region) => void;
  onCheckMyArea: () => void;
  locatingUser: boolean;
  onOpenReportModal: () => void;
  onOpenDataModal: () => void;
  onOpenAiModal: () => void;
  statesList: string[];
}

export default function TopBar({
  intel,
  activeView,
  setActiveView,
  selectedRegion,
  onSelectRegion,
  onCheckMyArea,
  locatingUser,
  onOpenReportModal,
  onOpenDataModal,
  onOpenAiModal,
  statesList
}: TopBarProps) {
  const alertsCount = intel.alerts?.length || 0;
  const criticalCount = intel.alerts?.filter((a: any) => a.severity === 'CRITICAL').length || 0;
  const isSimulationActive = intel.scenario?.active;

  return (
    <header
      id="main-topbar"
      className="bg-slate-950/95 border-b border-slate-800/80 px-4 py-2.5 flex flex-col gap-2 z-30 shrink-0 select-none backdrop-blur-md"
    >
      {/* Row 1: App Header & Global Action Strip */}
      <div className="flex items-center justify-between gap-3">
        {/* Title & Agency Trust Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-white tracking-wide uppercase truncate">
                Pan-India Landslide Intelligence Platform
              </h1>

              {isSimulationActive ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 text-amber-400 border border-amber-700 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  SIMULATION ACTIVE
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  7 FEEDS LIVE &bull; GSI &bull; NRSC &bull; IMD
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              National Multi-Source Slope Stability, Numerical Weather Assimilation &amp; Disaster Evacuation Grid
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Multi-source Pipeline Status Button */}
          <button
            id="topbar-data-feeds-status-btn"
            onClick={onOpenDataModal}
            title="Inspect 7 National Data Telemetry Feeds"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-850 text-indigo-300 border border-slate-800 transition-colors cursor-pointer"
          >
            <Database size={13} className="text-indigo-400" />
            <span>7 Feeds Verified</span>
          </button>

          {/* GPS Check My Area */}
          <button
            id="topbar-check-my-area-btn"
            onClick={onCheckMyArea}
            disabled={locatingUser}
            title="Locate nearest monitored landslide hazard sector"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-blue-400 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Crosshair size={13} className={locatingUser ? 'animate-spin text-blue-400' : ''} />
            <span className="hidden sm:inline">{locatingUser ? 'Locating...' : 'Check My Area'}</span>
          </button>

          {/* AI Slope Vision Check Button */}
          <button
            id="topbar-ai-vision-btn"
            onClick={onOpenAiModal}
            title="Run Gemini 2.5 Flash Slope Vision Analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-950/80 text-purple-300 hover:bg-purple-900 border border-purple-800 transition-colors cursor-pointer"
          >
            <Sparkles size={13} className="text-purple-400" />
            <span className="hidden md:inline">AI Photo Check</span>
          </button>

          {/* Quick Report Hazard Button */}
          <button
            id="topbar-report-hazard-btn"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/30 cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Report Hazard</span>
          </button>

          {/* Active Alerts Pill */}
          {alertsCount > 0 && (
            <button
              id="topbar-alerts-counter-pill"
              onClick={() => setActiveView('alerts')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                criticalCount > 0
                  ? 'bg-red-950 text-red-400 border-red-800 hover:bg-red-900 animate-pulse'
                  : 'bg-orange-950 text-orange-400 border-orange-800 hover:bg-orange-900'
              }`}
            >
              <AlertTriangle size={13} />
              <span>{alertsCount} ALERTS</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Pan-India Mountain Regions Selector */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1 border-t border-slate-900">
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-0.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold mr-1 hidden sm:inline">
            MOUNTAIN REGION:
          </span>

          {REGION_LIST.map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                id={`region-tab-${reg.id}`}
                onClick={() => {
                  onSelectRegion(reg.id as Region);
                  if (reg.defaultZoneId) {
                    intel?.setSelectedZoneId(reg.defaultZoneId);
                  }
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {reg.label}
              </button>
            );
          })}
        </div>

        {/* State Filter Selector */}
        <div className="hidden xl:flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="text-slate-500 text-[10px] uppercase font-bold">STATE:</span>
          <select
            id="topbar-state-selector"
            value={intel?.selectedStateFilter || 'ALL'}
            onChange={(e) => intel?.setSelectedStateFilter && intel.setSelectedStateFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
          >
            {statesList.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All States' : st}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
