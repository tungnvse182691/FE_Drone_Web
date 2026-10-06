import React from 'react'
import { CheckCheck } from 'lucide-react'

export interface BatchApproveModalProps {
  isOpen: boolean
  onClose: () => void
  packageCode: string
  stats: {
    total: number
    approved: number
    totalProposedArea: number
  }
  onConfirm: () => void
}

export const BatchApproveModal: React.FC<BatchApproveModalProps> = ({
  isOpen,
  onClose,
  packageCode,
  stats,
  onConfirm
}) => {
  if (!isOpen) return null

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-brand-border rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-md overflow-hidden z-10 p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
          <CheckCheck className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg text-slate-900 font-sansation">Phê duyệt nhanh tất cả mục hợp lệ</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bạn có chắc chắn muốn phê duyệt thông qua toàn bộ các hạng mục chưa duyệt trong gói{' '}
            <strong className="text-slate-900">{packageCode}</strong>? Sau khi duyệt, PM có quyền phát lệnh thi công
            ngay cho hiện trường.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Số hạng mục sẽ chuyển APPROVED:</span>
            <span className="font-bold text-slate-900">{stats.total - stats.approved} mục</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng diện tích thi công hoàn tất:</span>
            <span className="font-mono font-bold text-[#92700C]">{stats.totalProposedArea} m²</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="w-1/2 h-10 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-bold text-xs shadow-sm cursor-pointer"
          >
            Xác nhận phê duyệt
          </button>
        </div>
      </div>
    </div>
  )
}
export default BatchApproveModal
