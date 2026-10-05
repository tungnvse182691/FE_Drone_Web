import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Maximize2,
  Link2,
  ArrowRight,
  CheckCircle2,
  X,
  AlertCircle,
  Camera,
  Send,
  MapPin,
  ZoomIn,
  AlertTriangle,
  Users,
  Phone,
  Building2,
  ShieldCheck,
  Eye,
  Merge,
} from 'lucide-react'
import type { TriageCase } from './types'

export interface ReviewDetailDrawerProps {
  selectedCase: TriageCase
  setSelectedCaseId: (id: string) => void
  cases: TriageCase[]
  detailViewMode: 'PHOTO' | 'GIS_MAP'
  setDetailViewMode: (mode: 'PHOTO' | 'GIS_MAP') => void
  drawerMapContainerRef: React.RefObject<HTMLDivElement | null>
  currentSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  setCurrentSeverity: (s: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void
  currentUrgency: 'NORMAL' | 'URGENT' | 'EMERGENCY'
  setCurrentUrgency: (u: 'NORMAL' | 'URGENT' | 'EMERGENCY') => void
  currentArea: number
  setCurrentArea: (a: number) => void
  currentDepth: number
  setCurrentDepth: (d: number) => void
  currentNotes: string
  setCurrentNotes: (n: string) => void
  onVerifyDefect: (c?: TriageCase) => void
  onOpenNoDefectModal: (c?: TriageCase) => void
  onConclusionOutOfScope: (c?: TriageCase) => void
  onResetConclusion: (c?: TriageCase) => void
  onOpenRequestSurveyModal: (c?: TriageCase) => void
  onOpenPublishModal: (c?: TriageCase) => void
  onNavigateFastTrack: (c: TriageCase) => void
  onUnlinkReport: (childId: string) => void
  onOpenTriageProject: (c: TriageCase) => void
  onOpenGISModal: () => void
  onOpenPhotoZoomModal: () => void
  onOpenMergeModal: (c: TriageCase) => void
  onToggleClusterItem: (code: string) => void
}

export const ReviewDetailDrawer: React.FC<ReviewDetailDrawerProps> = ({
  selectedCase,
  setSelectedCaseId,
  cases,
  detailViewMode,
  setDetailViewMode,
  drawerMapContainerRef,
  currentSeverity,
  setCurrentSeverity,
  currentUrgency,
  setCurrentUrgency,
  currentArea,
  setCurrentArea,
  currentDepth,
  setCurrentDepth,
  currentNotes,
  setCurrentNotes,
  onVerifyDefect,
  onOpenNoDefectModal,
  onConclusionOutOfScope,
  onResetConclusion,
  onOpenRequestSurveyModal,
  onOpenPublishModal,
  onNavigateFastTrack,
  onUnlinkReport,
  onOpenTriageProject,
  onOpenGISModal,
  onOpenPhotoZoomModal,
  onOpenMergeModal,
  onToggleClusterItem,
}) => {
  const navigate = useNavigate()

  return (
    <div className="w-full xl:w-[480px] bg-white rounded-xl border border-brand-border shadow-2xs p-5 flex flex-col gap-4 shrink-0">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-brand-dark">Hồ Sơ Thẩm Định</span>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C9A227]/15 text-[#8F7212] border border-[#C9A227]/30">
              {selectedCase.code}
            </span>
            {selectedCase.master_case_id && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                Đã gộp trùng
              </span>
            )}
            {selectedCase.linked_report_ids && selectedCase.linked_report_ids.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                Master Case ({selectedCase.linked_report_ids.length})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gửi lúc {selectedCase.created_at} bởi {selectedCase.source_detail}
          </p>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onOpenPhotoZoomModal}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Mở rộng chi tiết"
            type="button"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DYNAMIC DECISION STATUS BANNER */}
      {selectedCase.master_case_id && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-purple-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">HỒ SƠ ĐÃ ĐƯỢC GỘP VÀO MASTER CASE</span>
              <span className="text-[11px] text-purple-700">
                Dữ liệu được hợp nhất để không tạo trùng lệnh thi công (BR-30).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCaseId(selectedCase.master_case_id!)}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <span>Xem Case Gốc</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUnlinkReport(selectedCase.id)}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-purple-800 border border-purple-200 text-xs font-semibold rounded-lg cursor-pointer"
              title="Tách thành hồ sơ riêng"
            >
              Tách riêng
            </button>
          </div>
        </div>
      )}

      {selectedCase.conclusion === 'DEFECT_FOUND' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: ĐÃ XÁC MINH CÓ KHIẾM KHUYẾT (DEFECT_FOUND)</span>
              <span className="text-[11px] text-emerald-700">
                Mức độ: <strong>{selectedCase.severity}</strong> • Khẩn cấp: <strong>{selectedCase.urgency}</strong> • S:{' '}
                <strong>{selectedCase.area_sqm} m²</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate('/pm/proposals')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
              title="Gom vào gói đề xuất sửa chữa kỹ thuật (Repair Package)"
            >
              <span>Gom gói sửa chữa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onResetConclusion(selectedCase)}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] rounded-lg cursor-pointer"
              title="Đặt lại để thẩm định lại"
            >
              Sửa lại
            </button>
          </div>
        </div>
      )}

      {selectedCase.conclusion === 'NO_DEFECT' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between text-red-950 animate-in fade-in">
          <div className="flex items-start gap-2">
            <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT (NO_DEFECT - BÁO SAI)</span>
              <p className="text-[11px] text-red-800 mt-0.5 italic">
                Lý do kỹ thuật (BR-39): "{selectedCase.conclusion_reason || selectedCase.pm_notes}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onResetConclusion(selectedCase)}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
          >
            Thẩm định lại
          </button>
        </div>
      )}

      {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between text-amber-950 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: NGOÀI PHẠM VI BẢO HÀNH (OUT_OF_SCOPE)</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onResetConclusion(selectedCase)}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
          >
            Thẩm định lại
          </button>
        </div>
      )}

      {selectedCase.status === 'NEED_SURVEY' && (
        <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl space-y-2.5 text-blue-950 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-xs block text-blue-900">
                  LỆNH KHẢO SÁT &amp; ĐO ĐẠC BỔ SUNG (WF-11)
                </span>
                <span className="text-[11px] text-blue-700">
                  {selectedCase.survey_assignment
                    ? selectedCase.survey_assignment.mode === 'MEASURE_ONLY'
                      ? '📐 Đo đạc hiện trường bằng thước chuyên dụng (MEASURE_ONLY)'
                      : '🛸 Bay quét Drone chụp bổ sung (DRONE_RESURVEY)'
                    : 'Đã chuyển sang hàng đợi nhiệm vụ khảo sát thực địa.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/pm/field-tasks?tab=MEASUREMENTS&highlightCode=${encodeURIComponent(selectedCase.code)}`
                )
              }
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Xem nhiệm vụ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedCase.survey_assignment && (
            <div className="p-2.5 bg-white rounded-lg border border-blue-200/80 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Đơn vị nhận việc:</span>
                <span className="font-bold text-blue-950">{selectedCase.survey_assignment.assigned_crew}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Hạn cam kết SLA:</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full text-[10px]">
                  Trong {selectedCase.survey_assignment.sla_hours} giờ
                </span>
              </div>
              {selectedCase.survey_assignment.reason && (
                <div className="pt-1.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-medium block">Lý do yêu cầu:</span>
                  <p className="italic text-slate-800 mt-0.5">"{selectedCase.survey_assignment.reason}"</p>
                </div>
              )}
              <div className="text-[10px] text-slate-400 text-right pt-0.5">
                Thời gian giao: {selectedCase.survey_assignment.created_at}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCase.is_published && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1 text-sky-950 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-sky-800 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-600" />
              <span>Đã công bố tiến độ cho người dân (PA07)</span>
            </span>
            <span className="text-[10px] text-sky-600 font-mono">{selectedCase.published_at}</span>
          </div>
          <p className="text-[11px] text-sky-900 italic bg-white p-2 rounded-lg border border-sky-100">
            "{selectedCase.public_notice}"
          </p>
        </div>
      )}

      {/* View Mode Toggle: Photo vs Live MapLibre Map */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setDetailViewMode('PHOTO')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              detailViewMode === 'PHOTO'
                ? 'bg-white text-brand-dark shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ảnh chụp hiện trường
          </button>
          <button
            type="button"
            onClick={() => setDetailViewMode('GIS_MAP')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              detailViewMode === 'GIS_MAP'
                ? 'bg-[#C9A227] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Bản đồ MapLibre</span>
          </button>
        </div>

        <button
          onClick={onOpenGISModal}
          type="button"
          className="text-xs font-bold text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Phóng to GIS</span>
        </button>
      </div>

      {detailViewMode === 'PHOTO' ? (
        /* Photo Viewport with Telemetry HUD */
        <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner group h-52">
          <img
            src={selectedCase.image_url}
            alt={selectedCase.defect_title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {/* Top-left GPS & telemetry overlay */}
          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-[10px] flex items-center gap-2 shadow-md border border-white/10">
            <div className="flex items-center gap-1 font-bold text-[#C9A227]">
              <MapPin className="w-3 h-3 text-[#C9A227]" />
              <span>
                {selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E
              </span>
            </div>
            <span className="opacity-40">•</span>
            <span className="opacity-90">Alt: {selectedCase.gps.altitude_m}m</span>
            <span className="opacity-40">•</span>
            <span className="opacity-90">Res: {selectedCase.gps.resolution_cm_px}cm/px</span>
          </div>

          {/* Bottom-right quick view buttons */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            <button
              onClick={onOpenPhotoZoomModal}
              type="button"
              className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white p-1.5 rounded-full transition-colors flex items-center shadow-md border border-white/10 cursor-pointer"
              title="Xem ảnh gốc độ phân giải cao"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenGISModal}
              type="button"
              className="bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 shadow-md border border-white/10 cursor-pointer"
              title="Mở vị trí trên bản đồ GIS"
            >
              <MapPin className="w-3 h-3 text-[#C9A227]" />
              <span>Bản đồ GIS</span>
            </button>
          </div>

          {/* Bottom-left AI Confidence Tag */}
          <div className="absolute bottom-2.5 left-2.5 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>
              AI Confidence: {selectedCase.ai_confidence}% ({selectedCase.defect_title})
            </span>
          </div>
        </div>
      ) : (
        /* Live Mini MapLibre in Drawer */
        <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
          <div ref={drawerMapContainerRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
            {selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E
          </div>
        </div>
      )}

      {/* Spatial Cluster Deduplication Box (< 2.5m) */}
      {selectedCase.cluster_duplicates && selectedCase.cluster_duplicates.length > 0 && (
        selectedCase.cluster_duplicates.every((d) => d.is_merged) ? (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3.5 shadow-2xs space-y-1.5 text-emerald-950 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Đã hợp nhất cụm {selectedCase.cluster_duplicates.length} phản ánh lân cận (&lt; 2.5m)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white">
                Đã gộp
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Đã hợp nhất bằng chứng ảnh và mô tả từ {selectedCase.cluster_duplicates.map((d) => d.code).join(', ')} vào hồ sơ gốc này (BR-30, BR-31).
            </p>
          </div>
        ) : (
          <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-amber-950">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Phát hiện {selectedCase.cluster_duplicates.length} phản ánh lân cận (&lt; 2.5m)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C9A227] text-white">
                Gợi ý gộp
              </span>
            </div>

            <div className="space-y-1.5">
              {selectedCase.cluster_duplicates.map((dup) => (
                <label
                  key={dup.code}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-amber-200/60 cursor-pointer hover:bg-amber-50/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={dup.selected}
                    onChange={() => onToggleClusterItem(dup.code)}
                    className="mt-1 w-3.5 h-3.5 rounded text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-dark">{dup.code}</span>
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full font-semibold">
                        Cách: {dup.distance_m}m
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {dup.source} • {dup.reporter}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => onOpenMergeModal(selectedCase)}
                className="text-xs font-bold text-[#8F7212] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Merge className="w-3.5 h-3.5" />
                <span>Tự động gộp dữ liệu ảnh &amp; mô tả vào Case gốc này</span>
              </button>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Đã chọn: {selectedCase.cluster_duplicates.filter((d) => d.selected).length}/{selectedCase.cluster_duplicates.length}
              </span>
            </div>
          </div>
        )
      )}

      {/* Citizen Reporter Contact & Submission Details (If Citizen or Patrol) */}
      {(selectedCase.reporter_name || selectedCase.description) && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#C9A227]" />
              <span>Thông Tin Người Phản Ánh</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {selectedCase.reporter_channel || selectedCase.source_label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Họ và tên:</span>
              <span className="font-semibold text-slate-800">{selectedCase.reporter_name || 'Người dân'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Số điện thoại liên hệ:</span>
              {selectedCase.reporter_phone ? (
                <a
                  href={`tel:${selectedCase.reporter_phone}`}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1 font-mono"
                >
                  <Phone className="w-3 h-3" />
                  <span>{selectedCase.reporter_phone}</span>
                </a>
              ) : (
                <span className="text-slate-400 italic">Không cung cấp</span>
              )}
            </div>
          </div>

          {selectedCase.description && (
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                Nội dung phản ánh từ người dân:
              </span>
              <p className="italic text-slate-800 leading-relaxed">"{selectedCase.description}"</p>
            </div>
          )}

          {/* Triage Project Assignment Status (PA03) */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Dự án bảo hành phụ trách (PA03):</span>
              <span className="font-semibold text-xs text-brand-dark">
                {selectedCase.project_id ? selectedCase.project_name : '⚠️ Chưa điều phối gán vào dự án'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenTriageProject(selectedCase)}
              className="px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{selectedCase.project_id ? 'Đổi dự án' : 'Điều phối dự án (PA03)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* DANH SÁCH BÁO CÁO TRÙNG ĐÃ GỘP VÀO MASTER CASE NÀY */}
      {selectedCase.linked_report_ids && selectedCase.linked_report_ids.length > 0 && (
        <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-purple-600" />
              <span>Các Phản Ánh Trùng Đã Gộp ({selectedCase.linked_report_ids.length})</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 border border-purple-300">
              Master Case
            </span>
          </div>

          <div className="space-y-2">
            {selectedCase.linked_report_ids.map((code) => {
              const secondary = cases.find((c) => c.code === code)
              return (
                <div
                  key={code}
                  className="p-2.5 bg-white border border-purple-200 rounded-lg flex items-start gap-2.5 text-xs shadow-2xs"
                >
                  {secondary?.image_url && (
                    <img
                      src={secondary.image_url}
                      alt={code}
                      className="w-12 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-950">{code}</span>
                      <span className="text-[10px] text-slate-500">
                        {secondary?.reporter_channel || secondary?.source_label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
                      {secondary?.reporter_name} • {secondary?.reporter_phone}
                    </p>
                    {secondary?.description && (
                      <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                        "{secondary.description}"
                      </p>
                    )}
                  </div>
                  {secondary && (
                    <button
                      type="button"
                      onClick={() => onUnlinkReport(secondary.id)}
                      className="text-[10px] text-purple-700 hover:text-red-600 hover:underline p-1 cursor-pointer shrink-0 font-semibold"
                      title="Tách khỏi hồ sơ gốc này"
                    >
                      Tách
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Technical Decision Form */}
      <div className="space-y-3.5 pt-1">
        {/* Severity & Urgency */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-700 mb-1">
              Mức độ nghiêm trọng <span className="text-red-500">*</span>
            </label>
            <select
              value={currentSeverity}
              onChange={(e) => setCurrentSeverity(e.target.value as any)}
              className={`w-full text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer ${
                currentSeverity === 'CRITICAL'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : currentSeverity === 'HIGH'
                  ? 'bg-amber-50 text-[#8F7212] border-amber-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <option value="LOW">LOW (Nhẹ - Cấp 1)</option>
              <option value="MEDIUM">MEDIUM (Vừa - Cấp 2)</option>
              <option value="HIGH">HIGH (Nghiêm trọng - Cấp 3)</option>
              <option value="CRITICAL">CRITICAL (Nguy hiểm - Cấp 4)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-slate-700 mb-1">
              Tính khẩn cấp <span className="text-red-500">*</span>
            </label>
            <select
              value={currentUrgency}
              onChange={(e) => setCurrentUrgency(e.target.value as any)}
              className="w-full bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
            >
              <option value="NORMAL">NORMAL (Theo lịch 7 ngày)</option>
              <option value="URGENT">URGENT (Trong 24-48 giờ)</option>
              <option value="EMERGENCY">EMERGENCY (Xử lý ngay 4h)</option>
            </select>
          </div>
        </div>

        {/* Area & Depth Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-slate-600 mb-1">Diện tích hư hại</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-[#C9A227] focus-within:border-[#C9A227]">
              <input
                type="number"
                step="0.01"
                value={currentArea}
                onChange={(e) => setCurrentArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-xs text-slate-500 font-semibold ml-1">m²</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">AI ước tính: {selectedCase.ai_area_sqm} m²</span>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-medium text-slate-600 mb-1">Độ sâu lớn nhất</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus-within:ring-1 focus-within:ring-[#C9A227] focus-within:border-[#C9A227]">
              <input
                type="number"
                step="0.1"
                value={currentDepth}
                onChange={(e) => setCurrentDepth(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-xs font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-xs text-slate-500 font-semibold ml-1">cm</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">AI ước tính: {selectedCase.ai_depth_cm} cm</span>
          </div>
        </div>

        {/* PM Notes */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-700">Ghi chú thẩm định PM</label>
            <span className="text-[10px] text-slate-400 font-normal">Lưu nhật ký công trình</span>
          </div>
          <textarea
            rows={2}
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="Nhập ghi chú kỹ thuật, chỉ đạo vá nóng cấp bách hoặc đề xuất cắm biển cảnh báo tạm..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227]"
          />
        </div>

        {/* Decision Action Buttons (PA05: DEFECT_FOUND / NO_DEFECT / OUT_OF_SCOPE) */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onVerifyDefect(selectedCase)}
            className={`w-full py-2.5 px-4 rounded-lg text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
              selectedCase.conclusion === 'DEFECT_FOUND'
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
                : 'bg-[#C9A227] hover:bg-[#B38E1F]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {selectedCase.conclusion === 'DEFECT_FOUND'
                ? '✓ Đã Xác Minh DEFECT_FOUND (Bấm để cập nhật lại)'
                : 'Xác minh có khiếm khuyết (DEFECT_FOUND - PA05)'}
            </span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onOpenNoDefectModal(selectedCase)}
              className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                selectedCase.conclusion === 'NO_DEFECT'
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-white border-slate-200 hover:bg-red-50 text-red-600'
              }`}
              title="Không có khiếm khuyết (Bắt buộc lý do giải trình theo BR-39)"
            >
              <X className="w-3.5 h-3.5" />
              <span>{selectedCase.conclusion === 'NO_DEFECT' ? 'Đã báo sai' : 'Không có lỗi (BR-39)'}</span>
            </button>
            <button
              type="button"
              onClick={() => onConclusionOutOfScope(selectedCase)}
              className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                selectedCase.conclusion === 'OUT_OF_SCOPE'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white border-slate-200 hover:bg-amber-50 text-amber-700'
              }`}
              title="Ngoài phạm vi bảo hành Hoàng Hải"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{selectedCase.conclusion === 'OUT_OF_SCOPE' ? 'Đã loại trừ' : 'Ngoài phạm vi'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenRequestSurveyModal(selectedCase)}
              className={`border px-2.5 py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer ${
                selectedCase.status === 'NEED_SURVEY'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              title="Yêu cầu khảo sát lại hiện trường hoặc bay drone bù (WF-11)"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{selectedCase.status === 'NEED_SURVEY' ? 'Đã giao đo lại' : 'Yêu cầu đo lại'}</span>
            </button>
          </div>

          {/* Public Notice Action (PA07) */}
          <button
            type="button"
            onClick={() => onOpenPublishModal(selectedCase)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
              selectedCase.is_published
                ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {selectedCase.is_published
                ? `📢 Đã công bố tiến độ cho người dân (${selectedCase.published_at || 'Hôm nay'})`
                : 'Công bố tiến độ cho người dân (PA07)'}
            </span>
          </button>
        </div>

        {/* Compliance Note & Direct Action Links */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-600 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>Đã đủ điều kiện kích hoạt lệnh thi công sửa chữa cấp bách (WF-05).</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate(`/pm/defects/${selectedCase.id}/verify`)}
              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>So sánh đa kỳ & BBox</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateFastTrack(selectedCase)}
              className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-[#8F7212] text-xs font-bold rounded-lg border border-amber-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Điều phối Fast Track</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
