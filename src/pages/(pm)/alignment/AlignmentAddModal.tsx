import React from 'react'
import { X, Plus, Sliders } from 'lucide-react'

export interface AlignmentAddModalProps {
  isOpen: boolean
  colors: string[]
  segmentsCount: number
  newSegForm: {
    code: string
    startKm: number
    endKm: number
    roadWidthM: number
    laneCount: number
    surfaceMaterial: string
    color: string
  }
  onClose: () => void
  onChangeNewSegForm: (form: any) => void
  onCreateNewSegment: (e: React.FormEvent) => void
}

export const AlignmentAddModal: React.FC<AlignmentAddModalProps> = ({
  isOpen,
  colors,
  segmentsCount,
  newSegForm,
  onClose,
  onChangeNewSegForm,
  onCreateNewSegment
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#C9A227]" />
            <h3 className="font-bold text-slate-900 text-base">
              Thêm Mới Phân Đoạn Tuyến
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onCreateNewSegment} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Mã / Tên Phân Đoạn
            </label>
            <input
              type="text"
              placeholder={`Phân đoạn #${String(segmentsCount + 1).padStart(2, '0')}`}
              value={newSegForm.code}
              onChange={(e) => onChangeNewSegForm({ ...newSegForm, code: e.target.value })}
              className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Lý trình bắt đầu (Km)
              </label>
              <input
                type="number"
                step="0.001"
                value={newSegForm.startKm}
                onChange={(e) => onChangeNewSegForm({ ...newSegForm, startKm: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Lý trình kết thúc (Km)
              </label>
              <input
                type="number"
                step="0.001"
                value={newSegForm.endKm}
                onChange={(e) => onChangeNewSegForm({ ...newSegForm, endKm: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Số làn xe
              </label>
              <select
                value={newSegForm.laneCount}
                onChange={(e) => onChangeNewSegForm({ ...newSegForm, laneCount: parseInt(e.target.value) || 4 })}
                className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                <option value={2}>2 làn xe</option>
                <option value={4}>4 làn xe (Tiêu chuẩn)</option>
                <option value={6}>6 làn xe (Cao tốc)</option>
                <option value={8}>8 làn xe</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Vật liệu mặt đường
              </label>
              <select
                value={newSegForm.surfaceMaterial}
                onChange={(e) => onChangeNewSegForm({ ...newSegForm, surfaceMaterial: e.target.value })}
                className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              >
                <option value="Mặt BTN C12.5">Mặt BTN C12.5</option>
                <option value="Mặt BTN C19">Mặt BTN C19</option>
                <option value="Mặt BTN Polymer">Mặt BTN Polymer</option>
                <option value="BTXM Dày 26cm">BTXM Dày 26cm</option>
              </select>
            </div>
          </div>

          {/* Bề rộng mặt đường */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#C9A227]" />
                <span>Bề rộng mặt đường (RoadWidthProfile - mét)</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-[#8F7212]">
                ±{((newSegForm.roadWidthM || 8.0) / 2).toFixed(1)}m mỗi bên tim
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="60"
                  value={newSegForm.roadWidthM || 8.0}
                  onChange={(e) =>
                    onChangeNewSegForm({
                      ...newSegForm,
                      roadWidthM: parseFloat(e.target.value) || 3.0
                    })
                  }
                  className="w-full h-8 px-3 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  required
                />
                <span className="absolute right-3 top-2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                  mét
                </span>
              </div>

              <div className="flex items-center gap-1">
                {[3.0, 4.0, 6.0, 8.0, 10.0, 12.0].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChangeNewSegForm({ ...newSegForm, roadWidthM: w })}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      (newSegForm.roadWidthM || 8.0) === w
                        ? 'bg-[#C9A227] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {w}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
              Màu sắc phân đoạn trên bản đồ
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeNewSegForm({ ...newSegForm, color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                    newSegForm.color === c
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
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
            >
              Thêm phân đoạn
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
