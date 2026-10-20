import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { mockRepairBatches } from '../../api/mock/data'
import { Users2, Calendar, ShieldAlert, ClipboardCheck, Smartphone, CheckCircle2 } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

export const AssignCrew: React.FC = () => {
  const toast = useToastStore()
  const [crewName, setCrewName] = useState('Đội Thi Công Số 2 (Hoàng Hải)')
  const [deadline, setDeadline] = useState('2026-10-25')
  const [safetyNotes, setSafetyNotes] = useState('Yêu cầu đặt biển báo cách vị trí thi công 150m, có người phân luồng')

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đã giao việc cho Đội thi công thành công! Lệnh công tác được đồng bộ đến App Mobile của thợ.')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Phân Công Đội Thi Công
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chỉ định tổ đội thi công hiện trường thực hiện đợt sửa chữa đã được phê duyệt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Cột trái: Card Form phân công */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Đợt Sửa Chữa Cần Giao Việc
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-brand-dark flex items-center justify-between">
                  <span>{mockRepairBatches[0].code} — {mockRepairBatches[0].name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Đã duyệt
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chỉ Định Đội Thi Công
                </label>
                <select
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
                >
                  <option value="Đội Thi Công Số 1 (Hoàng Hải)">Đội Thi Công Số 1 (Chuyên cào bóc thảm nhựa)</option>
                  <option value="Đội Thi Công Số 2 (Hoàng Hải)">Đội Thi Công Số 2 (Chuyên xử lý khe nứt)</option>
                  <option value="Đội Thi Công Số 3 (Hoàng Hải)">Đội Thi Công Số 3 (Khẩn cấp)</option>
                </select>
              </div>

              <InputField
                label="Hạn Chót Hoàn Thành"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Biện Pháp Đảm Bảo An Toàn Giao Thông
                </label>
                <textarea
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <Button type="submit" className="w-full mt-4" size="lg" icon={<Users2 className="w-4 h-4" />}>
                Ban Hành Lệnh Giao Việc
              </Button>
            </form>
          </Card>
        </div>

        {/* Cột phải: Panel hướng dẫn quy trình phân công */}
        <div className="space-y-4">
          <Card className="p-5 border border-slate-200 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-800 mb-3.5 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#C9A227]" />
              <span>Các bước phân công hiện trường</span>
            </h3>

            <ol className="space-y-3.5 text-xs text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-800 block text-xs font-semibold">Chọn đội chuyên môn</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Chỉ định tổ đội có năng lực kỹ thuật và trang thiết bị phù hợp với tính chất hư hỏng mặt đường.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-800 block text-xs font-semibold">Đồng bộ qua ứng dụng di động</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Lệnh giao việc cùng tọa độ GPS và yêu cầu kỹ thuật được chuyển ngay đến điện thoại tổ trưởng.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-800 block text-xs font-semibold">Ghi nhận và nghiệm thu</strong>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    Tổ đội chụp ảnh trước/sau và lập nhật ký thi công để chuyển sang khâu nghiệm thu chất lượng.
                  </span>
                </div>
              </li>
            </ol>
          </Card>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block mb-0.5">Lưu ý an toàn thi công:</strong>
              Mọi vị trí thi công trên tuyến bắt buộc phải bố trí biển báo cảnh báo từ xa tối thiểu 150m và có người phân luồng giao thông.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
