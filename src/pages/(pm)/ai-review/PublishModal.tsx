import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  publishPublicNote: string
  setPublishPublicNote: (note: string) => void
  onConfirmPublishResult: () => void
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  publishPublicNote,
  setPublishPublicNote,
  onConfirmPublishResult,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Icon name="send" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Công Bố Tiến Độ Xử Lý Cho Người Dân (PA07)</h3>
              <p className="text-xs text-slate-500">Đồng bộ thông báo công khai xuống ứng dụng di động Citizen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 block">Hồ sơ phản ánh:</span>
            <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
            <p className="text-slate-600">
              {targetTriageCase.stationing} - {targetTriageCase.defect_title}
            </p>
            <span className="text-[10px] text-slate-400 block">
              Người gửi: {targetTriageCase.reporter_name || 'Người dân'} ({targetTriageCase.reporter_phone || 'N/A'})
            </span>
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">Nội dung thông báo công khai gửi người dân:</label>
            <textarea
              rows={3}
              value={publishPublicNote}
              onChange={(e) => setPublishPublicNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onConfirmPublishResult}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Icon name="send" size={16} />
            <span>Công Bố Xuống App Citizen</span>
          </button>
        </div>
      </div>
    </div>
  )
}
