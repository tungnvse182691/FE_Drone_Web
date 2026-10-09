import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '../ui/Tooltip'
import { UserProfileModal } from '../common/UserProfileModal'

export const Header: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)

  const roleTitle =
    user?.role === RoleCode.PROJECT_MANAGER
      ? 'Chỉ huy trưởng dự án (PM)'
      : 'Kỹ sư Giám sát / Chủ đầu tư (SUP)'

  return (
    <>
      <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3.5">
          {/* Logo Xe Bồn Cơ Giới Hoàng Hải */}
          <img
            src="/logo.png"
            alt="Logo Hoàng Hải"
            className="w-10 h-10 rounded-full object-cover shadow-xs ring-2 ring-brand-gold/40 shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-headline font-black text-xl tracking-tight text-brand-gold leading-tight">
              HOÀNG HẢI
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide hidden sm:inline-block">
              Hệ thống Quản lý Bảo hành &amp; Sửa chữa Hạ tầng Đường bộ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Thông báo */}
          <Tooltip content="Thông báo điều hành & Bàn giao hồ sơ">
            <button
              onClick={() =>
                navigate(
                  user?.role === RoleCode.SUPERVISOR
                    ? '/sup/notifications'
                    : '/pm/notifications'
                )
              }
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full ring-2 ring-white animate-pulse" />
            </button>
          </Tooltip>

          {/* Thông tin người dùng - Bấm vào avatar hoặc tên để mở Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <Tooltip content="Xem & Chỉnh sửa hồ sơ cá nhân">
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-3 text-left p-1 -m-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={user?.avatar_url}
                    alt={user?.full_name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-gold/30 group-hover:ring-brand-gold transition-all"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-brand-goldDark transition-colors">
                    {user?.full_name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{roleTitle}</div>
                </div>
              </button>
            </Tooltip>

            {/* Đăng xuất */}
            <Tooltip content="Đăng xuất khỏi hệ thống">
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Modal Profile Cá Nhân */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={user}
        onUpdateCurrentUser={updateUser}
      />
    </>
  )
}
