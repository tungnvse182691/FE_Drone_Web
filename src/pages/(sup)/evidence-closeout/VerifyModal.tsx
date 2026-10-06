import React from 'react'
import { FileCheck } from 'lucide-react'
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden z-10 p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
          <FileCheck className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg text-slate-900 font-sansation">Đóng tổng thể vụ việc phức hợp</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Toàn bộ <strong className="text-slate-900">{caseItems.length}/{caseItems.length} hạng mục</strong> trong vụ việc{' '}
            <strong className="text-slate-900">#CASE-2026-0842</strong> đã được nghiệm thu đạt chất lượng. Xác nhận đóng hồ sơ và lưu trữ bảo hành pháp lý?
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
          <div className="flex justify-between">
            <span>Mã vụ việc:</span>
            <span className="font-mono font-bold text-slate-900">#CASE-2026-0842</span>
          </div>
          <div className="flex justify-between">
            <span>Dự án:</span>
            <span className="font-semibold text-slate-900">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng diện tích khắc phục:</span>
            <span className="font-mono font-bold text-[#92700C]">2.45 m²</span>
          </div>
          <div className="flex justify-between">
            <span>Thời hạn bảo hành:</span>
            <span className="font-semibold text-slate-900">12 tháng (đến 30/08/2027)</span>
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
            className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-bold text-xs shadow-xs cursor-pointer"
          >
            Xác nhận đóng vụ việc
          </button>
        </div>
      </div>
    </div>
  )
}
export default VerifyModal
