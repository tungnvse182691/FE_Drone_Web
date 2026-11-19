import { confirmedGeometryDisplay } from '../../pages/(pm)/alignment/confirmedGeometryDisplay'
import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { alignmentService } from './alignmentService'
import { publishedSetForRoute, segmentSetService } from './segmentSetService'
import type { ProjectRouteConfig, AvailablePilot } from '../../pages/(pm)/create-survey/types'
import type { SurveyMissionItem } from './surveyService'

// Web mutations use the shared cookie/CSRF client, per BE b89a52f handoff.
export interface SurveyScope { routeVersionId: string; segmentSetId: string; segmentIds: string[]; targetBand: 'SURFACE' | 'LEFT_EDGE' | 'RIGHT_EDGE' }
export interface SurveyProject { projectId: string; projectCode: string; name: string; status: string }
export interface SurveyRecord {
  id: string; projectId: string; status: string; version: string; scope?: SurveyScope[]
  plannedAt?: string; operatorId?: string; supplementTaskId?: string | null
  recordKind: 'PLAN' | 'TASK'
}
export interface SurveyPresentation {
  operatorName?: string
  scopes: {routeName: string; band: string; ranges: string; historical: boolean}[]
}
export const surveyStatusLabel = (status: string) => ({PLANNED:'Đã lập kế hoạch',IN_PROGRESS:'Đang thực hiện',NEW_ASSIGNED:'Đã giao nhiệm vụ',REASSIGNED:'Đã giao lại',ACCEPTED:'Đã tiếp nhận',SUBMITTED:'Đã nộp kết quả',SUPPLEMENT_REQUIRED:'Chờ bổ sung',COMPLETED:'Hoàn thành',REJECTED:'Đã từ chối',CANCELLED:'Đã hủy',POSTPONED:'Đã hoãn'}[status] || 'Trạng thái chưa được hỗ trợ')
export const surveyPlannedAtLabel = (value: string) => new Intl.DateTimeFormat('vi-VN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(value))
function session() {
  const state = useAuthStore.getState(), epoch = state.authEpoch, actor = state.user?.id
  if (!state.isAuthenticated || !actor || ![RoleCode.PROJECT_MANAGER, RoleCode.SUPERVISOR].includes(state.user!.role)) throw new Error('Cần phiên PM/Giám sát hợp lệ để đọc khảo sát.')
  return () => {
    const now = useAuthStore.getState()
    if (!now.isAuthenticated || now.authEpoch !== epoch || now.user?.id !== actor) throw new Error('Phiên khảo sát đã thay đổi; bỏ kết quả cũ.')
  }
}
export function scopeForStations(route: ProjectRouteConfig, startKm: string, endKm: string, targetBand: string): SurveyScope {
  if (!route.serverSet || route.serverSet.status !== 'PUBLISHED' || route.serverSet.routeVersionId !== route.routeVersionId || !route.routeVersionId || !['SURFACE','LEFT_EDGE','RIGHT_EDGE'].includes(targetBand)) throw new Error('Chọn route, segment set PUBLISHED và dải khảo sát từ máy chủ.')
  if (!startKm.trim() || !endKm.trim()) throw new Error('Chọn lý trình đầu/cuối đúng ranh giới segment server.')
  const start = Number(startKm), end = Number(endKm), segments = route.serverSet.segments
  if (![start,end].every(Number.isFinite) || !(end > start)) throw new Error('Lý trình phải hữu hạn, kết thúc lớn hơn bắt đầu.')
  // Compare the exact km values displayed from server stations. Never snap/expand/slice a segment.
  const first = segments.findIndex(s => s.startStationMeters / 1000 === start)
  const last = segments.findIndex(s => s.endStationMeters / 1000 === end)
  if (first < 0 || last < first) throw new Error('Khoảng Km không khớp ranh giới segment. Contract chỉ nhận nguyên segment; chọn lại mốc đầu/cuối từ các segment đã công bố, không tự mở rộng hoặc cắt phạm vi.')
  const chosen = segments.slice(first, last + 1)
  if (chosen.some((s,i) => !s.id || i > 0 && s.startStationMeters !== chosen[i-1].endStationMeters)) throw new Error('Phạm vi segment server thiếu ID hoặc không liên tục.')
  return { routeVersionId: route.routeVersionId, segmentSetId: route.serverSet.id, segmentIds: chosen.map(s => s.id!), targetBand: targetBand as SurveyScope['targetBand'] }
}
function validateScope(scope: SurveyScope[]) {
  if (!Array.isArray(scope) || !scope.length || scope.some(s => !s.routeVersionId || !s.segmentSetId || !Array.isArray(s.segmentIds) || !s.segmentIds.length || new Set(s.segmentIds).size !== s.segmentIds.length || s.segmentIds.some(id => !id) || !['SURFACE','LEFT_EDGE','RIGHT_EDGE'].includes(s.targetBand))) throw new Error('Scope khảo sát trả sai contract.')
}
export const surveyPlanningService = {
  async page<T>(path: string, signal?: AbortSignal, onPage?: (asOf: unknown) => void): Promise<T[]> {
    const current = session(), all: T[] = [], seen = new Set<string>()
    let cursor: string | undefined
    do {
      const {data} = await apiClient.get(path, {params: {limit: 100, cursor}, signal})
      current()
      if (signal?.aborted) throw new Error('Đã hủy đọc khảo sát.')
      if (!Array.isArray(data?.items) || !(data.nextCursor === null || typeof data.nextCursor === 'string' && !!data.nextCursor)) throw new Error('Collection khảo sát sai contract; không coi là danh sách rỗng.')
      onPage?.(data.asOf)
      all.push(...data.items); cursor = data.nextCursor || undefined
      if (cursor && seen.has(cursor)) throw new Error('Cursor khảo sát bị lặp; chưa đọc đủ danh sách.')
      if (cursor) seen.add(cursor)
    } while (cursor)
    return all
  },
  async projects(signal?: AbortSignal) {
    const rows = await this.page<SurveyProject>('/projects', signal)
    if (rows.some(p => !p.projectId || !p.projectCode || !p.name) || new Set(rows.map(p => p.projectId)).size !== rows.length) throw new Error('Danh sách dự án sai ID/contract.')
    return rows
  },
  async routes(project: SurveyProject): Promise<ProjectRouteConfig[]> {
    const current = session(), context = await alignmentService.readProjectContext(project.projectId)
    current()
    if (context.projectId !== project.projectId) throw new Error('Context trả sai dự án.')
    const routes: ProjectRouteConfig[] = []
    for (const road of context.roadSections) {
      if (!road.currentVersionId) continue
      const geometry = await alignmentService.readConfirmedGeometry(project.projectId, road.roadSectionId, road.currentVersionId)
      current()
      if (geometry.projectId !== project.projectId || geometry.roadSectionId !== road.roadSectionId || geometry.routeVersionId !== road.currentVersionId || geometry.metadataStatus !== 'COMPLETE') throw new Error('Geometry chưa COMPLETE hoặc sai project/section/version.')
      const pins = {projectId: project.projectId, roadSectionId: road.roadSectionId, routeVersionId: road.currentVersionId}
      const published = publishedSetForRoute(await segmentSetService.list(pins), road.currentVersionId)
      current()
      const set = published ? (await segmentSetService.read(pins, published.id)).data : undefined
      current()
      if (set && (set.status !== 'PUBLISHED' || set.segments.at(-1)?.toOffsetMeters !== geometry.lengthMeters)) throw new Error('Publication thay đổi hoặc không phủ đúng route server.')
      const coords = confirmedGeometryDisplay(geometry).coordinates
      routes.push({id: road.currentVersionId, code: road.code, name: road.name || road.code, type: 'MAINLINE', parentProjectId: project.projectId, parentProjectCode: project.projectCode, parentProjectName: project.name, roadSectionId: road.roadSectionId, routeVersionId: road.currentVersionId,
        serverGeometry: geometry, engineeringSrid: geometry.engineeringSrid, serverSet: set, startKm: set ? set.segments[0].startStationMeters / 1000 : Number.NaN, endKm: set ? set.segments.at(-1)!.endStationMeters / 1000 : Number.NaN,
        lengthKm: geometry.lengthMeters / 1000, defaultCoords: coords, defaultKmPoints: [], hasAlignment: !!set, alignmentStatusText: set ? `PUBLISHED ${set.id}` : 'PM chưa công bố phân đoạn' })
    }
    return routes
  },
  async operators(projectId: string): Promise<AvailablePilot[]> {
    let asOf = ''
    const members = await this.page<{membershipId:string;userId:string;displayName?:string;role:string;status:string;validFrom:string;validTo:string|null}>(`/projects/${projectId}/members`, undefined, value => {
      if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('Membership thiếu asOf server để kiểm hiệu lực.')
      const day = new Date(value).toISOString().slice(0,10)
      if (asOf && asOf !== day) throw new Error('Ngày hiệu lực thay đổi giữa các trang; hãy đọc lại membership.')
      asOf = day
    })
    const today = asOf // ProjectScopeGuard uses the server's UTC date and inclusive ValidTo.
    const active = members.filter(m => {
      if (!m.membershipId || !m.userId || !m.role || !m.status || !/^\d{4}-\d{2}-\d{2}$/.test(m.validFrom) || !(m.validTo === null || /^\d{4}-\d{2}-\d{2}$/.test(m.validTo))) throw new Error('Membership thiếu ID/role/status/ngày hiệu lực; chưa chọn Operator.')
      return m.role === 'OPERATOR' && m.status === 'ACTIVE' && m.validFrom <= today && (m.validTo === null || today <= m.validTo)
    })
    if (new Set(active.map(m => m.userId)).size !== active.length) throw new Error('Membership Operator hiệu lực bị trùng; cần đối chiếu server.')
    return active.map(m => ({id:m.userId,name:m.displayName || m.userId,roleLabel:'Operator được phân công dự án',phone:'',license:'',device:''}))
  },
  async records(projectId: string, kind: SurveyRecord['recordKind'], signal?: AbortSignal): Promise<SurveyRecord[]> {
    const rows = await this.page<SurveyRecord>(`/projects/${projectId}/${kind === 'PLAN' ? 'survey-plans' : 'survey-tasks'}`, signal)
    if (rows.some(r => !r.id || r.projectId !== projectId || !r.status || !r.version || kind === 'PLAN' && !Number.isFinite(Date.parse(r.plannedAt || '')) || kind === 'TASK' && !r.operatorId) || new Set(rows.map(r => r.id)).size !== rows.length) throw new Error('Danh sách khảo sát sai ID/project/status/version.')
    return rows.map(r => ({...r,recordKind:kind}))
  },
  async detail(projectId: string, id: string, kind: SurveyRecord['recordKind']): Promise<SurveyRecord> {
    const current = session(), {data,headers} = await apiClient.get(`/survey-${kind === 'PLAN' ? 'plans' : 'tasks'}/${id}`)
    current()
    if (data?.id !== id || data.projectId !== projectId || !data.status || !data.version || headers.etag !== `"${data.version}"`) throw new Error('Chi tiết khảo sát sai reference/version/ETag.')
    validateScope(data.scope)
    if (kind === 'PLAN' && !Number.isFinite(Date.parse(data.plannedAt || ''))) throw new Error('Plan thiếu plannedAt server.')
    if (kind === 'TASK' && !data.operatorId) throw new Error('Task thiếu Operator ID server.')
    return {...data,recordKind:kind}
  },
  async describe(record: SurveyRecord, cache?: Map<string, Promise<any>>): Promise<SurveyPresentation> {
    const current=session(), scopes: SurveyPresentation['scopes']=[]
    // Gom đọc trùng giữa các bản ghi cùng dự án/phạm vi trong một lượt missions() (cache theo lượt, không lưu lâu dài).
    const memo=<T,>(key:string,read:()=>Promise<T>):Promise<T>=>{if(!cache)return read();let p=cache.get(key);if(!p){p=read();cache.set(key,p)}return p as Promise<T>}
    validateScope(record.scope!)
    const context=await memo(`ctx:${record.projectId}`,()=>alignmentService.readProjectContext(record.projectId));current()
    if(context.projectId!==record.projectId)throw new Error('Không đọc được tên tuyến đúng dự án.')
    for(const scope of record.scope!){
      // Explicit historical pins are read as saved, never replaced by today's publication.
      const {data:p}=await memo(`gp:${record.projectId}:${scope.routeVersionId}:${scope.segmentSetId}`,()=>apiClient.get(`/projects/${record.projectId}/geometry-package`,{params:{routeVersionId:scope.routeVersionId,segmentSetId:scope.segmentSetId}}));current()
      if(p?.projectId!==record.projectId||p.route?.projectId!==record.projectId||p.route.routeVersionId!==scope.routeVersionId||p.segmentSet?.id!==scope.segmentSetId||p.segmentSet.routeVersionId!==scope.routeVersionId||!['PUBLISHED','SUPERSEDED'].includes(p.segmentSet.status)||p.route.metadataStatus!=='COMPLETE'||p.segmentSet.metadataStatus!=='COMPLETE'||!Array.isArray(p.segmentSet.segments))throw new Error('Không đọc được phạm vi tuyến/phân đoạn đúng bản ghi khảo sát.')
      const road=context.roadSections.find(r=>r.roadSectionId===p.route.roadSectionId)
      if(!road)throw new Error('Tuyến tham chiếu không thuộc dự án đang đọc.')
      const selected=scope.segmentIds.map(id=>{const matches=p.segmentSet.segments.filter((s:{id:string})=>s.id===id);if(matches.length!==1)throw new Error('Phân đoạn tham chiếu bị thiếu hoặc trùng trong bộ đã lưu.');return matches[0] as {sequence:number;startStationMeters:number;endStationMeters:number}}).sort((a,b)=>a.sequence-b.sequence)
      if(selected.some(s=>!Number.isFinite(s.startStationMeters)||!Number.isFinite(s.endStationMeters)||s.endStationMeters<=s.startStationMeters))throw new Error('Phân đoạn chưa có lý trình hợp lệ từ máy chủ.')
      const ranges:{start:number;end:number}[]=[]
      for(const s of selected){const last=ranges.at(-1);if(last&&last.end===s.startStationMeters)last.end=s.endStationMeters;else ranges.push({start:s.startStationMeters,end:s.endStationMeters})}
      const km=(meters:number)=>(meters/1000).toLocaleString('vi-VN',{minimumFractionDigits:5,maximumFractionDigits:5})
      scopes.push({routeName:road.name?`${road.code} — ${road.name}`:road.code,band:{SURFACE:'Mặt đường',LEFT_EDGE:'Mép trái',RIGHT_EDGE:'Mép phải'}[scope.targetBand],ranges:ranges.map(r=>`Km ${km(r.start)} → Km ${km(r.end)}`).join('; '),historical:p.segmentSet.status==='SUPERSEDED'||p.route.isCurrent===false})
    }
    let operatorName: string | undefined
    if(record.recordKind==='TASK'){
      const members=await memo(`members:${record.projectId}`,()=>this.page<{userId:string;role:string;displayName?:string}>(`/projects/${record.projectId}/members`));current()
      const names=[...new Set(members.filter(m=>m.userId===record.operatorId&&m.role==='OPERATOR'&&m.displayName?.trim()).map(m=>m.displayName!.trim()))]
      if(names.length>1)throw new Error('Tên Operator không nhất quán trong membership dự án.')
      operatorName=names[0]||'Chưa tải được thông tin người được giao'
    }
    return {scopes,operatorName}
  },
  async missions(projects: SurveyProject[], signal?: AbortSignal): Promise<SurveyMissionItem[]> {
    const current=session(), describeCache=new Map<string, Promise<any>>()
    const rows: SurveyMissionItem[] = []
    for (const project of projects) {
      const [plans,tasks] = await Promise.all([this.records(project.projectId,'PLAN',signal),this.records(project.projectId,'TASK',signal)])
      // No planId or surveyType read contract at 4b46a6a. Keep independent records and unknown metadata.
      const built: SurveyMissionItem[] = []
      // BE bản mới: list đã có summary (operatorDisplayName, scopeSummary[], datasetCount, plannedEndAt) → KHÔNG gọi detail từng bản ghi (hết N+1).
      // Phạm vi chi tiết (tên tuyến, lý trình) chỉ đọc khi mở chi tiết (describe trong SurveyRecordDetailModal).
      const BAND: Record<string, string> = { SURFACE: 'Mặt đường', LEFT_EDGE: 'Mép trái', RIGHT_EDGE: 'Mép phải' }
      for (const record of [...plans, ...tasks] as any[]) {
        current(); if (signal?.aborted) throw new Error('Đã hủy đọc khảo sát.')
        const summary: Array<{ targetBand: string; segmentCount: number }> = Array.isArray(record.scopeSummary) ? record.scopeSummary : []
        const scopeText = record.scopeAvailability === 'MISSING' || !summary.length ? 'Chưa lưu phạm vi trong bản ghi' : summary.map(x => `${BAND[x.targetBand] || x.targetBand} · ${x.segmentCount} phân đoạn`).join(' / ')
        built.push({ id: record.id, code: record.id, title: record.recordKind === 'PLAN' ? 'Kế hoạch khảo sát' : 'Nhiệm vụ khảo sát', serverRecordKind: record.recordKind,
          survey_type: null, survey_type_label: 'API chưa trả loại khảo sát', project_id: project.projectId, project_name: `${project.projectCode} · ${project.name}`,
          start_km: '', end_km: '', flight_date: record.plannedAt ? surveyPlannedAtLabel(record.plannedAt) : '', pilot_name: record.recordKind === 'TASK' ? (record.operatorDisplayName || 'Chưa có tên người được giao') : '', drone_model: '', scope_summary: scopeText, read_error: '',
          total_photos: Number.NaN, gsd_resolution: '', ai_defects_count: Number.NaN, ai_pending_count: Number.NaN, coverage_percent: Number.NaN, serverStatus: record.status, status_label: surveyStatusLabel(record.status) } as SurveyMissionItem)
      }
      rows.push(...built)
    }
    return rows
  },

}
