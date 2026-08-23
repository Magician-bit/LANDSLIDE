import React, { useState } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  MapPin,
  Camera,
  Info,
  CheckCircle2,
  ShieldAlert,
  Compass,
  FileText
} from 'lucide-react';
import { IncidentType, IncidentSeverity, RiskZone } from '../types';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: any) => void;
  zones: RiskZone[];
  selectedZoneId: string | null;
}

const INCIDENT_TYPES: { value: IncidentType; label: string; desc: string }[] = [
  { value: 'Tension Cracks', label: 'Tension Cracks', desc: 'Visible ground fissures or slope crown fractures' },
  { value: 'Rockfall', label: 'Rockfall / Debris Boulder', desc: 'Dislodged rock boulders falling across slopes/roads' },
  { value: 'Debris Flow', label: 'Debris Flow / Mudflow', desc: 'Rapid slurry of water, mud, and boulders' },
  { value: 'Slope Subsidence', label: 'Slope Subsidence / Sinkage', desc: 'Ground settlement or retaining wall bulging' },
  { value: 'Road Blockage', label: 'Road / Highway Blockage', desc: 'Debris accumulation completely blocking transit' },
  { value: 'Mudflow', label: 'Mudslide / Silt Runoff', desc: 'High sediment runoff inundating settlements' }
];

export default function ReportIncidentModal({
  isOpen,
  onClose,
  onSubmitReport,
  zones,
  selectedZoneId
}: ReportIncidentModalProps) {
  if (!isOpen) return null;

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  const [reporter, setReporter] = useState('');
  const [locationName, setLocationName] = useState(currentZone ? `${currentZone.name}, ${currentZone.district}` : '');
  const [selectedZone, setSelectedZone] = useState(currentZone ? currentZone.id : '');
  const [latitude, setLatitude] = useState<number>(currentZone ? currentZone.coordinates[0] : 0);
  const [longitude, setLongitude] = useState<number>(currentZone ? currentZone.coordinates[1] : 0);
  const [incidentType, setIncidentType] = useState<IncidentType>('Tension Cracks');
  const [severity, setSeverity] = useState<IncidentSeverity>('Severe');
  const [description, setDescription] = useState('');
  const [affectedRoad, setAffectedRoad] = useState(true);
  const [affectedBuilding, setAffectedBuilding] = useState(false);
  const [riverBlocked, setRiverBlocked] = useState(false);
  const [peopleTrapped, setPeopleTrapped] = useState(false);
  const [evacuationRequired, setEvacuationRequired] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !locationName.trim()) return;

    const targetZ = zones.find((z) => z.id === selectedZone);

    onSubmitReport({
      reporter: reporter.trim() || 'Community Observer',
      location: [latitude, longitude],
      locationName: locationName.trim(),
      state: targetZ?.state || 'Kerala',
      district: targetZ?.district || 'Wayanad',
      zoneId: selectedZone,
      type: incidentType,
      severity,
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      affectedRoad,
      affectedBuilding,
      riverBlocked,
      peopleTrapped,
      evacuationRequired
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1400);
  };

  const handleZoneSelectChange = (zId: string) => {
    setSelectedZone(zId);
    const z = zones.find((item) => item.id === zId);
    if (z) {
      setLocationName(`${z.name}, ${z.district}`);
      setLatitude(z.coordinates[0]);
      setLongitude(z.coordinates[1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-950/80 border border-red-800/80 text-red-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-800/60 px-1.5 py-0.2 rounded uppercase">
                  Community Network
                </span>
                <span className="text-[10px] text-slate-400 font-mono">PAN-INDIA GROUND TRUTH</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">Report Ground Hazard / Landslide Incident</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/80 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">Incident Report Dispatched</h3>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Your field report has been logged and sent to the Disaster Management Taskforce. It is queued as{' '}
              <span className="font-mono text-amber-400 font-bold">UNVERIFIED</span> until corroborated by local authorities.
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mt-2 italic border-t border-slate-700/50 pt-2">
              (System Note: Report is successfully persisted to the live server database.)
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            {/* Disclaimer Callout */}
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 flex items-start gap-2.5">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Community reports provide essential ground-truth intelligence to local emergency services. Submitted reports are flagged as <strong>UNVERIFIED</strong> until corroborated by district field monitors.
              </p>
            </div>

            {/* Target Risk Zone & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Associated Mountain Sector / Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => handleZoneSelectChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-xs"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      [{z.id}] {z.name} ({z.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Specific Location / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near 3rd Hairpin Bend, Chooralmala Road"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* Reporter Name & Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Reporter / Observer</label>
                <input
                  type="text"
                  placeholder="Your Name or Volunteer ID"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Incident Type & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Incident Classification *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {INCIDENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setIncidentType(t.value)}
                      className={`p-2 rounded-lg text-left border transition-all ${
                        incidentType === t.value
                          ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="truncate text-[11px]">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Observed Severity *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Low', 'Moderate', 'Severe', 'Critical'] as IncidentSeverity[]).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`p-2 rounded-lg text-center border font-bold transition-all ${
                        severity === sev
                          ? sev === 'Critical'
                            ? 'bg-red-600 text-white border-red-500'
                            : sev === 'Severe'
                            ? 'bg-orange-600 text-white border-orange-500'
                            : sev === 'Moderate'
                            ? 'bg-amber-600 text-white border-amber-500'
                            : 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Impact Checkboxes */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">Observed Infrastructure / Human Impact</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={affectedRoad}
                    onChange={(e) => setAffectedRoad(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Road Blocked</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={affectedBuilding}
                    onChange={(e) => setAffectedBuilding(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Buildings Threatened</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={riverBlocked}
                    onChange={(e) => setRiverBlocked(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>River / Stream Dammed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={peopleTrapped}
                    onChange={(e) => setPeopleTrapped(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0"
                  />
                  <span className="text-red-400 font-bold">People Trapped</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={evacuationRequired}
                    onChange={(e) => setEvacuationRequired(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-orange-600 focus:ring-0"
                  />
                  <span className="text-orange-400 font-bold">Immediate Evacuation Needed</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Detailed Description & Observations *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe crack length, mud speed, sounds of slope rumbling, water seepage color, or current transit impediments..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-blue-500 text-xs"
              ></textarea>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-red-600/30"
              >
                <Send size={14} />
                Submit Field Incident
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
