export const handler = async () => {
  return { 
    statusCode: 200, 
    body: JSON.stringify({ 
      status: 'NO_RECENT_OBSERVATION',
      deformationRateMmMonth: null,
      message: 'NO RECENT INSAR OBSERVATION',
      provenance: {
        sourceName: 'Copernicus Sentinel-1',
        providerAgency: 'ESA',
        dataType: 'SATELLITE_OBSERVATION',
        isLive: true,
        timestamp: new Date().toISOString()
      }
    }) 
  };
};
