import React from 'react'
import { CaseItem } from './types'

export interface ExportPdfAModalProps {
  isOpen: boolean
  onClose: () => void
  currentItem: CaseItem
  setExportFormat: (f: 'PDF_A' | 'ZIP_PACKAGE') => void
  includeSha256Checksum?: boolean
  setIncludeSha256Checksum?: (b: boolean) => void
  isExporting: boolean
  onExport: () => void
}

export const ExportPdfAModal: React.FC<ExportPdfAModalProps> = ({
  isOpen,
  onClose,
  currentItem,
  setExportFormat,
  includeSha256Checksum,
  setIncludeSha256Checksum,
  isExporting,
  onExport
}) => {
  if (!isOpen) return null

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#C9A227]">description</span>
            <h3 className="font-bold text-sm font-sansation">
              Xuất hồ sơ bằng chứng số (RPT-07)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Hệ thống kết xuất hồ sơ nghiệm thu kỹ thuật theo quy chuẩn TCVN 8819:2011 kèm mã băm SHA-256 chống chỉnh sửa.
          </p>

          <div className="space-y-2">
            <label className="font-semibold text-slate-800 block">Chọn định dạng hồ sơ kết xuất:</label>

            {/* Option 1: PDF/A */}
            <div
              className="p-3 rounded-lg border transition cursor-pointer flex items-start gap-2.5 bg-amber-50 border-amber-300"
            >
              <input
                type="radio"
                name="exportFormat"
                checked={true}
                readOnly
                className="mt-0.5 accent-[#C9A227]"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900 block">Biên bản nghiệm thu kỹ thuật (PDF/A)</span>
                <span className="text-slate-500 text-[11px] block">
                  Tệp PDF chuẩn lưu trữ (ISO 19005), tích hợp hình ảnh Before/After, thông số K98 và mã băm SHA-256.
                </span>
              </div>
            </div>

            {/* Option 2: Switch to ZIP Package */}
            <div
              onClick={() => setExportFormat('ZIP_PACKAGE')}
              className="p-3 rounded-lg border transition cursor-pointer flex items-start gap-2.5 bg-white border-slate-200 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="exportFormat"
                checked={false}
                onChange={() => setExportFormat('ZIP_PACKAGE')}
                className="mt-0.5 accent-[#C9A227]"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900 block">Gói hồ sơ bằng chứng gốc (ZIP Dossier)</span>
                <span className="text-slate-500 text-[11px] block">
                  Chứa toàn bộ ảnh gốc, log tọa độ RTK GPS và file checksum.sha256 chống chối bỏ.
                </span>
              </div>
            </div>
          </div>

          {setIncludeSha256Checksum && (
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-md border border-slate-200">
              <input
                type="checkbox"
                checked={!!includeSha256Checksum}
                onChange={(e) => setIncludeSha256Checksum(e.target.checked)}
                className="w-4 h-4 rounded text-[#C9A227] accent-[#C9A227]"
              />
              <span className="text-slate-800 font-medium text-xs">
                Kèm phụ lục xác thực chữ ký số SHA-256 cho toàn bộ ảnh hiện trường
              </span>
            </label>
          )}

          <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Hạng mục:</span>
              <span className="font-mono font-medium text-slate-900">{currentItem.defect_code} ({currentItem.item_code})</span>
            </div>
            <div className="flex justify-between">
              <span>Mã vụ việc:</span>
              <span className="font-mono font-medium text-slate-900">#CASE-2026-0842</span>
            </div>
            <div className="flex justify-between">
              <span>Mã băm SHA-256:</span>
              <span className="font-mono text-slate-700 font-medium">{currentItem.after_hash.slice(0, 16)}...</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 h-8 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition rounded-md font-medium text-xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            type="button"
            className="px-4 h-8 bg-[#C9A227] hover:bg-[#8C6D1F] text-white transition rounded-md font-medium text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isExporting ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Tải xuống (PDF/A)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
export default ExportPdfAModal
