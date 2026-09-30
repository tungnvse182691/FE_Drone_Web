import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockDefects } from '../../api/mock/data'
import { DefectStatus, Severity } from '../../types/enums'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, CheckSquare, Eye, AlertCircle } from 'lucide-react'

export const AIReviewInbox: React.FC = () => {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  const filteredDefects = mockDefects.filter((d) => {
    if (filterStatus === 'ALL') return true
    return d.status === filterStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Hộp Thư Tiếp Nhận Lỗi AI (AI Review Inbox)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Thẩm duyệt các vị trí hư hỏng mặt đường do mô hình học sâu (Deep Learning) phát hiện từ ảnh Drone
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/pm/repair-batches/create')}
            variant="outline"
          >
            Chuyển Sang Gom Đợt Sửa Chữa
          </Button>
        </div>
      </div>

      <Card>
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Trạng thái:</span>
            {['ALL', 'OPEN', 'VERIFIED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-brand-navy text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st === 'OPEN' ? 'Chưa thẩm định' : st === 'VERIFIED' ? 'Đã xác nhận' : 'Báo giả'}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredDefects.length} / {mockDefects.length} vị trí hư hỏng
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Hình Ảnh</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Mã Lỗi</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Loại Hư Hỏng</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Lý Trình Km</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Độ Tin Cậy AI</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Mức Độ</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Trạng Thái</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDefects.map((def) => (
                <tr key={def.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <img
                      src={def.image_url}
                      alt={def.code}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                    />
                  </td>
                  <td className="py-3 px-4 font-bold text-brand-goldDark">{def.code}</td>
                  <td className="py-3 px-4 font-semibold text-brand-dark">
                    {def.defect_type === 'POTHOLE'
                      ? 'Ổ gà cục bộ'
                      : def.defect_type === 'ALLIGATOR_CRACK'
                      ? 'Nứt rạn lưới / Mai rùa'
                      : 'Nứt dọc mặt đường'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">Km{def.chainage_km}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-gold h-full rounded-full"
                          style={{ width: `${def.confidence_score * 100}%` }}
                        />
                      </div>
                      {(def.confidence_score * 100).toFixed(0)}%
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={def.severity} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={def.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/pm/defects/${def.id}/verify`)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Thẩm Định
                    </Button>
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
