import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Icon } from '../../components/ui/Icon'
import { dashboardService, PMDashboardData } from '../../api/services/dashboardService'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export const PMDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [inboxTab, setInboxTab] = useState<'DRONE' | 'CITIZEN'>('DRONE')

  // Sử dụng TanStack Query gọi qua Mock API Service bất đồng bộ
  const { data, isLoading, isError, refetch } = useQuery<PMDashboardData>({
    queryKey: ['pm-dashboard'],
    queryFn: () => dashboardService.getPMDashboard(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-brand-border p-4"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white rounded-xl border border-brand-border"></div>
          <div className="h-96 bg-white rounded-xl border border-brand-border"></div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-brand-border text-center space-y-4">
        <Icon name="error" className="text-red-500 text-4xl" size={40} />
        <h2 className="text-lg font-bold text-brand-dark">Không thể tải dữ liệu Dashboard</h2>
        <p className="text-sm text-slate-500">Đã xảy ra lỗi khi kết nối tới máy chủ. Vui lòng thử lại.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Tải lại dữ liệu
        </Button>
      </div>
    )
  }

  const { stats, defects, citizenCases, repairBatches } = data

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Tổng Quan Chỉ Huy Trưởng (PM)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Điều hành khảo sát bay chụp, thẩm định hư hỏng do trí tuệ nhân tạo phát hiện và điều phối đợt sửa chữa theo tiêu chuẩn kỹ thuật
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/pm/surveys/create')}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            icon={<Icon name="flight_takeoff" className="text-slate-600" size={18} />}
          >
            Lập Kế Hoạch Bay
          </Button>
          {/* Nút CTA chính duy nhất với màu vàng đồng thương hiệu */}
          <Button
            variant="primary"
            onClick={() => navigate('/pm/proposals')}
            icon={<Icon name="add_circle" className="text-white" size={18} />}
          >
            Gom Đợt Sửa Chữa Mới
          </Button>
        </div>
      </div>

      {/* KPI Cards (Minimalism, 4 thẻ, số lớn Sansation/Roboto, icon Material thanh lịch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => navigate('/pm/surveys')}
          className="bg-white p-5 rounded-xl border border-brand-border hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đợt Bay Khảo Sát</span>
            <div className="text-2xl font-bold text-brand-dark">{stats.surveysCount}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Icon name="check_circle" className="text-emerald-600" size={13} />
              Đã số hóa bản đồ trực ảnh
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
            <Icon name="flight_takeoff" size={22} />
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => navigate('/pm/ai-inbox?source=drone')}
          className="bg-white p-5 rounded-xl border border-brand-border hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lỗi AI Cần Thẩm Định</span>
            <div className="text-2xl font-bold text-brand-dark">{stats.pendingAIDefectsCount}</div>
            <div className="text-[11px] text-amber-600 flex items-center gap-1">
              <Icon name="pending" size={13} />
              Cần xác minh khung nhận diện
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <Icon name="inbox" size={22} />
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => navigate('/pm/ai-inbox?source=citizen')}
          className="bg-white p-5 rounded-xl border border-brand-border hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phản Ánh Dân Cần Phân Loại</span>
            <div className="text-2xl font-bold text-brand-dark">{stats.citizenCasesCount}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Icon name="sync" className="text-sky-600" size={13} />
              Sẵn sàng rà soát trùng lặp
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
            <Icon name="groups" size={22} />
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => navigate('/pm/proposals')}
          className="bg-white p-5 rounded-xl border border-brand-border hover:border-slate-400 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đợt Sửa Chữa Đang Chạy</span>
            <div className="text-2xl font-bold text-brand-dark">{stats.runningBatchesCount}</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1">
              <Icon name="build" size={13} />
              Theo dõi tiến độ hồ sơ
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
            <Icon name="inventory_2" size={22} />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Hộp Thư Tiếp Nhận & Danh Sách Đợt Sửa Chữa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Hộp thư tiếp nhận & Thẩm định */}
        <Card
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Icon name="inbox" className="text-slate-600" size={20} />
                <span className="font-semibold text-base text-brand-dark">Hộp Thư Tiếp Nhận &amp; Thẩm Định</span>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setInboxTab('DRONE')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    inboxTab === 'DRONE'
                      ? 'bg-white text-brand-dark shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  AI Phát hiện ({defects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInboxTab('CITIZEN')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    inboxTab === 'CITIZEN'
                      ? 'bg-white text-brand-dark shadow-2xs font-semibold'
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
              ? 'Các vị trí nứt lún được mô hình AI phát hiện cần xác minh khung nhận diện'
              : 'Tiếp nhận phản ánh từ công dân qua ứng dụng dịch vụ đường bộ để phân loại và xử lý trùng lặp'
          }
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigate(inboxTab === 'DRONE' ? '/pm/ai-inbox?source=drone' : '/pm/ai-inbox?source=citizen')
              }
              className="text-slate-600 hover:text-brand-dark text-xs"
              icon={<Icon name="arrow_forward" size={16} />}
            >
              Xem tất cả
            </Button>
          }
        >
          {inboxTab === 'DRONE' ? (
            <div className="divide-y divide-slate-100">
              {defects.slice(0, 5).map((defect) => (
                <div key={defect.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={defect.image_url}
                      alt={defect.code}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                        <span className="font-mono text-xs">{defect.code}</span>
                        <StatusBadge status={defect.severity} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        Lý trình: Km{defect.chainage_km} • Độ tin cậy AI: {(defect.confidence_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-xs border-slate-200 hover:border-slate-400"
                    onClick={() => navigate(`/pm/defects/${defect.id}/verify-a`)}
                    icon={<Icon name="visibility" size={15} />}
                  >
                    Thẩm Định
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {citizenCases.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image_url}
                      alt={item.code}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                        <span className="font-mono text-xs">{item.code}</span>
                        <StatusBadge status={item.severity} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {item.reporter_name} • {item.stationing} • {item.defect_title}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-xs border-slate-200 hover:border-slate-400"
                    onClick={() => navigate('/pm/ai-inbox?source=citizen')}
                    icon={<Icon name="checklist" size={15} />}
                  >
                    Xử Lý
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Panel 2: Đợt Sửa Chữa Đang Xử Lý */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Icon name="inventory_2" className="text-slate-600" size={20} />
              <span className="font-semibold text-base text-brand-dark">Hồ Sơ Đợt Sửa Chữa Đang Xử Lý</span>
            </div>
          }
          subtitle="Theo dõi trạng thái trình duyệt và khối lượng kỹ thuật thi công"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pm/proposals')}
              className="text-slate-600 hover:text-brand-dark text-xs"
              icon={<Icon name="arrow_forward" size={16} />}
            >
              Quản lý đợt
            </Button>
          }
        >
          <div className="space-y-3">
            {repairBatches.slice(0, 3).map((batch) => (
              <div key={batch.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="description" className="text-slate-500" size={18} />
                    <span className="font-semibold text-sm text-brand-dark font-mono">{batch.code}</span>
                  </div>
                  <StatusBadge status={batch.status} />
                </div>
                <div className="text-xs text-slate-700 font-medium">{batch.name}</div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 text-slate-500">
                  <span>Quy mô kỹ thuật:</span>
                  <span className="font-semibold text-slate-800 font-mono text-[11px]">
                    {batch.defects?.length || 4} điểm nứt lún • {batch.items?.length || 2} hạng mục TCVN
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs border-slate-300 hover:border-slate-400 font-medium bg-white"
                  onClick={() => navigate(`/pm/proposals/${batch.id}`)}
                  icon={<Icon name="open_in_new" size={15} />}
                >
                  {batch.status === 'APPROVED'
                    ? 'Xem Hồ Sơ Đã Duyệt'
                    : batch.status === 'IN_PROGRESS'
                    ? 'Xem Tiến Độ Thi Công'
                    : batch.status === 'PENDING_APPROVAL'
                    ? 'Xem Hồ Sơ Chờ Duyệt'
                    : 'Xem Chi Tiết Đợt Sửa Chữa'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PMDashboard
