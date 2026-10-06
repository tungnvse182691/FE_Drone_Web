import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '../ui/Tooltip'

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const roleTitle = user?.role === RoleCode.PROJECT_MANAGER
    ? 'Chỉ huy trưởng dự án (PM)'
    : 'Kỹ sư Giám sát / Chủ đầu tư (SUP)'

  return (
    <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3.5">
        {/* Logo Xe Bồn Cơ Giới Hoàng Hải */}
        <img
          src="/logo.png"
          alt="Logo Hoàng Hải"
          className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-brand-gold/40 shrink-0"
        />
        <div className="flex flex-col">
          <span className="font-headline font-black text-xl tracking-tight text-brand-gold leading-tight">
            HOÀNG HẢI
          </span>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide hidden sm:inline-block">
            Hệ thống Quản lý Bảo hành & Sửa chữa Hạ tầng Đường bộ
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Thông báo */}
        <Tooltip content="Thông báo điều hành & Bàn giao hồ sơ">
          <button
            onClick={() => navigate(user?.role === RoleCode.SUPERVISOR ? '/sup/notifications' : '/pm/notifications')}
            className="relative p-2 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full ring-2 ring-white animate-pulse" />
          </button>
        </Tooltip>

        {/* Thông tin người dùng */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <img
            src={user?.avatar_url}
            alt={user?.full_name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-gold/30"
          />
          <div className="hidden lg:block text-left">
            <div className="text-sm font-semibold text-brand-dark leading-tight">{user?.full_name}</div>
            <div className="text-xs text-slate-500 font-medium">
              {roleTitle}
            </div>
          </div>
          <Tooltip content="Đăng xuất khỏi hệ thống">
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="p-1.5 text-slate-400 hover:text-brand-error hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  )
}
