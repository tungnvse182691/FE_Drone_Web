import React from 'react'
import { Layers, Wrench, Flame } from 'lucide-react'
import { WorkMode } from './types'

export interface DispatchModeSelectorProps {
  workMode: WorkMode
  selectedDefectIds: string[]
  handleChangeWorkMode: (mode: WorkMode) => void
}

export const DispatchModeSelector: React.FC<DispatchModeSelectorProps> = ({
  workMode,
  selectedDefectIds,
  handleChangeWorkMode
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
        Chế độ giao việc (Work Dispatch Mode)
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tab 1: Gom lô đo đạc (MEASURE_ONLY) */}
        <label
          onClick={() => handleChangeWorkMode('MEASURE_ONLY')}
          className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
            workMode === 'MEASURE_ONLY'
              ? 'bg-amber-50/50 border-2 border-brand-gold shadow-xs'
              : 'bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-brand-gold">
                <Layers className="w-5 h-5 text-brand-gold" />
              </span>
              <span className="font-bold text-sm text-brand-dark">Gom lô đo đạc</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-gold text-white">
              Đã chọn {selectedDefectIds.length} lỗi
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Gom nhiều khiếm khuyết cùng tuyến để đội Crew đo 1 lượt, nghiêm cấm tự ý sửa khi chưa lập phương án.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-[#8F7212]">
            <span className="px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200 text-[10px]">
              MEASURE_ONLY
            </span>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-brand-gold flex items-center justify-center">
              {workMode === 'MEASURE_ONLY' && <span className="w-2 h-2 rounded-full bg-brand-gold"></span>}
            </span>
          </div>
        </label>

        {/* Tab 2: Đo và Sửa ngay (INSPECT_AND_REPAIR) */}
        <label
          onClick={() => handleChangeWorkMode('INSPECT_AND_REPAIR')}
          className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
            workMode === 'INSPECT_AND_REPAIR'
              ? 'bg-emerald-50/60 border-2 border-emerald-600 shadow-xs'
              : 'bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-brand-dark">Đo và Sửa ngay</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Fast Track Direct
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Chỉ áp dụng cho 1 lỗi mức LOW đơn lẻ thỏa mãn policy Fast Track. Cho phép mang vật liệu vá nguội trực tiếp.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-emerald-700">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[10px]">
              INSPECT_AND_REPAIR
            </span>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
              {workMode === 'INSPECT_AND_REPAIR' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
            </span>
          </div>
        </label>

        {/* Tab 3: Xử lý khẩn cấp (EMERGENCY) */}
        <label
          onClick={() => handleChangeWorkMode('EMERGENCY')}
          className={`relative cursor-pointer flex flex-col justify-between p-4 rounded-xl transition-all ${
            workMode === 'EMERGENCY'
              ? 'bg-rose-50/60 border-2 border-rose-600 shadow-xs'
              : 'bg-white hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-sm text-brand-dark">Xử lý khẩn cấp</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              24/7 Priority
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Khắc phục tạm thời để thông xe nhanh, phân luồng an toàn khẩn cấp, không đóng lỗi gốc trên hệ thống.
          </p>
          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 text-rose-700">
            <span className="px-2 py-0.5 rounded-full bg-rose-100/80 border border-rose-200 text-[10px]">
              EMERGENCY_DISPATCH
            </span>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-rose-600 flex items-center justify-center">
              {workMode === 'EMERGENCY' && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
            </span>
          </div>
        </label>
      </div>
    </div>
  )
}
