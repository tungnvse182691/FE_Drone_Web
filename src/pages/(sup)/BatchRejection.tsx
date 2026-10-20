import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

export const BatchRejection: React.FC = () => {
  const toast = useToastStore()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [reasonCategory, setReasonCategory] = useState('Biện pháp kỹ thuật chưa phù hợp quy chuẩn')
  const [comments, setComments] = useState('Khối lượng cào bóc bê tông nhựa tại Km26.35 tính toán chưa khớp với ảnh khảo sát')

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đã gửi yêu cầu chỉnh sửa hồ sơ về cho Chỉ huy trưởng (PM)!')
    navigate('/sup/proposals')
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-2 pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sup/proposals')}
          className="p-2 hover:bg-white border border-transparent hover:border-[#E2E5E9] rounded-[10px] text-slate-500 hover:text-slate-800 cursor-pointer transition-all shadow-2xs"
          title="Quay lại danh sách đợt sửa chữa"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1A1D20] tracking-tight">
            Yêu Cầu Sửa Đổi Hồ Sơ Đợt Sửa Chữa
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phản hồi kỹ thuật của Tư vấn Giám sát yêu cầu PM giải trình hoặc tính toán lại khối lượng kỹ thuật
          </p>
        </div>
      </div>

      <div className="rounded-[20px] border-[1.5px] border-[#B91C1C]/25 bg-white p-6 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#B91C1C] via-rose-400 to-amber-300" />
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#EDEFF2]">
          <div className="w-10 h-10 rounded-[10px] bg-rose-50 border border-rose-200 flex items-center justify-center text-[#B91C1C] shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#B91C1C]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1A1D20]">
              Ý Kiến Thẩm Định Yêu Cầu Sửa Đổi
            </h2>
            <p className="text-[11px] text-slate-500">
              Đợt sửa chữa #{id || 'N/A'} — Hồ sơ sẽ được chuyển trạng thái REVISION_REQUIRED
            </p>
          </div>
        </div>

        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nhóm Lý Do Trả Hồ Sơ
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-semibold text-slate-800 transition-colors cursor-pointer"
            >
              <option value="Biện pháp kỹ thuật chưa phù hợp quy chuẩn">Biện pháp kỹ thuật chưa phù hợp quy chuẩn kỹ thuật</option>
              <option value="Thiếu ảnh đo đạc kiểm chứng hiện trường">Thiếu ảnh đo đạc kiểm chứng hiện trường</option>
              <option value="Khối lượng tính toán chưa khớp">Khối lượng tính toán chưa khớp với diện tích hư hỏng</option>
              <option value="Biện pháp thi công chưa đảm bảo an toàn giao thông">Biện pháp an toàn giao thông chưa đạt</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Chi Tiết Yêu Cầu Chỉnh Sửa <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] text-slate-800 transition-colors leading-relaxed"
              placeholder="Ghi rõ các điểm cần hiệu chỉnh..."
            />
          </div>

          <div className="p-3 bg-rose-50/60 rounded-[12px] border border-rose-200/80 text-[11px] text-rose-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-rose-600 shrink-0 mt-0.5">
              info
            </span>
            <p className="leading-relaxed">
              Theo quy chuẩn BR-18, sau khi gửi yêu cầu, toàn bộ đợt sửa chữa sẽ được mở khóa cho Chỉ huy trưởng (PM) tiến hành khảo sát lại hoặc hiệu chỉnh phương án thi công.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDEFF2]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/sup/proposals')}
              className="rounded-[10px] text-xs font-semibold"
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="rounded-[10px] text-xs font-bold bg-[#B91C1C] hover:bg-rose-800 shadow-2xs"
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              Gửi yêu cầu chỉnh sửa
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
