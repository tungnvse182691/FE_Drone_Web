import React from 'react'
import { History as HistoryIcon, X } from 'lucide-react'
import { AuditLogItem } from './types'

export interface AuditModalProps {
  isOpen: boolean
  onClose: () => void
  auditLogs: AuditLogItem[]
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  auditLogs
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-brand-gold" />
            <div>
              <h3 className="text-base font-bold text-brand-dark">Nhật Ký Kiểm Toán Thay Đổi Chính Sách (Audit Trail)</h3>
              <p className="text-[10px] text-slate-500 font-mono">Bất biến • Ghi nhận xác thực bằng mã băm SHA-256</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-dark">{log.title}</span>
                <span className="font-mono text-slate-400 text-[10px]">{log.time}</span>
              </div>
              <p className="text-slate-600">
                Người thực hiện: <strong>{log.user}</strong> • Hash kiểm tra:{' '}
                <code className="bg-white px-1.5 py-0.5 rounded text-[10px] text-amber-700 border border-slate-200">
                  {log.hash}
                </code>
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                {log.note}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
