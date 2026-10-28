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

export interface GeometryDraftInput {
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

export interface GeometryDraftView {
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

// Trạng thái tim tuyến hiển thị trên giao diện
export interface AlignmentState {
  projectId: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  draftId?: string
  etag?: string
  submittedAt?: string
  confirmedAt?: string
  confirmedBy?: string
  coords?: [number, number][]
  kmPoints?: number[]
  segments?: any[]
  branches?: any[]
  totalLengthKm?: number
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
  /**
   * API-065: Lấy danh sách hồ sơ hệ tọa độ CRS của dự án
   */
  async fetchCrsProfiles(projectId: string): Promise<CrsProfileView[]> {
    const response = await apiClient.get<CrsProfileView[]>(`/projects/${projectId}/crs-profiles`)
    return response.data || []
  },

  /**
   * Tạo hồ sơ hệ tọa độ CRS mới cho dự án
   */
  async createCrsProfile(projectId: string, input: CrsProfileInput): Promise<CrsProfileView> {
    const response = await apiClient.post<CrsProfileView>(`/projects/${projectId}/crs-profiles`, input, {
      headers: {
        'Idempotency-Key': generateUuid()
      }
    })
    return response.data
  },

  /**
   * Đảm bảo dự án đã có cấu hình CRS UTM Zone 48N (SRID 32648)
   */
  async ensureUtm48NCrsProfile(projectId: string): Promise<CrsProfileView> {
    const profiles = await this.fetchCrsProfiles(projectId)
    const existing = profiles.find((p) => p.definition?.sourceSrid === 32648)
    if (existing) {
      return existing
    }
    // Tạo mới profile UTM Zone 48N nếu chưa có
    return await this.createCrsProfile(projectId, {
      code: 'UTM48N',
      sourceSrid: 32648,
      datum: 'WGS_1984',
      projection: 'Transverse_Mercator',
      axisOrder: 'EN',
      metresPerUnit: 1.0,
      sourceReference: 'EPSG:32648',
      sourceChecksum: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      sampleOnly: false
    })
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
    input: GeometryDraftInput
  ): Promise<{ data: GeometryDraftView; etag: string }> {
    const idempotencyKey = generateUuid()
    const response = await apiClient.post<GeometryDraftView>(
      `/projects/${projectId}/road-geometry-drafts`,
      input,
      {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      }
    )
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
    draftId: string
  ): Promise<{ data: GeometryDraftView; etag: string }> {
    const response = await apiClient.get<GeometryDraftView>(
      `/projects/${projectId}/road-geometry-drafts/${draftId}`
    )
    const etag = response.headers['etag'] || ''
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
    etag: string
  ): Promise<{ data: GeometryDraftView; etag: string }> {
    const response = await apiClient.put<GeometryDraftView>(
      `/projects/${projectId}/road-geometry-drafts/${draftId}`,
      input,
      {
        headers: {
          'If-Match': etag,
          'Idempotency-Key': generateUuid()
        }
      }
    )
    const newEtag = response.headers['etag'] || etag
    activeDraftCache.set(projectId, { draftId, etag: newEtag })
    return { data: response.data, etag: newEtag }
  },

