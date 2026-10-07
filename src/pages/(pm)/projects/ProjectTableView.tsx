import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HubProject } from './types'

interface ProjectTableViewProps {
  filteredProjects: HubProject[]
  totalProjectsCount: number
  onNavigateDetail: (projectId: string) => void
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  filteredProjects,
  totalProjectsCount,
  onNavigateDetail
}) => {
  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã Dự Án</th>
                <th className="py-3.5 px-4">Tên Tuyến Đường</th>
                <th className="py-3.5 px-4">Khu Vực &amp; Lý Trình</th>
                <th className="py-3.5 px-4">PM Phụ Trách</th>
                <th className="py-3.5 px-4 text-center">Tiến Độ Bảo Hành</th>
                <th className="py-3.5 px-4 text-center">Lỗi Mở</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((prj) => (
                <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-goldMuted">{prj.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{prj.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{prj.region} ({prj.location_detail})</div>
                    <div className="font-mono text-[11px] text-slate-400">{prj.stationing_text}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {prj.is_assigned ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{prj.pm_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {prj.pm_role_badge}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-semibold italic">Chưa phân công</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="font-mono font-semibold text-slate-800">{prj.warranty_passed_percent}%</div>
                    <div className="text-[10px] text-slate-600 font-mono font-bold">{prj.inspection_standard || 'TCVN 8819:2011'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                        prj.open_defects > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {prj.open_defects}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        prj.status === 'NEAR_EXPIRY'
                          ? 'bg-rose-100 text-rose-700'
                          : prj.status === 'PENDING_ALIGNMENT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {prj.status_label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigateDetail(prj.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-gold hover:text-white text-slate-700 font-semibold transition cursor-pointer text-xs"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION & FOOTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <span>
            Hiển thị <strong className="text-slate-900 font-mono">1 - {filteredProjects.length}</strong> trong tổng số{' '}
            <strong className="text-slate-900 font-mono">{totalProjectsCount}</strong> dự án đường bộ
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span>Đồng bộ vệ tinh GIS: 4 phút trước</span>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
          <button
            type="button"
            disabled
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded bg-brand-gold text-white font-bold text-xs"
          >
            1
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded text-slate-600 hover:bg-slate-100 font-semibold text-xs"
          >
            2
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}
