import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface DispatchFiltersProps {
  routeFilter: string
  handleRouteChange: (routeId: string) => void
  crewFilter: string
  setCrewFilter: (crew: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
}

export const DispatchFilters: React.FC<DispatchFiltersProps> = ({
  routeFilter,
  handleRouteChange,
  crewFilter,
  setCrewFilter,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 p-4 bg-white rounded-[20px] border border-[#E2E5E9] shadow-2xs">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Tuyến đường &amp; Phân đoạn</label>
        <select
          value={routeFilter}
          onChange={(e) => handleRouteChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 hover:bg-white rounded-xl text-xs font-bold text-slate-800 border border-[#E2E5E9] focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer transition-colors"
        >
          <option value="QL1A_PK04">QL1A - Giai đoạn 2 (Km 1025 - Km 1045)</option>
          <option value="QL1A_PK01">QL1A - Giai đoạn 1 (Km 1000 - Km 1025)</option>
          <option value="EXPRESSWAY_LINK">Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)</option>
          <option value="PHANTHIET_DAUGIAY">Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Đội hiện trường phân bổ</label>
        <select
          value={crewFilter}
          onChange={(e) => setCrewFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 hover:bg-white rounded-xl text-xs font-medium text-slate-700 border border-[#E2E5E9] focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer transition-colors"
        >
          <option value="ALL">Tất cả các tổ đội</option>
          <option value="Tổ tuần tra số 01">Tổ tuần tra số 01 - Kỹ sư Kiên</option>
          <option value="Tổ đo đạc số 02">Tổ đo đạc số 02 - Kỹ sư Minh</option>
          <option value="Tổ cơ động">Tổ cơ động bảo dưỡng đường bộ 03</option>
          <option value="Chưa chỉ định">Chưa chỉ định phân công</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Trạng thái xử lý nhanh</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 hover:bg-white rounded-xl text-xs font-medium text-slate-700 border border-[#E2E5E9] focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer transition-colors"
        >
          <option value="ALL">Tất cả trạng thái tiêu chuẩn</option>
          <option value="ELIGIBLE">Chỉ hiển thị Đạt chuẩn (≤ 0.5 m²)</option>
          <option value="VIOLATION">Chỉ hiển thị Vi phạm ngưỡng (&gt; 0.5 m²)</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={() => {
            setCrewFilter('ALL')
            setStatusFilter('ALL')
          }}
          type="button"
          className="w-full py-2 px-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-[#E2E5E9] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <Icon name="refresh" size={14} className="text-slate-500" />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>
    </div>
  )
}
