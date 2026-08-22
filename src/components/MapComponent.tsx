import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RiskZone, InfrastructureNode, InfrastructureEdge } from '../types';

export default function MapComponent({ intel }: { intel: any }) {
  const center: [number, number] = [27.0500, 88.2667]; // Darjeeling area

  const getRiskColor = (risk: number) => {
    if (risk > 80) return '#ef4444'; // red-500
    if (risk > 60) return '#f97316'; // orange-500
    if (risk > 40) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const getEdgeColor = (edge: InfrastructureEdge, isFailed: boolean) => {
    if (isFailed) return '#dc2626'; // red-600
    return '#64748b'; // slate-500
  };

  return (
    <div className="w-full h-full z-10 relative">
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Draw Edges */}
        {intel.edges.map((edge: InfrastructureEdge) => {
          const source = intel.nodes.find((n: InfrastructureNode) => n.id === edge.source);
          const target = intel.nodes.find((n: InfrastructureNode) => n.id === edge.target);
          if (!source || !target) return null;
          
          let isFailed = false;
          if (intel.scenario.active) {
             if (intel.scenario.type === 'Road Blockage' && intel.scenario.failedInfrastructureIds.includes(edge.id)) isFailed = true;
             if (intel.scenario.type === 'Bridge Failure' && intel.scenario.failedInfrastructureIds.includes(edge.source || edge.target)) isFailed = true;
             if (intel.scenario.type === 'Multiple Failures' && intel.scenario.failedInfrastructureIds.includes(edge.id)) isFailed = true;
          }

          return (
            <Polyline
              key={edge.id}
              positions={[source.coordinates, target.coordinates]}
              color={getEdgeColor(edge, isFailed)}
              weight={isFailed ? 4 : 2}
              dashArray={isFailed ? '10, 10' : ''}
              opacity={0.8}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold">{edge.type.toUpperCase()}</h3>
                  <p>ID: {edge.id}</p>
                  <p>Status: {isFailed ? 'FAILED' : 'ACTIVE'}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Draw Nodes */}
        {intel.nodes.map((node: InfrastructureNode) => {
           const isIsolated = intel.networkImpact.results.find((r:any) => r.settlementId === node.id)?.isolated;
           return (
            <Circle
              key={node.id}
              center={node.coordinates}
              radius={100}
              color={isIsolated ? '#ef4444' : '#38bdf8'}
              fillOpacity={0.8}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold">{node.name}</h3>
                  <p>Type: {node.type}</p>
                  {node.population && <p>Pop: {node.population}</p>}
                  {isIsolated && <p className="text-red-600 font-bold">ISOLATED</p>}
                </div>
              </Popup>
            </Circle>
           );
        })}

        {/* Draw Risk Zones */}
        {intel.zones.map((zone: RiskZone) => {
          const riskState = intel.riskStates[zone.id];
          const color = getRiskColor(riskState.currentRisk);
          const isSelected = intel.selectedZoneId === zone.id;
          
          return (
            <Circle
              key={zone.id}
              center={zone.coordinates}
              radius={zone.radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: isSelected ? 0.4 : 0.2,
                weight: isSelected ? 3 : 1
              }}
              eventHandlers={{
                click: () => intel.setSelectedZoneId(zone.id)
              }}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold text-lg">{zone.name}</h3>
                  <p>Risk Score: {riskState.currentRisk}/100</p>
                  <button 
                    onClick={() => intel.setSelectedZoneId(zone.id)}
                    className="mt-2 bg-slate-900 text-white px-3 py-1 rounded text-sm w-full"
                  >
                    View Intelligence
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
