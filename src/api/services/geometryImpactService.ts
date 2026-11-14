import {apiClient} from '../client'
import {useAuthStore} from '../../store/authStore'
import {RoleCode} from '../../types/enums'

export interface GeometryImpactFilters {previousRouteVersionId?:string;newRouteVersionId?:string}
export interface GeometryImpactView {
  id:string;projectId:string;previousRouteVersionId:string;newRouteVersionId:string;recordedAt:string
  references?:Array<{kind?:string|null;id:string;routeVersionId:string;segmentSetId?:string|null;readiness?:string|null;missingReasonCodes?:string[]|null}>|null
}
export interface GeometryMapManifest {publicationId:string;projectId:string;routeVersionId:string;segmentSetId:string;layoutRevisionId:string;contentHash?:string|null;layers?:Array<{key?:string|null}>|null;[key:string]:unknown}
export interface GeometryMapPage {publicationId:string;contentHash?:string|null;layer?:string|null;features?:unknown[]|null;nextCursor?:string|null}
function invalidReferences(value: GeometryImpactView) { return value.references != null && (!Array.isArray(value.references) || value.references.some(r=>!r?.id || r.routeVersionId !== value.previousRouteVersionId)) }
function readScope(projectId:string){
  const actor=useAuthStore.getState()
  if(!projectId||!actor.isAuthenticated||!actor.user||![RoleCode.PROJECT_MANAGER,RoleCode.SUPERVISOR].includes(actor.user.role))throw new Error('Cần đúng dự án và phiên PM hoặc Giám sát.')
  return()=>{const now=useAuthStore.getState();if(!now.isAuthenticated||now.authEpoch!==actor.authEpoch||now.user?.id!==actor.user?.id||now.user?.role!==actor.user?.role)throw new Error('Phiên đã thay đổi; bỏ phản hồi hình học cũ.')}
}
/** Read-only C6 services. No mutation or inferred impact/publication creation. */
export const geometryImpactService={
  async list(projectId:string,filters:GeometryImpactFilters={}):Promise<GeometryImpactView[]>{
    const actor=useAuthStore.getState()
    if(!actor.isAuthenticated||!actor.user||![RoleCode.PROJECT_MANAGER,RoleCode.SUPERVISOR].includes(actor.user.role))throw new Error('Cần phiên PM hoặc Giám sát để đọc ảnh hưởng hình học.')
    if(!projectId)throw new Error('Chưa chọn dự án để đọc ảnh hưởng hình học.')
    const params:GeometryImpactFilters={}
    for(const key of ['previousRouteVersionId','newRouteVersionId'] as const)if(filters[key]!==undefined){if(!filters[key])throw new Error('Bộ lọc phiên bản tuyến chưa hợp lệ.');params[key]=filters[key]}
    const {data}=await apiClient.get<GeometryImpactView[]>(`/projects/${projectId}/geometry-location-impacts`,{params})
    const now=useAuthStore.getState()
    if(!now.isAuthenticated||now.authEpoch!==actor.authEpoch||now.user?.id!==actor.user.id||now.user?.role!==actor.user.role)throw new Error('Phiên đã thay đổi; bỏ danh sách ảnh hưởng cũ.')
    if(!Array.isArray(data)||data.some(row=>!row?.id||row.projectId!==projectId||!row.previousRouteVersionId||!row.newRouteVersionId||!Number.isFinite(Date.parse(row.recordedAt))||invalidReferences(row)||params.previousRouteVersionId&&row.previousRouteVersionId!==params.previousRouteVersionId||params.newRouteVersionId&&row.newRouteVersionId!==params.newRouteVersionId)||new Set(data.map(row=>row.id)).size!==data.length)throw new Error('Danh sách ảnh hưởng trả sai contract/dự án/bộ lọc.')
    return data
  },
  async readImpact(projectId:string,impactId:string):Promise<GeometryImpactView>{
    const current=readScope(projectId)
    if(!impactId)throw new Error('Chưa có impactId từ danh sách server.')
    const {data}=await apiClient.get<GeometryImpactView>(`/projects/${projectId}/geometry-location-impacts/${impactId}`)
    current()
    if(data?.id!==impactId||data.projectId!==projectId||!data.previousRouteVersionId||!data.newRouteVersionId||!Number.isFinite(Date.parse(data.recordedAt))||invalidReferences(data))throw new Error('Chi tiết impact sai project hoặc contract.')
    return data
  },
  async readPublication(projectId:string,publicationId:string):Promise<GeometryMapManifest>{
    const current=readScope(projectId)
    if(!publicationId)throw new Error('Chưa có publicationId từ manifest server.')
    const {data}=await apiClient.get<GeometryMapManifest>(`/projects/${projectId}/geometry-map-publications/${publicationId}`)
    current()
    if(data?.publicationId!==publicationId||data.projectId!==projectId||!data.routeVersionId||!data.segmentSetId||!data.layoutRevisionId)throw new Error('Manifest publication sai project/reference.')
    if(data.contentHash!=null&&!/^[a-f0-9]{64}$/i.test(data.contentHash))throw new Error('Manifest content hash sai contract.')
    return data
  },
  async readLayer(projectId:string,publicationId:string,layer:string,options:{expectedContentHash?:string;routeVersionId?:string;segmentSetId?:string;cursor?:string;limit?:number;bbox?:string}={}):Promise<GeometryMapPage>{
    const current=readScope(projectId)
    if(!publicationId||!layer.trim())throw new Error('Cần publicationId và tên layer từ manifest server.')
    const manifest=await this.readPublication(projectId,publicationId);current()
    if(!manifest.layers?.some(row=>row.key===layer)||!manifest.contentHash||!/^([a-f0-9]{64})$/i.test(manifest.contentHash))throw new Error('Manifest chưa có layer hoặc content hash hợp lệ.')
    if(options.routeVersionId&&options.routeVersionId!==manifest.routeVersionId||options.segmentSetId&&options.segmentSetId!==manifest.segmentSetId||options.expectedContentHash&&options.expectedContentHash.toLowerCase()!==manifest.contentHash.toLowerCase())throw new Error('Phạm vi hoặc hash đã chọn không khớp manifest; hãy đọc lại.')
    const params:Record<string,string|number>={};for(const k of ['expectedContentHash','routeVersionId','segmentSetId','cursor','bbox'] as const)if(options[k])params[k]=options[k]!
    if(options.limit!=null)params.limit=options.limit
    if(options.expectedContentHash&&!/^[a-f0-9]{64}$/i.test(options.expectedContentHash))throw new Error('expectedContentHash sai định dạng.')
    params.expectedContentHash=manifest.contentHash;params.routeVersionId=manifest.routeVersionId;params.segmentSetId=manifest.segmentSetId
    const {data}=await apiClient.get<GeometryMapPage>(`/projects/${projectId}/geometry-map-publications/${publicationId}/layers/${encodeURIComponent(layer)}`,{params})
    current()
    if(data?.publicationId!==publicationId||data.layer!==layer||typeof data.contentHash!=='string'||data.contentHash.toLowerCase()!==manifest.contentHash.toLowerCase()||!Array.isArray(data.features)||!(data.nextCursor===null||typeof data.nextCursor==='string'))throw new Error('Layer trả sai publication/hash/layer/phân trang.')
    return data
  }
}
