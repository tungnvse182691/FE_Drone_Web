import React, { useState, useEffect } from 'react'
import {
  X,
  GitBranch,
  Save,
  MapPin,
  AlertCircle,
  FileCode2
} from 'lucide-react'
import { BranchItem } from './types'
import { parseBranchCoordinates, branchKmPoints, branchJunction, prepareBranchPreview } from './alignmentBranchHelpers'

export interface AlignmentAddBranchModalProps {
  isOpen: boolean
  onClose: () => void
  onAddBranch: (branch: BranchItem) => void
  mainlineLengthKm: number
  stationOriginKm: number
  currentCoords?: [number, number][]
  currentKmPoints?: number[]
  onStartPickOnMap?: (
    initCoords: [number, number][],
    onFinish: (coords: [number, number][]) => void
  ) => void
}

export const AlignmentAddBranchModal: React.FC<AlignmentAddBranchModalProps> = ({
  isOpen,
  onClose,
  onAddBranch,
  currentCoords = [],
  currentKmPoints = []
}) => {
  const [name, setName] = useState('')
  const [, setRoadWidthM] = useState<number>(Number.NaN)
  const [roadWidthMText, setRoadWidthMText] = useState<string>('')
  const [, setLaneCount] = useState<number>(Number.NaN)
  const [laneCountText, setLaneCountText] = useState<string>('')
  const [surfaceMaterial, setSurfaceMaterial] = useState<string>('')

  // Danh sách tọa độ GPS
  const [branchCoordsText, setBranchCoordsText] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Reset toàn bộ form về trạng thái tuyến nhánh mới tinh mỗi khi mở modal
  useEffect(() => {
    if (isOpen) {
      setName('')
      setBranchCoordsText('')
      setErrorMessage(null)
      setRoadWidthM(Number.NaN)
      setRoadWidthMText('')
      setLaneCount(Number.NaN)
      setLaneCountText('')
      setSurfaceMaterial('')
    }
  }, [isOpen])

  let parsedPoints: [number, number][] = []
  try { parsedPoints = parseBranchCoordinates(branchCoordsText) } catch { /* Submit reports the precise invalid field. */ }
  const points = branchKmPoints(parsedPoints)
  const autoCalculatedLengthKm = parsedPoints.length ? points[points.length - 1] : Number.NaN
  const detectedStation = branchJunction(parsedPoints, currentCoords, currentKmPoints)

  const handleLoadSampleCoords = () => setErrorMessage('Không nạp tuyến mẫu. Hãy nhập tọa độ nhánh có nguồn; không tự nối hoặc bo cong.')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      const branch = prepareBranchPreview({ id: 'br-' + crypto.randomUUID(), name, coords: parseBranchCoordinates(branchCoordsText),
        roadWidthM: Number(roadWidthMText), laneCount: Number(laneCountText), surfaceMaterial }, currentCoords, currentKmPoints)
      onAddBranch(branch)
      setBranchCoordsText('')
      onClose()
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : 'Không kiểm tra được dữ liệu nhánh.') }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 my-8">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-[#8F7212] rounded-lg">
              <GitBranch className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tạo Tuyến Nhánh Mới</h2>
              <p className="text-xs text-slate-500">
                Thiết lập tim tuyến nhánh bằng danh sách tọa độ GPS chuẩn WGS84
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          {/* Tên tuyến nhánh */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tên tuyến nhánh *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="Ví dụ: Tuyến nhánh kết nối ĐT.725..."
            />
          </div>

          {/* NHẬP THEO TỌA ĐỘ GPS (DÁN CHUỖI WGS84) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-brand-gold" />
                <span>Nhập danh sách tọa độ GPS [Kinh độ, Vĩ độ] *</span>
              </span>
              <button
                type="button"
                onClick={handleLoadSampleCoords}
                className="text-[11px] text-brand-gold hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Nạp mẫu GPS</span>
              </button>
            </div>

            <textarea
              rows={5}
              required
              value={branchCoordsText}
              onChange={(e) => setBranchCoordsText(e.target.value)}
              placeholder={`Dán danh sách tọa độ (mỗi dòng 1 điểm [Kinh độ, Vĩ độ]):\n108.105400, 16.258900\n108.112000, 16.264000\n108.118500, 16.269500`}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-[11px] text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />

            {/* Thông tin phân tích trực tiếp từ tọa độ */}
            {parsedPoints.length >= 2 ? (
              <div className="flex flex-col gap-1.5 bg-amber-50/70 border border-amber-200 p-2.5 rounded-lg text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    ✓ Đã nhận diện {parsedPoints.length} điểm GPS
                  </span>
                  <span className="font-mono font-bold text-brand-gold bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                    Chiều dài: {autoCalculatedLengthKm >= 1 ? `${autoCalculatedLengthKm.toFixed(2)} km` : `${Math.round(autoCalculatedLengthKm * 1000)} m`}
                  </span>
                </div>
                {detectedStation && (
                  <div className="flex items-center justify-between text-slate-600 text-[10px] bg-white p-1.5 rounded border border-amber-100">
                    <span>Điểm rẽ từ tim trục chính:</span>
                    <strong className="text-slate-900 font-mono">
                      {detectedStation.stationText} (cách tim trục {detectedStation.distanceMeters}m)
                    </strong>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400">
                * Nhập tối thiểu 2 điểm tọa độ. Chiều dài tuyến và vị trí tách làn trên trục chính sẽ tự động tính toán.
              </span>
            )}
          </div>

          {/* BỀ RỘNG VÀ SỐ LÀN XE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bề rộng W (m) *</label>
              <input
                type="number"
                step="0.5"
                min="3.0"
                max="60.0"
                required
                value={roadWidthMText}
                onChange={(e) => {
                  setRoadWidthMText(e.target.value)
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v)) setRoadWidthM(v)
                }}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Số làn xe *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={laneCountText}
                onChange={(e) => {
                  setLaneCountText(e.target.value)
                  const v = parseInt(e.target.value)
                  if (!isNaN(v)) setLaneCount(v)
                }}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          {/* Vật liệu mặt đường */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Vật liệu mặt đường</label>
            <input
              type="text"
              value={surfaceMaterial}
              onChange={(e) => setSurfaceMaterial(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          {/* Footer nút bấm */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-[#B38E1F] text-white font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer text-xs active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Lưu tuyến nhánh</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
