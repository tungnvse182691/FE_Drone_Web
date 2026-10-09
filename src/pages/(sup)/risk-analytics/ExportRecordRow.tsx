import React from 'react'
import { ExportRecord } from './types'

export interface ExportRecordRowProps {
  record: ExportRecord
  onDownloadFile: (fileName: string) => void
  onSelectDetail: (record: ExportRecord) => void
  onRetry: (id: string) => void
  onDelete: (id: string, code: string) => void
}

export const ExportRecordRow: React.FC<ExportRecordRowProps> = ({
  record,
  onDownloadFile,
  onSelectDetail,
  onRetry,
  onDelete
}) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 font-mono font-semibold text-[#8C6D1F]">
        {record.code}
      </td>

      <td className="py-3 px-4">
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 text-xs">
            {record.type}
          </span>
          <span className="font-mono text-[11px] text-slate-500 mt-0.5">
            Mã DA: {record.project_code} • {record.dossier_no}
          </span>
        </div>
      </td>

      <td className="py-3 px-4 font-mono text-xs text-slate-800">
        {record.scope_display}
      </td>

      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
        {record.as_of_time}
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-slate-800">{record.file_size}</span>
          <span className="text-slate-500 text-[11px]">({record.format_display})</span>
        </div>
      </td>

      <td className="py-3 px-4">
        {record.status === 'COMPLETED' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
            <span>Đã hoàn thành</span>
          </span>
        ) : record.status === 'PROCESSING' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="material-symbols-outlined text-[13px] text-amber-600 animate-spin">sync</span>
            <span>Đang xử lý</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="material-symbols-outlined text-[13px] text-rose-600">error</span>
            <span>Thất bại</span>
          </span>
        )}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {record.status === 'COMPLETED' && (
            <button
              onClick={() => onDownloadFile(`${record.code}.zip`)}
              type="button"
              className="p-1 rounded text-slate-500 hover:text-[#8C6D1F] hover:bg-slate-100 transition cursor-pointer"
              title="Tải xuống tệp lưu trữ"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
            </button>
          )}

          <button
            onClick={() => onSelectDetail(record)}
            type="button"
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Xem chi tiết hồ sơ & mã băm SHA-256"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>

          {record.status === 'FAILED' && (
            <button
              onClick={() => onRetry(record.id)}
              type="button"
              className="p-1 rounded text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition cursor-pointer"
              title="Thử lại tác vụ nén"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          )}

          <button
            onClick={() => onDelete(record.id, record.code)}
            type="button"
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Xóa hồ sơ khỏi danh mục"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
