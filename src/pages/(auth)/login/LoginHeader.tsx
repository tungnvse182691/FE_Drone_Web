import React from 'react'
import { LoginViewMode } from './types'

export interface LoginHeaderProps {
  viewMode: LoginViewMode
  setViewMode: (mode: LoginViewMode) => void
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ viewMode, setViewMode }) => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#C9A227]">
          <span className="material-symbols-outlined text-[20px]">shield</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800 tracking-wide uppercase">
            Hoàng Hải RoadGuard
          </span>
          <span className="text-[11px] text-slate-400">
            Hạ tầng giao thông đường bộ
          </span>
        </div>
      </div>

      {/* Chuyển đổi trạng thái kiểm tra (Tối giản - Không nhãn mã rác) */}
      <div className="flex items-center bg-white border border-[#E2E5E9] p-0.5 rounded-lg shadow-xs text-xs">
        <button
          type="button"
          onClick={() => setViewMode('login')}
          className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'login'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">login</span>
          <span>Đăng nhập</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('force')}
          className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'force'
              ? 'bg-[#C9A227] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">lock_reset</span>
          <span>Đổi mật khẩu lần đầu</span>
        </button>
      </div>
    </header>
  )
}

export const LoginBrandCardHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E2E5E9]">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#C9A227] shrink-0">
        <span className="material-symbols-outlined text-[28px]">verified_user</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#1A1D20]">
            Hoàng Hải
          </span>
          <span className="text-[11px] px-2 py-0.5 font-semibold bg-amber-50 text-[#8C6D1F] border border-amber-200/60 rounded">
            ROADGUARD
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 font-normal truncate">
          Quản lý Bảo hành &amp; Sửa chữa Hạ tầng
        </p>
      </div>
    </div>
  )
}

export const LoginFooter: React.FC = () => {
  return (
    <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 z-10 gap-2 border-t border-[#E2E5E9] bg-white">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Hệ thống giám sát vận hành trực tuyến</span>
      </div>
      <div className="flex items-center gap-3 text-slate-400">
        <span>TCVN 10380:2014</span>
        <span>•</span>
        <span>TCVN 8819:2011</span>
        <span>•</span>
        <span>© 2026 Hoàng Hải RoadGuard</span>
      </div>
    </footer>
  )
}
