import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
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

  const crewBreakdown = approvedItems.reduce<Record<string, number>>((acc, item) => {
    const crew = item.assigned_crew || 'Chưa gán'
    acc[crew] = (acc[crew] || 0) + 1
    return acc
  }, {})

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 font-body" role="dialog">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="relative bg-white border border-slate-200 rounded-xl text-left shadow-xl transition-all sm:w-full sm:max-w-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#F8F9FA] border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Icon name="local_shipping" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-headline">
                Phát lệnh giao việc thi công hiện trường (Work Order Dispatch)
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Mã gói: {packageCode} • {stats.approved}/{stats.total} hạng mục đã duyệt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition flex items-center justify-center cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div className="bg-[#E9F7EC] border border-emerald-200 p-3 rounded-lg flex items-start gap-2.5">
            <Icon name="check_circle" size={16} className="text-[#2F9E44] shrink-0 mt-0.5" />
            <div className="text-slate-700 leading-relaxed">
              Toàn bộ <strong className="text-slate-900">{stats.approved} hạng mục</strong> đã được thẩm duyệt hợp lệ. Lệnh công tác này sẽ được chuyển ngay đến ứng dụng hiện trường của các Tổ thi công.
            </div>
          </div>

          {/* Phân bổ các tổ */}
          <div className="space-y-2 bg-[#F8F9FA] border border-slate-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 font-headline">
                <Icon name="group" size={16} className="text-brand-gold" />
                <span>Phân bổ các tổ thi công ({Object.keys(crewBreakdown).length} tổ):</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {Object.entries(crewBreakdown).map(([crew, count]) => (
                <div
                  key={crew}
                  className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md border border-slate-200 text-xs"
                >
                  <span className="font-medium text-slate-800">{crew}</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                    {count} hạng mục
                  </span>
                </div>
              ))}
            </div>

            {/* Checkbox Gán nhanh cho 1 đội duy nhất */}
            <div className="pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={isBulkOverride}
                  onChange={(e) => setIsBulkOverride(e.target.checked)}
                  className="rounded border-slate-300 accent-brand-gold cursor-pointer"
                />
                <span>Gán nhanh 1 Đội thi công duy nhất cho toàn bộ {stats.approved} hạng mục</span>
              </label>

              {isBulkOverride && (
                <div className="mt-2 pl-5 space-y-1">
                  <select
                    value={bulkCrew}
                    onChange={(e) => setBulkCrew(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                  >
                    {CREW_OPTIONS.map((crew) => (
                      <option key={crew} value={crew}>
                        {crew}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Thời hạn hoàn thành thi công:</label>
              <input
                type="text"
                value={dispatchDeadline}
                onChange={(e) => setDispatchDeadline(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-normal focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Người phát lệnh (PM / Điều phối):</label>
              <input
                type="text"
                disabled
                value="Kỹ sư Đỗ Quốc Hoàng (Project Manager)"
                className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 font-normal"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              Chỉ dẫn an toàn giao thông &amp; tổ chức phân luồng:
            </label>
            <textarea
              rows={2}
              value={dispatchNotice}
              onChange={(e) => setDispatchNotice(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none font-normal"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-lg font-medium text-xs shadow-2xs cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onConfirmDispatch(isBulkOverride ? bulkCrew : undefined)}
            type="button"
            className="px-4 py-1.5 bg-brand-gold hover:bg-brand-goldMuted text-white transition rounded-lg font-medium text-xs shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="send" size={14} />
            <span>Phát lệnh xuất quân</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default ProposalDispatchModal
