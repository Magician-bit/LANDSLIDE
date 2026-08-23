import React from 'react';
import {
  X,
  Radio,
  CheckCircle2,
  AlertCircle,
  Database,
  CloudRain,
  Satellite,
  Activity,
  Layers,
  Users,
  ShieldCheck,
  ExternalLink,
  Info
} from 'lucide-react';
import { DataSourceInfo } from '../types';

export default function DataSourcesModal({
  isOpen,
  onClose,
  dataSources
}: {
  isOpen: boolean;
  onClose: () => void;
  dataSources: DataSourceInfo[];
}) {
  if (!isOpen) return null;

  const getCategoryIcon = (category: DataSourceInfo['category']) => {
    switch (category) {
      case 'METEOROLOGY':
        return <CloudRain size={16} className="text-blue-400" />;
      case 'SATELLITE':
        return <Satellite size={16} className="text-purple-400" />;
      case 'SEISMIC':
        return <Activity size={16} className="text-orange-400" />;
      case 'GEOLOGY':
        return <Layers size={16} className="text-emerald-400" />;
      case 'HISTORICAL':
        return <Database size={16} className="text-cyan-400" />;
      case 'COMMUNITY':
        return <Users size={16} className="text-pink-400" />;
      default:
        return <Radio size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: DataSourceInfo['status']) => {
    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE FEED
          </span>
        );
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
            <CheckCircle2 size={12} />
            CONNECTED
          </span>
        );
      case 'BASELINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            NLSM BASELINE
          </span>
        );
      case 'HISTORICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
            ISRO ATLAS
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertCircle size={12} />
            PARTIAL PASS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-900 text-slate-500 border border-slate-800">
            STALE / OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Pan-India Data Feeds & Intelligence Providers
              </h2>
              <p className="text-xs text-slate-400">
                Transparent multi-source telemetry, sensor status, and scientific disclaimer
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Scientific Disclaimer Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
              <Info size={14} />
              AI-Assisted Multi-Source Intelligence Disclaimer
            </div>
            <p className="text-slate-400 leading-relaxed">
              This system provides <strong>AI-assisted multi-source landslide risk intelligence</strong> synthesizing satellite radar, meteorological observations, seismology, and geological mapping. <em>This platform is an operational situational awareness decision-support tool and does NOT claim to be a scientifically validated landslide prediction model.</em>
            </p>
            <p className="text-slate-500 text-[11px]">
              Always adhere to official evacuation directives and severe weather alerts issued by the <strong>National Disaster Management Authority (NDMA)</strong>, <strong>State Disaster Management Authorities (SDMAs)</strong>, and <strong>India Meteorological Department (IMD)</strong>.
            </p>
          </div>

          {/* Sources List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSources.map(src => (
              <div
                key={src.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {getCategoryIcon(src.category)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {src.name}
                        </h3>
                        <p className="text-[11px] text-slate-400">{src.provider}</p>
                      </div>
                    </div>
                    {getStatusBadge(src.status)}
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="border-t border-slate-900 pt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Coverage: {src.coverage.slice(0, 30)}...</span>
                  <span className="text-slate-400">{src.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Graceful Degradation Note */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Fault-Tolerant Degraded State Engine: </span>
              If any individual API or satellite orbital pass is delayed, the risk engine smoothly degrades to historical NRSC density, GSI macro-scale susceptibility, and regional meteorological baselines without interruption.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
