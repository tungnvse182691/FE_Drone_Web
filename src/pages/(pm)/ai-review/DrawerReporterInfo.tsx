import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerReporterInfoProps {
  selectedCase: TriageCase
  onOpenTriageProject: (c: TriageCase) => void
  isSupervisor?: boolean
}

export const DrawerReporterInfo: React.FC<DrawerReporterInfoProps> = ({
  selectedCase,
  onOpenTriageProject,
  isSupervisor = false,
}) => {
  const verificationMethod = selectedCase.verification_method || 'Chưa chọn phương thức xác minh'

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
          <Icon name="description" size={16} className="text-brand-gold" />
          <span>Thông Tin Hồ Sơ</span>
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {selectedCase.source_label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">Mã hồ sơ:</span>
          <span className="font-semibold text-slate-800">{selectedCase.code}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Trạng thái hồ sơ:</span>
          <span className="font-semibold text-slate-800">{selectedCase.case_status || 'Chưa có trạng thái từ máy chủ'}</span>
        </div>
      </div>

      <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Phương thức xác minh của Case:</span>
        <p className="text-slate-800 leading-relaxed">{verificationMethod}</p>
      </div>

      {/* Triage Project Assignment Status (PA03) */}
      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400">Dự án bảo hành phụ trách:</span>
          <span className="font-semibold text-xs text-brand-dark">
            {selectedCase.project_id
              ? selectedCase.project_name
              : isSupervisor
              ? 'Chưa phân loại dự án (Cần điều phối)'
              : 'Chờ Giám sát điều phối gán vào dự án'}
          </span>
        </div>
        {isSupervisor && selectedCase.case_status === 'UNASSIGNED' && !selectedCase.project_id && (
          <button
            type="button"
            onClick={() => onOpenTriageProject(selectedCase)}
            className="px-2.5 py-1 rounded-lg bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            title="Điều phối gán phản ánh vào dự án"
          >
            <Icon name="arrow_forward" size={13} />
            <span>Điều phối</span>
          </button>
        )}
      </div>
    </div>
  )
}
