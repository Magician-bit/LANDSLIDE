import { RiskZone } from '../../types';
import { getFacilities } from '../api';

export async function fetchLiveFacilities(zone: RiskZone) {
  const [lat, lon] = zone.coordinates;
  const res = await getFacilities(lat, lon);
  
  if (res.status === 'LIVE' && res.data) {
    return {
      status: 'LIVE',
      facilities: res.data
    };
  }
  
  return {
    status: 'OFFLINE',
    facilities: []
  };
}
