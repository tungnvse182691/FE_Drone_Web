import React from 'react'
import { Icon } from '../../../components/ui/Icon'

interface CreateSurveyHeaderProps {
  onBack: () => void
}

export const CreateSurveyHeader: React.FC<CreateSurveyHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        type="button"
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-[#1A1D20] cursor-pointer transition-colors border border-transparent hover:border-[#E2E5E9]"
        title="Quay lại danh sách đợt bay"
      >
        <Icon name="arrow_back" size={20} />
      </button>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D20] font-sansation tracking-tight">
          Tạo Yêu Cầu Bay Khảo Sát Drone
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lập kế hoạch hành lang bay trắc địa và chuyển tiếp lệnh bay tới ứng dụng di động của Drone Operator
        </p>
      </div>
    </div>
  )
}
