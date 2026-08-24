import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Eye,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Compass,
  Activity
} from 'lucide-react';
import { analyzeLandslideImage, AiVisionResult } from '../../services/ai/vision';

interface AIWorkspaceProps {
  intel: any;
  onNavigateToLiveMap: (zoneId?: string) => void;
  onNavigateToReports: () => void;
}

const SAMPLE_SLOPE_IMAGES = [
  {
    id: 'sample-1',
    title: 'Chooralmala Escarpment Scar',
    location: 'Wayanad, Kerala (Western Ghats)',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    description: 'DEMO CASE STUDY'
  },
  {
    id: 'sample-2',
    title: 'Joshimath-Helang Rockfall Fissure',
    location: 'Chamoli, Uttarakhand (Western Himalayas)',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    description: 'DEMO CASE STUDY'
  },
  {
    id: 'sample-3',
    title: 'Munnar Ghat Road Toe Cut',
    location: 'Idukki, Kerala (Western Ghats)',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80',
    description: 'DEMO CASE STUDY'
  },
  {
    id: 'sample-4',
    title: 'Darjeeling Teesta Valley Debris Path',
    location: 'Darjeeling, West Bengal (Eastern Himalayas)',
    thumbnail: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&auto=format&fit=crop&q=80',
    description: 'DEMO CASE STUDY'
  }
];

