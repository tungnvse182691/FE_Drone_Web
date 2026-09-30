import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockDefects, mockSurveys, mockRepairBatches } from '../../api/mock/data'
import { PlaneTakeoff, Inbox, Boxes, AlertTriangle, ArrowRight, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PMDashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Tổng Quan Chỉ Huy Trưởng (PM)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ khảo sát Drone, thẩm định lỗi AI và điều hành đợt sửa chữa hạ tầng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/pm/surveys/create')}
            icon={<PlaneTakeoff className="w-4 h-4 text-brand-gold" />}
          >
            Lập Kế Hoạch Bay
          </Button>
          <Button
            onClick={() => navigate('/pm/repair-batches/create')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Gom Đợt Sửa Chữa Mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">{mockSurveys.length}</div>
            <div className="text-xs font-medium text-slate-500">Đợt Khảo Sát Drone</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">
              {mockDefects.filter((d) => d.status === 'OPEN').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Lỗi AI Cần Thẩm Định</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-brand-error rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">
              {mockDefects.filter((d) => d.severity === 'CRITICAL').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Hư Hỏng Khẩn Cấp</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">{mockRepairBatches.length}</div>
            <div className="text-xs font-medium text-slate-500">Đợt Sửa Chữa Đang Chạy</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inbox AI cần xử lý + Đợt sửa chữa gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Lỗi AI mới phát hiện */}
        <Card
          title="Hộp Thư Hư Hỏng AI Cần Thẩm Định"
          subtitle="Các vị trí nứt lún được mô hình AI phát hiện cần xác minh bounding box"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pm/ai-inbox')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Xem tất cả
            </Button>
          }
        >
          <div className="divide-y divide-slate-100">
            {mockDefects.map((defect) => (
              <div key={defect.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={defect.image_url}
                    alt={defect.code}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                      {defect.code}
                      <StatusBadge status={defect.severity} />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Lý trình: Km{defect.chainage_km} • Độ tin cậy AI: {(defect.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/pm/defects/${defect.id}/verify`)}
                >
                  Thẩm Định
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Box 2: Hồ sơ đợt sửa chữa đang xử lý */}
        <Card
          title="Hồ Sơ Đợt Sửa Chữa Đang Xử Lý"
          subtitle="Theo dõi trạng thái trình duyệt và tiến độ thi công"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pm/repair-batches/create')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Quản lý đợt
            </Button>
          }
        >
          <div className="space-y-4">
            {mockRepairBatches.map((batch) => (
              <div key={batch.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-brand-dark">{batch.code}</span>
                  <StatusBadge status={batch.status} />
                </div>
                <div className="text-xs text-slate-600 font-medium">{batch.name}</div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Tổng dự toán (Tự động tính):</span>
                  <span className="font-bold text-brand-goldDark text-sm">
                    {batch.estimated_total_cost.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/pm/repair-batches/${batch.id}/submit`)}
                >
                  Xem Hồ Sơ & Trình Duyệt
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
