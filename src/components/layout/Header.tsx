import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { Bell, UserCheck, Shield, ChevronDown, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Header: React.FC = () => {
  const { user, switchRole, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleRoleToggle = (newRole: RoleCode) => {
    switchRole(newRole)
    if (newRole === RoleCode.PROJECT_MANAGER) {
      navigate('/pm/dashboard')
    } else {
      navigate('/sup/dashboard')
    }
  }

  return (
    <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-headline font-black text-xl tracking-tight text-brand-gold">HOÀNG HẢI</span>
          <span className="text-xs bg-brand-navy text-white px-2 py-0.5 rounded font-mono font-bold tracking-wider">
            ROADGUARD
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-xs text-slate-500 font-medium">
          Hệ thống Quản lý Bảo hành & Sửa chữa Hạ tầng Đường bộ
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Quick Role Switcher for Development / Solo Dev testing */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => handleRoleToggle(RoleCode.PROJECT_MANAGER)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              user?.role === RoleCode.PROJECT_MANAGER
                ? 'bg-brand-gold text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            Vai trò: PM
          </button>
          <button
            onClick={() => handleRoleToggle(RoleCode.SUPERVISOR)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              user?.role === RoleCode.SUPERVISOR
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            Vai trò: Giám sát
          </button>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate(user?.role === RoleCode.SUPERVISOR ? '/sup/notifications' : '/pm/notifications')}
          title="Thông báo điều hành & Bàn giao"
          className="relative p-2 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full ring-2 ring-white animate-pulse"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <img
            src={user?.avatar_url}
            alt={user?.full_name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-gold/30"
          />
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-brand-dark leading-tight">{user?.full_name}</div>
            <div className="text-xs text-slate-500 font-medium">
              {user?.role === RoleCode.PROJECT_MANAGER ? 'Project Manager' : 'Chủ đầu tư / Giám sát'}
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            title="Đăng xuất"
            className="p-1.5 text-slate-400 hover:text-brand-error rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
