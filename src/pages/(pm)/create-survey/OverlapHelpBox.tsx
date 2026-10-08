import React from 'react'
import { Icon } from '../../../components/ui/Icon'

export const OverlapHelpBox: React.FC = () => {
  return (
    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-slate-700 leading-relaxed space-y-1.5 animate-in fade-in duration-200">
      <div className="font-bold text-[#8F7212] flex items-center gap-1.5">
        <Icon name="photo_camera" size={16} className="text-[#C9A227]" />
        <span>Nguyên lý trắc địa ảnh UAV & Bóc tách hư hỏng AI:</span>
      </div>
      <p>
        • <strong>Độ phủ dọc (Forward Lap):</strong> Tỷ lệ phần trăm bức ảnh chụp sau đè lên bức ảnh chụp trước theo chiều tiến của drone (ví dụ 80%).
      </p>
      <p>
        • <strong>Độ phủ ngang (Side Lap):</strong> Tỷ lệ phần trăm diện tích đè lên nhau giữa hai đường bay song song (ví dụ 70%).
      </p>
      <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-amber-100">
        ⚡ <strong>Tại sao AI bắt buộc cần 80%/70%?</strong> Thuật toán SfM cần mỗi điểm trên mặt đường xuất hiện ở ít nhất 4–5 góc nhìn khác nhau để ghép thành một tấm ảnh trực giao không méo góc, giúp AI nhận dạng vết nứt chân chim 1mm mà không bị mù điểm ảnh.
      </p>
    </div>
  )
}
