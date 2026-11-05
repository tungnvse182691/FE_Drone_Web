import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface RequestSurveyModalProps {
  isOpen: boolean
  onClose: () => void
  targetTriageCase: TriageCase | null
  surveyMode: 'MEASURE_ONLY' | 'DRONE_RESURVEY'
  setSurveyMode: (m: 'MEASURE_ONLY' | 'DRONE_RESURVEY') => void
  surveyReason: string
  setSurveyReason: React.Dispatch<React.SetStateAction<string>>
  surveyAssignedCrew: string
  setSurveyAssignedCrew: (crew: string) => void
  surveySlaHours: number
  setSurveySlaHours: (hours: number) => void
  onConfirmRequestSurvey: () => void
}

export const RequestSurveyModal: React.FC<RequestSurveyModalProps> = ({
  isOpen,
  onClose,
  targetTriageCase,
  surveyMode,
  setSurveyMode,
  surveyReason,
  setSurveyReason,
  surveyAssignedCrew,
  setSurveyAssignedCrew,
  surveySlaHours,
  setSurveySlaHours,
  onConfirmRequestSurvey,
}) => {
  if (!isOpen || !targetTriageCase) return null

  return <div role="dialog" className="fixed inset-0 z-50 bg-white p-8 space-y-4">
    <h2>Yêu cầu bổ sung bằng chứng</h2>
    <p>Chỉ ghi kết luận NEEDS_EVIDENCE cho Case. Chưa tạo hoặc giao nhiệm vụ FIELD/Drone; chưa có nguồn chọn tổ đội hoặc SLA từ API.</p>
    <label>Lý do<textarea value={surveyReason} onChange={event => setSurveyReason(event.target.value)} /></label>
    <button onClick={onClose}>Hủy</button>
    <button disabled={!surveyReason.trim()} onClick={onConfirmRequestSurvey}>Ghi yêu cầu bổ sung bằng chứng</button>
  </div>
}
