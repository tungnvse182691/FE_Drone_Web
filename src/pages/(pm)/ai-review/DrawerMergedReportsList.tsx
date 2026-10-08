import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerMergedReportsListProps {
  selectedCase: TriageCase
  cases: TriageCase[]
  onUnlinkReport: (childId: string) => void
}

export const DrawerMergedReportsList: React.FC<DrawerMergedReportsListProps> = ({
  selectedCase,
  cases,
  onUnlinkReport,
}) => {
  if (!selectedCase.linked_report_ids || selectedCase.linked_report_ids.length === 0) {
    return null
  }

  return (
    <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
          <Icon name="link" size={16} className="text-purple-600" />
          <span>Các Phản Ánh Trùng Đã Gộp ({selectedCase.linked_report_ids.length})</span>
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 border border-purple-300">
          Master Case
        </span>
      </div>

      <div className="space-y-2">
        {selectedCase.linked_report_ids.map((code) => {
          const secondary = cases.find((c) => c.code === code || c.id === code)
          const dupInfo = selectedCase.cluster_duplicates?.find((d) => d.code === code)
          const displayChannel =
            secondary?.reporter_channel ||
            secondary?.source_label ||
            dupInfo?.source ||
            'Ứng dụng Citizen'
          const displayReporter =
            secondary?.reporter_name || dupInfo?.reporter || 'Người dân phản ánh'
          const displayDesc =
            secondary?.description ||
            'Phản ánh hư hỏng tại vị trí lân cận đã được gộp bằng chứng'

          return (
            <div
              key={code}
              className="p-3 bg-white border border-purple-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {secondary?.image_url ? (
                  <img
                    src={secondary.image_url}
                    alt={code}
                    className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 text-purple-600">
                    <Icon name="link" size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-purple-950 text-xs">{code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                      {displayChannel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium truncate mt-0.5">
                    {displayReporter}
                  </p>
                  <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                    "{displayDesc}"
                  </p>
                </div>
              </div>

              {/* Nút Tách hồ sơ nổi bật, rõ ràng */}
              <button
                type="button"
                onClick={() => onUnlinkReport(secondary?.id || code)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
                title="Tách phản ánh này khỏi hồ sơ gốc để xử lý độc lập"
              >
                <Icon name="link_off" size={14} />
                <span>Tách hồ sơ</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
