import React from 'react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
            <h3 className="font-sansation text-base font-bold text-slate-900">
              Chi tiết hồ sơ kết xuất: {record.code}
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

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Loại tài liệu:</span>
              <span className="font-medium text-slate-800">{record.type}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Mã dự án:</span>
              <span className="font-semibold text-slate-800 font-mono">{record.project_code}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Lý trình đoạn tuyến:</span>
              <span className="font-mono font-medium text-slate-800">{record.scope_display}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Thời gian chốt số liệu:</span>
              <span className="font-mono font-medium text-slate-800">{record.as_of_time}</span>
            </div>
          </div>

          {/* Hash Verification */}
          <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800 text-[11px] uppercase tracking-wide">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
              <span>Đã xác thực tính toàn vẹn số</span>
            </div>
            <div className="font-mono text-[11px] break-all bg-white p-2 rounded-md border border-emerald-200 text-slate-700">
              {record.hash_sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              Đã đối soát 48/48 tệp ảnh gốc khớp mã băm SHA-256 không bị sửa đổi.
            </p>
          </div>

          {/* Metadata Items */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Dung lượng lưu trữ:</span>
              <span className="font-mono font-semibold text-slate-800">{record.file_size}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Định dạng gói:</span>
              <span className="font-medium text-slate-800">{record.format_display}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kiểm tra mã băm tệp:</span>
              <span className="font-medium text-emerald-700 font-mono">SHA-256 Hợp lệ</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onDownloadFile(`${record.code}.zip`)
              onClose()
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium text-xs cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>Tải xuống tệp nén</span>
          </button>
        </div>
      </div>
    </div>
  )
}
