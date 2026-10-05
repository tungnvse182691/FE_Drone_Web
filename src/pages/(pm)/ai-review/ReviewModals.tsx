import React from 'react'
import {
  Merge,
  X,
  AlertCircle,
  MapPin,
  Link2,
  Building2,
  CheckCircle2,
  Check,
  Send,
  Camera,
  AlertTriangle,
} from 'lucide-react'
import type { TriageCase } from './types'

export interface ReviewModalsProps {
  selectedCase: TriageCase
  targetTriageCase: TriageCase | null
  cases: TriageCase[]
  selectedReportIds: string[]
  mockProjects: { id: string; code: string; name: string; start_km: number; end_km: number }[]

  // Modal 1: Merge
  isMergeModalOpen: boolean
  setIsMergeModalOpen: (open: boolean) => void
  onExecuteMerge: () => void

  // Modal 2: GIS
  isGISModalOpen: boolean
  setIsGISModalOpen: (open: boolean) => void
  modalMapType: 'SATELLITE' | 'STREET'
  setModalMapType: (type: 'SATELLITE' | 'STREET') => void
  modalMapContainerRef: React.RefObject<HTMLDivElement | null>

  // Modal 3: Photo Zoom
  isPhotoZoomModalOpen: boolean
  setIsPhotoZoomModalOpen: (open: boolean) => void

  // Modal 4: Link Reports
  isLinkReportsModalOpen: boolean
  setIsLinkReportsModalOpen: (open: boolean) => void
  linkMasterCaseId: string
  setLinkMasterCaseId: (id: string) => void
  linkAuditNotes: string
  setLinkAuditNotes: (notes: string) => void
  onConfirmLinkReports: () => void

  // Modal 5: Triage Project
  isTriageProjectModalOpen: boolean
  setIsTriageProjectModalOpen: (open: boolean) => void
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  onConfirmTriageProject: () => void

  // Modal 6: No Defect
  isNoDefectModalOpen: boolean
  setIsNoDefectModalOpen: (open: boolean) => void
  noDefectReason: string
  setNoDefectReason: (r: string) => void
  onConfirmNoDefect: () => void

  // Modal 7: Publish Result
  isPublishModalOpen: boolean
  setIsPublishModalOpen: (open: boolean) => void
  publishPublicNote: string
  setPublishPublicNote: (note: string) => void
  onConfirmPublishResult: () => void

  // Modal 8: Request Survey
  isRequestSurveyModalOpen: boolean
  setIsRequestSurveyModalOpen: (open: boolean) => void
  surveyMode: 'MEASURE_ONLY' | 'DRONE_RESURVEY'
  setSurveyMode: (m: 'MEASURE_ONLY' | 'DRONE_RESURVEY') => void
  surveyReason: string
  setSurveyReason: React.Dispatch<React.SetStateAction<string>>
  surveyAssignedCrew: string
  setSurveyAssignedCrew: (crew: string) => void
  surveySlaHours: number
  setSurveySlaHours: (hours: number) => void
  onConfirmRequestSurvey: () => void
}

