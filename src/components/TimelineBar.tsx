import React from 'react';
import { Clock, Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { TimelineStep } from '../types';

export default function TimelineBar({
  timelineStep,
  setTimelineStep,
  onReset
}: {
  timelineStep: TimelineStep;
  setTimelineStep: (step: TimelineStep) => void;
  onReset?: () => void;
}) {
  const steps: { id: TimelineStep; label: string; offset: string; type: 'past' | 'present' | 'future' }[] = [
    { id: 'PAST_24H', label: '-24h', offset: 'T-24H', type: 'past' },
    { id: 'PAST_6H', label: '-6h', offset: 'T-6H', type: 'past' },
    { id: 'NOW', label: 'NOW', offset: 'Live Telemetry', type: 'present' },
    { id: 'T_PLUS_6H', label: '+6h', offset: 'T+6H', type: 'future' },
    { id: 'T_PLUS_12H', label: '+12h', offset: 'T+12H', type: 'future' },
    { id: 'T_PLUS_24H', label: '+24h', offset: 'T+24H', type: 'future' },
    { id: 'T_PLUS_48H', label: '+48h', offset: 'T+48H', type: 'future' }
  ];

  return (
    <div
      id="time-travel-timeline-bar"
      className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2 shadow-2xl flex items-center justify-between gap-4 text-xs select-none"
    >
      <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] shrink-0">
        <Clock size={14} className="text-blue-400" />
        <span className="font-bold text-white">Time Travel:</span>
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-bold uppercase">
          {steps.find(s => s.id === timelineStep)?.offset || 'NOW'}
        </span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto py-1">
        {steps.map(s => {
          const isActive = timelineStep === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setTimelineStep(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                isActive
                  ? s.type === 'present'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : s.type === 'future'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-700 text-white shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-400 border border-slate-800/80'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
