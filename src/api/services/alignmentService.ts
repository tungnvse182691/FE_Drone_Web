import { useAuthStore } from '../../store/authStore'
import { apiClient } from '../client'
import { projectService } from './projectService'

// ============================================================================
// 1. Types & DTOs theo chuẩn OpenAPI v1 (docs/contracts/openapi.json)
// ============================================================================

export interface GeometryPoint {
  x: number
  y: number
}

export interface WidthProfileItem {
  fromOffsetMeters: number
  toOffsetMeters: number
  widthMeters: number
}

export interface CrsProfileInput {
  code?: string | null
  sourceSrid: number
  datum?: string | null
  projection?: string | null
  axisOrder?: 'EN' | 'NE' | null
  metresPerUnit: number
  sourceReference?: string | null
  sourceChecksum?: string | null
  sourcedToleranceMeters?: number | null
  toleranceSource?: string | null
  sampleOnly?: boolean
  operation?: { method?:string|null; convention?:string|null; direction?:string|null; parameters?:number[]|null; sourceReference?:string|null; areaOfUse?:string|null; publishedAccuracyMeters?:number|null; accuracySource?:string|null }
  independentControls?: { native:GeometryPoint; wgs84:GeometryPoint; independentSource?:string|null }[]|null
  ellipsoid?: { semiMajorAxisMeters:number; inverseFlattening:number; sourceReference?:string|null }
  projectionDefinition?: { parameters?:Record<string,number>|null; sourceReference?:string|null }
}

export interface CrsProfileView {
  id: string
  projectId: string
  code?: string | null
  revision: number
  status?: string | null
  definition?: CrsProfileInput
  createdBy: string
  createdAt: string
}
export interface RouteSystemView { id:string; projectId:string; code?:string|null; name?:string|null }
// Native metadata is preserved separately; COORDINATES callers never synthesize it.
export interface NativeAlignmentInput {
  crsProfileRevisionId:string; spatialSrid:number
  primitives?:Array<{kind?:'LINE'|'ARC'|null;start:GeometryPoint;end:GeometryPoint;center?:GeometryPoint;radius?:number|null;startAngleRadians?:number|null;sweepRadians?:number|null}>|null
}
export interface ChainageCalibrationInput {
  sourceReference?:string|null;sourceChecksum?:string|null;selectedReason?:string|null
  controls?:Array<{geometricOffsetMeters:number;stationMeters:number}>|null
}
export interface NativeDraftMetadata {
  nativeAlignment?:NativeAlignmentInput|null;routeSystemId?:string|null;routeKind?:'MAIN'|'BRANCH'|null
  parentRouteVersionId?:string|null;junctionOffsetMeters?:number|null;declaredLengthMeters?:number|null
  chainageCalibration?:ChainageCalibrationInput|null;tessellationToleranceMeters?:number|null
}

export interface GeometryDraftInput extends NativeDraftMetadata {
  sourceKind: 'COORDINATES' | 'NATIVE_ALIGNMENT'
  sourceCrs: number
  stationOriginMeters: number
  coordinates?: GeometryPoint[]
  widthProfile: WidthProfileItem[]
  surveyWidthMeters: number
  changeReason?: string | null
  roadCode?: string | null
  roadName?: string | null
}

export interface GeometryDraftView extends NativeDraftMetadata {
  id: string
  projectId: string
  roadSectionId?: string | null
  roadCode?: string | null
  roadName?: string | null
  status?: string | null
  sourceKind?: string | null
  sourceCrs: number
  stationOriginMeters: number
  widthProfile?: WidthProfileItem[] | null
  surveyWidthMeters: number
  originalCoordinates?: GeometryPoint[] | null
  editedCoordinates?: GeometryPoint[] | null
  createdBy: string
  updatedBy: string
  version?: string | null
}

export interface GeometryPreview {
  sourceCrs: number
  engineeringSrid: number
  lengthMeters: number
  metricCenterline?: {
    type?: string
    coordinates?: [number, number][]
  }
  wgs84Centerline?: {
    type?: string
    coordinates?: [number, number][]
  }
  roadSurface?: any
  surveyArea?: any
  warnings?: string[] | null
}

export interface GeometryConfirmInput {
  expectedCurrentVersionId?: string | null
  effectiveFrom: string
  reason?: string | null
}

