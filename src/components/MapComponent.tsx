import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RiskZone, InfrastructureNode, InfrastructureEdge, AppMode, RegionCategory, Region, FieldReport, SeismicEvent } from '../types';
import { REGION_DEFINITIONS } from '../utils/regionUtils';
import {
  Navigation,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  Building2,
  Flame,
  Maximize2,
  Radio,
  Layers,
  Activity,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Crosshair,
  Compass,
  ArrowRight
} from 'lucide-react';

// Fallback icon definition for leaflet
const svgIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ef4444" stroke="%23ffffff" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>';
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: svgIcon,
    iconUrl: svgIcon,
    shadowUrl: ''
  });
} catch {
  // Safe fallback
}

// Controller component to smoothly center & pan map
function MapFlyController({
  selectedZoneId,
  selectedInfrastructureId,
  selectedRegion,
  zones,
  nodes,
  edges
}: {
  selectedZoneId: string | null;
  selectedInfrastructureId: string | null;
  selectedRegion: Region | string;
  zones: RiskZone[];
  nodes: InfrastructureNode[];
  edges: InfrastructureEdge[];
}) {
  const map = useMap();

  // Invalidate map size on mount and update to prevent container sizing glitches
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Handle region zoom/pan transitions
  useEffect(() => {
    if (selectedRegion && REGION_DEFINITIONS[selectedRegion as Region]) {
      const regDef = REGION_DEFINITIONS[selectedRegion as Region];
      if (regDef.bounds) {
        map.fitBounds(regDef.bounds, { padding: [30, 30], maxZoom: regDef.zoom, duration: 1.2 });
      } else {
        map.flyTo(regDef.center, regDef.zoom, { duration: 1.2 });
      }
    }
  }, [selectedRegion, map]);

  useEffect(() => {
    if (selectedInfrastructureId) {
      const node = nodes.find((n) => n.id === selectedInfrastructureId);
      if (node?.coordinates) {
        map.flyTo(node.coordinates, 14, { duration: 1.2 });
        return;
      }
      const edge = edges.find((e) => e.id === selectedInfrastructureId);
      if (edge) {
        const srcNode = nodes.find((n) => n.id === edge.source);
        if (srcNode?.coordinates) {
          map.flyTo(srcNode.coordinates, 14, { duration: 1.2 });
          return;
        }
      }
    }

    if (selectedZoneId) {
      const zone = zones.find((z) => z.id === selectedZoneId);
      if (zone?.coordinates) {
        map.flyTo(zone.coordinates, 13.5, { duration: 1.2 });
      }
    }
  }, [selectedZoneId, selectedInfrastructureId, zones, nodes, edges, map]);

  return null;
}

