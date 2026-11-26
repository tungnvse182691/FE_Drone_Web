import React, { useEffect, useState } from 'react'
import { apiClient } from '../../../api/client'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, KV, Loading, PanelButton, PanelShell, Pill, SectionTitle } from '../../../components/ui/PanelKit'
import type { RepairItem } from '../../../api/services/repairWorkflowService'
import { defectTypeLabel, useDefectTypeNames } from '../../../api/services/defectTypeNames'

interface SourceDefect {
  defectId: string; defectTypeCode?: string | null; severity?: string | null; status?: string | null; geometryWkt?: string | null; srid?: number | null
  dataKind?: string | null; version?: string | null; missingSections?: string[] | null
  evidence?: Array<{ evidenceId: string; contentPath: string; sourceKind?: string | null; capturedAt?: string | null }> | null
}
const KIND: Record<string, string> = { CURRENT_SOURCE: 'Defect hiện hành (khác phương án đã ghim của hạng mục)' }

/** Khiếm khuyết gốc của hạng mục: GET …/items/{itemId}/source-defect (PM/Sup). Ảnh bằng chứng mở theo contentPath do BE trả (kiểm quyền mỗi lần). */
export const SourceDefectPanel: React.FC<{ projectId: string; packageId: string; items: RepairItem[] }> = ({ projectId, packageId, items }) => {
  const { names: typeNames } = useDefectTypeNames()
  const [itemId, setItemId] = useState(items[0]?.id || '')
  useEffect(() => { if (!items.some((i) => i.id === itemId)) setItemId(items[0]?.id || '') }, [items, itemId])
  const [data, setData] = useState<SourceDefect | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<Record<string, string>>({})
  const [imgError, setImgError] = useState('')

  const load = async () => {
    if (!itemId) return
    setLoading(true); setError(''); setData(null); setImgError('')
    Object.values(images).forEach((u) => URL.revokeObjectURL(u)); setImages({})
    try {
      const { data: d } = await apiClient.get<SourceDefect>(`/projects/${projectId}/repair-packages/${packageId}/items/${itemId}/source-defect`)
      if (!d?.defectId) throw new Error('BE trả khiếm khuyết gốc thiếu mã.')
      setData(d)
    } catch (e) { setError(exportError(e)) } finally { setLoading(false) }
  }
  const openImage = async (ev: NonNullable<SourceDefect['evidence']>[number]) => {
    setImgError('')
    try {
      const path = ev.contentPath.startsWith('/api/v1') ? ev.contentPath.slice('/api/v1'.length) : ev.contentPath
      const r = await apiClient.get<Blob>(path, { responseType: 'blob' })
      setImages((m) => ({ ...m, [ev.evidenceId]: URL.createObjectURL(r.data) }))
    } catch (e) { setImgError(`Không mở được ảnh (quyền được kiểm lại mỗi lần): ${exportError(e)}`) }
  }

  if (!items.length) return null
  return (
    <PanelShell icon="troubleshoot" title="Khiếm khuyết gốc của hạng mục" subtitle="Đọc từ máy chủ theo đúng hạng mục; không đoán từ khiếm khuyết lân cận" data-testid="source-defect-panel">
      <div className="flex flex-wrap items-end gap-2">
        <select aria-label="Chọn hạng mục" className="rg-field !w-auto" value={itemId} onChange={(e) => { setItemId(e.target.value); setData(null) }}>
          {items.map((i) => <option key={i.id} value={i.id}>Hạng mục {i.id.slice(0, 8).toUpperCase()}</option>)}
        </select>
        <PanelButton variant="primary" loading={loading} disabled={loading || !itemId} onClick={() => { void load() }}>Xem khiếm khuyết gốc</PanelButton>
      </div>
      <Feedback error={error || imgError} />
      {loading && <Loading>Đang đọc khiếm khuyết gốc…</Loading>}
      {data && (
        <div className="space-y-3">
          <KV items={[
            { k: 'Loại hư hỏng', v: defectTypeLabel(data.defectTypeCode, typeNames) },
            { k: 'Mức độ', v: data.severity || 'Chưa có' },
            { k: 'Trạng thái', v: data.status || 'Chưa có' },
            { k: 'Nguồn dữ liệu', v: KIND[data.dataKind || ''] || data.dataKind || 'Chưa rõ' },
            { k: 'Vị trí', v: data.geometryWkt ? `${data.geometryWkt}${data.srid ? ` (SRID ${data.srid})` : ''}` : 'Chưa có hình học', mono: true },
          ]} />
          {(data.missingSections?.length || 0) > 0 && <div className="flex flex-wrap gap-1.5">{data.missingSections!.map((m) => <Pill key={m} tone="warn">Thiếu: {m}</Pill>)}</div>}
          <SectionTitle icon="photo_library">Ảnh/bằng chứng gốc</SectionTitle>
          {!data.evidence?.length ? <Empty icon="image_not_supported">Không có ảnh bằng chứng được phép đọc cho khiếm khuyết này.</Empty> : (
            <ul className="space-y-2">
              {data.evidence.map((ev) => (
                <li key={ev.evidenceId} className="rounded-lg border border-brand-border bg-white p-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono">{ev.evidenceId.slice(0, 8)}</span><Pill tone="neutral">{ev.sourceKind || 'Nguồn chưa rõ'}</Pill>
                    <span className="text-slate-500">{ev.capturedAt ? new Date(ev.capturedAt).toLocaleString('vi-VN') : 'Chưa có thời điểm chụp'}</span>
                    {!images[ev.evidenceId] && <PanelButton onClick={() => { void openImage(ev) }}>Mở ảnh</PanelButton>}
                  </div>
                  {images[ev.evidenceId] && <img alt={`Bằng chứng ${ev.evidenceId.slice(0, 8)}`} src={images[ev.evidenceId]} className="max-h-72 rounded-lg border border-brand-border" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </PanelShell>
  )
}
