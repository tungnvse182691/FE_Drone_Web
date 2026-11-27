import React, { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { triageGeometryService } from '../../../api/services/triageGeometryService'
import { workflowCollection } from '../../../api/services/workflowCollection'
import { fieldTaskReadService, type FieldMeasurement } from '../../../api/services/fieldTaskReadService'
import { measurementEnumLabel, measurementTypeLabel } from '../../../api/services/fieldMeasurementTypes'
import { defectNotice, defectSeverity, defectStatus, fastTrackTypeName } from '../fast-track/defectPresentation'
import { FIELD_MEASUREMENT_TYPES } from '../../../api/services/fieldMeasurementTypes'
import { Icon } from '../../../components/ui/Icon'
import { defectTypeLabel, useDefectTypeNames } from '../../../api/services/defectTypeNames'

const NONE = 'Chưa có dữ liệu'
type Section<T> = { status: 'loading' | 'ready' | 'error'; data?: T; error?: string }
interface DefectFacts { id: string; defectTypeCode?: string | null; status?: string | null; severity?: string | null; segmentId?: string | null; roadSectionVersionId?: string | null; geometry?: { srid?: number; wkt?: string | null } | null }
interface TaskFacts {
  id: string; status?: string | null; mode?: string | null; requiredMeasurementType?: number; measurementScope?: string | null
  latestSubmissionId?: string | null; submission?: { id: string; revision: number; readiness?: string | null; measurements: FieldMeasurement[] } | null
  reviews: Array<{ kind: string; reason: string; at: string }>; submissionError?: string
}
export interface ProposalSourceRange { fromMeters: string; toMeters: string; offsetFromMeters: string; offsetToMeters: string }

function chainageOf(scope?: string | null): string | null {
  if (!scope) return null
  try { const v = JSON.parse(scope); return v && typeof v === 'object' && v.chainage_km != null ? `Km ${v.chainage_km}` : null } catch { return null }
}

/**
 * Thông tin nguồn của Defect đang chọn khi lập đề xuất sửa chữa — chỉ dùng GET hiện có:
 *  GET /projects/{p}/defects/{id} (loại, trạng thái, mức độ, tuyến/phân đoạn, hình học),
 *  GET /projects/{p}/work-package (tên tuyến), GET /projects/{p}/field-inspection-tasks (+ chi tiết, bản nộp, lịch sử/review).
 * Không suy luận phạm vi từ vị trí Defect; không ghi đè phạm vi PM nhập.
 */
export const ProposalSourcePanel: React.FC<{ projectId: string; defectId: string; defectCode: string; segmentSetLabel?: string; range?: ProposalSourceRange; hidePmRange?: boolean; fastTrackUi?: boolean }> = ({ projectId, defectId, defectCode, segmentSetLabel, range, hidePmRange, fastTrackUi = false }) => {
  const none = fastTrackUi ? 'Chưa có thông tin' : NONE
  const { names: typeNames } = useDefectTypeNames()
  const [defect, setDefect] = useState<Section<DefectFacts>>({ status: 'loading' })
  const [route, setRoute] = useState<Section<string | null>>({ status: 'loading' })
  const [tasks, setTasks] = useState<Section<TaskFacts[]>>({ status: 'loading' })
  const seq = useRef(0)
  const [retry, setRetry] = useState(0)

  const load = useCallback(async () => {
    const my = ++seq.current
    const live = () => seq.current === my
    setDefect({ status: 'loading' }); setRoute({ status: 'loading' }); setTasks({ status: 'loading' })
    let d: DefectFacts | undefined
    try {
      const r = await apiClient.get<DefectFacts & { projectId?: string }>(`/projects/${projectId}/defects/${defectId}`)
      if (r.data?.id !== defectId || r.data.projectId !== projectId) throw new Error('BE trả Defect sai mã/dự án.')
      d = r.data
      if (live()) setDefect({ status: 'ready', data: d })
    } catch (e) { if (live()) { setDefect({ status: 'error', error: exportError(e) }); setRoute({ status: 'error', error: 'Cần đọc được Defect trước.' }) } }
    if (d) {
      triageGeometryService.routes(projectId).then((rs) => { if (live()) setRoute({ status: 'ready', data: (() => { const r = rs.find((x) => x.currentVersionId === d!.roadSectionVersionId); return r ? [r.code, r.name].filter(Boolean).join(' - ') || null : null })() }) })
        .catch((e) => { if (live()) setRoute({ status: 'error', error: exportError(e) }) })
    }
    try {
      const rows = await workflowCollection<{ id: string; projectId: string; defectIds?: string[] | null; defectId?: string }>(`/projects/${projectId}/field-inspection-tasks`, projectId)
      const mine = rows.filter((t) => t.defectId === defectId || t.defectIds?.includes(defectId)).slice(0, 5)
      const facts: TaskFacts[] = []
      for (const t of mine) {
        const read = await fieldTaskReadService.read(projectId, t.id)
        const task = read.task as unknown as TaskFacts & { latestSubmissionId?: string | null }
        const sub = read.submission
        facts.push({
          id: t.id, status: task.status, mode: task.mode, requiredMeasurementType: task.requiredMeasurementType, measurementScope: task.measurementScope, latestSubmissionId: task.latestSubmissionId,
          submission: sub ? { id: sub.id, revision: sub.revision, readiness: sub.readiness, measurements: sub.measurements ?? [] } : null,
          reviews: read.history.events.filter((ev) => /REVIEW/i.test(ev.kind)).map((ev) => ({ kind: ev.kind, reason: ev.reason, at: ev.occurredAt })),
        })
      }
      if (live()) setTasks({ status: 'ready', data: facts })
    } catch (e) { if (live()) setTasks({ status: 'error', error: exportError(e) }) }
  }, [projectId, defectId])

  // Đổi Defect/dự án: bỏ dữ liệu cũ ngay (state về loading) và hủy phản hồi muộn bằng seq.
  useEffect(() => { void load(); return () => { seq.current++ } }, [load, retry])

  const err = (label: string, s: Section<unknown>) => s.status === 'error' && (
    <p role="alert" className="text-rose-700">{fastTrackUi ? (label === 'Defect' && /403|access_forbidden/.test(s.error || '') ? 'Bạn không có quyền xem hồ sơ khiếm khuyết này.' : `Không đọc được ${label === 'Defect' ? 'hồ sơ khiếm khuyết' : label}: ${defectNotice(s.error, label === 'Defect' ? 'defect' : 'read')}`) : <>Không đọc được {label}: {s.error}</>} <button type="button" onClick={() => setRetry((n) => n + 1)} className="underline font-semibold">Thử lại</button></p>
  )
  const row = (k: string, v: React.ReactNode) => <div className="flex justify-between gap-3"><span className="text-slate-500">{k}</span><span className="font-semibold text-slate-800 text-right break-words min-w-0">{v}</span></div>
  const d = defect.data
  const FieldSection = fastTrackUi ? 'details' : 'section'
  const pmRange = range && (range.fromMeters || range.toMeters || range.offsetFromMeters || range.offsetToMeters)

  return (
    <aside data-testid="proposal-source-panel" aria-label="Thông tin nguồn của khiếm khuyết" className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
      <h4 className="flex items-center gap-1.5 font-bold text-slate-800 uppercase text-[11px]"><Icon name="troubleshoot" size={14} className="text-brand-gold" />Thông tin nguồn của khiếm khuyết</h4>
      <section className="space-y-1" data-testid="source-defect">
        <p className="font-semibold text-slate-600">Khiếm khuyết (từ máy chủ)</p>
        {defect.status === 'loading' && <p role="status" className="text-slate-500">{fastTrackUi ? 'Đang đọc hồ sơ khiếm khuyết…' : 'Đang đọc Defect…'}</p>}
        {err('Defect', defect)}
        {d && <>
          {row('Mã', defectCode)}
          {row('Loại', fastTrackUi ? fastTrackTypeName(d.defectTypeCode, typeNames) : defectTypeLabel(d.defectTypeCode, typeNames))}
          {row('Trạng thái', fastTrackUi ? defectStatus(d.status) : d.status || none)}
          {row('Mức độ', fastTrackUi ? defectSeverity(d.severity || undefined) : d.severity || none)}
        </>}
      </section>
      <section className="space-y-1" data-testid="source-location">
        <p className="font-semibold text-slate-600">{fastTrackUi ? 'Vị trí khiếm khuyết' : 'Vị trí của khiếm khuyết (không phải phạm vi PM đề xuất)'}</p>
        {route.status === 'loading' && defect.status !== 'error' && <p role="status" className="text-slate-500">Đang đọc tuyến…</p>}
        {(!fastTrackUi || defect.status !== 'error') && err('tuyến', route)}
        {fastTrackUi && defect.status === 'error' && <p className="text-slate-500">Chưa thể hiển thị vị trí khi chưa đọc được hồ sơ khiếm khuyết.</p>}
        {d && <>
          {row('Tuyến', route.status === 'ready' ? (route.data || none) : none)}
          {row('Phân đoạn', d.segmentId ? d.segmentId.slice(0, 8).toUpperCase() : none)}
          {row('Hình học Defect', d.geometry?.wkt ? (fastTrackUi ? d.geometry.wkt : `${d.geometry.wkt} (SRID ${d.geometry.srid ?? '—'})`) : none)}
          {row('Lý trình / độ lệch của Defect', none)}
        </>}
      </section>
      {!hidePmRange && <section className="space-y-1" data-testid="source-pm-range">
        <p className="font-semibold text-slate-600">Phạm vi PM đề xuất sửa chữa (nhập ở biểu mẫu, không suy từ Defect)</p>
        {row('Bộ phân đoạn tham chiếu', segmentSetLabel || none)}
        {row('Lý trình', pmRange && range ? `${range.fromMeters || '—'} → ${range.toMeters || '—'} m` : 'Chưa nhập')}
        {row('Độ lệch', pmRange && range ? `${range.offsetFromMeters || '—'} → ${range.offsetToMeters || '—'} m` : 'Chưa nhập')}
      </section>}
      <FieldSection className="space-y-2" data-testid="source-field">
        {fastTrackUi ? <summary className="font-semibold text-slate-600 cursor-pointer">Đo hiện trường</summary> : <p className="font-semibold text-slate-600">Đo hiện trường (FIELD)</p>}
        {tasks.status === 'loading' && <p role="status" className="text-slate-500">Đang đọc nhiệm vụ đo…</p>}
        {err('nhiệm vụ đo FIELD', tasks)}
        {tasks.status === 'ready' && !tasks.data?.length && <p className="text-slate-600">{fastTrackUi ? 'Chưa có nhiệm vụ đo hiện trường cho khiếm khuyết này.' : `${NONE} — Defect này chưa có nhiệm vụ đo FIELD.`}</p>}
        {tasks.data?.map((t) => {
          const known = (t.submission?.measurements || []).filter((m) => m.state === 'KNOWN' && m.value != null)
          return (
            <div key={t.id} className="rounded-lg border border-slate-200 bg-white p-2 space-y-1">
              {row('Nhiệm vụ', `TSK-${t.id.slice(0, 8).toUpperCase()} · ${fastTrackUi ? defectStatus(t.mode) : t.mode || none} · ${fastTrackUi ? defectStatus(t.status) : t.status || none}`)}
              {row('Loại đo yêu cầu', typeof t.requiredMeasurementType === 'number' ? (fastTrackUi ? FIELD_MEASUREMENT_TYPES.find(m => m.code === t.requiredMeasurementType)?.label || none : measurementTypeLabel(t.requiredMeasurementType)) : none)}
              {row('Lý trình đo (nhiệm vụ)', chainageOf(t.measurementScope) || none)}
              {row('Bản nộp', t.submission ? `${t.submission.id.slice(0, 8).toUpperCase()} · bản sửa ${t.submission.revision} · ${fastTrackUi ? defectStatus(t.submission.readiness) : t.submission.readiness || none}` : none)}
              {row('Giá trị đo', known.length ? known.map((m) => `${(fastTrackUi ? FIELD_MEASUREMENT_TYPES.find(t => t.enumName === m.type)?.label || none : measurementEnumLabel(m.type))}: ${m.value} ${m.unit || ''}`.trim()).join('; ') : none)}
              {row('Kết quả duyệt', t.reviews.length ? `${fastTrackUi ? defectStatus(t.reviews[t.reviews.length - 1].kind) : t.reviews[t.reviews.length - 1].kind} — ${fastTrackUi ? defectNotice(t.reviews[t.reviews.length - 1].reason, 'read') : t.reviews[t.reviews.length - 1].reason}` : none)}
            </div>
          )
        })}
      </FieldSection>
    </aside>
  )
}
