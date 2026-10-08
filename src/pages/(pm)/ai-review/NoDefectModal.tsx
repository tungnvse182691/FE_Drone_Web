import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface NoDefectModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  noDefectReason: string
  setNoDefectReason: (r: string) => void
  onConfirmNoDefect: () => void
}

export const NoDefectModal: React.FC<NoDefectModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  noDefectReason,
  setNoDefectReason,
  onConfirmNoDefect,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Icon name="cancel" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Kết Luận: Không Có Khiếm Khuyết (NO_DEFECT)</h3>
              <p className="text-xs text-red-600 font-semibold">
                Quy chuẩn bất biến BR-39: Bắt buộc giải trình kỹ thuật
              </p>
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
            <span className="font-bold text-slate-700 block">Hồ sơ xem xét từ chối:</span>
            <span className="font-mono font-bold text-brand-dark">
              {targetTriageCase.code} ({targetTriageCase.stationing})
            </span>
            <p className="text-slate-500">{targetTriageCase.defect_title}</p>
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">
              Lý do giải trình kỹ thuật từ chối: <span className="text-red-500">* (Bắt buộc theo BR-39)</span>
            </label>
            <textarea
              rows={3}
              value={noDefectReason}
              onChange={(e) => setNoDefectReason(e.target.value)}
              placeholder="Ghi rõ lý do: ví dụ vết nước đọng bề mặt, bùn đất rác rãnh mép đường, không cấu thành nứt vỡ kết cấu mặt đường bê tông xi măng..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
              required
            />
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-[11px] text-red-800 flex items-start gap-2">
            <Icon name="warning" size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>
              Lý do này sẽ được ghi vào nhật ký kiểm toán không thể xóa (Audit Trail) và phản hồi lý do chính thức
              cho người dân trên ứng dụng di động.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmNoDefect}
            className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Icon name="check" size={16} />
            <span>Xác Nhận Kết Luận NO_DEFECT</span>
          </button>
        </div>
      </div>
    </div>
  )
}
