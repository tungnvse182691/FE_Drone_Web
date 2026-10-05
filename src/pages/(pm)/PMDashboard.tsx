import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockDefects, mockSurveys, mockRepairBatches } from '../../api/mock/data'
import { mockTriageCases } from '../../data/mockData'
import { PlaneTakeoff, Inbox, Boxes, AlertTriangle, ArrowRight, PlusCircle, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const PMDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [inboxTab, setInboxTab] = useState<'DRONE' | 'CITIZEN'>('DRONE')
  const citizenCases = mockTriageCases.filter((c) => c.source === 'CITIZEN')

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
            onClick={() => navigate('/pm/proposals')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Gom Đợt Sửa Chữa Mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/pm/surveys')}
          className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <PlaneTakeoff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">{mockSurveys.length}</div>
            <div className="text-xs font-medium text-slate-500">Đợt Khảo Sát Drone</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/pm/ai-inbox?source=drone')}
          className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-all"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">
              {mockDefects.filter((d) => d.status === 'OPEN').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Lỗi Drone AI Cần Thẩm Định</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/pm/ai-inbox?source=citizen')}
          className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4 cursor-pointer hover:border-purple-300 transition-all"
        >
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">{citizenCases.length}</div>
            <div className="text-xs font-medium text-slate-500">Phản Ánh Dân Cần Triage</div>
          </div>
        </div>

        <div
          onClick={() => navigate('/pm/proposals')}
          className="bg-white p-5 rounded-xl border border-brand-border shadow-xs flex items-center gap-4 cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-dark">{mockRepairBatches.length}</div>
            <div className="text-xs font-medium text-slate-500">Đợt Sửa Chữa Đang Chạy</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inbox AI & Dân cần xử lý + Đợt sửa chữa gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Hộp Thư Tiếp Nhận (Drone AI & Phản Ánh Dân) */}
        <Card
          title={
            <div className="flex items-center gap-3">
              <span className="font-bold text-base text-brand-dark">Hộp Thư Tiếp Nhận &amp; Thẩm Định</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setInboxTab('DRONE')
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    inboxTab === 'DRONE'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Drone AI ({mockDefects.length})
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setInboxTab('CITIZEN')
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    inboxTab === 'CITIZEN'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Người dân ({citizenCases.length})
                </button>
              </div>
            </div>
          }
          subtitle={
            inboxTab === 'DRONE'
              ? 'Các vị trí nứt lún được mô hình AI phát hiện cần xác minh bounding box'
              : 'Tiếp nhận phản ánh từ công dân qua ứng dụng Citizen để triage và liên kết báo trùng'
          }
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(inboxTab === 'DRONE' ? '/pm/ai-inbox?source=drone' : '/pm/ai-inbox?source=citizen')
              }
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Xem tất cả
            </Button>
          }
        >
          {inboxTab === 'DRONE' ? (
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
          ) : (
            <div className="divide-y divide-slate-100">
              {citizenCases.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.code}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                        <span className="font-mono">{item.code}</span>
                        <StatusBadge status={item.severity} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[280px]">
                        {item.reporter_name} • {item.stationing} • {item.defect_title}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/pm/ai-inbox?source=citizen')}
                  >
                    Xử Lý
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Box 2: Hồ sơ đợt sửa chữa đang xử lý */}
        <Card
          title="Hồ Sơ Đợt Sửa Chữa Đang Xử Lý"
          subtitle="Theo dõi trạng thái trình duyệt và tiến độ thi công"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pm/proposals')}
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
                  <span className="text-slate-500">Quy mô hư hỏng xử lý:</span>
                  <span className="font-bold text-slate-800 text-xs font-mono">
                    {batch.defects?.length || 4} vị trí hư hỏng • {batch.items?.length || 2} hạng mục
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/pm/proposals/${batch.id}`)}
                >
                  {batch.status === 'APPROVED'
                    ? 'Xem Hồ Sơ Đã Duyệt'
                    : batch.status === 'IN_PROGRESS'
                    ? 'Xem Hồ Sơ & Tiến Độ'
                    : batch.status === 'PENDING_APPROVAL'
                    ? 'Xem Hồ Sơ Chờ Duyệt'
                    : 'Xem Hồ Sơ Đợt Sửa Chữa'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
