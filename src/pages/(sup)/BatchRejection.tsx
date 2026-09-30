import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export const BatchRejection: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [reasonCategory, setReasonCategory] = useState('Đơn giá vượt định mức quy định')
  const [comments, setComments] = useState('Khối lượng cào bóc bê tông nhựa tại Km26.35 tính toán chưa khớp với ảnh khảo sát')

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Đã gửi yêu cầu chỉnh sửa hồ sơ (REVISION_REQUIRED) về cho Chỉ huy trưởng (PM)!')
    navigate('/sup/approvals')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sup/approvals')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            Màn 13: Yêu Cầu Sửa Đổi Hồ Sơ Đợt Sửa Chữa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gửi phản hồi yêu cầu PM giải trình hoặc tính toán lại định mức dự toán
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nhóm Lý Do Trả Hồ Sơ
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium"
            >
              <option value="Đơn giá vượt định mức quy định">Đơn giá vượt định mức quy định của Bộ GTVT</option>
              <option value="Thiếu ảnh đo đạc kiểm chứng hiện trường">Thiếu ảnh đo đạc kiểm chứng hiện trường</option>
              <option value="Khối lượng tính toán chưa khớp">Khối lượng tính toán chưa khớp với diện tích hư hỏng</option>
              <option value="Biện pháp thi công chưa đảm bảo an toàn giao thông">Biện pháp an toàn giao thông chưa đạt</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Chi Tiết Yêu Cầu Chỉnh Sửa
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              required
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="Ghi rõ các điểm cần hiệu chỉnh..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => navigate('/sup/approvals')}>
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              variant="danger"
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              Gửi Yêu Cầu Chỉnh Sửa (REVISION_REQUIRED)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
