import React from 'react'
import { Card } from '../../components/ui/Card'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockFieldTasks } from '../../api/mock/data'
import { ClipboardList, Camera, CheckCircle2 } from 'lucide-react'

export const FieldTasks: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Màn 15: Theo Dõi Nhiệm Vụ Đo Đạc Hiện Trường
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi số liệu đo đạc thực tế (độ sâu lún, độ chênh lệch mép nứt) được đồng bộ từ app kỹ sư hiện trường
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4 font-semibold uppercase">Mã Nhiệm Vụ</th>
                <th className="py-3 px-4 font-semibold uppercase">Mã Hư Hỏng</th>
                <th className="py-3 px-4 font-semibold uppercase">Lý Trình</th>
                <th className="py-3 px-4 font-semibold uppercase">Loại Đo Đạc</th>
                <th className="py-3 px-4 font-semibold uppercase">Kết Quả Đo (Thực Tế)</th>
                <th className="py-3 px-4 font-semibold uppercase">Kỹ Sư Hiện Trường</th>
                <th className="py-3 px-4 font-semibold uppercase">Ảnh Thước Đo</th>
                <th className="py-3 px-4 font-semibold uppercase">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockFieldTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-brand-goldDark">{task.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-brand-dark">{task.defect_code}</td>
                  <td className="py-3.5 px-4 text-slate-600">Km{task.chainage_km}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{task.measurement_type}</td>
                  <td className="py-3.5 px-4 font-black text-rose-600 text-sm">
                    {task.measured_value} mm (vượt ngưỡng)
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{task.technician_name}</td>
                  <td className="py-3.5 px-4">
                    {task.evidence_photo_url && (
                      <img
                        src={task.evidence_photo_url}
                        alt="Ảnh thước đo"
                        className="w-12 h-12 rounded object-cover border border-slate-200"
                      />
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={task.status} label="Đã Nộp Số Liệu" />
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
