import React, { useEffect, useRef, useState } from 'react'
import * as maplibre from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { caseReportService, type CaseReportDetail, type CaseReportEvidence } from '../../../api/services/caseReportService'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'

const errorText = (error: any) => `${error.response?.status || ''} ${error.response?.data?.code || ''} ${error.response?.data?.detail || error.message || 'Không tải được dữ liệu'}`.trim()
const date = (value: string | null) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có thông tin'

export const ReportEvidence: React.FC<{ caseId: string; reportId: string; evidence: CaseReportEvidence }> = ({ caseId, reportId, evidence }) => {
  const [load, setLoad] = useState(0)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMap, setShowMap] = useState(false)
  const container = useRef<HTMLDivElement | null>(null)
  const lat = evidence.location?.latitude, lng = evidence.location?.longitude
  const hasPosition = evidence.locationSource !== 'UNKNOWN' && typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180

  useEffect(() => {
    if (!load) return
    const controller = new AbortController()
    let objectUrl = ''
    setLoading(true); setError(''); setUrl('')
    caseReportService.image(caseId, reportId, evidence, controller.signal).then(blob => {
      if (controller.signal.aborted) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }).catch(error => { if (!controller.signal.aborted) setError(errorText(error)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [caseId, reportId, evidence.evidenceId, evidence.fileVersion, evidence.contentPath, load])

  useEffect(() => {
    if (!showMap || !hasPosition || !container.current) return
    let map: maplibre.Map | undefined
    try {
      map = new maplibre.Map({ container: container.current, style: getMapLibreStyle(), center: [lng!, lat!], zoom: 17 })
      new maplibre.Marker().setLngLat([lng!, lat!]).addTo(map)
    } catch {
      map?.remove()
      setError('Không mở được bản đồ của evidence này.')
      return
    }
    return () => map?.remove()
  }, [showMap, hasPosition, lat, lng])

  return <div className="border rounded p-3 space-y-2" data-evidence-id={evidence.evidenceId}>
    <p className="text-xs">Evidence {evidence.evidenceId} • Chụp: {date(evidence.capturedAt)} • Nguồn vị trí: {evidence.locationSource}</p>
    <p className="text-xs">{hasPosition ? `GPS: ${lat}, ${lng}; accuracy: ${evidence.location?.accuracyMeters ?? 'Chưa có thông tin'} m` : 'GPS: Chưa có thông tin'}</p>
    {hasPosition && <button type="button" onClick={() => setShowMap(value => !value)}>Xem vị trí evidence</button>}
    {showMap && hasPosition && <div ref={container} className="h-48" />}
    <button type="button" disabled={loading} onClick={() => setLoad(value => value + 1)}>{url ? 'Tải lại ảnh' : 'Tải ảnh'}</button>
    {loading && <p role="status">Đang tải ảnh...</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {url && <img src={url} alt={`Ảnh evidence ${evidence.evidenceId}`} className="max-h-96 w-full object-contain" />}
  </div>
}

export const CaseReportsPanel: React.FC<{ caseId: string; onSplit?: (reportId: string) => Promise<void> }> = ({ caseId, onSplit }) => {
  const epoch = useAuthStore(state => state.authEpoch)
  const scope = `${epoch}:${caseId}`
  const isPM = useAuthStore(state => state.user?.role === RoleCode.PROJECT_MANAGER)
  const activeScope = useRef(scope)
  activeScope.current = scope
  const splitAttempt = useRef(0)
  const splitBusy = useRef(false)
  const [splitTarget, setSplitTarget] = useState<string | null>(null)
  const [splitting, setSplitting] = useState(false)
  const [splitError, setSplitError] = useState('')
  const [reload, setReload] = useState(0)
  const [result, setResult] = useState<{ scope: string; items: CaseReportDetail[]; status: 'loading' | 'ready' | 'error'; error?: string }>({ scope, items: [], status: 'loading' })
  useEffect(() => {
    const controller = new AbortController()
    splitAttempt.current++; splitBusy.current = false
    setSplitTarget(null); setSplitting(false); setSplitError('')
    setResult({ scope, items: [], status: 'loading' })
    caseReportService.read(caseId, controller.signal).then(items => {
      if (!controller.signal.aborted) setResult({ scope, items, status: 'ready' })
    }).catch(error => {
      if (!controller.signal.aborted) setResult({ scope, items: [], status: 'error', error: errorText(error) })
    })
    return () => { controller.abort(); splitAttempt.current++ }
  }, [caseId, scope, reload])
  const current = result.scope === scope ? result : { items: [], status: 'loading' }
  const split = async () => {
    if (!isPM || !onSplit || !splitTarget || splitBusy.current || current.status !== 'ready' || current.items.length < 2) return
    const reportId = splitTarget
    const attempt = ++splitAttempt.current
    const active = () => activeScope.current === scope && splitAttempt.current === attempt
    splitBusy.current = true; setSplitting(true); setSplitError('')
    try {
      await onSplit(reportId)
      if (active()) { setSplitTarget(null); setReload(value => value + 1) }
    } catch (error) { if (active()) setSplitError(errorText(error)) }
    finally { if (active()) { splitBusy.current = false; setSplitting(false) } }
  }
  return <section className="space-y-4" aria-label="Chi tiết các phản ánh trong Case">
    <h3 className="font-bold">Phản ánh gốc và bổ sung</h3>
    <p className="text-xs text-slate-500">Tên và SĐT là thông tin tài khoản Reporter hiện tại, có thể thay đổi sau khi gửi.</p>
    {current.status === 'loading' && <p role="status">Đang tải chi tiết phản ánh...</p>}
    {current.status === 'error' && <p role="alert" className="text-red-700">{'error' in current ? current.error : ''}</p>}
    <button type="button" disabled={current.status === 'loading' || splitting} onClick={() => setReload(value => value + 1)}>Tải lại chi tiết phản ánh</button>
    {splitError && <p role="alert" className="text-red-700">Tách Report: {splitError}</p>}
    {splitting && <p role="status">Đang tách Report và đọc lại dữ liệu server...</p>}
    {current.status === 'ready' && current.items.length === 0 && <p>Không có Report đang liên kết với Case.</p>}
    {current.items.map(report => <article key={report.reportId} className="border rounded-xl p-4 space-y-3" data-report-id={report.reportId}>
      <h4 className="font-semibold">Report {report.reportId}</h4>
      {isPM && onSplit && current.items.length > 1 && <div>
        {splitTarget !== report.reportId ? <button type="button" disabled={splitting} onClick={() => setSplitTarget(report.reportId)}>Tách Report này</button> : <>
          <p>Report {report.reportId} sẽ được tách thành Case riêng. Giữ nguyên người gửi, nội dung và evidence của Report.</p>
          <button type="button" disabled={splitting} onClick={split}>Xác nhận tách Report</button>
          <button type="button" disabled={splitting} onClick={() => setSplitTarget(null)}>Hủy tách</button>
        </>}
      </div>}
      <p>Người gửi: {report.reporterDisplayName || 'Chưa có thông tin'}</p>
      <p>SĐT: {report.reporterPhoneNumber || 'Chưa có thông tin'} • {report.reporterPhoneNumberConfirmed ? 'Đã xác minh' : 'Chưa xác minh'}</p>
      <p>Tiếp nhận: {date(report.receivedAt)}</p><p className="whitespace-pre-wrap break-words">{report.description}</p>
      <h5>Ảnh gửi gốc ({report.originalEvidence.length})</h5>
      {report.originalEvidence.map(evidence => <ReportEvidence key={`${evidence.evidenceId}:${evidence.fileVersion}`} caseId={caseId} reportId={report.reportId} evidence={evidence} />)}
      {report.supplements.map(supplement => <section key={supplement.id} className="border-t pt-3 space-y-2" data-supplement-id={supplement.id}>
        <h5>Bổ sung {date(supplement.receivedAt)}</h5><p className="whitespace-pre-wrap break-words">{supplement.description}</p>
        <p>Ảnh bổ sung ({supplement.evidence.length})</p>
        {supplement.evidence.map(evidence => <ReportEvidence key={`${evidence.evidenceId}:${evidence.fileVersion}`} caseId={caseId} reportId={report.reportId} evidence={evidence} />)}
      </section>)}
    </article>)}
  </section>
}
