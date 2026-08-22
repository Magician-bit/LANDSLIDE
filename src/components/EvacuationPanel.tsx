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
  const selectedZoneId: string = intel?.selectedZoneId || 'Z-073';
  const selectedZone: RiskZone = zones.find(z => z.id === selectedZoneId) || zones[0] || {
    id: 'Z-073',
    name: 'Lebong Spur',
    staticSusceptibility: 72,
    population: 2900,
    environmentalFeatures: { elevation: 1840, slope: 42, aspect: 'East', terrainRuggedness: 8.9, landCover: 'Steep Urban Settlement', ndviChange: -0.22, drainage: 'Very High Runoff' }
  };

  const riskState: RiskState = intel?.riskStates?.[selectedZone.id] || {
    currentRisk: selectedZone.staticSusceptibility || 72,
    status: 'HIGH',
    primaryDriver: 'Rainfall anomaly',
    confidence: 90,
    featureContributions: []
  };

  const scenario = intel?.scenario || { active: false, type: 'Baseline', failedInfrastructureIds: [] };
  const isSimulated = scenario.active || scenario.failedInfrastructureIds?.length > 0;

  // Matching settlement for selected zone
  const zoneSettlementMap: Record<string, string> = {
    'Z-042': 'S-1', // Tista Valley -> Teesta Bazar
    'Z-091': 'S-4', // Kalimpong Ridge -> Kalimpong Central
    'Z-084': 'S-7', // Rimbick Valley -> Rimbick Cluster
    'Z-018': 'S-3', // Kurseong Sector -> Kurseong South
    'Z-055': 'S-5', // Sukhia Pokhri -> Sukhia Ward 2
    'Z-073': 'S-6', // Lebong Spur -> Lebong Cantonment
    'Z-033': 'S-2'  // Mirik Foothills -> Mirik Lake Settlement
  };

  const defaultSettlementId = zoneSettlementMap[selectedZone.id] || plan.routes[0]?.settlementId || 'S-6';
  const [selectedRouteId, setSelectedRouteId] = useState<string>(defaultSettlementId);
  const [calculating, setCalculating] = useState<boolean>(false);

  const selectedRouteData = plan.routes.find(r => r.settlementId === selectedRouteId) || plan.routes.find(r => r.settlementId === defaultSettlementId) || plan.routes[0];

  const handleCalculateEvacuation = (routeId?: string) => {
    const targetId = routeId || selectedRouteId || defaultSettlementId;
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
              <div className="text-xs font-bold text-white truncate">{selectedZone.name} · {selectedZone.id}</div>
            </div>
          </div>

          <select
            value={selectedZone.id}
            onChange={e => {
              const newZoneId = e.target.value;
              intel?.setSelectedZoneId(newZoneId);
              const mappedSettlement = zoneSettlementMap[newZoneId];
              if (mappedSettlement) {
                setSelectedRouteId(mappedSettlement);
                handleCalculateEvacuation(mappedSettlement);
              }
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.id} - {z.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Simulation Active Warning Banner (if simulated) */}
        {isSimulated && (
          <div className="p-3 bg-amber-950/70 border border-amber-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5 uppercase font-mono">
                <Sliders size={14} className="text-amber-400" />
                Simulated Conditions Active
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-900/80 rounded border border-amber-700">
                {scenario.type}
              </span>
            </div>
            <p className="text-[11px] text-amber-200 leading-tight">
              Evacuation routes reflect simulated conditions{scenario.failedInfrastructureIds?.length > 0 ? ` with disruptions on: ${scenario.failedInfrastructureIds.join(', ')}` : ''}.
            </p>
            <button
              onClick={() => intel?.resetSimulation()}
              className="text-[10px] font-bold text-amber-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={11} /> Reset to Live Baseline Conditions
            </button>
          </div>
        )}

        {/* 3. Triage & Population Risk Metrics Summary */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" />
              Sector Triage Metrics
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Live Assessment</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">CURRENT RISK</span>
              <div className={`text-lg font-extrabold font-mono mt-1 ${riskState.currentRisk >= 75 ? 'text-red-400' : 'text-amber-400'}`}>
                {riskState.currentRisk}%
              </div>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">{riskState.status}</span>
            </div>

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">POP. AT RISK</span>
              <div className="text-lg font-extrabold font-mono text-amber-300 mt-1">
                {selectedZone.population?.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400">Exposed Citizens</span>
            </div>

            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">SHELTER SLOTS</span>
              <div className="text-lg font-extrabold font-mono text-purple-300 mt-1">
                {plan.availableShelterCapacity.toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400">{plan.activeShelters.length} Shelters</span>
            </div>
          </div>
        </div>

        {/* 4. Isolated Communities Warning (if isolated) */}
        {plan.isolatedCommunitiesCount > 0 && (
          <div className="p-3.5 bg-red-950/70 border border-red-800/80 rounded-xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-1">
              <AlertTriangle size={15} />
              {plan.isolatedCommunitiesCount} Mountain Communities Isolated
            </div>
            <p className="text-xs text-red-200 leading-relaxed mb-2">
              {plan.isolatedPopulation.toLocaleString()} citizens cut off from ground medical facilities due to compromised infrastructure.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-red-300 font-mono">
              <Radio size={13} className="animate-pulse" /> Direct NDRF Helicopter Airlift Triggered
            </div>
          </div>
        )}

        {/* 5. EVACUATION ROUTE CALCULATION CARD */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Navigation size={14} className="text-emerald-400" />
              Evacuation Routing
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {selectedRouteData?.settlementName || 'Target Route'}
            </span>
          </div>

          {/* Calculate Evacuation Button */}
          <button
            onClick={() => handleCalculateEvacuation()}
            disabled={calculating}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer"
          >
            <Route size={15} />
            {calculating ? 'CALCULATING OPTIMAL PATHS...' : 'CALCULATE EVACUATION ROUTES'}
          </button>

          {/* Primary Route Output */}
          {selectedRouteData?.primaryRoute ? (
            <div className="p-3 bg-slate-900 border border-emerald-800/80 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  PRIMARY ROUTE (DIJKSTRA)
                </span>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedRouteData.isolated
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {selectedRouteData.isolated ? 'BLOCKED' : 'SAFE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Destination:</span>
                  <span className="font-bold text-white">{selectedRouteData.primaryRoute.targetName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Travel Time:</span>
                  <span className="font-mono font-bold text-emerald-300">{selectedRouteData.primaryRoute.estimatedTimeMin} mins</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Distance:</span>
                  <span className="font-mono text-slate-200">{selectedRouteData.primaryRoute.distanceKm} km</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Corridor Hazard:</span>
                  <span className="font-mono text-slate-200">{selectedRouteData.primaryRoute.riskFactor}% Risk</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
              No viable ground evacuation path available for this settlement. Helicopter airlift recommended.
            </div>
          )}

          {/* Backup Route Output */}
          {selectedRouteData?.backupRoute && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Secondary Contingency Route</span>
                <span className="font-mono text-[10px] text-slate-400">{selectedRouteData.backupRoute.estimatedTimeMin} mins</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Destination: <span className="text-slate-200">{selectedRouteData.backupRoute.targetName}</span></span>
                <span className="font-mono">{selectedRouteData.backupRoute.distanceKm} km</span>
              </div>
            </div>
          )}
        </div>

        {/* 6. All Monitored Settlement Corridors List */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-400" />
              Settlement Corridors ({plan.routes.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Select to inspect</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {plan.routes.map(r => {
              const isSelected = selectedRouteData?.settlementId === r.settlementId;
              const isIsolated = r.isolated;
              return (
                <div
                  key={r.settlementId}
                  onClick={() => {
                    setSelectedRouteId(r.settlementId);
                    handleCalculateEvacuation(r.settlementId);
                  }}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white block">{r.settlementName}</span>
                    <span className="text-[10px] text-slate-400">Pop: {r.population.toLocaleString()}</span>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isIsolated ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      {isIsolated ? 'ISOLATED' : `${r.primaryRoute?.distanceKm || 0} km`}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {isIsolated ? 'Airlift' : `${r.primaryRoute?.estimatedTimeMin || 0} mins`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Action Protocol Steps */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-md space-y-2.5">
          <h3 className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Clock size={14} className="text-amber-400" />
            Emergency Protocol Steps
          </h3>

          <div className="space-y-2">
            {plan.actionProtocol.slice(0, 3).map(step => (
              <div key={step.step} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400 text-[10px] uppercase font-mono">
                    PHASE {step.step}: {step.phase}
                  </span>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${step.priority === 'IMMEDIATE' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400'}`}>
                    {step.priority}
                  </span>
                </div>
                <h4 className="font-bold text-slate-200 text-xs mb-0.5">{step.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
