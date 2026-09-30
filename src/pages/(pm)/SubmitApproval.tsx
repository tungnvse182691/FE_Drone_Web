import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockRepairBatches } from '../../api/mock/data'
import { ArrowLeft, Send, FileCheck, CheckCircle2 } from 'lucide-react'

export const SubmitApproval: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const batch = mockRepairBatches[0]

  const handleSubmit = () => {
    batch.status = 'PENDING_APPROVAL' as any
    alert('Đã gửi hồ sơ đợt sửa chữa sang Chủ đầu tư / Giám sát phê duyệt!')
    navigate('/pm/dashboard')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pm/repair-batches/create')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
                Màn 11: Trình Duyệt Hồ Sơ Đợt Sửa Chữa
              </h1>
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã hồ sơ: {batch.code} • Dự án: {batch.project_name}
            </p>
          </div>
        </div>

        <Button onClick={handleSubmit} size="lg" icon={<Send className="w-4 h-4" />}>
          Gửi Giám Sát Phê Duyệt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card title="Danh Mục Công Việc BOQ Đính Kèm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                    <th className="py-2.5 px-3 font-semibold uppercase">Hạng Mục</th>
                    <th className="py-2.5 px-3 font-semibold uppercase">Khối Lượng</th>
                    <th className="py-2.5 px-3 font-semibold uppercase">Đơn Giá</th>
                    <th className="py-2.5 px-3 font-semibold uppercase text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batch.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3 font-semibold text-brand-dark">{item.task_name}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.unit_price.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-goldDark text-right">
                        {item.total_price.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Tóm Tắt Hồ Sơ">
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <span className="text-slate-500">Người lập hồ sơ:</span>
                <div className="font-semibold text-brand-dark">{batch.created_by_name}</div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-brand-gold/30 rounded-lg space-y-1">
                <span className="text-slate-500">Tổng chi phí dự toán:</span>
                <div className="text-lg font-black text-brand-goldDark">
                  {batch.estimated_total_cost.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>

              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-2">
                <FileCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Hồ sơ sau khi gửi sẽ chuyển sang trạng thái <strong>PENDING_APPROVAL</strong> và chờ Supervisor phê duyệt.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
