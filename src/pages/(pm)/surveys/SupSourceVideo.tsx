import React, { useEffect, useState } from 'react'
import { surveyDatasetService, type DatasetDetail, type DatasetListItem } from '../../../api/services/surveyDatasetService'
import type { SurveyRecord } from '../../../api/services/surveyPlanningService'
import { exportError } from '../../../api/services/projectExportService'
import { Empty, Feedback, Loading, PanelShell } from '../../../components/ui/PanelKit'
import { SourceVideoPanel } from './SourceVideoPanel'

/**
 * Supervisor: chỉ ĐỌC video nguồn của bản nộp (GET danh sách bản nộp + GET dataset + GET file).
 * Không có đánh giá, baseline, job hay AI — các thao tác đó chỉ thuộc PM.
 */
export const SupSourceVideo: React.FC<{ record: SurveyRecord }> = ({ record }) => {
  const [list, setList] = useState<DatasetListItem[] | null>(null)
  const [datasetId, setDatasetId] = useState('')
  const [dataset, setDataset] = useState<DatasetDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setList(null); setDatasetId(''); setDataset(null); setError('')
    surveyDatasetService.listDatasets(record.id).then((p) => {
      if (!alive) return
      setList(p.items); if (p.items[0]) setDatasetId(p.items[0].id)
    }).catch((e) => { if (alive) { setList([]); setError(`Không đọc được danh sách bản nộp: ${exportError(e)}`) } })
    return () => { alive = false }
  }, [record.id])

  useEffect(() => {
    if (!datasetId) return
    let alive = true
    setLoading(true); setDataset(null); setError('')
    surveyDatasetService.dataset(datasetId, { taskId: record.id, projectId: record.projectId })
      .then((r) => { if (alive) setDataset(r.dataset) })
      .catch((e) => { if (alive) setError(exportError(e)) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [datasetId, record.id, record.projectId])

  return (
    <PanelShell icon="movie" title="Video nguồn khảo sát" subtitle="Chỉ xem — Supervisor không đánh giá hay khóa baseline">
      {list === null && <Loading>Đang tải danh sách bản nộp…</Loading>}
      {list && list.length === 0 && !error && <Empty icon="folder_off">Chưa có bộ dữ liệu cho nhiệm vụ này.</Empty>}
      {error && <Feedback error={error} />}
      {list && list.length > 0 && (
        <div className="space-y-3">
          <select aria-label="Bản nộp bộ dữ liệu" value={datasetId} onChange={(e) => setDatasetId(e.target.value)} className="rg-field">
            {list.map((d) => <option key={d.id} value={d.id}>Bản {d.versionNo} · {d.submittedAt ? new Date(d.submittedAt).toLocaleString('vi-VN') : '—'} · {d.integrityStatus || '—'}</option>)}
          </select>
          {loading && <Loading>Đang tải bản nộp…</Loading>}
          {dataset && <SourceVideoPanel key={dataset.id} sourceFiles={dataset.sourceFiles} versionNo={list.find((d) => d.id === dataset.id)?.versionNo} />}
        </div>
      )}
    </PanelShell>
  )
}
