import React, { createContext, useContext, useEffect, useState } from 'react'
import { caseReportService, type CaseReportDetail, type CaseReportEvidence } from '../../../api/services/caseReportService'
import { useAuthStore } from '../../../store/authStore'
import { Icon } from '../../../components/ui/Icon'

export function reportError(error: any): string {
  const status = error?.response?.status, code = error?.response?.data?.code
  const correlationId = error?.response?.data?.correlationId || error?.response?.headers?.['x-correlation-id']
  console.warn('[Case reports]', { status, code, correlationId })
  const ref = correlationId ? ` Mã đối chiếu: ${correlationId}.` : ''
  if (status === 401) return `Phiên đăng nhập không hợp lệ hoặc đã hết hạn (HTTP 401${code ? ' ' + code : ''}). Đăng nhập lại rồi thử lại.${ref}`
  if (status === 403) return `Bạn không có quyền đọc phản ánh hoặc bằng chứng này (HTTP 403${code ? ' ' + code : ''}).${ref}`
  if (status === 404) return `Không tìm thấy phản ánh/bằng chứng trên máy chủ (HTTP 404${code ? ' ' + code : ''}). Bấm Thử lại để đọc lại hồ sơ.${ref}`
  if (status) return `Không thể tải phản ánh hoặc ảnh (HTTP ${status}${code ? ' ' + code : ''}). Vui lòng thử lại.${ref}`
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') return 'Không kết nối được máy chủ để tải ảnh/phản ánh. Kiểm tra mạng rồi thử lại.'
  return error?.message ? `Không thể tải phản ánh hoặc ảnh: ${error.message}` : 'Không thể tải phản ánh hoặc ảnh. Vui lòng thử lại.'
}
// GPS của đúng evidence đang xem (location + locationSource); không dùng tọa độ Case/ảnh khác, không có tọa độ mặc định.
export function evidenceGps(evidence?: CaseReportEvidence | null): { located: boolean; text: string; lat?: number; lng?: number; source: string } {
  const source = evidence?.locationSource || 'UNKNOWN'
  const lat = evidence?.location?.latitude, lng = evidence?.location?.longitude
  if (evidence && source !== 'UNKNOWN' && typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180)
    return { located: true, text: `${lat}, ${lng}`, lat, lng, source }
  return { located: false, text: evidence ? 'UNKNOWN — chưa có vị trí được xác nhận' : 'Chưa chọn ảnh/bằng chứng', source }
}
const evidenceKey = (reportId: string, evidence: CaseReportEvidence) => `${reportId}:${evidence.evidenceId}:${evidence.fileVersion}`

export function useReportMediaState(caseId: string, caseVersion = '') {
  const epoch = useAuthStore(state => state.authEpoch), scope = `${epoch}:${caseId}:${caseVersion}`
  const [snapshot, setSnapshot] = useState<{scope: string; reports: CaseReportDetail[]; error: string} | null>(null)
  const [reload, setReload] = useState(0), [choice, setChoice] = useState<{scope: string; key: string} | null>(null)
  const [image, setImage] = useState<{scope: string; key: string; url: string; error: string} | null>(null)
  const [imageReload, setImageReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setSnapshot(null)
    if (caseId) caseReportService.read(caseId, controller.signal).then(reports => {
      if (!controller.signal.aborted) setSnapshot({scope, reports, error: ''})
    }).catch(error => { if (!controller.signal.aborted) setSnapshot({scope, reports: [], error: reportError(error)}) })
    return () => controller.abort()
  }, [scope, reload])
  const current = snapshot?.scope === scope ? snapshot : null
  const reports = current?.reports || []
  const evidence = reports.flatMap(report => [...report.originalEvidence, ...report.supplements.flatMap(s => s.evidence)].map(item => ({reportId: report.reportId, evidence: item})))
  const selected = evidence.find(item => choice?.scope === scope && evidenceKey(item.reportId, item.evidence) === choice.key) || evidence[0] || null
  const key = selected ? evidenceKey(selected.reportId, selected.evidence) : ''
  useEffect(() => {
    const controller = new AbortController(); let url = ''
    setImage(null)
    if (selected) caseReportService.image(caseId, selected.reportId, selected.evidence, controller.signal).then(blob => {
      if (controller.signal.aborted) return
      url = URL.createObjectURL(blob); setImage({scope, key, url, error: ''})
    }).catch(error => { if (!controller.signal.aborted) setImage({scope, key, url: '', error: reportError(error)}) })
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [scope, key, selected?.evidence.contentPath, imageReload])
  const activeImage = image?.scope === scope && image.key === key ? image : null
  return {caseId, reports, reportsLoading: !!caseId && !current, reportsError: current?.error || '', selected,
    url: activeImage?.url || '', imageLoading: !!selected && !activeImage, imageError: activeImage?.error || '',
    select: (reportId: string, item: CaseReportEvidence) => setChoice({scope, key: evidenceKey(reportId, item)}),
    retry: () => setReload(n => n + 1), retryImage: () => setImageReload(n => n + 1),
    decodeError: () => setImage({scope, key, url: '', error: 'Không thể hiển thị ảnh máy chủ trả về. Vui lòng thử lại.'})}
}
export type CaseReportMedia = ReturnType<typeof useReportMediaState>
const ReportMediaContext = createContext<CaseReportMedia | null>(null)
export const useCaseReportMedia = () => useContext(ReportMediaContext)
export function CaseReportMediaProvider({caseId, caseVersion, children}: {caseId: string; caseVersion?: string; children: React.ReactNode}) {
  const media = useReportMediaState(caseId, caseVersion)
  return <ReportMediaContext.Provider value={media}>{children}</ReportMediaContext.Provider>
}

// Both existing image viewports read the same private blob and error state.
export function CaseReportImage({caseId, alt, className}: {caseId: string; alt: string; className: string}) {
  const media = useCaseReportMedia()
  const url = media?.caseId === caseId ? media.url : ''
  if (url) return <img src={url} alt={alt} className={className} onError={media?.decodeError} />
  const error = media?.reportsError || media?.imageError
  const loading = !media || media.reportsLoading || media.imageLoading || media.caseId !== caseId
  const message = error || (loading ? 'Đang tải ảnh bằng chứng...' : 'Không có ảnh đính kèm')
  return <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1.5">
    <Icon name="photo_camera" size={32} />
    <span role={error ? 'alert' : 'status'} className="text-xs">{message}</span>
    {error && <button type="button" onClick={media?.reportsError ? media.retry : media?.retryImage} className="text-xs underline">Thử lại</button>}
  </div>
}

// Provenance comes from the bound Report read model, never verificationMethod or a filename.
export function reportSourceLabelForCase(caseId: string, media: CaseReportMedia | null, fallback: string): string {
  if (!media || media.caseId !== caseId) return fallback
  if (media.reportsLoading) return 'Đang đọc nguồn tiếp nhận'
  if (media.reportsError) return 'Không đọc được nguồn tiếp nhận'
  const reports = media.selected ? media.reports.filter(r => r.reportId === media.selected!.reportId) : media.reports
  const uuid = (value: unknown) => typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value)
  return reports.length && reports.every(r => r.caseId === caseId && uuid(r.reportId) && uuid(r.reporterUserId)) ? 'Phản ánh từ người dân' : fallback
}
