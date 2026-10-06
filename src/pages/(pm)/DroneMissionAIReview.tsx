import React from 'react'
import { useParams } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { CheckCircle2, X } from 'lucide-react'

import { useDroneMissionReview } from './drone-review/useDroneMissionReview'
import { MissionHeader } from './drone-review/MissionHeader'
import { MissionViewer } from './drone-review/MissionViewer'
import { MissionTriageList } from './drone-review/MissionTriageList'
import { MissionModals } from './drone-review/MissionModals'

export const DroneMissionAIReview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const {
    isAiOverlayVisible,
    setIsAiOverlayVisible,
    isPlaying,
    setIsPlaying,
    currentFrame,
    setCurrentFrame,
    playbackSpeed,
    setPlaybackSpeed,
    totalFrames,
    isCanvasFullscreen,
    setIsCanvasFullscreen,
    kmFilter,
    setKmFilter,
    selectedDetectionId,
    coveragePercentage,
    hasBlindspot,
    isReFlightModalOpen,
    setIsReFlightModalOpen,
    pilotNote,
    setPilotNote,
    toastMessage,
    setToastMessage,
    showToast,
    detections,
    totalCount,
    approvedCount,
    rejectedCount,
    pendingCount,
    reviewedCount,
    reviewProgressPercent,
    viewerMode,
    setViewerMode,
    corridorMapContainerRef,
    isBaselineLocked,
    handleSelectDetection,
    handleApproveDetection,
    handleRejectDetection,
    handleSubmitReFlight,
    handleLockBaseline,
    selectedItem
  } = useDroneMissionReview()

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Yêu Cầu Bay Bổ Sung */}
      <MissionModals
        isReFlightModalOpen={isReFlightModalOpen}
        setIsReFlightModalOpen={setIsReFlightModalOpen}
        pilotNote={pilotNote}
        setPilotNote={setPilotNote}
        onSubmitReFlight={handleSubmitReFlight}
      />

      {/* Breadcrumb, Topbar, Data Quality Assessment, AI Job Progress */}
      <MissionHeader
        basePath={basePath}
        setCurrentFrame={setCurrentFrame}
        showToast={showToast}
        coveragePercentage={coveragePercentage}
        hasBlindspot={hasBlindspot}
        isBaselineLocked={isBaselineLocked}
        pendingCount={pendingCount}
        onOpenReFlightModal={() => setIsReFlightModalOpen(true)}
        onLockBaseline={handleLockBaseline}
      />

      {/* Interactive AI Review Workspace (60/40 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (60%): Viewer & Controls */}
        <MissionViewer
          isCanvasFullscreen={isCanvasFullscreen}
          setIsCanvasFullscreen={setIsCanvasFullscreen}
          viewerMode={viewerMode}
          setViewerMode={setViewerMode}
          isAiOverlayVisible={isAiOverlayVisible}
          setIsAiOverlayVisible={setIsAiOverlayVisible}
          currentFrame={currentFrame}
          setCurrentFrame={setCurrentFrame}
          totalFrames={totalFrames}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          selectedDetectionId={selectedDetectionId}
          onSelectDetection={handleSelectDetection}
          detections={detections}
          selectedItem={selectedItem}
          corridorMapContainerRef={corridorMapContainerRef}
          showToast={showToast}
        />

        {/* Right Column (40%): Triage List */}
        <MissionTriageList
          detections={detections}
          selectedDetectionId={selectedDetectionId}
          onSelectDetection={handleSelectDetection}
          onApproveDetection={handleApproveDetection}
          onRejectDetection={handleRejectDetection}
          kmFilter={kmFilter}
          setKmFilter={setKmFilter}
          totalCount={totalCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          pendingCount={pendingCount}
          reviewedCount={reviewedCount}
          reviewProgressPercent={reviewProgressPercent}
          showToast={showToast}
        />
      </div>
    </div>
  )
}
