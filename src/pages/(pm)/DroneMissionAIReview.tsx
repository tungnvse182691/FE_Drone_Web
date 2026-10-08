import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { surveyService, type SurveyMissionItem } from '../../api/services'
import { Icon } from '../../components/ui/Icon'

import { useDroneMissionReview } from './drone-review/useDroneMissionReview'
import { MissionHeader } from './drone-review/MissionHeader'
import { MissionViewer } from './drone-review/MissionViewer'
import { MissionTriageList } from './drone-review/MissionTriageList'
import { MissionModals } from './drone-review/MissionModals'

export const DroneMissionAIReview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [currentSurvey, setCurrentSurvey] = useState<SurveyMissionItem | null>(null)
  const [isLoadingSurvey, setIsLoadingSurvey] = useState<boolean>(true)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

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
    canLockBaseline,
    isBaselineModalOpen,
    setIsBaselineModalOpen,
    isLockedSuccess,
    lockedBaselineRange,
    handleConfirmBaseline,
    handleSelectDetection,
    handleApproveDetection,
    handleRejectDetection,
    handleSubmitReFlight,
    handleLockBaseline,
    selectedItem
  } = useDroneMissionReview(id || 'srv-01')

  // Tải dữ liệu đợt bay từ Mock API Service
  useEffect(() => {
    let isMounted = true
    const loadSurveyData = async () => {
      if (!id) {
        setIsLoadingSurvey(false)
        return
      }
      try {
        setIsLoadingSurvey(true)
        const survey = await surveyService.getSurveyById(id)
        if (isMounted) {
          setCurrentSurvey(survey || null)
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin đợt bay:', err)
      } finally {
        if (isMounted) {
          setIsLoadingSurvey(false)
        }
      }
    }
    loadSurveyData()
    return () => {
      isMounted = false
    }
  }, [id])

  // Xử lý mô phỏng bay xong ngay trên trang chi tiết nếu trạng thái là SCHEDULED
  const handleSimulateFlight = async () => {
    if (!currentSurvey) return
    try {
      setIsSimulating(true)
      const updated = await surveyService.simulateDroneFlightCompletion(currentSurvey.id)
      if (updated) {
        setCurrentSurvey(updated)
        showToast(`Đã mô phỏng chuyến bay [${updated.code}] hoàn tất và xuất dữ liệu phân tích AI thành công!`)
      }
    } catch (err) {
      console.error('Lỗi khi mô phỏng bay:', err)
    } finally {
      setIsSimulating(false)
    }
  }

  // Trường hợp đang tải
  if (isLoadingSurvey) {
    return (
      <div className="bg-white border border-[#E2E5E9] rounded-xl p-12 flex flex-col items-center justify-center space-y-3 min-h-[400px]">
        <Icon name="sync" size={32} className="text-[#C9A227] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải hồ sơ đợt bay từ máy chủ...</p>
      </div>
    )
  }

  // TRƯỜNG HỢP: ĐỢT BAY ĐANG LÊN LỊCH BAY (CHƯA THỰC HIỆN BAY - CHƯA CÓ DỮ LIỆU AI)
  if (currentSurvey && currentSurvey.status === 'SCHEDULED') {
    return (
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="bg-white rounded-xl px-5 py-3.5 shadow-2xs border border-[#E2E5E9] flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to={`${basePath}/dashboard`} className="hover:text-[#C9A227] transition-colors flex items-center gap-1">
              <Icon name="home" size={14} />
              <span>Trang chủ</span>
            </Link>
            <Icon name="chevron_right" size={14} className="text-slate-400" />
            <Link to={`${basePath}/surveys`} className="hover:text-[#C9A227] transition-colors">
              Khảo sát & Đợt bay Drone
            </Link>
            <Icon name="chevron_right" size={14} className="text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">{currentSurvey.code}</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Icon name="schedule" size={14} className="text-amber-600" />
            Trạng thái: Lên lịch bay
          </span>
        </div>

        {/* Thông báo chưa bay & Thẻ thông tin */}
        <div className="bg-white rounded-xl p-6 shadow-2xs border border-[#E2E5E9] space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Icon name="flight_takeoff" size={24} className="text-[#C9A227]" />
              <h1 className="text-lg font-bold">{currentSurvey.title}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mã nhiệm vụ: <strong className="font-mono text-slate-800">{currentSurvey.code}</strong> • Dự án: {currentSurvey.project_name}
            </p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
            <Icon name="info" size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">Chuyến bay đang ở trạng thái Chuẩn bị / Lên lịch bay:</p>
              <p>
                Drone chưa cất cánh khảo sát thực địa nên hệ thống chưa nhận được gói ảnh RGB phân giải cao và mô hình AI Road-YOLOv9 chưa kích hoạt trích xuất bounding box. Vui lòng bấm nút <strong>&quot;Mô phỏng bay xong & Chạy AI&quot;</strong> bên dưới để hoàn tất thu thập dữ liệu và chuyển sang màn hình thẩm định AI.
              </p>
            </div>
          </div>

          {/* Grid thông số nhiệm vụ bay */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Đoạn lý trình:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{currentSurvey.start_km} → {currentSurvey.end_km}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Phi công chỉ định:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{currentSurvey.pilot_name}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Thiết bị Drone:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{currentSurvey.drone_model}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Ngày bay dự kiến:</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">{currentSurvey.flight_date}</span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/surveys`)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="arrow_back" size={16} />
              <span>Quay lại danh sách khảo sát</span>
            </button>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleSimulateFlight}
              className="px-5 py-2.5 text-xs font-bold rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] active:scale-95 text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Icon name="sync" size={16} className="animate-spin" />
                  <span>Đang xử lý chuyến bay và nạp AI...</span>
                </>
              ) : (
                <>
                  <Icon name="play_arrow" size={16} />
                  <span>Mô phỏng bay xong & Chạy AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // TRƯỜNG HỢP: ĐÃ BAY VÀ SẴN SÀNG THẨM ĐỊNH AI CANVAS
  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Modal Yêu Cầu Bay Bổ Sung & Xác Nhận Khóa Baseline */}
      <MissionModals
        isReFlightModalOpen={isReFlightModalOpen}
        setIsReFlightModalOpen={setIsReFlightModalOpen}
        pilotNote={pilotNote}
        setPilotNote={setPilotNote}
        onSubmitReFlight={handleSubmitReFlight}
        selectedItem={selectedItem}
        currentSurveyCode={currentSurvey?.code}
        currentSurveyRange={currentSurvey ? `${currentSurvey.start_km} → ${currentSurvey.end_km}` : 'Km 1024 - 1030'}
        coveragePercentage={coveragePercentage}
        isBaselineModalOpen={isBaselineModalOpen}
        setIsBaselineModalOpen={setIsBaselineModalOpen}
        onConfirmBaseline={handleConfirmBaseline}
        onOpenReFlightFromBaseline={() => {
          setIsBaselineModalOpen(false)
          setIsReFlightModalOpen(true)
        }}
        reviewedCount={reviewedCount}
        totalCount={totalCount}
      />

      {/* Breadcrumb, Topbar, Data Quality Assessment, AI Job Progress */}
      <MissionHeader
        basePath={basePath}
        missionCode={currentSurvey?.code || '#MS-2026-0924'}
        missionTitle={currentSurvey?.title || 'Khảo sát Drone: Đợt bay quét QL1A (Đoạn Km 1024 - 1030)'}
        setCurrentFrame={setCurrentFrame}
        showToast={showToast}
        coveragePercentage={coveragePercentage}
        hasBlindspot={hasBlindspot}
        isBaselineLocked={isBaselineLocked}
        lockedBaselineRange={lockedBaselineRange}
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
