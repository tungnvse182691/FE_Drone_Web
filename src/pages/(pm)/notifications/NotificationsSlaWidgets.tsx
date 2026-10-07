import React from 'react'
import {
  Clock,
  RefreshCw,
  Volume2,
  Play,
  Flame
} from 'lucide-react'
import { NotificationItem } from './types'

interface NotificationsSlaWidgetsProps {
  criticalSlaItems: NotificationItem[]
  onNavigateAction: (item: NotificationItem) => void
  isAudioEnabled: boolean
  onPlaySound: (type: 'EMERGENCY' | 'SLA_WARNING' | 'PING') => void
}

export const NotificationsSlaWidgets: React.FC<NotificationsSlaWidgetsProps> = ({
  criticalSlaItems,
  onNavigateAction,
  isAudioEnabled,
  onPlaySound
}) => {
  return (
    <div className="lg:col-span-4 space-y-5">
      {/* WIDGET 1: HÀNG ĐỢI SLA ĐẾM NGƯỢC (SLA COUNTDOWN MONITOR) */}
      <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-sm text-brand-dark">Theo Dõi Thời Hạn SLA Trực Tiếp</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
            {criticalSlaItems.length} mục
          </span>
        </div>

        <div className="space-y-3">
          {criticalSlaItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateAction(item)}
              className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-brand-gold transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-dark font-mono">{item.resourceId}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  {item.slaType}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 line-clamp-1">{item.title}</div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-500">{item.stationing}</span>
                <span className="font-mono font-bold text-rose-600">
                  Còn {item.slaHoursRemaining} giờ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WIDGET 2: MA TRẬN BÀN GIAO TRÁCH NHIỆM (WORKFLOW HANDOFF MATRIX) */}
      <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-brand-gold" />
            <h3 className="font-bold text-sm text-brand-dark">Dòng Chảy Bàn Giao (Handoff)</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Quy chuẩn v2.2</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Bước 1 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="font-bold text-emerald-950">Drone AI Scan &amp; Phát hiện</div>
              <div className="text-[11px] text-emerald-800">Mô hình AI Road-YOLOv9 đo đạc và gắn cờ khiếm khuyết</div>
            </div>
          </div>

          {/* Bước 2 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="w-6 h-6 rounded-full bg-brand-gold text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="font-bold text-amber-950">PM Thẩm định &amp; Lập Đề xuất</div>
              <div className="text-[11px] text-amber-800">Xác minh Bounding box, gộp đợt sửa chữa hoặc mở lệnh Fast Track</div>
            </div>
          </div>

          {/* Bước 3 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="font-bold text-blue-950">Supervisor Thẩm Duyệt Phương Án</div>
              <div className="text-[11px] text-blue-800">Duyệt từng hạng mục hoặc yêu cầu chỉnh sửa phương án kỹ thuật</div>
            </div>
          </div>

          {/* Bước 4 */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              4
            </div>
            <div>
              <div className="font-bold text-purple-950">Nghiệm Thu Bằng Chứng SHA-256</div>
              <div className="text-[11px] text-purple-800">Đối chiếu ảnh Trước/Sau và ký số đóng gói hồ sơ hoàn công</div>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET 3: TRẠNG THÁI HỆ THỐNG ÂM THANH & CẢNH BÁO */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-brand-gold" />
            <span className="font-bold text-sm">Hệ Thống Âm Thanh SLAAudio</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isAudioEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {isAudioEnabled ? 'Đang bật' : 'Tắt'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Tích hợp Web Audio API phát tiếng còi khẩn cấp và tiếng ping bàn giao độc lập ngoại tuyến.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onPlaySound('PING')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 text-brand-gold" />
            <span>Thử tiếng Ping</span>
          </button>
          <button
            type="button"
            onClick={() => onPlaySound('EMERGENCY')}
            className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-xs font-semibold text-red-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-900/60"
          >
            <Flame className="w-3 h-3 text-red-400" />
            <span>Thử còi khẩn</span>
          </button>
        </div>
      </div>
    </div>
  )
}
