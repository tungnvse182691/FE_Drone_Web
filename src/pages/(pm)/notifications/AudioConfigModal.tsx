import React from 'react'
import { X, Flame, Clock, Bell } from 'lucide-react'
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
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
        {/* 1. Tiêu đề modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-[18px] font-extrabold text-slate-900">
            Cấu Hình Cảnh Báo Âm Thanh
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 2. Hàng toggle "Bật còi & chuông cảnh báo" */}
          <div className="flex items-center justify-between p-[16px_20px] rounded-[16px] bg-[#F9FAFB] border border-[#F3F4F6]">
            <div>
              <span className="font-bold text-slate-800 text-sm block">
                Bật còi &amp; chuông cảnh báo
              </span>
              <span className="text-[12px] text-[#6B7280]">
                Phát âm thanh tức thì khi có sự kiện bàn giao mới
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleAudioEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAudioEnabled ? 'bg-[#C9A227]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  isAudioEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Thanh trượt âm lượng */}
          <div className="space-y-2 p-[16px_20px] rounded-[16px] bg-[#F9FAFB] border border-[#F3F4F6]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-xs">Âm lượng phát:</span>
              <span className="font-bold text-[#8C6D1F] font-mono text-sm">
                {Math.round(audioVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={audioVolume}
              onChange={(e) => onChangeAudioVolume(parseFloat(e.target.value))}
              disabled={!isAudioEnabled}
              style={{
                background: `linear-gradient(to right, #C9A227 0%, #B8941F ${audioVolume * 100}%, #E5E7EB ${audioVolume * 100}%, #E5E7EB 100%)`
              }}
              className="w-full h-[6px] rounded-[6px] appearance-none cursor-pointer accent-[#C9A227] disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#C9A227] [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
            />
          </div>

          {/* 4. Danh sách kênh cảnh báo (3 mục) */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-700 text-xs block">
              Kênh cảnh báo chuyên biệt:
            </span>

            {/* 1. Emergency Siren */}
            <div className="flex items-center justify-between p-4 rounded-[16px] border border-[#EDEFF2] bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#FEE2E2] flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-[#DC2626]" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-slate-800">Còi khẩn cấp 24/7</div>
                  <div className="text-[12px] text-[#6B7280]">
                    Khi có lỗi sụt lún nguy hiểm hoặc SLA &lt; 2h
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onPlaySound('EMERGENCY')}
                  className="px-[14px] py-[8px] bg-white hover:border-[#C9A227] hover:text-[#C9A227] text-slate-700 rounded-[10px] font-semibold text-[12px] cursor-pointer border border-[#E2E5E9] transition-colors"
                >
                  Thử âm
                </button>
                <input
                  type="checkbox"
                  checked={audioMode.emergencySiren}
                  onChange={(e) =>
                    onChangeAudioMode({ ...audioMode, emergencySiren: e.target.checked })
                  }
                  className="w-4 h-4 rounded-[6px] accent-[#C9A227] cursor-pointer"
                />
              </div>
            </div>

            {/* 2. SLA Warning Beep */}
            <div className="flex items-center justify-between p-4 rounded-[16px] border border-[#EDEFF2] bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#D97706]" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-slate-800">
                    Cảnh báo vi phạm thời hạn SLA
                  </div>
                  <div className="text-[12px] text-[#6B7280]">
                    Đứt quãng 3 tiếng khi hồ sơ sắp quá hạn duyệt
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onPlaySound('SLA_WARNING')}
                  className="px-[14px] py-[8px] bg-white hover:border-[#C9A227] hover:text-[#C9A227] text-slate-700 rounded-[10px] font-semibold text-[12px] cursor-pointer border border-[#E2E5E9] transition-colors"
                >
                  Thử âm
                </button>
                <input
                  type="checkbox"
                  checked={audioMode.slaChime}
                  onChange={(e) =>
                    onChangeAudioMode({ ...audioMode, slaChime: e.target.checked })
                  }
                  className="w-4 h-4 rounded-[6px] accent-[#C9A227] cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Handover Ping */}
            <div className="flex items-center justify-between p-4 rounded-[16px] border border-[#EDEFF2] bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#FEF9E7] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-slate-800">
                    Chuông Ping bàn giao công việc
                  </div>
                  <div className="text-[12px] text-[#6B7280]">
                    Âm dịu nhẹ khi PM hoặc Supervisor gửi hồ sơ
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onPlaySound('PING')}
                  className="px-[14px] py-[8px] bg-white hover:border-[#C9A227] hover:text-[#C9A227] text-slate-700 rounded-[10px] font-semibold text-[12px] cursor-pointer border border-[#E2E5E9] transition-colors"
                >
                  Thử âm
                </button>
                <input
                  type="checkbox"
                  checked={audioMode.handoverPing}
                  onChange={(e) =>
                    onChangeAudioMode({ ...audioMode, handoverPing: e.target.checked })
                  }
                  className="w-4 h-4 rounded-[6px] accent-[#C9A227] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Nút "Lưu cấu hình" */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onSave}
            className="px-[32px] py-[14px] rounded-[14px] bg-[linear-gradient(135deg,#C9A227_0%,#B8941F_100%)] text-white font-bold text-xs hover:shadow-[0_4px_12px_rgba(201,162,39,0.3)] transition-all cursor-pointer"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  )
}
