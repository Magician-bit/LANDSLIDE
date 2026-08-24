import { analyzeImage } from '../api';
import { analyzeImageLocally, LocalAnalysisResult } from './localVision';

export interface AiVisionResult {
  mode: 'LOCAL' | 'ENHANCED';
  sceneClassification: string;
  hazardDetected: boolean;
  hazardType: string;
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNCERTAIN';
  confidence: number | null;
  visualEvidence: string[];
  negativeEvidence: string[];
  estimatedAffectedInfrastructure: string[];
  immediateRisks: string[];
  recommendedActions: string[];
  limitations: string[];
  estimatedVelocity?: string;
  estimatedVolume?: string;
  qualityMessage?: string;
}

export const analyzeLandslideImage = async (
  imgData: string,
  locationContext: string,
  zoneName?: string,
  state?: string
): Promise<{ status: 'LOCAL' | 'ENHANCED' | 'ERROR'; result: AiVisionResult | null; error?: string }> => {
  
  // 1. Try Gemini enhancement first
  try {
    const response = await analyzeImage(imgData, locationContext, zoneName, state);
      
    if (response.status === 'LIVE' && response.data && response.data.success && response.data.assessment) {
      const d = response.data.assessment;
      
      // Clamp confidence
      const confidence = Math.min(100, Math.max(0, d.confidence || 0));
          
      // Validate severity
      let severityStr = String(d.severity || '').toUpperCase();
      let severity: any = 'UNCERTAIN';
      if (severityStr.includes('NONE')) severity = 'NONE';
      if (severityStr.includes('MINOR') || severityStr.includes('LOW')) severity = 'LOW';
      if (severityStr.includes('MODERATE')) severity = 'MODERATE';
      if (severityStr.includes('SEVERE') || severityStr.includes('HIGH')) severity = 'HIGH';
      if (severityStr.includes('CRITICAL')) severity = 'CRITICAL';
      
      return {
        status: 'ENHANCED',
        result: {
          mode: 'ENHANCED',
          sceneClassification: d.summary || 'Geotechnical Analysis Complete',
          hazardDetected: d.assessment !== 'NO_CLEAR_LANDSLIDE' && severity !== 'NONE',
          hazardType: d.hazardType || 'Unknown',
          severity,
          confidence,
          visualEvidence: Array.isArray(d.visibleEvidence) ? d.visibleEvidence : [],
          negativeEvidence: Array.isArray(d.negativeEvidence) ? d.negativeEvidence : [],
          estimatedAffectedInfrastructure: [],
          immediateRisks: Array.isArray(d.immediateRisks) ? d.immediateRisks : [],
          recommendedActions: Array.isArray(d.recommendedActions) ? d.recommendedActions : [],
          limitations: ['Image analysis cannot determine subsurface conditions, soil strength, exact slope angle, deformation velocity, or actual landslide probability from a photograph alone.'],
          estimatedVelocity: d.estimatedVelocity || 'NOT DETERMINABLE FROM IMAGE',
          estimatedVolume: d.estimatedVolume || 'NOT DETERMINABLE FROM IMAGE'
        }
      };
    }
  } catch (err) {
    console.warn('Gemini enhancement failed, falling back to local analysis:', err);
  }

  // 2. Fallback to local visual assessment
  const localResult = await analyzeImageLocally(imgData);
  
  if (!localResult.isAcceptable) {
    return {
      status: 'LOCAL',
      result: {
        mode: 'LOCAL',
        sceneClassification: 'Image Quality Insufficient',
        hazardDetected: false,
        hazardType: 'Unknown',
        severity: 'UNCERTAIN',
        confidence: null,
        visualEvidence: [],
        negativeEvidence: [],
        estimatedAffectedInfrastructure: [],
        immediateRisks: [],
        recommendedActions: ['Provide a clearer, well-lit image of the terrain.'],
        limitations: ['Image analysis cannot proceed with insufficient image quality.'],
        qualityMessage: localResult.qualityMessage,
        estimatedVelocity: 'NOT DETERMINABLE FROM IMAGE',
        estimatedVolume: 'NOT DETERMINABLE FROM IMAGE'
      }
    };
  }

  return {
    status: 'LOCAL',
    result: {
      mode: 'LOCAL',
      sceneClassification: 'Local Visual Assessment',
      hazardDetected: localResult.hazardDetected,
      hazardType: 'Potential Terrain Disturbance',
      severity: localResult.severity,
      confidence: null,
      visualEvidence: localResult.visualEvidence,
      negativeEvidence: [],
      estimatedAffectedInfrastructure: [],
      immediateRisks: [],
      recommendedActions: ['Submit for field verification if physical signs of slope failure are present.'],
      limitations: [
        'Image analysis cannot determine subsurface conditions, soil strength, exact slope angle, deformation velocity, or actual landslide probability from a photograph alone.'
      ],
      qualityMessage: localResult.qualityMessage,
      estimatedVelocity: 'NOT DETERMINABLE FROM IMAGE',
      estimatedVolume: 'NOT DETERMINABLE FROM IMAGE'
    }
  };
};
