import React from 'react'
import { Users, Phone, Building2 } from 'lucide-react'
import type { TriageCase } from './types'

export interface DrawerReporterInfoProps {
  selectedCase: TriageCase
  onOpenTriageProject: (c: TriageCase) => void
}

export const DrawerReporterInfo: React.FC<DrawerReporterInfoProps> = ({
  selectedCase,
  onOpenTriageProject,
}) => {
  if (!selectedCase.reporter_name && !selectedCase.description) {
    return null
  }

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#C9A227]" />
          <span>Thông Tin Người Phản Ánh</span>
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {selectedCase.reporter_channel || selectedCase.source_label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block">Họ và tên:</span>
          <span className="font-semibold text-slate-800">{selectedCase.reporter_name || 'Người dân'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">Số điện thoại liên hệ:</span>
          {selectedCase.reporter_phone ? (
            <a
              href={`tel:${selectedCase.reporter_phone}`}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1 font-mono"
            >
              <Phone className="w-3 h-3" />
              <span>{selectedCase.reporter_phone}</span>
            </a>
          ) : (
            <span className="text-slate-400 italic">Không cung cấp</span>
          )}
        </div>
      </div>

      {selectedCase.description && (
        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
            Nội dung phản ánh từ người dân:
          </span>
          <p className="italic text-slate-800 leading-relaxed">"{selectedCase.description}"</p>
        </div>
      )}

      {/* Triage Project Assignment Status (PA03) */}
      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400">Dự án bảo hành phụ trách (PA03):</span>
          <span className="font-semibold text-xs text-brand-dark">
            {selectedCase.project_id ? selectedCase.project_name : '⚠️ Chưa điều phối gán vào dự án'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onOpenTriageProject(selectedCase)}
          className="px-2.5 py-1 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{selectedCase.project_id ? 'Đổi dự án' : 'Điều phối dự án (PA03)'}</span>
        </button>
      </div>
    </div>
  )
}
