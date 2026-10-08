import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface TriageProjectModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  mockProjects: { id: string; code: string; name: string; start_km: number; end_km: number }[]
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  onConfirmTriageProject: () => void
}

export const TriageProjectModal: React.FC<TriageProjectModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  mockProjects,
  selectedProjectId,
  setSelectedProjectId,
  onConfirmTriageProject,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-brand-gold border border-amber-200">
              <Icon name="domain" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Điều Phối Phản Ánh Vào Dự Án (PA03)</h3>
              <p className="text-xs text-slate-500">Chỉ định tuyến đường bảo hành chịu trách nhiệm sửa chữa</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-brand-dark block">Hồ sơ phản ánh tiếp nhận:</span>
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-mono font-bold text-[#8F7212]">{targetTriageCase.code}</span>
              <span>
                {targetTriageCase.stationing} ({targetTriageCase.lane})
              </span>
            </div>
            <p className="text-slate-500 text-[11px] truncate">{targetTriageCase.defect_title}</p>
            <span className="text-[10px] text-slate-400 block">
              Người báo: {targetTriageCase.reporter_name || targetTriageCase.source_label} (
              {targetTriageCase.reporter_phone || 'Không có SĐT'})
            </span>
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">
              Chọn tuyến đường / Dự án bảo hành phụ trách: <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold cursor-pointer"
            >
              {mockProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} (Km {p.start_km} &rarr; Km {p.end_km})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
            <Icon name="check_circle" size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              Sau khi điều phối, hồ sơ sẽ được gán vào phạm vi quản lý của dự án, sẵn sàng để PM thẩm định chi
              tiết và lập gói sửa chữa hoặc giao nhiệm vụ khảo sát đo đạc hiện trường.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmTriageProject}
            className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-[#B38E1F] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Icon name="domain" size={16} />
            <span>Xác Nhận Điều Phối Dự Án</span>
          </button>
        </div>
      </div>
    </div>
  )
}
