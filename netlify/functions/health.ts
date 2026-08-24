export const handler = async () => {
  return { 
    statusCode: 200, 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      status: 'ok', 
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      function: 'analyze-image',
      timestamp: new Date().toISOString() 
    }) 
  };
};

