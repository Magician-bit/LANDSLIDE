import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Info,
  MapPin,
  RefreshCw,
  FileCheck,
  Send,
  EyeOff
} from 'lucide-react';
import { RiskZone } from '../types';
import { analyzeLandslideImage, runLocalVisualFallback, AiVisionResult } from '../services/ai/vision';

interface AiImageAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentZone: RiskZone | null;
  zones: RiskZone[];
  onSubmitReport?: (reportData: any) => void;
  onSelectZone?: (zoneId: string) => void;
}

const SAMPLE_PRESETS = [
  {
    id: 'sample-1',
    title: 'Debris Flow & Cut Road',
    locationName: 'NH-10 Tista Corridor, Darjeeling',
    zoneId: 'Z-042',
    imageUrl: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&w=800&q=80',
    description: 'DEMO CASE STUDY'
  },
  {
    id: 'sample-2',
    title: 'Crown Scarp & Tension Crack',
    locationName: 'Pattumala Hill Slope, Idukki',
    zoneId: 'KL-IDK-02',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'DEMO CASE STUDY'
  },
  {
    id: 'sample-3',
    title: 'Rockfall on Mountain Highway',
    locationName: 'Badrinath Highway, Chamoli',
    zoneId: 'UK-CHM-01',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    description: 'DEMO CASE STUDY'
  }
];

