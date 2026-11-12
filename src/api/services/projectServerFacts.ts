import { displayMeters } from '../../utils/projectDistanceDisplay'
import { apiClient } from '../client'
import { useAuthStore } from '../../store/authStore'
import { geometrySubmissionService, type GeometrySubmission } from './geometrySubmissionService'
import { validWarrantyDates } from '../../utils/projectWarranty'

export interface ProjectRouteFact {
  roadSectionId: string; routeVersionId: string; code: string; name: string
  lengthMeters: number; stationOriginMeters?: number | null; routeKind?: string | null
  approved: boolean; wgs84: [number, number][]
}
export interface ProjectServerFacts {
  projectId: string; description: string; descriptionError?: string; routes: ProjectRouteFact[]; geometryError: string
  geometryState: 'NONE' | 'PRESENT' | 'CONFIRMED' | 'ERROR'; geometryLabel: string
  submission: GeometrySubmission | null; submissionError: string
  lengthKm?: number; mainlineLengthKm?: number; branchesLengthKm?: number; branchesCount?: number
  stationing: string; primary: {userId: string; displayName?: string | null} | null; primaryError: string
  warrantyError: string; warrantyMessage: string; handoverDate?: string; warrantyStartDate?: string; warrantyEndDate?: string
  warrantyPercent: number; daysRemaining: number
}
const line = (shape: any): shape is {type: string; coordinates: [number, number][]} => shape?.type === 'LineString' && Array.isArray(shape.coordinates) && shape.coordinates.length >= 2 && shape.coordinates.every((point: any) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite))
const errorText = (error: any) => `HTTP ${error?.response?.status || ''} ${error?.response?.data?.code || error?.message || 'Không đọc được dữ liệu'}`.trim()
const packageReads = new Map<string, Promise<any>>()
export function readProjectWorkPackage(projectId: string): Promise<any> {
  const state = useAuthStore.getState(), epoch = state.authEpoch, actor = state.user?.id, key = `${epoch}:${actor}:${projectId}`
  const held = packageReads.get(key)
  if (held) return held
  const request = apiClient.get(`/projects/${projectId}/work-package`).then(response => {
    if (epoch !== useAuthStore.getState().authEpoch || actor !== useAuthStore.getState().user?.id) throw new Error('Phiên đọc hồ sơ dự án đã thay đổi.')
    return response.data
  }).finally(() => { if (packageReads.get(key) === request) packageReads.delete(key) })
  packageReads.set(key, request)
  return request
}

