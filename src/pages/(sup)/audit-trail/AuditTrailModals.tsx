import React from 'react'
import { ImageModalData, ExportFormat, AuditProjectOption } from './types'

interface AuditTrailModalsProps {
  activeImageModal: ImageModalData | null
  onCloseImageModal: () => void
  showExportModal: boolean
  onCloseExportModal: () => void
  exportFormat: ExportFormat
  onChangeExportFormat: (format: ExportFormat) => void
  isPM: boolean
  selectedProject: string
  projectList: AuditProjectOption[]
  filteredCount: number
  exportSuccess: boolean
  onExport: () => void
}

export const AuditTrailModals: React.FC<AuditTrailModalsProps> = ({
  activeImageModal,
  onCloseImageModal,
  showExportModal,
  onCloseExportModal,
  exportFormat,
  onChangeExportFormat,
  isPM: _isPM,
  selectedProject,
  projectList,
  filteredCount,
  exportSuccess,
  onExport
}) => {
  const currentProjectName =
    projectList.find((p) => p.id === selectedProject)?.name || 'Dự án hiện hành'

  return (
    <>
      {/* 1. MODAL: XEM ẢNH HIỆN TRƯỜNG PHÓNG TO */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">photo_camera</span>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeImageModal.caption}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseImageModal}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center max-h-[400px]">
              <img
                src={activeImageModal.url}
                alt={activeImageModal.caption}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360" fill="none"><rect width="600" height="360" fill="%230F172A"/><rect x="20" y="20" width="560" height="320" rx="8" fill="%231E293B" stroke="%23334155" stroke-width="1.5"/><line x1="20" y1="180" x2="580" y2="180" stroke="%23475569" stroke-width="2" stroke-dasharray="8 8"/><circle cx="300" cy="180" r="32" fill="%23C9A227" fill-opacity="0.2" stroke="%23C9A227" stroke-width="2"/><circle cx="300" cy="180" r="6" fill="%23C9A227"/><text x="300" y="240" font-family="sans-serif" font-size="14" font-weight="700" fill="%23E2E8F0" text-anchor="middle">BIÊN BẢN KIỂM TRA HIỆN TRƯỜNG</text><text x="300" y="265" font-family="sans-serif" font-size="11" fill="%2394A3B8" text-anchor="middle">Dữ liệu khảo sát &amp; Trắc địa công trình</text></svg>`
                }}
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>

            {/* EXIF Metadata Card */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Thời điểm ghi nhận:</span>
                <span className="font-mono font-semibold">{activeImageModal.captured_at}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tọa độ GPS EXIF:</span>
                <span className="font-mono font-semibold text-brand-goldDark">{activeImageModal.gps_coordinates}</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onCloseImageModal}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: XUẤT NHẬT KÝ HOẠT ĐỘNG (RPT-10) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-brand-gold">download</span>
                <h3 className="text-sm font-bold text-slate-900">
                  Xuất Nhật Ký Hoạt Động (RPT-10)
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseExportModal}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Trích xuất dữ liệu dòng sự kiện bất biến phục vụ công tác đối soát hồ sơ hoàn công và quản lý bảo hành theo quy định BR-45.
            </p>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phạm vi trích xuất:</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                    {currentProjectName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số lượng sự kiện:</span>
                  <span className="font-mono font-bold text-slate-800">{filteredCount} bản ghi</span>
                </div>
              </div>

              {/* Chọn định dạng */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Định dạng tệp:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeExportFormat('PDF')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      exportFormat === 'PDF'
                        ? 'border-brand-gold bg-amber-50/60 text-brand-dark'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-rose-600">picture_as_pdf</span>
                    <span>Tệp PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeExportFormat('CSV')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      exportFormat === 'CSV'
                        ? 'border-brand-gold bg-amber-50/60 text-brand-dark'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">csv</span>
                    <span>Tệp CSV</span>
                  </button>
                </div>
              </div>

              {exportSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                  <span>Tệp nhật ký hoạt động RPT-10 đã được tải xuống thành công!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onCloseExportModal}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onExport}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-semibold transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Tải tệp ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
