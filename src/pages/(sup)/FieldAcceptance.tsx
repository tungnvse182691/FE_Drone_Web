import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockDefects } from '../../api/mock/data'
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react'

export const FieldAcceptance: React.FC = () => {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Màn 16: Nghiệm Thu Chất Lượng Thi Công Hiện Trường
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chủ đầu tư / Giám sát kiểm tra đối chiếu ảnh trước & sau thi công để đánh giá chất lượng hoàn thiện
        </p>
      </div>

      <Card title="Danh Sách Vị Trí Cần Nghiệm Thu">
        <div className="space-y-6">
          {mockDefects.slice(0, 1).map((def) => (
            <div key={def.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-brand-dark">{def.code}</span>
                  <span className="text-xs text-slate-500 ml-2">Lý trình: Km{def.chainage_km}</span>
                </div>
                <StatusBadge status={accepted ? 'PASSED' : 'PENDING_APPROVAL'} label={accepted ? 'Đã Nghiệm Thu Đạt' : 'Chờ Nghiệm Thu'} />
              </div>

              {/* Side-by-side Inspection Images */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600">1. Ảnh Hư Hỏng Ban Đầu:</span>
                  <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-black">
                    <img src={def.image_url} alt="Hư hỏng ban đầu" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-emerald-700">2. Ảnh Sau Thi Công Vá Thảm:</span>
                  <div className="aspect-video rounded-lg overflow-hidden border-2 border-emerald-500 bg-slate-800 flex items-center justify-center text-white text-xs">
                    <span>Ảnh thảm nhựa mới hoàn thiện, bằng phẳng, thoát nước tốt</span>
                  </div>
                </div>
              </div>

              {/* Acceptance Controls */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => alert('Đã ghi nhận yêu cầu sửa chữa lại (REVISION_REQUIRED_WORK)!')}
                  className="text-brand-error border-rose-200"
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Không Đạt (Yêu Cầu Làm Lại)
                </Button>
                <Button
                  onClick={() => {
                    setAccepted(true)
                    alert('Nghiệm thu ĐẠT yêu cầu kỹ thuật!')
                  }}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Nghiệm Thu ĐẠT (PASSED)
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
