import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockDefects } from '../../api/mock/data'
import { DefectStatus, Severity } from '../../types/enums'
import { ArrowLeft, CheckCircle2, XCircle, SplitSquareHorizontal, Layers, Ruler, MapPin } from 'lucide-react'

export const DefectDetailVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Tìm defect theo param hoặc mặc định lấy phần tử đầu
  const defect = mockDefects.find((d) => d.id === id) || mockDefects[0]

  // Tab chuyển đổi: 'SINGLE' (Màn 08 - Thẩm định Bounding box) hoặc 'TEMPORAL' (Màn 09 - So sánh đa kỳ)
  const [viewMode, setViewMode] = useState<'SINGLE' | 'TEMPORAL'>('SINGLE')
  const [severity, setSeverity] = useState<Severity>(defect.severity)
  const [status, setStatus] = useState<DefectStatus>(defect.status)
  const [notes, setNotes] = useState('Đã đối chiếu với kích thước thước đo thực tế')

  const handleVerify = (newStatus: DefectStatus) => {
    setStatus(newStatus)
    defect.status = newStatus
    defect.severity = severity
    alert(`Đã cập nhật trạng thái lỗi thành: ${newStatus}`)
    navigate('/pm/ai-inbox')
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pm/ai-inbox')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
                Thẩm Định Chi Tiết Hư Hỏng: {defect.code}
              </h1>
              <StatusBadge status={defect.status} />
              <StatusBadge status={severity} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lý trình: Km{defect.chainage_km} • Tọa độ GPS: ({defect.gps_lat}, {defect.gps_lng})
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Verify A vs Verify B */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('SINGLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'SINGLE'
                ? 'bg-white text-brand-dark shadow-xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Màn 08: Xem Đơn Kỳ (Bounding Box)
          </button>
          <button
            onClick={() => setViewMode('TEMPORAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'TEMPORAL'
                ? 'bg-white text-brand-goldDark shadow-xs'
                : 'text-slate-600 hover:text-brand-dark'
            }`}
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
            Màn 09: So Sánh Đa Kỳ (Trước/Sau)
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Photo Viewer, Right is Verification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns on Desktop */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {viewMode === 'SINGLE' ? (
              /* Single View with Bounding Box Overlay */
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Ảnh Chụp Drone (RGB / Hồng Ngoại Độ Phân Giải Cao)</span>
                  <span className="text-brand-goldDark font-bold">
                    Khung phát hiện AI (Confidence: {(defect.confidence_score * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                  <img
                    src={defect.image_url}
                    alt={defect.code}
                    className="w-full h-full object-cover"
                  />
                  {/* Simulated Bounding Box */}
                  <div
                    className="absolute border-2 border-brand-gold bg-brand-gold/15 rounded-sm pointer-events-none flex flex-col justify-between p-1"
                    style={{
                      left: `${defect.bounding_box.x * 100}%`,
                      top: `${defect.bounding_box.y * 100}%`,
                      width: `${defect.bounding_box.width * 100}%`,
                      height: `${defect.bounding_box.height * 100}%`,
                    }}
                  >
                    <span className="bg-brand-gold text-white text-[10px] font-bold px-1 py-0.5 rounded w-max">
                      {defect.defect_type} ({(defect.confidence_score * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Temporal Multi-Epoch Comparison (Verify B) */
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>So Sánh Đa Kỳ: Kỳ Trước vs Kỳ Hiện Tại</span>
                  <span className="text-rose-600 font-bold">Tốc độ mở rộng vết nứt: +18%</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">Kỳ Khảo Sát Trước (Tháng 06/2026)</span>
                    <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
                      <img
                        src={defect.previous_epoch_image_url || defect.image_url}
                        alt="Kỳ trước"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-brand-goldDark">Kỳ Khảo Sát Này (Tháng 10/2026)</span>
                    <div className="rounded-lg overflow-hidden border-2 border-brand-gold aspect-video bg-black">
                      <img
                        src={defect.image_url}
                        alt="Kỳ này"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Verification Form */}
        <div className="space-y-4">
          <Card title="Xác Minh & Thẩm Định Hư Hỏng">
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mức Độ Nghiêm Trọng (Severity)
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium"
                >
                  <option value={Severity.CRITICAL}>CRITICAL — Đặc biệt khẩn cấp</option>
                  <option value={Severity.HIGH}>HIGH — Nghiêm trọng</option>
                  <option value={Severity.MEDIUM}>MEDIUM — Trung bình</option>
                  <option value={Severity.LOW}>LOW — Nhẹ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Chiều dài ước lượng:</span>
                  <div className="font-bold text-sm text-brand-dark">{defect.length_m || 1.2} mét</div>
                </div>
                <div>
                  <span className="text-slate-500">Chiều rộng ước lượng:</span>
                  <div className="font-bold text-sm text-brand-dark">{defect.width_m || 0.8} mét</div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ý Kiến Thẩm Định Của PM
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="Ghi chú đánh giá hư hỏng..."
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Button
                  onClick={() => handleVerify(DefectStatus.VERIFIED)}
                  className="w-full"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Xác Nhận Hư Hỏng Thực Tế (VERIFIED)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify(DefectStatus.REJECTED)}
                  className="w-full text-brand-error border-rose-200 hover:bg-rose-50"
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Từ Chối / Báo Giả (REJECTED)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
