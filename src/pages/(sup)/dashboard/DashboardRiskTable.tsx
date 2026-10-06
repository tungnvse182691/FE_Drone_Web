import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from 'lucide-react'
import { RiskPortfolioItem } from './types'

export interface DashboardRiskTableProps {
  filteredRiskItems: RiskPortfolioItem[]
  sortField: 'risk_level' | 'project_name' | 'chainage' | 'open_defects_count' | 'sla_status'
  sortAsc: boolean
  onToggleSort: (field: 'risk_level' | 'project_name' | 'chainage' | 'open_defects_count' | 'sla_status') => void
  onFocusPin: (item: RiskPortfolioItem) => void
}

export const DashboardRiskTable: React.FC<DashboardRiskTableProps> = ({
  filteredRiskItems,
  sortField,
  sortAsc,
  onToggleSort,
  onFocusPin
}) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl p-5 shadow-2xs border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="font-sansation font-bold text-slate-900 text-sm">
            Danh sách đoạn tuyến rủi ro cao (RPT-06 High Risk)
          </h3>
        </div>
        <button
          onClick={() => navigate('/sup/projects')}
          type="button"
          className="text-xs font-semibold hover:underline text-[#C9A227] cursor-pointer"
        >
          Xem tất cả dự án &gt;
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
              <th
                className="pb-3 font-semibold cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onToggleSort('risk_level')}
                title="Sắp xếp theo mức rủi ro"
              >
                <div className="flex items-center gap-1">
                  <span>Mức rủi ro</span>
                  {sortField === 'risk_level' ? (
                    sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>
              <th
                className="pb-3 font-semibold cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onToggleSort('project_name')}
                title="Sắp xếp theo tên dự án"
              >
                <div className="flex items-center gap-1">
                  <span>Dự án</span>
                  {sortField === 'project_name' ? (
                    sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>
              <th className="pb-3 font-semibold">Kỹ sư PM</th>
              <th
                className="pb-3 font-semibold cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onToggleSort('chainage')}
                title="Sắp xếp theo lý trình"
              >
                <div className="flex items-center gap-1">
                  <span>Đoạn đường</span>
                  {sortField === 'chainage' ? (
                    sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>
              <th
                className="pb-3 font-semibold text-center cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onToggleSort('open_defects_count')}
                title="Sắp xếp theo số lỗi hở"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Lỗi mở</span>
                  {sortField === 'open_defects_count' ? (
                    sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>
              <th className="pb-3 font-semibold">Khối lượng hư hỏng</th>
              <th
                className="pb-3 font-semibold text-right cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onToggleSort('sla_status')}
                title="Sắp xếp theo thời hạn SLA"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Thời hạn SLA</span>
                  {sortField === 'sla_status' ? (
                    sortAsc ? <ArrowUp className="w-3 h-3 text-[#C9A227]" /> : <ArrowDown className="w-3 h-3 text-[#C9A227]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>
              <th className="pb-3 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredRiskItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400">
                  Không có đoạn đường nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredRiskItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onFocusPin(item)}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <td className="py-3.5">
                    {item.risk_level === 'Critical' ? (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold text-rose-700 bg-red-100 rounded-full inline-block border border-red-200">
                        Critical
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 bg-sky-100 rounded-full inline-block border border-sky-200">
                        Watch
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 font-bold text-slate-900 group-hover:text-[#C9A227] transition-colors">
                    {item.project_name}
                    <span className="block text-[10px] text-slate-400 font-mono font-normal">{item.proposal_id}</span>
                  </td>
                  <td className="py-3.5 text-slate-700">
                    <span className="font-semibold block">{item.pm_name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{item.pm_email}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 font-mono text-[11px]">
                    {item.chainage_display}
                  </td>
                  <td className="py-3.5 text-center font-bold text-rose-600">
                    {item.open_defects_count}
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800">
                    {item.defect_scope_display}
                  </td>
                  <td className="py-3.5 text-right">
                    {item.sla_status === 'urgent' ? (
                      <span className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-red-50 rounded-full inline-block border border-rose-200">
                        {item.sla_remaining}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-full inline-block bg-amber-50 text-amber-800 border border-amber-200">
                        {item.sla_remaining}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/sup/proposals/PKG-2026-08')
                      }}
                      type="button"
                      className="px-2.5 py-1 text-[11px] font-bold text-[#92700C] bg-[#FEF9E7] hover:bg-[#FDF0CD] border border-[#FDE68A] rounded-lg transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                      title="Chuyển đến thẩm duyệt đợt sửa chữa"
                    >
                      <span>Duyệt WF-07</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