export default function AiImageAssessmentModal({
  isOpen,
  onClose,
  currentZone,
  zones,
  onSubmitReport,
  onSelectZone
}: AiImageAssessmentModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AiVisionResult | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'IDLE' | 'ANALYZING' | 'LOCAL' | 'ENHANCED' | 'ERROR'>('IDLE');
  const [analysisError, setAnalysisError] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(currentZone?.id || zones[0]?.id || '');
  const [customLocationName, setCustomLocationName] = useState<string>(
    currentZone ? `${currentZone.name}, ${currentZone.district}` : 'Wayanad Sector'
  );
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState<boolean>(false);
  const [activeRequestToken, setActiveRequestToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleZoneSelect = (zId: string) => {
    setSelectedZoneId(zId);
    const z = zones.find((item) => item.id === zId);
    if (z) {
      setCustomLocationName(`${z.name}, ${z.district} (${z.state})`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setAnalysisStatus('ERROR');
        setAnalysisError('Image too large (max 15MB). Please select a smaller file.');
        return;
      }
      // Instantly clear all previous state
      setSelectedImage(null);
      setAnalysisResult(null);
      setImageFileName(file.name);
      setSubmittedSuccessfully(false);
      setAnalysisError('');
      setIsAnalyzing(true);
      setAnalysisStatus('ANALYZING');

      const mimeType = file.type || 'image/jpeg';
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        runAiAssessment(dataUrl, mimeType);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadPreset = async (preset: typeof SAMPLE_PRESETS[0]) => {
    // Instantly clear previous state
    setSelectedImage(null);
    setAnalysisResult(null);
    setImageFileName(preset.title);
    setSelectedZoneId(preset.zoneId);
    setCustomLocationName(preset.locationName);
    setSubmittedSuccessfully(false);
    setAnalysisError('');
    setIsAnalyzing(true);
    setAnalysisStatus('ANALYZING');
    
    try {
      const response = await fetch(preset.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        runAiAssessment(dataUrl, blob.type || 'image/jpeg');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load preset image bytes", err);
      setAnalysisStatus('ERROR');
      setAnalysisError('Failed to fetch demo image data.');
      setIsAnalyzing(false);
    }
  };

  const runAiAssessment = async (imgToAnalyze?: string, explicitMimeType?: string) => {
    const img = imgToAnalyze || selectedImage;
    if (!img) return;
    setIsAnalyzing(true);
    setAnalysisStatus('ANALYZING');
    setSubmittedSuccessfully(false);
    setAnalysisError('');

    const zone = zones.find((z) => z.id === selectedZoneId) || currentZone || zones[0];
    const locContext = `Observed at ${customLocationName} in ${zone?.district || 'Western Ghats / Himalayas'}`;

    const reqToken = Math.random().toString(36).substring(7);
    setActiveRequestToken(reqToken);

    try {
      const res = await analyzeLandslideImage(img, locContext, zone?.name, zone?.state, explicitMimeType);
      
      if (activeRequestToken !== reqToken && activeRequestToken !== null) {
        return;
      }
      
      setAnalysisStatus(res.status);
      if (res.error) setAnalysisError(res.error);
      if ((res.status === 'LOCAL' || res.status === 'ENHANCED') && res.result) {
        setAnalysisResult(res.result);
      } else {
        setAnalysisResult(null);
      }
    } catch (err: any) {
      if (activeRequestToken === reqToken || activeRequestToken === null) {
        setAnalysisStatus('ERROR');
        setAnalysisError(err?.message || 'Vision analysis failed');
        setAnalysisResult(null);
      }
    } finally {
      if (activeRequestToken === reqToken || activeRequestToken === null) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSendToFieldQueue = () => {
    if (!analysisResult) return;
    const zone = zones.find((z) => z.id === selectedZoneId) || currentZone || zones[0];

    if (onSubmitReport) {
      onSubmitReport({
        reporter: 'AI Multimodal Image Classifier (Verified Field Scout)',
        location: zone ? zone.coordinates : [0, 0],
        locationName: customLocationName,
        state: zone?.state || 'Unknown',
        district: zone?.district || 'Unknown',
        zoneId: zone?.id,
        type: analysisResult.hazardType || 'Slope Failure',
        severity: analysisResult.severity,
        description: `[AI Vision Assessment: ${analysisResult.confidence !== null ? `${analysisResult.confidence}%` : 'Visual'} Confidence] ${analysisResult.sceneClassification}. Evidence: ${analysisResult.visibleEvidence.join(', ')}.`,
        imageUrl: selectedImage || undefined,
        affectedRoad: analysisResult.visibleEvidence.some(i => i.toLowerCase().includes('road')),
        affectedBuilding: analysisResult.visibleEvidence.some(i => i.toLowerCase().includes('building') || i.toLowerCase().includes('settlement')),
        riverBlocked: analysisResult.visibleEvidence.some(i => i.toLowerCase().includes('river') || i.toLowerCase().includes('drain')),
        peopleTrapped: false,
        evacuationRequired: analysisResult.severity === 'CRITICAL' || analysisResult.severity === 'HIGH'
      });
      setSubmittedSuccessfully(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  AI Landslide Image Assessment
                </h2>
                {analysisStatus === 'ENHANCED' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    GEMINI VISION ANALYSIS
                  </span>
                ) : analysisStatus === 'LOCAL' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    LOCAL VISUAL ASSESSMENT
                  </span>
                ) : analysisStatus === 'ERROR' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-800">
                    GEMINI VISION UNAVAILABLE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    AI GEOTECHNICAL ASSESSMENT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Upload slope or incident photo for automated hazard detection.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Preset Sample Gallery */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera size={14} className="text-purple-400" />
                Quick Test Samples (DEMO CASE STUDIES)
              </span>
              <span className="text-[11px] text-slate-500">Or upload your own image below</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    imageFileName === preset.title
                      ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="font-bold text-xs truncate text-white">{preset.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{preset.locationName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload & Location Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-950/50 transition-colors relative min-h-[160px]">
              {selectedImage ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-800">
                  <img src={selectedImage} alt="Uploaded slope" className="w-full h-full object-cover" />
                  <label className="absolute bottom-2 right-2 bg-slate-900/90 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-800 flex items-center gap-1">
                    <RefreshCw size={12} />
                    Replace Photo
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-purple-400">
                    <Upload size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-400 hover:underline">
                      Click to upload an image
                    </span>{' '}
                    <span className="text-xs text-slate-400">or drag and drop</span>
                  </div>
                  <span className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 15MB</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Target Location Metadata */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <MapPin size={15} className="text-emerald-400" />
                Geographic Grounding (GIS Context)
              </div>
              <p className="text-[11px] text-slate-400">
                Provide local context to help the vision model understand the geographical setting:
              </p>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Correlated Risk Zone
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => handleZoneSelect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}, {z.district} ({z.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Incident Location Name / Landmark
                </label>
                <input
                  type="text"
                  value={customLocationName}
                  onChange={(e) => setCustomLocationName(e.target.value)}
                  placeholder="e.g., Mile 14, Badrinath Ghat Link Road"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="button"
                disabled={!selectedImage || isAnalyzing}
                onClick={() => runAiAssessment()}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  !selectedImage
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isAnalyzing
                    ? 'bg-purple-700 text-white animate-pulse cursor-wait'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Extracting Visual Morphology...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Run AI Visual Assessment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {analysisStatus === 'ERROR' && !isAnalyzing && (
            <div className="bg-slate-950 border border-red-900/60 rounded-xl p-6 text-center text-slate-400 space-y-3">
              <AlertTriangle size={32} className="mx-auto text-red-400 mb-1" />
              <div className="font-bold text-white text-base">GEMINI VISION UNAVAILABLE</div>
              <p className="text-xs max-w-md mx-auto text-red-300/80">{analysisError || 'Could not analyze image with Gemini Vision.'}</p>
              {selectedImage && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsAnalyzing(true);
                      setAnalysisStatus('ANALYZING');
                      setAnalysisError('');
                      const localRes = await runLocalVisualFallback(selectedImage);
                      setIsAnalyzing(false);
                      setAnalysisStatus(localRes.status);
                      if (localRes.error) setAnalysisError(localRes.error);
                      if (localRes.result) {
                        setAnalysisResult(localRes.result);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Run Local Heuristic Fallback
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Display */}
          {analysisResult && (
            <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-5 space-y-4 shadow-xl animate-fadeIn">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                        analysisResult.severity === 'CRITICAL'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : analysisResult.severity === 'HIGH'
                          ? 'bg-orange-950 text-orange-400 border border-orange-800'
                          : analysisResult.severity === 'MODERATE'
                          ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                          : analysisResult.severity === 'LOW'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {analysisResult.severity} Severity
                    </span>
                    <span className="text-xs font-mono text-purple-400 font-bold">
                      Confidence: {analysisResult.confidence !== null ? `${analysisResult.confidence}%` : 'UNCERTAIN'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {analysisResult.assessment}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                    {analysisResult.hazardDetected ? analysisResult.hazardType : 'No Visible Hazard'}
                  </h3>
                </div>

                <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-right max-w-[240px]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Diagnosis</div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5 truncate" title={analysisResult.sceneClassification}>
                    {analysisResult.sceneClassification}
                  </div>
                </div>
              </div>

              {/* Visual Evidence Section */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Visual Evidence Identified in Uploaded Image
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {analysisResult.visibleEvidence.map((feat, idx) => (
                    <div
                      key={`pos-${idx}`}
                      className="p-2.5 rounded-lg border text-xs bg-purple-950/20 border-purple-800/50 text-slate-200"
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5 text-purple-300">
                        <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                        <span>Visible Characteristic</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{feat}</p>
                    </div>
                  ))}
                  {analysisResult.negativeEvidence.map((feat, idx) => (
                    <div
                      key={`neg-${idx}`}
                      className="p-2.5 rounded-lg border text-xs bg-slate-900/60 border-slate-800 text-slate-400"
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-0.5 text-slate-400">
                        <EyeOff size={13} className="text-slate-500 shrink-0" />
                        <span>Negative Evidence</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{feat}</p>
                    </div>
                  ))}
                  {analysisResult.visibleEvidence.length === 0 && analysisResult.negativeEvidence.length === 0 && (
                    <div className="col-span-2 text-xs text-slate-500 italic p-3 bg-slate-900 rounded-lg">
                      No distinct physical hazard features detected in frame.
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations & Geotechnical Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-blue-400" />
                    Recommended Actions
                  </div>
                  {analysisResult.recommendedActions.length > 0 ? (
                    <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px]">
                      {analysisResult.recommendedActions.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-500">No immediate remediation required.</p>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Info size={14} className="text-amber-400" />
                    Geotechnical Parameters
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-400 font-mono">
                    <div>Velocity: <span className="text-slate-300">{analysisResult.estimatedVelocity || 'NOT DETERMINABLE FROM IMAGE'}</span></div>
                    <div>Volume: <span className="text-slate-300">{analysisResult.estimatedVolume || 'NOT DETERMINABLE FROM IMAGE'}</span></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (onSelectZone) onSelectZone(selectedZoneId);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                >
                  Locate Zone on GIS Map
                </button>

                {submittedSuccessfully ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 size={14} />
                    Report Submitted to Incident Pipeline
                  </div>
                ) : (
                  <button
                    onClick={handleSendToFieldQueue}
                    disabled={!analysisResult.hazardDetected}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                      !analysisResult.hazardDetected 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Send size={13} />
                    {analysisResult.hazardDetected ? 'Submit as Verified Community Incident Report' : 'No Hazard Detected to Report'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

