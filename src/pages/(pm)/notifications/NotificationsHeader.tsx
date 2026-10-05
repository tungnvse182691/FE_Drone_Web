import React from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react'

interface NotificationsHeaderProps {
  basePath: string
  isSupervisor: boolean
  unreadCount: number
  emergencyCount: number
  isAudioEnabled: boolean
  onMarkAllAsRead: () => void
  onOpenAudioModal: () => void
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  basePath,
  isSupervisor,
  unreadCount,
  emergencyCount,
  isAudioEnabled,
  onMarkAllAsRead,
  onOpenAudioModal
}) => {
  return (
    <>
      {/* TOPBAR BREADCRUMB & REALTIME SYNC STATUS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to={`${basePath}/dashboard`} className="hover:text-brand-dark flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-[#8F7212]">Trung tâm thông báo &amp; Bàn giao (WF-14)</span>
        </nav>

        {/* Live WebSocket Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-bold text-emerald-800 text-[11px]">Kênh Polling / Event: LIVE</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-500 text-[11px]">Độ trễ &lt; 50ms</span>
          </div>
        </div>
      </div>

      {/* HERO SECTION: BANNER HEADER & PRIORITY COUNTERS */}
      <div className="bg-white rounded-2xl p-5 shadow-2xs border border-brand-border flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
              Trung Tâm Thông Báo &amp; Điều Phối Bàn Giao
            </h1>
            {isSupervisor ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Hộp thư: Ban Tư Vấn Giám Sát (SUPERVISOR)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                <Wrench className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Hộp thư: Ban Chỉ Huy PM Nhà Thầu (PROJECT_MANAGER)</span>
              </span>
            )}
            {emergencyCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>{emergencyCount} Lệnh khẩn cấp</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-[#8F7212] border border-[#C9A227]/30 text-xs font-bold">
              {unreadCount} chưa đọc
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isSupervisor
              ? 'Kênh thông báo & chỉ đạo của Giám sát: Thẩm duyệt gói đề xuất sửa chữa, nghiệm thu hồ sơ hiện trường, xác nhận tuyến đường và cảnh báo suy thoái rủi ro.'
              : 'Kênh điều hành & tiếp nhận chỉ đạo của Chỉ huy trưởng (PM): Lệnh ứng cứu khẩn cấp, tiến độ đợt sửa Fast Track, kết quả thẩm định Drone AI và phản hồi duyệt hồ sơ.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>

          <button
            type="button"
            onClick={onOpenAudioModal}
            className="h-10 px-4 rounded-xl bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Cấu hình chuông SLA</span>
          </button>
        </div>
      </div>
    </>
  )
}
