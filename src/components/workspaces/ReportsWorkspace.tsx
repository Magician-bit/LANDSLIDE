import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Camera,
  Filter,
  Eye,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FieldReport, ReportStatus, IncidentType, IncidentSeverity } from '../../types';

interface ReportsWorkspaceProps {
  intel: any;
  onOpenReportModal: () => void;
  onNavigateToLiveMap: (coords?: [number, number]) => void;
}

export default function ReportsWorkspace({
  intel,
  onOpenReportModal,
  onNavigateToLiveMap
}: ReportsWorkspaceProps) {
  const reports: FieldReport[] = Array.isArray(intel?.reports) ? intel.reports : [];
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(reports[0] || null);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const confirmedCount = reports.filter((r) => r.status === 'CONFIRMED' || (r as any).verificationStatus === 'CONFIRMED').length;
  const pendingCount = reports.filter((r) => r.status === 'UNVERIFIED' || r.status === 'UNDER_REVIEW' || (r as any).verificationStatus === 'UNDER_REVIEW').length;
  const criticalCount = reports.filter((r) => String(r.severity).toUpperCase() === 'CRITICAL' || String(r.severity) === 'Severe').length;

  const getStatusBadge = (status?: string) => {
    const s = String(status || 'UNVERIFIED').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'DISMISSED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
    }
  };

  const getSeverityBadge = (sev?: string) => {
    const s = String(sev || 'Moderate').toUpperCase();
    if (s.includes('CRITICAL') || s.includes('SEVERE')) {
      return 'text-red-400 bg-red-950/80 border-red-800';
    }
    if (s.includes('HIGH')) {
      return 'text-orange-400 bg-orange-950/80 border-orange-800';
    }
    if (s.includes('MODERATE') || s.includes('MEDIUM')) {
      return 'text-yellow-400 bg-yellow-950/80 border-yellow-800';
    }
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
  };

  return (
    <div id="reports-workspace" className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800 font-bold">
              CROWDSOURCED GROUND SENSING
            </span>
            <span className="text-xs text-slate-500 font-mono">
              FIELD SCOUT &amp; CITIZEN INCIDENT REPORTS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText size={28} className="text-orange-400" />
            Field Incident Reports &amp; Moderation Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Real-time verified ground observations from local scouts, NDRF field teams, and mountain residents tracking tension cracks, day-lighting groundwater, and debris movements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="reports-submit-new-btn"
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Submit Hazard Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Total Ground Submissions</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-white">{reports.length}</span>
            <span className="text-xs font-mono text-slate-400">Reports In Gestalt</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Across 6 Indian Mountain Regions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Confirmed Geohazards</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-emerald-400">{confirmedCount}</span>
            <span className="text-xs font-mono text-slate-400">Field Verified</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Active in live prediction fusion</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Pending Verification</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-amber-400">{pendingCount}</span>
            <span className="text-xs font-mono text-slate-400">Awaiting Scout Review</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Requires optical validation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Critical Red Flags</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-red-400">{criticalCount}</span>
            <span className="text-xs font-mono text-slate-400">Imminent Danger</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Escalated to district disaster control</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-slate-400 font-bold uppercase mr-1">Status Filter:</span>
        {['ALL', 'UNVERIFIED', 'UNDER_REVIEW', 'CONFIRMED', 'DISMISSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {st === 'ALL' ? 'All Reports' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Reports List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports Cards List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              No reports matching the selected status filter.
            </div>
          ) : (
            filteredReports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 border-orange-500/80 shadow-lg shadow-orange-950'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{rep.locationName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getSeverityBadge(rep.severity)}`}>
                        {rep.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusBadge(rep.status)}`}>
                        {rep.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{rep.timestamp || 'Recent'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-3">
                    {(rep.imageUrl || (rep as any).photoUrl) && (
                      <img
                        src={rep.imageUrl || (rep as any).photoUrl}
                        alt="Incident Photo"
                        className="w-full sm:w-28 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-orange-400 font-mono">{rep.type || rep.incidentType || 'Slope Failure'}</div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{rep.description}</p>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center gap-3">
                        <span>Reported by: <strong className="text-slate-200">{rep.reporter || rep.reporterName || 'Scout'}</strong></span>
                        <span>Coords: {rep.location[0].toFixed(3)}°N, {rep.location[1].toFixed(3)}°E</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Report Inspection & Moderation Panel */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye size={18} className="text-orange-400" />
                Moderation &amp; Verification
              </h2>
              {selectedReport && (
                <span className="font-mono text-[10px] text-slate-500">{selectedReport.id}</span>
              )}
            </div>

            {selectedReport ? (
              <div className="space-y-4 pt-3">
                {(selectedReport.imageUrl || (selectedReport as any).photoUrl) && (
                  <div className="h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={selectedReport.imageUrl || (selectedReport as any).photoUrl}
                      alt="Full incident capture"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Location</div>
                  <div className="text-xs font-bold text-white mt-0.5">{selectedReport.locationName}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {selectedReport.location[0]}°N, {selectedReport.location[1]}°E
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500">Hazard Description</div>
                  <p className="text-xs text-slate-300 mt-0.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">REPORTER</span>
                    <span className="text-white font-bold">{selectedReport.reporter}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">SEVERITY</span>
                    <span className="text-red-400 font-bold">{selectedReport.severity}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                Select a report to inspect full imagery and perform verification.
              </div>
            )}
          </div>

          {/* Moderation Actions */}
          {selectedReport && (
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">Set Verification Status:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="verify-report-confirm-btn"
                  onClick={() => intel?.updateReportStatus(selectedReport.id, 'CONFIRMED')}
                  className="py-2 px-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={13} />
                  <span>Confirm</span>
                </button>

                <button
                  id="verify-report-review-btn"
                  onClick={() => intel?.updateReportStatus(selectedReport.id, 'UNDER_REVIEW')}
                  className="py-2 px-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Clock size={13} />
                  <span>Review</span>
                </button>

                <button
                  id="verify-report-dismiss-btn"
                  onClick={() => intel?.updateReportStatus(selectedReport.id, 'DISMISSED')}
                  className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <XCircle size={13} />
                  <span>Dismiss</span>
                </button>
              </div>

              <button
                onClick={() => onNavigateToLiveMap(selectedReport.location)}
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <MapPin size={13} className="text-red-400" />
                <span>Locate on Live GIS Map</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
