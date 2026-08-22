import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RiskZone, InfrastructureNode, InfrastructureEdge } from '../types';

// Safeguard Leaflet default icons to prevent 404s in bundled or subfolder deployments
const svgIcon = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ef4444" stroke="%23ffffff" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>';
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: svgIcon,
    iconUrl: svgIcon,
    shadowUrl: '',
  });
} catch {
  // Ignore in testing environments
}

export default function MapComponent({ intel }: { intel: any }) {
  const center: [number, number] = [27.0500, 88.2667]; // Darjeeling / Himalaya region

  const getRiskColor = (risk: number) => {
    if (risk > 80) return '#ef4444'; // red-500
    if (risk > 60) return '#f97316'; // orange-500
    if (risk > 40) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const getEdgeColor = (_edge: InfrastructureEdge, isFailed: boolean) => {
    if (isFailed) return '#dc2626'; // red-600
    return '#64748b'; // slate-500
  };

  const safeEdges = Array.isArray(intel?.edges) ? intel.edges : [];
  const safeNodes = Array.isArray(intel?.nodes) ? intel.nodes : [];
  const safeZones = Array.isArray(intel?.zones) ? intel.zones : [];
  const safeResults = Array.isArray(intel?.networkImpact?.results) ? intel.networkImpact.results : [];

  return (
    <div className="w-full h-full z-10 relative">
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Draw Edges */}
        {safeEdges.map((edge: InfrastructureEdge) => {
          if (!edge) return null;
          const source = safeNodes.find((n: InfrastructureNode) => n.id === edge.source);
          const target = safeNodes.find((n: InfrastructureNode) => n.id === edge.target);
          if (!source?.coordinates || !target?.coordinates) return null;
          
          let isFailed = false;
          const failedIds = Array.isArray(intel?.scenario?.failedInfrastructureIds) 
            ? intel.scenario.failedInfrastructureIds 
            : [];

          if (intel?.scenario?.active) {
            if (intel.scenario.type === 'Road Blockage' && failedIds.includes(edge.id)) isFailed = true;
            if (intel.scenario.type === 'Bridge Failure' && (failedIds.includes(edge.source) || failedIds.includes(edge.target))) isFailed = true;
            if (intel.scenario.type === 'Multiple Failures' && failedIds.includes(edge.id)) isFailed = true;
          }

          return (
            <Polyline
              key={edge.id}
              positions={[source.coordinates, target.coordinates]}
              color={getEdgeColor(edge, isFailed)}
              weight={isFailed ? 4 : 2}
              dashArray={isFailed ? '10, 10' : undefined}
              opacity={0.8}
            >
              <Popup>
                <div className="text-slate-900 font-sans text-xs">
                  <h3 className="font-bold text-sm text-slate-800">{edge.type.toUpperCase()}</h3>
                  <p className="text-slate-600">ID: {edge.id}</p>
                  <p className="font-semibold mt-1">Status: <span className={isFailed ? 'text-red-600' : 'text-emerald-600'}>{isFailed ? 'FAILED / BLOCKED' : 'OPERATIONAL'}</span></p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Draw Nodes */}
        {safeNodes.map((node: InfrastructureNode) => {
          if (!node?.coordinates) return null;
          const isIsolated = safeResults.find((r: any) => r.settlementId === node.id)?.isolated;
          
          return (
            <Circle
              key={node.id}
              center={node.coordinates}
              radius={node.type === 'hospital' ? 140 : 100}
              color={isIsolated ? '#ef4444' : node.type === 'hospital' ? '#10b981' : '#38bdf8'}
              fillColor={isIsolated ? '#ef4444' : node.type === 'hospital' ? '#10b981' : '#38bdf8'}
              fillOpacity={0.85}
              weight={2}
            >
              <Popup>
                <div className="text-slate-900 font-sans text-xs">
                  <h3 className="font-bold text-sm text-slate-800">{node.name}</h3>
                  <p className="text-slate-600 capitalize">Type: {node.type}</p>
                  {node.population && <p className="text-slate-600">Population: {node.population.toLocaleString()}</p>}
                  {node.capacity && <p className="text-slate-600">Capacity: {node.capacity} beds</p>}
                  {isIsolated && <p className="text-red-600 font-bold mt-1">⚠️ ISOLATED FROM MEDICAL ACCESS</p>}
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Draw Risk Zones */}
        {safeZones.map((zone: RiskZone) => {
          if (!zone?.coordinates) return null;
          const riskState = intel?.riskStates?.[zone.id] || { currentRisk: zone.staticSusceptibility || 50 };
          const riskScore = riskState.currentRisk ?? 50;
          const color = getRiskColor(riskScore);
          const isSelected = intel?.selectedZoneId === zone.id;
          
          return (
            <Circle
              key={zone.id}
              center={zone.coordinates}
              radius={zone.radius || 1000}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isSelected ? 0.45 : 0.25,
                weight: isSelected ? 3 : 1.5
              }}
              eventHandlers={{
                click: () => intel?.setSelectedZoneId(zone.id)
              }}
            >
              <Popup>
                <div className="text-slate-900 font-sans text-xs">
                  <h3 className="font-bold text-sm text-slate-800">{zone.name}</h3>
                  <p className="text-slate-600 font-medium">Risk Index: <span className="font-bold">{riskScore}/100</span></p>
                  <p className="text-slate-500">Population: {zone.population?.toLocaleString()}</p>
                  <button 
                    onClick={() => intel?.setSelectedZoneId(zone.id)}
                    className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded text-xs w-full transition-colors"
                  >
                    View Location Intelligence
                  </button>
                </div>
              </Popup>
            </Circle>
          );
        })}

      </MapContainer>
    </div>
  );
}
