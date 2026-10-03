import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  LayoutDashboard,
  FolderKanban,
  PlaneTakeoff,
  Inbox,
  Boxes,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Zap,
  Route,
  Sparkles
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore()
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  const pmNavItems = [
    { label: 'Dashboard Điều hành dự án', path: '/pm/dashboard', icon: LayoutDashboard },
    { label: 'Danh mục dự án', path: '/pm/projects', icon: FolderKanban },
    { label: 'Tuyến đường & Phân đoạn', path: '/pm/alignment', icon: Route },
    { label: 'Khảo sát Drone & Không ảnh', path: '/pm/surveys', icon: PlaneTakeoff },
    { label: 'Điều phối & Quản lý hư hỏng', path: '/pm/ai-inbox', icon: Inbox },
    { label: 'Chính sách Fast-Track & Giao việc', path: '/pm/fast-track', icon: Zap },
    { label: 'Gói đề xuất sửa chữa', path: '/pm/proposals', icon: Boxes },
    { label: 'Rà soát kết quả & Công bố', path: '/pm/acceptance', icon: ShieldCheck },
    { label: 'Đồng bộ & Xử lý xung đột', path: '/pm/field-tasks', icon: ClipboardList },
    { label: 'Báo cáo thực nghiệm (RPT-09)', path: '/pm/research-validation', icon: Sparkles },
    { label: 'Báo cáo KPI & Xuất hồ sơ', path: '/pm/reports', icon: BarChart3 },
  ]

  const supNavItems = [
    { label: 'Dashboard Danh mục bảo hành', path: '/sup/dashboard', icon: LayoutDashboard },
    { label: 'Danh mục dự án', path: '/sup/projects', icon: FolderKanban },
    { label: 'Phê duyệt tuyến đường', path: '/sup/alignment', icon: Route },
    { label: 'Giám sát khảo sát Drone', path: '/sup/surveys', icon: PlaneTakeoff },
    { label: 'Điều phối phản ánh (Triage)', path: '/sup/ai-inbox', icon: Inbox },
    { label: 'Phê duyệt gói sửa chữa', path: '/sup/proposals', icon: Boxes },
    { label: 'Nghiệm thu chất lượng & Đóng vụ việc', path: '/sup/acceptance', icon: ShieldCheck },
    { label: 'Đồng bộ & Xử lý xung đột', path: '/sup/field-tasks', icon: ClipboardList },
    { label: 'Báo cáo thực nghiệm (RPT-09)', path: '/sup/research-validation', icon: Sparkles },
    { label: 'Báo cáo rủi ro & Hồ sơ xuất', path: '/sup/risk-analytics', icon: BarChart3 },
  ]

  const navItems = isPM ? pmNavItems : supNavItems

  return (
    <aside className="w-64 bg-white border-r border-brand-border flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {isPM ? 'Phân Hệ Project Manager' : 'Phân Hệ Giám Sát / Chủ Đầu Tư'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? isPM
                      ? 'bg-amber-50 text-brand-goldDark font-semibold border-l-4 border-brand-gold'
                      : 'bg-slate-100 text-brand-navy font-semibold border-l-4 border-brand-navy'
                    : 'text-slate-600 hover:text-brand-dark hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-brand-border bg-slate-50/50 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-700">Dự án Nhà thầu Hoàng Hải</div>
        <div>Hạ tầng đường bộ v2.2</div>
      </div>
    </aside>
  )
}
