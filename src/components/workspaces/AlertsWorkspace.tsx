import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  Users,
  Compass,
  MapPin,
  CheckCircle2,
  Eye,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Alert } from '../../types';

interface AlertsWorkspaceProps {
  intel: any;
  onNavigateToLiveMap?: (zoneId?: string) => void;
  onNavigateToMap?: () => void;
  onNavigateToResponse?: () => void;
  onNavigateToRespond?: () => void;
}

export default function AlertsWorkspace({
  intel,
  onNavigateToLiveMap,
  onNavigateToMap,
  onNavigateToResponse,
  onNavigateToRespond
}: AlertsWorkspaceProps) {
  const alerts: Alert[] = Array.isArray(intel?.alerts) ? intel.alerts : [];
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');
  const highAlerts = alerts.filter((a) => a.severity === 'HIGH');

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/70 border-red-600 text-red-400 shadow-red-950/40';
      case 'HIGH':
        return 'bg-orange-950/70 border-orange-600 text-orange-400 shadow-orange-950/40';
      default:
        return 'bg-amber-950/70 border-amber-600 text-amber-400 shadow-amber-950/40';
    }
  };

  const handleRespond = () => {
    if (onNavigateToRespond) onNavigateToRespond();
    else if (onNavigateToResponse) onNavigateToResponse();
  };

  const handleInspect = (zoneId?: string | null) => {
    if (zoneId) intel?.setSelectedZoneId(zoneId);
    if (onNavigateToLiveMap) onNavigateToLiveMap(zoneId || undefined);
    else if (onNavigateToMap) onNavigateToMap();
  };

  return (
    <div id="alerts-workspace" className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 space-y-6 text-slate-100 h-full">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
              EARLY WARNING DISPATCH
            </span>
            <span className="text-xs text-slate-500 font-mono">
              REAL-TIME RISK ESCALATION ALERTS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle size={28} className="text-red-400" />
            Active Early Warnings &amp; Disaster Alerts
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Automated threshold trigger alerts generated from IMD rainfall intensity, soil pore-pressure saturation, Sentinel-1 InSAR surface displacement, and network isolation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRespond}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <ShieldCheck size={15} />
            <span>Deploy Crisis Response</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Total Active Warnings</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-white">{alerts.length}</span>
            <span className="text-xs font-mono text-slate-400">Threat Alerts</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Real-time surveillance</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Critical Red Alerts</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-red-400">{criticalAlerts.length}</span>
            <span className="text-xs font-mono text-slate-400">Immediate Hazard</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Exceeds 80% dynamic risk threshold</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">High Risk Sectors</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-orange-400">{highAlerts.length}</span>
            <span className="text-xs font-mono text-slate-400">High Advisory</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">65% - 80% risk bracket</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Population Under Alert</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-cyan-400">48,200</span>
            <span className="text-xs font-mono text-slate-400">Civilians</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Within designated buffer zones</div>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 font-bold uppercase mr-1">Filter Severity:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              severityFilter === sev
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {sev === 'ALL' ? 'All Alerts' : sev}
          </button>
        ))}
      </div>

      {/* Alerts Feed Grid */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
            <div className="font-bold text-white text-base">No Alerts in Selected Bracket</div>
            <p className="text-xs text-slate-500 mt-1">All monitored mountain sectors are operating within standard tolerance parameters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 md:p-5 rounded-2xl border shadow-lg transition-all ${getSeverityStyle(
                alert.severity
              )}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
                  <span className="font-bold text-sm text-white">{alert.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-950/80 border border-slate-700">
                    {alert.severity}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                  <span className="text-slate-500 font-bold">{alert.id}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <p className="text-xs text-slate-200">{alert.description || ''}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                    {alert.zoneId && <span>Target Zone: <strong className="text-white">{alert.zoneId}</strong></span>}
                    {alert.source && <span>Trigger: <strong className="text-cyan-300">{alert.source}</strong></span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleInspect(alert.zoneId)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
                  >
                    <Eye size={14} className="text-blue-400" />
                    <span>Inspect on Map</span>
                  </button>

                  <button
                    onClick={handleRespond}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <ShieldCheck size={14} />
                    <span>Evacuate</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
