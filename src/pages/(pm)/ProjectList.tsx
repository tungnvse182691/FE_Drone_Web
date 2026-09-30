import React from 'react'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockProjects } from '../../api/mock/data'
import { FolderKanban, Search, Calendar, MapPin } from 'lucide-react'

export const ProjectList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Danh Mục Dự Án Bảo Hành</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các hợp đồng, tuyến đường và phạm vi lý trình đang được bảo hành & bảo trì
          </p>
        </div>
      </div>

      {/* Projects Table */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án theo mã hoặc tên..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tổng cộng: {mockProjects.length} dự án đang theo dõi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Mã Dự Án</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Tên Tuyến Đường / Gói Thầu</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Lý Trình</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Thời Hạn Bảo Hành</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Chỉ Số PCI</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Tổng Lỗi</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockProjects.map((prj) => (
                <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-brand-goldDark">{prj.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-brand-dark">{prj.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Km{prj.start_km} - Km{prj.end_km}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {prj.warranty_start} đến {prj.warranty_end}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${prj.pci_score > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {prj.pci_score} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-brand-dark">{prj.total_defects} vị trí</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={prj.status} label={prj.status === 'ACTIVE' ? 'Đang hiệu lực' : prj.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
