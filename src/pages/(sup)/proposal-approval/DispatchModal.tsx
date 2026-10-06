import React from 'react'
import {
  X,
  Truck,
  CheckCircle2,
  Send
} from 'lucide-react'
import { RepairItemDetail } from './types'

export interface DispatchModalProps {
  isOpen: boolean
  onClose: () => void
  packageCode: string
  items: RepairItemDetail[]
  stats: {
    total: number
    approved: number
  }
  dispatchDeadline: string
  setDispatchDeadline: (dl: string) => void
  dispatchNotice: string
  setDispatchNotice: (notice: string) => void
  onConfirmDispatch: () => void
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  packageCode,
  items,
  stats,
  dispatchDeadline,
  setDispatchDeadline,
  dispatchNotice,
  setDispatchNotice,
  onConfirmDispatch
}) => {
  if (!isOpen) return null

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-[#E2E5E9] rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        <div className="bg-[#F8F9FA] border-b border-[#E2E5E9] p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-sansation">
                Ban hành Lệnh công tác thi công (Work Order Dispatch)
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Gói: {packageCode} • {stats.approved} hạng mục đã có quyết định APPROVED
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-800 leading-relaxed">
            <strong>Điều kiện bàn giao hợp lệ:</strong> Toàn bộ {stats.approved} hạng mục dưới đây đã được
            Supervisor phê duyệt chính thức giải pháp kỹ thuật và khối lượng. Các hạng mục chưa đạt (
            {stats.total - stats.approved}) sẽ được tiếp tục giải trình ở đợt sau.
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
              Danh sách hạng mục bàn giao xuất quân:
            </span>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {items
                .filter((i) => i.status === 'APPROVED')
                .map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono font-bold text-slate-800">{item.item_code}</span>
                      <span className="text-slate-500">({item.chainage})</span>
                      <span className="text-slate-700 font-medium truncate max-w-xs">{item.defect_title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-[#92700C]">{item.volume_display}</span>
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 font-semibold">
                        {item.assigned_crew}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Thời hạn hoàn thành thi công (Deadline):</label>
              <input
                type="text"
                value={dispatchDeadline}
                onChange={(e) => setDispatchDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C9A227]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Người phát lệnh (PM / Điều phối):</label>
              <input
                type="text"
                disabled
                value="Kỹ sư Đỗ Quốc Hoàng (Project Manager)"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Chỉ dẫn an toàn giao thông &amp; tổ chức phân luồng:
            </label>
            <textarea
              rows={3}
              value={dispatchNotice}
              onChange={(e) => setDispatchNotice(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A227] resize-none font-medium"
            />
          </div>
        </div>

        <div className="bg-[#F8F9FA] border-t border-[#E2E5E9] px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-4 h-9 bg-white border border-[#E2E5E9] text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirmDispatch}
            type="button"
            className="px-5 h-9 bg-[#C9A227] hover:bg-[#B38E1F] text-white transition rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Phát lệnh xuất quân (Dispatch)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default DispatchModal
