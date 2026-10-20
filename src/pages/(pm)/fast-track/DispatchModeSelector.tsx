import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { WorkMode } from './types'

export interface DispatchModeSelectorProps {
  workMode: WorkMode
  selectedDefectIds: string[]
  handleChangeWorkMode: (mode: WorkMode) => void
  isSupervisor?: boolean
}

export const DispatchModeSelector: React.FC<DispatchModeSelectorProps> = ({
  workMode,
  selectedDefectIds,
  handleChangeWorkMode,
  isSupervisor = false
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
        {isSupervisor ? 'Phân loại luồng xử lý hiện trường (Chế độ giám sát)' : 'Chế độ giao việc'}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tab 1: Gom lô đo đạc (MEASURE_ONLY) */}
        <div
          onClick={() => handleChangeWorkMode('MEASURE_ONLY')}
          style={{
            border: `1.5px solid ${workMode === 'MEASURE_ONLY' ? '#C9A227' : '#E5D8B4'}`,
            background: workMode === 'MEASURE_ONLY'
              ? 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)'
              : '#ffffff',
            boxShadow: workMode === 'MEASURE_ONLY'
              ? '0 12px 28px rgba(201, 162, 39, 0.15)'
              : '0 1px 3px rgba(0,0,0,0.04)'
          }}
          className={`relative cursor-pointer flex flex-col justify-between rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
            workMode === 'MEASURE_ONLY' ? '-translate-y-1' : ''
          }`}
        >
          {/* 4px top gradient */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #C9A227 0%, #8C6D1F 100%)' }}
          />

          <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
                    <span className="absolute inset-0 rounded-full bg-[#C9A227]/20" />
                  </div>
                  <span className="font-bold text-sm text-[#1A1D20]">Gom lô đo đạc</span>
                </div>
                <span className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#FFFDF5] text-[#8C6D1F] border border-[#E5D8B4]">
                  {isSupervisor ? 'Luồng tiêu chuẩn' : `Đã chọn ${selectedDefectIds.length} lỗi`}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gom nhiều khiếm khuyết cùng tuyến để đội Crew đo 1 lượt, nghiêm cấm tự ý sửa khi chưa lập phương án.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-slate-100 text-[#8F7212]">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[10px] font-bold">
                Chỉ đo đạc
              </span>
              <span className="w-4 h-4 rounded-full border-2 border-[#C9A227] flex items-center justify-center">
                {workMode === 'MEASURE_ONLY' && <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>}
              </span>
            </div>
          </div>
        </div>

        {/* Tab 2: Đo và Sửa ngay (INSPECT_AND_REPAIR) */}
        <div
          onClick={() => handleChangeWorkMode('INSPECT_AND_REPAIR')}
          style={{
            border: `1.5px solid ${workMode === 'INSPECT_AND_REPAIR' ? '#047857' : '#A7C4B8'}`,
            background: workMode === 'INSPECT_AND_REPAIR'
              ? 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)'
              : '#ffffff',
            boxShadow: workMode === 'INSPECT_AND_REPAIR'
              ? '0 12px 28px rgba(4, 120, 87, 0.15)'
              : '0 1px 3px rgba(0,0,0,0.04)'
          }}
          className={`relative cursor-pointer flex flex-col justify-between rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
            workMode === 'INSPECT_AND_REPAIR' ? '-translate-y-1' : ''
          }`}
        >
          {/* 4px top gradient */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #047857 0%, #065F46 100%)' }}
          />

          <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#047857]" />
                    <span className="absolute inset-0 rounded-full bg-[#047857]/20" />
                  </div>
                  <span className="font-bold text-sm text-[#1A1D20]">Đo và Sửa ngay</span>
                </div>
                <span className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#F0FDF7] text-[#047857] border border-[#A7C4B8]">
                  Xử lý nhanh trực tiếp
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chỉ áp dụng cho 1 lỗi mức Thấp đơn lẻ thỏa mãn chính sách xử lý nhanh. Cho phép mang vật liệu vá nguội trực tiếp.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-slate-100 text-[#047857]">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold">
                Kiểm tra và sửa
              </span>
              <span className="w-4 h-4 rounded-full border-2 border-[#047857] flex items-center justify-center">
                {workMode === 'INSPECT_AND_REPAIR' && <span className="w-2 h-2 rounded-full bg-[#047857]"></span>}
              </span>
            </div>
          </div>
        </div>

        {/* Tab 3: Xử lý khẩn cấp (EMERGENCY) */}
        <div
          onClick={() => handleChangeWorkMode('EMERGENCY')}
          style={{
            border: `1.5px solid ${workMode === 'EMERGENCY' ? '#B91C1C' : '#E6A8A8'}`,
            background: workMode === 'EMERGENCY'
              ? 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)'
              : '#ffffff',
            boxShadow: workMode === 'EMERGENCY'
              ? '0 12px 28px rgba(185, 28, 28, 0.15)'
              : '0 1px 3px rgba(0,0,0,0.04)'
          }}
          className={`relative cursor-pointer flex flex-col justify-between rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
            workMode === 'EMERGENCY' ? '-translate-y-1' : ''
          }`}
        >
          {/* 4px top gradient */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #B91C1C 0%, #7F1D1D 100%)' }}
          />

          <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]" />
                    <span className="absolute inset-0 rounded-full bg-[#B91C1C]/20" />
                  </div>
                  <span className="font-bold text-sm text-[#1A1D20]">Xử lý khẩn cấp</span>
                </div>
                <span className="px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#E6A8A8]">
                  Ưu tiên 24/7
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khắc phục tạm thời để thông xe nhanh, phân luồng an toàn khẩn cấp, không đóng lỗi gốc trên hệ thống.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-3 border-t border-slate-100 text-[#B91C1C]">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-[10px] font-bold">
                Điều động khẩn cấp
              </span>
              <span className="w-4 h-4 rounded-full border-2 border-[#B91C1C] flex items-center justify-center">
                {workMode === 'EMERGENCY' && <span className="w-2 h-2 rounded-full bg-[#B91C1C]"></span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
