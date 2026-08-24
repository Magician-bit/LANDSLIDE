export interface LocalAnalysisResult {
  mode: 'LOCAL' | 'ENHANCED';
  quality: string;
  qualityMessage: string;
  isAcceptable: boolean;
  visualEvidence: string[];
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'UNCERTAIN';
  hazardDetected: boolean;
}

export const analyzeImageLocally = (imgDataUrl: string): Promise<LocalAnalysisResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 400; // Small size for fast processing
      let w = img.width;
      let h = img.height;
      
      if (w > MAX_SIZE || h > MAX_SIZE) {
        if (w > h) {
          h = Math.round(h * (MAX_SIZE / w));
          w = MAX_SIZE;
        } else {
          w = Math.round(w * (MAX_SIZE / h));
          h = MAX_SIZE;
        }
      }
      
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({
          mode: 'LOCAL',
          quality: 'INSUFFICIENT',
          qualityMessage: 'Could not process image data.',
          isAcceptable: false,
          visualEvidence: [],
          severity: 'UNCERTAIN',
          hazardDetected: false
        });
      }
      
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      
      let totalLuma = 0;
      let earthPixels = 0;
      let vegetationPixels = 0;
      let edgeStrength = 0;
      
      // Calculate brightness and color distribution
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuma += luma;
        
        // Very basic color heuristics
        // Earth/Rock: Brown, gray, dark redish
        if (r > g && g > b && r > 50 && (r - g) < 50) earthPixels++;
        if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 40 && r < 200) earthPixels++; // Grays
        
        // Vegetation: Green dominant
        if (g > r && g > b && g > 40) vegetationPixels++;
      }
      
      const pixelCount = w * h;
      const avgLuma = totalLuma / pixelCount;
      const earthRatio = earthPixels / pixelCount;
      const vegRatio = vegetationPixels / pixelCount;
      
      // Simple edge detection (horizontal difference)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w - 1; x++) {
          const idx1 = (y * w + x) * 4;
          const idx2 = (y * w + x + 1) * 4;
          
          const luma1 = 0.299 * data[idx1] + 0.587 * data[idx1+1] + 0.114 * data[idx1+2];
          const luma2 = 0.299 * data[idx2] + 0.587 * data[idx2+1] + 0.114 * data[idx2+2];
          
          edgeStrength += Math.abs(luma1 - luma2);
        }
      }
      const avgEdge = edgeStrength / pixelCount;
      
      // Quality check
      if (avgLuma < 20 || avgLuma > 240) {
        return resolve({
          mode: 'LOCAL',
          quality: 'INSUFFICIENT',
          qualityMessage: avgLuma < 20 ? 'Image is too dark.' : 'Image is overexposed/too bright.',
          isAcceptable: false,
          visualEvidence: [],
          severity: 'UNCERTAIN',
          hazardDetected: false
        });
      }
      
      if (avgEdge < 2.0) {
        return resolve({
          mode: 'LOCAL',
          quality: 'INSUFFICIENT',
          qualityMessage: 'Image is too blurry or lacks texture variation.',
          isAcceptable: false,
          visualEvidence: [],
          severity: 'UNCERTAIN',
          hazardDetected: false
        });
      }
      
      // Feature extraction
      const evidence: string[] = [];
      let severityScore = 0;
      
      if (earthRatio > 0.4) {
        evidence.push('Significant exposed soil/rock detected');
        severityScore += 2;
      } else if (earthRatio > 0.2) {
        evidence.push('Some exposed soil/rock detected');
        severityScore += 1;
      }
      
      if (vegRatio > 0.5) {
        evidence.push('Dense vegetation coverage');
      }
      
      if (avgEdge > 20) {
        evidence.push('High terrain texture variation (potential debris/roughness)');
        severityScore += 1;
      }
      
      if (earthRatio > 0.2 && vegRatio > 0.2 && avgEdge > 15) {
        evidence.push('Disturbed vegetation pattern possible');
      }
      
      let severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'UNCERTAIN' = 'UNCERTAIN';
      let detected = false;
      
      if (severityScore >= 3) {
        severity = 'MODERATE';
        detected = true;
      } else if (severityScore >= 1) {
        severity = 'LOW';
        detected = true;
      } else {
        severity = 'UNCERTAIN';
        detected = false;
        evidence.push('No distinct hazard indicators detected locally');
      }

      resolve({
        mode: 'LOCAL',
        quality: 'GOOD',
        qualityMessage: 'Sufficient visual information available.',
        isAcceptable: true,
        visualEvidence: evidence,
        severity,
        hazardDetected: detected
      });
    };
    img.onerror = () => {
      resolve({
        mode: 'LOCAL',
        quality: 'INSUFFICIENT',
        qualityMessage: 'Failed to load image for processing.',
        isAcceptable: false,
        visualEvidence: [],
        severity: 'UNCERTAIN',
        hazardDetected: false
      });
    };
    img.src = imgDataUrl;
  });
};
