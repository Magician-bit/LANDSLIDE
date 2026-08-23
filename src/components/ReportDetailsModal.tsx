import React from 'react';
import {
  X,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { FieldReport } from '../types';

export default function ReportDetailsModal({
  report,
  onClose,
  onVerify
}: {
  report: FieldReport | null;
  onClose: () => void;
  onVerify: (reportId: string, status: FieldReport['verificationStatus']) => void;
}) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Field Incident Report #{report.id.slice(-6)}
              </h2>
              <p className="text-xs text-slate-400">
                {report.incidentType} - {report.severity} Severity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400">Verification Status:</span>
            <span className={`font-bold font-mono px-2.5 py-0.5 rounded-full ${
              report.verificationStatus === 'CONFIRMED'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : report.verificationStatus === 'UNDER_REVIEW'
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : report.verificationStatus === 'DISMISSED'
                ? 'bg-red-950 text-red-400 border border-red-800'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {report.verificationStatus}
            </span>
          </div>

          {/* Location & Time */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-400 shrink-0" />
              <span><strong>Location:</strong> {report.locationName} ({report.district}, {report.state})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-400 shrink-0" />
              <span><strong>Reported:</strong> {new Date(report.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-400 shrink-0" />
              <span><strong>Reporter:</strong> {report.reporterName || 'Anonymous Citizen'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
              Field Observations
            </div>
            <p className="leading-relaxed">{report.description}</p>
          </div>

          {/* Image if available */}
          {report.imageUrl && (
            <div>
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={14} />
                Attached Incident Photo
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 max-h-56">
                <img src={report.imageUrl} alt="Incident attachment" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Impact indicators */}
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
              Impact Indicators
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded-lg border ${(report.impactFlags?.roadAffected ?? report.affectedRoad) ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                Road Traffic Cut: {(report.impactFlags?.roadAffected ?? report.affectedRoad) ? 'YES' : 'NO'}
              </div>
              <div className={`p-2 rounded-lg border ${(report.impactFlags?.buildingAffected ?? report.affectedBuilding) ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                Building Damage: {(report.impactFlags?.buildingAffected ?? report.affectedBuilding) ? 'YES' : 'NO'}
              </div>
              <div className={`p-2 rounded-lg border ${(report.impactFlags?.riverBlocked ?? report.riverBlocked) ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                River Blockage: {(report.impactFlags?.riverBlocked ?? report.riverBlocked) ? 'YES' : 'NO'}
              </div>
              <div className={`p-2 rounded-lg border ${(report.impactFlags?.evacuationRequired ?? report.evacuationRequired) ? 'bg-red-950/40 border-red-800 text-red-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                Evacuation Needed: {(report.impactFlags?.evacuationRequired ?? report.evacuationRequired) ? 'YES' : 'NO'}
              </div>
            </div>
          </div>

        </div>

        {/* Verification Moderation Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onVerify(report.id, 'DISMISSED');
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/50 border border-red-900/60 transition-colors flex items-center gap-1.5"
          >
            <XCircle size={14} />
            Dismiss Report
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onVerify(report.id, 'UNDER_REVIEW');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:bg-amber-950/50 border border-amber-900/60 transition-colors"
            >
              Under Review
            </button>
            <button
              onClick={() => {
                onVerify(report.id, 'CONFIRMED');
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              Confirm & Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
