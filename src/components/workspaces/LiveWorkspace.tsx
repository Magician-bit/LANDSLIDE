import React, { useState } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Activity,
  AlertTriangle,
  MapPin,
  Compass,
  Zap,
  Info,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import MapComponent from '../MapComponent';
import LocationIntelligence from '../LocationIntelligence';
import TimelineBar from '../TimelineBar';
import { MapErrorBoundary } from '../MapErrorBoundary';
import { RiskZone } from '../../types';

export default function LiveWorkspace({
  intel,
  onOpenAiModal,
  onOpenReportModal
}: {
  intel: any;
  onOpenAiModal: () => void;
  onOpenReportModal: () => void;
}) {
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState<boolean>(false);

  const zones: RiskZone[] = Array.isArray(intel?.zones) ? intel.zones : [];
  const selectedZoneId: string = intel?.selectedZoneId || 'Z-WAY-01';
  const currentIndex = zones.findIndex((z) => z.id === selectedZoneId);

  const handlePrevZone = () => {
    if (zones.length === 0) return;
    const nextIdx = (currentIndex - 1 + zones.length) % zones.length;
    intel?.setSelectedZoneId(zones[nextIdx].id);
  };

  const handleNextZone = () => {
    if (zones.length === 0) return;
    const nextIdx = (currentIndex + 1) % zones.length;
    intel?.setSelectedZoneId(zones[nextIdx].id);
  };

  return (
    <div id="live-workspace-root" className="relative w-full h-full flex overflow-hidden bg-slate-950">
      {/* Interactive GIS Map Canvas */}
      <div className="flex-1 relative h-full w-full">
        <MapErrorBoundary>
          <MapComponent intel={intel} />
        </MapErrorBoundary>

        {/* Floating Time Travel Timeline Bar */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[400] max-w-[95vw] pointer-events-auto">
          <TimelineBar
            timelineStep={intel?.timelineStep || 'NOW'}
            setTimelineStep={intel?.setTimelineStep}
          />
        </div>

        {/* Floating Quick Zone Stepper (Top Left) */}
        <div className="absolute top-4 left-4 z-[400] bg-slate-950/90 border border-slate-800 rounded-xl p-2 shadow-2xl backdrop-blur-md flex items-center gap-2">
          <button
            onClick={handlePrevZone}
            title="Previous Hazard Sector"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="text-center px-1 min-w-[130px]">
            <span className="text-[10px] font-mono text-slate-400 block uppercase leading-none">
              Sector {currentIndex + 1} of {zones.length}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[150px] block">
              {zones[currentIndex]?.name || 'Wayanad Sector'}
            </span>
          </div>

          <button
            onClick={handleNextZone}
            title="Next Hazard Sector"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Floating Map Layers Control (Top Left below stepper) */}
        <div className="absolute top-18 left-4 z-[400]">
          <button
            onClick={() => setIsLayersMenuOpen((prev) => !prev)}
            className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs font-bold text-slate-200 transition-colors"
          >
            <Layers size={14} className="text-blue-400" />
            <span>Map Layers</span>
          </button>

          {isLayersMenuOpen && (
            <div className="mt-2 bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md w-56 space-y-2 text-xs">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                <span>Active GIS Overlays</span>
                <button onClick={() => setIsLayersMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>

              <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={intel?.activeLayers?.gsiSusceptibility ?? true}
                  onChange={() => intel?.toggleLayer?.('gsiSusceptibility')}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>GSI NLSM Susceptibility</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={intel?.activeLayers?.satelliteDeformation ?? true}
                  onChange={() => intel?.toggleLayer?.('satelliteDeformation')}
                  className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>Sentinel-1 InSAR Deformation</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={intel?.activeLayers?.seismic ?? true}
                  onChange={() => intel?.toggleLayer?.('seismic')}
                  className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0"
                />
                <span>USGS / NCS Seismic Tremors</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={intel?.activeLayers?.reports ?? true}
                  onChange={() => intel?.toggleLayer?.('reports')}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>Citizen Incident Reports</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={intel?.activeLayers?.infrastructure ?? true}
                  onChange={() => intel?.toggleLayer?.('infrastructure')}
                  className="rounded bg-slate-800 border-slate-700 text-amber-600 focus:ring-0"
                />
                <span>Emergency Hubs & Hospitals</span>
              </label>
            </div>
          )}
        </div>

        {/* Toggle Inspector Button if closed */}
        {!isInspectorOpen && (
          <button
            onClick={() => setIsInspectorOpen(true)}
            className="absolute top-4 right-4 z-[400] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Activity size={14} />
            <span>Open Sector Inspector</span>
          </button>
        )}
      </div>

      {/* Right Contextual Inspector Side Panel */}
      {isInspectorOpen && (
        <div className="w-full md:w-96 lg:w-[420px] xl:w-[450px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full shrink-0 z-30">
          <LocationIntelligence
            intel={intel}
            onClose={() => setIsInspectorOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
