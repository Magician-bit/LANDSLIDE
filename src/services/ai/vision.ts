import { analyzeImage } from '../api';
import { analyzeImageLocally } from './localVision';

export interface AiVisionResult {
  mode: 'LOCAL' | 'ENHANCED';
  assessment: 'NO_CLEAR_LANDSLIDE_EVIDENCE' | 'POSSIBLE_LANDSLIDE' | 'LIKELY_LANDSLIDE' | 'UNCERTAIN';
  sceneClassification: string;
  hazardDetected: boolean;
  hazardType: string;
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNCERTAIN';
  confidence: number | null;
  visibleEvidence: string[];
  negativeEvidence: string[];
  estimatedAffectedInfrastructure: string[];
  immediateRisks: string[];
  recommendedActions: string[];
  limitations: string[];
  estimatedVelocity: string;
  estimatedVolume: string;
  qualityMessage?: string;
}

export const analyzeLandslideImage = async (
  imgData: string,
  locationContext: string,
  zoneName?: string,
  state?: string,
  mimeType?: string
): Promise<{ status: 'LOCAL' | 'ENHANCED' | 'ERROR'; result: AiVisionResult | null; error?: string }> => {
  
  // 1. Primary: Gemini Multimodal Vision API
  try {
    const response = await analyzeImage(imgData, locationContext, zoneName, state, mimeType);
      
    if (response.status === 'LIVE' && response.data && response.data.success && response.data.assessment) {
      const d = response.data.assessment;
      
      // Parse assessment
      let rawAssessment = String(d.assessment || '').toUpperCase().trim();
      let assessment: AiVisionResult['assessment'] = 'UNCERTAIN';
      if (rawAssessment.includes('NO_CLEAR') || rawAssessment.includes('NONE') || rawAssessment.includes('NORMAL')) {
        assessment = 'NO_CLEAR_LANDSLIDE_EVIDENCE';
      } else if (rawAssessment.includes('POSSIBLE')) {
        assessment = 'POSSIBLE_LANDSLIDE';
      } else if (rawAssessment.includes('LIKELY')) {
        assessment = 'LIKELY_LANDSLIDE';
      }
          
      // Parse severity
      let rawSeverity = String(d.severity || '').toUpperCase().trim();
      let severity: AiVisionResult['severity'] = 'UNCERTAIN';
      if (rawSeverity === 'NONE' || rawSeverity === 'NO_HAZARD') severity = 'NONE';
      else if (rawSeverity.includes('LOW') || rawSeverity.includes('MINOR')) severity = 'LOW';
      else if (rawSeverity.includes('MODERATE')) severity = 'MODERATE';
      else if (rawSeverity.includes('HIGH') || rawSeverity.includes('SEVERE')) severity = 'HIGH';
      else if (rawSeverity.includes('CRITICAL')) severity = 'CRITICAL';

      // Confidence
      const confidence = typeof d.confidence === 'number' ? Math.min(100, Math.max(0, Math.round(d.confidence))) : null;

      const isHazard = assessment !== 'NO_CLEAR_LANDSLIDE_EVIDENCE' && severity !== 'NONE';

      return {
        status: 'ENHANCED',
        result: {
          mode: 'ENHANCED',
          assessment,
          sceneClassification: isHazard 
            ? `${d.hazardType || 'Geotechnical Hazard'} Detected` 
            : 'No Clear Landslide Evidence (Scene Stable / Benign)',
          hazardDetected: isHazard,
          hazardType: d.hazardType || (isHazard ? 'Unclassified Slope Disturbance' : 'NO_VISIBLE_HAZARD'),
          severity,
          confidence,
          visibleEvidence: Array.isArray(d.visibleEvidence) ? d.visibleEvidence : [],
          negativeEvidence: Array.isArray(d.negativeEvidence) ? d.negativeEvidence : [],
          estimatedAffectedInfrastructure: [],
          immediateRisks: isHazard ? (Array.isArray(d.recommendedActions) ? d.recommendedActions.slice(0, 2) : []) : ['No immediate slope failure risk identified from photograph.'],
          recommendedActions: Array.isArray(d.recommendedActions) ? d.recommendedActions : [],
          limitations: Array.isArray(d.limitations) && d.limitations.length > 0
            ? d.limitations 
            : ['Image analysis cannot determine subsurface pore pressure, soil cohesion, or precise runout without ground instrumentation.'],
          estimatedVelocity: d.estimatedVelocity || 'NOT DETERMINABLE FROM IMAGE',
          estimatedVolume: d.estimatedVolume || 'NOT DETERMINABLE FROM IMAGE'
        }
      };
    }

    // If Gemini response status is OFFLINE or unsuccessful, report the error directly without silent fallback
    return {
      status: 'ERROR',
      result: null,
      error: response.error || 'Gemini Vision service is unavailable.'
    };
  } catch (err: any) {
    console.error('Gemini vision API error:', err);
    return {
      status: 'ERROR',
      result: null,
      error: err?.message || 'Gemini Vision analysis failed.'
    };
  }
};

export const runLocalVisualFallback = async (
  imgData: string
): Promise<{ status: 'LOCAL' | 'ERROR'; result: AiVisionResult | null; error?: string }> => {
  try {
    const localResult = await analyzeImageLocally(imgData);
    
    if (!localResult.isAcceptable) {
      return {
        status: 'LOCAL',
        result: {
          mode: 'LOCAL',
          assessment: 'UNCERTAIN',
          sceneClassification: 'INSUFFICIENT IMAGE QUALITY',
          hazardDetected: false,
          hazardType: 'UNKNOWN',
          severity: 'UNCERTAIN',
          confidence: null,
          visibleEvidence: [],
          negativeEvidence: [],
          estimatedAffectedInfrastructure: [],
          immediateRisks: [],
          recommendedActions: ['Provide a clearer, well-lit photograph of the slope terrain.'],
          limitations: ['Image quality is insufficient for morphological assessment.'],
          qualityMessage: localResult.qualityMessage || 'Image too blurry or lighting insufficient.',
          estimatedVelocity: 'NOT DETERMINABLE FROM IMAGE',
          estimatedVolume: 'NOT DETERMINABLE FROM IMAGE'
        }
      };
    }

    return {
      status: 'LOCAL',
      result: {
        mode: 'LOCAL',
        assessment: localResult.hazardDetected ? 'POSSIBLE_LANDSLIDE' : 'NO_CLEAR_LANDSLIDE_EVIDENCE',
        sceneClassification: localResult.hazardDetected ? 'Potential Terrain Disturbance (Local Heuristic CV)' : 'Stable Terrain (Local Heuristic CV)',
        hazardDetected: localResult.hazardDetected,
        hazardType: localResult.hazardDetected ? 'Terrain Disturbance / Roughness' : 'NO_VISIBLE_HAZARD',
        severity: localResult.severity,
        confidence: null,
        visibleEvidence: localResult.visualEvidence,
        negativeEvidence: [],
        estimatedAffectedInfrastructure: [],
        immediateRisks: [],
        recommendedActions: ['Submit for field verification if physical signs of slope failure are present.'],
        limitations: [
          'Local visual assessment cannot determine subsurface conditions, slope angle, or velocity.'
        ],
        qualityMessage: localResult.qualityMessage,
        estimatedVelocity: 'NOT DETERMINABLE FROM IMAGE',
        estimatedVolume: 'NOT DETERMINABLE FROM IMAGE'
      }
    };
  } catch (localErr: any) {
    return {
      status: 'ERROR',
      result: null,
      error: localErr?.message || 'Local visual assessment failed'
    };
  }
};


