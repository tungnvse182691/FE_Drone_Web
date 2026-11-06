import React, { useState, useEffect } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { AIDetectionItem } from './types'

export interface ReFlightPayload {
  pilot: string
  surveyType?: 'AD_HOC' | 'PERIODIC'
  dueDate: string
  note: string
  range: string
}

export interface MissionModalsProps {
  isReFlightModalOpen: boolean
  setIsReFlightModalOpen: (open: boolean) => void
  pilotNote: string
  setPilotNote: (note: string) => void
  onSubmitReFlight: (payload: ReFlightPayload) => void
  selectedItem?: AIDetectionItem
  currentSurveyCode?: string
  currentSurveyRange?: string
  coveragePercentage?: number
  isBaselineModalOpen?: boolean
  setIsBaselineModalOpen?: (open: boolean) => void
  onConfirmBaseline?: (isPartial: boolean) => void
  onOpenReFlightFromBaseline?: () => void
  reviewedCount?: number
  totalCount?: number
}



type InspectMissionModalsProps = { inspectOnly: true; kind: 'refly' | 'baseline' | null; onClose: () => void }

export const MissionModals: React.FC<MissionModalsProps | InspectMissionModalsProps> = (props) => {
  if (!('inspectOnly' in props)) return <LegacyMissionModals {...props} />
  if (!props.kind) return null
  const refly = props.kind === 'refly'
  const title = refly ? 'Lập lệnh bay quét bổ sung' : 'Xác nhận khóa Baseline đoạn tuyến'
  return <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"><section className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"><header className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"><div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold"><Icon name={refly ? 'flight_takeoff' : 'lock'} size={20} /></span><div><h2 className="font-bold text-slate-900 text-base">{title}</h2><p className="text-[11px] text-slate-500">Nhiệm vụ &amp; Phạm vi tuyến: Chưa cập nhật</p></div></div><button type="button" aria-label="Đóng hồ sơ chuyến bay" onClick={props.onClose} className="text-slate-400 p-1"><Icon name="close" size={20} /></button></header><section className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex gap-2.5"><Icon name="info" size={18} /><div><h3 className="font-bold mb-1">{refly ? 'Cơ sở kỹ thuật khảo sát' : 'Điều kiện khóa mốc'}</h3><p>Chưa cập nhật. Chưa đủ bằng chứng xác minh để thực hiện lệnh này.</p></div></section>{refly ? <><fieldset disabled className="grid sm:grid-cols-2 gap-3"><legend className="text-xs font-semibold text-slate-700 mb-2">Phạm vi bay bổ sung</legend>{['Điểm mù khảo sát','Tùy chỉnh lý trình'].map(label => <div key={label} className="border rounded-xl p-3 text-xs text-slate-500"><p className="font-semibold">{label}</p><p className="mt-2">Chưa cập nhật</p></div>)}</fieldset><fieldset disabled className="grid sm:grid-cols-3 gap-3">{['Góc nghiêng Gimbal','Ngày dự kiến','Operator phụ trách'].map(label => <label key={label} className="text-xs text-slate-600">{label}<input placeholder="Chưa cập nhật" className="w-full mt-1 border rounded-lg p-2 bg-slate-50" /></label>)}</fieldset><label className="text-xs font-semibold text-slate-700">Ghi chú kỹ thuật<textarea disabled placeholder="Chưa cập nhật" className="w-full block mt-1 border rounded-lg p-3 bg-slate-50" /></label></> : <><dl className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">{['Thẩm định phát hiện AI','Độ phủ khảo sát','Hồ sơ bằng chứng','Phạm vi phiên bản tuyến'].map(label => <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-slate-500">{label}</dt><dd>Chưa cập nhật</dd></div>)}</dl><fieldset disabled className="grid sm:grid-cols-2 gap-3">{['Khóa toàn bộ phạm vi','Khóa phạm vi đã kiểm tra'].map(label => <label key={label} className="border rounded-xl p-3 text-xs text-slate-500"><span className="flex items-center gap-2"><input type="radio" name="baseline-scope" />{label}</span><span className="block mt-2">Chưa cập nhật</span></label>)}</fieldset></>}<p className="text-xs text-slate-500">Đây là hồ sơ xem trước. Chưa tích hợp gửi lệnh khi thiếu nguồn, phiên bản và điều kiện từ máy chủ.</p><footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={props.onClose} className="px-4 py-2 rounded-xl border text-xs">Hủy bỏ</button><button type="button" disabled className="px-4 py-2 rounded-xl bg-brand-gold text-white text-xs opacity-50">{refly ? 'Xác nhận phát lệnh bay bổ sung' : 'Xác nhận khóa mốc'}</button></footer></section></div>
}

const LegacyMissionModals: React.FC<MissionModalsProps> = ({
  isReFlightModalOpen,
  setIsReFlightModalOpen,
  pilotNote,
  setPilotNote,
  onSubmitReFlight,
  selectedItem: _selectedItem,
  currentSurveyCode = '#MS-2026-0924',
  currentSurveyRange = 'Toàn tuyến',
  coveragePercentage = 100,
  isBaselineModalOpen = false,
  setIsBaselineModalOpen,
  onConfirmBaseline,
  onOpenReFlightFromBaseline,
  reviewedCount = 0,
  totalCount = 0
}) => {
    const [customRange, setCustomRange] = useState<string>(currentSurveyRange)
    
  
  const [selectedPilot, setSelectedPilot] = useState<string>('Synthetic operator-a (Phi công UAV)')
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  })

  // Tự động gợi ý nội dung chỉ dẫn kỹ thuật theo đoạn lý trình
  useEffect(() => {
    setPilotNote(
      `Bay quét bổ sung đoạn lý trình ${customRange} nhằm hoàn thiện dữ liệu trắc địa bề mặt mặt đường phục vụ thẩm định Baseline.`
    )
  }, [customRange, setPilotNote])

  if (!isReFlightModalOpen && !isBaselineModalOpen) return null

  return (
    <>
      {isReFlightModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="flight_takeoff" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Lập Lệnh Bay Quét Bổ Sung (Re-flight)</h3>
              <p className="text-[11px] text-slate-500">
                Nhiệm vụ {currentSurveyCode} • Tuyến: {currentSurveyRange}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsReFlightModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        

        {/* 1. Phạm vi lý trình cần bay bổ sung */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Phạm vi lý trình cần bay bổ sung:
          </label>
          <input
            type="text"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            placeholder="Ví dụ: Km 0+000 → Km 0+702"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>

        {/* Hạn hoàn thành nhiệm vụ */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Hạn hoàn thành nhiệm vụ bay bù:
          </label>
          <input
            type="date"
            value={dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>

        {/* Phi công thiết bị bay */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Phi công thiết bị bay phụ trách:
          </label>
          <select
            value={selectedPilot}
            onChange={(e) => setSelectedPilot(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="Synthetic operator-a (Phi công UAV)">Synthetic operator-a (Phi công UAV)</option>
          </select>
        </div>

        {/* Chỉ dẫn kỹ thuật cho Phi công */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Chỉ dẫn kỹ thuật cho Phi công Drone:</label>
            <span className="text-[11px] text-slate-400">Tự động gợi ý theo phạm vi</span>
          </div>
          <textarea
            rows={3}
            value={pilotNote}
            onChange={(e) => setPilotNote(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReFlightModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => onSubmitReFlight({ pilot: selectedPilot, surveyType: 'AD_HOC', dueDate, note: pilotNote, range: customRange })}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-gold hover:bg-[#B38E1F] text-white shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="flight_takeoff" size={16} />
              <span>Xác nhận phát lệnh bay bù</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* MODAL 2: XÁC NHẬN KHÓA BASELINE THEO QUY TẮC BR-40 / DA10                  */}
  {/* ========================================================================= */}
  {isBaselineModalOpen && (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="lock" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Xác Nhận Khóa Baseline Đoạn Tuyến
              </h3>
              <p className="text-[11px] text-slate-500">
                Nhiệm vụ {currentSurveyCode} • Căn cứ nghiệp vụ BR-40 & DA10
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsBaselineModalOpen && setIsBaselineModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Tình trạng rà soát hiện tại */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Thẩm định phát hiện AI:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Icon name="check_circle" size={13} />
              <span>Đã hoàn tất {reviewedCount}/{totalCount} mục (100%)</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Độ phủ trùm ảnh trắc địa:</span>
            <span className="font-bold font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {coveragePercentage}% (Ngưỡng toàn tuyến: ≥ 95%)
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
            <span>Điểm mù trắc địa:</span>
            <span className="font-medium text-slate-700">Km 1027+100 (Thiếu ảnh mép phải do rào chắn)</span>
          </div>
        </div>

        {/* Nội dung quy tắc Baseline */}
        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <Icon name="verified" size={16} />
            <span>Quy tắc xác nhận mốc Baseline:</span>
          </div>
          <p className="leading-relaxed">
            Hệ thống cho phép PM <strong>xác nhận Baseline cho từng phân đoạn/vùng đủ điều kiện</strong> (giữ phần đạt, bổ sung phần thiếu). Phân đoạn Km 1024 - 1027 đã đủ độ phủ và có thể chốt mốc Baseline kỹ thuật ngay.
          </p>
        </div>

        {/* Các lựa chọn quyết định của PM */}
        <div className="space-y-2.5 pt-1">
          {/* Lựa chọn 1: Khóa phân đoạn đạt chuẩn */}
          <button
            type="button"
            onClick={() => {
              if (onConfirmBaseline) onConfirmBaseline(true)
            }}
            className="w-full p-3 rounded-xl border-2 border-brand-gold bg-amber-50/40 hover:bg-amber-50 text-left flex items-start gap-3 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-brand-gold text-white shrink-0 mt-0.5 group-hover:bg-[#B38E1F]">
              <Icon name="check" size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-brand-dark flex items-center gap-1.5">
                <span>Khóa Baseline Phân Đoạn Đạt Chuẩn (Km 1024 - Km 1027)</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Khuyến nghị</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Khóa mốc dữ liệu gốc cho 3km đạt chuẩn để đưa vào hồ sơ bảo hành. Điểm mù Km 1027+100 sẽ được theo dõi bay bù sau.
              </p>
            </div>
          </button>

          {/* Lựa chọn 2: Bay bù trước để khóa toàn dải */}
          <button
            type="button"
            onClick={() => {
              if (onOpenReFlightFromBaseline) onOpenReFlightFromBaseline()
            }}
            className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left flex items-start gap-3 transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5 group-hover:bg-slate-200">
              <Icon name="flight_takeoff" size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">
                Phát lệnh bay bổ sung trước khi khóa toàn tuyến
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Bay bù Oblique để hoàn thiện tỷ lệ bao phủ dữ liệu toàn dải ${currentSurveyRange} trước khi khóa Baseline số.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsBaselineModalOpen && setIsBaselineModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )}
  </>
  )
}
