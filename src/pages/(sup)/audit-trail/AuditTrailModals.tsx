import React from 'react'
import {
  Camera,
  X,
  Calendar,
  MapPin,
  Download,
  FileText,
  FileCheck,
  CheckCircle2
} from 'lucide-react'
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
  isPM,
  selectedProject,
  projectList,
  filteredCount,
  exportSuccess,
  onExport
}) => {
  return (
    <>
      {/* 6. MODAL: XEM ẢNH PHÓNG TO & METADATA HIỆN TRƯỜNG (LIGHTBOX MODAL) */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {activeImageModal.caption}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseImageModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[420px]">
              <img
                src={activeImageModal.url}
                alt={activeImageModal.caption}
                className="w-full h-auto max-h-[420px] object-contain"
              />
            </div>

            {/* EXIF Metadata Card */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Thời điểm ghi nhận:
                </span>
                <span className="font-mono font-semibold">{activeImageModal.captured_at}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Tọa độ GPS EXIF:
                </span>
                <span className="font-mono font-semibold text-brand-goldDark">{activeImageModal.gps_coordinates}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onCloseImageModal}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Đóng ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: XUẤT NHẬT KÝ KIỂM TOÁN (EXPORT AUDIT LOG MODAL - FR-35, US-16, Điều 11.5) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-brand-gold" />
                <h3 className="text-base font-bold text-slate-900">
                  Xuất hồ sơ lịch sử hoạt động (RPT-10)
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseExportModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 font-semibold">Chọn định dạng tệp xuất (FR-35, Điều 11.5):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeExportFormat('PDF')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      exportFormat === 'PDF'
                        ? 'border-brand-gold bg-amber-50/50 text-brand-goldDark font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-red-600" />
                    <span>PDF Báo cáo pháp lý</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeExportFormat('CSV')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      exportFormat === 'CSV'
                        ? 'border-brand-gold bg-amber-50/50 text-brand-goldDark font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span>CSV Bảng kê sự kiện</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Phạm vi xuất:</span>
                  <span className="font-semibold text-slate-900">
                    {isPM
                      ? 'Dự án QL1A - Giai đoạn 2'
                      : selectedProject === 'all'
                      ? 'Toàn bộ các dự án hệ thống'
                      : projectList.find((p) => p.id === selectedProject)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Số lượng sự kiện:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {filteredCount} sự kiện
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Thời điểm kết xuất:</span>
                  <span className="font-mono text-slate-900">
                    {new Date().toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>

              {exportSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tệp hồ sơ kiểm toán RPT-10 đã được tải xuống thành công!</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onCloseExportModal}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onExport}
                className="px-4 py-2 rounded-xl bg-brand-gold text-white text-xs font-semibold hover:bg-brand-goldDark transition-colors shadow-xs"
              >
                Tải xuống tệp {exportFormat}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
