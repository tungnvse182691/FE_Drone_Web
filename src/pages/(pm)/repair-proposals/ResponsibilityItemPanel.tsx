import React, { useCallback, useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { defectTypeLabel, useDefectTypeNames } from '../../../api/services/defectTypeNames'
import { Empty, KV, Loading, PanelButton, PanelShell, Pill, SectionTitle } from '../../../components/ui/PanelKit'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { useProjectChoice, type ProjectChoice } from './ProjectSelect'
import { RepairExportPanel } from './RepairExportPanel'

type Section<T> = { status: 'loading' | 'ready' | 'error'; data?: T; error?: string }
interface Responsibility { obligationId: string; originProjectId?: string | null; currentProjectId: string; packageId?: string | null; currentRepairItemId?: string | null }
const short = (id?: string | null) => (id ? id.slice(0, 8).toUpperCase() : '—')
// Mã dự án: 8 ký tự đầu của các dự án cùng tổ chức có thể trùng nhau, nên hiển thị 8 ký tự cuối.
const proj = (id?: string | null) => (id ? `…${id.slice(-8)}` : '—')
const NONE = 'Chưa có dữ liệu'

/**
 * B3/KHOA-TR03: đọc hồ sơ theo hạng mục và TRÁCH NHIỆM HIỆN HÀNH sau chuyển nghĩa vụ (WEB-B-READ-CONTRACTS.md).
 * Nguồn: GET /projects/{B}/lifecycle → responsibilities[] (packageId/currentRepairItemId), rồi — dưới URL dự án chịu trách nhiệm B — đọc
 * GET …/items/{item} (sourceContext), …/planning, …/source-defect (+ ảnh theo contentPath đã kiểm quyền), …/history.
 * Dự án gốc (origin) ≠ dự án chịu trách nhiệm hiện hành; không đổi projectId, lỗi đọc báo "Không đọc được …", không thay bằng dữ liệu rỗng.
 */
export const ResponsibilityItemPanel: React.FC<{ projects: ProjectChoice[]; initialProjectId?: string }> = ({ projects, initialProjectId }) => {
  const { projectId, select } = useProjectChoice(projects, initialProjectId)
  const user = useAuthStore((s) => s.user)
  const epoch = useAuthStore((s) => s.authEpoch)
  const { names: typeNames } = useDefectTypeNames()
  const [rows, setRows] = useState<Section<Responsibility[]>>({ status: 'loading' })
  const [picked, setPicked] = useState('')
  const [item, setItem] = useState<Section<any>>({ status: 'loading' })
  const [planning, setPlanning] = useState<Section<any>>({ status: 'loading' })
  const [source, setSource] = useState<Section<any>>({ status: 'loading' })
  const [history, setHistory] = useState<Section<any>>({ status: 'loading' })
  const [images, setImages] = useState<Record<string, string>>({})
  const [imgError, setImgError] = useState('')
  const seq = useRef(0), itemSeq = useRef(0)
  const allowed = user?.role === RoleCode.PROJECT_MANAGER || user?.role === RoleCode.SUPERVISOR

  const loadRows = useCallback(async () => {
    const my = ++seq.current
    setPicked(''); setRows({ status: 'loading' })
    if (!projectId) return
    try {
      const { data } = await apiClient.get(`/projects/${projectId}/lifecycle`)
      if (data?.projectId !== projectId || !Array.isArray(data.responsibilities)) throw new Error('BE trả lifecycle sai dự án hoặc thiếu responsibilities.')
      const mine = (data.responsibilities as Responsibility[]).filter((r) => r.currentProjectId === projectId && r.packageId && r.currentRepairItemId && r.originProjectId && r.originProjectId !== projectId)
      if (seq.current === my) setRows({ status: 'ready', data: mine })
    } catch (e) { if (seq.current === my) setRows({ status: 'error', error: exportError(e) }) }
  }, [projectId])
  useEffect(() => { void loadRows(); return () => { seq.current++; itemSeq.current++ } }, [loadRows, epoch])

  const chosen = rows.data?.find((r) => r.obligationId === picked)
  const loadItem = useCallback(async () => {
    const my = ++itemSeq.current
    Object.values(images).forEach((u) => URL.revokeObjectURL(u)); setImages({}); setImgError('')
    const base = chosen && projectId ? `/projects/${projectId}/repair-packages/${chosen.packageId}/items/${chosen.currentRepairItemId}` : ''
    const fresh = { status: 'loading' } as Section<any>
    setItem(fresh); setPlanning(fresh); setSource(fresh); setHistory(fresh)
    if (!base) return
    const get = async (suffix: string, set: (s: Section<any>) => void) => {
      try { const { data } = await apiClient.get(`${base}${suffix}`); if (itemSeq.current === my) set({ status: 'ready', data }) } catch (e) { if (itemSeq.current === my) set({ status: 'error', error: exportError(e) }) }
    }
    await Promise.all([get('', setItem), get('/planning', setPlanning), get('/source-defect', setSource), get('/history', setHistory)])
  }, [chosen?.obligationId, projectId])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void loadItem() }, [loadItem])

  const openImage = async (ev: { evidenceId: string; contentPath: string }) => {
    setImgError('')
    try {
      const path = ev.contentPath.startsWith('/api/v1') ? ev.contentPath.slice('/api/v1'.length) : ev.contentPath
      const r = await apiClient.get<Blob>(path, { responseType: 'blob' })
      setImages((m) => ({ ...m, [ev.evidenceId]: URL.createObjectURL(r.data) }))
    } catch (e) { setImgError(`Không mở được ảnh (quyền kiểm lại mỗi lần): ${exportError(e)}`) }
  }
  const err = (label: string, s: Section<unknown>) => s.status === 'error' && (
    <div className="rg-alert rg-alert-error" data-testid={`resp-error-${label}`}><p role="alert" className="min-w-0 break-words">Không đọc được {label}: {s.error}. Đây là lỗi đọc, không phải "chưa có dữ liệu".</p><PanelButton onClick={() => { void loadItem() }}>Thử lại</PanelButton></div>
  )

  if (!allowed) return null
  const it = item.data, sc = it?.sourceContext, sd = source.data, pl = planning.data
  return (
    <PanelShell icon="swap_horiz" title="Hồ sơ nghĩa vụ nhận chuyển (đọc theo hạng mục)" subtitle="Dự án gốc của hồ sơ khác dự án chịu trách nhiệm hiện hành; đọc theo đúng hạng mục và trách nhiệm hiện hành, không mở toàn bộ dự án gốc." data-testid="responsibility-item-panel">
      {select}
      {projectId && rows.status === 'loading' && <Loading>Đang đọc vòng đời dự án…</Loading>}
      {rows.status === 'error' && <div className="rg-alert rg-alert-error"><p role="alert" className="min-w-0 break-words">Không đọc được vòng đời dự án: {rows.error}</p><PanelButton onClick={() => { void loadRows() }}>Thử lại</PanelButton></div>}
      {projectId && rows.status === 'ready' && !rows.data?.length && <Empty icon="inbox">Dự án này hiện không nhận nghĩa vụ chuyển từ dự án khác (theo lifecycle).</Empty>}
      {rows.status === 'ready' && !!rows.data?.length && (
        <select aria-label="Nghĩa vụ nhận chuyển" className="rg-field w-full" value={picked} onChange={(e) => setPicked(e.target.value)}>
          <option value="">Chọn nghĩa vụ nhận chuyển</option>
          {rows.data.map((r) => <option key={r.obligationId} value={r.obligationId}>Gói {short(r.packageId)} · hạng mục {short(r.currentRepairItemId)} · nguồn dự án {proj(r.originProjectId)}</option>)}
        </select>
      )}
      {chosen && (
        <div className="space-y-3 text-xs">
          <KV items={[
            { k: 'Dự án gốc của hồ sơ', v: proj(chosen.originProjectId), mono: true },
            { k: 'Dự án chịu trách nhiệm hiện hành', v: proj(chosen.currentProjectId), mono: true },
            { k: 'Gói', v: short(chosen.packageId), mono: true },
            { k: 'Hạng mục', v: short(chosen.currentRepairItemId), mono: true },
          ]} />
          {item.status === 'loading' && <Loading>Đang đọc hạng mục…</Loading>}
          {err('hạng mục', item)}
          {it && <KV items={[
            { k: 'Chế độ / trạng thái', v: `${it.mode || NONE} · ${it.state || NONE}` },
            { k: 'Kết quả', v: it.result || NONE },
            { k: 'Khiếm khuyết (ngữ cảnh nguồn)', v: sc?.defectId ? `${short(sc.defectId)} · ${defectTypeLabel(sc.defectType ?? sc.defectTypeCode, typeNames)} · ${sc.defectStatus ?? NONE}` : NONE },
            { k: 'Nguồn → trách nhiệm', v: sc ? `${proj(sc.originProjectId)} → ${proj(sc.responsibilityProjectId)}` : NONE, mono: true },
          ]} />}
          <SectionTitle icon="event_note">Kế hoạch (GET …/items/{'{item}'}/planning)</SectionTitle>
          {planning.status === 'loading' && <Loading>Đang đọc kế hoạch…</Loading>}
          {err('kế hoạch', planning)}
          {pl && <KV items={[
            { k: 'Khối lượng dự kiến', v: pl.plannedQuantity != null ? `${pl.plannedQuantity} ${pl.plannedUnit || ''}`.trim() : 'Chưa nhập kế hoạch' },
            { k: 'Vật tư dự kiến', v: pl.plannedMaterials || 'Chưa nhập kế hoạch' },
          ]} />}
          <SectionTitle icon="troubleshoot">Khiếm khuyết gốc (GET …/source-defect)</SectionTitle>
          {source.status === 'loading' && <Loading>Đang đọc khiếm khuyết gốc…</Loading>}
          {err('khiếm khuyết gốc', source)}
          {sd && <>
            <KV items={[
              { k: 'Loại', v: defectTypeLabel(sd.defectTypeCode, typeNames) },
              { k: 'Mức độ / trạng thái', v: `${sd.severity || NONE} · ${sd.status || NONE}` },
            ]} />
            {(sd.missingSections?.length || 0) > 0 && <div className="flex flex-wrap gap-1.5">{sd.missingSections.map((m: string) => <Pill key={m} tone="warn">Thiếu: {m}</Pill>)}</div>}
            {!sd.evidence?.length ? <Empty icon="image_not_supported">Không có ảnh bằng chứng được phép đọc.</Empty> : (
              <ul className="space-y-2">{sd.evidence.map((ev: { evidenceId: string; contentPath: string; sourceKind?: string }) => (
                <li key={ev.evidenceId} className="rounded-lg border border-brand-border bg-white p-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-mono">{short(ev.evidenceId)}</span><Pill tone="neutral">{ev.sourceKind || 'Nguồn chưa rõ'}</Pill>{!images[ev.evidenceId] && <PanelButton onClick={() => { void openImage(ev) }}>Mở ảnh</PanelButton>}</div>
                  {images[ev.evidenceId] && <img alt={`Bằng chứng ${short(ev.evidenceId)}`} src={images[ev.evidenceId]} className="max-h-60 rounded-lg border border-brand-border" />}
                </li>))}</ul>
            )}
            {imgError && <p role="alert" className="text-rose-700">{imgError}</p>}
          </>}
          <SectionTitle icon="history">Lịch sử (GET …/history)</SectionTitle>
          {history.status === 'loading' && <Loading>Đang đọc lịch sử…</Loading>}
          {err('lịch sử', history)}
          {it && user?.role === RoleCode.PROJECT_MANAGER && <RepairExportPanel key={`export:${projectId}:${it.id}`} projectId={projectId} items={[it]} />}
          {history.data && <p>Quyết định {history.data.decisions?.length ?? 0} · lượt thi công {history.data.attempts?.length ?? 0} · yêu cầu xem lại {history.data.reviewRequests?.length ?? 0} · bản nộp {history.data.intakeSubmissions?.length ?? 0} · review {history.data.attemptReviews?.length ?? 0}</p>}
        </div>
      )}
    </PanelShell>
  )
}
