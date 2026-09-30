import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { mockRepairBatches } from '../../api/mock/data'
import { FileSignature, Download, CheckCircle2 } from 'lucide-react'

export const SignOffClosure: React.FC = () => {
  const batch = mockRepairBatches[0]

  const handleSignOff = () => {
    alert('Đã ký số phê duyệt hoàn thành đợt sửa chữa (COMPLETED)! Hệ thống đã tạo biên bản nghiệm thu có chữ ký số điện tử.')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Ký Số Biên Bản Đóng Đợt Sửa Chữa (Closure Sign-off)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ký số xác nhận 100% các hạng mục đã hoàn thành đạt chất lượng và xuất hồ sơ hoàn công
        </p>
      </div>

      <Card title={`Biên Bản Nghiệm Thu & Đóng Đợt: ${batch.code}`}>
        <div className="space-y-6 text-xs">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-emerald-800 text-sm">Điều Kiện Đóng Đợt Đã Thỏa Mãn</div>
              <div className="text-emerald-700">Tất cả các vị trí hư hỏng trong đợt đã qua bước nghiệm thu đạt yêu cầu.</div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Tên đợt sửa chữa:</span>
              <span className="font-bold text-brand-dark">{batch.name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Chỉ huy trưởng lập hồ sơ:</span>
              <span className="font-bold text-brand-dark">{batch.created_by_name}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Giám sát ký nghiệm thu:</span>
              <span className="font-bold text-brand-dark">Trần Quang Minh (Chủ đầu tư)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Tổng giá trị quyết toán:</span>
              <span className="font-black text-brand-goldDark text-sm">
                {batch.estimated_total_cost.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => alert('Đang tải xuống bộ hồ sơ hoàn công (.ZIP)...')}
              icon={<Download className="w-4 h-4" />}
            >
              Xuất Hồ Sơ PDF / ZIP
            </Button>
            <Button
              onClick={handleSignOff}
              icon={<FileSignature className="w-4 h-4" />}
            >
              Ký Số Đóng Đợt (COMPLETED)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
