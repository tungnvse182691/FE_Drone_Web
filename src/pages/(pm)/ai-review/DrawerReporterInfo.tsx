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
  const isCitizen = selectedCase.source === 'CITIZEN'

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
          <Icon name={isCitizen ? 'person' : 'engineering'} size={16} className="text-brand-gold" />
          <span>{isCitizen ? 'Thông Tin Người Dân Phản Ánh' : 'Thông Tin Tổ Tuần Tra Hiện Trường'}</span>
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {selectedCase.reporter_channel || 'Chưa cập nhật'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg bg-white border border-slate-100 p-3 text-xs"><div className="flex items-start gap-2"><Icon name="person" size={16} className="text-slate-400" /><div><p className="text-slate-500">Người gửi</p><p className="font-semibold mt-1">Xem từng phản ánh</p></div></div><div className="flex items-start gap-2"><Icon name="call" size={16} className="text-slate-400" /><div><p className="text-slate-500">Liên hệ</p><p className="font-semibold mt-1">Xem từng phản ánh</p></div></div></div>
      <p className="text-xs text-slate-500 leading-relaxed">Người gửi, SĐT và nội dung được hiển thị riêng theo từng Report trong phần chi tiết Report. Tên/SĐT là thông tin tài khoản hiện tại, không phải snapshot lúc gửi.</p>

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
        {isSupervisor && (
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
