import React from 'react'
import { X, Sliders } from 'lucide-react'
import { SegmentItem } from './types'

export interface AlignmentEditModalProps {
  segment: SegmentItem | null
  colors: string[]
  onClose: () => void
  onChangeSegment: (seg: SegmentItem) => void
  onSave: (e: React.FormEvent) => void
}

export const AlignmentEditModal: React.FC<AlignmentEditModalProps> = ({
  segment,
  colors,
  onClose,
  onChangeSegment,
  onSave
}) => {
  if (!segment) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: segment.color }}
              className="w-4 h-4 rounded-full shadow-xs"
            />
            <h3 className="font-bold text-slate-900 text-base">
              Chá»‰nh Sá»­a: {segment.code}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              MÃ£ / TÃªn PhÃ¢n Äoáº¡n
            </label>
            <input
              type="text"
              value={segment.code}
              onChange={(e) => onChangeSegment({ ...segment, code: e.target.value })}
              className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                LÃ½ trÃ¬nh báº¯t Ä‘áº§u (Km)
              </label>
              <input
                type="number"
                step="0.001"
                value={segment.startKm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  onChangeSegment({
                    ...segment,
                    startKm: val,
                    lengthKm: parseFloat(Math.max(0, segment.endKm - val).toFixed(3))
                  })
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                LÃ½ trÃ¬nh káº¿t thÃºc (Km)
              </label>
              <input
                type="number"
                step="0.001"
                value={segment.endKm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  onChangeSegment({
                    ...segment,
                    endKm: val,
                    lengthKm: parseFloat(Math.max(0, val - segment.startKm).toFixed(3))
                  })
                }}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Chiá»u dÃ i tÃ­nh toÃ¡n:</span>
            <span className="font-mono font-bold text-[#8F7212]">
              {(segment.endKm - segment.startKm >= 1)
                ? `${(segment.endKm - segment.startKm).toFixed(3)} km`
                : `${Math.round((segment.endKm - segment.startKm) * 1000)} mÃ©t`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Sá»‘ lÃ n xe
              </label>
              <select
                value={segment.laneCount}
                onChange={(e) => onChangeSegment({ ...segment, laneCount: parseInt(e.target.value) || 4 })}
                className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value={2}>2 lÃ n xe</option>
                <option value={4}>4 lÃ n xe (TiÃªu chuáº©n)</option>
                <option value={6}>6 lÃ n xe (Cao tá»‘c)</option>
                <option value={8}>8 lÃ n xe</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Váº­t liá»‡u máº·t Ä‘Æ°á»ng
              </label>
              <select
                value={segment.surfaceMaterial}
                onChange={(e) => onChangeSegment({ ...segment, surfaceMaterial: e.target.value })}
                className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="Máº·t BTN C12.5">Máº·t BTN C12.5</option>
                <option value="Máº·t BTN C19">Máº·t BTN C19</option>
                <option value="Máº·t BTN Polymer">Máº·t BTN Polymer</option>
                <option value="BTXM DÃ y 26cm">BTXM DÃ y 26cm</option>
              </select>
            </div>
          </div>

          {/* Bá» rá»™ng máº·t Ä‘Æ°á»ng */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-brand-gold" />
                <span>Bá» rá»™ng máº·t Ä‘Æ°á»ng (RoadWidthProfile - mÃ©t)</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-[#8F7212]">
                Â±{((segment.roadWidthM || 8.0) / 2).toFixed(1)}m má»—i bÃªn tim
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="60"
                  value={segment.roadWidthM || 8.0}
                  onChange={(e) =>
                    onChangeSegment({
                      ...segment,
                      roadWidthM: parseFloat(e.target.value) || 3.0
                    })
                  }
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  required
                />
                <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                  mÃ©t
                </span>
              </div>

              <div className="flex items-center gap-1">
                {[3.0, 4.0, 6.0, 8.0, 10.0, 12.0].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChangeSegment({ ...segment, roadWidthM: w })}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      (segment.roadWidthM || 8.0) === w
                        ? 'bg-brand-gold text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {w}m
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Äoáº¡n nÃ y rá»™ng {segment.roadWidthM || 8.0}m (trÃ¡i {((segment.roadWidthM || 8.0) / 2).toFixed(1)}m, pháº£i {((segment.roadWidthM || 8.0) / 2).toFixed(1)}m). Diá»‡n tÃ­ch: {Math.round((segment.lengthKm || 0) * 1000 * (segment.roadWidthM || 8.0)).toLocaleString()} mÂ².
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
              MÃ u sáº¯c phÃ¢n Ä‘oáº¡n trÃªn báº£n Ä‘á»“
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeSegment({ ...segment, color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                    segment.color === c
                      ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Há»§y bá»
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-gold hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
            >
              LÆ°u thay Ä‘á»•i
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
