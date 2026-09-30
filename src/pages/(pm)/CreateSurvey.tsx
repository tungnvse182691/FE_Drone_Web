import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { mockProjects } from '../../api/mock/data'
import { useNavigate } from 'react-router-dom'
import { PlaneTakeoff, ArrowLeft, Check } from 'lucide-react'

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()
  const [projectId, setProjectId] = useState(mockProjects[0]?.id || '')
  const [startKm, setStartKm] = useState('25.0')
  const [endKm, setEndKm] = useState('30.0')
  const [date, setDate] = useState('2026-10-15')
  const [pilot, setPilot] = useState('Lê Hoàng Long (Drone Operator)')
  const [notes, setNotes] = useState('Khảo sát định kỳ quý IV sau mùa bão lũ')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Đã tạo thành công kế hoạch bay khảo sát Drone!')
    navigate('/pm/surveys')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pm/surveys')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Tạo Yêu Cầu Bay Khảo Sát Drone</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập kế hoạch bay và chuyển tiếp lệnh bay tới ứng dụng di động của Drone Operator
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dự Án / Tuyến Đường Khảo Sát
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                {mockProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Lý Trình Bắt Đầu (Km)"
                type="number"
                step="0.1"
                value={startKm}
                onChange={(e) => setStartKm(e.target.value)}
                required
              />
              <InputField
                label="Lý Trình Kết Thúc (Km)"
                type="number"
                step="0.1"
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Ngày Bay Dự Kiến"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <InputField
                label="Chỉ Định Phi Công (Drone Operator)"
                value={pilot}
                onChange={(e) => setPilot(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ghi Chú Kỹ Thuật & Yêu Cầu An Toàn
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
                placeholder="Nhập ghi chú yêu cầu bay cao, tránh đường dây điện..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => navigate('/pm/surveys')}>
              Hủy Bỏ
            </Button>
            <Button type="submit" icon={<PlaneTakeoff className="w-4 h-4" />}>
              Ban Hành Lệnh Bay
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
