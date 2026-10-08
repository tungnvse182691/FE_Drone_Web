import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { type SurveyMissionItem as SurveyMission } from '../../../api/services'
import { SimulatorTelemetryGrid } from './SimulatorTelemetryGrid'

interface DroneSimulatorModalProps {
  isOpen: boolean
  mission: SurveyMission | null
  simStep: 'IDLE' | 'FLYING' | 'INGESTING' | 'AI_SCANNING' | 'COMPLETED'
  simFlightProgress: number
  simPhotosCount: number
  simDefectCount: number
  simAltitude: number
  simSpeed: number
  simBattery: number
  basePath: string
  onClose: () => void
  onRunSimulation: () => void
  onNavigate: (path: string) => void
}

export const DroneSimulatorModal: React.FC<DroneSimulatorModalProps> = ({
  isOpen,
  mission,
  simStep,
  simFlightProgress,
  simPhotosCount,
  simDefectCount,
  simAltitude,
  simSpeed,
  simBattery,
  basePath,
  onClose,
  onRunSimulation,
  onNavigate
}) => {
  if (!isOpen || !mission) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E2E5E9] w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1A1D20] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-[#C9A227] border border-amber-500/30 flex items-center justify-center">
              <Icon name="sensors" size={20} className="text-[#C9A227]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight font-sansation">
                  Mô Phỏng Chuyến Bay Drone (Flight Simulator)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-900/60 text-amber-300 border border-amber-700/50">
                  RTK FIX • {mission.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mô phỏng quá trình cất cánh, thu nạp 1,920 không ảnh 4K và kích hoạt pipeline AI Road-YOLOv9
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Mission Summary Banner */}
          <div className="bg-[#F8F9FA] border border-[#E2E5E9] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#1A1D20]">{mission.title}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {mission.project_name} • {mission.start_km} → {mission.end_km}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                <span>Phi công: <strong>{mission.pilot_name}</strong></span>
                <span>•</span>
                <span>Thiết bị: <strong>{mission.drone_model}</strong></span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                mission.status === 'PENDING_AI_REVIEW'
                  ? 'bg-[#FEF3E2] text-[#F59E0B] border-amber-200'
                  : 'bg-slate-100 text-[#2D3748] border-[#E2E5E9]'
              }`}>
                {mission.status === 'PENDING_AI_REVIEW' ? 'Chờ Thẩm Định AI' : 'Đang Lên Lịch (SCHEDULED)'}
              </span>
            </div>
          </div>

          {/* Live Telemetry Display */}
          <SimulatorTelemetryGrid
            altitude={simAltitude}
            speed={simSpeed}
            photosCount={simPhotosCount}
            battery={simBattery}
          />

          {/* Progress Steps Timeline */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-[#2D3748] uppercase tracking-wider flex items-center justify-between">
              <span>Tiến Trình Chuyến Bay & Pipeline AI</span>
              <span className="text-[#C9A227] font-mono font-medium">
                {simStep === 'IDLE' && 'Sẵn sàng khởi động'}
                {simStep === 'FLYING' && 'Giai đoạn 1/3: Bay quét hành lang'}
                {simStep === 'INGESTING' && 'Giai đoạn 2/3: Truyền ảnh trực giao 4K'}
                {simStep === 'AI_SCANNING' && 'Giai đoạn 3/3: Pipeline AI phát hiện lỗi'}
                {simStep === 'COMPLETED' && 'Hoàn thành 100%'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                simStep === 'FLYING'
                  ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                  : simFlightProgress === 100
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                  : 'bg-[#F8F9FA] border-[#E2E5E9] text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {simFlightProgress === 100 ? (
                    <Icon name="check_circle" size={16} className="text-[#2F9E44]" />
                  ) : simStep === 'FLYING' ? (
                    <Icon name="sync" size={16} className="text-[#C9A227] animate-spin" />
                  ) : (
                    <Icon name="flight_takeoff" size={16} className="text-slate-400" />
                  )}
                  <span>1. Quét Waypoints RTK</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tự động bay theo tọa độ trắc dọc {mission.start_km} → {mission.end_km}.
                </p>
                {simStep === 'FLYING' && (
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#C9A227] h-full transition-all duration-200"
                      style={{ width: `${simFlightProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                simStep === 'INGESTING'
                  ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                  : simPhotosCount === 1920
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                  : 'bg-[#F8F9FA] border-[#E2E5E9] text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {simPhotosCount === 1920 ? (
                    <Icon name="check_circle" size={16} className="text-[#2F9E44]" />
                  ) : simStep === 'INGESTING' ? (
                    <Icon name="sync" size={16} className="text-[#C9A227] animate-spin" />
                  ) : (
                    <Icon name="photo_camera" size={16} className="text-slate-400" />
                  )}
                  <span>2. Nạp Ảnh Trực Giao</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nạp 1,920 ảnh 4K và trích xuất EXIF GPS, độ cao, góc chụp.
                </p>
                {simStep === 'INGESTING' && (
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#C9A227] h-full transition-all duration-150"
                      style={{ width: `${(simPhotosCount / 1920) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                simStep === 'AI_SCANNING'
                  ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                  : simStep === 'COMPLETED'
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                  : 'bg-[#F8F9FA] border-[#E2E5E9] text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {simStep === 'COMPLETED' ? (
                    <Icon name="check_circle" size={16} className="text-[#2F9E44]" />
                  ) : simStep === 'AI_SCANNING' ? (
                    <Icon name="sync" size={16} className="text-[#C9A227] animate-spin" />
                  ) : (
                    <Icon name="memory" size={16} className="text-slate-400" />
                  )}
                  <span>3. Road-YOLOv9 Quét Lỗi</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Phát hiện vết nứt, ổ gà, lún vệt bánh xe ({simDefectCount} khiếm khuyết).
                </p>
                {simStep === 'AI_SCANNING' && (
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#F59E0B] h-full transition-all duration-200"
                      style={{ width: `${(simDefectCount / 8) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completion Success Callout */}
          {simStep === 'COMPLETED' && (
            <div className="bg-[#E9F7EC] border border-[#2F9E44]/40 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2F9E44] text-white flex items-center justify-center shrink-0">
                  <Icon name="verified" size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">
                    Chuyến bay mô phỏng đã hoàn tất thành công!
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Nhiệm vụ [{mission.code}] đã chuyển sang <strong>PENDING_AI_REVIEW</strong>. Đã sẵn sàng mở Canvas để Project Manager thẩm định bounding box!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-[#F8F9FA] border-t border-[#E2E5E9] px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#E2E5E9] text-[#1A1D20] text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {simStep === 'IDLE' && (
              <button
                type="button"
                onClick={onRunSimulation}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2D3748] hover:bg-[#1A1D20] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Icon name="play_arrow" size={16} className="text-white" />
                <span>Bắt Đầu Mô Phỏng Bay Ngay</span>
              </button>
            )}

            {(simStep === 'FLYING' || simStep === 'INGESTING' || simStep === 'AI_SCANNING') && (
              <button
                disabled
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-500 text-xs font-semibold cursor-not-allowed"
              >
                <Icon name="sync" size={16} className="animate-spin text-slate-500" />
                <span>Đang Mô Phỏng & Xử Lý Pipeline...</span>
              </button>
            )}

            {simStep === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onNavigate(`${basePath}/surveys/${mission.id}/review`)
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Icon name="auto_awesome" size={16} className="text-white" />
                <span>Mở Canvas Thẩm Định AI (WF-09)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
