import React from 'react'
import { Archive, X } from 'lucide-react'

export interface NewExportModalProps {
  isOpen: boolean
  onClose: () => void
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
  onSubmit: (e: React.FormEvent) => void
}

export const NewExportModal: React.FC<NewExportModalProps> = ({
  isOpen,
  onClose,
  exportForm,
  setExportForm,
  onSubmit
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-brand-gold" />
            <h3 className="font-sansation text-lg font-bold text-slate-900">
              Khởi tạo yêu cầu xuất hồ sơ (Export Job)
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
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

          {/* Cấu hình Backend v2.2 */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
              Cấu hình xuất dữ liệu & Toàn vẹn số (Backend v2.2)
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportForm.includeSha256Checksum}
                onChange={(e) => setExportForm({ ...exportForm, includeSha256Checksum: e.target.checked })}
                className="rounded text-brand-gold focus:ring-brand-gold w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-700">Sinh mã băm SHA-256 Checksum cho từng ảnh gốc (BR-20)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportForm.includeOriginalFiles}
                onChange={(e) => setExportForm({ ...exportForm, includeOriginalFiles: e.target.checked })}
                className="rounded text-brand-gold focus:ring-brand-gold w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-700 font-medium">Đính kèm ảnh/video gốc độ phân giải cao (includeOriginalFiles)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-gold hover:bg-[#B38E1F] text-white font-sansation font-bold cursor-pointer transition shadow-2xs"
            >
              Bắt đầu xuất hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
