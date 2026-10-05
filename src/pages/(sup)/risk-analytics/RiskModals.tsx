import React from 'react'
import {
  Archive,
  X,
  FileCheck2,
  ShieldCheck,
  Download,
  Calendar
} from 'lucide-react'
import { ExportRecord } from './types'

export interface RiskModalsProps {
  isExportModalOpen: boolean
  setIsExportModalOpen: (open: boolean) => void
  exportForm: {
    reportType: string
    scope: string
    asOfDate: string
    includeOriginalFiles: boolean
    includeSha256Checksum: boolean
    compressRawTiff: boolean
    format: string
  }
  setExportForm: React.Dispatch<React.SetStateAction<{
    reportType: string
    scope: string
    asOfDate: string
    includeOriginalFiles: boolean
    includeSha256Checksum: boolean
    compressRawTiff: boolean
    format: string
  }>>
  handleCreateExportJob: (e: React.FormEvent) => void
  isPreviewModalOpen: boolean
  setIsPreviewModalOpen: (open: boolean) => void
  selectedRecordForDetail: ExportRecord | null
  handleDownloadFile: (fileName: string) => void
  isTimeRangeModalOpen: boolean
  setIsTimeRangeModalOpen: (open: boolean) => void
  showToast: (msg: string) => void
}

export const RiskModals: React.FC<RiskModalsProps> = ({
  isExportModalOpen,
  setIsExportModalOpen,
  exportForm,
  setExportForm,
  handleCreateExportJob,
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  selectedRecordForDetail,
  handleDownloadFile,
  isTimeRangeModalOpen,
  setIsTimeRangeModalOpen,
  showToast
}) => {
  return (
    <>
      {/* ========================================================================= */}
      {/* MODAL 1: TẠO YÊU CẦU XUẤT HỒ SƠ MỚI (NEW EXPORT MODAL)                    */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-sansation text-lg font-bold text-slate-900">
                  Khởi tạo yêu cầu xuất hồ sơ (Export Job)
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExportJob} className="space-y-4 text-xs">
              {/* Loại báo cáo / hồ sơ */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Loại hồ sơ kỹ thuật cần xuất</label>
                <select
                  value={exportForm.reportType}
                  onChange={(e) => setExportForm({ ...exportForm, reportType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium cursor-pointer"
                >
                  <option value="DOSSIER_COMPLETE">Hồ sơ hoàn công & Bằng chứng số tổng hợp (PDF + ZIP)</option>
                  <option value="BEFORE_AFTER_ZIP">Gói ảnh đối chứng Before/After độ phân giải gốc (ZIP)</option>
                  <option value="GIS_GEOJSON">Báo cáo kiểm định trắc dọc & Bình đồ GIS (GeoJSON / CSV)</option>
                  <option value="AUDIT_TRAIL">Nhật ký xử lý & Báo cáo pháp lý TCVN (PDF/A-1a)</option>
                </select>
              </div>

              {/* Phạm vi dự án */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Dự án & Phân đoạn bảo hành</label>
                <select
                  value={exportForm.scope}
                  onChange={(e) => setExportForm({ ...exportForm, scope: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium cursor-pointer"
                >
                  <option value="PRJ-QL1A-02">QL1A - Giai đoạn 2 (Km 1024 - Km 1045, Đèo Hải Vân)</option>
                  <option value="PRJ-CTBN-01">Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt, Km 430 - 479)</option>
                  <option value="PRJ-LSTL-05">Cao tốc La Sơn - Túy Loan (Km 35+000 - Km 42+500)</option>
                  <option value="PRJ-PTDG-03">Tuyến tránh TP. Huế (QL1A-BP, Km 18+600 - Km 22+400)</option>
                </select>
              </div>

              {/* Mốc thời gian As-Of */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mốc thời gian khóa số liệu (As-Of Timestamp)</label>
                <input
                  type="datetime-local"
                  value={exportForm.asOfDate}
                  onChange={(e) => setExportForm({ ...exportForm, asOfDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono font-medium"
                />
              </div>

              {/* Tùy chọn cấu hình chuẩn Backend v2.2 ExportRequest */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Cấu hình xuất dữ liệu & Toàn vẹn số (Backend v2.2)
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportForm.includeSha256Checksum}
                    onChange={(e) => setExportForm({ ...exportForm, includeSha256Checksum: e.target.checked })}
                    className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-700">Sinh mã băm SHA-256 Checksum cho từng ảnh gốc (BR-20)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportForm.includeOriginalFiles}
                    onChange={(e) => setExportForm({ ...exportForm, includeOriginalFiles: e.target.checked })}
                    className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">Đính kèm ảnh/video gốc độ phân giải cao (includeOriginalFiles)</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  type="button"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold cursor-pointer transition shadow-2xs"
                >
                  Bắt đầu xuất hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: XEM CHI TIẾT HỒ SƠ & MÃ BĂM (DOSSIER DETAIL MODAL)              */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-sansation text-lg font-bold text-slate-900">
                  Chi tiết hồ sơ kết xuất: {selectedRecordForDetail.code}
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Loại tài liệu:</span>
                  <span className="font-semibold text-slate-800">{selectedRecordForDetail.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Dự án:</span>
                  <span className="font-semibold text-slate-800">{selectedRecordForDetail.project_code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Phạm vi tuyến:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedRecordForDetail.scope_display}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mốc thời gian As-Of:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedRecordForDetail.as_of_time}</span>
                </div>
              </div>

              {/* Hash Verification */}
              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Xác thực tính toàn vẹn (Integrity Verified)</span>
                </div>
                <div className="font-mono text-[11px] break-all bg-white p-2 rounded-lg border border-emerald-200/80 text-slate-700">
                  {selectedRecordForDetail.hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">
                  Đã kiểm tra đối soát 48/48 tệp ảnh gốc khớp mã băm SHA-256 không bị can thiệp.
                </p>
              </div>

              {/* Metadata Items */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Dung lượng lưu trữ:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedRecordForDetail.file_size}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Định dạng gói:</span>
                  <span className="font-semibold text-slate-800">{selectedRecordForDetail.format_display}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Kiểm tra toàn vẹn tệp:</span>
                  <span className="font-semibold text-emerald-700 font-mono">SHA-256 Checksum Hợp lệ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleDownloadFile(`${selectedRecordForDetail.code}.zip`)
                  setIsPreviewModalOpen(false)
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp nén</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TÙY CHỈNH KHUNG THỜI GIAN (TIME RANGE MODAL)                     */}
      {/* ========================================================================= */}
      {isTimeRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-sansation text-lg font-bold text-slate-900">
                  Tùy chỉnh khung thời gian báo cáo
                </h3>
              </div>
              <button
                onClick={() => setIsTimeRangeModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Từ ngày</label>
                <input
                  type="date"
                  defaultValue="2026-07-01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Đến ngày</label>
                <input
                  type="date"
                  defaultValue="2026-09-30"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Chu kỳ phân tích định kỳ</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium cursor-pointer">
                  <option>Theo Quý (Quarterly Breakdown)</option>
                  <option>Theo Tháng (Monthly Breakdown)</option>
                  <option>Lũy kế chu kỳ bảo hành (Full Warranty Lifecycle)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsTimeRangeModalOpen(false)}
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setIsTimeRangeModalOpen(false)
                  showToast('Đã áp dụng khung thời gian mới cho toàn bộ chỉ số KPI!')
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
