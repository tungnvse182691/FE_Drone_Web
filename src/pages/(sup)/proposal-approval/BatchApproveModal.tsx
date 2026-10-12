import React from 'react'
import { Icon } from '../../../components/ui/Icon'

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
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-slate-200 rounded-xl text-left shadow-xl transition-all sm:w-full sm:max-w-md overflow-hidden z-10 p-5 space-y-4">
        <div className="w-10 h-10 rounded-lg bg-[#E9F7EC] text-[#2F9E44] flex items-center justify-center mx-auto">
          <Icon name="done_all" size={20} />
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-bold text-base text-slate-900 font-headline">Phê duyệt nhanh tất cả mục hợp lệ</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bạn có chắc chắn muốn phê duyệt thông qua toàn bộ các hạng mục chưa duyệt trong gói{' '}
            <strong className="text-slate-900">{packageCode}</strong>? Sau khi duyệt, PM có quyền phát lệnh thi công
            ngay cho hiện trường.
          </p>
        </div>

        <div className="bg-[#F8F9FA] p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Số hạng mục sẽ chuyển APPROVED:</span>
            <span className="font-bold text-slate-900">{stats.total - stats.approved} mục</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng diện tích thi công hoàn tất:</span>
            <span className="font-mono font-bold text-brand-gold">{stats.totalProposedArea} m²</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition rounded-lg font-medium text-xs shadow-2xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-4 py-1.5 bg-[#2F9E44] hover:bg-emerald-700 text-white transition rounded-lg font-medium text-xs shadow-xs cursor-pointer"
          >
            Xác nhận phê duyệt
          </button>
        </div>
      </div>
    </div>
  )
}
export default BatchApproveModal
