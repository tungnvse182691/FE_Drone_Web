import React from 'react'
import { Users2, ShieldCheck, Tablet } from 'lucide-react'
import { ProjectMember } from './types'

interface ProjectPersonnelCardProps {
  members: ProjectMember[]
}

export const ProjectPersonnelCard: React.FC<ProjectPersonnelCardProps> = ({ members }) => {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <Users2 className="w-5 h-5 text-brand-gold" />
            <span>Cơ cấu nhân sự thực hiện</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Phân cấp thẩm quyền &amp; phụ trách
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {members.length} thành viên
        </span>
      </div>

      {/* Personnel List */}
      <div className="flex flex-col gap-3">
        {members.map((mem) => (
          <div
            key={mem.id}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-gold/50 transition-colors flex flex-col gap-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={mem.avatar}
                    alt={mem.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  {mem.is_online && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                      title="Đang online"
                    ></span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-brand-dark">{mem.name}</span>
                  <span className="text-[11px] text-slate-500">{mem.role_title}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 uppercase">
                {mem.role_badge}
              </span>
            </div>

            <div className="text-[11px] bg-white border border-slate-200 p-2 rounded-lg flex flex-col gap-1 text-slate-600">
              <div className="flex items-center gap-1.5 text-brand-dark font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>{mem.authority}</span>
              </div>
              {mem.equipment && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Tablet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{mem.equipment}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-100 mt-1">
                <span className="truncate">{mem.contact}</span>
                <span className="truncate max-w-[120px] text-right font-medium text-slate-500">{mem.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Card Action */}
      <div className="pt-2 flex flex-col gap-2">
        <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-tight px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Mọi thay đổi nhân sự dự án đều được ghi nhận vào Audit Log bất biến theo quy chuẩn kỹ thuật TCVN 11944.
          </span>
        </div>
      </div>
    </div>
  )
}
