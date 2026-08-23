import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useIntelligence } from './hooks/useIntelligence';
import { AppView, Region } from './types';

// Layout Navigation
import Sidebar from './components/navigation/Sidebar';
import TopBar from './components/navigation/TopBar';

// Workspaces
import LiveWorkspace from './components/workspaces/LiveWorkspace';
import ForecastWorkspace from './components/workspaces/ForecastWorkspace';
import SimulationWorkspace from './components/workspaces/SimulationWorkspace';
import ResponseWorkspace from './components/workspaces/ResponseWorkspace';
import AIWorkspace from './components/workspaces/AIWorkspace';
import ReportsWorkspace from './components/workspaces/ReportsWorkspace';
import DataWorkspace from './components/workspaces/DataWorkspace';
import AlertsWorkspace from './components/workspaces/AlertsWorkspace';

// Modals
import ReportModal from './components/ReportModal';
import DataSourcesStatusModal from './components/DataSourcesStatusModal';
import WhyRiskModal from './components/WhyRiskModal';
import AiImageAssessmentModal from './components/AiImageAssessmentModal';
import ReportDetailsModal from './components/ReportDetailsModal';

export function App() {
  const intel = useIntelligence();

  const [locatingUser, setLocatingUser] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [isAiAssessmentModalOpen, setIsAiAssessmentModalOpen] = useState(false);

  const activeView: AppView = intel.activeView || 'live';
  const selectedRegion: Region = intel.selectedRegion || 'india';
  const alertsCount = intel.alerts?.length || 0;

  // Extract unique states for dropdown
  const statesList = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(intel.zones)) {
      intel.zones.forEach((z: any) => {
        if (z.state) set.add(z.state);
      });
    }
    return ['ALL', ...Array.from(set).sort()];
  }, [intel.zones]);

  // Handle GPS location trigger
  const handleCheckMyArea = () => {
    setLocatingUser(true);
    setLocationFeedback(null);
    intel.locateUserPosition(
      (lat, lon, zoneMsg) => {
        setLocatingUser(false);
        setLocationFeedback(`Located: ${zoneMsg}`);
        intel.setActiveView('live');
        setTimeout(() => setLocationFeedback(null), 6000);
      },
      (errorMsg) => {
        setLocatingUser(false);
        setLocationFeedback(`Location error: ${errorMsg}`);
        setTimeout(() => setLocationFeedback(null), 6000);
      }
    );
  };

  return (
    <div id="applet-shell" className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* 1. Left Operational Navigation Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={intel.setActiveView}
        alertsCount={alertsCount}
        onOpenReportModal={() => intel.setIsReportModalOpen(true)}
        onOpenDataModal={() => intel.setIsDataSourcesModalOpen(true)}
        onResetSimulation={() => intel.resetSimulation()}
      />

      {/* 2. Main Application Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Region & Search Bar */}
        <TopBar
          intel={intel}
          activeView={activeView}
          setActiveView={intel.setActiveView}
          selectedRegion={selectedRegion}
          onSelectRegion={(reg) => intel.setSelectedRegion(reg)}
          onCheckMyArea={handleCheckMyArea}
          locatingUser={locatingUser}
          onOpenReportModal={() => intel.setIsReportModalOpen(true)}
          onOpenDataModal={() => intel.setIsDataSourcesModalOpen(true)}
          onOpenAiModal={() => intel.setActiveView('ai')}
          statesList={statesList}
        />

        {/* GPS Location Feedback Banner if active */}
        {locationFeedback && (
          <div className="bg-blue-950/90 border-b border-blue-800 text-blue-200 px-4 py-1.5 text-xs font-mono flex items-center justify-between z-30 shrink-0">
            <span>{locationFeedback}</span>
            <button
              onClick={() => setLocationFeedback(null)}
              className="text-blue-400 hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Authoritative Workspace Router */}
        <main className="flex-1 relative overflow-hidden flex">
          {activeView === 'live' && (
            <LiveWorkspace
              intel={intel}
              onOpenAiModal={() => setIsAiAssessmentModalOpen(true)}
              onOpenReportModal={() => intel.setIsReportModalOpen(true)}
            />
          )}

          {activeView === 'forecast' && (
            <ForecastWorkspace
              intel={intel}
              onNavigateToLiveMap={(zId) => {
                if (zId) intel.setSelectedZoneId(zId);
                intel.setActiveView('live');
              }}
            />
          )}

          {activeView === 'simulate' && (
            <SimulationWorkspace
              intel={intel}
              onNavigateToLiveMap={(zId) => {
                if (zId) intel.setSelectedZoneId(zId);
                intel.setActiveView('live');
              }}
              onNavigateToResponse={() => intel.setActiveView('respond')}
            />
          )}

          {activeView === 'respond' && (
            <ResponseWorkspace
              intel={intel}
              onNavigateToLiveMap={(zId) => {
                if (zId) intel.setSelectedZoneId(zId);
                intel.setActiveView('live');
              }}
            />
          )}

          {activeView === 'ai' && (
            <AIWorkspace
              intel={intel}
              onNavigateToLiveMap={(zId) => {
                if (zId) intel.setSelectedZoneId(zId);
                intel.setActiveView('live');
              }}
              onNavigateToReports={() => intel.setActiveView('reports')}
            />
          )}

          {activeView === 'reports' && (
            <ReportsWorkspace
              intel={intel}
              onOpenReportModal={() => intel.setIsReportModalOpen(true)}
              onNavigateToLiveMap={() => {
                intel.setActiveView('live');
              }}
            />
          )}

          {activeView === 'data' && <DataWorkspace intel={intel} />}

          {activeView === 'alerts' && (
            <AlertsWorkspace
              intel={intel}
              onNavigateToLiveMap={(zId) => {
                if (zId) intel.setSelectedZoneId(zId);
                intel.setActiveView('live');
              }}
              onNavigateToResponse={() => intel.setActiveView('respond')}
            />
          )}
        </main>
      </div>

      {/* Incident Reporting Modal */}
      <ReportModal
        isOpen={intel.isReportModalOpen}
        onClose={() => intel.setIsReportModalOpen(false)}
        onSubmit={(report) =>
          intel.submitIncidentReport({
            reporter: report.reporter || report.reporterName || 'Field Scout',
            location: report.location,
            locationName: report.locationName,
            state: report.state,
            district: report.district,
            zoneId: report.zoneId,
            type: (report.type || report.incidentType || 'Slope Failure') as any,
            severity: (report.severity || 'Moderate') as any,
            description: report.description,
            imageUrl: report.imageUrl,
            affectedRoad: report.affectedRoad ?? report.impactFlags?.roadAffected,
            affectedBuilding: report.affectedBuilding ?? report.impactFlags?.buildingAffected,
            riverBlocked: report.riverBlocked ?? report.impactFlags?.riverBlocked,
            peopleTrapped: report.peopleTrapped ?? report.impactFlags?.peopleTrapped,
            evacuationRequired: report.evacuationRequired ?? report.impactFlags?.evacuationRequired
          })
        }
        currentZone={intel.selectedZone}
        zones={intel.zones}
      />

      {/* Data Pipeline Health Modal */}
      <DataSourcesStatusModal
        isOpen={intel.isDataSourcesModalOpen}
        onClose={() => intel.setIsDataSourcesModalOpen(false)}
        statuses={intel.dataSourceStatuses}
      />

      {/* Why Risk Explainable AI Attribution Modal */}
      <WhyRiskModal
        isOpen={intel.isWhyRiskModalOpen}
        onClose={() => intel.setIsWhyRiskModalOpen(false)}
        zone={intel.selectedZone}
        riskState={intel.riskStates[intel.selectedZoneId || ''] || null}
      />

      {/* AI Multimodal Slope Photo Assessment Modal */}
      <AiImageAssessmentModal
        isOpen={isAiAssessmentModalOpen}
        onClose={() => setIsAiAssessmentModalOpen(false)}
        currentZone={intel.selectedZone}
        zones={intel.zones}
        onSelectZone={(zId) => intel.setSelectedZoneId(zId)}
        onSubmitReport={(reportData) => {
          intel.submitIncidentReport(reportData);
          intel.addActionLog(
            'AI Hazard Assessment Reported',
            `Submitted automated AI image analysis for ${reportData.locationName}.`
          );
        }}
      />

      {/* Report Review & Moderation Modal */}
      <ReportDetailsModal
        report={intel.selectedReportForReview}
        onClose={() => intel.setSelectedReportForReview(null)}
        onVerify={(reportId, status) => {
          if (status) {
            intel.verifyReport(reportId, status);
          }
        }}
      />
    </div>
  );
}

export default App;
