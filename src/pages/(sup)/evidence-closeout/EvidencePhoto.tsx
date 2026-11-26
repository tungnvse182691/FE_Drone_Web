import React, { useEffect, useState } from 'react'
import type { PhotoRef } from './types'
import { loadAcceptancePhoto } from '../../../api/services/acceptanceService'
import { beErrorText } from './acceptanceLabels'

export interface EvidencePhotoProps {
  projectId?: string
  photo?: PhotoRef | null
  alt: string
  /** Lý do không có ảnh (hiển thị khi photo rỗng). */
  emptyText?: string
  className?: string
  zoomable?: boolean
  /** contain = hiển thị đủ ảnh (không cắt); cover = lấp đầy khung. Mặc định cover (thumbnail). */
  fit?: 'cover' | 'contain'
  onRef?: (state: 'loading' | 'ok' | 'error' | 'none') => void
}

/** Ảnh nghiệm thu với 4 trạng thái tách bạch: đang tải / chưa có ảnh / lỗi tải (kèm thử lại) / có ảnh. Không dùng <img> hỏng. */
export const EvidencePhoto: React.FC<EvidencePhotoProps> = ({ projectId, photo, alt, emptyText = 'Chưa có ảnh', className = '', zoomable = true, fit = 'cover', onRef }) => {
  const [url, setUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [zoom, setZoom] = useState(false)
  const key = photo ? `${photo.source}:${photo.fileId}` : ''

  useEffect(() => {
    let revoked = ''
    const controller = new AbortController()
    setUrl(''); setError('')
    if (!photo || !projectId) { setLoading(false); return }
    setLoading(true)
    loadAcceptancePhoto(projectId, photo, controller.signal)
      .then((blob) => { if (controller.signal.aborted) return; revoked = URL.createObjectURL(blob); setUrl(revoked) })
      .catch((e) => { if (!controller.signal.aborted) setError(beErrorText(e)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { controller.abort(); if (revoked) URL.revokeObjectURL(revoked) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, key, attempt])

  const state: 'loading' | 'ok' | 'error' | 'none' = !photo ? 'none' : loading ? 'loading' : error ? 'error' : url ? 'ok' : 'loading'
  useEffect(() => { onRef?.(state) }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative w-full h-full ${className}`}>
      {state === 'ok' && (
        <>
          <img src={url} alt={alt} className={`w-full h-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`} onClick={zoomable ? (e) => { e.stopPropagation(); setZoom(true) } : undefined} style={zoomable ? { cursor: 'zoom-in' } : undefined} />
          {zoom && (
            <div role="dialog" aria-modal="true" aria-label={alt} onClick={(e) => { e.stopPropagation(); setZoom(false) }} className="fixed inset-0 z-[9998] bg-slate-950/90 flex items-center justify-center p-6 cursor-zoom-out">
              <img src={url} alt={alt} className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          )}
        </>
      )}
      {state === 'loading' && (
        <div role="status" className="absolute inset-0 flex items-center justify-center gap-2 text-[11px] text-slate-600 bg-slate-100">
          <span className="w-4 h-4 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" />
          <span>Đang tải ảnh…</span>
        </div>
      )}
      {state === 'none' && (
        <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[11px] text-slate-600 bg-slate-100">{emptyText}</div>
      )}
      {state === 'error' && (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center text-[11px] text-rose-800 bg-rose-50 overflow-auto">
          <span className="font-semibold">Không tải được ảnh</span>
          <span className="break-words max-w-full leading-snug">{error}</span>
          <button type="button" onClick={(e) => { e.stopPropagation(); setAttempt((n) => n + 1) }} className="px-2.5 py-1 rounded-md bg-white border border-rose-300 text-rose-800 font-semibold hover:bg-rose-100 cursor-pointer">Thử lại</button>
        </div>
      )}
    </div>
  )
}
export default EvidencePhoto
