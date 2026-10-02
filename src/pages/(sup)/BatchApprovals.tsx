import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockRepairBatches } from '../../api/mock/data'
import { RepairBatchStatus } from '../../types/enums'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react'

export const BatchApprovals: React.FC = () => {
  const navigate = useNavigate()
  const [batches, setBatches] = useState(mockRepairBatches)

  const handleApprove = (batchId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt hồ sơ đợt sửa chữa này? (Sau khi duyệt, hồ sơ sẽ bị khóa read-only)')) {
      return
    }
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: RepairBatchStatus.APPROVED } : b))
    )
    alert('Hồ sơ đã được phê duyệt chính thức (APPROVED)!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Thẩm Duyệt Hồ Sơ Đợt Sửa Chữa &amp; Dự Toán BOQ (WF-07)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Thẩm quyền Tư vấn Giám sát: Kiểm tra định mức đơn giá vật liệu, phê duyệt từng hạng mục công việc hoặc yêu cầu chỉnh sửa hồ sơ (Revision Required)
        </p>
      </div>

      <div className="space-y-4">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-brand-dark">{batch.code}</span>
                    <StatusBadge status={batch.status} />
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">{batch.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Tổng kinh phí dự toán:</span>
                  <div className="text-lg font-black text-brand-goldDark">
                    {batch.estimated_total_cost.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>

              {/* BOQ Items Review Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                      <th className="py-2 px-3 font-semibold uppercase">Hạng Mục</th>
                      <th className="py-2 px-3 font-semibold uppercase">Khối Lượng</th>
                      <th className="py-2 px-3 font-semibold uppercase">Đơn Giá Định Mức</th>
                      <th className="py-2 px-3 font-semibold uppercase text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batch.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-medium text-brand-dark">{item.task_name}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.unit_price.toLocaleString('vi-VN')} đ/{item.unit}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 text-right">
                          {item.total_price.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons for Supervisor */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/sup/approvals/${batch.id}`)}
                  icon={<FileText className="w-4 h-4 text-brand-gold" />}
                >
                  Xem Bóc Tách &amp; Thẩm Duyệt Chi Tiết
                </Button>

                {batch.status === RepairBatchStatus.PENDING_APPROVAL ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/sup/approvals/${batch.id}/reject`)}
                      className="text-brand-error border-rose-200 hover:bg-rose-50"
                      icon={<XCircle className="w-4 h-4" />}
                    >
                      Yêu Cầu Chỉnh Sửa
                    </Button>
                    <Button
                      onClick={() => handleApprove(batch.id)}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Phê Duyệt Hồ Sơ (APPROVED)
                    </Button>
                  </>
                ) : (
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Hồ sơ đã được phê duyệt chính thức — Đang khóa bất biến (Read-only)
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
