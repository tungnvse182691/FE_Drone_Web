import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockWorkOrders } from '../../api/mock/data'
import { CheckCircle2, Image as ImageIcon, Send } from 'lucide-react'

export const WorkOrderConfirm: React.FC = () => {
  const wo = mockWorkOrders[0]

  const handleConfirm = () => {
    alert('Đã xác nhận hoàn thành thi công! Hệ thống chuyển tiếp yêu cầu nghiệm thu đến Giám sát.')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Màn 17: Xác Nhận Hoàn Thành Thi Công & Mời Nghiệm Thu
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          PM kiểm tra hình ảnh và biên bản tự nghiệm thu từ Đội sửa chữa trước khi mời Chủ đầu tư / Giám sát
        </p>
      </div>

      <Card title={`Lệnh Công Tác: ${wo.code}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500">Thuộc đợt sửa chữa:</span>
              <div className="font-bold text-brand-dark">{wo.batch_code}</div>
            </div>
            <div>
              <span className="text-slate-500">Đơn vị thi công:</span>
              <div className="font-bold text-brand-dark">{wo.assigned_crew_name}</div>
            </div>
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Đối Chiếu Ảnh Hiện Trường Thi Công
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Ảnh Trước Thi Công (Chụp từ Drone):</span>
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black">
                  <img src={wo.before_photo_url} alt="Trước thi công" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500">Ảnh Sau Khi Đội Thi Công Hoàn Thành:</span>
                <div className="aspect-video rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 flex items-center justify-center text-white text-xs">
                  <span>Ảnh nghiệm thu thảm mặt đường mới</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-slate-700">Ghi chú từ đội trưởng thi công:</span>
            <p className="text-slate-600">{wo.crew_notes}</p>
          </div>

          <Button onClick={handleConfirm} className="w-full" size="lg" icon={<Send className="w-4 h-4" />}>
            Xác Nhận Đạt Yêu Cầu & Mời Giám Sát Nghiệm Thu
          </Button>
        </div>
      </Card>
    </div>
  )
}
