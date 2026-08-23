import { FieldReport, RiskZone } from '../../types';
import { panIndiaReports } from '../../data/panIndiaData';
import { apiFetch } from '../api';

export interface SpatialCluster {
  center: [number, number];
  radiusKm: number;
  reportCount: number;
  reports: FieldReport[];
  criticalLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  locationName: string;
}

export class CommunityReportsService {
  private static instance: CommunityReportsService;
  private reports: FieldReport[] = [...panIndiaReports];

  private constructor() {
    this.syncFromBackend();
  }

  public static getInstance(): CommunityReportsService {
    if (!CommunityReportsService.instance) {
      CommunityReportsService.instance = new CommunityReportsService();
    }
    return CommunityReportsService.instance;
  }

  private async syncFromBackend() {
    try {
      const res = await apiFetch('/api/reports');
      if (res.ok) {
        const json = res.data;
        if (Array.isArray(json.reports) && json.reports.length > 0) {
          this.reports = json.reports;
        }
      }
    } catch {
      // Offline fallback already initialized
    }
  }

  public getAllReports(): FieldReport[] {
    return [...this.reports];
  }

  public getReports(): FieldReport[] {
    return [...this.reports];
  }

  public submitReport(reportData: Partial<FieldReport>): FieldReport {
    const id = `REP-USER-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newReport: FieldReport = {
      id,
      timestamp: new Date().toISOString(),
      location: reportData.location || [0, 0],
      locationName: reportData.locationName || 'Unspecified Location',
      state: reportData.state || 'Unknown',
      district: reportData.district || 'Unknown',
      zoneId: reportData.zoneId,
      reporter: reportData.reporter || reportData.reporterName || 'Citizen Observer',
      reporterName: reportData.reporterName || reportData.reporter || 'Citizen Observer',
      type: reportData.type || reportData.incidentType || 'Tension Cracks',
      incidentType: reportData.incidentType || reportData.type || 'Tension Cracks',
      severity: reportData.severity || 'Moderate',
      description: reportData.description || '',
      imageUrl: reportData.imageUrl,
      status: 'UNVERIFIED',
      verificationStatus: 'UNVERIFIED',
      clusterCount: 1,
      affectedRoad: reportData.affectedRoad,
      affectedBuilding: reportData.affectedBuilding,
      riverBlocked: reportData.riverBlocked,
      peopleTrapped: reportData.peopleTrapped,
      evacuationRequired: reportData.evacuationRequired,
      impactFlags: {
        roadAffected: !!reportData.affectedRoad,
        buildingAffected: !!reportData.affectedBuilding,
        riverBlocked: !!reportData.riverBlocked,
        peopleTrapped: !!reportData.peopleTrapped,
        evacuationRequired: !!reportData.evacuationRequired
      }
    };

    this.reports.unshift(newReport);

    // Asynchronously push to backend
    apiFetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport)
    }).catch(() => {});

    return newReport;
  }

  public addReport(reportData: Omit<FieldReport, 'id' | 'timestamp' | 'verificationStatus' | 'clusterCount'>): FieldReport {
    return this.submitReport(reportData);
  }

  public updateReportStatus(reportId: string, status: FieldReport['verificationStatus'], verifiedBy?: string): boolean {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) {
      report.verificationStatus = status;
      report.status = status;
      if (status === 'CONFIRMED') {
        report.verifiedAt = new Date().toISOString();
        report.verifiedBy = verifiedBy || 'Duty Disaster Officer';
      }

      // Asynchronously update backend
      apiFetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, verifiedBy: report.verifiedBy })
      }).catch(() => {});

      return true;
    }
    return false;
  }

  public updateVerificationStatus(reportId: string, status: FieldReport['verificationStatus'], verifiedBy?: string): boolean {
    return this.updateReportStatus(reportId, status, verifiedBy);
  }

  public getReportsForZone(zone: RiskZone): FieldReport[] {
    const [zLat, zLon] = zone.coordinates;
    return this.reports.filter((r) => {
      if (r.zoneId === zone.id) return true;
      const [rLat, rLon] = r.location;
      const dist = Math.hypot(zLat - rLat, (zLon - rLon) * Math.cos((zLat * Math.PI) / 180)) * 111.32;
      return dist <= zone.radius / 1000 + 4;
    });
  }

  public getSpatialClusters(): SpatialCluster[] {
    const clusters: SpatialCluster[] = [];
    const visited = new Set<string>();

    for (let i = 0; i < this.reports.length; i++) {
      const repA = this.reports[i];
      if (visited.has(repA.id)) continue;

      const clusterGroup: FieldReport[] = [repA];
      visited.add(repA.id);

      for (let j = i + 1; j < this.reports.length; j++) {
        const repB = this.reports[j];
        if (visited.has(repB.id)) continue;

        const dist =
          Math.hypot(
            repA.location[0] - repB.location[0],
            (repA.location[1] - repB.location[1]) * Math.cos((repA.location[0] * Math.PI) / 180)
          ) * 111.32;

        if (dist <= 6.0) {
          clusterGroup.push(repB);
          visited.add(repB.id);
        }
      }

      if (clusterGroup.length >= 2) {
        const avgLat = clusterGroup.reduce((sum, r) => sum + r.location[0], 0) / clusterGroup.length;
        const avgLon = clusterGroup.reduce((sum, r) => sum + r.location[1], 0) / clusterGroup.length;
        const hasSevere = clusterGroup.some((r) => r.severity === 'Critical' || r.severity === 'Severe');

        clusters.push({
          center: [avgLat, avgLon],
          radiusKm: 4.5,
          reportCount: clusterGroup.length,
          reports: clusterGroup,
          criticalLevel: hasSevere ? 'CRITICAL' : clusterGroup.length > 3 ? 'HIGH' : 'MEDIUM',
          locationName: repA.locationName
        });
      }
    }

    return clusters;
  }
}

export const reportService = CommunityReportsService.getInstance();
