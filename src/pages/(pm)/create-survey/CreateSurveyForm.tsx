import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { ProjectRouteConfig, AvailablePilot } from './types'

interface CreateSurveyFormProps {
  projects: ProjectRouteConfig[]
  projectId: string
  onProjectChange: (id: string) => void
  currentProject: ProjectRouteConfig
  startKm: string
  setStartKm: (val: string) => void
  endKm: string
  setEndKm: (val: string) => void
  altitudeMode: 'preset' | 'custom'
  setAltitudeMode: (mode: 'preset' | 'custom') => void
  presetAltitude: string
  setPresetAltitude: (val: string) => void
  customAltitude: string
  setCustomAltitude: (val: string) => void
  gsdCmPx: string
  overlap: string
  setOverlap: (val: string) => void
  overlapMode: 'preset' | 'custom'
  setOverlapMode: (mode: 'preset' | 'custom') => void
  customOverlapForward: string
  setCustomOverlapForward: (val: string) => void
  customOverlapSide: string
  setCustomOverlapSide: (val: string) => void
  showOverlapHelp: boolean
  setShowOverlapHelp: (val: boolean) => void
  date: string
  setDate: (val: string) => void
  dueAt?: string
  setDueAt?: (value:string)=>void
  commandBusy?: boolean
  recoveryLabel?: string
  resultVerified?: boolean
  onViewResult?: () => void
  scopeError?: string
  scopeSummary?: string
  targetBand?: string
  onTargetBandChange?: (value:string)=>void
  commandBlockedReason?: string
  operatorError?: string
  operatorLoading?: boolean
  onRetryOperators?: ()=>void
  surveyType: 'PERIODIC' | 'AD_HOC' | 'BASELINE' | ''
  setSurveyType: (t: 'PERIODIC' | 'AD_HOC' | 'BASELINE' | '') => void
  pilots: AvailablePilot[]
  pilotId: string
  setPilotId: (val: string) => void
  notes: string
  setNotes: (val: string) => void
  hasBaseline?: boolean
  hasActivePeriodic?: boolean
  hasActiveAdHoc?: boolean
  conflictReason?: string | null
  errorMessage?: string | null
  errorActions?: React.ReactNode
  onClearError?: () => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export const CreateSurveyForm: React.FC<CreateSurveyFormProps> = ({
  dueAt='',setDueAt,commandBusy=false,recoveryLabel,resultVerified=false,onViewResult,scopeError='',
  scopeSummary = '', targetBand = '', onTargetBandChange, commandBlockedReason = '', operatorError = '', operatorLoading = false, onRetryOperators,
  projects,
  projectId,
  onProjectChange,
  currentProject,
  startKm,
  setStartKm,
  endKm,
  setEndKm,
  date,
  setDate,
  surveyType,
  setSurveyType,
  pilots,
  pilotId,
  setPilotId,
  hasBaseline = false,
  hasActivePeriodic = false,
  hasActiveAdHoc = false,
  conflictReason = null,
  errorMessage,
  errorActions,
  onClearError,
  onSubmit,
  onCancel
}) => {

  // State đóng / mở Menu dropdown chọn dự án
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <form onSubmit={onSubmit} className="space-y-5 font-body">
      {/* THẺ 1: HÀNH LANG & TUYẾN ĐƯỜNG KHẢO SÁT (#1E40AF Blue) */}
      <fieldset disabled={commandBusy || !!recoveryLabel} className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs flex flex-col gap-4 z-30 min-w-0">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1E40AF] to-blue-200 rounded-t-[20px]" />
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDEFF2]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] ring-4 ring-[#1E40AF]/20" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Hành lang &amp; Tuyến đường khảo sát
          </h2>
        </div>

        {/* 1.1 DỰ ÁN & TUYẾN ĐƯỜNG KHẢO SÁT (TẢI 100% TỪ CSDL BACKEND) */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
            Dự Án / Tuyến Đường Khảo Sát
          </label>

          {/* Trigger chọn dự án */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-white border border-[#E2E5E9] rounded-[10px] hover:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all cursor-pointer text-left shadow-2xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Icon name="route" size={18} className="text-[#1E40AF] shrink-0" />
              <span className="font-semibold text-[#1A1D20] truncate">
                [{currentProject.code}] {currentProject.name}
              </span>
            </div>
            <Icon
              name={isDropdownOpen ? 'expand_less' : 'expand_more'}
              size={20}
              className="text-slate-400 shrink-0 transition-transform"
            />
          </button>

          {/* Menu danh sách dự án thật từ CSDL */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#CBD5E1] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-150 ring-1 ring-black/5">
              {projects.map((p) => {
                const isSelected = p.id === projectId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onProjectChange(p.id)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 font-bold border-l-4 border-[#C9A227] shadow-2xs'
                        : 'text-[#1A1D20] hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        name="route"
                        size={16}
                        className={isSelected ? 'text-[#C9A227]' : 'text-slate-400'}
                      />
                      <div className="truncate">
                        <span className="font-bold text-slate-800">[{p.code}]</span> {p.name}
                        {p.hasAlignment ? (
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">
                            (Km {p.startKm} → Km {p.endKm})
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md ml-2 font-semibold">
                            Chưa có tim tuyến
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Icon name="check" size={16} className="text-[#C9A227] shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {currentProject.serverSet && <div className="mt-2 text-xs text-slate-600 space-y-1"><p>Route {currentProject.routeVersionId} · Set {currentProject.serverSet.id} · PUBLISHED</p><p>Contract chỉ nhận nguyên segment. Mốc hợp lệ (m): {currentProject.serverSet.segments.map(s=>`${s.sequence}: ${s.startStationMeters}–${s.endStationMeters}`).join('; ')}</p><label className="block">Dải khảo sát<select aria-label="Dải khảo sát server" value={targetBand} onChange={e=>onTargetBandChange?.(e.target.value)} className="ml-2 border rounded-lg p-1"><option value="">Chọn dải</option><option value="SURFACE">Mặt đường (SURFACE)</option><option value="LEFT_EDGE">Mép trái (LEFT_EDGE)</option><option value="RIGHT_EDGE">Mép phải (RIGHT_EDGE)</option></select></label></div>}
          {scopeSummary && <p role="status" className="text-xs text-slate-600 break-all">{scopeSummary}</p>}
          {/* Thông tin phụ trợ */}
          <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5 px-0.5">
            <Icon name="info" size={13} className="text-slate-400 shrink-0" />
            <span>
              {currentProject.hasAlignment ? (
                <>
                  Đang chọn dự án <strong>[{currentProject.code}] {currentProject.name}</strong> • Chiều dài:{' '}
                  {currentProject.lengthKm} km (Km {currentProject.startKm} → Km {currentProject.endKm}).
                </>
              ) : (
                <span className="text-amber-800 font-semibold">
                  Dự án <strong>[{currentProject.code}] {currentProject.name}</strong> chưa có tim tuyến được phê duyệt trong hệ thống.
                </span>
              )}
            </span>
          </div>

          {/* Banner cảnh báo nếu dự án chưa có tim tuyến */}
          {!currentProject.hasAlignment && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 leading-relaxed">
              <Icon name="warning" size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Dự án chưa có tim tuyến kỹ thuật:</strong> Dự án này chưa được Chỉ huy trưởng (PM) lập tim tuyến hoặc chưa được Giám sát (Supervisor) phê duyệt. Bạn cần vào màn hình <strong>Dự án bảo hành → Thiết lập tim tuyến</strong> để hoàn thiện tim tuyến trước khi ban hành lệnh bay khảo sát.
              </div>
            </div>
          )}
        </div>

        {scopeError && <p role="alert" className="text-xs text-rose-700">{scopeError}</p>}
        {/* 1.2 LÝ TRÌNH BẮT ĐẦU & KẾT THÚC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Lý Trình Bắt Đầu (Km)
            </label>
            <select aria-label="Lý trình bắt đầu theo segment" value={startKm} disabled={!currentProject.serverSet} onChange={e=>setStartKm(e.target.value)} required className="w-full px-3.5 py-2 text-sm font-mono font-bold border border-[#E2E5E9] rounded-[10px]"><option value="">Chọn mốc segment</option>{currentProject.serverSet?.segments.map(s=><option key={s.id} value={String(s.startStationMeters / 1000)}>Km {s.startStationMeters / 1000} · {s.id}</option>)}</select>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              {currentProject.hasAlignment ? `Giới hạn tuyến: Km ${currentProject.startKm}` : 'Chưa có tim tuyến'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Lý Trình Kết Thúc (Km)
            </label>
            <select aria-label="Lý trình kết thúc theo segment" value={endKm} disabled={!currentProject.serverSet} onChange={e=>setEndKm(e.target.value)} required className="w-full px-3.5 py-2 text-sm font-mono font-bold border border-[#E2E5E9] rounded-[10px]"><option value="">Chọn mốc segment</option>{currentProject.serverSet?.segments.map(s=><option key={s.id} value={String(s.endStationMeters / 1000)}>Km {s.endStationMeters / 1000} · {s.id}</option>)}</select>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              {currentProject.hasAlignment ? `Đến tối đa: Km ${currentProject.endKm}` : 'Chưa có tim tuyến'}
            </span>
          </div>
        </div>
      </fieldset>

      {/* THẺ 2: KẾ HOẠCH BAY & PHI CÔNG THIẾT BỊ BAY (#047857 Emerald) */}
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] to-emerald-200" />
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDEFF2]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#047857] ring-4 ring-[#047857]/20" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Lập lịch &amp; Chỉ định phi công thiết bị bay
          </h2>
        </div>

        <fieldset disabled={commandBusy || !!recoveryLabel} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start border-0 p-0 m-0 min-w-0">
          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5 break-words">
              Loại Hình Khảo Sát
            </label>
            <select
              aria-label="Loại khảo sát"
              value={surveyType}
              onChange={(e) => {
                setSurveyType(e.target.value as any)
                onClearError?.()
              }}
              className={`w-full h-10 px-3.5 py-2 text-sm bg-white border rounded-[10px] focus:outline-none focus:ring-1 font-medium cursor-pointer text-[#1A1D20] ${
                conflictReason
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-[#E2E5E9] focus:ring-[#C9A227] focus:border-[#C9A227]'
              }`}
            >
              <option value="">Chọn loại khảo sát</option>
              <option value="PERIODIC">
                Định kỳ {hasActivePeriodic ? '— Đã có đợt bay chưa xong' : ''}
              </option>
              <option value="AD_HOC">
                Đột xuất / Sự cố {hasActiveAdHoc ? '— Đã có đợt bay chưa xong' : ''}
              </option>
              <option value="BASELINE" disabled={hasBaseline}>
                Khảo sát cơ sở {hasBaseline ? '— Đã thiết lập mốc Baseline' : ''}
              </option>
            </select>
            <span className="text-[10px] text-slate-500 mt-1.5 block">Loại khảo sát sẽ gửi cùng kế hoạch và nhiệm vụ.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5 break-words">
              Lịch Bay Dự Kiến
            </label>
            <input
              type="datetime-local"
              aria-label="Ngày bay dự kiến"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-10 px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-[#1A1D20]"
            />
            <span className="text-[10px] text-slate-500 mt-1.5 block">
              Thời gian cất cánh ngoài thực địa.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5 break-words">
              Phi công điều khiển Drone
            </label>
            <select
              aria-label="Operator hiệu lực"
              disabled={operatorLoading}
              value={pilotId}
              onChange={(e) => setPilotId(e.target.value)}
              className="w-full h-10 px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] font-medium cursor-pointer text-[#1A1D20]"
            >
              <option value="">{operatorLoading ? 'Đang đọc membership Operator…' : 'Chọn Operator hiệu lực'}</option>
              {pilots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1.5 block">
              {operatorError || 'Chọn đúng Operator ID từ membership hiệu lực của dự án.'}
              {operatorError && <button type="button" aria-label="Operator hiệu lực"
              disabled={operatorLoading} onClick={onRetryOperators} className="ml-2 underline">Đọc lại Operator</button>}
            </span>
          </div>
          <label className="block min-w-0 text-xs font-semibold text-slate-700 sm:col-span-3">Hạn hoàn thành nhiệm vụ (tùy chọn)<input type="datetime-local" aria-label="Hạn hoàn thành nhiệm vụ" value={dueAt} onChange={e=>setDueAt?.(e.target.value)} className="mt-1 w-full h-10 px-3 border border-[#E2E5E9] rounded-[10px]" /></label>
        </fieldset>
      </div>

      <div className="space-y-3">
        {!recoveryLabel && conflictReason && <p role="alert" className="text-xs text-rose-700">{conflictReason}</p>}
        {errorMessage && <p role="alert" className="text-xs text-rose-700">{errorMessage}</p>}
        {errorMessage && errorActions}
        {commandBlockedReason && <p role="alert" className="text-xs text-rose-700">{commandBlockedReason}</p>}
        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDEFF2]">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy bỏ
          </Button>
          <Button
            type={resultVerified ? 'button' : 'submit'}
            onClick={resultVerified ? onViewResult : undefined}
            disabled={commandBusy || !!commandBlockedReason || !recoveryLabel && (!currentProject.hasAlignment || Boolean(conflictReason) || !!scopeError)}
            title={
              commandBlockedReason || (!currentProject.hasAlignment
                ? 'Dự án chưa có tim tuyến kỹ thuật để lập kế hoạch bay'
                : conflictReason || '')
            }
            icon={<Icon name="flight_takeoff" size={16} className="text-white" />}
          >
            {commandBusy?'Đang tạo/đọc lại…':recoveryLabel || 'Tạo kế hoạch và giao nhiệm vụ'}
          </Button>
        </div>
      </div>
    </form>
  )
}