export interface RoadGeometryVersionView {
  projectId: string
  roadSectionId?: string
  routeVersionId: string
  versionNo: number
  isCurrent: boolean
  effectiveFrom: string
  sourceDraftId?: string | null
  sourceCrs?: number | null
  engineeringSrid: number
  stationOriginMeters?: number | null
  widthProfile?: WidthProfileItem[] | null
  surveyWidthMeters?: number | null
  metricCenterline?: {
    type?: string
    coordinates?: [number, number][]
  }
  wgs84Centerline?: {
    type?: string
    coordinates?: [number, number][]
  }
  lengthMeters: number
  metadataStatus?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  sampleOnly?: boolean
}

export interface SegmentGeometryView {
  segmentId: string
  segmentIndex: number
  startStationMeters: number
  endStationMeters: number
  lengthMeters: number
  widthMeters: number
  geometry?: any
  metadata?: any
}

export interface SegmentSetView {
  id: string
  routeVersionId: string
  status?: string | null
  segments?: SegmentGeometryView[] | null
  publishedBy?: string | null
  publishedAt?: string | null
}

export interface GeometryPackageView {
  schemaVersion?: string | null
  projectId: string
  route?: RoadGeometryVersionView
  segmentSet?: SegmentSetView
}


// ============================================================================
// 2. Chuyển đổi chuẩn WGS84 (Lng, Lat) <-> UTM 48N (EPSG:32648)
// ============================================================================

export function wgs84ToUtm48N(lng: number, lat: number): { x: number; y: number } {
  const a = 6378137.0
  const f = 1 / 298.257223563
  const k0 = 0.9996
  const e = Math.sqrt(f * (2 - f))
  const e2 = e * e
  const ePrime2 = e2 / (1 - e2)

  const phi = (lat * Math.PI) / 180.0
  const lambda = (lng * Math.PI) / 180.0
  const lambda0 = (105.0 * Math.PI) / 180.0 // Kinh tuyến trục UTM Zone 48N là 105 độ Đông

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi))
  const T = Math.tan(phi) * Math.tan(phi)
  const C = ePrime2 * Math.cos(phi) * Math.cos(phi)
  const A = Math.cos(phi) * (lambda - lambda0)

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi))

  const x =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ePrime2) * Math.pow(A, 5)) / 120) +
    500000.0

  const y =
    k0 *
    (M +
      N *
        Math.tan(phi) *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ePrime2) * Math.pow(A, 6)) / 720))

  return { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 }
}

export function utm48NToWgs84(x: number, y: number): [number, number] {
  const a = 6378137.0
  const f = 1 / 298.257223563
  const k0 = 0.9996
  const e = Math.sqrt(f * (2 - f))
  const e2 = e * e
  const ePrime2 = e2 / (1 - e2)

  const xOffset = x - 500000.0
  const M = y / k0

  const mu =
    M /
    (a *
      (1 -
        e2 / 4 -
        (3 * e2 * e2) / 64 -
        (5 * e2 * e2 * e2) / 256))
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu)

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1))
  const T1 = Math.tan(phi1) * Math.tan(phi1)
  const C1 = ePrime2 * Math.cos(phi1) * Math.cos(phi1)
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 1.5)
  const D = xOffset / (N1 * k0)

  const lat =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrime2) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrime2 - 3 * C1 * C1) * Math.pow(D, 6)) /
          720)

  const lng0 = (105.0 * Math.PI) / 180.0
  const lng =
    lng0 +
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrime2 + 24 * T1 * T1) * Math.pow(D, 5)) / 120) /
      Math.cos(phi1)

  return [
    Math.round(((lng * 180.0) / Math.PI) * 1e7) / 1e7,
    Math.round(((lat * 180.0) / Math.PI) * 1e7) / 1e7
  ]
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Lưu trữ in-memory cache cho draftId và ETag của các dự án đang soạn thảo
const activeDraftCache = new Map<string, { draftId: string; etag: string }>()

// ============================================================================
// 3. Alignment Service kết nối trực tiếp Backend Candidate3 Docker (Không mock)
// ============================================================================

