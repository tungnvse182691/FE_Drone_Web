import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { mockSurveys } from '../../api/mock/data'
import { PlaneTakeoff, PlusCircle, Calendar, UserCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const SurveyRequests: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Kế Hoạch & Yêu Cầu Bay Khảo Sát Drone</h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi các đợt bay chụp ảnh hồng ngoại/RGB để thu thập dữ liệu mặt đường
          </p>
        </div>
        <Button
          onClick={() => navigate('/pm/surveys/create')}
          icon={<PlusCircle className="w-4 h-4" />}
        >
          Tạo Yêu Cầu Bay Mới
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-border text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Mã Khảo Sát</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Tên Tuyến Khảo Sát</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Đoạn Lý Trình</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Ngày Bay Dự Kiến</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Phi Công Điều Khiển</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Số Ảnh Thẻ SD</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Lỗi AI Tìm Thấy</th>
                <th className="py-3 px-4 font-semibold uppercase tracking-wider">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockSurveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-brand-goldDark">{survey.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-brand-dark">{survey.project_name}</td>
                  <td className="py-3.5 px-4 text-slate-600">Km{survey.start_km} - Km{survey.end_km}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {survey.scheduled_date}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      {survey.pilot_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{survey.total_images} ảnh</td>
                  <td className="py-3.5 px-4 font-bold text-brand-error">
                    {survey.detected_defects_count > 0 ? `${survey.detected_defects_count} hư hỏng` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={survey.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
