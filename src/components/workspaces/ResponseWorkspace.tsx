import React, { useState } from 'react';
import {
  ShieldCheck,
  HeartPulse,
  Building2,
  Users,
  AlertTriangle,
  MapPin,
  Compass,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Radio,
  Eye,
  Clock,
  Car
} from 'lucide-react';
import { InfrastructureNode, RiskZone } from '../../types';

interface ResponseWorkspaceProps {
  intel: any;
  onNavigateToLiveMap: (zoneId?: string) => void;
}

export default function ResponseWorkspace({ intel, onNavigateToLiveMap }: ResponseWorkspaceProps) {
  const plan = intel?.evacuationPlan || { routes: [], shelters: [], isolatedSettlements: [] };
  const routes = Array.isArray(plan.routes) ? plan.routes : [];
  const shelters = Array.isArray(plan.shelters) ? plan.shelters : [];
  const isolated = Array.isArray(plan.isolatedSettlements) ? plan.isolatedSettlements : [];
  const nodes: InfrastructureNode[] = Array.isArray(intel?.nodes) ? intel.nodes : [];

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  return (
    <div id="response-workspace" className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              CRISIS DISPATCH &bull; SOP AUTOMATION
            </span>
            <span className="text-xs text-slate-500 font-mono">
              EVACUATION ROUTING &amp; SHELTER ALLOCATION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck size={28} className="text-emerald-400" />
            Evacuation &amp; Emergency Dispatch Center
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Automated Dijkstra least-cost routing connecting vulnerable mountain settlements to designated NDRF relief camps and critical hospitals avoiding severed transit edges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="response-inspect-map-btn"
            onClick={() => onNavigateToLiveMap()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Eye size={14} />
            <span>Inspect Routes on Map</span>
          </button>
        </div>
      </div>

      {/* High-Level Response Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Active Evacuation Corridors</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-emerald-400">{routes.length}</span>
            <span className="text-xs font-mono text-slate-400">Routes Optimized</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Avoiding high shear risk zones
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Emergency Relief Capacity</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-blue-400">
              {shelters.reduce((acc: number, s: any) => acc + (s.capacity || 500), 0).toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400">Beds / Shelter Cap</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {shelters.length} Facilities Activated
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">Isolated Settlements</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-red-400">{isolated.length}</span>
            <span className="text-xs font-mono text-slate-400">Clusters Cut Off</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Require Helicopter / Aerial Lifeline
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="text-[11px] uppercase font-mono font-semibold text-slate-400">NDRF Battalion Readiness</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-400">LEVEL 1 ALERT</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            4th &amp; 10th NDRF Teams Staged
          </div>
        </div>
      </div>

      {/* Evacuation Routes Table & Relief Centers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Evacuation Routes List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Car size={18} className="text-emerald-400" />
                Active Evacuation Corridors &amp; Safe Paths
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dijkstra shortest path bypassing blocked edges and high-susceptibility escarpments
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">
              {routes.length} Active Corridors
            </span>
          </div>

          <div className="space-y-2.5">
            {routes.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-sm">
                No active routes calculated. Select a zone or trigger a simulation.
              </div>
            ) : (
              routes.map((r: any, i: number) => {
                const isSelected = selectedRouteId === r.id;
                return (
                  <div
                    key={r.id || i}
                    onClick={() => {
                      setSelectedRouteId(r.id);
                      if (r.primaryRoute?.pathEdgeIds) {
                        intel?.setHighlightedPathEdges(r.primaryRoute.pathEdgeIds);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-950'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            CORRIDOR #{i + 1}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {r.originName || r.zoneName || 'Sector Settlement'} &rarr; {r.destinationName || r.shelterName || 'Relief Center'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Compass size={12} /> {r.distanceKm || 12.4} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {r.estimatedTimeMinutes || 28} mins
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            Status: {r.status || 'CLEAR & SAFE'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (r.primaryRoute?.pathEdgeIds) {
                            intel?.setHighlightedPathEdges(r.primaryRoute.pathEdgeIds);
                          }
                          onNavigateToLiveMap();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 shrink-0 self-start sm:self-auto"
                      >
                        Inspect Route
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Relief Shelters & Hospitals Matrix */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 size={18} className="text-blue-400" />
              Designated Emergency Shelters
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Available capacity, generator backup, and medical supplies
            </p>
          </div>

          <div className="space-y-3">
            {shelters.map((s: any, i: number) => (
              <div key={s.id || i} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-white">{s.name}</div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold">
                    OPERATIONAL
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>Occupancy: {s.occupancy || 140} / {s.capacity || 500}</span>
                  <span className="text-blue-400">{Math.round(((s.occupancy || 140) / (s.capacity || 500)) * 100)}% Used</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((s.occupancy || 140) / (s.capacity || 500)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SOP Emergency Action Checklist */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Radio size={18} className="text-amber-400" />
            Standard Operating Procedures (SOP) Action Matrix
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
            NDMA &bull; SDMA Guidelines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400">PHASE 1 &bull; 0-2 HOURS</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <div className="font-bold text-xs text-white">Immediate Perimeter Evacuation</div>
            <p className="text-[11px] text-slate-400">
              Sound sirens and dispatch automated SMS cellular alerts to Chooralmala and Meppadi hill sectors. Order mandatory evacuation of slopes &gt;35°.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">PHASE 2 &bull; 2-6 HOURS</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="font-bold text-xs text-white">Bridge &amp; Transit Corridor Defense</div>
            <p className="text-[11px] text-slate-400">
              Deploy Indian Army Madras Sappers with Bailey Bridge staging kits to Vythiri-Meppadi cutoff points. Clear drainage culverts from debris.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">PHASE 3 &bull; 6-24 HOURS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="font-bold text-xs text-white">Relief Camp Operations &amp; Medevac</div>
            <p className="text-[11px] text-slate-400">
              Stock emergency trauma supplies and clean drinking water tankers at Sulthan Bathery Relief Center. Maintain aerial drone reconnaissance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
