import React from 'react';
import {
  X,
  HelpCircle,
  TrendingUp,
  Activity,
  Layers,
  CloudRain,
  Satellite,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { RiskZone, RiskState } from '../types';

export default function WhyRiskModal({
  isOpen,
  onClose,
  zone,
  riskState
}: {
  isOpen: boolean;
  onClose: () => void;
  zone: RiskZone | null;
  riskState: RiskState | null;
}) {
  if (!isOpen || !zone || !riskState) return null;

  const currentRisk = riskState.currentRisk;
  const staticSusc = zone.staticSusceptibility;
  const features = riskState.featureContributions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Why is the Risk Score {currentRisk}/100?
              </h2>
              <p className="text-xs text-slate-400">
                Multi-source deterministic feature attribution for {zone.name}
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
          {/* Dual Score Comparison Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                GSI Geological Susceptibility
              </div>
              <div className="text-2xl font-extrabold text-slate-200">
                {staticSusc}/100
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Static baseline predisposed by rock lithology, slope angle, and faults.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Current Dynamic Risk
              </div>
              <div className={`text-2xl font-extrabold ${
                currentRisk >= 75 ? 'text-red-400' : currentRisk >= 60 ? 'text-orange-400' : currentRisk >= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {currentRisk}/100 ({riskState.status})
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Real-time trigger composite incorporating live IMD rain, InSAR, & seismic.
              </p>
            </div>
          </div>

          {/* Transparent AI Explanation */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200 leading-relaxed">
            <span className="font-bold text-blue-300">Deterministic Diagnosis: </span>
            {riskState.explanation}
          </div>

          {/* Feature Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Multi-Source Factor Attributions</span>
              <span className="text-[11px] text-slate-500 font-mono">Normalized Weight</span>
            </h3>

            <div className="space-y-2.5">
              {features.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <span>{item.feature}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {item.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{item.statusText}</span>
                      <span className="font-mono font-bold text-blue-400 text-xs w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-indigo-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Confidence */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Multi-Sensor Consensus & Confidence:</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {riskState.confidence}% (Data Coverage: {riskState.dataCoverage}%)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
