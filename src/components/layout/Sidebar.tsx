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
  FileCheck2,
  Users2,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  FileSignature,
  Zap,
  Route
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore()
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  const pmNavItems = [
    { label: 'Tổng quan (Dashboard)', path: '/pm/dashboard', icon: LayoutDashboard },
    { label: 'Danh mục dự án', path: '/pm/projects', icon: FolderKanban },
    { label: 'Tuyến đường & Phân đoạn', path: '/pm/alignment', icon: Route },
    { label: 'Khảo sát Drone & Không ảnh', path: '/pm/surveys', icon: PlaneTakeoff },
    { label: 'Hộp thư phát hiện AI', path: '/pm/ai-inbox', icon: Inbox },
    { label: 'Chính sách & Giao việc (WF-05)', path: '/pm/fast-track', icon: Zap },
    { label: 'Gói đề xuất sửa chữa (Màn 09)', path: '/pm/proposals', icon: Boxes },
    { label: 'Gom đợt sửa chữa', path: '/pm/repair-batches/create', icon: Boxes },
    { label: 'Phân công đội thi công', path: '/pm/repair-batches/assign', icon: Users2 },
    { label: 'Nhiệm vụ đo hiện trường', path: '/pm/field-tasks', icon: ClipboardList },
    { label: 'Xác nhận hoàn thành', path: '/pm/work-orders/confirm', icon: CheckCircle2 },
  ]

  const supNavItems = [
    { label: 'Tổng quan Giám sát', path: '/sup/dashboard', icon: LayoutDashboard },
    { label: 'Danh mục dự án', path: '/sup/projects', icon: FolderKanban },
    { label: 'Tuyến đường & Phân đoạn', path: '/sup/alignment', icon: Route },
    { label: 'Khảo sát Drone & Không ảnh', path: '/sup/surveys', icon: PlaneTakeoff },
    { label: 'Hộp thư tiếp nhận & Triage', path: '/sup/ai-inbox', icon: Inbox },
    { label: 'Giám sát chính sách Fast-Track', path: '/sup/fast-track', icon: Zap },
    { label: 'Gói đề xuất kỹ thuật (Màn 09)', path: '/sup/proposals', icon: Boxes },
    { label: 'Thẩm duyệt đợt sửa', path: '/sup/approvals', icon: FileCheck2 },
    { label: 'Nghiệm thu hiện trường', path: '/sup/acceptance', icon: ShieldCheck },
    { label: 'Phân tích rủi ro & PCI', path: '/sup/risk-analytics', icon: BarChart3 },
    { label: 'Ký số đóng đợt', path: '/sup/signoff', icon: FileSignature },
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
        <div className="font-semibold text-slate-700">Dự án Nhà thầu Cát Tường</div>
        <div>Hạ tầng đường bộ v2.2</div>
      </div>
    </aside>
  )
}
