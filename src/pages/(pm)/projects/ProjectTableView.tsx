import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from './types'

interface ProjectTableViewProps {
  filteredProjects: HubProject[]
  totalProjectsCount: number
  isSupervisor?: boolean
  onNavigateDetail: (projectId: string) => void
  onOpenCloseModal?: (prj: HubProject) => void
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  filteredProjects,
  totalProjectsCount,
  isSupervisor,
  onNavigateDetail,
  onOpenCloseModal
}) => {
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden font-body">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Mã Dự Án</th>
                <th className="py-3 px-4">Tên Tuyến Đường</th>
                <th className="py-3 px-4">Khu Vực &amp; Lý Trình</th>
                <th className="py-3 px-4">PM Phụ Trách</th>
                <th className="py-3 px-4 text-center">Tiến Độ Bảo Hành</th>
                <th className="py-3 px-4 text-center">Lỗi Mở</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((prj) => (
                <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4  font-bold text-brand-goldMuted">{prj.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{prj.name}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div className="flex items-center gap-1 font-medium">
                      <Icon name="location_on" size={14} className="text-brand-gold shrink-0" />
                      <span className={prj.region || prj.location_detail ? 'font-bold text-slate-900' : 'text-slate-400 italic'}>
                        Chưa cập nhật
                      </span>
                    </div>
                    <div className=" text-[11px] text-slate-400 mt-0.5">Chưa cập nhật</div>
                  </td>
                  <td className="py-3 px-4">
                    {prj.pm_user_id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{prj.pm_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 ">
                          {prj.pm_role_badge}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-semibold italic">Chưa cập nhật</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-slate-500">Chưa cập nhật</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className="font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                    >
                      Chưa cập nhật
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        prj.status === 'CLOSED'
                          ? 'bg-slate-200 text-slate-800'
                          : prj.status === 'NEAR_EXPIRY'
                          ? 'bg-rose-100 text-rose-700'
                          : prj.status === 'PENDING_ALIGNMENT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {prj.status_label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {prj.status === 'CLOSED' ? (
                        <button
                          type="button"
                          onClick={() => onNavigateDetail(prj.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white font-semibold transition cursor-pointer text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <Icon name="inventory_2" size={14} />
                          <span>Tra cứu (BC10)</span>
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onNavigateDetail(prj.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1E] text-white font-semibold transition cursor-pointer text-xs"
                          >
                            Vào quản lý dự án
                          </button>
                          {isSupervisor && onOpenCloseModal && (
                            <button
                              type="button"
                              title="Đóng vận hành dự án"
                              onClick={() => onOpenCloseModal(prj)}
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold transition border border-slate-200 hover:border-rose-200 cursor-pointer"
                            >
                              <Icon name="lock" size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION & FOOTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 text-slate-500 text-xs font-body">
        <div className="flex items-center gap-2">
          <span>
            Hiển thị <strong className="text-slate-900 ">1 - {filteredProjects.length}</strong> trong tổng số{' '}
            <strong className="text-slate-900 ">{totalProjectsCount}</strong> dự án bảo hành
          </span>
        </div>


      </div>
    </>
  )
}
