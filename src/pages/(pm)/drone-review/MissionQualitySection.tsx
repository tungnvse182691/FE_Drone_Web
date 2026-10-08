import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface MissionQualitySectionProps {
  coveragePercentage: number
  hasBlindspot: boolean
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
}

export const MissionQualitySection: React.FC<MissionQualitySectionProps> = ({
  coveragePercentage,
  hasBlindspot,
  setCurrentFrame,
  showToast
}) => {
  const isCoveragePassed = coveragePercentage >= 95

  return (
    <section className="bg-white border border-[#E2E5E9] rounded-xl p-3 shadow-2xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Chỉ số 1: Tỷ lệ phủ trắc địa */}
        <div className="flex flex-col gap-1 pr-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Độ phủ trắc địa
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCoveragePassed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isCoveragePassed ? 'ĐẠT' : 'CẢNH BÁO'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1A1D20] font-mono">
              {coveragePercentage}%
            </span>
            <span className="text-xs text-slate-400">/ chuẩn ≥ 95%</span>
          </div>
          {hasBlindspot ? (
            <button
              type="button"
              onClick={() => {
                setCurrentFrame(1680)
                showToast('Đã định vị khung hình đến điểm thiếu độ phủ tại Km 1027+100')
              }}
              className="text-[11px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 text-left cursor-pointer hover:underline"
            >
              <Icon name="warning" size={13} className="text-amber-600 shrink-0" />
              <span>Điểm mù: Km 1027+100 (Xem)</span>
            </button>
          ) : (
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <Icon name="check_circle" size={13} />
              <span>Đã phủ kín toàn tuyến</span>
            </span>
          )}
        </div>

        {/* Chỉ số 2: Độ lệch tim bay */}
        <div className="flex flex-col gap-1 pt-2 md:pt-0 pl-0 md:pl-3 pr-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Hành lang bay
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              HỢP LỆ
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1A1D20] font-mono">0.85 m</span>
            <span className="text-xs text-slate-400">lệch tim (&lt; 1.2m)</span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Icon name="check" size={13} className="text-emerald-600 shrink-0" />
            <span>Góc chụp 90° chuẩn</span>
          </span>
        </div>

        {/* Chỉ số 3: Tín hiệu trắc địa RTK */}
        <div className="flex flex-col gap-1 pt-2 md:pt-0 pl-0 md:pl-3 pr-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Đồng bộ RTK
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              100% FIX
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1A1D20] font-mono">1,920</span>
            <span className="text-xs text-slate-400">khung ảnh định vị</span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Icon name="sync" size={13} className="text-slate-400 shrink-0" />
            <span>Tần số trắc địa 10Hz</span>
          </span>
        </div>

        {/* Chỉ số 4: Tiến độ nhận diện AI */}
        <div className="flex flex-col gap-1 pt-2 md:pt-0 pl-0 md:pl-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Nhận diện AI
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              74%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1A1D20] font-mono">1,420</span>
            <span className="text-xs text-slate-400">/ 1,920 khung hình</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
            <div className="bg-[#C9A227] h-full rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>
      </div>
    </section>
  )
}
