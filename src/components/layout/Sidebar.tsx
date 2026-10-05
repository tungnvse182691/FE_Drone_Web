import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
  Sparkles,
  History,
  Sliders,
  ChevronDown,
  Users
} from 'lucide-react'

interface NavSubItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  items?: NavSubItem[]
  directPath?: string // Dành cho các mục cấp 1 độc lập như Dashboard
}

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore()
  const location = useLocation()
  const isPM = user?.role === RoleCode.PROJECT_MANAGER

  // Danh mục nhóm điều hướng PM (Chỉ huy trưởng)
  const pmNavGroups: NavGroup[] = [
    {
      id: 'dashboard',
      title: 'Tổng quan',
      icon: LayoutDashboard,
      directPath: '/pm/dashboard'
    },
    {
      id: 'projects',
      title: 'Dự án & Tuyến',
      icon: FolderKanban,
      items: [
        { label: 'Dự án bảo hành', path: '/pm/projects', icon: FolderKanban },
        { label: 'Tuyến & Phân đoạn', path: '/pm/alignment', icon: Route }
      ]
    },
    {
      id: 'surveys',
      title: 'Khảo sát & AI',
      icon: PlaneTakeoff,
      items: [
        { label: 'Đợt bay Drone', path: '/pm/surveys', icon: PlaneTakeoff },
        { label: 'Hộp thư Drone AI', path: '/pm/ai-inbox?source=drone', icon: Inbox },
        { label: 'Phản ánh người dân & Tuần đường', path: '/pm/ai-inbox?source=citizen', icon: Users },
        { label: 'Điều phối nhanh', path: '/pm/fast-track', icon: Zap }
      ]
    },
    {
      id: 'construction',
      title: 'Sửa chữa & Hiện trường',
      icon: Boxes,
      items: [
        { label: 'Gói sửa chữa', path: '/pm/proposals', icon: Boxes },
        { label: 'Nghiệm thu', path: '/pm/acceptance', icon: ShieldCheck },
        { label: 'Đồng bộ hiện trường', path: '/pm/field-tasks', icon: ClipboardList }
      ]
    },
    {
      id: 'reports',
      title: 'Báo cáo & Kiểm toán',
      icon: BarChart3,
      items: [
        { label: 'Báo cáo KPI', path: '/pm/reports', icon: BarChart3 },
        { label: 'Thực nghiệm AI', path: '/pm/research-validation', icon: Sparkles },
        { label: 'Nhật ký kiểm toán', path: '/pm/audit-trail', icon: History },
        { label: 'Lưu trữ hồ sơ', path: '/pm/retention', icon: Sliders }
      ]
    }
  ]

  // Danh mục nhóm điều hướng SUPERVISOR (Giám sát / Chủ đầu tư)
  const supNavGroups: NavGroup[] = [
    {
      id: 'dashboard',
      title: 'Tổng quan',
      icon: LayoutDashboard,
      directPath: '/sup/dashboard'
    },
    {
      id: 'projects',
      title: 'Dự án & Tuyến',
      icon: FolderKanban,
      items: [
        { label: 'Dự án bảo hành', path: '/sup/projects', icon: FolderKanban },
        { label: 'Phê duyệt tuyến', path: '/sup/alignment', icon: Route }
      ]
    },
    {
      id: 'surveys',
      title: 'Khảo sát & Tiếp nhận',
      icon: PlaneTakeoff,
      items: [
        { label: 'Giám sát Drone', path: '/sup/surveys', icon: PlaneTakeoff },
        { label: 'Hộp thư Drone AI', path: '/sup/ai-inbox?source=drone', icon: Inbox },
        { label: 'Phản ánh người dân & Tuần đường', path: '/sup/ai-inbox?source=citizen', icon: Users },
        { label: 'Xử lý cấp bách', path: '/sup/fast-track', icon: Zap }
      ]
    },
    {
      id: 'approval',
      title: 'Thẩm duyệt & Nghiệm thu',
      icon: Boxes,
      items: [
        { label: 'Phê duyệt gói', path: '/sup/proposals', icon: Boxes },
        { label: 'Nghiệm thu đóng đợt', path: '/sup/acceptance', icon: ShieldCheck },
        { label: 'Nhiệm vụ hiện trường', path: '/sup/field-tasks', icon: ClipboardList }
      ]
    },
    {
      id: 'reports',
      title: 'Báo cáo & Quản trị',
      icon: BarChart3,
      items: [
        { label: 'Phân tích rủi ro', path: '/sup/risk-analytics', icon: BarChart3 },
        { label: 'Kiểm định mô hình', path: '/sup/research-validation', icon: Sparkles },
        { label: 'Nhật ký kiểm toán', path: '/sup/audit-trail', icon: History },
        { label: 'Quản trị hệ thống', path: '/sup/system-control', icon: Sliders }
      ]
    }
  ]

  const navGroups = isPM ? pmNavGroups : supNavGroups

  // Quản lý trạng thái mở/đóng từng nhóm Accordion
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    dashboard: true,
    projects: true,
    surveys: true,
    construction: true,
    approval: true,
    reports: false
  })

  // Tự động mở nhóm cha khi truy cập vào route con tương ứng
  useEffect(() => {
    navGroups.forEach((group) => {
      if (group.items) {
        const hasActiveChild = group.items.some((item) =>
          location.pathname.startsWith(item.path)
        )
        if (hasActiveChild) {
          setOpenGroups((prev) => ({ ...prev, [group.id]: true }))
        }
      }
    })
  }, [location.pathname, isPM])

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  return (
    <aside className="w-64 bg-white border-r border-brand-border flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 shadow-2xs">
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {/* Tiêu đề phân hệ */}
        <div className="px-3 py-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
          <span>{isPM ? 'Chỉ huy trưởng dự án' : 'Giám sát / Chủ đầu tư'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Hệ thống trực tuyến" />
        </div>

        {/* Danh sách nhóm Menu Accordion */}
        {navGroups.map((group) => {
          const GroupIcon = group.icon
          const isOpen = Boolean(openGroups[group.id])

          // Trường hợp mục cấp 1 độc lập (như Tổng quan)
          if (group.directPath) {
            return (
              <NavLink
                key={group.id}
                to={group.directPath}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? isPM
                        ? 'bg-amber-50 text-amber-900 border-l-4 border-brand-gold shadow-2xs'
                        : 'bg-slate-100 text-slate-900 border-l-4 border-brand-navy shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <GroupIcon className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="truncate">{group.title}</span>
              </NavLink>
            )
          }

          // Kiểm tra xem trong nhóm có item con nào đang active không
          const hasActiveChild = group.items?.some((item) =>
            location.pathname.startsWith(item.path.split('?')[0])
          )

          return (
            <div key={group.id} className="rounded-xl overflow-hidden transition-all">
              {/* Nút bấm cha xổ xuống (Accordion Header) */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  hasActiveChild
                    ? 'text-slate-900 bg-slate-50/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon
                    className={`w-4 h-4 shrink-0 ${
                      hasActiveChild
                        ? isPM
                          ? 'text-brand-gold'
                          : 'text-brand-navy'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{group.title}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-slate-600' : ''
                  }`}
                />
              </button>

              {/* Danh sách các Menu con (Submenu) */}
              {isOpen && group.items && (
                <div className="pl-4 pr-1 py-1 space-y-1 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                  {group.items.map((subItem) => {
                    const SubIcon = subItem.icon
                    const [itemBase, itemQuery] = subItem.path.split('?')
                    const isCustomActive = itemQuery
                      ? location.pathname === itemBase && (
                          location.search === `?${itemQuery}` ||
                          (!location.search && itemQuery === 'citizen')
                        )
                      : location.pathname === subItem.path

                    return (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={() =>
                          `flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-lg text-xs transition-all relative ${
                            isCustomActive
                              ? isPM
                                ? 'bg-amber-50/90 text-amber-950 font-bold border-l-3 border-brand-gold shadow-2xs'
                                : 'bg-slate-100 text-slate-950 font-bold border-l-3 border-brand-navy shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`
                        }
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{subItem.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer bản quyền & phiên bản */}
      <div className="p-3.5 border-t border-brand-border bg-slate-50/60 text-[11px] text-slate-500">
        <div className="font-bold text-slate-700">Dự án Nhà thầu Hoàng Hải</div>
        <div className="text-[10px] text-slate-400 font-mono">Hạ tầng đường bộ v2.2</div>
      </div>
    </aside>
  )
}
