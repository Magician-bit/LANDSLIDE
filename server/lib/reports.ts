import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: any = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function fetchReports() {
  if (!supabase) {
    return { success: false, error: 'SUPABASE_NOT_CONFIGURED', reports: [] };
  }
  
  try {
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    
    // Map db schema back to frontend schema if needed, but assuming they match mostly
    const reports = data.map((r: any) => ({
      ...r,
      timestamp: r.created_at,
      location: [r.latitude, r.longitude]
    }));
    
    return { success: true, reports, count: reports.length };
  } catch (e: any) {
    console.error("Fetch reports error:", e);
    return { success: false, error: e.message, reports: [] };
  }
}

export async function createReport(body: any) {
  if (!supabase) {
    return { success: false, error: 'SUPABASE_NOT_CONFIGURED' };
  }
  
  try {
    const id = `REP-CIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const insertData = {
      id,
      created_at: new Date().toISOString(),
      reporter: body.reporter || body.reporterName || 'Citizen Field Observer',
      latitude: body.location?.[0] || 0,
      longitude: body.location?.[1] || 0,
      location_name: body.locationName || 'Unspecified Mountain Sector',
      state: body.state || 'Unknown',
      district: body.district || 'Unknown',
      zone_id: body.zoneId || null,
      incident_type: body.incidentType || body.type || 'Tension Cracks',
      severity: body.severity || 'Moderate',
      description: body.description || '',
      image_url: body.imageUrl || null,
      status: 'UNVERIFIED',
      verification_status: 'UNVERIFIED',
      affected_road: !!body.affectedRoad,
      affected_building: !!body.affectedBuilding,
      river_blocked: !!body.riverBlocked,
      people_trapped: !!body.peopleTrapped,
      evacuation_required: !!body.evacuationRequired
    };
    
    const { data, error } = await supabase.from('incident_reports').insert([insertData]).select();
    if (error) throw error;
    
    const r = data[0];
    const report = {
      ...r,
      timestamp: r.created_at,
      location: [r.latitude, r.longitude]
    };
    
    return { success: true, report };
  } catch (e: any) {
    console.error("Create report error:", e);
    return { success: false, error: e.message };
  }
}
