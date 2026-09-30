import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockRepairBatches, mockProjects } from '../../api/mock/data'
import { FileCheck2, ShieldAlert, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const SupDashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Dashboard Điều Hành Giám Sát / Chủ Đầu Tư
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Màn 03: Giám sát toàn diện chất lượng mặt đường, phê duyệt đợt bảo hành và kiểm soát chỉ số PCI
          </p>
        </div>
        <Button
          onClick={() => navigate('/sup/approvals')}
          icon={<FileCheck2 className="w-4 h-4" />}
        >
          Hồ Sơ Chờ Phê Duyệt (1)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">01</div>
            <div className="text-xs font-medium text-slate-500">Đợt Sửa Chờ Duyệt</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">02</div>
            <div className="text-xs font-medium text-slate-500">Đang Chờ Nghiệm Thu</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">71.4</div>
            <div className="text-xs font-medium text-slate-500">Chỉ Số PCI Trung Bình</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-brand-error rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">03</div>
            <div className="text-xs font-medium text-slate-500">Điểm Đen Rủi Ro Cao</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Đợt sửa chờ duyệt + Phân bố tình trạng mặt đường */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Đợt Sửa Chữa Chờ Thẩm Duyệt (PENDING_APPROVAL)"
            subtitle="Chỉ Supervisor có quyền Duyệt (Approve) hoặc Trả hồ sơ (Revision Required)"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/sup/approvals')}>
                Xem tất cả
              </Button>
            }
          >
            <div className="divide-y divide-slate-100">
              {mockRepairBatches.map((batch) => (
                <div key={batch.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-brand-dark">{batch.code}</span>
                      <StatusBadge status={batch.status} />
                    </div>
                    <div className="text-xs font-medium text-slate-600">{batch.name}</div>
                    <div className="text-xs text-slate-500">
                      Người trình: {batch.created_by_name} • Dự toán: {batch.estimated_total_cost.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => navigate('/sup/approvals')}
                    >
                      Thẩm Duyệt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Chỉ Số Suy Thoái Mặt Đường (PCI)">
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">QL1A (Km25 - Km45):</span>
                  <span className="font-bold text-emerald-600">78.5 (Tốt)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78.5%' }} />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Cao tốc Bắc Nam XL-03:</span>
                  <span className="font-bold text-amber-600">64.2 (Trung bình)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '64.2%' }} />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/sup/risk-analytics')}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Xem Bản Đồ Nhiệt Rủi Ro (Màn 18)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
