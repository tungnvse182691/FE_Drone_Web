import React from 'react'
import {
  Cpu,
  CheckCircle2,
  History
} from 'lucide-react'

export const AIModelsTab: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Cột trái: Mô hình đang chạy chính thức */}
      <div className="lg:col-span-6 bg-white border border-brand-border rounded-xl shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-gold text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#151C27]">
                Mô hình AI đang chạy (Road AI Engine)
              </h3>
              <p className="text-xs text-[#555F6F]">Phân loại &amp; đo lường vết nứt mặt đường theo thời gian thực</p>
            </div>
          </div>
          <span className="px-3 py-0.5 rounded-full text-white font-mono text-[11px] font-bold bg-brand-gold">
            LIVE
          </span>
        </div>

        <div className="p-4 rounded-xl bg-brand-surfaceAlt border border-brand-border space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-sm text-[#151C27]">Road-YOLOv9-Civil-Edge</span>
              <span className="font-mono text-xs font-semibold text-[#555F6F] ml-2">
                v2.4.1-prod
              </span>
            </div>
            <span className="text-xs text-[#555F6F]">Triển khai: 10/08/2026</span>
          </div>

          {/* 3 Chỉ số kiểm định chất lượng AI */}
          <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
            <div className="p-3 rounded-lg bg-white border border-brand-border shadow-sm">
              <span className="text-[11px] text-[#555F6F] block">Độ chính xác mAP@50</span>
              <span className="text-xl font-bold text-brand-gold font-mono">92.4%</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-brand-border shadow-sm">
              <span className="text-[11px] text-[#555F6F] block">Độ nhạy Recall</span>
              <span className="text-xl font-bold text-[#695587] font-mono">89.6%</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-brand-border shadow-sm">
              <span className="text-[11px] text-[#555F6F] block">F1-Score</span>
              <span className="text-xl font-bold text-[#151C27] font-mono">0.91</span>
            </div>
          </div>

          {/* Công tắc Fast Track tự động */}
          <div className="flex items-center justify-between pt-2 border-t border-brand-border">
            <div className="space-y-0.5">
              <span className="font-semibold text-xs text-[#151C27] block">
                Tự động phân loại nhanh Fast-Track (&lt; 5cm)
              </span>
              <span className="text-[11px] text-[#555F6F] block">
                Bỏ qua duyệt thủ công các vết nứt chân chim nhẹ theo FR-18
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-10 h-5 bg-[#DCE2F3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
            </label>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#555F6F] flex items-center justify-between">
          <span>Model weights SHA256: <code className="text-[#151C27]">8f3a9e...c701</code></span>
          <span className="text-[#059669] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Kiểm định đạt chuẩn FR-36
          </span>
        </div>
      </div>

      {/* Cột phải: Lịch sử các phiên bản tiền nhiệm */}
      <div className="lg:col-span-6 bg-white border border-brand-border rounded-xl shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#555F6F]" />
            <h3 className="text-sm font-bold text-[#151C27]">
              Lịch sử phiên bản mô hình AI (Model Versioning)
            </h3>
          </div>
          <span className="text-xs text-[#555F6F] font-medium">Bảo tồn kết quả cũ (FR-36)</span>
        </div>

        <p className="text-xs text-[#555F6F] leading-relaxed">
          Theo quy định <strong>FR-36</strong>: Khi cập nhật mô hình mới, các phát hiện nứt lún cũ vẫn giữ nguyên vẹn phiên bản mô hình đã dùng tại thời điểm phân tích, tuyệt đối không tính toán ngược làm sai lệch hồ sơ hoàn công.
        </p>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-brand-surfaceAlt border border-brand-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#151C27]">Road-YOLOv8-Baseline</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F0F2F5] text-[#555F6F]">
                  v1.2.0-legacy
                </span>
              </div>
              <div className="text-[11px] text-[#555F6F] mt-1">
                mAP@50: 84.1% • Triển khai: 15/01/2026 • Trọng số: 2e90f8...316d
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F0F2F5] text-[#555F6F] font-mono text-[10px] font-semibold">
              DEPRECATED
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