export default function MapComponent({ intel }: { intel: any }) {
  const defaultCenter: [number, number] = [11.5312, 76.1384]; // Wayanad Default

  const [showReportsLayer, setShowReportsLayer] = useState(true);
  const [showSeismicLayer, setShowSeismicLayer] = useState(true);
  const [showInfrastructureLayer, setShowInfrastructureLayer] = useState(true);

  const getRiskColor = (risk: number) => {
    if (risk >= 75) return '#ef4444'; // Red-500 Critical
    if (risk >= 60) return '#f97316'; // Orange-500 High
    if (risk >= 40) return '#eab308'; // Yellow-500 Moderate
    return '#10b981'; // Emerald-500 Low
  };

  const safeEdges = Array.isArray(intel?.filteredEdges) ? intel.filteredEdges : [];
  const safeNodes = Array.isArray(intel?.filteredNodes) ? intel.filteredNodes : [];
  const safeZones = Array.isArray(intel?.filteredZones) ? intel.filteredZones : [];
  const allZones = Array.isArray(intel?.zones) ? intel.zones : [];
  const safeReports = Array.isArray(intel?.reports) ? intel.reports : [];
  const safeSeismic = Array.isArray(intel?.seismicEvents) ? intel.seismicEvents : [];
  const safeResults = Array.isArray(intel?.networkImpact?.results) ? intel.networkImpact.results : [];
  const failedIds: string[] = Array.isArray(intel?.scenario?.failedInfrastructureIds)
    ? intel.scenario.failedInfrastructureIds
    : [];

  const activeMode: AppMode = intel?.activeMode || 'LIVE';
  const selectedRegion: RegionCategory | 'ALL' = intel?.selectedRegion || 'ALL';

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

  const regionPills: { id: RegionCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All India' },
    { id: 'Western Ghats', label: 'Western Ghats' },
    { id: 'Western Himalayas', label: 'Western Himalayas' },
    { id: 'Eastern Himalayas', label: 'Eastern Himalayas' },
    { id: 'Northeast Hills', label: 'Northeast Hills' },
    { id: 'Eastern Ghats & Nilgiris', label: 'Nilgiris / Eastern' }
  ];

  // High-Risk Zone Navigator Sorting State
  const [navigatorSortMode, setNavigatorSortMode] = useState<'RISK' | 'HISTORICAL' | 'POPULATION'>('RISK');

  const sortedNavigatorZones = useMemo(() => {
    const list = [...safeZones];
    if (navigatorSortMode === 'RISK') {
      return list.sort((a, b) => {
        const riskA = intel?.riskStates?.[a.id]?.totalRisk ?? a.staticSusceptibility;
        const riskB = intel?.riskStates?.[b.id]?.totalRisk ?? b.staticSusceptibility;
        return riskB - riskA;
      });
    }
    if (navigatorSortMode === 'HISTORICAL') {
      return list.sort((a, b) => (b.historicalLandslideCount || 0) - (a.historicalLandslideCount || 0));
    }
    return list.sort((a, b) => b.population - a.population);
  }, [safeZones, navigatorSortMode, intel?.riskStates]);

  const currentNavIndex = useMemo(() => {
    if (!intel?.selectedZoneId) return 0;
    const idx = sortedNavigatorZones.findIndex((z) => z.id === intel.selectedZoneId);
    return idx >= 0 ? idx : 0;
  }, [sortedNavigatorZones, intel?.selectedZoneId]);

  const handleNavPrev = () => {
    if (sortedNavigatorZones.length === 0) return;
    const prevIdx = (currentNavIndex - 1 + sortedNavigatorZones.length) % sortedNavigatorZones.length;
    const target = sortedNavigatorZones[prevIdx];
    if (target) {
      intel?.setSelectedZoneId(target.id);
    }
  };

  const handleNavNext = () => {
    if (sortedNavigatorZones.length === 0) return;
    const nextIdx = (currentNavIndex + 1) % sortedNavigatorZones.length;
    const target = sortedNavigatorZones[nextIdx];
    if (target) {
      intel?.setSelectedZoneId(target.id);
    }
  };

  const currentNavZone = sortedNavigatorZones[currentNavIndex] || sortedNavigatorZones[0] || null;
  const currentNavRisk = currentNavZone ? (intel?.riskStates?.[currentNavZone.id]?.totalRisk ?? currentNavZone.staticSusceptibility) : 0;


  return (
    <div id="interactive-gis-map-container" className="w-full h-full relative overflow-hidden bg-slate-950">
      <MapContainer center={defaultCenter} zoom={11} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a> | Pan-India Landslide GIS'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapFlyController
          selectedZoneId={intel?.selectedZoneId}
          selectedInfrastructureId={intel?.selectedInfrastructureId}
          selectedRegion={intel?.selectedRegion || 'india'}
          zones={allZones}
          nodes={intel?.nodes || []}
          edges={intel?.edges || []}
        />

        {/* 1. Draw Infrastructure Edges (Roads & Bridges) */}
        {showInfrastructureLayer &&
          safeEdges.map((edge: InfrastructureEdge) => {
            if (!edge) return null;
            const source = safeNodes.find((n: InfrastructureNode) => n.id === edge.source);
            const target = safeNodes.find((n: InfrastructureNode) => n.id === edge.target);
            if (!source?.coordinates || !target?.coordinates) return null;

            const isFailed = failedIds.includes(edge.id) || failedIds.includes(edge.source) || failedIds.includes(edge.target);
            const isEvacRoute = activeEvacuationEdges.has(edge.id);
            const isSelected = intel?.selectedInfrastructureId === edge.id;

            let color = '#475569';
            let weight = 2.5;
            let dashArray: string | undefined = undefined;

            if (isFailed) {
              color = '#ef4444';
              weight = 4;
              dashArray = '8, 8';
            } else if (isEvacRoute) {
              color = '#10b981';
              weight = 4.5;
            } else if (isSelected) {
              color = '#38bdf8';
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
                    intel?.addActionLog('Inspecting Corridor', `Selected ${edge.name || edge.id} (${edge.type}).`);
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
                      Est. Transit: ~{edge.distance} min ({edge.lengthKm || 5} km)
                    </div>
                    <div className={`font-semibold text-[11px] mt-0.5 ${isFailed ? 'text-red-600' : isEvacRoute ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {isFailed ? '⛔ FAILED / BLOCKED' : isEvacRoute ? '🟢 ACTIVE EVACUATION CORRIDOR' : '⚪ OPERATIONAL'}
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
                  radius={(zone.radius || 1200) * 1.35}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.12,
                    weight: 1,
                    dashArray: '4, 6'
                  }}
                />
              )}

              {/* Main Zone Circle */}
              <Circle
                center={zone.coordinates}
                radius={zone.radius || 1200}
                pathOptions={{
                  color: isSelected ? '#ffffff' : color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.42 : isCritical ? 0.32 : 0.22,
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
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      {zone.district}, {zone.state} ({zone.regionCategory})
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-slate-600">Dynamic Risk:</span>
                      <span className="font-bold text-xs" style={{ color }}>{riskScore}/100</span>
                      <span className="text-[10px] uppercase px-1 py-0.2 rounded font-semibold text-white" style={{ backgroundColor: color }}>
                        {riskState.status || 'MODERATE'}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[10px] mt-0.5">
                      Pop: {zone.population?.toLocaleString()} | Slope: {zone.environmentalFeatures.slope}° | GSI: {zone.gsiSusceptibilityClass}
                    </div>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="text-slate-900 font-sans text-xs p-1 max-w-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{zone.name}</h3>
                        <span className="text-[10px] text-slate-500">{zone.district}, {zone.state}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">[{zone.id}]</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded mb-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Dynamic Risk:</span>
                        <span className="font-bold text-sm" style={{ color }}>{riskScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">24h Forecast:</span>
                        <span className="font-bold text-sm text-slate-800">{riskState.forecast?.t24 || riskScore}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">GSI Baseline:</span>
                        <span className="font-semibold text-slate-800">{zone.gsiSusceptibilityClass || 'High'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">NRSC Events:</span>
                        <span className="font-semibold text-slate-800">{zone.historicalLandslideCount || 20} logged</span>
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

        {/* 3. Draw Community Incident Reports */}
        {showReportsLayer &&
          safeReports.map((rep: FieldReport) => {
            if (!rep?.location) return null;
            const isConfirmed = rep.status === 'CONFIRMED';
            const isCritical = rep.severity === 'Critical';

            return (
              <Circle
                key={rep.id}
                center={rep.location}
                radius={220}
                pathOptions={{
                  color: isCritical ? '#ef4444' : isConfirmed ? '#10b981' : '#f59e0b',
                  fillColor: isCritical ? '#ef4444' : isConfirmed ? '#10b981' : '#f59e0b',
                  fillOpacity: 0.85,
                  weight: 2
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-sans">
                    <div className="font-bold text-slate-900 flex items-center justify-between gap-2">
                      <span>📢 {rep.type}</span>
                      <span className={`text-[9px] font-bold px-1 py-0.2 rounded text-white ${isConfirmed ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                        {rep.status}
                      </span>
                    </div>
                    <div className="text-slate-700 text-[11px] mt-0.5">{rep.locationName}</div>
                    <div className="text-slate-600 text-[10px] mt-0.5">By: {rep.reporter} • Severity: {rep.severity}</div>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="text-slate-900 font-sans text-xs p-1 max-w-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                      <span className="font-bold text-slate-900">Community Incident Report</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">{rep.locationName}</p>
                    <p className="text-slate-600 text-[11px] mt-1">{rep.description}</p>
                    
                    <div className="mt-2 text-[10px] text-slate-500">
                      Reported by: <span className="font-medium text-slate-700">{rep.reporter}</span>
                    </div>

                    {!isConfirmed && (
                      <button
                        onClick={() => intel?.updateReportStatus(rep.id, 'CONFIRMED')}
                        className="mt-2 w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors"
                      >
                        Corroborate &amp; Confirm Report
                      </button>
                    )}
                  </div>
                </Popup>
              </Circle>
            );
          })}

        {/* 4. Draw Seismic Tremors */}
        {showSeismicLayer &&
          safeSeismic.map((eq: SeismicEvent) => {
            if (!eq?.coordinates) return null;
            return (
              <Circle
                key={eq.id}
                center={eq.coordinates}
                radius={Math.max(600, eq.magnitude * 250)}
                pathOptions={{
                  color: '#a855f7',
                  fillColor: '#a855f7',
                  fillOpacity: 0.25,
                  weight: 1.5,
                  dashArray: '3, 4'
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-sans">
                    <div className="font-bold text-purple-900">⚡ M{eq.magnitude} Seismic Tremor</div>
                    <div className="text-slate-700 text-[11px]">{eq.locationName}</div>
                    <div className="text-slate-600 text-[10px]">Depth: {eq.depthKm} km • {eq.source}</div>
                  </div>
                </Tooltip>
              </Circle>
            );
          })}

        {/* 5. Draw Infrastructure Nodes */}
        {showInfrastructureLayer &&
          safeNodes.map((node: InfrastructureNode) => {
            if (!node?.coordinates) return null;
            const impactInfo = safeResults.find((r: any) => r.settlementId === node.id);
            const isIsolated = !!impactInfo?.isolated;
            const isSelected = intel?.selectedInfrastructureId === node.id;

            let color = '#38bdf8';
            let radius = 110;

            if (node.type === 'hospital') {
              color = '#10b981';
              radius = 180;
            } else if (node.type === 'shelter') {
              color = '#a855f7';
              radius = 160;
            } else if (node.type === 'bridge') {
              color = '#f59e0b';
              radius = 130;
            }

            if (isIsolated) {
              color = '#ef4444';
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
                    intel?.addActionLog('Facility Selected', `Selected ${node.name} (${node.type.toUpperCase()}).`);
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

      {/* Top Pan-India Region Selector Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl shadow-2xl flex items-center gap-1 max-w-[95vw] overflow-x-auto pointer-events-auto">
        {regionPills.map((rp) => (
          <button
            key={rp.id}
            onClick={() => {
              intel?.setSelectedRegion(rp.id);
              // Focus on first zone in region
              if (rp.id !== 'ALL') {
                const firstZ = allZones.find((z: any) => z.regionCategory === rp.id);
                if (firstZ) intel?.setSelectedZoneId(firstZ.id);
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedRegion === rp.id
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {rp.label}
          </button>
        ))}
      </div>

      {/* Floating High-Risk Zone Navigator (Top Right) */}
      {currentNavZone && (
        <div className="absolute top-14 sm:top-3 right-3 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl pointer-events-auto w-72 sm:w-80">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-300">
              <Compass size={14} className="text-blue-400" />
              <span>ZONE NAVIGATOR</span>
              <span className="text-[10px] bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded font-mono">
                {currentNavIndex + 1} / {sortedNavigatorZones.length}
              </span>
            </div>

            {/* Sort switcher */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                onClick={() => setNavigatorSortMode('RISK')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  navigatorSortMode === 'RISK' ? 'bg-red-950 text-red-300 font-bold border border-red-800' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Sort by current landslide risk score"
              >
                RISK
              </button>
              <button
                onClick={() => setNavigatorSortMode('HISTORICAL')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  navigatorSortMode === 'HISTORICAL' ? 'bg-blue-950 text-blue-300 font-bold border border-blue-800' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Sort by ISRO historical landslide events"
              >
                ISRO ATLAS
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleNavPrev}
              aria-label="Previous High Risk Zone"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              className="flex-1 text-center cursor-pointer px-1 overflow-hidden"
              onClick={() => intel?.setSelectedZoneId(currentNavZone.id)}
            >
              <div className="font-bold text-xs text-white truncate hover:text-blue-400 transition-colors">
                {currentNavZone.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentNavZone.district}, {currentNavZone.state}
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${getRiskColor(currentNavRisk)}20`,
                    color: getRiskColor(currentNavRisk),
                    border: `1px solid ${getRiskColor(currentNavRisk)}60`
                  }}
                >
                  RISK {Math.round(currentNavRisk)}%
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentNavZone.historicalLandslideCount || 0} Atlas Events
                </span>
              </div>
            </div>

            <button
              onClick={handleNavNext}
              aria-label="Next High Risk Zone"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}


      {/* Floating Map Legend & Layer Controller */}
      <div className="absolute bottom-16 sm:bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-xs shadow-xl pointer-events-auto max-w-[240px]">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
          <span className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            GIS Layers
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {activeMode}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <label className="flex items-center justify-between gap-2 cursor-pointer text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Risk Sectors (&ge;75)
            </span>
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Hospitals &amp; Shelters
            </span>
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer text-slate-300" onClick={() => setShowReportsLayer(!showReportsLayer)}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Citizen Reports ({safeReports.length})
            </span>
            <input type="checkbox" checked={showReportsLayer} onChange={() => {}} className="rounded bg-slate-950 text-blue-600" />
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer text-slate-300" onClick={() => setShowSeismicLayer(!showSeismicLayer)}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              Seismic Tremors (NCS)
            </span>
            <input type="checkbox" checked={showSeismicLayer} onChange={() => {}} className="rounded bg-slate-950 text-blue-600" />
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer text-slate-300" onClick={() => setShowInfrastructureLayer(!showInfrastructureLayer)}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-emerald-400 rounded"></span>
              Transit Corridors
            </span>
            <input type="checkbox" checked={showInfrastructureLayer} onChange={() => {}} className="rounded bg-slate-950 text-blue-600" />
          </label>
        </div>
      </div>
    </div>
  );
}
