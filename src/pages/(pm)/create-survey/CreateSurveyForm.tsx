import React from 'react'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { InputField } from '../../../components/ui/InputField'
import { PlaneTakeoff, HelpCircle } from 'lucide-react'
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

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          {/* 1. DỰ ÁN KHẢO SÁT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dự Án / Tuyến Đường Khảo Sát
            </label>
            <select
              value={projectId}
              onChange={(e) => onProjectChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. LÝ TRÌNH BẮT ĐẦU & KẾT THÚC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Lý Trình Bắt Đầu (Km)
              </label>
              <input
                type="number"
                step="0.1"
                min={currentProject.startKm}
                max={currentProject.endKm}
                value={startKm}
                onChange={(e) => setStartKm(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono font-bold text-slate-800 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Giới hạn tuyến: Km {currentProject.startKm}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Lý Trình Kết Thúc (Km)
              </label>
              <input
                type="number"
                step="0.1"
                min={currentProject.startKm}
                max={currentProject.endKm}
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-mono font-bold text-slate-800 bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Đến tối đa: Km {currentProject.endKm}
              </span>
            </div>
          </div>

          {/* 3. ĐỘ CAO BAY THIẾT KẾ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Độ Cao Bay Thiết Kế (m)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAltitudeMode('preset')}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    altitudeMode === 'preset' ? 'bg-[#C9A227] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tiêu chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => setAltitudeMode('custom')}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    altitudeMode === 'custom' ? 'bg-[#C9A227] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
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
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mét</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-xs font-mono text-[#8F7212] whitespace-nowrap">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Độ Phủ Chồng Ảnh Trắc Địa (Image Overlap)
              </label>
              <button
                type="button"
                onClick={() => setShowOverlapHelp(!showOverlapHelp)}
                className="text-[11px] text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showOverlapHelp ? 'Thu gọn' : 'Độ phủ chồng ảnh là gì?'}</span>
              </button>
            </div>

            <select
              value={overlap}
              onChange={(e) => setOverlap(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Chỉ Định Phi Công (Drone Operator)
              </label>
              <select
                value={pilotId}
                onChange={(e) => setPilotId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi Chú Kỹ Thuật &amp; Yêu Cầu An Toàn
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="Nhập ghi chú yêu cầu bay cao, tránh đường dây điện cao thế..."
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button type="submit" icon={<PlaneTakeoff className="w-4 h-4" />}>
            Ban Hành Lệnh Bay Khảo Sát
          </Button>
        </div>
      </form>
    </Card>
  )
}
