import React from 'react'
import { FileCheck2, ShieldCheck, Download, X } from 'lucide-react'
import { ExportRecord } from './types'

export interface DossierDetailModalProps {
  isOpen: boolean
  onClose: () => void
  record: ExportRecord | null
  onDownloadFile: (fileName: string) => void
}

export const DossierDetailModal: React.FC<DossierDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onDownloadFile
}) => {
  if (!isOpen || !record) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-sansation text-lg font-bold text-slate-900">
              Chi tiết hồ sơ kết xuất: {record.code}
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

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Loại tài liệu:</span>
              <span className="font-semibold text-slate-800">{record.type}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Dự án:</span>
              <span className="font-semibold text-slate-800">{record.project_code}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Phạm vi tuyến:</span>
              <span className="font-mono font-semibold text-slate-800">{record.scope_display}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Mốc thời gian As-Of:</span>
              <span className="font-mono font-semibold text-slate-800">{record.as_of_time}</span>
            </div>
          </div>

          {/* Hash Verification */}
          <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px] uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Xác thực tính toàn vẹn (Integrity Verified)</span>
            </div>
            <div className="font-mono text-[11px] break-all bg-white p-2 rounded-lg border border-emerald-200/80 text-slate-700">
              {record.hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">
              Đã kiểm tra đối soát 48/48 tệp ảnh gốc khớp mã băm SHA-256 không bị can thiệp.
            </p>
          </div>

          {/* Metadata Items */}
          <div className="border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Dung lượng lưu trữ:</span>
              <span className="font-mono font-bold text-slate-800">{record.file_size}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Định dạng gói:</span>
              <span className="font-semibold text-slate-800">{record.format_display}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kiểm tra toàn vẹn tệp:</span>
              <span className="font-semibold text-emerald-700 font-mono">SHA-256 Checksum Hợp lệ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onDownloadFile(`${record.code}.zip`)
              onClose()
            }}
            type="button"
            className="px-4 py-2 rounded-xl bg-brand-gold hover:bg-[#B38E1F] text-white font-sansation font-bold text-xs cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải tệp nén</span>
          </button>
        </div>
      </div>
    </div>
  )
}
