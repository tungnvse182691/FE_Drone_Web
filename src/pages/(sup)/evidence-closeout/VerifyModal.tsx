import React from 'react'
import { CaseItem } from './types'

export interface VerifyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  caseItems: CaseItem[]
}

export const VerifyModal: React.FC<VerifyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  caseItems
}) => {
  if (!isOpen) return null

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden z-10 p-5 space-y-4">
        <div className="w-10 h-10 rounded-lg bg-[#E9F7EC] text-[#2F9E44] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[24px]">task_alt</span>
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-bold text-base text-slate-900 font-sansation">Đóng tổng thể vụ việc phức hợp</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Toàn bộ <strong className="text-slate-800">{caseItems.length}/{caseItems.length} hạng mục</strong> trong vụ việc{' '}
            <strong className="text-slate-800">#CASE-2026-0842</strong> đã được nghiệm thu đạt chất lượng. Xác nhận đóng hồ sơ và lưu trữ bảo hành pháp lý?
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Mã vụ việc:</span>
            <span className="font-mono font-medium text-slate-900">#CASE-2026-0842</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Dự án:</span>
            <span className="font-medium text-slate-900">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tổng diện tích hoàn thành:</span>
            <span className="font-mono font-medium text-[#C9A227]">2.45 m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Thời hạn bảo hành:</span>
            <span className="font-medium text-slate-900">12 tháng (đến 30/08/2027)</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            type="button"
            className="w-1/2 h-8 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition rounded-md font-medium text-xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="w-1/2 h-8 bg-[#2F9E44] hover:bg-[#237834] text-white transition rounded-md font-medium text-xs shadow-xs cursor-pointer"
          >
            Xác nhận đóng vụ việc
          </button>
        </div>
      </div>
    </div>
  )
}
export default VerifyModal
