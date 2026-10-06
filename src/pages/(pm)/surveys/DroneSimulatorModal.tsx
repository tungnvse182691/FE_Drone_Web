import React from 'react'
import {
  Radio,
  X,
  PlaneTakeoff,
  Camera,
  Cpu,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Play,
  Sparkles
} from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  MÃ´ Phá»ng Chuyáº¿n Bay Drone (Flight Simulator)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  RTK FIX â€¢ {mission.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                MÃ´ phá»ng quÃ¡ trÃ¬nh cáº¥t cÃ¡nh, thu náº¡p 1,920 khÃ´ng áº£nh 4K vÃ  kÃ­ch hoáº¡t pipeline AI Road-YOLOv9
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Mission Summary Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-800">{mission.title}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {mission.project_name} â€¢ {mission.start_km} â†’ {mission.end_km}
              </div>
              <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                <span>Phi cÃ´ng: <strong>{mission.pilot_name}</strong></span>
                <span>â€¢</span>
                <span>Thiáº¿t bá»‹: <strong>{mission.drone_model}</strong></span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                mission.status === 'PENDING_AI_REVIEW'
                  ? 'bg-amber-100 text-[#8F7212] border-amber-300'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {mission.status === 'PENDING_AI_REVIEW' ? 'Chá» Tháº©m Äá»‹nh AI' : 'Äang LÃªn Lá»‹ch (SCHEDULED)'}
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
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Tiáº¿n TrÃ¬nh Chuyáº¿n Bay &amp; Pipeline AI</span>
              <span className="text-indigo-600 font-mono">
                {simStep === 'IDLE' && 'Sáºµn sÃ ng khá»Ÿi Ä‘á»™ng'}
                {simStep === 'FLYING' && 'Giai Ä‘oáº¡n 1/3: Bay quÃ©t hÃ nh lang'}
                {simStep === 'INGESTING' && 'Giai Ä‘oáº¡n 2/3: Truyá»n áº£nh trá»±c giao 4K'}
                {simStep === 'AI_SCANNING' && 'Giai Ä‘oáº¡n 3/3: Pipeline AI phÃ¡t hiá»‡n lá»—i'}
                {simStep === 'COMPLETED' && 'HoÃ n thÃ nh 100%'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Step 1 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                simStep === 'FLYING'
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                  : simFlightProgress === 100
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {simFlightProgress === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : simStep === 'FLYING' ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <PlaneTakeoff className="w-4 h-4 text-slate-400" />
                  )}
                  <span>1. QuÃ©t Waypoints RTK</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tá»± Ä‘á»™ng bay theo tá»a Ä‘á»™ tráº¯c dá»c Km 1036 â†’ Km 1042.
                </p>
                {simStep === 'FLYING' && (
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-200"
                      style={{ width: `${simFlightProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                simStep === 'INGESTING'
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                  : simPhotosCount === 1920
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {simPhotosCount === 1920 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : simStep === 'INGESTING' ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-slate-400" />
                  )}
                  <span>2. Náº¡p áº¢nh Trá»±c Giao</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Náº¡p 1,920 áº£nh 4K vÃ  trÃ­ch xuáº¥t EXIF GPS, Ä‘á»™ cao, gÃ³c chá»¥p.
                </p>
                {simStep === 'INGESTING' && (
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-150"
                      style={{ width: `${(simPhotosCount / 1920) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border text-xs transition-all ${
                simStep === 'AI_SCANNING'
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200'
                  : simStep === 'COMPLETED'
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {simStep === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : simStep === 'AI_SCANNING' ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <Cpu className="w-4 h-4 text-slate-400" />
                  )}
                  <span>3. Road-YOLOv9 QuÃ©t Lá»—i</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  PhÃ¡t hiá»‡n váº¿t ná»©t, á»• gÃ , lÃºn vá»‡t bÃ¡nh xe ({simDefectCount} khiáº¿m khuyáº¿t).
                </p>
                {simStep === 'AI_SCANNING' && (
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-amber-500 h-full transition-all duration-200"
                      style={{ width: `${(simDefectCount / 8) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completion Success Callout */}
          {simStep === 'COMPLETED' && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">
                    Chuyáº¿n bay mÃ´ phá»ng Ä‘Ã£ hoÃ n táº¥t thÃ nh cÃ´ng!
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Nhiá»‡m vá»¥ [{mission.code}] Ä‘Ã£ chuyá»ƒn sang <strong>PENDING_AI_REVIEW</strong>. ÄÃ£ sáºµn sÃ ng má»Ÿ Canvas Ä‘á»ƒ Project Manager tháº©m Ä‘á»‹nh bounding box!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            ÄÃ³ng
          </button>

          <div className="flex items-center gap-2">
            {simStep === 'IDLE' && (
              <button
                type="button"
                onClick={onRunSimulation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Báº¯t Äáº§u MÃ´ Phá»ng Bay Ngay</span>
              </button>
            )}

            {(simStep === 'FLYING' || simStep === 'INGESTING' || simStep === 'AI_SCANNING') && (
              <button
                disabled
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-300 text-slate-600 text-xs font-bold cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Äang MÃ´ Phá»ng &amp; Xá»­ LÃ½ Pipeline...</span>
              </button>
            )}

            {simStep === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onNavigate(`${basePath}/surveys/${mission.id}/review`)
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Má»Ÿ Canvas Tháº©m Äá»‹nh AI (WF-09) âž”</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
