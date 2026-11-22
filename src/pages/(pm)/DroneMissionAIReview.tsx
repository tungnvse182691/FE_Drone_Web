import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { surveyService, type SurveyMissionItem } from '../../api/services'
import { Icon } from '../../components/ui/Icon'

import { useDroneMissionReview } from './drone-review/useDroneMissionReview'
import { MissionHeader } from './drone-review/MissionHeader'
import { MissionViewer } from './drone-review/MissionViewer'
import { MissionTriageList } from './drone-review/MissionTriageList'

export const DroneMissionAIReview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // Ngữ cảnh khi mở từ "Mở kết quả" của lần chạy AI vừa tạo: ?run=<runId>&dataset=<datasetId>.
  const [searchParams, setSearchParams] = useSearchParams()
  const runId = searchParams.get('run') || ''
  const datasetId = searchParams.get('dataset') || ''
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [currentSurvey, setCurrentSurvey] = useState<SurveyMissionItem | null>(null)
  const [isLoadingSurvey, setIsLoadingSurvey] = useState<boolean>(true)

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
    statusFilter,
    setStatusFilter,
    selectedDetectionId,
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
    isLockedSuccess,
    lockedBaselineRange,
    handleSelectDetection,
    handleApproveDetection,
    handleRejectDetection,
    selectedItem,
    detectionsError
  } = useDroneMissionReview(id || '', currentSurvey, runId ? { runId, datasetId: datasetId || undefined } : undefined)

  // Tải dữ liệu đợt bay từ Mock API Service
  useEffect(() => {
    let isMounted = true
    const loadSurveyData = async () => {
      if (!id) {
        setCurrentSurvey(null) // đổi sang route không có :id thì bỏ đợt bay cũ, không hiển thị nhầm
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
                Máy chủ chưa có lần chạy AI nào gắn với nhiệm vụ của đợt này (nhiệm vụ chưa nộp bản dữ liệu, hoặc chưa tạo lần chạy AI). Phát hiện AI chỉ xuất hiện sau khi có bản nộp bộ dữ liệu và PM tạo lần chạy AI ở chi tiết nhiệm vụ khảo sát.
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

          </div>
        </div>
      </div>
    )
  }

  // TRƯỜNG HỢP: ĐÃ BAY VÀ SẴN SÀNG THẨM ĐỊNH AI CANVAS
  return (
    <div className="space-y-4">
      {!id && <div role="alert" className="rg-alert rg-alert-warn"><p className="flex-1 min-w-0">Chưa chọn đợt khảo sát: đường dẫn thiếu mã nhiệm vụ. Mở từ danh sách khảo sát để xem phát hiện AI của đúng đợt.</p></div>}
      {runId && (
        <div role="note" data-testid="ai-run-scope-banner" className="rg-alert bg-brand-surfaceAlt border-brand-border text-slate-700">
          <Icon name="smart_toy" size={16} className="text-brand-navy shrink-0" />
          <p className="flex-1 min-w-0 text-xs">
            Đang xem kết quả của <strong>lần chạy AI</strong> <span className="font-mono">{runId.slice(0, 8)}</span>
            {datasetId ? <> trên <strong>bản nộp</strong> <span className="font-mono">{datasetId.slice(0, 8)}</span></> : null}.
            Đây không phải mã job xử lý. Các thao tác thẩm định giữ nguyên.
          </p>
          <button type="button" onClick={() => setSearchParams({}, { replace: true })} className="text-xs font-semibold underline cursor-pointer whitespace-nowrap">Xem tất cả lần chạy của nhiệm vụ</button>
        </div>
      )}
      {detectionsError && <div role="alert" className="rg-alert rg-alert-error"><p className="flex-1 min-w-0">Không tải được danh sách phát hiện AI: {detectionsError}</p></div>}
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

      {/* Breadcrumb, Topbar, Data Quality Assessment, AI Job Progress */}
      <MissionHeader
        basePath={basePath}
        missionCode={currentSurvey?.code || '#MS-2026-0000'}
        missionTitle={currentSurvey?.title || 'Nhiệm vụ bay khảo sát trắc địa'}
        missionStatus={currentSurvey?.status}
        setCurrentFrame={setCurrentFrame}
        showToast={showToast}
        isBaselineLocked={isBaselineLocked}
        lockedBaselineRange={lockedBaselineRange}
        pendingCount={pendingCount}
        detailHref={currentSurvey?.task_ids?.[0] ? `${basePath}/surveys?surveyRecordId=${currentSurvey.task_ids[0]}&surveyRecordKind=TASK` : undefined}
        droneModel={currentSurvey?.drone_model}
        totalPhotos={currentSurvey?.total_photos}
        aiDetectionsCount={detections.length}
        reviewedCount={reviewedCount}
        totalCount={totalCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        reviewProgressPercent={reviewProgressPercent}
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
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={totalCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          pendingCount={pendingCount}
          reviewedCount={reviewedCount}
          reviewProgressPercent={reviewProgressPercent}
          showToast={showToast}
          surveyRange={currentSurvey ? `${currentSurvey.start_km} → ${currentSurvey.end_km}` : undefined}
          isBaselineLocked={isBaselineLocked || currentSurvey?.status === 'BASELINE_LOCKED'}
        />
      </div>
    </div>
  )
}