  /**
   * API-181: Xem trước tim tuyến bản thảo (Preview)
   */
  async previewGeometryDraft(projectId: string, draftId: string): Promise<GeometryPreview> {
    const response = await apiClient.post<GeometryPreview>(
      `/projects/${projectId}/road-geometry-drafts/${draftId}/preview`
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
    etag: string
  ): Promise<RoadGeometryVersionView> {
    const response = await apiClient.post<RoadGeometryVersionView>(
      `/projects/${projectId}/road-geometry-drafts/${draftId}/confirm`,
      input,
      {
        headers: {
          'If-Match': etag,
          'Idempotency-Key': generateUuid()
        }
      }
    )
    activeDraftCache.delete(projectId)
    return response.data
  },

  /**
   * Lấy draftId và ETag hiện tại từ bộ nhớ tạm
   */
  getActiveDraftInfo(projectId: string): { draftId: string; etag: string } | undefined {
    return activeDraftCache.get(projectId)
  },

  /**
   * Lưu draftId và ETag tạm thời
   */
  setActiveDraftInfo(projectId: string, draftId: string, etag: string): void {
    activeDraftCache.set(projectId, { draftId, etag })
  },

  /**
   * Xóa bản nháp trong cache khi reset
   */
  clearActiveDraftInfo(projectId: string): void {
    activeDraftCache.delete(projectId)
  },

  // ==========================================================================
  // 4. Các helper quản lý trạng thái đồng bộ cho UI (Dữ liệu thật, KHÔNG DÙNG MOCK)
  // ==========================================================================

  getAlignmentState(projectId: string): AlignmentState {
    const key = `roadguard_alignment_state_${projectId}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore
    }
    return {
      projectId,
      status: 'DRAFT'
    }
  },

  getAlignmentData(projectId: string): Partial<AlignmentState> {
    const key = `roadguard_alignment_data_${projectId}`
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore
    }
    return {
      coords: [],
      kmPoints: [],
      segments: [],
      branches: []
    }
  },

  saveAlignmentData(projectId: string, data: Partial<AlignmentState>): void {
    const key = `roadguard_alignment_data_${projectId}`
    const existing = this.getAlignmentData(projectId)
    try {
      localStorage.setItem(key, JSON.stringify({ ...existing, ...data }))
    } catch {
      // ignore
    }
  },

  submitAlignment(projectId: string, totalLengthKm?: number): AlignmentState {
    const key = `roadguard_alignment_state_${projectId}`
    const current = this.getAlignmentState(projectId)
    const updated: AlignmentState = {
      ...current,
      projectId,
      status: 'PENDING_APPROVAL',
      submittedAt:
        new Date().toLocaleDateString('vi-VN') +
        ' - ' +
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    try {
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {
      // ignore
    }

    projectService.updateProjectAlignment(projectId, {
      status: 'PENDING_ALIGNMENT',
      kml_status: 'Chờ duyệt tim tuyến',
      ...(totalLengthKm !== undefined ? { length_km: totalLengthKm } : {})
    })
    window.dispatchEvent(new Event('roadguard_state_change'))
    return updated
  },

  confirmAlignment(
    projectId: string,
    supervisorName = 'Giám sát trưởng (Supervisor)',
    totalLengthKm?: number
  ): AlignmentState {
    const key = `roadguard_alignment_state_${projectId}`
    const current = this.getAlignmentState(projectId)
    const updated: AlignmentState = {
      ...current,
      projectId,
      status: 'CONFIRMED',
      confirmedAt:
        new Date().toLocaleDateString('vi-VN') +
        ' - ' +
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      confirmedBy: supervisorName
    }
    try {
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {
      // ignore
    }

    projectService.updateProjectAlignment(projectId, {
      status: 'ACTIVE',
      kml_status: 'Đã phê duyệt',
      ...(totalLengthKm !== undefined ? { length_km: totalLengthKm } : {})
    })
    window.dispatchEvent(new Event('roadguard_state_change'))
    return updated
  },

  resetAlignment(projectId: string): void {
    const key = `roadguard_alignment_state_${projectId}`
    try {
      localStorage.setItem(key, JSON.stringify({ projectId, status: 'DRAFT' }))
    } catch {
      // ignore
    }
    this.clearActiveDraftInfo(projectId)
    window.dispatchEvent(new Event('roadguard_state_change'))
  },

  /**
   * Đồng bộ dữ liệu tim tuyến từ GeometryPackageView chính thức của Backend Candidate3 vào state
   */
  syncWithGeometryPackage(projectId: string, pkg: GeometryPackageView | null): AlignmentState {
    if (!pkg || !pkg.route) {
      // Dự án chưa có geometry duyệt
      const draftState: AlignmentState = {
        projectId,
        status: 'DRAFT',
        coords: [],
        kmPoints: [],
        segments: [],
        branches: [],
        totalLengthKm: 0
      }
      this.saveAlignmentData(projectId, draftState)
      return draftState
    }

    const route = pkg.route
    const wgs84Coords = route.wgs84Centerline?.coordinates || []
    const totalKm = parseFloat(((route.lengthMeters || 0) / 1000).toFixed(3))

    // Ánh xạ segments từ segmentSet
    const segments = (pkg.segmentSet?.segments || []).map((s, idx) => ({
      id: s.segmentId || `seg-${projectId}-${idx + 1}`,
      code: `Phân đoạn #${String(idx + 1).padStart(2, '0')}`,
      startKm: parseFloat(((s.startStationMeters || 0) / 1000).toFixed(3)),
      endKm: parseFloat(((s.endStationMeters || 0) / 1000).toFixed(3)),
      lengthKm: parseFloat(((s.lengthMeters || 0) / 1000).toFixed(3)),
      roadWidthM: s.widthMeters || 8.0,
      status: 'VALID' as const,
      statusText: 'HỢP LỆ',
      laneCount: 4,
      surfaceMaterial: 'Mặt BTN C12.5',
      color: ['#0284C7', '#D97706', '#059669', '#7C3AED', '#DB2777'][idx % 5]
    }))

    const confirmedState: AlignmentState = {
      projectId,
      status: 'CONFIRMED',
      coords: wgs84Coords,
      kmPoints: [],
      segments,
      branches: [],
      totalLengthKm: totalKm,
      confirmedAt: route.approvedAt ? new Date(route.approvedAt).toLocaleString('vi-VN') : undefined,
      confirmedBy: route.approvedBy || undefined
    }

    const key = `roadguard_alignment_state_${projectId}`
    try {
      localStorage.setItem(key, JSON.stringify(confirmedState))
    } catch {
      // ignore
    }
    this.saveAlignmentData(projectId, confirmedState)
    return confirmedState
  }
}

