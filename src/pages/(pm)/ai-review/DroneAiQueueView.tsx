import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { TriageCase } from './types'

export interface DroneAiQueueViewProps {
  filteredCases: TriageCase[]
  selectedCase: TriageCase
  onSelectCase: (c: TriageCase) => void
}

export const DroneAiQueueView: React.FC<DroneAiQueueViewProps> = ({
  filteredCases,
  selectedCase,
  onSelectCase
}) => {
  return (
    <div>
      {/* Table Header Row */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg mb-2">
        <span className="col-span-2">Mã Case</span>
        <span className="col-span-2">Nguồn Dữ Liệu</span>
        <span className="col-span-3">Vị Trí &amp; Lý Trình</span>
        <span className="col-span-2">Loại Hư Hỏng</span>
        <span className="col-span-1">Ưu Tiên</span>
        <span className="col-span-2 text-right">Trạng Thái</span>
      </div>

      <div className="space-y-2">
        {filteredCases.map((item) => {
          const isSelected = item.id === selectedCase.id
          return (
            <div
              key={item.id}
              onClick={() => onSelectCase(item)}
              className={`p-3.5 rounded-xl cursor-pointer transition-all flex flex-col md:grid md:grid-cols-12 gap-3 items-start md:items-center border ${
                isSelected
                  ? 'bg-amber-50/60 border-brand-gold shadow-sm ring-1 ring-brand-gold/30'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs'
              }`}
            >
              {/* Code */}
              <div className="md:col-span-2 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-brand-gold'
                      : item.status === 'MERGED'
                      ? 'bg-blue-400'
                      : 'bg-slate-300'
                  }`}
                />
                <span className="font-mono font-bold text-xs text-brand-dark">{item.code}</span>
              </div>

              {/* Source */}
              <div className="md:col-span-2 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 font-medium text-[11px] px-2.5 py-0.5 rounded-full ${
                    item.source === 'DRONE_AI'
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : item.source === 'CITIZEN'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-[#8F7212] border border-amber-200'
                  }`}
                >
                  <Icon
                    name={item.source === 'DRONE_AI' ? 'flight_takeoff' : item.source === 'CITIZEN' ? 'smartphone' : 'directions_car'}
                    size={13}
                    className={item.source === 'CITIZEN' ? 'text-blue-600' : item.source === 'DRONE_AI' ? 'text-slate-500' : 'text-brand-gold'}
                  />
                  <span>{item.source_label}</span>
                </span>
              </div>

              {/* Location & Chainage */}
              <div className="md:col-span-3 flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-xs text-brand-dark">{item.project_name}</span>
                  {item.cluster_duplicates && item.cluster_duplicates.length > 0 && (
                    <span
                      className="text-amber-600"
                      title={`Có ${item.cluster_duplicates.length} phản ánh trùng lân cận`}
                    >
                      <Icon name="warning" size={13} />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span
                    className={`font-mono text-[11px] font-medium px-2 py-0.5 rounded border ${
                      item.stationing.includes('Nhánh')
                        ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {item.stationing}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">({item.lane})</span>
                </div>
              </div>

              {/* Defect Title & Time */}
              <div className="md:col-span-2 flex flex-col">
                <span className="text-xs font-medium text-brand-dark truncate">{item.defect_title}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{item.time_ago}</span>
              </div>

              {/* Severity */}
              <div className="md:col-span-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : item.severity === 'HIGH'
                      ? 'bg-amber-100 text-[#8F7212] border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {item.severity}
                </span>
              </div>

              {/* Status */}
              <div className="md:col-span-2 flex justify-end w-full md:w-auto">
                {item.status === 'PENDING' && (
                  <span className="bg-amber-100 text-[#8F7212] text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    <span>Chờ xác minh</span>
                  </span>
                )}
                {item.status === 'VERIFIED' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-emerald-200">
                    <Icon name="check_circle" size={13} className="text-emerald-600" />
                    <span>Đã xác minh</span>
                  </span>
                )}
                {item.status === 'NEED_SURVEY' && (
                  <span className="bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200">
                    <Icon name="schedule" size={13} className="text-blue-600" />
                    <span>Cần đo đạc</span>
                  </span>
                )}
                {item.status === 'MERGED' && (
                  <span className="bg-purple-100 text-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-purple-200">
                    <Icon name="call_merge" size={13} className="text-purple-600" />
                    <span>Đã gộp trùng</span>
                  </span>
                )}
                {item.status === 'REJECTED' && (
                  <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-slate-200">
                    <Icon name="close" size={13} className="text-slate-500" />
                    <span>Báo sai</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
