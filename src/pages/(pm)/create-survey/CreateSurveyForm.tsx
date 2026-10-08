import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { InputField } from '../../../components/ui/InputField'
import { Icon } from '../../../components/ui/Icon'
import { ProjectRouteConfig, AvailablePilot } from './types'
import { INITIAL_SURVEY_ROUTES } from '../../../api/services/surveyService'
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
  showOverlapHelp: boolean
  setShowOverlapHelp: (val: boolean) => void
  date: string
  setDate: (val: string) => void
  pilots: AvailablePilot[]
  pilotId: string
  setPilotId: (val: string) => void
  notes: string
  setNotes: (val: string) => void
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
  showOverlapHelp,
  setShowOverlapHelp,
  date,
  setDate,
  pilots,
  pilotId,
  setPilotId,
  notes,
  setNotes,
  onSubmit,
  onCancel
}) => {
  const selectedPilot = pilots.find((p) => p.id === pilotId)

  // State đóng / mở Menu dropdown xổ xuống
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

  // State quản lý việc ẩn / hiện các tuyến phụ của từng tuyến chính
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Record<string, boolean>>({})

  const toggleGroupCollapse = (mainlineId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setCollapsedGroupIds((prev) => ({
      ...prev,
      [mainlineId]: !prev[mainlineId]
    }))
  }

  // Gom nhóm dữ liệu theo Tuyến chính và các Tuyến phụ con
  const routeTreeGroups = useMemo(() => {
    // Đảm bảo luôn có đầy đủ tuyến chính và tuyến phụ
    const sourceProjects =
      projects && projects.some((p) => p.type === 'BRANCH') ? projects : INITIAL_SURVEY_ROUTES

    const mainlines = sourceProjects.filter((p) => p.type === 'MAINLINE' || !p.type)
    return mainlines.map((mainline) => {
      const branches = sourceProjects.filter(
        (p) =>
          p.type === 'BRANCH' &&
          (p.parentProjectId === mainline.id ||
            p.parentProjectCode === mainline.code ||
            (mainline.id === 'prj-ql1a-02' && (p.id.startsWith('br-0') || p.code.startsWith('BR-0'))) ||
            (mainline.id === 'prj-lstl-05' && (p.id.startsWith('br-lstl') || p.code.startsWith('BR-LSTL'))) ||
            (mainline.id === 'prj-ctbn-01' && (p.id.startsWith('br-dc') || p.code.startsWith('BR-DC'))) ||
            (mainline.id === 'prj-dt741-04' && (p.id.startsWith('br-741') || p.code.startsWith('BR-741'))))
      )
      return {
        mainline,
        branches
      }
    })
  }, [projects])

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          {/* 1. DỰ ÁN & TUYẾN ĐƯỜNG KHẢO SÁT (MENU XỔ CÂY PHÂN CẤP) */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Dự Án / Tuyến Đường Khảo Sát
            </label>

            {/* Nút bấm trigger mở Menu xổ xuống */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-white border border-[#E2E5E9] rounded-lg hover:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all cursor-pointer text-left shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Icon
                  name={currentProject.type === 'BRANCH' ? 'alt_route' : 'route'}
                  size={18}
                  className={currentProject.type === 'BRANCH' ? 'text-[#C9A227]' : 'text-slate-600'}
                />
                <span className="font-semibold text-[#1A1D20] truncate">
                  {currentProject.type === 'BRANCH'
                    ? `|-- Tuyến phụ (${currentProject.code}) (${currentProject.name})`
                    : `Tuyến chính (${currentProject.code}) (${currentProject.name})`}
                </span>
              </div>
              <Icon
                name={isDropdownOpen ? 'expand_less' : 'expand_more'}
                size={20}
                className="text-slate-400 shrink-0 transition-transform"
              />
            </button>

            {/* MENU XỔ RA THEO ĐÚNG CẤU TRÚC CÂY TUYẾN CHÍNH & TUYẾN PHỤ */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E2E5E9] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-150">
                {routeTreeGroups.map((group, groupIdx) => {
                  const isMainSelected = projectId === group.mainline.id
                  const isCollapsed = !!collapsedGroupIds[group.mainline.id]
                  return (
                    <div key={group.mainline.id} className="space-y-0.5">
                      {groupIdx > 0 && <div className="border-t border-slate-100 my-1.5" />}

                      {/* Mục Tuyến chính (mã dự án) (tên dự án) kèm nút mũi tên ẩn/hiện */}
                      <div
                        onClick={() => {
                          onProjectChange(group.mainline.id)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                          isMainSelected
                            ? 'bg-amber-50 text-amber-950 font-bold border-l-4 border-[#C9A227] shadow-2xs'
                            : 'text-[#1A1D20] hover:bg-slate-50 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {/* Nút bấm hình mũi tên dropdown để ẩn/hiện tuyến phụ */}
                          {group.branches.length > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => toggleGroupCollapse(group.mainline.id, e)}
                              title={isCollapsed ? 'Mở danh sách tuyến phụ' : 'Thu gọn tuyến phụ'}
                              className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
                            >
                              <Icon
                                name={isCollapsed ? 'arrow_right' : 'arrow_drop_down'}
                                size={18}
                                className="text-slate-600 transition-transform"
                              />
                            </button>
                          ) : (
                            <span className="w-5" />
                          )}

                          <Icon name="route" size={16} className={isMainSelected ? 'text-[#C9A227]' : 'text-slate-500'} />
                          <span className="truncate">
                            Tuyến chính ({group.mainline.code}) ({group.mainline.name})
                          </span>
                          {group.branches.length > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal shrink-0">
                              ({group.branches.length} tuyến phụ)
                            </span>
                          )}
                        </div>

                        {isMainSelected && (
                          <Icon name="check" size={16} className="text-[#C9A227] shrink-0" />
                        )}
                      </div>

                      {/* Danh sách Tuyến phụ thụt lề |-- (Chỉ hiện khi chưa bị thu gọn) */}
                      {!isCollapsed &&
                        group.branches.map((branch) => {
                          const isBranchSelected = projectId === branch.id
                          return (
                            <button
                              key={branch.id}
                              type="button"
                              onClick={() => {
                                onProjectChange(branch.id)
                                setIsDropdownOpen(false)
                              }}
                              className={`w-full flex items-center justify-between pl-8 pr-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                                isBranchSelected
                                  ? 'bg-amber-100/80 text-amber-950 font-bold border-l-3 border-[#C9A227] shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-slate-400 select-none shrink-0 font-semibold">|--</span>
                                <Icon
                                  name="alt_route"
                                  size={14}
                                  className={isBranchSelected ? 'text-[#C9A227]' : 'text-slate-400'}
                                />
                                <span className="truncate">
                                  Tuyến phụ ({branch.code}) ({branch.name})
                                </span>
                              </div>
                              {isBranchSelected && (
                                <Icon name="check" size={15} className="text-[#C9A227] shrink-0" />
                              )}
                            </button>
                          )
                        })}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Thông tin phụ trợ hiển thị ngay dưới ô chọn */}
            <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5 px-0.5">
              <Icon name="info" size={13} className="text-slate-400" />
              <span>
                {currentProject.type === 'BRANCH'
                  ? `Đang chọn Tuyến phụ (${currentProject.code}) thuộc dự án mẹ (${currentProject.parentProjectCode || 'PRJ-QL1A-02'}) ${currentProject.parentProjectName || ''} (${currentProject.branchStationText || ''}).`
                  : `Đang chọn Tuyến chính toàn tuyến (${currentProject.code}) (${currentProject.lengthKm || Math.abs(currentProject.endKm - currentProject.startKm).toFixed(1)} km).`}
              </span>
            </div>
          </div>

          {/* 2. LÝ TRÌNH BẮT ĐẦU & KẾT THÚC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
                Lý Trình Bắt Đầu (Km)
              </label>
              <input
                type="number"
                step="0.05"
                min={currentProject.startKm}
                max={currentProject.endKm}
                value={startKm}
                onChange={(e) => setStartKm(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono font-bold text-[#1A1D20] bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                {currentProject.type === 'BRANCH'
                  ? `Khởi đầu nhánh: Km ${currentProject.startKm.toFixed(2)}`
                  : `Giới hạn tuyến: Km ${currentProject.startKm}`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
                Lý Trình Kết Thúc (Km)
              </label>
              <input
                type="number"
                step="0.05"
                min={currentProject.startKm}
                max={currentProject.endKm}
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono font-bold text-[#1A1D20] bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                {currentProject.type === 'BRANCH'
                  ? `Cuối nhánh: Km ${currentProject.endKm.toFixed(2)}`
                  : `Đến tối đa: Km ${currentProject.endKm}`}
              </span>
            </div>
          </div>

          {/* 3. ĐỘ CAO BAY THIẾT KẾ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider">
                Độ Cao Bay Thiết Kế (m)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAltitudeMode('preset')}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
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
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
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
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] font-medium cursor-pointer text-[#1A1D20]"
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
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] pr-12 text-[#1A1D20]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mét</span>
                </div>
                <div className="bg-[#FEF3E2] border border-amber-200 px-3 py-2 rounded-lg text-xs font-mono text-[#8F7212] whitespace-nowrap">
                  Độ phân giải GSD: <strong>~{gsdCmPx} cm/px</strong>
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-500">
              Trần bay quy định Cục Hàng Không / Cục Tác Chiến: Tối đa 120m AGL. Độ cao càng thấp thì ảnh càng nét nhưng thời gian bay tăng.
            </p>
          </div>

          {/* 4. ĐỘ PHỦ CHỒNG ẢNH */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider">
                Độ Phủ Chồng Ảnh Trắc Địa (Image Overlap)
              </label>
              <button
                type="button"
                onClick={() => setShowOverlapHelp(!showOverlapHelp)}
                className="text-[11px] text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Icon name="help_outline" size={14} className="text-[#C9A227]" />
                <span>{showOverlapHelp ? 'Thu gọn' : 'Độ phủ chồng ảnh là gì?'}</span>
              </button>
            </div>

            <select
              value={overlap}
              onChange={(e) => setOverlap(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] font-medium cursor-pointer text-[#1A1D20]"
            >
              <option value="80">80% Dọc / 70% Ngang (Khuyên dùng cho AI phát hiện vết nứt)</option>
              <option value="85">85% Dọc / 75% Ngang (Dựng mô hình 3D đám mây điểm tấm Slab)</option>
              <option value="75">75% Dọc / 65% Ngang (Bay nhanh tiết kiệm pin cho đường thẳng)</option>
            </select>

            {showOverlapHelp && <OverlapHelpBox />}
          </div>

          {/* 5. NGÀY BAY DỰ KIẾN & PHI CÔNG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Ngày Bay Dự Kiến"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
                Chỉ Định Phi Công (Drone Operator)
              </label>
              <select
                value={pilotId}
                onChange={(e) => setPilotId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] font-medium cursor-pointer text-[#1A1D20]"
              >
                {pilots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.roleLabel})
                  </option>
                ))}
              </select>
              {selectedPilot && (
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Thiết bị: <strong className="text-slate-700">{selectedPilot.device}</strong> • {selectedPilot.license}
                </span>
              )}
            </div>
          </div>

          {/* 6. GHI CHÚ KỸ THUẬT */}
          <div>
            <label className="block text-xs font-semibold text-[#2D3748] uppercase tracking-wider mb-1.5">
              Ghi Chú Kỹ Thuật &amp; Yêu Cầu An Toàn
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E5E9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] focus:border-[#C9A227] text-[#1A1D20]"
              placeholder="Nhập ghi chú yêu cầu bay cao, tránh đường dây điện cao thế..."
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button type="submit" icon={<Icon name="flight_takeoff" size={16} className="text-white" />}>
            Ban Hành Lệnh Bay Khảo Sát
          </Button>
        </div>
      </form>
    </Card>
  )
}
