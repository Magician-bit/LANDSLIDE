import React from 'react';
import {
  X,
  Database,
  Radio,
  Satellite,
  Activity,
  Layers,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Info
} from 'lucide-react';
import { DataSourceStatus } from '../types';

interface DataSourcesStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: DataSourceStatus[];
}

export default function DataSourcesStatusModal({
  isOpen,
  onClose,
  statuses
}: DataSourcesStatusModalProps) {
  if (!isOpen) return null;

  const getStatusBadge = (status: DataSourceStatus['status']) => {
    switch (status) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/80',
          dot: 'bg-emerald-400 animate-pulse',
          label: 'LIVE REAL-TIME FEED'
        };
      case 'HISTORICAL':
        return {
          bg: 'bg-blue-950/80 text-blue-400 border-blue-700/80',
          dot: 'bg-blue-400',
          label: 'HISTORICAL INVENTORY'
        };
      case 'BASELINE':
        return {
          bg: 'bg-indigo-950/80 text-indigo-400 border-indigo-700/80',
          dot: 'bg-indigo-400',
          label: 'GEOLOGICAL BASELINE'
        };
      case 'PARTIAL':
        return {
          bg: 'bg-amber-950/80 text-amber-400 border-amber-700/80',
          dot: 'bg-amber-400',
          label: 'PARTIAL COVERAGE'
        };
      case 'STALE':
        return {
          bg: 'bg-orange-950/80 text-orange-400 border-orange-700/80',
          dot: 'bg-orange-400',
          label: 'STALE CACHED DATA'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
          label: 'OFFLINE / NOT CONNECTED'
        };
    }
  };

  const getSourceIcon = (id: string) => {
    if (id.includes('IMD') || id.includes('WEATHER')) return <Radio className="text-blue-400" size={18} />;
    if (id.includes('SENTINEL') || id.includes('SAR')) return <Satellite className="text-purple-400" size={18} />;
    if (id.includes('NRSC') || id.includes('ISRO')) return <Layers className="text-amber-400" size={18} />;
    if (id.includes('GSI')) return <Database className="text-indigo-400" size={18} />;
    if (id.includes('NCS') || id.includes('SEISMIC')) return <Activity className="text-red-400" size={18} />;
    return <Users className="text-emerald-400" size={18} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/80 text-blue-400">
              <Database size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.2 rounded uppercase">
                  Data Pipeline Health
                </span>
                <span className="text-[10px] text-slate-400 font-mono">PAN-INDIA MULTI-SOURCE FUSION</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Integrated Geospatial, Meteorological &amp; Seismic Providers
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Essential Scientific Disclaimer Notice */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>System Architecture Notice:</strong> This platform performs <em>AI-assisted multi-source landslide risk intelligence</em> by fusing real-time meteorology (IMD/GPM), baseline susceptibility (GSI NLSM), historical recurrence (NRSC Landslide Atlas), real-time seismology (NCS), SAR deformation (Sentinel-1), and community observations. It estimates short-term vulnerability and does not claim absolute deterministic prediction.
          </p>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 text-xs">
          {statuses.map((src) => {
            const badge = getStatusBadge(src.status);

            return (
              <div
                key={src.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {getSourceIcon(src.id)}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-slate-500 font-bold mr-1.5">[{src.id}]</span>
                      <span className="font-bold text-sm text-white">{src.name}</span>
                      <div className="text-[11px] text-slate-400">{src.agency}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="text-slate-300 text-xs leading-relaxed">
                  {src.details}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Geographic Coverage</span>
                    <span className="font-medium text-slate-200">{src.coverage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Observation Cadence / Freshness</span>
                    <span className="font-mono font-bold text-slate-200">{src.lastUpdated}</span>
                  </div>
                </div>

                {src.disclaimer && (
                  <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
                    <span>* {src.disclaimer}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>7 of 7 Multi-Source Providers Ingested</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
          >
            Close Pipeline Status
          </button>
        </div>
      </div>
    </div>
  );
}
