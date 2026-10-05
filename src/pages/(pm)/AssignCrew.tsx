import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { mockRepairBatches } from '../../api/mock/data'
import { Users2, Calendar, ShieldAlert } from 'lucide-react'

export const AssignCrew: React.FC = () => {
  const [crewName, setCrewName] = useState('Đội Thi Công Số 2 (Hoàng Hải)')
  const [deadline, setDeadline] = useState('2026-10-25')
  const [safetyNotes, setSafetyNotes] = useState('Yêu cầu đặt biển báo cách vị trí thi công 150m, có người phân luồng')

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Đã giao việc cho Đội thi công thành công! Lệnh công tác được đồng bộ đến App Mobile của thợ.')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Màn 14: Phân Công Đội Thi Công (Repair Crew)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chỉ định tổ đội thi công hiện trường thực hiện đợt sửa chữa đã được phê duyệt
        </p>
      </div>

      <Card>
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Đợt Sửa Chữa Cần Giao Việc
            </label>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-bold text-brand-dark">
              {mockRepairBatches[0].code} — {mockRepairBatches[0].name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Chỉ Định Đội Thi Công
            </label>
            <select
              value={crewName}
              onChange={(e) => setCrewName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="Đội Thi Công Số 1 (Hoàng Hải)">Đội Thi Công Số 1 (Chuyên cào bóc thảm nhựa)</option>
              <option value="Đội Thi Công Số 2 (Hoàng Hải)">Đội Thi Công Số 2 (Chuyên xử lý khe nứt)</option>
              <option value="Đội Thi Công Số 3 (Hoàng Hải)">Đội Thi Công Số 3 (Khẩn cấp)</option>
            </select>
          </div>

          <InputField
            label="Hạn Chót Hoàn Thành (Deadline)"
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
            Ban Hành Lệnh Giao Việc (ASSIGNED)
          </Button>
        </form>
      </Card>
    </div>
  )
}
