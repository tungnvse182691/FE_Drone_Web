import React from 'react'
import { Clock, Smartphone, Split, Eye } from 'lucide-react'
import { Card } from '../../../../components/ui/Card'
import { SyncConflictItem } from '../../../../types/domain'

export interface ConflictQueueTableProps {
  filteredConflicts: SyncConflictItem[]
  selectedConflict: SyncConflictItem
  setSelectedConflictId: (id: string) => void
}

export const ConflictQueueTable: React.FC<ConflictQueueTableProps> = ({
  filteredConflicts,
  selectedConflict,
  setSelectedConflictId
}) => {
  return (
    <Card className="overflow-hidden border border-brand-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50 text-slate-600">
              <th className="py-3 px-4 font-bold uppercase tracking-wider">Mã Xung Đột</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider">Khiếm Khuyết & Lý Trình</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider">Loại Xung Đột</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider">Đội Ngoại Tuyến</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider">Thời Gian Bắt Lại Mạng</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider">Mã Băm SHA-256</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Trạng Thái</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredConflicts.map((item) => {
              const isSelected = item.id === selectedConflict?.id
              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedConflictId(item.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#FBF6E9]/60 border-l-4 border-l-[#C9A227]' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#8C6D1F]">
                    <div className="flex items-center gap-1.5">
                      <span>{item.conflict_code}</span>
                      {item.severity === 'CRITICAL' && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.defect_type_label}</div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {item.defect_code} • {item.chainage}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.conflict_type === 'DEVICE_RESCUE_PENDING'
                          ? 'bg-purple-100 text-purple-800'
                          : item.conflict_type === 'ASSIGNMENT_REASSIGNED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.conflict_type === 'DEVICE_RESCUE_PENDING' && <Smartphone className="w-3 h-3" />}
                      {item.conflict_type === 'ASSIGNMENT_REASSIGNED' && <Split className="w-3 h-3" />}
                      {item.conflict_type_label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{item.offline_actor.name}</div>
                    <div className="text-[11px] text-slate-500">{item.offline_actor.team}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                      <span>{item.offline_actor.captured_at}</span>
                    </div>
                    <div className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-amber-200/70">
                      Mất sóng: {item.offline_actor.offline_duration}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.incoming_data.sha256_hash.substring(0, 10)}...
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'CONFLICT_INTAKE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : item.status === 'RESCUE_AUTHORIZED'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {item.status_label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedConflictId(item.id)
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#C9A227] text-white border-[#C9A227]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Xem đối chiếu Side-by-side"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
