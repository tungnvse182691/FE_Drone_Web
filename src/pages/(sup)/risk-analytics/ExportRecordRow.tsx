import React from 'react'
import {
  Download,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react'
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
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4 font-mono font-bold text-[#C9A227]">
        {record.code}
      </td>

      <td className="py-3.5 px-4">
        <div className="flex flex-col">
          <span
            className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${record.type_badge_color}`}
          >
            {record.type}
          </span>
          <span className="font-mono text-[11px] text-slate-500 mt-1">
            Mã DA: {record.project_code} • {record.dossier_no}
          </span>
        </div>
      </td>

      <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
        {record.scope_display}
      </td>

      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
        {record.as_of_time}
      </td>

      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-slate-800">{record.file_size}</span>
          <span className="text-slate-500 text-[11px]">({record.format_display})</span>
        </div>
      </td>

      <td className="py-3.5 px-4">
        {record.status === 'COMPLETED' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            COMPLETED
          </span>
        ) : record.status === 'PROCESSING' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            PROCESSING
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            FAILED
          </span>
        )}
      </td>

      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {record.status === 'COMPLETED' && (
            <button
              onClick={() => onDownloadFile(`${record.code}.zip`)}
              type="button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#C9A227] hover:bg-slate-100 transition cursor-pointer"
              title="Tải xuống gói hồ sơ"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onSelectDetail(record)}
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Xem chi tiết hồ sơ & mã băm SHA-256"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {record.status === 'FAILED' && (
            <button
              onClick={() => onRetry(record.id)}
              type="button"
              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition cursor-pointer"
              title="Thử lại (Retry)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onDelete(record.id, record.code)}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Xóa hồ sơ khỏi kho"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
