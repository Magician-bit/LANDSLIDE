import React from 'react';
import {
  Activity,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Sparkles,
  FileText,
  Database,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Mountain
} from 'lucide-react';
import { AppView } from '../../types';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  alertsCount: number;
  onOpenReportModal: () => void;
  onOpenDataModal: () => void;
  onResetSimulation: () => void;
}

export default function Sidebar({
  activeView,
  setActiveView,
  alertsCount,
  onOpenReportModal,
  onOpenDataModal,
  onResetSimulation
}: SidebarProps) {
  const navItems: { id: AppView; label: string; icon: any; color: string }[] = [
    { id: 'live', label: 'Live GIS Map', icon: Activity, color: 'text-blue-400' },
    { id: 'forecast', label: '24h Forecast', icon: TrendingUp, color: 'text-cyan-400' },
    { id: 'simulate', label: 'Disaster Simulator', icon: Sliders, color: 'text-amber-400' },
    { id: 'respond', label: 'Evacuation & Response', icon: ShieldCheck, color: 'text-emerald-400' },
    { id: 'ai', label: 'AI Slope Vision', icon: Sparkles, color: 'text-purple-400' },
    { id: 'reports', label: 'Field Reports', icon: FileText, color: 'text-orange-400' },
    { id: 'data', label: 'Data Feeds (7)', icon: Database, color: 'text-indigo-400' },
    { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle, color: 'text-red-400' }
  ];

  return (
    <nav
      id="main-operational-sidebar"
      className="w-16 md:w-20 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center py-4 z-40 shrink-0 select-none justify-between"
    >
      {/* Top Section: Brand & Nav Tabs */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Brand Icon */}
        <button
          onClick={() => setActiveView('live')}
          className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          title="Pan-India Landslide Intelligence Platform"
        >
          <Mountain size={20} />
        </button>

        <div className="w-8 h-[1px] bg-slate-800 my-1"></div>

        {/* Workspace Navigation Buttons */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isAlert = item.id === 'alerts' && alertsCount > 0;

            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveView(item.id)}
                title={item.label}
                className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-slate-850 text-white border border-blue-500/50 shadow-lg shadow-blue-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? item.color : 'text-slate-400 group-hover:text-slate-200'} />
                <span className="text-[9px] font-mono tracking-tight font-medium truncate max-w-[48px] text-center leading-none">
                  {item.label.split(' ')[0]}
                </span>

                {/* Notification Badge */}
                {isAlert && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center border-2 border-slate-950 animate-pulse">
                    {alertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Fast Actions */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <div className="w-8 h-[1px] bg-slate-800 my-1"></div>

        {/* Quick Report Hazard Button */}
        <button
          id="sidebar-quick-report-btn"
          onClick={onOpenReportModal}
          title="Submit Field Hazard Report"
          className="w-10 h-10 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <PlusCircle size={18} />
        </button>

        {/* Reset Simulation State */}
        <button
          id="sidebar-reset-simulation-btn"
          onClick={onResetSimulation}
          title="Reset Simulation Overrides to Real-Time Telemetry"
          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </nav>
  );
}
