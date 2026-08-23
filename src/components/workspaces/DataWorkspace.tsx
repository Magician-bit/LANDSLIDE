import React from 'react';
import {
  Database,
  Satellite,
  CloudRain,
  Activity,
  MapPin,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Zap
} from 'lucide-react';
import { DataSourceStatus } from '../../types';

export default function DataWorkspace({ intel }: { intel: any }) {
  const sources: DataSourceStatus[] = [
    {
      id: 'src-open-meteo',
      name: 'Open-Meteo Global NWP',
      agency: 'Open-Meteo / ECMWF IFS & GFS Assimilation',
      type: 'NWP Assimilation',
      status: 'LIVE',
      lastUpdated: '12 mins ago',
      details: 'High-resolution atmospheric numerical weather assimilation delivering 1h/24h precipitation, temperature, humidity, and 48h forward forecasts.',
      coverage: 'Pan-India 0.1° High-Res Grid',
      isLive: true
    },
    {
      id: 'src-usgs-ncs',
      name: 'USGS & NCS Seismic Network',
      agency: 'USGS Earthquake Hazards / National Centre for Seismology',
      type: 'Seismic Telemetry',
      status: 'LIVE',
      lastUpdated: '4 mins ago',
      details: 'Real-time seismic telemetry filtered for the Indian Plate margin (M2.5+), providing magnitude, epicenter depth, and ground vibration acceleration.',
      coverage: 'Indian Subcontinent & Himalayan Arc',
      isLive: true
    },
    {
      id: 'src-sentinel1',
      name: 'Copernicus Sentinel-1 InSAR',
      agency: 'European Space Agency (ESA) / Copernicus Open Access',
      type: 'Radar InSAR',
      status: 'CONNECTED',
      lastUpdated: '2 hours ago',
      details: 'Synthetic Aperture Radar (C-band SAR) differential interferometry measuring slope velocity, surface subsidence, and line-of-sight displacement.',
      coverage: '6-day Sentinel-1 Revisit Pass',
      isLive: true
    },
    {
      id: 'src-gsi-nlsm',
      name: 'GSI NLSM 1:50k Susceptibility Atlas',
      agency: 'Geological Survey of India (GSI)',
      type: 'Geology Baseline',
      status: 'BASELINE',
      lastUpdated: 'Verified Q3 Baseline',
      details: 'National Landslide Susceptibility Mapping baseline integrating 1:50,000 lithology, structural lineaments, slope morphometry, and geotechnical shear parameters.',
      coverage: '4.2 Lakh sq. km Landslide Prone Hills',
      isLive: false
    },
    {
      id: 'src-nrsc-atlas',
      name: 'NRSC ISRO National Landslide Inventory',
      agency: 'National Remote Sensing Centre (NRSC / ISRO)',
      type: 'Satellite Catalog',
      status: 'HISTORICAL',
      lastUpdated: 'Multi-temporal Atlas',
      details: 'Historical multi-temporal landslide event polygons catalogued across 147 vulnerable hill districts from IRS LISS-IV and Cartosat stereo pairs.',
      coverage: '147 Hill Districts Across 17 States',
      isLive: false
    },
    {
      id: 'src-citizen-reports',
      name: 'Citizen & Field Incident Grid',
      agency: 'Crowdsourced Field Scouts & District DEOC Desk',
      type: 'Community Reports',
      status: 'LIVE',
      lastUpdated: 'Just now',
      details: 'Ground-truthed citizen incident reports, drone reconnaissance photos, and SDRF verified field observations synchronized with local and backend storage.',
      coverage: 'Real-time Crowdsourced & DEOC Portal',
      isLive: true
    }
  ];

  return (
    <div id="data-workspace-root" className="h-full overflow-y-auto bg-slate-950 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800 uppercase">
              Pipeline Transparency & Provenance
            </span>
            <span className="text-xs font-mono text-slate-400">
              Multi-Source Ingestion Engine
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Database className="text-blue-400 w-6 h-6" />
            Data Feeds, Provenance & Ingestion Health
          </h1>
          <p className="text-xs text-slate-400">
            Audit live upstream APIs, satellite radar telemetry, and geological baseline inventories powering the Pan-India decision matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>6/6 Data Pipelines Operational</span>
          </div>
        </div>
      </div>

      {/* Grid of Data Source Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  {src.type}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                  src.status === 'LIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {src.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                  {src.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{src.name}</h3>
              <p className="text-xs text-blue-400 font-mono">{src.agency}</p>

              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                {src.details}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Coverage Scope:</span>
                <span className="text-slate-200">{src.coverage}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="text-emerald-400">{src.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
