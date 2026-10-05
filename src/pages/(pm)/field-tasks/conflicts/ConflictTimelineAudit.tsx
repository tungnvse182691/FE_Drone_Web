import React from 'react'
import { Clock } from 'lucide-react'
import { Card } from '../../../../components/ui/Card'
import { SyncConflictItem } from '../../../../types/domain'

export interface ConflictTimelineAuditProps {
  selectedConflict: SyncConflictItem
}

export const ConflictTimelineAudit: React.FC<ConflictTimelineAuditProps> = ({
  selectedConflict
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]"></span>
          <h2 className="text-lg font-bold font-sansation text-brand-dark">
            Bảng Đối Chiếu Hiện Trạng: {selectedConflict.conflict_code} — {selectedConflict.chainage}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1A1D20] text-[#F1E5C6] font-mono text-[11px] font-bold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
            <span>Ngoại tuyến sync: {selectedConflict.offline_actor.captured_at}</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Mã nhiệm vụ: <strong className="text-slate-800">{selectedConflict.task_code}</strong> | Tuyến:{' '}
            <strong className="text-slate-800">{selectedConflict.route_name}</strong>
          </span>
        </div>
      </div>

      {/* DÒNG THỜI GIAN DIỄN BIẾN SỰ KIỆN XUNG ĐỘT (AUDIT TIMELINE LOG - Q04/D05) */}
      {selectedConflict.timeline && selectedConflict.timeline.length > 0 && (
        <Card className="p-4 bg-white border border-[#E2E5E9] shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A227]" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 font-sansation">
                Dòng Thời Gian Diễn Biến Xung Đột ({selectedConflict.conflict_code})
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Nguyên tắc xử lý: <strong className="text-slate-800">Q04 / D05 Không Tự Ý Ghi Đè (No Silent Overwrite)</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {selectedConflict.timeline.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all shadow-2xs relative ${
                  step.type === 'alert'
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : step.type === 'warning'
                    ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                    : step.type === 'success'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                    : 'bg-blue-50/80 border-blue-300 text-blue-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-white border border-current shadow-2xs flex items-center gap-1 text-slate-900">
                      <Clock className="w-3 h-3 text-[#C9A227] shrink-0" />
                      {step.time}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-2xs ${
                        step.type === 'alert'
                          ? 'bg-rose-200 text-rose-900 border border-rose-300'
                          : step.type === 'warning'
                          ? 'bg-amber-200 text-amber-900 border border-amber-300'
                          : step.type === 'success'
                          ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-blue-200 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <div className="font-bold font-sansation text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-mono flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step.event}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{step.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
