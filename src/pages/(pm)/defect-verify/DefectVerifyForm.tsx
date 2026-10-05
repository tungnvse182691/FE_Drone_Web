import React from 'react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Defect } from '../../../types/domain'
import { DefectStatus, Severity } from '../../../types/enums'

interface DefectVerifyFormProps {
  defect: Defect
  severity: Severity
  setSeverity: (val: Severity) => void
  notes: string
  setNotes: (val: string) => void
  onVerify: (status: DefectStatus) => void
}

export const DefectVerifyForm: React.FC<DefectVerifyFormProps> = ({
  defect,
  severity,
  setSeverity,
  notes,
  setNotes,
  onVerify
}) => {
  return (
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
            onClick={() => onVerify(DefectStatus.VERIFIED)}
            className="w-full"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Xác Nhận Hư Hỏng Thực Tế (VERIFIED)
          </Button>
          <Button
            variant="outline"
            onClick={() => onVerify(DefectStatus.REJECTED)}
            className="w-full text-brand-error border-rose-200 hover:bg-rose-50"
            icon={<XCircle className="w-4 h-4" />}
          >
            Từ Chối / Báo Giả (REJECTED)
          </Button>
        </div>
      </div>
    </Card>
  )
}
