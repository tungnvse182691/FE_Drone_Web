import React from 'react'
import { ArrowLeft } from 'lucide-react'

interface CreateSurveyHeaderProps {
  onBack: () => void
}

export const CreateSurveyHeader: React.FC<CreateSurveyHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Tạo Yêu Cầu Bay Khảo Sát Drone</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lập kế hoạch hành lang bay trắc địa và chuyển tiếp lệnh bay tới ứng dụng di động của Drone Operator
        </p>
      </div>
    </div>
  )
}
