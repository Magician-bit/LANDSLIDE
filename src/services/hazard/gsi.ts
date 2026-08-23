import { RiskZone } from '../../types';

export interface GSISusceptibilityAssessment {
  susceptibilityScore: number;
  susceptibilityClass: 'Very High' | 'High' | 'Moderate' | 'Low';
  geologicalFormation: string;
  lithology: string;
  structuralFaultDistance: number;
  slopeFactor: number;
  methodology: string;
}

export class GSINLSMService {
  private static instance: GSINLSMService;

  public static getInstance(): GSINLSMService {
    if (!GSINLSMService.instance) {
      GSINLSMService.instance = new GSINLSMService();
    }
    return GSINLSMService.instance;
  }

  public getSusceptibilityForZone(zone: RiskZone): GSISusceptibilityAssessment {
    const env = zone.environmentalFeatures;
    return {
      susceptibilityScore: zone.staticSusceptibility,
      susceptibilityClass: env.gsiSusceptibilityClass || 'High',
      geologicalFormation: env.geologicalFormation || env.geologicalUnit || 'Regional Metasediments & Crystallines',
      lithology: env.lithology || 'Gneiss / Schist Complex with Colluvium Overburden',
      structuralFaultDistance: env.faultDistanceKm || 3.0,
      slopeFactor: env.slope,
      methodology: 'GSI National Landslide Susceptibility Mapping (NLSM) Macro-Scale (1:50,000)'
    };
  }
}

export const gsiService = GSINLSMService.getInstance();

export function getGsiSusceptibilityBaseline(zone: RiskZone): GSISusceptibilityAssessment {
  return gsiService.getSusceptibilityForZone(zone);
}
