import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RiskZone, InfrastructureNode, InfrastructureEdge, AppMode } from '../types';
import { Navigation, AlertTriangle, ShieldCheck, HeartPulse, Building2, Flame, Maximize2 } from 'lucide-react';

// Fallback icon definition for leaflet
const svgIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ef4444" stroke="%23ffffff" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>';
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: svgIcon,
    iconUrl: svgIcon,
    shadowUrl: '',
  });
} catch {
  // Safe fallback
}

// Controller component to smoothly center & pan map
function MapFlyController({
  selectedZoneId,
  selectedInfrastructureId,
  zones,
  nodes,
  edges
}: {
  selectedZoneId: string | null;
  selectedInfrastructureId: string | null;
  zones: RiskZone[];
  nodes: InfrastructureNode[];
  edges: InfrastructureEdge[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedInfrastructureId) {
      const node = nodes.find(n => n.id === selectedInfrastructureId);
      if (node?.coordinates) {
        map.flyTo(node.coordinates, 14, { duration: 1.2 });
        return;
      }
      const edge = edges.find(e => e.id === selectedInfrastructureId);
      if (edge) {
        const srcNode = nodes.find(n => n.id === edge.source);
        if (srcNode?.coordinates) {
          map.flyTo(srcNode.coordinates, 14, { duration: 1.2 });
          return;
        }
      }
    }

    if (selectedZoneId) {
      const zone = zones.find(z => z.id === selectedZoneId);
      if (zone?.coordinates) {
        map.flyTo(zone.coordinates, 13.5, { duration: 1.2 });
      }
    }
  }, [selectedZoneId, selectedInfrastructureId, zones, nodes, edges, map]);

  return null;
}

