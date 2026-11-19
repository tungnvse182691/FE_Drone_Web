import { apiClient } from '../client'
import { workflowCollection } from './workflowCollection'
import { triageGeometryService } from './triageGeometryService'
import type { FastTrackTaskInput } from '../../pages/(pm)/fast-track/types'


export interface FastTrackSource {
  id: string; defectId: string; label: string; routeLabel: string
  pins: Pick<FastTrackTaskInput,'sourceKind'|'surveyId'|'segmentSetId'|'layoutRevisionId'|'slabId'|'mapPublicationId'|'crsProfileRevisionId'>

  requiredMeasurementType: number
}
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
  }
}
