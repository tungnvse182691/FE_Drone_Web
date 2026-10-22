import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Icon } from '../../components/ui/Icon'
import { dashboardService, PMDashboardData } from '../../api/services/dashboardService'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { OperationalClocksWidget } from './dashboard/OperationalClocksWidget'

export const PMDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [inboxTab, setInboxTab] = useState<'DRONE' | 'CITIZEN'>('DRONE')

  // Sử dụng TanStack Query gọi qua Mock API Service bất đồng bộ
  const { data, isLoading, isError, refetch } = useQuery<PMDashboardData>({
    queryKey: ['pm-dashboard'],
    queryFn: () => dashboardService.getPMDashboard(),
  })

  // Helper render badge theo phong cách A+
  const renderSeverityBadge = (severity: string) => {
    if (severity === 'CRITICAL') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
          Đặc biệt khẩn cấp
        </span>
      )
    }
    if (severity === 'HIGH') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
          Nghiêm trọng
        </span>
      )
    }
    return <StatusBadge status={severity} />
  }

  const renderBatchStatusBadge = (status: string) => {
    if (status === 'APPROVED' || status === 'DECIDED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0]">
          Đã phê duyệt
        </span>
      )
    }
    if (status === 'IN_PROGRESS' || status === 'ASSIGNED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E0E7FF] text-[#4338CA] border border-[#C7D2FE]">
          Đang thi công
        </span>
      )
    }
    return <StatusBadge status={status} />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-[18px] border border-brand-border p-5"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white rounded-[16px] border border-[#E2E5E9]"></div>
          <div className="h-96 bg-white rounded-[16px] border border-[#E2E5E9]"></div>
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

  const { stats, defects, citizenCases, repairBatches, clocks = [] } = data

  return (
    <div className="space-y-6">
      {/* CSS Scoped cho 4 thẻ KPI phong cách A+ */}
      <style>{`
        .pm-kpi-card {
          position: relative;
          border-radius: 18px;
          padding: 20px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pm-kpi-card:hover {
          transform: translateY(-4px);
        }
        .pm-kpi-card-1 {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
        }
        .pm-kpi-card-1::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #64748B, #94A3B8);
        }
        .pm-kpi-card-1:hover {
          border-color: #94A3B8;
          box-shadow: 0 12px 28px rgba(100, 116, 139, 0.18);
        }

        .pm-kpi-card-2 {
          background: linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%);
          border: 1.5px solid #FDE68A;
        }
        .pm-kpi-card-2::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #F59E0B, #FBBF24);
        }
        .pm-kpi-card-2:hover {
          border-color: #FBBF24;
          box-shadow: 0 12px 28px rgba(245, 158, 11, 0.22);
        }

        .pm-kpi-card-3 {
          background: #FFFFFF;
          border: 1.5px solid #BAE6FD;
        }
        .pm-kpi-card-3::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0EA5E9, #38BDF8);
        }
        .pm-kpi-card-3:hover {
          border-color: #38BDF8;
          box-shadow: 0 12px 28px rgba(14, 165, 233, 0.18);
        }

        .pm-kpi-card-4 {
          background: #FFFFFF;
          border: 1.5px solid #A7F3D0;
        }
        .pm-kpi-card-4::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10B981, #34D399);
        }
        .pm-kpi-card-4:hover {
          border-color: #34D399;
          box-shadow: 0 12px 28px rgba(16, 185, 129, 0.18);
        }

        .pm-kpi-card:hover .pm-kpi-icon {
          transform: scale(1.1) rotate(-4deg);
        }
        .pm-kpi-card:hover .pm-kpi-value {
          transform: scale(1.05);
        }
      `}</style>

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

      {/* KPI Cards (4 thẻ phong cách A+, số lớn 36px, thanh gradient 4px, viền màu riêng, hover nổi 4px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Đợt bay khảo sát */}
        <div
          onClick={() => navigate('/pm/surveys')}
          className="pm-kpi-card pm-kpi-card-1 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.04em] block">
              Đợt Bay Khảo Sát
            </span>
            <div className="text-[36px] leading-[42px] font-extrabold text-[#1A1D20] pm-kpi-value transition-transform duration-250 origin-left">
              {stats.surveysCount}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
              <Icon name="check_circle" className="text-emerald-600" size={13} />
              <span>Đã số hóa bản đồ trực ảnh</span>
            </div>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#F1F5F9] text-[#475569] flex items-center justify-center transition-transform duration-250 pm-kpi-icon shrink-0">
            <Icon name="flight_takeoff" size={24} />
          </div>
        </div>

        {/* KPI 2: Lỗi trí tuệ nhân tạo cần thẩm định */}
        <div
          onClick={() => navigate('/pm/ai-inbox?source=drone')}
          className="pm-kpi-card pm-kpi-card-2 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.04em] block">
              Lỗi trí tuệ nhân tạo cần thẩm định
            </span>
            <div className="text-[36px] leading-[42px] font-extrabold text-[#1A1D20] pm-kpi-value transition-transform duration-250 origin-left">
              {stats.pendingAIDefectsCount}
            </div>
            <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1 pt-0.5">
              <Icon name="pending" size={13} className="text-amber-600" />
              <span>Cần xác minh khung nhận diện</span>
            </div>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center transition-transform duration-250 pm-kpi-icon shrink-0">
            <Icon name="inbox" size={24} />
          </div>
        </div>

        {/* KPI 3: Phản ánh dân cần kết luận (chuẩn PM-11, Triage do Supervisor thực hiện) */}
        <div
          onClick={() => navigate('/pm/ai-inbox?source=citizen')}
          className="pm-kpi-card pm-kpi-card-3 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.04em] block">
              Phản Ánh Cần Kết Luận
            </span>
            <div className="text-[36px] leading-[42px] font-extrabold text-[#1A1D20] pm-kpi-value transition-transform duration-250 origin-left">
              {stats.citizenCasesCount}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
              <Icon name="check_circle" className="text-sky-600" size={13} />
              <span>Đã gán dự án • Chờ kết luận (PM-11)</span>
            </div>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center transition-transform duration-250 pm-kpi-icon shrink-0">
            <Icon name="groups" size={24} />
          </div>
        </div>

        {/* KPI 4: Đợt sửa chữa đang chạy */}
        <div
          onClick={() => navigate('/pm/proposals')}
          className="pm-kpi-card pm-kpi-card-4 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.04em] block">
              Đợt Sửa Chữa Đang Chạy
            </span>
            <div className="text-[36px] leading-[42px] font-extrabold text-[#1A1D20] pm-kpi-value transition-transform duration-250 origin-left">
              {stats.runningBatchesCount}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 pt-0.5">
              <Icon name="build" size={13} className="text-emerald-600" />
              <span>Theo dõi tiến độ hồ sơ</span>
            </div>
          </div>
          <div className="w-[48px] h-[48px] rounded-[12px] bg-[#D1FAE5] text-[#059669] flex items-center justify-center transition-transform duration-250 pm-kpi-icon shrink-0">
            <Icon name="inventory_2" size={24} />
          </div>
        </div>
      </div>

      {/* Widget Đồng hồ thời hạn nhiệm vụ (Clocks & SLA - API-062) */}
      <OperationalClocksWidget clocks={clocks} />

      {/* Main Content Grid: Hộp Thư Tiếp Nhận & Danh Sách Đợt Sửa Chữa (Bo góc 16px, viền #E2E5E9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Hộp thư tiếp nhận & Thẩm định */}
        <div className="bg-white rounded-[16px] border border-[#E2E5E9] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E5E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Icon name="inbox" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-dark">Hộp Thư Tiếp Nhận &amp; Thẩm Định</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inboxTab === 'DRONE'
                    ? 'Các vị trí nứt lún được mô hình AI phát hiện cần xác minh khung nhận diện'
                    : 'Tiếp nhận phản ánh từ công dân qua ứng dụng dịch vụ đường bộ để phân loại và xử lý trùng lặp'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Tabs: nền #F3F4F6, tab active nền trắng có shadow nhẹ */}
              <div className="flex items-center bg-[#F3F4F6] p-1 rounded-lg border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setInboxTab('DRONE')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    inboxTab === 'DRONE'
                      ? 'bg-white text-brand-dark shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Trí tuệ nhân tạo ({defects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInboxTab('CITIZEN')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    inboxTab === 'CITIZEN'
                      ? 'bg-white text-brand-dark shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Người dân ({citizenCases.length})
                </button>
              </div>

              {/* Nút Xem tất cả */}
              <button
                type="button"
                onClick={() =>
                  navigate(inboxTab === 'DRONE' ? '/pm/ai-inbox?source=drone' : '/pm/ai-inbox?source=citizen')
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Xem tất cả</span>
                <Icon name="arrow_forward" size={15} />
              </button>
            </div>
          </div>

          <div className="p-6">
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
                          {renderSeverityBadge(defect.severity)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          Lý trình: Km{defect.chainage_km} • Độ tin cậy AI: {(defect.confidence_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    {/* Nút Thẩm định: viền #E2E5E9, bo góc 10px, icon visibility + text */}
                    <button
                      type="button"
                      onClick={() => navigate(`/pm/defects/${defect.id}/verify-a`)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#E2E5E9] hover:border-slate-400 hover:bg-slate-50 rounded-[10px] transition-colors cursor-pointer"
                    >
                      <Icon name="visibility" size={15} className="text-slate-500" />
                      <span>Thẩm Định</span>
                    </button>
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
                          {renderSeverityBadge(item.severity)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {item.reporter_name} • {item.stationing} • {item.defect_title}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/pm/ai-inbox?source=citizen')}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#E2E5E9] hover:border-slate-400 hover:bg-slate-50 rounded-[10px] transition-colors cursor-pointer"
                    >
                      <Icon name="checklist" size={15} className="text-slate-500" />
                      <span>Xử Lý</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Đợt Sửa Chữa Đang Xử Lý (Bo góc 16px, viền #E2E5E9) */}
        <div className="bg-white rounded-[16px] border border-[#E2E5E9] shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E5E9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
                <Icon name="inventory_2" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-dark">Hồ Sơ Đợt Sửa Chữa Đang Xử Lý</h3>
                <p className="text-xs text-slate-500 mt-0.5">Theo dõi trạng thái trình duyệt và khối lượng kỹ thuật thi công</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pm/proposals')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <span>Xem tất cả</span>
              <Icon name="arrow_forward" size={15} />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {repairBatches.slice(0, 3).map((batch) => (
                <div key={batch.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="description" className="text-slate-500" size={18} />
                      <span className="font-semibold text-sm text-brand-dark font-mono">{batch.code}</span>
                    </div>
                    {renderBatchStatusBadge(batch.status)}
                  </div>
                  <div className="text-xs text-slate-700 font-medium">{batch.name}</div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 text-slate-500">
                    <span>Quy mô kỹ thuật:</span>
                    <span className="font-semibold text-slate-800 font-mono text-[11px]">
                      {batch.defects?.length || 4} điểm nứt lún • {batch.items?.length || 2} hạng mục TCVN
                    </span>
                  </div>
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-slate-300 hover:border-slate-400 font-medium bg-white text-slate-700 rounded-[10px] transition-colors cursor-pointer"
                    onClick={() => navigate(`/pm/proposals/${batch.id}`)}
                  >
                    <Icon name="open_in_new" size={15} className="text-slate-500" />
                    <span>
                      {batch.status === 'APPROVED'
                        ? 'Xem Hồ Sơ Đã Duyệt'
                        : batch.status === 'IN_PROGRESS'
                        ? 'Xem Tiến Độ Thi Công'
                        : batch.status === 'PENDING_APPROVAL'
                        ? 'Xem Hồ Sơ Chờ Duyệt'
                        : 'Xem Chi Tiết Đợt Sửa Chữa'}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PMDashboard
