import React, { useState, useEffect } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { AIDetectionItem } from './types'

export interface MissionModalsProps {
  isReFlightModalOpen: boolean
  setIsReFlightModalOpen: (open: boolean) => void
  pilotNote: string
  setPilotNote: (note: string) => void
  onSubmitReFlight: (pilot?: string) => void
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

type ReFlightTargetMode = 'BLINDSPOT' | 'CUSTOM'

export const MissionModals: React.FC<MissionModalsProps> = ({
  isReFlightModalOpen,
  setIsReFlightModalOpen,
  pilotNote,
  setPilotNote,
  onSubmitReFlight,
  selectedItem: _selectedItem,
  currentSurveyCode = '#MS-2026-0924',
  currentSurveyRange = 'Km 1024 - 1030',
  coveragePercentage = 87,
  isBaselineModalOpen = false,
  setIsBaselineModalOpen,
  onConfirmBaseline,
  onOpenReFlightFromBaseline,
  reviewedCount = 8,
  totalCount = 8
}) => {
  const [targetMode, setTargetMode] = useState<ReFlightTargetMode>('BLINDSPOT')
  const [customRange, setCustomRange] = useState<string>('Km 1026+500 → Km 1027+500')
  const [cameraAngle, setCameraAngle] = useState<'45' | '60' | '90'>('45')
  const [droneModel, setDroneModel] = useState<string>('DJI Matrice 300 RTK')
  const [gsdReq, setGsdReq] = useState<string>('≤ 0.35 cm/pixel')
  const [selectedPilot, setSelectedPilot] = useState<string>('Lê Hoàng Long (Drone Operator chính)')

  // Tự động sinh nội dung chỉ dẫn kỹ thuật khi đổi đối tượng quét
  useEffect(() => {
    if (targetMode === 'BLINDSPOT') {
      setPilotNote(
        `Bay quét bù dải phân cách giữa tại lý trình Km 1027+100 bằng góc nghiêng Oblique ${cameraAngle}°, bù đắp dữ liệu bị khuất bóng râm và rào chắn.`
      )
    } else if (targetMode === 'CUSTOM') {
      setPilotNote(
        `Bay quét bổ sung đoạn lý trình ${customRange} với góc camera ${cameraAngle}° nhằm kiểm tra hiện trạng mặt đường theo chỉ đạo của Chỉ huy trưởng.`
      )
    }
  }, [targetMode, cameraAngle, customRange, setPilotNote])

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

        {/* Căn cứ kỹ thuật trắc địa (BR-43 & KS11) */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <Icon name="info" size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block mb-0.5">Cơ sở kỹ thuật trắc địa (TCVN & Quy tắc BR-43):</strong>
            <span>
              Độ phủ ảnh trực giao của đợt bay hiện tại đạt <strong>{coveragePercentage}%</strong> (chưa đạt ngưỡng tối thiểu <strong>95%</strong> để Khóa Baseline số). Phát lệnh bay bù Oblique giúp bổ sung dữ liệu góc nghiêng tại khu vực bị khuất bóng râm, cây cối hoặc rào chắn.
            </span>
          </div>
        </div>

        {/* 1. Chọn Đối tượng / Phạm vi bay bù */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            1. Phạm vi lý trình cần bay bổ sung:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Lựa chọn 1: Điểm mù trắc địa đợt bay */}
            <button
              type="button"
              onClick={() => setTargetMode('BLINDSPOT')}
              className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                targetMode === 'BLINDSPOT'
                  ? 'bg-amber-50/60 border-brand-gold ring-1 ring-brand-gold text-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Icon
                  name={targetMode === 'BLINDSPOT' ? 'radio_button_checked' : 'radio_button_unchecked'}
                  size={15}
                  className={targetMode === 'BLINDSPOT' ? 'text-brand-gold' : 'text-slate-400'}
                />
                <span>Điểm mù trắc địa</span>
              </div>
              <span className="text-[11px] text-slate-500 pl-5">
                Km 1027+100 (Độ phủ 68%)
              </span>
            </button>

            {/* Lựa chọn 2: Tùy chỉnh phạm vi */}
            <button
              type="button"
              onClick={() => setTargetMode('CUSTOM')}
              className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                targetMode === 'CUSTOM'
                  ? 'bg-amber-50/60 border-brand-gold ring-1 ring-brand-gold text-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Icon
                  name={targetMode === 'CUSTOM' ? 'radio_button_checked' : 'radio_button_unchecked'}
                  size={15}
                  className={targetMode === 'CUSTOM' ? 'text-brand-gold' : 'text-slate-400'}
                />
                <span>Tùy chỉnh lý trình</span>
              </div>
              <span className="text-[11px] text-slate-500 pl-5">
                Chỉ định tự do
              </span>
            </button>
          </div>

          {targetMode === 'CUSTOM' && (
            <div className="pt-1.5 animate-in fade-in">
              <input
                type="text"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                placeholder="Ví dụ: Km 1025+000 → Km 1026+500"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          )}
        </div>

        {/* 2. Cấu hình góc máy và thiết bị */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Góc nghiêng Gimbal:
            </label>
            <select
              value={cameraAngle}
              onChange={(e) => setCameraAngle(e.target.value as '45' | '60' | '90')}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="45">Oblique 45° (Bù góc khuất vật cản)</option>
              <option value="60">Oblique 60° (Soi sâu khe rãnh dọc)</option>
              <option value="90">Nadir 90° (Quét phẳng trực giao)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Thiết bị Drone:
            </label>
            <select
              value={droneModel}
              onChange={(e) => setDroneModel(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="DJI Matrice 300 RTK">DJI Matrice 300 RTK</option>
              <option value="DJI Mavic 3 Enterprise">DJI Mavic 3 Enterprise</option>
              <option value="Autel EVO II Dual RTK">Autel EVO II Dual RTK</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Độ phân giải GSD yêu cầu:
            </label>
            <select
              value={gsdReq}
              onChange={(e) => setGsdReq(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="≤ 0.35 cm/pixel">≤ 0.35 cm/pixel (Siêu chi tiết)</option>
              <option value="≤ 0.50 cm/pixel">≤ 0.50 cm/pixel (Tiêu chuẩn)</option>
            </select>
          </div>
        </div>

        {/* 3. Chỉ định Drone Operator / Phi công bay (Quy tắc BR-43) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            3. Chỉ định Drone Operator / Phi công điều khiển (Quy tắc BR-43):
          </label>
          <select
            value={selectedPilot}
            onChange={(e) => setSelectedPilot(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="Lê Hoàng Long (Drone Operator chính)">Lê Hoàng Long (Drone Operator chính - Sẵn sàng)</option>
            <option value="Hoàng Quốc Bảo (Pilot RTK Level 3)">Hoàng Quốc Bảo (Pilot RTK Level 3)</option>
            <option value="Trần Quang Khải (Pilot Chuyên gia đo quét)">Trần Quang Khải (Pilot Chuyên gia đo quét)</option>
            <option value="Nguyễn Văn An (Đội bay Hoàng Hải 02)">Nguyễn Văn An (Đội bay Hoàng Hải 02)</option>
          </select>
          <p className="text-[10px] text-slate-500 italic">
            * Theo quy tắc BR-43, PM xác nhận phạm vi bay bổ sung và có toàn quyền chỉ định hoặc thay đổi Operator.
          </p>
        </div>

        {/* 4. Chỉ dẫn kỹ thuật cho Phi công */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              4. Chỉ dẫn kỹ thuật cho Phi công Drone (Có thể chỉnh sửa):
            </label>
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
            * Sau khi bay bù hoàn tất, độ phủ ảnh sẽ tự động cập nhật lên ≥ 95%.
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
              onClick={() => onSubmitReFlight(selectedPilot)}
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

        {/* Nội dung quy tắc BR-40 */}
        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <Icon name="verified" size={16} />
            <span>Quy tắc nghiệp vụ BR-40 (Baseline theo band):</span>
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
                Bay bù Oblique tại Km 1027+100 để nâng tỷ lệ độ phủ lên ≥ 98% toàn dải Km 1024 - 1030 rồi mới khóa toàn bộ.
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
