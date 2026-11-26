import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { projectService } from '../../api/services/projectService'
import { projectReportingService, type TimelineItem } from '../../api/services/projectReportingService'
import { exportError } from '../../api/services/projectExportService'
import { Empty, Feedback, KV, Loading, PanelButton, PanelShell, Pill, SectionTitle } from '../../components/ui/PanelKit'

type Win = '24h' | '7d' | '30d' | 'all'
interface Row extends TimelineItem { projectId: string; projectName: string }

/**
 * Nhật ký hoạt động = GET /projects/{p}/reports/timeline (ReportingTimelinePageDto: eventId, occurredAt, actorDisplay, action, summary, source{type,id,version}).
 * BE không có API nhật ký kiểm toán riêng, không trả vai trò/lý do/trạng thái trước-sau/ảnh và không có API xuất riêng → màn chỉ hiển thị các trường BE trả.
 */
export const AuditTrail: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const authEpoch = useAuthStore((s) => s.authEpoch)
  const scopeLabel = user?.role === RoleCode.SUPERVISOR ? 'Toàn bộ dự án' : 'Dự án thuộc phạm vi PM'
  const [projects, setProjects] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [projectId, setProjectId] = useState('all')
  const [win, setWin] = useState<Win>('30d')
  const [keyword, setKeyword] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => { projectService.fetchProjects().then((p) => setProjects(p.map((x) => ({ id: x.id, name: x.name, code: x.code })))).catch((e) => setError(exportError(e))) }, [authEpoch])

  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true); setError(''); setNotes([])
    try {
      const all = await projectService.fetchProjects()
      const targets = all.filter((p) => projectId === 'all' || p.id === projectId)
      const hours = win === '24h' ? 24 : win === '7d' ? 168 : win === '30d' ? 720 : 0
      const filters = hours ? { from: new Date(Date.now() - hours * 3600000).toISOString(), to: new Date().toISOString() } : {}
      const out: Row[] = []
      const warn: string[] = []
      const results = await Promise.allSettled(targets.map((p) => projectReportingService.timeline(p.id, filters, signal)))
      results.forEach((r, i) => {
        if (r.status === 'rejected') { warn.push(`${targets[i].code}: ${exportError(r.reason)}`); return }
        if (r.value.availability.availability !== 'AVAILABLE') warn.push(`${targets[i].code}: nguồn ${r.value.availability.availability}${r.value.availability.reasonCodes.length ? ` (${r.value.availability.reasonCodes.join(', ')})` : ''}`)
        for (const it of r.value.items) out.push({ ...it, projectId: targets[i].id, projectName: targets[i].name })
      })
      out.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
      if (signal.aborted) return
      setRows(out); setNotes(warn); setSelectedId((prev) => prev || out[0]?.eventId || '')
    } catch (e) { if (!signal.aborted) { setRows([]); setError(exportError(e)) } } finally { if (!signal.aborted) setLoading(false) }
  }, [projectId, win])
  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort() }, [load, reload, authEpoch])

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    return k ? rows.filter((r) => [r.summary, r.action, r.actorDisplay, r.source.type, r.projectName].some((v) => (v || '').toLowerCase().includes(k))) : rows
  }, [rows, keyword])
  const selected = filtered.find((r) => r.eventId === selectedId) || filtered[0]

  return (
    <div className="space-y-4 pb-10" data-testid="audit-trail">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nhật ký hoạt động</h1>
        <p className="text-xs text-slate-500 mt-1">{scopeLabel} · Dữ liệu từ lịch sử báo cáo của máy chủ (reports/timeline).</p>
      </div>
      <PanelShell icon="history" title="Sự kiện nghiệp vụ" subtitle="Chỉ các trường máy chủ trả về" actions={<PanelButton onClick={() => setReload((n) => n + 1)} disabled={loading}>Tải lại</PanelButton>}>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Dự án" className="rg-field !w-auto" value={projectId} onChange={(e) => { setProjectId(e.target.value); setSelectedId('') }}>
            <option value="all">Tất cả dự án</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}
          </select>
          <select aria-label="Khoảng thời gian" className="rg-field !w-auto" value={win} onChange={(e) => { setWin(e.target.value as Win); setSelectedId('') }}>
            <option value="24h">24 giờ qua</option><option value="7d">7 ngày qua</option><option value="30d">30 ngày qua</option><option value="all">Toàn bộ</option>
          </select>
          <input aria-label="Tìm trong sự kiện" className="rg-field !w-64" placeholder="Tìm theo mô tả, hành động, người thực hiện" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <Feedback error={error} />
        {notes.length > 0 && <div className="rg-alert rg-alert-warn"><p className="min-w-0 break-words">{notes.join(' · ')}</p></div>}
        {loading && <Loading>Đang đọc lịch sử từ máy chủ…</Loading>}
        {!loading && !error && filtered.length === 0 && <Empty icon="history">Không có sự kiện trong phạm vi đã chọn.</Empty>}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b"><th className="py-2 pr-3">Thời điểm</th><th className="pr-3">Dự án</th><th className="pr-3">Người thực hiện</th><th className="pr-3">Hành động</th><th>Mô tả</th></tr></thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={`${r.projectId}:${r.eventId}`} onClick={() => setSelectedId(r.eventId)} className={`border-b cursor-pointer hover:bg-slate-50 ${selected?.eventId === r.eventId ? 'bg-brand-surfaceAlt' : ''}`}>
                      <td className="py-2 pr-3 whitespace-nowrap font-mono">{new Date(r.occurredAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
                      <td className="pr-3">{r.projectName}</td>
                      <td className="pr-3">{r.actorDisplay || 'Máy chủ không trả tên'}</td>
                      <td className="pr-3"><Pill tone="neutral">{r.action}</Pill></td>
                      <td className="max-w-xs truncate" title={r.summary}>{r.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selected && (
              <div className="space-y-2">
                <SectionTitle icon="info">Chi tiết sự kiện</SectionTitle>
                <KV items={[
                  { k: 'Mã sự kiện', v: selected.eventId, mono: true },
                  { k: 'Dự án', v: selected.projectName },
                  { k: 'Thời điểm', v: new Date(selected.occurredAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) },
                  { k: 'Người thực hiện', v: selected.actorDisplay || 'Máy chủ không trả tên' },
                  { k: 'Hành động', v: selected.action, mono: true },
                  { k: 'Mô tả', v: selected.summary },
                  { k: 'Nguồn', v: `${selected.source.type} · ${selected.source.id}`, mono: true },
                  { k: 'Phiên bản nguồn', v: selected.source.version, mono: true },
                ]} />
              </div>
            )}
          </div>
        )}
      </PanelShell>
    </div>
  )
}

export default AuditTrail