export const alignmentService = {
  async readProjectContext(projectId: string): Promise<{
    projectId: string; engineeringUtmSrid: number | null; accessRole?:string; status?:string;
    roadSections: Array<{ roadSectionId: string; code: string; name: string; currentVersionId: string; versionNo: number }>
  }> {
    const response = await apiClient.get(`/projects/${projectId}/work-package`)
    if (response.data?.projectId !== projectId || !Array.isArray(response.data?.roadSections)) throw new Error('Phạm vi tuyến trả sai dự án hoặc contract.')
    return response.data
  },

  async readDraftReadiness(projectId: string, draftId: string): Promise<{
    ready: boolean; missingFields: string[]; errors: string[]; warnings: string[]; sampleOnly: boolean; crsStatus: string
  }> {
    const response = await apiClient.get(`/projects/${projectId}/road-geometry-drafts/${draftId}/readiness`)
    const value = response.data
    if (typeof value?.ready !== 'boolean' || !Array.isArray(value.missingFields) || !Array.isArray(value.errors)) throw new Error('Readiness trả sai contract.')
    return value
  },

  async readConfirmedGeometry(projectId: string, roadSectionId: string, routeVersionId: string): Promise<RoadGeometryVersionView> {
    const response = await apiClient.get(`/projects/${projectId}/road-sections/${roadSectionId}/versions/${routeVersionId}/geometry`)
    return response.data
  },

  /**
   * API-065: Lấy danh sách hồ sơ hệ tọa độ CRS của dự án
   */
  async fetchCrsProfiles(projectId: string): Promise<CrsProfileView[]> {
    const response = await apiClient.get<CrsProfileView[]>(`/projects/${projectId}/crs-profiles`)
    if (!Array.isArray(response.data) || response.data.some(profile => profile.projectId !== projectId)) throw new Error('Danh sách CRS trả sai contract hoặc dự án.')
    return response.data
  },
  /** API-198: Route systems are separate from work-package road sections. */
  async fetchRouteSystems(projectId:string):Promise<RouteSystemView[]> {
    const {data}=await apiClient.get<RouteSystemView[]>(`/projects/${projectId}/route-systems`)
    if(!Array.isArray(data)||data.some(item=>!item.id||item.projectId!==projectId)||new Set(data.map(item=>item.id)).size!==data.length)throw new Error('Danh sách hệ tuyến sai dự án hoặc contract.')
    return data
  },

  /** API-067: Read only the profile reference selected from API-065. */
  async readCrsProfile(projectId: string, profileId: string): Promise<CrsProfileView> {
    const {data} = await apiClient.get<CrsProfileView>(`/projects/${projectId}/crs-profiles/${profileId}`)
    if (data?.projectId !== projectId || data.id !== profileId || !Number.isInteger(data.revision)) throw new Error('Chi tiết CRS trả sai dự án, hồ sơ hoặc phiên bản.')
    return data
  },

  /**
   * Tạo hồ sơ hệ tọa độ CRS mới cho dự án
   */
  async createCrsProfile(projectId: string, input: CrsProfileInput, idempotencyKey = generateUuid()): Promise<CrsProfileView> {
    const response = await apiClient.post<CrsProfileView>(`/projects/${projectId}/crs-profiles`, input, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    })
    if (response.status !== 201) throw Object.assign(new Error('Phản hồi tạo CRS chưa đúng contract 201; không gửi lại POST.'), { received:true, receipt:response.data })
    return response.data
  },

  /**
   * Đảm bảo dự án đã có cấu hình CRS UTM Zone 48N (SRID 32648)
   */
  async ensureUtm48NCrsProfile(projectId: string): Promise<CrsProfileView> {
    throw new Error('Cần hồ sơ CRS có definition và provenance được xác minh; không tự tạo EPSG hoặc checksum mẫu.')
  },

  /**
   * API-104: Tải gói tim tuyến và phân đoạn đường chính thức đã duyệt (GeometryPackageView)
   * Trả về null nếu dự án chưa có geometry duyệt (backend trả 400 validation_error / 404).
   * Nghiêm cấm không trả về dữ liệu mock!
   */
  async fetchGeometryPackage(projectId: string): Promise<GeometryPackageView | null> {
    try {
      const response = await apiClient.get<GeometryPackageView>(`/projects/${projectId}/geometry-package`)
      return response.data
    } catch (err: any) {
      // Backend Candidate3 trả 400 validation_error hoặc 404 khi dự án mới khởi tạo chưa có tim tuyến
      if (err.response?.status === 400 || err.response?.status === 404) {
        return null
      }
      // Ném lỗi thật nếu là lỗi 401, 403, 500
      throw err
    }
  },

  /**
   * API-177: PM tạo bản nháp tim tuyến mới (POST /api/v1/projects/{projectId}/road-geometry-drafts)
   */
  async createGeometryDraft(
    projectId: string,
    input: GeometryDraftInput,
    idempotencyKey = generateUuid(),
    roadSectionId?: string
  ): Promise<{ data: GeometryDraftView; etag: string }> {
    const epoch = useAuthStore.getState().authEpoch
    const response = await apiClient.post<GeometryDraftView>(
      roadSectionId ? `/projects/${projectId}/road-sections/${roadSectionId}/geometry-drafts` : `/projects/${projectId}/road-geometry-drafts`,
      input,
      {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      }
    )
    if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ kết quả tạo bản nháp cũ.')
    const etag = response.headers['etag'] || ''
    if (response.data?.id) {
      activeDraftCache.set(projectId, { draftId: response.data.id, etag })
    }
    return { data: response.data, etag }
  },

  /**
   * API-178: Lấy thông tin bản nháp tim tuyến
   */
  async getGeometryDraft(
    projectId: string,
    draftId: string,
    roadSectionId?: string | null
  ): Promise<{ data: GeometryDraftView; etag: string }> {
    const epoch = useAuthStore.getState().authEpoch
    const response = await apiClient.get<GeometryDraftView>(
      roadSectionId ? `/projects/${projectId}/road-sections/${roadSectionId}/geometry-drafts/${draftId}` : `/projects/${projectId}/road-geometry-drafts/${draftId}`
    )
    if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ bản nháp cũ.')
    if (response.data?.projectId !== projectId || response.data?.id !== draftId) throw new Error('Bản nháp trả sai dự án hoặc ID.')
    if (roadSectionId && response.data.roadSectionId !== roadSectionId) throw new Error('Bản nháp trả sai đoạn đường đã chọn.')
    const etag = response.headers['etag'] || (response.data.version ? `"${response.data.version}"` : '')
    activeDraftCache.set(projectId, { draftId, etag })
    return { data: response.data, etag }
  },

  /**
   * API-179: PM cập nhật bản nháp tim tuyến
   */
  async updateGeometryDraft(
    projectId: string,
    draftId: string,
    input: GeometryDraftInput,
    etag: string,
    idempotencyKey = generateUuid(),
    roadSectionId?: string | null
  ): Promise<{ data: GeometryDraftView; etag: string }> {
    const epoch = useAuthStore.getState().authEpoch
    const response = await apiClient.put<GeometryDraftView>(
      roadSectionId ? `/projects/${projectId}/road-sections/${roadSectionId}/geometry-drafts/${draftId}` : `/projects/${projectId}/road-geometry-drafts/${draftId}`,
      input,
      {
        headers: {
          'If-Match': etag,
          'Idempotency-Key': idempotencyKey
        }
      }
    )
    if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ kết quả sửa bản nháp cũ.')
    if (roadSectionId && response.data?.roadSectionId !== roadSectionId) throw new Error('Receipt sửa bản nháp trả sai đoạn đường.')
    const newEtag = response.headers['etag'] || etag
    activeDraftCache.set(projectId, { draftId, etag: newEtag })
    return { data: response.data, etag: newEtag }
  },

  /**
   * API-181: Xem trước tim tuyến bản thảo (Preview)
   */
  async previewGeometryDraft(projectId: string, draftId: string, etag?: string, roadSectionId?: string | null): Promise<GeometryPreview> {
    const response = await apiClient.post<GeometryPreview>(
      roadSectionId ? `/projects/${projectId}/road-sections/${roadSectionId}/geometry-drafts/${draftId}/preview` : `/projects/${projectId}/road-geometry-drafts/${draftId}/preview`,
      undefined,
      etag ? { headers: { 'If-Match': etag } } : undefined
    )
    return response.data
  },

  /**
   * API-180: Supervisor phê duyệt khóa tim tuyến chính thức (Confirm)
   * Yêu cầu role SUPERVISOR, If-Match và Idempotency-Key.
   */
  async confirmGeometryDraft(
    projectId: string,
    draftId: string,
    input: GeometryConfirmInput,
    etag: string,
    idempotencyKey = generateUuid(),
    roadSectionId?: string | null
  ): Promise<RoadGeometryVersionView> {
    const epoch = useAuthStore.getState().authEpoch
    const response = await apiClient.post<RoadGeometryVersionView>(
      roadSectionId ? `/projects/${projectId}/road-sections/${roadSectionId}/geometry-drafts/${draftId}/confirm` : `/projects/${projectId}/road-geometry-drafts/${draftId}/confirm`,
      input,
      {
        headers: {
          'If-Match': etag,
          'Idempotency-Key': idempotencyKey
        }
      }
    )
    if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ kết quả xác nhận cũ.')
    if (roadSectionId && response.data?.roadSectionId !== roadSectionId) throw new Error('Receipt xác nhận trả sai đoạn đường.')
    activeDraftCache.delete(projectId)
    return response.data
  }
}


useAuthStore.subscribe((state, previous) => {
  if (state.authEpoch !== previous.authEpoch) activeDraftCache.clear()
})
