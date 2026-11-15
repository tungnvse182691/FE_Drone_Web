import React from 'react'

export interface NewExportModalProps {
  busy?:boolean;pending?:boolean;received?:boolean;journalKey?:string;error?:string;detailError?:string
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
  busy,pending,received,journalKey,error,detailError,
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
          {error&&<p role="alert" className="text-rose-800">{error}</p>}
          {pending&&<p role="status" className="break-all">Giữ yêu cầu {journalKey}; không thay body/key.</p>}
          <fieldset disabled={busy||pending} className="space-y-3.5 border-0 p-0 m-0">
          {/* Loại báo cáo / hồ sơ */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Loại hồ sơ kỹ thuật cần xuất</label>
            <select
              value={exportForm.reportType}
              onChange={(e) => setExportForm({ ...exportForm, reportType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none font-medium cursor-pointer"
            >
              <option value="DOSSIER">Hồ sơ kỹ thuật tổng hợp</option>
            </select>
          </div>

          {/* Phạm vi dự án */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Dự án & Phân đoạn bảo hành</label>
            <input aria-label="Dự án xuất hồ sơ" readOnly value={exportForm.scope} className="w-full border rounded-lg p-2" />
            <p className="text-slate-500">Xuất toàn bộ phạm vi được phép đọc của dự án đã chọn.</p>
          </div>

          {/* Lọc dữ liệu đến thời điểm (tùy chọn) */}
          <div className="space-y-1">
            <label className="font-medium text-slate-700">Lọc dữ liệu đến thời điểm (tùy chọn)</label>
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
                checked disabled

                className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-700">Manifest luôn có mã băm snapshot; nội dung tải được đối chiếu riêng</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportForm.includeOriginalFiles}
                disabled={exportForm.format==='PDF'}
                onChange={(e) => setExportForm({ ...exportForm, includeOriginalFiles: e.target.checked })}
                className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-700">Đính kèm ảnh/video gốc độ phân giải cao phục vụ kiểm định</span>
            </label>
          </div>

          <label className="grid gap-1">Định dạng<select aria-label="Định dạng xuất hồ sơ" value={exportForm.format} onChange={e=>setExportForm({...exportForm,format:e.target.value,includeOriginalFiles:e.target.value==='PDF'?false:exportForm.includeOriginalFiles})} className="border rounded-lg p-2"><option value="">Chọn PDF hoặc ZIP</option><option value="PDF">PDF</option><option value="ZIP">ZIP</option></select></label>
          </fieldset>
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
              disabled={busy||!pending&&!exportForm.format}
              className="px-4 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium cursor-pointer transition shadow-xs"
            >
              {received?'Đọc lại yêu cầu đã nhận':pending?'Đối chiếu đúng yêu cầu đang chờ':'Bắt đầu xuất hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
