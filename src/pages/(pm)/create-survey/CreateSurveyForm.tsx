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
          {/* 1. Dá»° ÃN KHáº¢O SÃT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Dá»± Ãn / Tuyáº¿n ÄÆ°á»ng Kháº£o SÃ¡t
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

          {/* 2. LÃ TRÃŒNH Báº®T Äáº¦U & Káº¾T THÃšC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                LÃ½ TrÃ¬nh Báº¯t Äáº§u (Km)
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
                Giá»›i háº¡n tuyáº¿n: Km {currentProject.startKm}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                LÃ½ TrÃ¬nh Káº¿t ThÃºc (Km)
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
                Äáº¿n tá»‘i Ä‘a: Km {currentProject.endKm}
              </span>
            </div>
          </div>

          {/* 3. Äá»˜ CAO BAY THIáº¾T Káº¾ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Äá»™ Cao Bay Thiáº¿t Káº¿ (m)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAltitudeMode('preset')}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    altitudeMode === 'preset' ? 'bg-brand-gold text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  TiÃªu chuáº©n
                </button>
                <button
                  type="button"
                  onClick={() => setAltitudeMode('custom')}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    altitudeMode === 'custom' ? 'bg-brand-gold text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  TÃ¹y chá»‰nh (Tá»± nháº­p)
                </button>
              </div>
            </div>

            {altitudeMode === 'preset' ? (
              <select
                value={presetAltitude}
                onChange={(e) => setPresetAltitude(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
              >
                <option value="50">50m (GSD: 1.1 cm/px â€” SiÃªu nÃ©t, phÃ¡t hiá»‡n ná»©t tÃ³c vi mÃ´)</option>
                <option value="65">65m (GSD: 1.4 cm/px â€” TiÃªu chuáº©n tráº¯c Ä‘á»‹a TCVN)</option>
                <option value="80">80m (GSD: 1.8 cm/px â€” Tá»‘c Ä‘á»™ cao, tá»‘i Æ°u pin)</option>
                <option value="100">100m (GSD: 2.2 cm/px â€” Kháº£o sÃ¡t tá»•ng quan ná»n Ä‘Æ°á»ng)</option>
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
                    placeholder="Nháº­p Ä‘á»™ cao (30 - 120m)..."
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold pr-10"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">mÃ©t</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-xs font-mono text-[#8F7212] whitespace-nowrap">
                  Äá»™ phÃ¢n giáº£i GSD: <strong>~{gsdCmPx} cm/px</strong>
                </div>
              </div>
            )}
            <p className="text-[10px] text-slate-500">
              Tráº§n bay quy Ä‘á»‹nh Cá»¥c HÃ ng KhÃ´ng / Cá»¥c TÃ¡c Chiáº¿n: Tá»‘i Ä‘a 120m AGL. Äá»™ cao cÃ ng tháº¥p thÃ¬ áº£nh cÃ ng nÃ©t nhÆ°ng thá»i gian bay tÄƒng.
            </p>
          </div>

          {/* 4. Äá»˜ PHá»¦ CHá»’NG áº¢NH */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Äá»™ Phá»§ Chá»“ng áº¢nh Tráº¯c Äá»‹a (Image Overlap)
              </label>
              <button
                type="button"
                onClick={() => setShowOverlapHelp(!showOverlapHelp)}
                className="text-[11px] text-[#8F7212] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showOverlapHelp ? 'Thu gá»n' : 'Äá»™ phá»§ chá»“ng áº£nh lÃ  gÃ¬?'}</span>
              </button>
            </div>

            <select
              value={overlap}
              onChange={(e) => setOverlap(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold font-medium cursor-pointer"
            >
              <option value="80">80% Dá»c / 70% Ngang (KhuyÃªn dÃ¹ng cho AI phÃ¡t hiá»‡n váº¿t ná»©t)</option>
              <option value="85">85% Dá»c / 75% Ngang (Dá»±ng mÃ´ hÃ¬nh 3D Ä‘Ã¡m mÃ¢y Ä‘iá»ƒm táº¥m Slab)</option>
              <option value="75">75% Dá»c / 65% Ngang (Bay nhanh tiáº¿t kiá»‡m pin cho Ä‘Æ°á»ng tháº³ng)</option>
            </select>

            {showOverlapHelp && <OverlapHelpBox />}
          </div>

          {/* 5. NGÃ€Y BAY Dá»° KIáº¾N & PHI CÃ”NG */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="NgÃ y Bay Dá»± Kiáº¿n"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Chá»‰ Äá»‹nh Phi CÃ´ng (Drone Operator)
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
                  Thiáº¿t bá»‹: <strong className="text-slate-700">{selectedPilot.device}</strong> â€¢ {selectedPilot.license}
                </span>
              )}
            </div>
          </div>

          {/* 6. GHI CHÃš Ká»¸ THUáº¬T */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi ChÃº Ká»¹ Thuáº­t &amp; YÃªu Cáº§u An ToÃ n
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="Nháº­p ghi chÃº yÃªu cáº§u bay cao, trÃ¡nh Ä‘Æ°á»ng dÃ¢y Ä‘iá»‡n cao tháº¿..."
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Há»§y Bá»
          </Button>
          <Button type="submit" icon={<PlaneTakeoff className="w-4 h-4" />}>
            Ban HÃ nh Lá»‡nh Bay Kháº£o SÃ¡t
          </Button>
        </div>
      </form>
    </Card>
  )
}
