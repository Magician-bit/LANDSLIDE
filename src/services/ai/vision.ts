import { analyzeImage } from '../api';

export interface AiVisionResult {
  sceneClassification: string;
  hazardDetected: boolean;
  hazardType: string;
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  visualEvidence: string[];
  negativeEvidence: string[];
  estimatedAffectedInfrastructure: string[];
  immediateRisks: string[];
  recommendedActions: string[];
  limitations: string[];
  estimatedVelocity?: string;
  estimatedVolume?: string;
}

export const analyzeLandslideImage = async (
  imgData: string,
  locationContext: string,
  zoneName?: string,
  state?: string
): Promise<{ status: string; result: AiVisionResult | null }> => {
  const response = await analyzeImage(imgData, locationContext, zoneName, state);
  
  if (response.status === 'LIVE' && response.data && response.data.success && response.data.assessment) {
    const d = response.data.assessment;
    
    // Clamp confidence
    const confidence = Math.min(100, Math.max(0, d.confidenceScore || 0));
    
    // Validate severity
    let severityStr = String(d.severity || '').toUpperCase();
    let severity: any = 'MODERATE';
    if (severityStr.includes('MINOR') || severityStr.includes('LOW')) severity = 'LOW';
    if (severityStr.includes('MODERATE')) severity = 'MODERATE';
    if (severityStr.includes('SEVERE') || severityStr.includes('HIGH')) severity = 'HIGH';
    if (severityStr.includes('CRITICAL')) severity = 'CRITICAL';

    return {
      status: 'LIVE',
      result: {
        sceneClassification: d.summary || 'Geotechnical Analysis Complete',
        hazardDetected: !!d.hazardIdentified,
        hazardType: d.hazardIdentified || 'Unknown',
        severity,
        confidence,
        visualEvidence: Array.isArray(d.geotechnicalFeatures) ? d.geotechnicalFeatures : [],
        negativeEvidence: [],
        estimatedAffectedInfrastructure: [],
        immediateRisks: Array.isArray(d.immediateRisks) ? d.immediateRisks : [],
        recommendedActions: Array.isArray(d.recommendedActions) ? d.recommendedActions : [],
        limitations: [],
        estimatedVelocity: 'Not determinable from image',
        estimatedVolume: d.estimatedVolumeM3 ? `~${d.estimatedVolumeM3} m³` : 'Not determinable'
      }
    };
  }

  return { status: 'OFFLINE', result: null };
};
