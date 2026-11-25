import React, { useEffect, useState } from 'react'
import type { PhotoRef } from './types'
import { acceptanceService } from '../../../api/services/acceptanceService'
import { EvidencePhoto } from './EvidencePhoto'
import { beErrorText } from './acceptanceLabels'

/** Ảnh Trước/Sau thu nhỏ trên thẻ danh sách: đọc từ bản nộp hiện hành của hạng mục đại diện; đang tải / chưa có ảnh / lỗi (thử lại) tách bạch. */
export const PackageThumbs: React.FC<{ projectId: string; packageId: string; itemId?: string }> = ({ projectId, packageId, itemId }) => {
  const [refs, setRefs] = useState<{ before: PhotoRef | null; after: PhotoRef | null } | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setRefs(null); setError('')
    if (!itemId) { setRefs({ before: null, after: null }); return }
    acceptanceService.getItemPhotoRefs(projectId, packageId, itemId)
      .then((r) => { if (alive) setRefs(r) })
      .catch((e) => { if (alive) setError(beErrorText(e)) })
    return () => { alive = false }
  }, [projectId, packageId, itemId, attempt])

  if (error) {
    return (
      <div role="alert" className="col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-800 flex flex-wrap items-center justify-between gap-2">
        <span className="break-words min-w-0">Không đọc được ảnh hồ sơ: {error}</span>
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="px-2.5 py-1 rounded-md bg-white border border-rose-300 font-semibold cursor-pointer">Thử lại</button>
      </div>
    )
  }
  return (
    <>
      <div className="space-y-1">
        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
          {refs ? <EvidencePhoto projectId={projectId} photo={refs.before} alt="Trước thi công" emptyText="Chưa có ảnh trước" /> : <div role="status" className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-600">Đang tải…</div>}
          <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">Trước</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 border border-emerald-300 relative">
          {refs ? <EvidencePhoto projectId={projectId} photo={refs.after} alt="Sau thi công" emptyText="Chưa có ảnh sau" /> : <div role="status" className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-600">Đang tải…</div>}
          <span className="absolute top-1.5 left-1.5 bg-emerald-900/80 text-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded z-10">Sau</span>
        </div>
      </div>
    </>
  )
}
export default PackageThumbs
