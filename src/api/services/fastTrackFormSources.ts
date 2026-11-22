import { apiClient } from '../client'
import { workflowCollection } from './workflowCollection'
import { triageGeometryService } from './triageGeometryService'
import { repairWorkflowService } from './repairWorkflowService'
import type { FastTrackTaskInput } from '../../pages/(pm)/fast-track/types'


export interface FastTrackSource {
  id: string; defectId: string; label: string; routeLabel: string
  pins: Pick<FastTrackTaskInput,'sourceKind'|'surveyId'|'segmentSetId'|'layoutRevisionId'|'slabId'|'mapPublicationId'|'crsProfileRevisionId'>

  requiredMeasurementType: number
  /** true: nguồn dựng từ Defect/Report/Survey theo hợp đồng assign của BE (không có nhiệm vụ FIELD); loại đo do PM chọn (1–6). */
  derived?: boolean
}

export interface DerivedRowRef { projectId: string; defectId: string; packageId?: string; itemId?: string; obligationId?: string; originProjectId?: string }
export interface DefectRead { id: string; version: string; roadSectionVersionId: string | null; defectTypeCode?: string | null; readFromProject: string }

// "h4-frame-v1:" + SHA-256(JSON camelCase) — cùng công thức BE (RepairWorkflowRepository: SourceHash, JsonSerializerDefaults.Web).
async function frameHash(route: string, segmentSetId: string | null, layoutRevisionId: string | null, slabId: string | null, crs: string | null) {
  const json = JSON.stringify({ routeVersionId: route, segmentSetId, layoutRevisionId, slabId, crsProfileRevisionId: crs })
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json))
  return 'h4-frame-v1:' + [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

interface SourceDefectView { defectId: string; version?: string | null; defectTypeCode?: string | null; sources?: Array<{ kind?: string | null; id: string; caseId?: string | null }> | null }

export const fastTrackFormSources = {
  async read(project: string, taskId: string, defectId: string): Promise<FastTrackSource> {
    const {data:task,headers}=await apiClient.get(`/projects/${project}/field-inspection-tasks/${taskId}`)
    if(task?.id!==taskId || task.projectId!==project || task.defectId!==defectId || !task.version || headers.etag!==`"${task.version}"` || !['REPORTER','SURVEY'].includes(task.sourceKind)) throw new Error('Hồ sơ nguồn không khớp khiếm khuyết hoặc thiếu phiên bản.')
    const {data:defect}=await apiClient.get(`/projects/${project}/defects/${defectId}`)
    const road=(await triageGeometryService.routes(project)).find(r=>r.currentVersionId===defect.roadSectionVersionId)
    if(defect.id!==defectId || defect.projectId!==project || !road || task.routeVersionId!==road.currentVersionId) throw new Error('Hồ sơ nguồn không còn thuộc tuyến hiện hành của khiếm khuyết.')
    const {data:geometry}=await apiClient.get(`/projects/${project}/road-sections/${road.roadSectionId}/versions/${road.currentVersionId}/geometry`)
    if(geometry?.projectId!==project || geometry.routeVersionId!==task.routeVersionId || geometry.isCurrent!==true || (geometry.crsProfileRevisionId ?? null)!==(task.crsProfileRevisionId ?? null)) throw new Error('Hệ tọa độ hoặc phiên bản tuyến trong hồ sơ nguồn đã thay đổi.')
    if(task.segmentSetId && !(await triageGeometryService.sets(project,road)).some(s=>s.id===task.segmentSetId)) throw new Error('Bộ phân đoạn trong hồ sơ nguồn không còn được công bố.')
    if(task.layoutRevisionId) {
      const {data:layout}=await apiClient.get(`/projects/${project}/pavement-layouts/${task.layoutRevisionId}`)
      if(layout?.id!==task.layoutRevisionId || layout.projectId!==project || layout.routeVersionId!==task.routeVersionId || layout.segmentSetId!==task.segmentSetId || (layout.crsProfileRevisionId ?? null)!==(task.crsProfileRevisionId ?? null) || task.slabId && !layout.geometry?.slabs?.some((s:any)=>s.key===task.slabId)) throw new Error('Bố trí hoặc tấm trong hồ sơ nguồn không còn khớp.')
    } else if(task.slabId) throw new Error('Tấm chưa có bố trí mặt đường làm căn cứ.')
    if(task.mapPublicationId) {
      const {data:map}=await apiClient.get(`/projects/${project}/geometry-map-publications/${task.mapPublicationId}`)
      if(map?.publicationId!==task.mapPublicationId || map.projectId!==project || map.routeVersionId!==task.routeVersionId || map.segmentSetId!==task.segmentSetId || map.layoutRevisionId!==task.layoutRevisionId) throw new Error('Bản đồ công bố không khớp hồ sơ nguồn.')
    }
    if((task.sourceKind==='SURVEY')!==!!task.surveyId) throw new Error('Nguồn Drone phải có đợt khảo sát; nguồn phản ánh không gắn đợt Drone.')
    return {id:task.id,defectId:task.defectId,label:task.instructions || 'Hồ sơ nhiệm vụ hiện trường',routeLabel:road.name || road.code,requiredMeasurementType:task.requiredMeasurementType,
      pins:{sourceKind:task.sourceKind,surveyId:task.surveyId ?? null,segmentSetId:task.segmentSetId ?? null,layoutRevisionId:task.layoutRevisionId ?? null,slabId:task.slabId ?? null,mapPublicationId:task.mapPublicationId ?? null,crsProfileRevisionId:task.crsProfileRevisionId ?? null}}
  },
  // surveyTaskId đọc từ AI không phải surveyId mà BE yêu cầu cho FIELD.
  async list(project: string, defectIds: string[]): Promise<FastTrackSource[]> {
    const tasks=await workflowCollection<any>(`/projects/${project}/field-inspection-tasks`,project)
    const candidates=tasks.filter(t=>defectIds.includes(t.defectId) && t.mode==='MEASURE_ONLY' && t.status!=='Cancelled')
    return Promise.all(candidates.map(t=>this.read(project,t.id,t.defectId)))
  },

  /** Đọc Defect: ưu tiên dự án đang thao tác, sau đó dự án nguồn (nghĩa vụ nhận chuyển). Lỗi quyền được trả nguyên văn, không suy đoán. */
  async readDefect(row: DerivedRowRef): Promise<DefectRead> {
    const projects = [row.projectId, ...(row.originProjectId && row.originProjectId !== row.projectId ? [row.originProjectId] : [])]
    const errors: string[] = []
    for (const p of projects) {
      try {
        const r = await apiClient.get(`/projects/${p}/defects/${row.defectId}`)
        const d = r.data
        if (d?.id !== row.defectId || !d.version || r.headers?.etag !== `"${d.version}"`) throw new Error('Defect thiếu version/ETag khớp.')
        return { id: d.id, version: d.version, roadSectionVersionId: d.roadSectionVersionId ?? null, defectTypeCode: d.defectTypeCode, readFromProject: p }
      } catch (e: any) { errors.push(`dự án ${p === row.projectId ? 'đang thao tác' : 'nguồn'}: HTTP ${e?.response?.status || 'mạng'} ${e?.response?.data?.code || e?.message || ''}`.trim()) }
    }
    throw new Error(`Không đọc được khiếm khuyết gốc (${errors.join('; ')}).`)
  },

  /**
   * Nguồn giao Fast Track dựng theo hợp đồng assign của BE (không cần nhiệm vụ FIELD):
   *  - REPORTER: surveyId = null, BE kiểm liên kết KeepNew của Report;
   *  - SURVEY: surveyId = GET /datasets/{datasetId}.surveyId của đúng phát hiện AI.
   * Bộ pin route/segmentSet/layout/slab/CRS phải cho ra đúng `locationVersion` của nghĩa vụ; FE chỉ nhận bộ pin khớp hash do server cấp.
   */
  async derive(row: DerivedRowRef): Promise<{ sources: FastTrackSource[]; issues: string[] }> {
    const issues: string[] = [], out: FastTrackSource[] = []
    if (!row.packageId || !row.itemId || !row.obligationId) return { sources: [], issues: ['Hạng mục chưa đủ package/item/nghĩa vụ để dựng nguồn.'] }
    const p = row.projectId
    let defect: DefectRead
    try { defect = await this.readDefect(row) } catch (e: any) { return { sources: [], issues: [e.message] } }
    if (!defect.roadSectionVersionId) return { sources: [], issues: ['Khiếm khuyết chưa gắn phiên bản tuyến.'] }
    // Nguồn gốc của khiếm khuyết (Report / phát hiện AI) từ source-defect.
    let sd: SourceDefectView
    try { sd = (await apiClient.get<SourceDefectView>(`/projects/${p}/repair-packages/${row.packageId}/items/${row.itemId}/source-defect`)).data } catch (e: any) { return { sources: [], issues: [`Không đọc được nguồn gốc khiếm khuyết (source-defect): HTTP ${e?.response?.status || 'mạng'} ${e?.response?.data?.code || ''}`.trim()] } }
    // Bộ pin khớp locationVersion của nghĩa vụ (độ phủ → scopes[].locationVersion).
    let scope: { roadSectionId: string; locationVersion?: string } | undefined
    try { scope = (await repairWorkflowService.coverage(p)).scopes.find(s => s.obligationId === row.obligationId) as any } catch (e: any) { return { sources: [], issues: [`Không đọc được độ phủ để đối chiếu phạm vi nghĩa vụ: ${e?.message || e}`] } }
    if (!scope?.locationVersion) return { sources: [], issues: ['Độ phủ không có locationVersion cho nghĩa vụ này.'] }
    let crs: string | null = null, sets: string[] = []
    try {
      const g = (await apiClient.get(`/projects/${p}/road-sections/${scope.roadSectionId}/versions/${defect.roadSectionVersionId}/geometry`)).data
      crs = g?.crsProfileRevisionId ?? null
      sets = (await triageGeometryService.sets(p, { roadSectionId: scope.roadSectionId, currentVersionId: defect.roadSectionVersionId, code: '' })).map(s => s.id)
    } catch (e: any) { return { sources: [], issues: [`Không đọc được hình học/bộ phân đoạn của tuyến: HTTP ${e?.response?.status || 'mạng'} ${e?.response?.data?.code || e?.message || ''}`.trim()] } }
    let segmentSetId: string | null | undefined
    for (const candidate of [null, ...sets]) if (await frameHash(defect.roadSectionVersionId, candidate, null, null, crs) === scope.locationVersion) { segmentSetId = candidate; break }
    if (segmentSetId === undefined) return { sources: [], issues: ['Không dựng được bộ pin (bộ phân đoạn/bố trí/tấm/CRS) khớp locationVersion của nghĩa vụ; cần hồ sơ nguồn có pin riêng (nhiệm vụ FIELD đã xác thực).'] }
    const pins = { segmentSetId, layoutRevisionId: null, slabId: null, mapPublicationId: null, crsProfileRevisionId: crs }
    const kinds = (sd.sources || []).map(s => String(s.kind || '').toUpperCase())
    const hasReport = kinds.some(k => k.includes('REPORT'))
    const detections = (sd.sources || []).filter(s => /AI|DETECT|SURVEY/.test(String(s.kind || '').toUpperCase()))
    if (hasReport) out.push({ id: 'derived:REPORTER', defectId: row.defectId, label: 'Phản ánh người dân đã được PM ghi nhận (KEEP_NEW)', routeLabel: 'Theo khiếm khuyết gốc', requiredMeasurementType: 0, derived: true, pins: { sourceKind: 'REPORTER', surveyId: null, ...pins } })
    for (const det of detections) {
      try {
        const surveyId = await this.surveyIdForDetection(p, det.id)
        if (!out.some(s => s.pins.surveyId === surveyId)) out.push({ id: `derived:SURVEY:${surveyId}`, defectId: row.defectId, label: `Đợt khảo sát Drone ${surveyId.slice(0, 8)} (phát hiện AI ${det.id.slice(0, 8)})`, routeLabel: 'Theo khiếm khuyết gốc', requiredMeasurementType: 0, derived: true, pins: { sourceKind: 'SURVEY', surveyId, ...pins } })
      } catch (e: any) { issues.push(`Phát hiện AI ${det.id.slice(0, 8)}: ${e?.message || e}`) }
    }
    if (!out.length && !issues.length) issues.push(`Khiếm khuyết chưa có nguồn Report hoặc phát hiện AI đọc được (source-defect.sources: ${kinds.join(', ') || 'rỗng'}).`)
    return { sources: out, issues }
  },

  /** Phát hiện AI → dataset → surveyId thật (GET /datasets/{id}.surveyId). Không đoán khi BE trả null. */
  async surveyIdForDetection(project: string, detectionId: string): Promise<string> {
    let datasetVersionId: string | undefined
    const runs = await apiClient.get<{ items?: Array<{ id: string; datasetId?: string; status?: string }> }>(`/projects/${project}/ai-mock-runs`, { params: { limit: 100 } })
    for (const run of runs.data?.items || []) {
      if (run.status && run.status !== 'SUCCEEDED') continue
      const res = (await apiClient.get<{ detections?: Array<{ detectionId: string; datasetVersionId?: string }> }>(`/projects/${project}/ai-mock-runs/${run.id}/result`)).data
      const hit = (res.detections || []).find(d => d.detectionId === detectionId)
      if (hit) { datasetVersionId = hit.datasetVersionId || run.datasetId; break }
    }
    if (!datasetVersionId) throw new Error('chưa tìm thấy dataset của phát hiện này trong kết quả các lượt chạy AI')
    const ds = (await apiClient.get<{ surveyId?: string | null }>(`/datasets/${datasetVersionId}`)).data
    if (!ds?.surveyId) throw new Error('BE trả surveyId rỗng cho dataset này; không tự đoán')
    return ds.surveyId
  },

  /** Giải nguồn đã chọn: nguồn dựng (derived:*) hoặc hồ sơ nhiệm vụ FIELD đã xác thực. */
  async resolve(row: DerivedRowRef, sourceId: string): Promise<FastTrackSource> {
    if (sourceId.startsWith('derived:')) {
      const found = (await this.derive(row)).sources.find(s => s.id === sourceId)
      if (!found) throw new Error('Nguồn dựng không còn khớp khiếm khuyết/nghĩa vụ. Chọn lại hồ sơ nguồn.')
      return found
    }
    return this.read(row.projectId, sourceId, row.defectId)
  }
}
