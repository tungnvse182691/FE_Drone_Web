import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'

const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value) && !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value)

// A section ID or version reference alone is not a centerline. Check the
// actual server WKT; neither approval metadata nor a segment set is required.
function hasCenterline(value: unknown): boolean {
  if (value == null || value === '') return false
  if (typeof value !== 'string') throw new Error('Tim tuyến trong work-package trả sai contract.')
  const match = value.trim().match(/^LINESTRING(?:\s+(?:Z|M|ZM))?\s*\(([^()]+)\)$/i)
  if (!match) {
    if (/^LINESTRING\s+EMPTY$/i.test(value.trim())) return false
    throw new Error('Không kiểm tra được dữ liệu tim tuyến trong work-package; chưa coi là dự án đủ điều kiện.')
  }
  const points = match[1].split(',').map(point => point.trim().split(/\s+/).map(Number))
  if (points.length < 2 || points.some(point => point.length < 2 || point.length > 4 || point.some(n => !Number.isFinite(n)))) throw new Error('Tọa độ tim tuyến server không hợp lệ.')
  return points.some(point => point[0] !== points[0][0] || point[1] !== points[0][1])
}

export async function readEligibleTriageProjects(signal?: AbortSignal, selectedProjectId?: string) {
  const state = useAuthStore.getState(), actor = state.user?.id, epoch = state.authEpoch
  if (state.user?.role !== RoleCode.SUPERVISOR) throw new Error('Chỉ Sup được đọc dự án đích điều phối.')
  const active = () => { if (signal?.aborted || useAuthStore.getState().authEpoch !== epoch || useAuthStore.getState().user?.id !== actor || useAuthStore.getState().user?.role !== RoleCode.SUPERVISOR) throw new Error('Phiên đọc dự án điều phối đã thay đổi.') }
  const projects: Array<{id: string; code: string; name: string; status: string}> = [], seen = new Set<string>(), ids = new Set<string>()
  let cursor: string | undefined
  do {
    const {data} = await apiClient.get('/projects', {params: {limit: 100, cursor}, signal}); active()
    if (!Array.isArray(data?.items) || data.nextCursor != null && (typeof data.nextCursor !== 'string' || !data.nextCursor)) throw new Error('Không đọc được danh sách dự án theo contract.')
    for (const project of data.items) {
      if (!uuid(project.projectId) || typeof project.projectCode !== 'string' || !project.projectCode || typeof project.name !== 'string' || !project.name || !['PLANNING', 'ACTIVE', 'CLOSED'].includes(project.status) || ids.has(project.projectId)) throw new Error('Dự án thiếu hoặc sai ID/trạng thái server; chưa kiểm tra được điều kiện điều phối.')
      ids.add(project.projectId)
      projects.push({id: project.projectId, code: project.projectCode, name: project.name, status: project.status})
    }
    cursor = data.nextCursor || undefined
    if (cursor && seen.has(cursor)) throw new Error('Cursor dự án bị lặp; danh sách chưa đầy đủ.')
    if (cursor) seen.add(cursor)
  } while (cursor)
  const eligible: Array<{id: string; code: string; name: string}> = []
  for (const project of projects) {
    if (project.status !== 'ACTIVE' || selectedProjectId && project.id !== selectedProjectId) continue
    const pmResponse = await apiClient.get(`/projects/${project.id}/primary-project-manager`, {signal}); active()
    if (!pmResponse.data || !Object.prototype.hasOwnProperty.call(pmResponse.data, 'primaryProjectManager')) throw new Error('Không đọc được phân công PM chính theo contract.')
    const pm = pmResponse.data.primaryProjectManager
    // The current-primary endpoint applies effective membership/account guards;
    // null explicitly means no valid current primary PM (not a read failure).
    if (pm === null) continue
    if (!pm || !uuid(pm.membershipId) || !uuid(pm.userId) || !/^\d{4}-\d{2}-\d{2}$/.test(pm.validFrom) || !pm.membershipVersion) throw new Error('Phân công PM chính thiếu dữ liệu xác minh.')
    const {data: context} = await apiClient.get(`/projects/${project.id}/work-package`, {signal}); active()
    if (context?.projectId !== project.id || !Array.isArray(context.roadSections)) throw new Error('Work-package trả sai dự án hoặc thiếu dữ liệu tuyến.')
    if (!context.roadSections.some((section: any) => hasCenterline(section.geometryWkt))) continue
    eligible.push({id: project.id, code: project.code, name: project.name})
  }
  return eligible
}
