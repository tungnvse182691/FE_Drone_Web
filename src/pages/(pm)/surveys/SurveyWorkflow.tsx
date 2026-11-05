import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiClient } from '../../../api/client'
import { useAuthStore } from '../../../store/authStore'
import { surveyService } from '../../../api/services/surveyService'

function errorText(error: any): string {
  return [error?.response?.status, error?.response?.data?.code, error?.response?.data?.detail || error?.message].filter(Boolean).join(' — ')
}

/** PM planning and provenance reads; Operator capture remains an assigned Mobile operation. */
export const SurveyWorkflow: React.FC = () => {
  const [query, setQuery] = useSearchParams()
  const projectId = query.get('projectId') || ''
  const epoch = useAuthStore(state => state.authEpoch)
  const [projects, setProjects] = useState<Array<{ projectId: string; name: string }>>([])
  const [projectError, setProjectError] = useState('')
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(false)
  const [facts, setFacts] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [datasetId, setDatasetId] = useState('')
  const [dataset, setDataset] = useState<unknown>(null)
  const [datasetError, setDatasetError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setProjects([]); setProjectError('')
    surveyService.readSurveyPage('/projects', controller.signal).then(items => {
      if (!controller.signal.aborted) setProjects(items)
    }).catch(error => { if (!controller.signal.aborted) setProjectError(errorText(error)) })
    return () => controller.abort()
  }, [epoch, reload])
  useEffect(() => {
    const controller = new AbortController()
    setFacts({}); setErrors([]); setDataset(null); setDatasetId(''); setDatasetError(''); setLoading(false)
    if (!projectId || !projects.some(p => p.projectId === projectId)) return () => controller.abort()
    setLoading(true)
    const reads = ['survey-plans', 'survey-tasks', 'members', 'work-package']
    Promise.allSettled(reads.map(async resource => resource === 'work-package'
      ? (await apiClient.get(`/projects/${projectId}/${resource}`, { signal: controller.signal })).data
      : surveyService.readSurveyPage(`/projects/${projectId}/${resource}`, controller.signal)))
      .then(results => {
        if (controller.signal.aborted) return
        const next: Record<string, unknown> = {}, failures: string[] = []
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') next[reads[index]] = result.value
          else failures.push(`${reads[index]}: ${errorText(result.reason)}`)
        })
        setFacts(next); setErrors(failures); setLoading(false)
      })
    return () => controller.abort()
  }, [epoch, projectId, projects, reload])
  useEffect(() => {
    const controller = new AbortController()
    setDataset(null); setDatasetError('')
    const reference = query.get('datasetId')
    if (!reference || !projectId || !projects.some(p => p.projectId === projectId)) return () => controller.abort()
    apiClient.get(`/datasets/${encodeURIComponent(reference)}`, { signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setDataset(response.data)
    }).catch(error => { if (!controller.signal.aborted) setDatasetError(errorText(error)) })
    return () => controller.abort()
  }, [epoch, projectId, projects, query, reload])
  return <main className="space-y-4">
    <h1 className="text-xl font-bold">Kế hoạch bay và dữ liệu Operator</h1>
    <label>Dự án được cấp quyền<select aria-label="Dự án khảo sát" value={projectId} onChange={event => setQuery({ projectId: event.target.value })}>
      <option value="">Chọn dự án</option>{projects.map(p => <option key={p.projectId} value={p.projectId}>{p.name}</option>)}
    </select></label>
    <button onClick={() => setReload(value => value + 1)}>Tải lại từ máy chủ</button>
    {projectError && <p role="alert">Danh mục dự án: {projectError}</p>}
    {projectId && !projectError && projects.length > 0 && !projects.some(p => p.projectId === projectId) && <p role="alert">Dự án không thuộc phạm vi tài khoản.</p>}
    {loading && <p role="status">Đang tải kế hoạch, nhiệm vụ và phạm vi...</p>}
    {errors.map(error => <p role="alert" key={error}>{error}</p>)}
    <p role="status">BLOCKED: API Web chưa hỗ trợ tạo plan, giao task và discovery work-package. Chưa gửi lệnh ghi; cần backend bổ sung cookie/CSRF trước khi nối form tạo.</p>
    <button disabled>Tạo kế hoạch và giao Operator</button>
    {Object.entries(facts).map(([name, data]) => <section key={name}><h2>{name}</h2>
      {Array.isArray(data) && data.length === 0 ? <p>Không có dữ liệu trong kết quả API.</p> : <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>}
    </section>)}
    <section><h2>Dataset và provenance theo ID biên nhận từ server</h2>
      <p>Operator nhận nhiệm vụ và upload video/telemetry bằng API Mobile có quyền assignment. PM không nộp thay Operator. Chưa tích hợp trình upload Operator trên Web.</p>
      <input aria-label="Dataset ID từ biên nhận" value={datasetId} onChange={event => setDatasetId(event.target.value)} />
      <button disabled={!projectId || !/^[0-9a-f-]{36}$/i.test(datasetId)} onClick={() => setQuery({ projectId, datasetId })}>Đọc dataset từ máy chủ</button>
      {datasetError && <p role="alert">Dataset: {datasetError}</p>}
      {dataset != null && <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(dataset, null, 2)}</pre>}
      <p>Chỉ hiển thị trạng thái integrity/telemetry và phiên bản do server trả; không suy coverage, GSD, số ảnh hoặc đã hoàn tất bay.</p>
    </section>
  </main>
}
