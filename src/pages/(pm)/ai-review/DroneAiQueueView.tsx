import React from 'react'
import {
  Plane,
  Smartphone,
  Car,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Merge,
  X
} from 'lucide-react'
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
        <span className="col-span-2">MÃ£ Case</span>
        <span className="col-span-2">Nguá»“n Dá»¯ Liá»‡u</span>
        <span className="col-span-3">Vá»‹ TrÃ­ &amp; LÃ½ TrÃ¬nh</span>
        <span className="col-span-2">Loáº¡i HÆ° Háº¡i</span>
        <span className="col-span-1">Æ¯u TiÃªn</span>
        <span className="col-span-2 text-right">Tráº¡ng ThÃ¡i</span>
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
                  {item.source === 'DRONE_AI' && <Plane className="w-3 h-3 text-slate-500" />}
                  {item.source === 'CITIZEN' && <Smartphone className="w-3 h-3 text-blue-600" />}
                  {item.source === 'PATROL' && <Car className="w-3 h-3 text-brand-gold" />}
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
                      title={`CÃ³ ${item.cluster_duplicates.length} pháº£n Ã¡nh trÃ¹ng lÃ¢n cáº­n`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
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
                    <span>Chá» xÃ¡c minh</span>
                  </span>
                )}
                {item.status === 'VERIFIED' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>ÄÃ£ xÃ¡c minh</span>
                  </span>
                )}
                {item.status === 'NEED_SURVEY' && (
                  <span className="bg-blue-100 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-blue-200">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>Cáº§n Ä‘o Ä‘áº¡c</span>
                  </span>
                )}
                {item.status === 'MERGED' && (
                  <span className="bg-purple-100 text-purple-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-purple-200">
                    <Merge className="w-3 h-3 text-purple-600" />
                    <span>ÄÃ£ gá»™p trÃ¹ng</span>
                  </span>
                )}
                {item.status === 'REJECTED' && (
                  <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-slate-200">
                    <X className="w-3 h-3 text-slate-500" />
                    <span>BÃ¡o sai</span>
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