export default function AIWorkspace({ intel, onNavigateToLiveMap, onNavigateToReports }: AIWorkspaceProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'IDLE' | 'ANALYZING' | 'LOCAL' | 'ENHANCED' | 'ERROR'>('IDLE');
  const [analysisError, setAnalysisError] = useState<string>('');
  const [dispatchedToGrid, setDispatchedToGrid] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AiVisionResult | null>(null);
  const [activeRequestToken, setActiveRequestToken] = useState<string | null>(null);

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAnalysisStatus('ERROR');
        setAnalysisError('Image too large. Please select a smaller file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX = 1200;
          if (width > height && width > MAX) { height *= MAX/width; width = MAX; }
          else if (height > MAX) { width *= MAX/height; height = MAX; }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
          setSelectedImage(canvas.toDataURL('image/jpeg', 0.8));
          setAnalysisResult(null);
          setTimeout(() => runAnalysis(canvas.toDataURL('image/jpeg', 0.8)), 10);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Assessment
  const runAnalysis = async (imgData: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisStatus('ANALYZING');
    setDispatchedToGrid(false);

    const reqToken = Math.random().toString(36).substring(7);
    setActiveRequestToken(reqToken);

    try {
      const res = await analyzeLandslideImage(imgData, locationName || intel?.selectedZone?.name || '', intel?.selectedZone?.name, intel?.selectedZone?.state);
      
      if (activeRequestToken !== reqToken && activeRequestToken !== null) {
        // A newer request has been made, discard this one
        return;
      }

      setAnalysisStatus(res.status);
      if (res.error) setAnalysisError(res.error);
      if ((res.status === 'LOCAL' || res.status === 'ENHANCED') && res.result) {
        setAnalysisResult(res.result);
        setAnalysisId(`AI-${new Date().toISOString().replace(/\D/g,'').slice(0, 14)}`);
      } else {
        setAnalysisResult(null);
      }
    } catch {
      if (activeRequestToken === reqToken || activeRequestToken === null) {
        setAnalysisStatus('ERROR');
        setAnalysisError('Unknown failure');
        setAnalysisResult(null);
      }
    } finally {
      if (activeRequestToken === reqToken || activeRequestToken === null) {
        setIsAnalyzing(false);
      }
    }
  };

  // Convert to Field Report
  const handleConvertToReport = () => {
    if (!analysisResult || !selectedImage) return;
    
    const coords = intel?.selectedZone?.coordinates || [0, 0];

    intel?.submitIncidentReport({
      reporter: 'AI Vision Geotechnical Assessment',
      location: coords,
      locationName: `${imageTitle} - ${locationName}`,
      type: analysisResult.hazardType || 'Tension Cracks & Slope Shear',
      severity: analysisResult.severity,
      description: `${analysisResult.sceneClassification}. ${analysisResult.visualEvidence.join(' ')}`,
      imageUrl: selectedImage
    });

    setDispatchedToGrid(true);
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950/90 text-red-400 border-red-800';
      case 'HIGH':
        return 'bg-orange-950/90 text-orange-400 border-orange-800';
      case 'MODERATE':
        return 'bg-yellow-950/90 text-yellow-400 border-yellow-800';
      case 'LOW':
        return 'bg-blue-950/90 text-blue-400 border-blue-800';
      default:
        return 'bg-emerald-950/90 text-emerald-400 border-emerald-800';
    }
  };

  return (
    <div id="ai-workspace" className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {analysisStatus === 'ENHANCED' ? (
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                GEMINI ENHANCED
              </span>
            ) : analysisStatus === 'LOCAL' ? (
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                LOCAL VISUAL ANALYSIS
              </span>
            ) : (
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-bold">
                MULTIMODAL VISION
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">
              GEOTECHNICAL COMPUTER VISION
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles size={28} className="text-purple-400" />
            AI Multimodal Slope &amp; Hazard Vision Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Upload field drone imagery or slope photographs for automated structural assessment, tension crack identification, failure mechanism classification, and runout estimation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/30 cursor-pointer">
            <Upload size={15} />
            <span>Upload Field Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Preset Slope Case Studies */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Or Select a DEMO CASE STUDY
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_SLOPE_IMAGES.map((sample) => {
            const isSelected = selectedImage === sample.thumbnail;
            return (
              <div
                key={sample.id}
                onClick={() => {
                  setSelectedImage(sample.thumbnail);
                  setImageTitle(sample.title);
                  setLocationName(sample.location);
                  runAnalysis(sample.thumbnail);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
                  isSelected
                    ? 'bg-slate-850 border-purple-500 shadow-md shadow-purple-950'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-white truncate">{sample.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sample.location}</div>
                  <div className="text-[10px] text-purple-400 font-mono mt-0.5">Click to assess &rarr;</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Inspection View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image Canvas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Camera size={18} className="text-purple-400" />
                {imageTitle || 'No Image Selected'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{locationName || 'Awaiting upload'}</p>
            </div>
            {selectedImage && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                High-Res Visual Feed
              </span>
            )}
          </div>

          <div className="relative flex-1 min-h-[300px] md:min-h-[400px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  alt={imageTitle}
                  className="w-full h-full object-cover"
                />

                {/* AI Vision Overlay Scanlines */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="font-mono text-xs font-bold text-purple-200">
                      ANALYZING VISUAL EVIDENCE...
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6 text-slate-500">
                <Camera size={48} className="mx-auto mb-3 opacity-20" />
                <div className="font-bold">No Image Analyzed</div>
                <div className="text-sm mt-1">Upload a field photograph to begin</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Geotechnical Diagnosis */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-purple-400" />
                  AI Geotechnical Assessment
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual Failure Mode Classification
                </p>
              </div>

              {analysisResult && (
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${getSeverityBadge(
                    analysisResult.severity
                  )}`}
                >
                  {analysisResult.severity}
                </span>
              )}
            </div>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm font-mono">PROCESSING IMAGE...</div>
              </div>
            ) : analysisStatus === 'ERROR' ? (
              <div className="p-8 text-center text-slate-400 text-sm border border-slate-800 rounded-xl bg-slate-950 mt-4">
                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
                <div className="font-bold text-white text-base">AI ANALYSIS FAILED</div>
                <p className="mt-2 text-xs">{analysisError}</p>
              </div>
            
            ) : analysisResult ? (
              <div className="space-y-4 pt-4">
                {/* Structural Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
                    <div className="text-[10px] uppercase font-mono text-slate-500">Analysis ID</div>
                    <div className="text-xs font-bold text-slate-400 font-mono mt-0.5 break-all">
                      {analysisId}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                    <div className="text-[10px] uppercase font-mono text-slate-500">Confidence</div>
                    <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">
                      {analysisResult.confidence !== null ? `${analysisResult.confidence}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-mono text-slate-500">AI ESTIMATE: Velocity</div>
                    <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                      {analysisResult.estimatedVelocity || 'Not determinable from image'}
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-mono text-slate-500">AI ESTIMATE: Volume</div>
                    <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">
                      {analysisResult.estimatedVolume || 'Not determinable from image'}
                    </div>
                  </div>
                </div>

                {/* Primary Failure Mechanism */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-purple-400 flex justify-between">
                    <span>Scene Classification</span>
                    <span>{analysisResult.hazardDetected ? 'HAZARD DETECTED' : 'NO VISIBLE HAZARD'}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-200 leading-snug pt-1">
                    {analysisResult.sceneClassification}
                  </div>
                  {analysisResult.hazardDetected && (
                    <div className="text-xs font-mono text-red-400 mt-2">
                      Type: {analysisResult.hazardType}
                    </div>
                  )}
                </div>

                {/* Key Observations */}
                {(analysisResult.visualEvidence?.length > 0 || analysisResult.negativeEvidence?.length > 0) && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-mono font-bold text-slate-300">
                      Visual Evidence Identified:
                    </div>
                    <ul className="space-y-1">
                      {analysisResult.visualEvidence?.map((obs, i) => (
                        <li key={`pos-${i}`} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                          <span>{obs}</span>
                        </li>
                      ))}
                      {analysisResult.negativeEvidence?.map((obs, i) => (
                        <li key={`neg-${i}`} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 shrink-0"></span>
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Recommendations */}
                {analysisResult.recommendedActions?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-mono font-bold text-slate-300">
                      Recommended Mitigations:
                    </div>
                    <ul className="space-y-1">
                      {analysisResult.recommendedActions.map((rec, i) => (
                        <li key={i} className="text-xs text-emerald-300 flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                Select an image to view real-time geotechnical AI diagnosis.
              </div>
            )}
          </div>

          {/* Action Footer */}
          {analysisResult && (
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                id="submit-ai-as-report-btn"
                onClick={handleConvertToReport}
                disabled={dispatchedToGrid || !analysisResult.hazardDetected}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                  dispatchedToGrid || !analysisResult.hazardDetected
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                <FileText size={15} />
                <span>
                  {!analysisResult.hazardDetected 
                    ? 'No Hazard to Report'
                    : dispatchedToGrid 
                      ? 'Dispatched to Intelligence Grid' 
                      : 'Submit as Verified Incident Report'}
                </span>
              </button>

              <button
                onClick={onNavigateToReports}
                className="text-xs font-mono text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Community Hub</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

