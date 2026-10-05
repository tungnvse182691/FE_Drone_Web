import React from 'react'
import { Camera, X, Check } from 'lucide-react'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Lệnh Khảo Sát &amp; Đo Đạc Bổ Sung (WF-11)</h3>
              <p className="text-xs text-slate-500">
                Nêu lý do kỹ thuật, chọn hình thức và phân công đơn vị đi đo / bay drone lại
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Target Defect Info Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-brand-dark">{targetTriageCase.code}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {targetTriageCase.source_label}
              </span>
            </div>
            <div className="font-semibold text-slate-800">{targetTriageCase.defect_title}</div>
            <div className="text-slate-500 text-[11px]">
              Lý trình:{' '}
              <span className="font-medium text-slate-700">
                {targetTriageCase.stationing} ({targetTriageCase.lane})
              </span>{' '}
              • Tuyến: <span className="font-medium text-slate-700">{targetTriageCase.project_name}</span>
            </div>
          </div>

          {/* 1. Chọn hình thức khảo sát */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              1. Hình thức khảo sát / đo đạc lại: <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  surveyMode === 'MEASURE_ONLY'
                    ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="survey_mode"
                    checked={surveyMode === 'MEASURE_ONLY'}
                    onChange={() => {
                      setSurveyMode('MEASURE_ONLY')
                      setSurveyAssignedCrew('Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)')
                    }}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">📐 Đo đạc hiện trường</span>
                    <span className="text-[10px] text-blue-700 font-semibold uppercase">
                      Chế độ MEASURE_ONLY (BR-09)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Kỹ sư/Tổ đội đi thực địa dùng thước đo độ sâu lòng hố (depth) và đo diện tích nứt vỡ chuẩn
                      xác.
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  surveyMode === 'DRONE_RESURVEY'
                    ? 'bg-blue-50/80 border-blue-500 shadow-2xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="survey_mode"
                    checked={surveyMode === 'DRONE_RESURVEY'}
                    onChange={() => {
                      setSurveyMode('DRONE_RESURVEY')
                      setSurveyAssignedCrew('Đội bay Drone Hoàng Hải 01 - Phi công: Lê Minh Khôi')
                    }}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">🛸 Bay Drone bổ sung</span>
                    <span className="text-[10px] text-blue-700 font-semibold uppercase">
                      Chế độ DRONE_RESURVEY
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Chỉ định phi công bay quét lại ở độ cao thấp hơn hoặc góc chụp xiên do ảnh cũ bị mờ, ngược
                      sáng.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Lý do kỹ thuật yêu cầu đo lại (Bắt buộc) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                2. Lý do kỹ thuật yêu cầu đo đạc lại: <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Bắt buộc theo chuẩn thẩm định</span>
            </div>

            {/* Quick Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'Ảnh bị mờ / che khuất tầm nhìn',
                'Cần đo độ sâu lòng hố (depth)',
                'Nghi ngờ nứt kết cấu tầng dưới',
                'Xác định lại chính xác lý trình Km',
                'Góc chụp xiên không đủ cơ sở tính diện tích',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSurveyReason((prev) => (prev ? `${prev}. ${tag}` : tag))}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer border border-slate-200"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={surveyReason}
              onChange={(e) => setSurveyReason(e.target.value)}
              placeholder="Ví dụ: Ảnh người dân gửi góc xiên và bị ngược sáng, cần tổ đội ra đo thước kiểm tra lòng sâu hố sụt và diện tích hư hại thực tế..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            />
          </div>

          {/* 3. Phân công đơn vị thực hiện */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              3. Phân công đơn vị thực hiện: <span className="text-red-500">*</span>
            </label>
            <select
              value={surveyAssignedCrew}
              onChange={(e) => setSurveyAssignedCrew(e.target.value)}
              className="w-full bg-white border border-slate-200 font-medium text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
            >
              {surveyMode === 'MEASURE_ONLY' ? (
                <>
                  <option value="Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)">
                    Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035) — Trưởng tổ: Nguyễn Văn Thành
                  </option>
                  <option value="Tổ đo đạc cơ động 02 (Km 1035 - Km 1060)">
                    Tổ đo đạc cơ động 02 (Km 1035 - Km 1060) — Trưởng tổ: Trần Đình Trọng
                  </option>
                  <option value="Đội kỹ thuật phản ứng nhanh số 3">
                    Đội kỹ thuật phản ứng nhanh số 3 — Kỹ sư: Lê Văn Nam
                  </option>
                </>
              ) : (
                <>
                  <option value="Đội bay Drone Hoàng Hải 01 - Phi công: Lê Minh Khôi">
                    Đội bay Drone Hoàng Hải 01 — Phi công: Lê Minh Khôi (DJI Matrice 350 RTK)
                  </option>
                  <option value="Đội bay Khảo sát 02 - Phi công: Hoàng Quốc Tuấn">
                    Đội bay Khảo sát 02 — Phi công: Hoàng Quốc Tuấn (DJI Mavic 3 Enterprise)
                  </option>
                  <option value="Tổ bay cứu nạn khẩn cấp 03 - Phi công: Phạm Anh Dũng">
                    Tổ bay cứu nạn khẩn cấp 03 — Phi công: Phạm Anh Dũng
                  </option>
                </>
              )}
            </select>
          </div>

          {/* 4. Cam kết thời hạn SLA */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">4. Cam kết thời hạn hoàn thành (SLA):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 24, label: 'Khẩn cấp (24h)', note: 'Ưu tiên hàng đầu' },
                { value: 48, label: 'Tiêu chuẩn (48h)', note: 'Theo ca trực chuẩn' },
                { value: 168, label: 'Định kỳ (7 ngày)', note: 'Đợt khảo sát tuần' },
              ].map((sla) => (
                <button
                  key={sla.value}
                  type="button"
                  onClick={() => setSurveySlaHours(sla.value)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    surveySlaHours === sla.value
                      ? 'bg-amber-50 border-[#C9A227] text-[#8F7212] font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">{sla.label}</span>
                  <span className="block text-[10px] text-slate-400">{sla.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmRequestSurvey}
            className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Phát Lệnh Khảo Sát / Đo Lại (WF-11)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
