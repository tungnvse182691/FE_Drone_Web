import React from 'react'
import { Volume2, X, Flame, Clock, Bell } from 'lucide-react'
import { AudioModeConfig } from './types'

interface AudioConfigModalProps {
  isOpen: boolean
  onClose: () => void
  isAudioEnabled: boolean
  onToggleAudioEnabled: () => void
  audioVolume: number
  onChangeAudioVolume: (volume: number) => void
  audioMode: AudioModeConfig
  onChangeAudioMode: (mode: AudioModeConfig) => void
  onPlaySound: (type: 'EMERGENCY' | 'SLA_WARNING' | 'PING') => void
  onSave: () => void
}

export const AudioConfigModal: React.FC<AudioConfigModalProps> = ({
  isOpen,
  onClose,
  isAudioEnabled,
  onToggleAudioEnabled,
  audioVolume,
  onChangeAudioVolume,
  audioMode,
  onChangeAudioMode,
  onPlaySound,
  onSave
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-slate-900 text-base">Cấu Hình Cảnh Báo Âm Thanh (SLAAudio)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Công tắc tổng */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 text-sm block">Bật còi &amp; chuông cảnh báo</span>
              <span className="text-slate-500 text-[11px]">Phát âm thanh tức thì khi có sự kiện bàn giao mới</span>
            </div>
            <button
              type="button"
              onClick={onToggleAudioEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAudioEnabled ? 'bg-brand-gold' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isAudioEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Slider Âm lượng */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Âm lượng phát:</span>
              <span className="font-bold text-[#8F7212] font-mono">{Math.round(audioVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={audioVolume}
              onChange={(e) => onChangeAudioVolume(parseFloat(e.target.value))}
              disabled={!isAudioEnabled}
              className="w-full accent-brand-gold cursor-pointer"
            />
          </div>

          {/* Tùy chọn từng kênh âm thanh */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 block">Kênh cảnh báo chuyên biệt:</span>

            {/* 1. Emergency Siren */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Còi khẩn cấp 24/7 (Siren)</div>
                  <div className="text-[10px] text-slate-500">Khi có lỗi sụt lún nguy hiểm hoặc SLA &lt; 2h</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPlaySound('EMERGENCY')}
                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-semibold text-[10px] cursor-pointer border border-red-200"
                >
                  Thử âm
                </button>
                <input
                  type="checkbox"
                  checked={audioMode.emergencySiren}
                  onChange={(e) => onChangeAudioMode({ ...audioMode, emergencySiren: e.target.checked })}
                  className="w-4 h-4 accent-brand-gold cursor-pointer"
                />
              </div>
            </div>

            {/* 2. SLA Warning Beep */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Cảnh báo vi phạm thời hạn SLA</div>
                  <div className="text-[10px] text-slate-500">Đứt quãng 3 tiếng khi hồ sơ sắp quá hạn duyệt</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPlaySound('SLA_WARNING')}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-md font-semibold text-[10px] cursor-pointer border border-amber-200"
                >
                  Thử âm
                </button>
                <input
                  type="checkbox"
                  checked={audioMode.slaChime}
                  onChange={(e) => onChangeAudioMode({ ...audioMode, slaChime: e.target.checked })}
                  className="w-4 h-4 accent-brand-gold cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Handover Ping */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-gold shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">Chuông Ping bàn giao công việc</div>
                  <div className="text-[10px] text-slate-500">Âm dịu nhẹ khi PM hoặc Supervisor gửi hồ sơ</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPlaySound('PING')}
                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-[#8F7212] rounded-md font-semibold text-[10px] cursor-pointer border border-amber-200"
                >
                  Thử âm
                </button>
                <input
                  type="checkbox"
                  checked={audioMode.handoverPing}
                  onChange={(e) => onChangeAudioMode({ ...audioMode, handoverPing: e.target.checked })}
                  className="w-4 h-4 accent-brand-gold cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 bg-brand-gold hover:bg-[#B38E1F] text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  )
}
