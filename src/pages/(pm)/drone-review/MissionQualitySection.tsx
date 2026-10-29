import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface MissionQualitySectionProps {
  coveragePercentage: number
  hasBlindspot: boolean
  setCurrentFrame: (f: number) => void
  showToast: (msg: string) => void
  totalPhotos?: number
  aiDetectionsCount?: number
  reviewedCount?: number
  totalCount?: number
  approvedCount?: number
  rejectedCount?: number
  pendingCount?: number
  reviewProgressPercent?: number
  isBaselineLocked?: boolean
}

export const MissionQualitySection: React.FC<MissionQualitySectionProps> = ({
  aiDetectionsCount = 0,
  reviewedCount = 0,
  totalCount = 0,
  approvedCount = 0,
  rejectedCount = 0,
  pendingCount = 0,
  reviewProgressPercent = 0,
  isBaselineLocked = false
}) => {
  return (
    <section className="bg-white border border-[#E2E5E9] rounded-xl p-3 shadow-2xs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Chỉ số 1: Mô hình nhận diện AI */}
        <div className="flex flex-col gap-1 pr-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Mô hình nhận diện
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              YOLOv9
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1A1D20] font-mono">Road-YOLOv9</span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Icon name="memory" size={13} className="text-[#C9A227] shrink-0" />
            <span>Phiên bản: synthetic-road-v1</span>
          </span>
        </div>

        {/* Chỉ số 2: Tiến độ thẩm định AI */}
        <div className="flex flex-col gap-1 pt-2 md:pt-0 pl-0 md:pl-3 pr-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Tiến độ thẩm định
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                pendingCount === 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {pendingCount === 0 ? 'HOÀN TẤT' : 'ĐANG RÀ SOÁT'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#1A1D20] font-mono">
              {reviewedCount} / {totalCount}
            </span>
            <span className="text-xs text-slate-400">mục ({reviewProgressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
            <div
              className="bg-[#C9A227] h-full rounded-full transition-all"
              style={{ width: `${reviewProgressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Chỉ số 3: Phân loại kết quả */}
        <div className="flex flex-col gap-1 pt-2 md:pt-0 pl-0 md:pl-3 pr-0 md:pr-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Phân loại kết quả
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount} PHÁT HIỆN
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-700">Hợp lệ: {approvedCount}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-sm font-bold text-slate-600">Báo sai: {rejectedCount}</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <Icon name="pending" size={13} className="text-amber-600 shrink-0" />
            <span>Chờ duyệt: {pendingCount} mục</span>
          </span>
        </div>

        {/* Chỉ số 4: Mốc Baseline công trình */}
        <div className="flex flex-col gap-1 pt-2 md:pt-0 pl-0 md:pl-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Mốc Baseline
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isBaselineLocked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isBaselineLocked ? 'ĐÃ KHÓA' : 'CHƯA KHÓA'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-[#1A1D20]">
              {isBaselineLocked ? 'Đã chốt Baseline số' : 'Chờ PM khóa mốc'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Icon
              name={isBaselineLocked ? 'verified' : 'info'}
              size={13}
              className={isBaselineLocked ? 'text-emerald-600' : 'text-slate-400'}
            />
            <span>{isBaselineLocked ? 'Đã lưu mốc bảo hành CSDL' : 'Cần thẩm định 100% để chốt'}</span>
          </span>
        </div>
      </div>
    </section>
  )
}