export const ReviewModals: React.FC<ReviewModalsProps> = ({
  selectedCase,
  targetTriageCase,
  cases,
  selectedReportIds,
  mockProjects,
  isMergeModalOpen,
  setIsMergeModalOpen,
  onExecuteMerge,
  isGISModalOpen,
  setIsGISModalOpen,
  modalMapType,
  setModalMapType,
  modalMapContainerRef,
  isPhotoZoomModalOpen,
  setIsPhotoZoomModalOpen,
  isLinkReportsModalOpen,
  setIsLinkReportsModalOpen,
  linkMasterCaseId,
  setLinkMasterCaseId,
  linkAuditNotes,
  setLinkAuditNotes,
  onConfirmLinkReports,
  isTriageProjectModalOpen,
  setIsTriageProjectModalOpen,
  selectedProjectId,
  setSelectedProjectId,
  onConfirmTriageProject,
  isNoDefectModalOpen,
  setIsNoDefectModalOpen,
  noDefectReason,
  setNoDefectReason,
  onConfirmNoDefect,
  isPublishModalOpen,
  setIsPublishModalOpen,
  publishPublicNote,
  setPublishPublicNote,
  onConfirmPublishResult,
  isRequestSurveyModalOpen,
  setIsRequestSurveyModalOpen,
  surveyMode,
  setSurveyMode,
  surveyReason,
  setSurveyReason,
  surveyAssignedCrew,
  setSurveyAssignedCrew,
  surveySlaHours,
  setSurveySlaHours,
  onConfirmRequestSurvey,
}) => {
  return (
    <>
      {/* MODAL 1: GỘP PHẢN ÁNH TRÙNG LẶP */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Merge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Gộp Phản Ánh Trùng Lặp Không Gian</h3>
                  <p className="text-xs text-slate-500">Thuật toán Spatial Clustering bán kính R &le; 2.5 mét</p>
                </div>
              </div>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-brand-dark">Hồ sơ gốc tiếp nhận chính:</span>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-mono font-bold text-[#8F7212]">
                    {selectedCase.code} ({selectedCase.defect_title})
                  </span>
                  <span>
                    {selectedCase.stationing} - {selectedCase.project_name}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1.5">
                  Danh sách phản ánh vệ tinh lân cận sẽ gộp vào hồ sơ gốc:
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCase.cluster_duplicates?.map((dup) => (
                    <div
                      key={dup.code}
                      className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-dark">{dup.code}</span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                            Cách tâm {dup.distance_m}m
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {dup.source} • {dup.reporter}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        Sẽ gộp ảnh &amp; ghi chú
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Sau khi gộp, các hồ sơ phụ sẽ được chuyển sang trạng thái <strong>MERGED (Đã gộp trùng)</strong>, ảnh
                  bằng chứng hiện trường sẽ được đính kèm vào Case gốc, tránh trùng lặp khối lượng kỹ thuật sửa chữa.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMergeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onExecuteMerge}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Merge className="w-3.5 h-3.5" />
                <span>Xác nhận Gộp 2 Phản Ánh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GIS MAP PREVIEW MODAL */}
      {isGISModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C9A227]" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Vị Trí Bản Đồ Không Gian (GIS WGS84)</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedCase.code} • {selectedCase.stationing} ({selectedCase.gps.lat}° N, {selectedCase.gps.lng}° E)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGISModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setModalMapType('SATELLITE')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      modalMapType === 'SATELLITE'
                        ? 'bg-[#C9A227] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ảnh vệ tinh Google (Satellite)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMapType('STREET')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      modalMapType === 'STREET'
                        ? 'bg-[#C9A227] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bản đồ giao thông (Vector)
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Vùng đệm cụm: 2.5m (Spatial Cluster)</span>
                </div>
              </div>

              <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
                <div ref={modalMapContainerRef} className="w-full h-full" />
                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-[11px] font-mono border border-white/10 z-10 pointer-events-none">
                  Hệ quy chiếu: WGS-84 / UTM Zone 32648 (EPSG:32648) • Bán kính cụm: 2.5m
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsGISModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Đóng bản đồ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FULL PHOTO ZOOM */}
      {isPhotoZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full p-4 shadow-2xl border border-slate-700 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C9A227]">{selectedCase.code}</span>
                <span className="text-xs text-slate-300">
                  • {selectedCase.defect_title} ({selectedCase.stationing})
                </span>
              </div>
              <button
                onClick={() => setIsPhotoZoomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-96 rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedCase.image_url}
                alt="Full resolution inspection"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Độ phân giải thực: 0.3 cm/px • Nguồn chụp: Matrice 300 RTK</span>
              <button
                onClick={() => setIsPhotoZoomModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LIÊN KẾT BÁO TRÙNG PHẢN ÁNH (PA04) */}
      {isLinkReportsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Liên Kết Báo Trùng Phản Ánh (PA04)</h3>
                  <p className="text-xs text-slate-500">
                    Quy chuẩn BR-30, BR-31: Hợp nhất nhiều báo cáo thành 1 Master Case
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkReportsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Pick Master Case */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  1. Chọn Hồ Sơ Tiếp Nhận Chính (Master Case):
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {cases
                    .filter((c) => selectedReportIds.includes(c.id))
                    .map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          linkMasterCaseId === c.id
                            ? 'bg-amber-50 border-[#C9A227] text-brand-dark'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="masterCaseSelect"
                            checked={linkMasterCaseId === c.id}
                            onChange={() => setLinkMasterCaseId(c.id)}
                            className="text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227]"
                          />
                          <div>
                            <span className="font-mono font-bold">{c.code}</span>
                            <span className="text-slate-500 ml-2">
                              ({c.stationing} - {c.defect_title})
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{c.reporter_name || c.source_label}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Audit justification */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  2. Lý do liên kết &amp; đối chiếu không gian (Audit Log):
                </label>
                <textarea
                  rows={2}
                  value={linkAuditNotes}
                  onChange={(e) => setLinkAuditNotes(e.target.value)}
                  placeholder="Nhập lý do liên kết (ví dụ: các phản ánh cách nhau dưới 2m, cùng phản ánh ổ gà Km 1025+390)..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Các phản ánh vệ tinh sẽ được gắn cờ <strong>MERGED</strong>, toàn bộ ảnh hiện trường và thông tin
                  người dân được giữ nguyên và tổng hợp vào hồ sơ chính, đảm bảo không tạo 2 lệnh sửa chữa cùng 1 lỗi.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLinkReportsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirmLinkReports}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Liên Kết {selectedReportIds.length} Báo Cáo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ĐIỀU PHỐI GÁN VÀO DỰ ÁN BẢO HÀNH (PA03) */}
      {isTriageProjectModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Điều Phối Phản Ánh Vào Dự Án (PA03)</h3>
                  <p className="text-xs text-slate-500">Chỉ định tuyến đường bảo hành chịu trách nhiệm sửa chữa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTriageProjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-brand-dark block">Hồ sơ phản ánh tiếp nhận:</span>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-mono font-bold text-[#8F7212]">{targetTriageCase.code}</span>
                  <span>
                    {targetTriageCase.stationing} ({targetTriageCase.lane})
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] truncate">{targetTriageCase.defect_title}</p>
                <span className="text-[10px] text-slate-400 block">
                  Người báo: {targetTriageCase.reporter_name || targetTriageCase.source_label} (
                  {targetTriageCase.reporter_phone || 'Không có SĐT'})
                </span>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">
                  Chọn tuyến đường / Dự án bảo hành phụ trách: <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-semibold cursor-pointer"
                >
                  {mockProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} (Km {p.start_km} &rarr; Km {p.end_km})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Sau khi điều phối, hồ sơ sẽ được gán vào phạm vi quản lý của dự án, sẵn sàng để PM thẩm định chi
                  tiết và lập gói sửa chữa hoặc giao nhiệm vụ khảo sát đo đạc hiện trường.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTriageProjectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirmTriageProject}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Điều Phối Dự Án</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: KẾT LUẬN KHÔNG CÓ KHIẾM KHUYẾT (NO_DEFECT - PA05, BR-39) */}
      {isNoDefectModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Kết Luận: Không Có Khiếm Khuyết (NO_DEFECT)</h3>
                  <p className="text-xs text-red-600 font-semibold">
                    Quy chuẩn bất biến BR-39: Bắt buộc giải trình kỹ thuật
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNoDefectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Hồ sơ xem xét từ chối:</span>
                <span className="font-mono font-bold text-brand-dark">
                  {targetTriageCase.code} ({targetTriageCase.stationing})
                </span>
                <p className="text-slate-500">{targetTriageCase.defect_title}</p>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">
                  Lý do giải trình kỹ thuật từ chối: <span className="text-red-500">* (Bắt buộc theo BR-39)</span>
                </label>
                <textarea
                  rows={3}
                  value={noDefectReason}
                  onChange={(e) => setNoDefectReason(e.target.value)}
                  placeholder="Ghi rõ lý do: ví dụ vết nước đọng bề mặt, bùn đất rác rãnh mép đường, không cấu thành nứt vỡ kết cấu mặt đường bê tông xi măng..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227]"
                  required
                />
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  Lý do này sẽ được ghi vào nhật ký kiểm toán không thể xóa (Audit Trail) và phản hồi lý do chính thức
                  cho người dân trên ứng dụng di động.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNoDefectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirmNoDefect}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xác Nhận Kết Luận NO_DEFECT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: CÔNG BỐ TIẾN ĐỘ CHO NGƯỜI DÂN (PA07) */}
      {isPublishModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Công Bố Tiến Độ Xử Lý Cho Người Dân (PA07)</h3>
                  <p className="text-xs text-slate-500">Đồng bộ thông báo công khai xuống ứng dụng di động Citizen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Hồ sơ phản ánh:</span>
                <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
                <p className="text-slate-600">
                  {targetTriageCase.stationing} - {targetTriageCase.defect_title}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  Người gửi: {targetTriageCase.reporter_name || 'Người dân'} ({targetTriageCase.reporter_phone || 'N/A'}
                  )
                </span>
              </div>

              <div className="flex flex-col">
                <label className="font-bold text-slate-700 mb-1">Nội dung thông báo công khai gửi người dân:</label>
                <textarea
                  rows={3}
                  value={publishPublicNote}
                  onChange={(e) => setPublishPublicNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={onConfirmPublishResult}
                className="px-4 py-2 text-xs font-bold bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Công Bố Xuống App Citizen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: LỆNH KHẢO SÁT & ĐO ĐẠC BỔ SUNG HIỆN TRƯỜNG (WF-11) */}
      {isRequestSurveyModalOpen && targetTriageCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Lệnh Khảo Sát &amp; Đo Đạc Bổ Sung (WF-11)</h3>
                  <p className="text-xs text-slate-500">
                    Nêu lý do kỹ thuật, chọn hình thức và phân công đơn vị đi đo / bay drone lại
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestSurveyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Defect Info Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {targetTriageCase.source_label}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{targetTriageCase.defect_title}</div>
                <div className="text-slate-500 text-[11px]">
                  Lý trình:{' '}
                  <span className="font-medium text-slate-700">
                    {targetTriageCase.stationing} ({targetTriageCase.lane})
                  </span>{' '}
                  • Tuyến: <span className="font-medium text-slate-700">{targetTriageCase.project_name}</span>
                </div>
              </div>

              {/* 1. Chọn hình thức khảo sát */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  1. Hình thức khảo sát / đo đạc lại: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      surveyMode === 'MEASURE_ONLY'
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="survey_mode"
                        checked={surveyMode === 'MEASURE_ONLY'}
                        onChange={() => {
                          setSurveyMode('MEASURE_ONLY')
                          setSurveyAssignedCrew('Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)')
                        }}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">📐 Đo đạc hiện trường</span>
                        <span className="text-[10px] text-blue-700 font-semibold uppercase">
                          Chế độ MEASURE_ONLY (BR-09)
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Kỹ sư/Tổ đội đi thực địa dùng thước đo độ sâu lòng hố (depth) và đo diện tích nứt vỡ chuẩn
                          xác.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      surveyMode === 'DRONE_RESURVEY'
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="survey_mode"
                        checked={surveyMode === 'DRONE_RESURVEY'}
                        onChange={() => {
                          setSurveyMode('DRONE_RESURVEY')
                          setSurveyAssignedCrew('Đội bay Drone Hoàng Hải 01 - Phi công: Lê Minh Khôi')
                        }}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">🛸 Bay Drone bổ sung</span>
                        <span className="text-[10px] text-blue-700 font-semibold uppercase">
                          Chế độ DRONE_RESURVEY
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Chỉ định phi công bay quét lại ở độ cao thấp hơn hoặc góc chụp xiên do ảnh cũ bị mờ, ngược
                          sáng.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. Lý do kỹ thuật yêu cầu đo lại (Bắt buộc) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    2. Lý do kỹ thuật yêu cầu đo đạc lại: <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Bắt buộc theo chuẩn thẩm định</span>
                </div>

                {/* Quick Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    'Ảnh bị mờ / che khuất tầm nhìn',
                    'Cần đo độ sâu lòng hố (depth)',
                    'Nghi ngờ nứt kết cấu tầng dưới',
                    'Xác định lại chính xác lý trình Km',
                    'Góc chụp xiên không đủ cơ sở tính diện tích',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSurveyReason((prev) => (prev ? `${prev}. ${tag}` : tag))}
                      className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer border border-slate-200"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={surveyReason}
                  onChange={(e) => setSurveyReason(e.target.value)}
                  placeholder="Ví dụ: Ảnh người dân gửi góc xiên và bị ngược sáng, cần tổ đội ra đo thước kiểm tra lòng sâu hố sụt và diện tích hư hại thực tế..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>

              {/* 3. Phân công đơn vị thực hiện */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  3. Phân công đơn vị thực hiện: <span className="text-red-500">*</span>
                </label>
                <select
                  value={surveyAssignedCrew}
                  onChange={(e) => setSurveyAssignedCrew(e.target.value)}
                  className="w-full bg-white border border-slate-200 font-medium text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
                >
                  {surveyMode === 'MEASURE_ONLY' ? (
                    <>
                      <option value="Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)">
                        Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035) — Trưởng tổ: Nguyễn Văn Thành
                      </option>
                      <option value="Tổ đo đạc cơ động 02 (Km 1035 - Km 1060)">
                        Tổ đo đạc cơ động 02 (Km 1035 - Km 1060) — Trưởng tổ: Trần Đình Trọng
                      </option>
                      <option value="Đội kỹ thuật phản ứng nhanh số 3">
                        Đội kỹ thuật phản ứng nhanh số 3 — Kỹ sư: Lê Văn Nam
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="Đội bay Drone Hoàng Hải 01 - Phi công: Lê Minh Khôi">
                        Đội bay Drone Hoàng Hải 01 — Phi công: Lê Minh Khôi (DJI Matrice 350 RTK)
                      </option>
                      <option value="Đội bay Khảo sát 02 - Phi công: Hoàng Quốc Tuấn">
                        Đội bay Khảo sát 02 — Phi công: Hoàng Quốc Tuấn (DJI Mavic 3 Enterprise)
                      </option>
                      <option value="Tổ bay cứu nạn khẩn cấp 03 - Phi công: Phạm Anh Dũng">
                        Tổ bay cứu nạn khẩn cấp 03 — Phi công: Phạm Anh Dũng
                      </option>
                    </>
                  )}
                </select>
              </div>

              {/* 4. Cam kết thời hạn SLA */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">4. Cam kết thời hạn hoàn thành (SLA):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 24, label: 'Khẩn cấp (24h)', note: 'Ưu tiên hàng đầu' },
                    { value: 48, label: 'Tiêu chuẩn (48h)', note: 'Theo ca trực chuẩn' },
                    { value: 168, label: 'Định kỳ (7 ngày)', note: 'Đợt khảo sát tuần' },
                  ].map((sla) => (
                    <button
                      key={sla.value}
                      type="button"
                      onClick={() => setSurveySlaHours(sla.value)}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        surveySlaHours === sla.value
                          ? 'bg-amber-50 border-[#C9A227] text-[#8F7212] font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-xs font-bold">{sla.label}</span>
                      <span className="block text-[10px] text-slate-400">{sla.note}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestSurveyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onConfirmRequestSurvey}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Phát Lệnh Khảo Sát / Đo Lại (WF-11)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
