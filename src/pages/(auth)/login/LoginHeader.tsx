import React from 'react'

export const AuthTopbar: React.FC = () => {
  return (
    <header className="w-full px-5 sm:px-10 py-[13px] flex items-center justify-between z-10 border-b border-[#E2E5E9] bg-white/85 backdrop-blur-[14px]">
      {/* Logo 44px + thương hiệu */}
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Logo Hoàng Hải RoadGuard"
          className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[rgba(201,162,39,0.55)] shadow-[0_4px_14px_rgba(201,162,39,0.22)]"
        />
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-[#1A1D20] tracking-[0.08em] uppercase">
            Hoàng Hải RoadGuard
          </span>
          <span className="text-[11px] text-[#5B6470]">
            Hạ tầng giao thông đường bộ
          </span>
        </div>
      </div>

      {/* Badge trạng thái trực tuyến */}
      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-medium text-[#5B6470]">
        <span className="w-2 h-2 rounded-full bg-[#2F9E44] shadow-[0_0_0_3px_rgba(47,158,68,0.14)]" />
        <span className="hidden sm:inline">Hệ thống giám sát vận hành trực tuyến</span>
        <span className="sm:hidden">Trực tuyến</span>
      </div>
    </header>
  )
}

export const LoginHeader = AuthTopbar

export const LoginFooter: React.FC = () => {
  return (
    <footer className="w-full px-5 sm:px-10 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8B939D] z-10 gap-2 border-t border-[#E2E5E9] bg-white/80 backdrop-blur-md">
      <div>
        <span>© 2026 Hoàng Hải RoadGuard</span>
      </div>
      <div className="flex items-center gap-3">
        <span>TCVN 10380:2014</span>
        <span>•</span>
        <span>TCVN 8819:2011</span>
      </div>
    </footer>
  )
}