export default function MapComponent({ intel }: { intel: any }) {
  const defaultCenter: [number, number] = [27.0500, 88.3200]; // Regional Darjeeling-Kalimpong view

  const getRiskColor = (risk: number) => {
    if (risk >= 75) return '#ef4444'; // Red-500 Critical
    if (risk >= 60) return '#f97316'; // Orange-500 High
    if (risk >= 40) return '#eab308'; // Yellow-500 Moderate
    return '#10b981'; // Emerald-500 Low
  };

  const safeEdges = Array.isArray(intel?.edges) ? intel.edges : [];
  const safeNodes = Array.isArray(intel?.nodes) ? intel.nodes : [];
  const safeZones = Array.isArray(intel?.zones) ? intel.zones : [];
  const safeResults = Array.isArray(intel?.networkImpact?.results) ? intel.networkImpact.results : [];
  const failedIds: string[] = Array.isArray(intel?.scenario?.failedInfrastructureIds)
    ? intel.scenario.failedInfrastructureIds
    : [];

  const activeMode: AppMode = intel?.activeMode || 'LIVE';

  // Extract path edges for active evacuation plan
  const activeEvacuationEdges = useMemo(() => {
    const edgeSet = new Set<string>();
    if (intel?.highlightedPathEdges && Array.isArray(intel.highlightedPathEdges)) {
      intel.highlightedPathEdges.forEach((id: string) => edgeSet.add(id));
    }
    if (activeMode === 'RESPOND' && intel?.evacuationPlan?.routes) {
      intel.evacuationPlan.routes.forEach((r: any) => {
        if (r.primaryRoute?.pathEdgeIds) {
          r.primaryRoute.pathEdgeIds.forEach((eid: string) => edgeSet.add(eid));
        }
      });
    }
    return edgeSet;
  }, [intel?.highlightedPathEdges, intel?.evacuationPlan, activeMode]);

  return (
    <div id="interactive-gis-map-container" className="w-full h-full relative overflow-hidden bg-slate-950">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a> | Disaster GIS'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapFlyController
          selectedZoneId={intel?.selectedZoneId}
          selectedInfrastructureId={intel?.selectedInfrastructureId}
          zones={safeZones}
          nodes={safeNodes}
          edges={safeEdges}
        />

        {/* 1. Draw Infrastructure Edges (Roads & Bridges) */}
        {safeEdges.map((edge: InfrastructureEdge) => {
          if (!edge) return null;
          const source = safeNodes.find((n: InfrastructureNode) => n.id === edge.source);
          const target = safeNodes.find((n: InfrastructureNode) => n.id === edge.target);
          if (!source?.coordinates || !target?.coordinates) return null;

          const isFailed = failedIds.includes(edge.id) || failedIds.includes(edge.source) || failedIds.includes(edge.target);
          const isEvacRoute = activeEvacuationEdges.has(edge.id);
          const isSelected = intel?.selectedInfrastructureId === edge.id;

          let color = '#475569'; // slate-600 baseline
          let weight = 2.5;
          let dashArray: string | undefined = undefined;

          if (isFailed) {
            color = '#ef4444'; // Red-500
            weight = 4;
            dashArray = '8, 8';
          } else if (isEvacRoute) {
            color = '#10b981'; // Emerald-500 glowing evacuation line
            weight = 4.5;
          } else if (isSelected) {
            color = '#38bdf8'; // Sky-400
            weight = 4;
          }

          return (
            <Polyline
              key={edge.id}
              positions={[source.coordinates, target.coordinates]}
              pathOptions={{
                color,
                weight,
                dashArray,
                opacity: isFailed ? 0.9 : isEvacRoute ? 0.95 : 0.7
              }}
              eventHandlers={{
                click: () => {
                  intel?.setSelectedInfrastructureId(edge.id);
                  intel?.addActionLog('Inspecting Road/Bridge', `Selected corridor ${edge.name || edge.id} (${edge.type}).`);
                }
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-sans">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    {edge.name || edge.id}
                    <span className="text-[10px] uppercase font-normal px-1 py-0.2 bg-slate-200 rounded">
                      {edge.type}
                    </span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Travel Time: ~{edge.distance} min ({edge.lengthKm || 5} km)
                  </div>
                  <div className={`font-semibold text-[11px] mt-0.5 ${isFailed ? 'text-red-600' : isEvacRoute ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {isFailed ? '⛔ FAILED / BLOCKED' : isEvacRoute ? '🟢 ACTIVE EVACUATION ROUTE' : '⚪ OPERATIONAL'}
                  </div>
                </div>
              </Tooltip>

              <Popup>
                <div className="text-slate-900 font-sans text-xs p-1 max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-1.5">
                    <span className="font-bold text-sm text-slate-800">{edge.name || edge.id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isFailed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isFailed ? 'FAILED' : 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-slate-600">Connects: <span className="font-semibold text-slate-800">{source.name}</span> ↔ <span className="font-semibold text-slate-800">{target.name}</span></p>
                  <p className="text-slate-600 mt-0.5">Est. Transit: {edge.distance} mins</p>
                  
                  <button
                    onClick={() => intel?.simulateInfrastructureFailure(edge.id)}
                    className={`mt-2 w-full py-1 px-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isFailed 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isFailed ? 'Restore Corridor Access' : 'Simulate Debris Collapse'}
                  </button>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 2. Draw Risk Zones */}
        {safeZones.map((zone: RiskZone) => {
          if (!zone?.coordinates) return null;
          const riskState = intel?.riskStates?.[zone.id] || { currentRisk: zone.staticSusceptibility || 50 };
          const riskScore = riskState.currentRisk ?? 50;
          const color = getRiskColor(riskScore);
          const isSelected = intel?.selectedZoneId === zone.id;
          const isCritical = riskScore >= 75;

          return (
            <React.Fragment key={zone.id}>
              {/* Pulsing outer warning circle for critical risk */}
              {isCritical && (
                <Circle
                  center={zone.coordinates}
                  radius={(zone.radius || 1000) * 1.3}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '4, 6'
                  }}
                />
              )}

              {/* Main Zone Circle */}
              <Circle
                center={zone.coordinates}
                radius={zone.radius || 1000}
                pathOptions={{
                  color: isSelected ? '#ffffff' : color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.4 : isCritical ? 0.32 : 0.22,
                  weight: isSelected ? 3.5 : 2
                }}
                eventHandlers={{
                  click: () => {
                    intel?.setSelectedZoneId(zone.id);
                  }
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-sans">
                    <div className="font-bold text-slate-900 flex items-center justify-between gap-2">
                      <span>{zone.name}</span>
                      <span className="font-mono text-slate-500">[{zone.id}]</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-slate-600">Risk Index:</span>
                      <span className="font-bold text-xs" style={{ color }}>{riskScore}/100</span>
                      <span className="text-[10px] uppercase px-1 py-0.2 rounded font-semibold text-white" style={{ backgroundColor: color }}>
                        {riskState.status || 'MODERATE'}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Pop: {zone.population?.toLocaleString()} | Slope: {zone.environmentalFeatures.slope}°
                    </div>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="text-slate-900 font-sans text-xs p-1 max-w-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                      <h3 className="font-bold text-sm text-slate-900">{zone.name}</h3>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">{zone.id}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded mb-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Current Risk:</span>
                        <span className="font-bold text-sm" style={{ color }}>{riskScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">24h Forecast:</span>
                        <span className="font-bold text-sm text-slate-800">{riskState.forecast?.t24 || riskScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Exposed Pop:</span>
                        <span className="font-semibold text-slate-800">{zone.population?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Slope Angle:</span>
                        <span className="font-semibold text-slate-800">{zone.environmentalFeatures.slope}°</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mb-2 leading-tight">
                      <span className="font-semibold text-slate-700">Driver: </span>{riskState.primaryDriver}
                    </p>

                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <button
                        onClick={() => {
                          intel?.setSelectedZoneId(zone.id);
                          intel?.setActiveMode('FORECAST');
                          intel?.run24HForecast(zone.id);
                        }}
                        className="py-1 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold text-center transition-colors shadow-xs"
                      >
                        Forecast
                      </button>
                      <button
                        onClick={() => {
                          intel?.setSelectedZoneId(zone.id);
                          intel?.setActiveMode('SIMULATE');
                        }}
                        className="py-1 px-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold text-center transition-colors shadow-xs"
                      >
                        Simulate
                      </button>
                      <button
                        onClick={() => {
                          intel?.setSelectedZoneId(zone.id);
                          intel?.setActiveMode('RESPOND');
                        }}
                        className="py-1 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold text-center transition-colors shadow-xs"
                      >
                        Respond
                      </button>
                    </div>
                  </div>
                </Popup>
              </Circle>
            </React.Fragment>
          );
        })}

        {/* 3. Draw Infrastructure Nodes (Settlements, Hospitals, Shelters, Bridges) */}
        {safeNodes.map((node: InfrastructureNode) => {
          if (!node?.coordinates) return null;
          const impactInfo = safeResults.find((r: any) => r.settlementId === node.id);
          const isIsolated = !!impactInfo?.isolated;
          const isSelected = intel?.selectedInfrastructureId === node.id;

          let color = '#38bdf8'; // Sky-400 settlement
          let radius = 110;

          if (node.type === 'hospital') {
            color = '#10b981'; // Emerald-500
            radius = 180;
          } else if (node.type === 'shelter') {
            color = '#a855f7'; // Purple-500
            radius = 160;
          } else if (node.type === 'bridge') {
            color = '#f59e0b'; // Amber-500
            radius = 130;
          }

          if (isIsolated) {
            color = '#ef4444'; // Red-500 for isolated settlement
          }

          return (
            <Circle
              key={node.id}
              center={node.coordinates}
              radius={radius}
              pathOptions={{
                color: isSelected ? '#ffffff' : color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: isSelected ? 3 : 2
              }}
              eventHandlers={{
                click: () => {
                  intel?.setSelectedInfrastructureId(node.id);
                  intel?.addActionLog('Node Selected', `Selected facility ${node.name} (${node.type.toUpperCase()}).`);
                }
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-sans">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    {node.name}
                    <span className="text-[10px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-200">
                      {node.type}
                    </span>
                  </div>
                  {node.population && (
                    <div className="text-slate-600 text-[11px]">Pop: {node.population.toLocaleString()}</div>
                  )}
                  {node.capacity && (
                    <div className="text-slate-600 text-[11px]">Capacity: {node.capacity} beds/persons</div>
                  )}
                  {isIsolated && (
                    <div className="text-red-600 font-bold text-[11px] mt-0.5 flex items-center gap-1">
                      ⚠️ ISOLATED FROM MEDICAL FACILITY
                    </div>
                  )}
                </div>
              </Tooltip>

              <Popup>
                <div className="text-slate-900 font-sans text-xs p-1 max-w-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                    <span className="font-bold text-sm text-slate-800">{node.name}</span>
                    <span className="font-mono text-[10px] text-slate-500 font-bold">[{node.id}]</span>
                  </div>
                  
                  <div className="space-y-1 text-slate-600 text-[11px] mb-2">
                    <div className="flex justify-between">
                      <span>Facility Type:</span>
                      <span className="font-semibold capitalize text-slate-800">{node.type}</span>
                    </div>
                    {node.population && (
                      <div className="flex justify-between">
                        <span>Resident Population:</span>
                        <span className="font-semibold text-slate-800">{node.population.toLocaleString()}</span>
                      </div>
                    )}
                    {node.capacity && (
                      <div className="flex justify-between">
                        <span>Designated Capacity:</span>
                        <span className="font-semibold text-slate-800">{node.capacity} persons</span>
                      </div>
                    )}
                    {impactInfo && (
                      <div className="flex justify-between">
                        <span>Hospital Accessibility:</span>
                        <span className={`font-bold ${isIsolated ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isIsolated ? 'ISOLATED (0 Routes)' : `${impactInfo.travelTimeMinutes} mins (${impactInfo.distanceKm} km)`}
                        </span>
                      </div>
                    )}
                  </div>

                  {node.type === 'bridge' && (
                    <button
                      onClick={() => intel?.simulateInfrastructureFailure(node.id)}
                      className={`w-full py-1 px-2 rounded text-xs font-semibold transition-colors ${
                        failedIds.includes(node.id)
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {failedIds.includes(node.id) ? 'Restore Bridge Access' : 'Simulate Bridge Span Failure'}
                    </button>
                  )}
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>

      {/* Simulation Active Top Banner */}
      {activeMode === 'SIMULATE' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-amber-950/90 backdrop-blur-md border border-amber-500/80 px-4 py-2 rounded-xl text-xs font-bold text-amber-200 shadow-2xl flex items-center gap-3 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber-300">WHAT-IF SIMULATION PREVIEW:</span>
            <span className="text-white font-mono bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/60">
              {safeZones.find((z: any) => z.id === intel?.selectedZoneId)?.name || 'Tista Valley Sector A'} ({intel?.selectedZoneId || 'Z-042'})
            </span>
          </div>
          <button
            onClick={() => intel?.resetSimulation()}
            className="text-[10px] font-mono text-amber-400 hover:text-white underline ml-1 cursor-pointer"
          >
            Reset
          </button>
        </div>
      )}

      {/* Floating Map Legend & Layer Controller */}
      <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-xs shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-800">
          <span className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            GIS Surface
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {activeMode} MODE
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm"></span>
            <span className="text-slate-300">Critical Risk Sector (&ge;75)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow-sm"></span>
            <span className="text-slate-300">High Risk Sector (60-74)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            <span className="text-slate-300">Hospital / Relief Shelter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 inline-block shadow-sm"></span>
            <span className="text-slate-300">Settlement Community</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-400 inline-block rounded"></span>
            <span className="text-slate-300">Evacuation Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 border-b-2 border-dashed border-red-500 inline-block"></span>
            <span className="text-slate-300">Failed / Blocked Corridor</span>
          </div>
        </div>
      </div>

      {/* Floating Center Controls */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            intel?.setSelectedZoneId('Z-042');
            intel?.setSelectedInfrastructureId(null);
          }}
          className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg transition-colors"
          title="Center on Epicenter Sector"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          Focus Tista (Z-042)
        </button>

        <button
          onClick={() => intel?.resetSimulation()}
          className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          title="Reset Simulation State"
        >
          Reset Map
        </button>
      </div>
    </div>
  );
}
