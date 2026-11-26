import { useEffect, useState } from 'react'
import { readProjectServerFacts } from '../api/services/projectServerFacts'
import type { WarrantyWindow } from '../utils/warrantyDeadline'

/** Đọc thời hạn bảo hành thật của dự án (work-package.warranties). Đổi dự án → bỏ kết quả cũ. */
export function useWarrantyWindow(projectId?: string): WarrantyWindow {
  const [state, setState] = useState<{ projectId: string; w: WarrantyWindow } | null>(null)
  useEffect(() => {
    if (!projectId) return
    let alive = true
    readProjectServerFacts(projectId).then((f) => {
      if (!alive) return
      const ok = !!f.warrantyEndDate && !!f.warrantyStartDate && !f.warrantyError
      setState({ projectId, w: ok ? { status: 'ready', startDate: f.warrantyStartDate, endDate: f.warrantyEndDate } : { status: 'unknown', note: f.warrantyError || f.warrantyMessage || undefined } })
    }).catch((e) => { if (alive) setState({ projectId, w: { status: 'unknown', note: e instanceof Error ? e.message : undefined } }) })
    return () => { alive = false }
  }, [projectId])
  if (!projectId) return { status: 'idle' }
  return state?.projectId === projectId ? state.w : { status: 'loading' }
}
