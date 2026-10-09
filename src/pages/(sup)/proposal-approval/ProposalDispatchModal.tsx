import React, { useState } from 'react'
import {
  X,
  Truck,
  CheckCircle2,
  Send,
  Users2
} from 'lucide-react'
import { RepairItemDetail, CREW_OPTIONS } from './types'

export interface ProposalDispatchModalProps {
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
  onConfirmDispatch: (bulkCrewName?: string) => void
}

export const ProposalDispatchModal: React.FC<ProposalDispatchModalProps> = ({
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
  const [isBulkOverride, setIsBulkOverride] = useState(false)
  const [bulkCrew, setBulkCrew] = useState<string>(CREW_OPTIONS[0])

  if (!isOpen) return null

  const approvedItems = items.filter((i) => i.status === 'APPROVED')

  // Group approved items by assigned crew to show overview
  const crewBreakdown = approvedItems.reduce<Record<string, number>>((acc, item) => {
    const crew = item.assigned_crew || 'Chưa gán'
    acc[crew] = (acc[crew] || 0) + 1
    return acc
  }, {})

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-brand-border rounded-2xl text-left shadow-2xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        <div className="bg-brand-surfaceAlt border-b border-brand-border p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold text-white flex items-center justify-center shrink-0 shadow-2xs">
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
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Danh sách hạng mục bàn giao xuất quân:
              </span>
              <span className="text-[11px] text-slate-500">
                {approvedItems.length} vị trí đã sẵn sàng
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {approvedItems.map((item) => {
                const assignedCrew = isBulkOverride ? bulkCrew : (item.assigned_crew || 'Chưa gán')
                return (
                  <div key={item.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-white/70 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono font-bold text-slate-800">{item.item_code}</span>
                      <span className="text-slate-500 font-mono text-[11px]">({item.chainage})</span>
                      <span className="text-slate-700 font-medium truncate max-w-[200px]" title={item.defect_title}>
                        {item.defect_title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-[#92700C] text-[11px]">{item.volume_display}</span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[10px] text-amber-900 font-semibold shadow-2xs">
                        <Users2 className="w-3 h-3 text-brand-gold shrink-0" />
                        <span>{assignedCrew}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Phân công tổ thi công: Tôn trọng phân công chi tiết + Tùy chọn gán nhanh */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-brand-gold" />
                <span>Phân công các tổ thi công:</span>
              </span>
              {!isBulkOverride && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium">
                  ✓ Theo phân công chi tiết từng vị trí
                </span>
              )}
            </div>

            {!isBulkOverride && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {Object.entries(crewBreakdown).map(([crew, count]) => (
                  <span
                    key={crew}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-[11px] shadow-2xs"
                  >
                    <span className="font-bold text-slate-900">{crew}:</span>
                    <span className="text-[#92700C] font-mono font-bold">{count}</span> hạng mục
                  </span>
                ))}
              </div>
            )}

            {/* Checkbox Gán nhanh cho 1 đội duy nhất */}
            <div className="pt-1 border-t border-slate-200/80">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={isBulkOverride}
                  onChange={(e) => setIsBulkOverride(e.target.checked)}
                  className="rounded border-slate-300 text-brand-gold focus:ring-brand-gold cursor-pointer"
                />
                <span>Gán nhanh 1 Đội thi công duy nhất cho toàn bộ {stats.approved} hạng mục</span>
              </label>

              {isBulkOverride && (
                <div className="mt-2 pl-6 space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Chọn đội tiếp nhận toàn bộ gói đề xuất:
                  </label>
                  <select
                    value={bulkCrew}
                    onChange={(e) => setBulkCrew(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold cursor-pointer"
                  >
                    {CREW_OPTIONS.map((crew) => (
                      <option key={crew} value={crew}>
                        {crew}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Lựa chọn này sẽ thay thế các tổ đã chọn riêng ở ngoài bảng cho tất cả {stats.approved} hạng mục.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Thời hạn hoàn thành thi công (Deadline):</label>
              <input
                type="text"
                value={dispatchDeadline}
                onChange={(e) => setDispatchDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-gold"
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
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-gold resize-none font-medium"
            />
          </div>
        </div>

        <div className="bg-brand-surfaceAlt border-t border-brand-border px-6 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-4 h-9 bg-white border border-brand-border text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs shadow-2xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onConfirmDispatch(isBulkOverride ? bulkCrew : undefined)}
            type="button"
            className="px-5 h-9 bg-brand-gold hover:bg-[#B38E1F] text-white transition rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Phát lệnh xuất quân (Dispatch)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default ProposalDispatchModal