export async function readProjectServerFacts(projectId: string): Promise<ProjectServerFacts> {
  const epoch = useAuthStore.getState().authEpoch, actor = useAuthStore.getState().user?.id
  const active = () => { if (epoch !== useAuthStore.getState().authEpoch || actor !== useAuthStore.getState().user?.id) throw new Error('Phiên đọc hồ sơ dự án đã thay đổi.') }
  const facts: ProjectServerFacts = {projectId, description: '', routes: [], geometryError: '', geometryState: 'NONE', geometryLabel: 'Chưa có tim tuyến hiện hành', submission: null, submissionError: '', stationing: 'Chưa có tim tuyến hiện hành', primary: null, primaryError: '', warrantyError: '', warrantyMessage: '', warrantyPercent: Number.NaN, daysRemaining: Number.NaN}
  const [packageResult, primaryResult, submissionResult] = await Promise.allSettled([
    readProjectWorkPackage(projectId).then(data => ({data})),
    apiClient.get(`/projects/${projectId}/primary-project-manager`),
    geometrySubmissionService.read(projectId)
  ]); active()
  if (primaryResult.status === 'rejected') facts.primaryError = errorText(primaryResult.reason)
  else if (!primaryResult.value.data || !Object.prototype.hasOwnProperty.call(primaryResult.value.data, 'primaryProjectManager')) facts.primaryError = 'Phân công PM chính trả sai contract.'
  else {
    const primary = primaryResult.value.data.primaryProjectManager
    if (primary !== null && (!primary?.userId || !primary.membershipId)) facts.primaryError = 'Phân công PM chính thiếu reference.'
    else facts.primary = primary
  }
  if (submissionResult.status === 'rejected') facts.submissionError = errorText(submissionResult.reason)
  else facts.submission = submissionResult.value
  if (packageResult.status === 'rejected') {
    facts.geometryError = facts.warrantyError = errorText(packageResult.reason)
    facts.descriptionError = 'Chưa tải được địa bàn dự án.'
    facts.geometryState = 'ERROR'; facts.geometryLabel = facts.stationing = 'Không tải được dữ liệu tim tuyến'
    return facts
  }
  const context = packageResult.value.data
  if (context?.projectId !== projectId) throw new Error('Work-package trả sai projectId.')
  facts.description = typeof context.description === 'string' ? context.description : ''
  if (!Object.prototype.hasOwnProperty.call(context, 'description') || context.description !== null && typeof context.description !== 'string') facts.descriptionError = 'Chưa tải được địa bàn dự án theo contract.'
  if (!Array.isArray(context.roadSections)) {
    facts.geometryError = 'Work-package thiếu roadSections.'; facts.geometryState = 'ERROR'; facts.geometryLabel = facts.stationing = 'Không tải được dữ liệu tim tuyến'
    facts.warrantyError = 'Chưa kiểm tra được hồ sơ bảo hành trong work-package.'
    return facts
  }
  const refs = context.roadSections.filter((s: any) => s.currentVersionId).map((s: any) => ({section: s.roadSectionId, version: s.currentVersionId, code: s.code, name: s.name}))
  const errors: string[] = [], seen = new Set<string>()
  for (const ref of refs) {
    try {
      if (!ref.section || !ref.version || seen.has(ref.section)) throw new Error('Reference tuyến hiện hành thiếu hoặc trùng.')
      seen.add(ref.section)
      const {data: route} = await apiClient.get(`/projects/${projectId}/road-sections/${ref.section}/versions/${ref.version}/geometry`); active()
      if (route?.projectId !== projectId || route.roadSectionId !== ref.section || route.routeVersionId !== ref.version || !Number.isFinite(route.lengthMeters) || route.lengthMeters <= 0 || !line(route.metricCenterline) && !line(route.wgs84Centerline)) throw new Error('Geometry trả sai scope/chiều dài/tọa độ.')
      if (route.isCurrent !== true) throw new Error('Dữ liệu không nhất quán: reference hiện hành trỏ đến geometry không hiện hành.')
      const wgs84 = line(route.wgs84Centerline) && route.wgs84Centerline.coordinates.every((p: number[]) => Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90) ? route.wgs84Centerline.coordinates : []
      facts.routes.push({roadSectionId: ref.section, routeVersionId: ref.version, code: ref.code || '', name: ref.name || '', lengthMeters: route.lengthMeters, stationOriginMeters: route.stationOriginMeters, routeKind: route.routeKind, approved: !!route.approvedBy && Number.isFinite(Date.parse(route.approvedAt)), wgs84})
    } catch (error) { active(); errors.push(errorText(error)) }
  }
  facts.geometryError = errors.join('; ')
  if (errors.length) { facts.geometryState = 'ERROR'; facts.geometryLabel = facts.stationing = errors.some(error => error.includes('không nhất quán')) ? 'Dữ liệu tuyến hiện hành không nhất quán' : 'Không tải đầy đủ dữ liệu tim tuyến' }
  else if (facts.routes.length) {
    facts.lengthKm = facts.routes.reduce((sum, route) => sum + route.lengthMeters, 0) / 1000
    facts.geometryState = facts.routes.every(route => route.approved) ? 'CONFIRMED' : 'PRESENT'
    facts.geometryLabel = facts.geometryState === 'CONFIRMED' ? 'Tim tuyến đã xác nhận' : 'Có tim tuyến — chưa đủ xác nhận'
    const only = facts.routes.length === 1 ? facts.routes[0] : null
    facts.stationing = only && Number.isFinite(only.stationOriginMeters) ? `${displayMeters(only.stationOriginMeters!)} → ${displayMeters(only.stationOriginMeters! + only.lengthMeters)}` : `${facts.routes.length} tuyến có dữ liệu server; chưa đủ lý trình chung`
    if (facts.routes.every(route => route.routeKind === 'MAIN' || route.routeKind === 'BRANCH')) {
      facts.mainlineLengthKm = facts.routes.filter(r => r.routeKind === 'MAIN').reduce((s, r) => s + r.lengthMeters, 0) / 1000
      facts.branchesLengthKm = facts.routes.filter(r => r.routeKind === 'BRANCH').reduce((s, r) => s + r.lengthMeters, 0) / 1000
      facts.branchesCount = facts.routes.filter(r => r.routeKind === 'BRANCH').length
    }
  }
  if (!refs.length && facts.submissionError) {
    facts.geometryState = 'ERROR'; facts.geometryLabel = facts.stationing = 'Không đọc được hồ sơ tuyến'
  }
  if (!Array.isArray(context.warranties)) facts.warrantyError = 'Work-package thiếu danh sách hồ sơ bảo hành.'
  else {
    const warranties = context.warranties.filter((w: any) => w.scope === 'PROJECT' && w.roadSectionId === null)
    if (warranties.length > 1) facts.warrantyMessage = 'Nhiều hồ sơ bảo hành cấp dự án; chưa có quy tắc chọn bản hiển thị.'
    else if (!warranties.length) facts.warrantyMessage = context.warranties.length ? 'Chưa có hồ sơ bảo hành cấp dự án; không gộp thời hạn các tuyến.' : 'Chưa có hồ sơ bảo hành'
    else {
      const warranty = warranties[0]
      if (!warranty.warrantyId || !validWarrantyDates(warranty.warrantyStartDate, warranty.warrantyEndDate) || !validWarrantyDates(warranty.handoverDate, warranty.warrantyEndDate)) facts.warrantyError = 'Hồ sơ bảo hành thiếu ID hoặc thời hạn hợp lệ.'
      else {
        facts.handoverDate = warranty.handoverDate; facts.warrantyStartDate = warranty.warrantyStartDate; facts.warrantyEndDate = warranty.warrantyEndDate
        const start = Date.parse(warranty.warrantyStartDate), end = Date.parse(warranty.warrantyEndDate), now = Date.now()
        facts.daysRemaining = Math.max(0, Math.ceil((end - now) / 86400000))
        facts.warrantyPercent = end === start ? now >= end ? 100 : 0 : Math.max(0, Math.min(100, Math.round((now - start) / (end - start) * 100)))
      }
    }
  }
  active(); return facts
}
