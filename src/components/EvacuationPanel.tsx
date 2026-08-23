import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Navigation,
  AlertTriangle,
  Building2,
  Users,
  Clock,
  CheckCircle,
  PhoneCall,
  Radio,
  ArrowUpRight,
  Route,
  Zap,
  Sliders,
  RotateCcw,
  Activity,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { EvacuationPlan, EvacuationRoute, RiskZone, RiskState } from '../types';

export default function EvacuationPanel({
  intel,
  onClose
}: {
  intel: any;
  onClose: () => void;
}) {
  const plan: EvacuationPlan = intel?.evacuationPlan || {
    totalPopulationExposed: 24810,
    populationRequiringEvacuation: 6420,
    sheltersRequired: 6,
    availableShelterCapacity: 6000,
    activeShelters: [],
    routes: [],
    isolatedCommunitiesCount: 0,
    isolatedPopulation: 0,
    threatenedInfrastructureCount: 0,
    actionProtocol: []
  };

  const zones: RiskZone[] = Array.isArray(intel?.zones) ? intel.zones : [];
  const selectedZoneId: string = intel?.selectedZoneId || 'Z-WAY-01';
  const selectedZone: RiskZone = zones.find(z => z.id === selectedZoneId) || zones[0] || {
    id: 'Z-WAY-01',
    name: 'Chooralmala-Meppadi Escarpment',
    state: 'Kerala',
    district: 'Wayanad',
    hillRange: 'Western Ghats',
    staticSusceptibility: 88,
    population: 4800,
    environmentalFeatures: { elevation: 1450, slope: 41, aspect: 'South-West', terrainRuggedness: 8.8, landCover: 'Tea Plantations & Escarpments', ndviChange: -0.24, drainage: 'Very High Runoff', lithology: 'Charnockite & Gneiss Complex', gsiSusceptibilityClass: 'Critical' }
  };

  const riskState: RiskState = intel?.riskStates?.[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 75,
    status: 'HIGH',
    primaryDriver: 'IMD Rain Anomaly & Soil Saturation',
    confidence: 90,
    featureContributions: []
  };

  const scenario = intel?.scenario || { active: false, type: 'Baseline', failedInfrastructureIds: [] };
  const isSimulated = scenario.active || scenario.failedInfrastructureIds?.length > 0;

  const defaultRoute = plan.routes[0];
  const [selectedRouteId, setSelectedRouteId] = useState<string>(defaultRoute?.settlementId || 'S-1');
  const [calculating, setCalculating] = useState<boolean>(false);

  const selectedRouteData = plan.routes.find(r => r.settlementId === selectedRouteId) || plan.routes[0];

  const handleCalculateEvacuation = (routeId?: string) => {
    const targetId = routeId || selectedRouteId;
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      const targetRoute = plan.routes.find(r => r.settlementId === targetId);
      if (targetRoute?.primaryRoute?.pathEdgeIds) {
        intel?.setHighlightedPathEdges(targetRoute.primaryRoute.pathEdgeIds);
        intel?.setSelectedInfrastructureId(targetId);
      }
    }, 200);
  };

  return (
    <div id="evacuation-response-panel" className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-start shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
              RESPONSE ENGINE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded font-semibold uppercase">
              DIJKSTRA ROUTING
            </span>
          </div>
          <h2 className="font-bold text-lg text-white mt-1 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            Disaster Response
          </h2>
          <p className="text-xs text-slate-400">
            Shortest Safe Corridors &amp; Mountain Triage Protocol
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Target Zone Selection / Switcher */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0 font-mono text-xs font-bold">
              {selectedZone.id.replace('Z-', '')}
            </div>
            <div className="truncate">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sector Triage Target</div>
              <div className="text-xs font-bold text-white truncate">{selectedZone.name} ({selectedZone.state})</div>
            </div>
          </div>

          <select
            value={selectedZone.id}
            onChange={e => intel?.setSelectedZoneId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[140px] truncate"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.name} ({z.state})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Evacuation Summary Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[9px]">Population Needing Relocation</span>
            <div className="text-xl font-extrabold font-mono text-amber-400">
              {plan.populationRequiringEvacuation.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Of {plan.totalPopulationExposed.toLocaleString()} exposed</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[9px]">Shelter Readiness</span>
            <div className="text-xl font-extrabold font-mono text-emerald-400">
              {plan.availableShelterCapacity.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Across designated relief centers</span>
          </div>
        </div>

        {/* 3. Dijkstra Safe Route Inspector */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Route size={14} className="text-emerald-400" />
              Settlement Evacuation Routes
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{plan.routes.length} Corridors</span>
          </div>

          <div className="space-y-2">
            {plan.routes.map(r => (
              <div
                key={r.settlementId}
                onClick={() => {
                  setSelectedRouteId(r.settlementId);
                  handleCalculateEvacuation(r.settlementId);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRouteId === r.settlementId
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{r.settlementName}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    r.isolated
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {r.isolated ? 'ISOLATED' : 'SAFE ROUTE'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Destination: {r.primaryRoute ? r.primaryRoute.targetName : 'No Open Path'}</span>
                  {r.primaryRoute ? (
                    <span className="font-mono font-bold text-emerald-400">
                      {r.primaryRoute.estimatedTimeMin} min ({r.primaryRoute.distanceKm} km)
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-red-400">BLOCKED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Action Protocol Directive */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-2.5">
          <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <CheckCircle2 size={14} className="text-blue-400" />
            Standard Evacuation Protocol (NDRF / SDRF)
          </h3>

          <div className="space-y-2 text-xs">
            {plan.actionProtocol && plan.actionProtocol.length > 0 ? (
              plan.actionProtocol.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">
                    {typeof step === 'string' ? step : `${(step as any).title ? (step as any).title + ': ' : ''}${(step as any).description || ''}`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-xs">
                Activate siren alerts, mobilize bus shuttles on open corridors, and secure vulnerable toe-slopes.
              </div>
            )}
          </div>
        </div>


        {/* 5. Navigation Actions */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-md grid grid-cols-2 gap-2">
          <button
            onClick={() => intel?.setActiveMode('LIVE')}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <RotateCcw size={13} />
            Live Map
          </button>

          <button
            onClick={() => intel?.setActiveMode('SIMULATE')}
            className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Sliders size={13} />
            Simulate Stress
          </button>
        </div>
      </div>
    </div>
  );
}
