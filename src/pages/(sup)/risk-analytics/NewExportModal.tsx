import React from 'react'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#8C6D1F]">folder_zip</span>
            <h3 className="font-sansation text-base font-bold text-slate-900">
              Khởi tạo yêu cầu xuất hồ sơ
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          {/* Loại báo cáo / hồ sơ */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Loại hồ sơ kỹ thuật cần xuất</label>
            <select
              value={exportForm.reportType}
              onChange={(e) => setExportForm({ ...exportForm, reportType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium cursor-pointer"
            >
              <option value="DOSSIER_COMPLETE">Hồ sơ hoàn công & Bằng chứng số tổng hợp (PDF + ZIP)</option>
              <option value="BEFORE_AFTER_ZIP">Gói ảnh đối chứng Trước/Sau sửa chữa độ phân giải gốc (ZIP)</option>
              <option value="GIS_GEOJSON">Báo cáo kiểm định trắc dọc & Bình đồ GIS (GeoJSON / CSV)</option>
              <option value="AUDIT_TRAIL">Nhật ký thi công & Báo cáo pháp lý TCVN (PDF)</option>
            </select>
          </div>

          {/* Phạm vi dự án */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Dự án & Phân đoạn bảo hành</label>
            <select
              value={exportForm.scope}
              onChange={(e) => setExportForm({ ...exportForm, scope: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium cursor-pointer"
            >
              <option value="PRJ-QL1A-02">QL1A - Giai đoạn 2 (Km 1024 - Km 1045, Đèo Hải Vân)</option>
              <option value="PRJ-CTBN-01">Cao tốc Bắc Nam (Diễn Châu - Bãi Vọt, Km 430 - 479)</option>
              <option value="PRJ-LSTL-05">Cao tốc La Sơn - Túy Loan (Km 35+000 - Km 42+500)</option>
              <option value="PRJ-PTDG-03">Tuyến tránh TP. Huế (QL1A-BP, Km 18+600 - Km 22+400)</option>
            </select>
          </div>

          {/* Mốc thời gian chốt số liệu */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Mốc thời gian chốt số liệu</label>
            <input
              type="datetime-local"
              value={exportForm.asOfDate}
              onChange={(e) => setExportForm({ ...exportForm, asOfDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-mono"
            >
            </input>
          </div>

          {/* Cấu hình toàn vẹn số */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
              Tùy chọn đóng gói kỹ thuật
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportForm.includeSha256Checksum}
                onChange={(e) => setExportForm({ ...exportForm, includeSha256Checksum: e.target.checked })}
                className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-700">Tạo mã băm SHA-256 Checksum cho từng ảnh gốc đối chứng</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportForm.includeOriginalFiles}
                onChange={(e) => setExportForm({ ...exportForm, includeOriginalFiles: e.target.checked })}
                className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-700">Đính kèm ảnh/video gốc độ phân giải cao phục vụ kiểm định</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              type="button"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium cursor-pointer transition shadow-xs"
            >
              Bắt đầu xuất hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
