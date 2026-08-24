const fs = require('fs');
let code = fs.readFileSync('src/services/ai/vision.ts', 'utf8');

code = code.replace(
  /Promise<\{ status: string; result: AiVisionResult \| null \}>/,
  'Promise<{ status: string; result: AiVisionResult | null; error?: string }>'
);

code = code.replace(
  /return \{ status: 'OFFLINE', result: null \};/g,
  `if (response.data && response.data.error) {
    return { status: 'ERROR', result: null, error: response.data.error };
  }
  if (response.error) {
    return { status: 'ERROR', result: null, error: response.error };
  }
  return { status: 'OFFLINE', result: null, error: 'AI analysis failed' };`
);

fs.writeFileSync('src/services/ai/vision.ts', code);
