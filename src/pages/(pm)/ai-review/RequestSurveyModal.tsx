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

  return <div role="dialog" aria-label="Yêu cầu bổ sung bằng chứng" className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><section className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl">
    <header className="p-5 border-b flex items-center justify-between"><div className="flex items-center gap-3"><span className="bg-amber-50 text-[#8C6D1F] p-2 rounded-lg"><Icon name="assignment" size={22}/></span><div><h2 className="font-bold">Yêu cầu bổ sung bằng chứng</h2><p className="text-xs text-slate-500 mt-1">{targetTriageCase.code}</p></div></div><button onClick={onClose} aria-label="Đóng"><Icon name="close" size={20}/></button></header>
    <div className="p-5 space-y-5"><section className="bg-slate-50 border rounded-xl p-3 text-sm"><h3 className="font-semibold">Hồ sơ tiếp nhận</h3><p className="text-xs text-slate-500 mt-1">{targetTriageCase.defect_title}</p></section><section><h3 className="text-sm font-semibold mb-2">Phương thức bổ sung</h3><div className="grid sm:grid-cols-2 gap-3">{['Đo đạc hiện trường','Khảo sát Drone'].map(label=><div key={label} className="border rounded-xl p-3 text-xs text-slate-500">{label}<p className="mt-2">Chưa có nhiệm vụ được tạo</p></div>)}</div></section>
    <label className="block text-sm font-semibold">Lý do yêu cầu<textarea className="block w-full border rounded-lg p-3 mt-2 text-sm font-normal" value={surveyReason} onChange={event=>setSurveyReason(event.target.value)} /></label><div className="grid sm:grid-cols-2 gap-3 text-xs">{['Đơn vị nhận việc','Thời hạn xử lý'].map(label=><div key={label} className="border rounded-xl p-3 text-slate-500">{label}<p className="mt-2">Chưa cập nhật</p></div>)}</div><p className="text-xs bg-amber-50 rounded-lg p-3 text-amber-900">Chỉ ghi yêu cầu bổ sung bằng chứng. Chưa tạo hoặc giao nhiệm vụ hiện trường hoặc chuyến bay.</p></div><footer className="p-5 border-t flex justify-end gap-2"><button className="border rounded-lg px-4 py-2 text-sm" onClick={onClose}>Hủy</button><button className="bg-[#C9A227] text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50" disabled={!surveyReason.trim()} onClick={onConfirmRequestSurvey}>Ghi yêu cầu bổ sung bằng chứng</button></footer>
  </section></div>
}
