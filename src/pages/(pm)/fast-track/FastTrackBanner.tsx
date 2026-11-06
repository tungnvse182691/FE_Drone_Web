import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export const FastTrackBanner: React.FC = () => <section className="rounded-[20px] overflow-hidden relative shadow-2xs border border-[#E3D28A] bg-gradient-to-b from-[#FFFDF5] to-white">
  <div className="h-1 w-full bg-gradient-to-r from-[#C9A227] to-amber-600" /><div className="p-4 sm:p-5 flex items-start gap-3.5"><Icon name="assignment" size={22} className="text-[#C9A227] shrink-0" /><div><h2 className="font-bold text-sm text-[#1A1D20]">Hồ sơ nguồn &amp; Điều kiện xử lý</h2><p className="text-xs text-slate-600 mt-2">Chưa cập nhật</p><p className="text-xs text-slate-500 mt-1">Chỉ đối chiếu hồ sơ và điều kiện được xác nhận trên máy chủ; không tự chọn hoặc giao việc từ hộp thư.</p></div></div>
</section>
