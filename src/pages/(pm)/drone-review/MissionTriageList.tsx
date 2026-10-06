import React from 'react'
import {
  Wand2,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Check,
  ChevronDown
} from 'lucide-react'
import { AIDetectionItem } from './types'

export interface MissionTriageListProps {
  detections: AIDetectionItem[]
  selectedDetectionId: string
  onSelectDetection: (item: AIDetectionItem) => void
  onApproveDetection: (id: string) => void
  onRejectDetection: (id: string) => void
  kmFilter: 'ALL' | 'KM_1024_1026' | 'KM_1026_1028' | 'KM_1028_1030'
  setKmFilter: (f: 'ALL' | 'KM_1024_1026' | 'KM_1026_1028' | 'KM_1028_1030') => void
  totalCount: number
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  reviewedCount: number
  reviewProgressPercent: number
  showToast: (msg: string) => void
}

export const MissionTriageList: React.FC<MissionTriageListProps> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
  onApproveDetection,
  onRejectDetection,
  kmFilter,
  setKmFilter,
  totalCount,
  approvedCount,
  rejectedCount,
  pendingCount,
  reviewedCount,
  reviewProgressPercent,
  showToast
}) => {
  const filteredDetections = detections.filter((d) => {
    if (kmFilter === 'ALL') return true
    if (kmFilter === 'KM_1024_1026') return d.kmValue >= 1024 && d.kmValue < 1026
    if (kmFilter === 'KM_1026_1028') return d.kmValue >= 1026 && d.kmValue < 1028
    if (kmFilter === 'KM_1028_1030') return d.kmValue >= 1028 && d.kmValue <= 1030
    return true
  })

  return (
        <section className="lg:col-span-5 bg-white border border-brand-border rounded-xl shadow-2xs p-4 flex flex-col gap-3">
          {/* Header & Filter Chips */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-brand-gold" />
                <h3 className="font-bold text-sm text-brand-dark">Danh sÃ¡ch phÃ¡t hiá»‡n AI</h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {totalCount} má»¥c / Km 1024 - 1030
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setKmFilter('ALL')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'ALL'
                    ? 'bg-brand-gold text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Táº¥t cáº£ ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setKmFilter('KM_1024_1026')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'KM_1024_1026'
                    ? 'bg-brand-gold text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Km 1024 - 1026 (3)
              </button>
              <button
                type="button"
                onClick={() => setKmFilter('KM_1026_1028')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'KM_1026_1028'
                    ? 'bg-brand-gold text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Km 1026 - 1028 (3)
              </button>
              <button
                type="button"
                onClick={() => setKmFilter('KM_1028_1030')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'KM_1028_1030'
                    ? 'bg-brand-gold text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Km 1028 - 1030 (2)
              </button>
            </div>
          </div>

          {/* Detections Card Stack */}
          <div className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredDetections.map((item) => {
              const isSelected = item.id === selectedDetectionId
              const isApproved = item.status === 'APPROVED'
              const isRejected = item.status === 'REJECTED'

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectDetection(item)}
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-2 relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/40 border-brand-gold ring-1 ring-brand-gold shadow-xs'
                      : isApproved
                      ? 'bg-emerald-50/30 border-emerald-200 opacity-90'
                      : isRejected
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Left accent color bar */}
                  <div
                    style={{
                      backgroundColor: isApproved
                        ? '#10B981'
                        : isRejected
                        ? '#94A3B8'
                        : item.confidence >= 90
                        ? '#EF4444'
                        : '#F97316'
                    }}
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                  ></div>

                  <div className="flex items-start justify-between gap-2 pl-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{item.code}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
                        {item.stationing}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.lane}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-slate-200 text-slate-600'
                          : item.confidence >= 90
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isApproved
                        ? `ÄÃƒ DUYá»†T â†’ ${item.defectCode}`
                        : isRejected
                        ? 'Bá»Ž QUA - FALSE POSITIVE'
                        : `${item.type} â€¢ ${item.confidence}%`}
                    </span>
                  </div>

                  <p
                    className={`text-xs pl-1 font-medium ${
                      isRejected ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.description}
                  </p>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 text-xs pl-1 text-slate-500">
                    {item.metrics.area && (
                      <div>
                        Diá»‡n tÃ­ch: <strong className="font-mono text-slate-800">{item.metrics.area}</strong>
                      </div>
                    )}
                    {item.metrics.depth && (
                      <div>
                        Äá»™ sÃ¢u: <strong className="font-mono text-red-600">{item.metrics.depth}</strong>
                      </div>
                    )}
                    {item.metrics.length && (
                      <div>
                        Chiá»u dÃ i: <strong className="font-mono text-slate-800">{item.metrics.length}</strong>
                      </div>
                    )}
                    {item.metrics.crackWidth && (
                      <div>
                        Äá»™ há»Ÿ: <strong className="font-mono text-amber-600">{item.metrics.crackWidth}</strong>
                      </div>
                    )}
                    {item.metrics.reviewer && (
                      <div className="col-span-2 text-[11px] text-emerald-700">
                        NgÆ°á»i duyá»‡t: <strong>{item.metrics.reviewer}</strong>
                      </div>
                    )}
                    {item.metrics.dismissReason && (
                      <div className="col-span-2 text-[11px] text-slate-500 italic">
                        LÃ½ do: {item.metrics.dismissReason}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons (Chá»‰ hiá»‡n khi chÆ°a duyá»‡t hoáº·c rejected) */}
                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1 pl-1 border-t border-slate-100 mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onApproveDetection(item.id)
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PhÃª duyá»‡t táº¡o Defect OPEN</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRejectDetection(item.id)
                        }}
                        className="py-1.5 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>BÃ¡o sai</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Triage Audit Summary Footer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>
                ÄÃ£ rÃ  soÃ¡t: <strong className="text-[#8F7212] font-mono">{reviewedCount}/{totalCount} má»¥c</strong>
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-700">Há»£p lá»‡: {approvedCount}</span>
                <span className="text-slate-300">â€¢</span>
                <span className="text-red-600">BÃ¡o sai: {rejectedCount}</span>
                <span className="text-slate-300">â€¢</span>
                <span className="text-sky-700">Chá» duyá»‡t: {pendingCount}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-gold h-full rounded-full transition-all duration-300"
                style={{ width: `${reviewProgressPercent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 italic leading-snug">
              * Chá»‰ sau khi giáº£i quyáº¿t 100% má»¥c chá» duyá»‡t vÃ  bay bÃ¹ Ä‘á»™ phá»§ â‰¥ 95%, há»‡ thá»‘ng má»›i kÃ­ch hoáº¡t nÃºt KhÃ³a Baseline.
            </p>
          </div>
        </section>
  )
}
