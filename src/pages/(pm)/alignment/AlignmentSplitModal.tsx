import React, { useState, useEffect } from 'react'
import { X, SplitSquareVertical } from 'lucide-react'
import { SegmentItem } from './types'

export interface AlignmentSplitModalProps {
  segment: SegmentItem | null
  customSplitKm: number
  onClose: () => void
  onChangeCustomSplitKm: (km: number) => void
  onSubmit: (e: React.FormEvent) => void
}

export const AlignmentSplitModal: React.FC<AlignmentSplitModalProps> = ({
  segment,
  customSplitKm,
  onClose,
  onChangeCustomSplitKm,
  onSubmit
}) => {
  const [splitText, setSplitText] = useState<string>(customSplitKm.toString())

  useEffect(() => {
    setSplitText(customSplitKm.toString())
  }, [customSplitKm, segment])

  if (!segment) return null

  const handleInputChange = (val: string) => {
    setSplitText(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      onChangeCustomSplitKm(parsed)
    }
  }

  const currentSplitNum = parseFloat(splitText) || customSplitKm

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SplitSquareVertical className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-slate-900 text-base">
              Tách phân đoạn: {segment.code}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Phân đoạn hiện tại từ <strong className="text-slate-900 font-mono">Km {segment.startKm.toFixed(3)}</strong> đến <strong className="text-slate-900 font-mono">Km {segment.endKm.toFixed(3)}</strong> (dài {segment.lengthKm.toFixed(3)} km).
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Nhập mốc lý trình cần tách (Km) *
            </label>
            <input
              type="number"
              step="0.001"
              min={segment.startKm + 0.001}
              max={segment.endKm - 0.001}
              value={splitText}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              required
            />
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 flex flex-col gap-1.5 text-xs text-slate-700">
            <div className="font-bold text-[#8F7212] text-[11px] uppercase tracking-wider">
              Kết quả sau khi tách:
            </div>
            <div className="flex justify-between">
              <span>• {segment.code}A:</span>
              <span className="font-mono font-semibold">Km {segment.startKm.toFixed(3)} - Km {currentSplitNum.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>• {segment.code}B:</span>
              <span className="font-mono font-semibold">Km {currentSplitNum.toFixed(3)} - Km {segment.endKm.toFixed(3)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-gold hover:bg-[#B38E1F] transition-colors shadow-xs cursor-pointer"
            >
              Xác nhận tách đoạn
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
