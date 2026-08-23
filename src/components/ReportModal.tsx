import React, { useState } from 'react';
import {
  X,
  Upload,
  MapPin,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Camera,
  Layers,
  ShieldAlert,
  Info
} from 'lucide-react';
import { FieldReport, RiskZone } from '../types';

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  currentZone,
  zones
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<FieldReport, 'id' | 'timestamp' | 'verificationStatus' | 'clusterCount'>) => void;
  currentZone: RiskZone | null;
  zones: RiskZone[];
}) {
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState(currentZone?.id || zones[0]?.id || '');
  const [incidentType, setIncidentType] = useState<FieldReport['incidentType']>('Landslide');
  const [severity, setSeverity] = useState<FieldReport['severity']>('Moderate');
  const [locationName, setLocationName] = useState(currentZone?.name ? `${currentZone.name}, ${currentZone.district}` : 'Wayanad Ghat Corridor');
  const [coordinates, setCoordinates] = useState<[number, number]>(currentZone?.coordinates || [11.5320, 76.1530]);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Impact checkboxes
  const [roadAffected, setRoadAffected] = useState(true);
  const [buildingAffected, setBuildingAffected] = useState(false);
  const [riverBlocked, setRiverBlocked] = useState(false);
  const [peopleTrapped, setPeopleTrapped] = useState(false);
  const [evacuationRequired, setEvacuationRequired] = useState(false);

  if (!isOpen) return null;

  const handleZoneChange = (zId: string) => {
    setSelectedZoneId(zId);
    const z = zones.find(item => item.id === zId);
    if (z) {
      setCoordinates(z.coordinates);
      setLocationName(`${z.name}, ${z.district} (${z.state})`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a brief description of the observed slope movement.');
      return;
    }

    const matchedZone = zones.find(z => z.id === selectedZoneId);

    onSubmit({
      reporterName: reporterName.trim() || 'Anonymous Citizen Observer',
      reporterContact: reporterContact.trim() || 'Not provided',
      location: coordinates,
      locationName: locationName.trim() || 'Hilly Corridor',
      state: matchedZone?.state || 'Kerala',
      district: matchedZone?.district || 'Wayanad',
      zoneId: selectedZoneId || undefined,
      incidentType,
      severity,
      description: description.trim(),
      imageUrl: imagePreview || undefined,
      impactFlags: {
        roadAffected,
        buildingAffected,
        riverBlocked,
        peopleTrapped,
        evacuationRequired
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Report Landslide or Slope Movement
              </h2>
              <p className="text-xs text-slate-400">
                Direct citizen ground intelligence feed for rapid validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Emergency Notice:</strong> If lives are in immediate danger or persons are trapped, immediately call <strong>112</strong> (National Emergency) or <strong>1077</strong> (State Disaster Control Room). This form feeds the AI verification grid.
            </div>
          </div>

          {/* Region / Zone Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nearest Known Sector / Region
              </label>
              <select
                value={selectedZoneId}
                onChange={e => handleZoneChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.district}, {z.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Specific Landmark / Road / Village
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. Near NH-10 KM 24, Mundakkai Bridge"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Incident Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Incident Phenomenon Type
              </label>
              <select
                value={incidentType}
                onChange={e => setIncidentType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Landslide">Landslide (Mass Soil Failure)</option>
                <option value="Rockfall">Rockfall / Boulder Roll</option>
                <option value="Mudslide">Mudslide / Debris Flow</option>
                <option value="Road Blocked">Road Blockage / Subsidence</option>
                <option value="Ground Crack">Tension Crack / Fissure on Slope</option>
                <option value="Slope Failure">Retaining Wall / Hill Cut Collapse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Observed Severity
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Minor', 'Moderate', 'Severe', 'Critical'] as const).map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      severity === sev
                        ? sev === 'Critical'
                          ? 'bg-red-600 border-red-500 text-white shadow-md'
                          : sev === 'Severe'
                          ? 'bg-orange-600 border-orange-500 text-white shadow-md'
                          : sev === 'Moderate'
                          ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                          : 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Flags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Immediate Impact Flags (Check all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={roadAffected}
                  onChange={e => setRoadAffected(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600"
                />
                Road Traffic Blocked
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={buildingAffected}
                  onChange={e => setBuildingAffected(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600"
                />
                Houses / Buildings Damaged
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={riverBlocked}
                  onChange={e => setRiverBlocked(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600"
                />
                Stream / River Dammed
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={peopleTrapped}
                  onChange={e => setPeopleTrapped(e.target.checked)}
                  className="rounded border-slate-700 text-red-600"
                />
                <span className="text-red-400 font-semibold">People Trapped / Stranded</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={evacuationRequired}
                  onChange={e => setEvacuationRequired(e.target.checked)}
                  className="rounded border-slate-700 text-amber-600"
                />
                <span className="text-amber-400 font-semibold">Immediate Evacuation Needed</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Observations & Ground Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe slope movement, width of crack, water turbidity, ongoing rain intensity, or blocked highway numbers..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Attach Incident Photo (Optional)</span>
              <span className="text-[10px] text-slate-500">Max 5MB (JPG, PNG)</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/50 transition-colors">
                <Camera size={22} className="text-slate-400" />
                <span className="text-xs text-slate-400">Click to upload photo from camera or files</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-1 right-1 p-0.5 bg-black/70 rounded text-white hover:bg-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reporter info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                placeholder="e.g. Rajesh Nair"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Contact Number (For Verification)
              </label>
              <input
                type="text"
                value={reporterContact}
                onChange={e => setReporterContact(e.target.value)}
                placeholder="e.g. +91 98471 XXXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
            >
              <AlertTriangle size={15} />
              Submit Incident Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
