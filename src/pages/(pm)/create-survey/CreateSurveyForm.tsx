import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { ProjectRouteConfig, AvailablePilot } from './types'
import { OverlapHelpBox } from './OverlapHelpBox'

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
  surveyType: 'PERIODIC' | 'AD_HOC' | 'BASELINE'
  setSurveyType: (t: 'PERIODIC' | 'AD_HOC' | 'BASELINE') => void
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
  onClearError?: () => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export const CreateSurveyForm: React.FC<CreateSurveyFormProps> = ({
  projects,
  projectId,
  onProjectChange,
  currentProject,
  startKm,
  setStartKm,
  endKm,
  setEndKm,
  altitudeMode,
  setAltitudeMode,
  presetAltitude,
  setPresetAltitude,
  customAltitude,
  setCustomAltitude,
  gsdCmPx,
  overlap,
  setOverlap,
  overlapMode,
  setOverlapMode,
  customOverlapForward,
  setCustomOverlapForward,
  customOverlapSide,
  setCustomOverlapSide,
  showOverlapHelp,
  setShowOverlapHelp,
  date,
  setDate,
  surveyType,
  setSurveyType,
  pilots,
  pilotId,
  setPilotId,
  notes,
  setNotes,
  hasBaseline = false,
  hasActivePeriodic = false,
  hasActiveAdHoc = false,
  conflictReason = null,
  errorMessage,
  onClearError,
  onSubmit,
  onCancel
}) => {
  const selectedPilot = pilots.find((p) => p.id === pilotId) || pilots[0]

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
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs flex flex-col gap-4 z-30">
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
                            (Km {p.startKm.toFixed(p.startKm % 1 !== 0 ? 3 : 1)} → Km {p.endKm.toFixed(p.endKm % 1 !== 0 ? 3 : 1)})
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

        {/* 1.2 LÝ TRÌNH BẮT ĐẦU & KẾT THÚC */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Lý Trình Bắt Đầu (Km)
            </label>
            <input
              type="number"
              step="0.001"
              disabled={!currentProject.hasAlignment}
              min={currentProject.startKm}
              max={currentProject.endKm}
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
              required
              className={`w-full px-3.5 py-2 text-sm font-mono font-bold text-[#1A1D20] border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] ${
                !currentProject.hasAlignment ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'
              }`}
            />
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              {currentProject.hasAlignment ? `Giới hạn tuyến: Km ${currentProject.startKm}` : 'Chưa có tim tuyến'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Lý Trình Kết Thúc (Km)
            </label>
            <input
              type="number"
              step="0.001"
              disabled={!currentProject.hasAlignment}
              min={currentProject.startKm}
              max={currentProject.endKm}
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
              required
              className={`w-full px-3.5 py-2 text-sm font-mono font-bold text-[#1A1D20] border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] ${
                !currentProject.hasAlignment ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'
              }`}
            />
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              {currentProject.hasAlignment ? `Đến tối đa: Km ${currentProject.endKm}` : 'Chưa có tim tuyến'}
            </span>
          </div>
        </div>
      </div>

      {/* THẺ 2: THAM SỐ KỸ THUẬT BAY & TRẮC ĐỊA (#C9A227 Gold) */}
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col gap-4 z-20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] to-amber-200" />
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDEFF2]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Tham số kỹ thuật bay &amp; Trắc địa
          </h2>
        </div>

        {/* 2.1 ĐỘ CAO BAY THIẾT KẾ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider">
              Độ Cao Bay Thiết Kế (m)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAltitudeMode('preset')}
                className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all ${
                  altitudeMode === 'preset'
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tiêu chuẩn
              </button>
              <button
                type="button"
                onClick={() => setAltitudeMode('custom')}
                className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all ${
                  altitudeMode === 'custom'
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tùy chỉnh (Tự nhập)
              </button>
            </div>
          </div>

          {altitudeMode === 'preset' ? (
            <select
              value={presetAltitude}
              onChange={(e) => setPresetAltitude(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] font-medium cursor-pointer text-[#1A1D20]"
            >
              <option value="50">50m (GSD: 1.1 cm/px — Siêu nét, phát hiện nứt tóc vi mô)</option>
              <option value="65">65m (GSD: 1.4 cm/px — Tiêu chuẩn trắc địa TCVN)</option>
              <option value="80">80m (GSD: 1.8 cm/px — Tốc độ cao, tối ưu pin)</option>
              <option value="100">100m (GSD: 2.2 cm/px — Khảo sát tổng quan nền đường)</option>
            </select>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="30"
                  max="120"
                  step="1"
                  value={customAltitude}
                  onChange={(e) => setCustomAltitude(e.target.value)}
                  placeholder="Nhập độ cao (30 - 120m)..."
                  className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] pr-12 text-[#1A1D20]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mét</span>
              </div>
              <div className="bg-[#FEF3E2] border border-amber-200 px-3 py-2 rounded-[10px] text-xs font-mono text-[#8F7212] whitespace-nowrap">
                Độ phân giải GSD: <strong>~{gsdCmPx} cm/px</strong>
              </div>
            </div>
          )}
          <p className="text-[10px] text-slate-500">
            Trần bay quy định: Tối đa 120m AGL. Độ cao càng thấp thì ảnh trắc địa càng nét nhưng thời gian bay tăng.
          </p>
        </div>

        {/* 2.2 ĐỘ PHỦ CHỒNG ẢNH TRẮC ĐỊA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider">
              Độ Phủ Chồng Ảnh Trắc Địa
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOverlapMode('preset')}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all ${
                    overlapMode === 'preset'
                      ? 'bg-[#C9A227] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tiêu chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => setOverlapMode('custom')}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all ${
                    overlapMode === 'custom'
                      ? 'bg-[#C9A227] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tùy chỉnh (Tự nhập)
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowOverlapHelp(!showOverlapHelp)}
                className="text-[11px] text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer font-bold ml-1"
              >
                <Icon name="help_outline" size={14} className="text-[#C9A227]" />
                <span>{showOverlapHelp ? 'Thu gọn' : 'Trợ giúp'}</span>
              </button>
            </div>
          </div>

          {overlapMode === 'preset' ? (
            <select
              value={overlap}
              onChange={(e) => setOverlap(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] font-medium cursor-pointer text-[#1A1D20]"
            >
              <option value="80">80% Dọc / 70% Ngang (Khuyên dùng cho AI phát hiện vết nứt)</option>
              <option value="85">85% Dọc / 75% Ngang (Dựng mô hình 3D đám mây điểm tấm Slab)</option>
              <option value="75">75% Dọc / 65% Ngang (Bay nhanh tiết kiệm pin cho đường thẳng)</option>
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="95"
                  step="1"
                  value={customOverlapForward}
                  onChange={(e) => setCustomOverlapForward(e.target.value)}
                  placeholder="Độ phủ dọc (%)..."
                  className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] pr-12 text-[#1A1D20]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">% Dọc</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="40"
                  max="90"
                  step="1"
                  value={customOverlapSide}
                  onChange={(e) => setCustomOverlapSide(e.target.value)}
                  placeholder="Độ phủ ngang (%)..."
                  className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] pr-12 text-[#1A1D20]"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">% Ngang</span>
              </div>
            </div>
          )}

          {showOverlapHelp && <OverlapHelpBox />}
        </div>
      </div>

      {/* THẺ 3: KẾ HOẠCH BAY & PHI CÔNG THIẾT BỊ BAY (#047857 Emerald) */}
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col gap-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#047857] to-emerald-200" />
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDEFF2]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#047857] ring-4 ring-[#047857]/20" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            3. Lập lịch &amp; Chỉ định phi công thiết bị bay
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Loại Hình Khảo Sát
            </label>
            <select
              value={surveyType}
              onChange={(e) => {
                setSurveyType(e.target.value as any)
                onClearError?.()
              }}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-[10px] focus:outline-none focus:ring-1 font-medium cursor-pointer text-[#1A1D20] ${
                conflictReason
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-[#E2E5E9] focus:ring-[#C9A227] focus:border-[#C9A227]'
              }`}
            >
              <option value="PERIODIC">
                Định kỳ (PERIODIC) {hasActivePeriodic ? '— Đã có đợt bay chưa xong' : ''}
              </option>
              <option value="AD_HOC">
                Đột xuất / Sự cố (AD_HOC) {hasActiveAdHoc ? '— Đã có đợt bay chưa xong' : ''}
              </option>
              <option value="BASELINE" disabled={hasBaseline}>
                Khảo sát cơ sở (BASELINE) {hasBaseline ? '— Đã thiết lập mốc Baseline' : ''}
              </option>
            </select>
            {conflictReason ? (
              <span className="text-[11px] font-semibold text-rose-600 mt-1.5 flex items-center gap-1 leading-tight">
                <Icon name="error_outline" size={13} className="shrink-0 text-rose-500" />
                <span>{conflictReason}</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 mt-1 block">
                {surveyType === 'PERIODIC' && 'Khảo sát định kỳ theo dõi nứt lún.'}
                {surveyType === 'AD_HOC' && 'Khảo sát đột xuất, kiểm tra đột xuất hiện trường.'}
                {surveyType === 'BASELINE' && 'Khảo sát mốc dữ liệu mặt đường ban đầu.'}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Ngày Bay Dự Kiến
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-[#1A1D20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Chỉ định phi công thiết bị bay
            </label>
            <select
              value={pilotId}
              onChange={(e) => setPilotId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] font-medium cursor-pointer text-[#1A1D20]"
            >
              {pilots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.roleLabel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* THẺ 4: GHI CHÚ KỸ THUẬT & BAN HÀNH LỆNH BAY */}
      <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-5 shadow-2xs overflow-hidden flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#EDEFF2]">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-4 ring-slate-200" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            4. Ghi chú kỹ thuật &amp; Phê chuẩn
          </h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
            Ghi Chú Kỹ Thuật &amp; Yêu Cầu An Toàn
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-[#1A1D20]"
            placeholder="Nhập ghi chú yêu cầu bay cao, tránh đường dây điện cao thế..."
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDEFF2]">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            disabled={!currentProject.hasAlignment || Boolean(conflictReason)}
            title={
              !currentProject.hasAlignment
                ? 'Dự án chưa có tim tuyến kỹ thuật để lập kế hoạch bay'
                : conflictReason || ''
            }
            icon={<Icon name="flight_takeoff" size={16} className="text-white" />}
          >
            Ban Hành Lệnh Bay Khảo Sát
          </Button>
        </div>
      </div>
    </form>
  )
}
