import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { Icon } from '../ui/Icon'
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

interface NavNestedChild {
  label: string
  path: string
}

interface NavSubItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavNestedChild[]
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
  const navigate = useNavigate()
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
        {
          label: 'Đợt bay Drone',
          path: '/pm/surveys',
          icon: PlaneTakeoff,
          children: [
            { label: 'Danh sách đợt bay', path: '/pm/surveys' },
            { label: 'Tạo yêu cầu bay', path: '/pm/surveys/create' },
            { label: 'Canvas thẩm định AI', path: '/pm/surveys/srv-01/review' },
            { label: 'Thẩm định Bounding Box', path: '/pm/defects/det-03/verify-a' }
          ]
        },
        { label: 'Hộp thư tiếp nhận lỗi', path: '/pm/ai-inbox', icon: Inbox },
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
        { label: 'Nhiệm vụ & Đo đạc hiện trường', path: '/pm/field-tasks', icon: ClipboardList }
      ]
    },
    {
      id: 'reports',
      title: 'Báo cáo & Hồ sơ',
      icon: BarChart3,
      items: [
        { label: 'Báo cáo KPI', path: '/pm/reports', icon: BarChart3 },
        { label: 'Thực nghiệm AI', path: '/pm/research-validation', icon: Sparkles },
        { label: 'Nhật ký hoạt động', path: '/pm/audit-trail', icon: History },
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
        { label: 'Hộp thư tiếp nhận lỗi', path: '/sup/ai-inbox', icon: Inbox },
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
        { label: 'Nhật ký hoạt động', path: '/sup/audit-trail', icon: History },
        { label: 'Quản trị hệ thống', path: '/sup/system-control', icon: Sliders }
      ]
    }
  ]

  const navGroups = isPM ? pmNavGroups : supNavGroups

  // Trạng thái đóng/mở từng nhóm Accordion cấp 1
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    projects: true,
    surveys: true,
    construction: true,
    approval: true,
    reports: false
  })

  // Trạng thái đóng/mở nhánh con cấp 2 (ví dụ Đợt bay Drone -> Tạo yêu cầu bay)
  const [openSubBranches, setOpenSubBranches] = useState<Record<string, boolean>>({
    '/pm/surveys': true
  })

  // Tự động mở nhóm cha và nhánh con khi truy cập vào route tương ứng
  useEffect(() => {
    navGroups.forEach((group) => {
      if (group.items) {
        const hasActiveChild = group.items.some((item) => {
          if (location.pathname.startsWith(item.path.split('?')[0])) return true
          if (
            item.children?.some(
              (c) =>
                location.pathname === c.path ||
                (c.path.includes('/review') &&
                  (location.pathname.includes('/review') || location.pathname.startsWith('/pm/drone-mission'))) ||
                (c.path.includes('/defects') && location.pathname.startsWith('/pm/defects'))
            )
          )
            return true
          return false
        })
        if (hasActiveChild) {
          setOpenGroups((prev) => ({ ...prev, [group.id]: true }))
        }
      }
    })

    if (
      location.pathname.startsWith('/pm/surveys') ||
      location.pathname.startsWith('/pm/drone-mission') ||
      location.pathname.startsWith('/pm/defects')
    ) {
      setOpenSubBranches((prev) => ({ ...prev, '/pm/surveys': true }))
    }
  }, [location.pathname, isPM])

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const toggleSubBranch = (path: string) => {
    setOpenSubBranches((prev) => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  return (
    <aside className="w-64 bg-white border-r border-[#E2E5E9] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 shadow-2xs">
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
                        ? 'bg-amber-50 text-[#8C6D1F] border-l-4 border-[#C9A227] shadow-2xs'
                        : 'bg-slate-100 text-slate-900 border-l-4 border-[#2D3748] shadow-2xs'
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
          const hasActiveChild = group.items?.some((item) => {
            const basePath = item.path.split('?')[0]
            if (location.pathname.startsWith(basePath)) return true
            if (
              item.children?.some((c) => {
                if (location.pathname === c.path) return true
                if (
                  c.path.includes('/review') &&
                  (location.pathname.includes('/review') || location.pathname.startsWith('/pm/drone-mission'))
                )
                  return true
                if (c.path.includes('/defects') && location.pathname.startsWith('/pm/defects')) return true
                return false
              })
            )
              return true
            return false
          })

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
                          ? 'text-[#C9A227]'
                          : 'text-[#2D3748]'
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
                      : location.pathname === subItem.path ||
                        (subItem.children && (
                          location.pathname.startsWith(subItem.path) ||
                          (subItem.path === '/pm/surveys' && location.pathname.startsWith('/pm/defects'))
                        ))

                    const hasChildren = Boolean(subItem.children && subItem.children.length > 0)
                    const isBranchOpen = Boolean(openSubBranches[subItem.path])

                    return (
                      <div key={subItem.path} className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <NavLink
                            to={subItem.path}
                            className={() =>
                              `flex-1 flex items-center gap-2.5 pl-4 pr-2 py-2 rounded-lg text-xs transition-all relative ${
                                isCustomActive
                                  ? isPM
                                    ? 'bg-amber-50/90 text-amber-950 font-bold border-l-3 border-[#C9A227] shadow-2xs'
                                    : 'bg-slate-100 text-slate-950 font-bold border-l-3 border-[#2D3748] shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                              }`
                            }
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="truncate">{subItem.label}</span>
                          </NavLink>

                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSubBranch(subItem.path)
                              }}
                              className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title={isBranchOpen ? 'Thu gọn nhánh' : 'Mở rộng nhánh'}
                            >
                              <ChevronDown
                                className={`w-3 h-3 transition-transform duration-200 ${
                                  isBranchOpen ? 'rotate-180 text-slate-600' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Nhánh nhỏ cấp 3 xổ ra (VD: Danh sách đợt bay & Tạo yêu cầu bay) */}
                        {hasChildren && isBranchOpen && (
                          <div className="pl-7 pr-1 py-0.5 space-y-1 relative before:absolute before:left-6 before:top-1 before:bottom-1 before:w-[1px] before:bg-amber-200">
                            {subItem.children!.map((child) => {
                              const isChildActive = child.path.includes('/review')
                                ? location.pathname.includes('/review') || location.pathname.startsWith('/pm/drone-mission')
                                : child.path.includes('/defects')
                                ? location.pathname.startsWith('/pm/defects')
                                : location.pathname === child.path
                              return (
                                <NavLink
                                  key={child.path}
                                  to={child.path}
                                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] transition-all ${
                                    isChildActive
                                      ? 'bg-amber-100/80 text-[#8C6D1F] font-bold shadow-2xs'
                                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isChildActive ? 'bg-[#C9A227]' : 'bg-slate-300'
                                    }`}
                                  />
                                  <span className="truncate">{child.label}</span>
                                </NavLink>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer bản quyền & phiên bản */}
      <div className="p-3.5 border-t border-[#E2E5E9] bg-slate-50/60 text-[11px] text-slate-500">
        <div className="font-bold text-slate-700">Dự án Nhà thầu Hoàng Hải</div>
        <div className="text-[10px] text-slate-400 font-mono">Hạ tầng đường bộ v2.2</div>
      </div>
    </aside>
  )
}
