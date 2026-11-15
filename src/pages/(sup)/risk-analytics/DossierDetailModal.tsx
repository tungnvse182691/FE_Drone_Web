import React from 'react'
import { ExportRecord } from './types'

export interface DossierDetailModalProps {
  error?:string
  isOpen: boolean
  onClose: () => void
  record: ExportRecord | null
  onDownloadFile: (fileName: string) => void
}

export const DossierDetailModal: React.FC<DossierDetailModalProps> = ({
  error,
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
          {error&&<p role="alert" className="text-rose-800">{error}</p>}
          {!record.manifest&&!error&&<p role="status">Đang đọc chi tiết và manifest…</p>}
          <p>Trạng thái máy chủ: {record.server?.status||'Chưa đọc'} · Phiên bản {record.server?.version||'—'}</p>
          <p>Tính đầy đủ: {record.server?.completeness||'Chưa có'} · {record.server?.missingSections?.join(', ')}</p>
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
              <span className="text-slate-500 block text-[11px]">Phạm vi dự án:</span>
              <span className="font-mono font-medium text-slate-800">{record.scope_display}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Thời gian tạo yêu cầu:</span>
              <span className="font-mono font-medium text-slate-800">{record.as_of_time}</span>
            </div>
          </div>

          {/* Hash Verification */}
          <div className="bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800 text-[11px] uppercase tracking-wide">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
              <span>Hash snapshot từ manifest</span>
            </div>
            <div className="font-mono text-[11px] break-all bg-white p-2 rounded-md border border-emerald-200 text-slate-700">
              {record.manifest?.snapshotHash||'Chưa có hash từ manifest'}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              {record.manifest?`${record.manifest.files.length} tệp trong manifest; ${record.manifest.files.filter(f=>f.included).length} tệp được đưa vào gói.`:'Chưa đọc danh sách tệp; chưa xác minh nội dung tải.'}
            </p>
          </div>

          {record.manifest&&<details><summary>Manifest: tệp, nguồn và phần dữ liệu</summary><p>Snapshot {record.manifest.snapshotId} · {record.manifest.snapshotAt}</p><p>Định dạng {record.manifest.format} · {record.manifest.filters.includeOriginalFiles?'Có tệp gốc':'Không kèm tệp gốc'}</p><ul>{record.manifest.files.map(f=><li key={f.fileId} className="border-t py-2 break-all">{f.fileId} · {f.mediaType} · {f.sizeBytes} byte · {f.included?'Đưa vào gói':f.reasonCode||'Không đưa vào gói'}<small className="block">SHA-256 {f.sha256}</small></li>)}</ul><ul>{record.manifest.sections.map((part,i)=><li key={i} className="border-t py-1">{String(part.name||'Phần dữ liệu')} · {String(part.availability||'Chưa có trạng thái')}{Array.isArray(part.reasonCodes)&&part.reasonCodes.length?` · ${part.reasonCodes.join('; ')}`:''}</li>)}</ul><details><summary>Tham chiếu nguồn ({record.manifest.sourceRevisions.length})</summary>{record.manifest.sourceRevisions.map((r,i)=><p key={i} className="break-all">{String(r.kind)} · {String(r.id)} · Phiên bản {String(r.version)}</p>)}</details></details>}
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
              <span className="font-medium text-emerald-700 font-mono">Đối chiếu khi tải nội dung</span>
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
              onDownloadFile(record.id)
              onClose()
            }}
            type="button"
            disabled={!record.manifest||record.server?.status!=='SUCCEEDED'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white font-medium text-xs cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>Tải nội dung hồ sơ</span>
          </button>
        </div>
      </div>
    </div>
  )
}
