import { apiClient } from '../client'
import { ProjectRouteConfig, AvailablePilot } from '../../pages/(pm)/create-survey/types'
import { AIDetectionItem } from '../../pages/(pm)/drone-review/types'
import { INITIAL_DETECTIONS } from '../../pages/(pm)/drone-review/mockData'

export type { ProjectRouteConfig, AvailablePilot, AIDetectionItem }

export interface SurveyMissionItem {
  id: string
  code: string
  title: string
  project_id: string
  project_name: string
  start_km: string
  end_km: string
  flight_date: string
  pilot_name: string
  drone_model: string
  total_photos: number
  gsd_resolution: string
  ai_defects_count: number
  ai_pending_count: number
  coverage_percent: number
  status: 'PENDING_AI_REVIEW' | 'BASELINE_LOCKED' | 'SCHEDULED' | 'PROCESSING_AI'
  status_label: string
}

export const INITIAL_SURVEY_MISSIONS: SurveyMissionItem[] = [
  {
    id: 'srv-01',
    code: '#MS-2026-0924',
    title: 'Bay quét Baseline định kỳ đợt 4 & Tầm soát nứt lún',
    project_id: 'prj-ql1a-02',
    project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
    start_km: 'Km 1024+000',
    end_km: 'Km 1030+000',
    flight_date: '24/09/2026',
    pilot_name: 'Hoàng Quốc Bảo (Pilot RTK Level 3)',
    drone_model: 'DJI Matrice 300 RTK + Zenmuse P1',
    total_photos: 1920,
    gsd_resolution: '1.12 cm/pixel',
    ai_defects_count: 8,
    ai_pending_count: 8,
    coverage_percent: 87,
    status: 'PENDING_AI_REVIEW',
    status_label: 'Chờ thẩm định AI Canvas (WF-09)'
  },
  {
    id: 'srv-02',
    code: '#MS-2026-0810',
    title: 'Bay kiểm định mốc bàn giao lý trình Km 1030 – Km 1036',
    project_id: 'prj-ql1a-02',
    project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
    start_km: 'Km 1030+000',
    end_km: 'Km 1036+500',
    flight_date: '10/08/2026',
    pilot_name: 'Lê Hoàng Long (Drone Operator)',
    drone_model: 'DJI Matrice 300 RTK + Zenmuse P1',
    total_photos: 1450,
    gsd_resolution: '1.20 cm/pixel',
    ai_defects_count: 14,
    ai_pending_count: 0,
    coverage_percent: 98,
    status: 'BASELINE_LOCKED',
    status_label: 'Đã khóa Baseline'
  },
  {
    id: 'srv-03',
    code: '#MS-2026-0705',
    title: 'Bay lập Baseline dữ liệu ban đầu toàn tuyến 21.5 km',
    project_id: 'prj-ql1a-02',
    project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
    start_km: 'Km 1024+000',
    end_km: 'Km 1045+500',
    flight_date: '05/07/2026',
    pilot_name: 'Trần Quang Khải (Pilot RTK)',
    drone_model: 'DJI Matrice 350 RTK',
    total_photos: 3120,
    gsd_resolution: '1.05 cm/pixel',
    ai_defects_count: 22,
    ai_pending_count: 0,
    coverage_percent: 100,
    status: 'BASELINE_LOCKED',
    status_label: 'Đã khóa Baseline'
  },
  {
    id: 'srv-04',
    code: '#MS-2026-1002',
    title: 'Nhiệm vụ bay bổ sung kiểm tra sụt lún sau mưa bão',
    project_id: 'prj-ql1a-02',
    project_name: 'Quốc lộ 1A - Giai đoạn 2 (PRJ-QL1A-02)',
    start_km: 'Km 1033+000',
    end_km: 'Km 1038+000',
    flight_date: 'Hôm nay (Chờ thực hiện)',
    pilot_name: 'Lê Hoàng Long (Đội bay Hoàng Hải 01)',
    drone_model: 'DJI Matrice 350 RTK + Zenmuse P1',
    total_photos: 0,
    gsd_resolution: '~1.15 cm/pixel',
    ai_defects_count: 0,
    ai_pending_count: 0,
    coverage_percent: 0,
    status: 'SCHEDULED',
    status_label: 'Đang lên lịch bay (Sẵn sàng cất cánh)'
  }
]

// Mock Store danh sách Tuyến chính & Tuyến phụ (Gắn liền với từng dự án mẹ)
export const INITIAL_SURVEY_ROUTES: ProjectRouteConfig[] = [
  // === DỰ ÁN 1: QUỐC LỘ 1A - GIAI ĐOẠN 2 ===
  {
    id: 'prj-ql1a-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2',
    type: 'MAINLINE',
    parentProjectId: 'prj-ql1a-02',
    parentProjectCode: 'PRJ-QL1A-02',
    parentProjectName: 'QL1A - Giai đoạn 2',
    lengthKm: 25.0,
    startKm: 1020.0,
    endKm: 1045.0,
    defaultCoords: [
      [108.0825, 16.2731], // P0 - Km 1020+000
      [108.1054, 16.2589], // P1 - Km 1022+500
      [108.1287, 16.2415], // P2 - Km 1025+000
      [108.1492, 16.2238], // P3 - Km 1027+500
      [108.1695, 16.2085], // P4 - Km 1030+000
      [108.1884, 16.1843], // P5 - Km 1035+000
      [108.2152, 16.1521], // P6 - Km 1040+000
      [108.2418, 16.1215]  // P7 - Km 1045+000
    ],
    defaultKmPoints: [1020, 1022.5, 1025, 1027.5, 1030, 1035, 1040, 1045]
  },
  {
    id: 'br-01-haivan',
    code: 'BR-01',
    name: 'Nhánh rẽ Đèo Hải Vân',
    type: 'BRANCH',
    parentProjectId: 'prj-ql1a-02',
    parentProjectCode: 'PRJ-QL1A-02',
    parentProjectName: 'QL1A - Giai đoạn 2',
    branchStationKm: 1024.5,
    branchStationText: 'Tách từ Km 1024+500 trên QL1A',
    directionText: 'Rẽ phải (hướng đèo Hải Vân)',
    lengthKm: 1.85,
    startKm: 0.0,
    endKm: 1.85,
    defaultCoords: [
      [108.1245, 16.2450], // Điểm nối tim tuyến chính Km 1024+500
      [108.1380, 16.2520],
      [108.1490, 16.2610]  // Đỉnh nhánh rẽ đèo
    ],
    defaultKmPoints: [0, 0.9, 1.85]
  },
  {
    id: 'br-02-langco',
    code: 'BR-02',
    name: 'Tuyến tránh đô thị Lăng Cô',
    type: 'BRANCH',
    parentProjectId: 'prj-ql1a-02',
    parentProjectCode: 'PRJ-QL1A-02',
    parentProjectName: 'QL1A - Giai đoạn 2',
    branchStationKm: 1030.0,
    branchStationText: 'Tách từ Km 1030+000 trên QL1A',
    directionText: 'Rẽ trái (tuyến tránh đô thị)',
    lengthKm: 3.20,
    startKm: 0.0,
    endKm: 3.20,
    defaultCoords: [
      [108.1695, 16.2085], // Điểm nối tim tuyến chính Km 1030+000
      [108.1780, 16.2160],
      [108.1920, 16.2110],
      [108.2040, 16.1980]
    ],
    defaultKmPoints: [0, 1.0, 2.2, 3.2]
  },
  {
    id: 'br-03-eastgom',
    code: 'BR-03',
    name: 'Đường gom kết nối dân sinh phía Đông',
    type: 'BRANCH',
    parentProjectId: 'prj-ql1a-02',
    parentProjectCode: 'PRJ-QL1A-02',
    parentProjectName: 'QL1A - Giai đoạn 2',
    branchStationKm: 1038.0,
    branchStationText: 'Tách từ Km 1038+000 trên QL1A',
    directionText: 'Rẽ phải (đường gom khu dân cư)',
    lengthKm: 2.10,
    startKm: 0.0,
    endKm: 2.10,
    defaultCoords: [
      [108.2045, 16.1650], // Điểm nối tim tuyến chính Km 1038+000
      [108.2120, 16.1730],
      [108.2250, 16.1810]
    ],
    defaultKmPoints: [0, 1.05, 2.1]
  },

  // === DỰ ÁN 2: CAO TỐC LA SƠN - TÚY LOAN ===
  {
    id: 'prj-lstl-05',
    code: 'PRJ-LSTL-05',
    name: 'Cao tốc La Sơn - Túy Loan',
    type: 'MAINLINE',
    parentProjectId: 'prj-lstl-05',
    parentProjectCode: 'PRJ-LSTL-05',
    parentProjectName: 'Cao tốc La Sơn - Túy Loan',
    lengthKm: 66.0,
    startKm: 0.0,
    endKm: 66.0,
    defaultCoords: [
      [107.6521, 16.2912],
      [107.7214, 16.2105],
      [107.8102, 16.1423],
      [107.9056, 16.0821],
      [108.0124, 16.0354],
      [108.1189, 15.9876]
    ],
    defaultKmPoints: [0, 15, 30, 45, 55, 66]
  },
  {
    id: 'br-lstl-01',
    code: 'BR-LSTL-01',
    name: 'Nhánh rẽ nút giao Khe Tre',
    type: 'BRANCH',
    parentProjectId: 'prj-lstl-05',
    parentProjectCode: 'PRJ-LSTL-05',
    parentProjectName: 'Cao tốc La Sơn - Túy Loan',
    branchStationKm: 24.0,
    branchStationText: 'Tách từ Km 24+000 trên Cao tốc La Sơn - Túy Loan',
    directionText: 'Rẽ phải (nút giao Khe Tre)',
    lengthKm: 2.40,
    startKm: 0.0,
    endKm: 2.40,
    defaultCoords: [
      [107.7214, 16.2105],
      [107.7350, 16.2180],
      [107.7520, 16.2290]
    ],
    defaultKmPoints: [0, 1.2, 2.4]
  },
  {
    id: 'br-lstl-02',
    code: 'BR-LSTL-02',
    name: 'Nhánh rẽ nút giao Nam Đông',
    type: 'BRANCH',
    parentProjectId: 'prj-lstl-05',
    parentProjectCode: 'PRJ-LSTL-05',
    parentProjectName: 'Cao tốc La Sơn - Túy Loan',
    branchStationKm: 36.5,
    branchStationText: 'Tách từ Km 36+500 trên Cao tốc La Sơn - Túy Loan',
    directionText: 'Rẽ trái (trung tâm huyện Nam Đông)',
    lengthKm: 3.10,
    startKm: 0.0,
    endKm: 3.10,
    defaultCoords: [
      [107.8102, 16.1423],
      [107.8250, 16.1350],
      [107.8420, 16.1210]
    ],
    defaultKmPoints: [0, 1.5, 3.1]
  },
  {
    id: 'br-lstl-03',
    code: 'BR-LSTL-03',
    name: 'Tuyến nối nút giao Túy Loan - QL14B',
    type: 'BRANCH',
    parentProjectId: 'prj-lstl-05',
    parentProjectCode: 'PRJ-LSTL-05',
    parentProjectName: 'Cao tốc La Sơn - Túy Loan',
    branchStationKm: 64.2,
    branchStationText: 'Tách từ Km 64+200 trên Cao tốc La Sơn - Túy Loan',
    directionText: 'Rẽ phải (kết nối Quốc lộ 14B)',
    lengthKm: 4.20,
    startKm: 0.0,
    endKm: 4.20,
    defaultCoords: [
      [108.1050, 15.9920],
      [108.1189, 15.9876],
      [108.1340, 15.9750]
    ],
    defaultKmPoints: [0, 2.1, 4.2]
  },

  // === DỰ ÁN 3: CAO TỐC BẮC NAM - ĐOẠN DIỄN CHÂU ===
  {
    id: 'prj-ctbn-01',
    code: 'PRJ-CTBN-01',
    name: 'Cao tốc Bắc Nam - Đoạn Diễn Châu',
    type: 'MAINLINE',
    parentProjectId: 'prj-ctbn-01',
    parentProjectCode: 'PRJ-CTBN-01',
    parentProjectName: 'Cao tốc Bắc Nam - Đoạn Diễn Châu',
    lengthKm: 49.3,
    startKm: 430.0,
    endKm: 479.3,
    defaultCoords: [
      [105.5821, 18.9823],
      [105.6120, 18.9145],
      [105.6450, 18.8450],
      [105.6812, 18.7654]
    ],
    defaultKmPoints: [430, 445, 462, 479.3]
  },
  {
    id: 'br-dc-01',
    code: 'BR-DC-01',
    name: 'Nhánh rẽ nút giao Quốc lộ 7',
    type: 'BRANCH',
    parentProjectId: 'prj-ctbn-01',
    parentProjectCode: 'PRJ-CTBN-01',
    parentProjectName: 'Cao tốc Bắc Nam - Đoạn Diễn Châu',
    branchStationKm: 445.2,
    branchStationText: 'Tách từ Km 445+200 trên Cao tốc Bắc Nam',
    directionText: 'Rẽ phải (hướng Đô Lương - QL7)',
    lengthKm: 2.80,
    startKm: 0.0,
    endKm: 2.80,
    defaultCoords: [
      [105.6120, 18.9145],
      [105.5980, 18.9050],
      [105.5810, 18.8920]
    ],
    defaultKmPoints: [0, 1.4, 2.8]
  },
  {
    id: 'br-dc-02',
    code: 'BR-DC-02',
    name: 'Đường gom kết nối KCN VSIP Nghệ An',
    type: 'BRANCH',
    parentProjectId: 'prj-ctbn-01',
    parentProjectCode: 'PRJ-CTBN-01',
    parentProjectName: 'Cao tốc Bắc Nam - Đoạn Diễn Châu',
    branchStationKm: 462.0,
    branchStationText: 'Tách từ Km 462+000 trên Cao tốc Bắc Nam',
    directionText: 'Rẽ trái (Khu công nghiệp VSIP)',
    lengthKm: 3.50,
    startKm: 0.0,
    endKm: 3.50,
    defaultCoords: [
      [105.6450, 18.8450],
      [105.6580, 18.8520],
      [105.6720, 18.8610]
    ],
    defaultKmPoints: [0, 1.75, 3.5]
  },

  // === DỰ ÁN 4: ĐƯỜNG TỈNH ĐT-741 (BÌNH DƯƠNG) ===
  {
    id: 'prj-dt741-04',
    code: 'PRJ-DT741-04',
    name: 'Đường tỉnh ĐT-741 (Bình Dương)',
    type: 'MAINLINE',
    parentProjectId: 'prj-dt741-04',
    parentProjectCode: 'PRJ-DT741-04',
    parentProjectName: 'Đường tỉnh ĐT-741 (Bình Dương)',
    lengthKm: 32.8,
    startKm: 0.0,
    endKm: 32.8,
    defaultCoords: [
      [106.6854, 11.0821],
      [106.7215, 11.1620],
      [106.7620, 11.2450],
      [106.7950, 11.3120]
    ],
    defaultKmPoints: [0, 10, 20, 32.8]
  },
  {
    id: 'br-741-01',
    code: 'BR-741-01',
    name: 'Tuyến nhánh KCN Tân Bình',
    type: 'BRANCH',
    parentProjectId: 'prj-dt741-04',
    parentProjectCode: 'PRJ-DT741-04',
    parentProjectName: 'Đường tỉnh ĐT-741 (Bình Dương)',
    branchStationKm: 12.5,
    branchStationText: 'Tách từ Km 12+500 trên ĐT-741',
    directionText: 'Rẽ phải (Khu công nghiệp Tân Bình)',
    lengthKm: 2.15,
    startKm: 0.0,
    endKm: 2.15,
    defaultCoords: [
      [106.7215, 11.1620],
      [106.7350, 11.1710],
      [106.7480, 11.1820]
    ],
    defaultKmPoints: [0, 1.1, 2.15]
  },
  {
    id: 'br-741-02',
    code: 'BR-741-02',
    name: 'Tuyến tránh đô thị Bến Cát',
    type: 'BRANCH',
    parentProjectId: 'prj-dt741-04',
    parentProjectCode: 'PRJ-DT741-04',
    parentProjectName: 'Đường tỉnh ĐT-741 (Bình Dương)',
    branchStationKm: 22.8,
    branchStationText: 'Tách từ Km 22+800 trên ĐT-741',
    directionText: 'Rẽ trái (trung tâm Bến Cát)',
    lengthKm: 3.40,
    startKm: 0.0,
    endKm: 3.40,
    defaultCoords: [
      [106.7620, 11.2450],
      [106.7780, 11.2580],
      [106.7920, 11.2710]
    ],
    defaultKmPoints: [0, 1.7, 3.4]
  }
]

// Mock Store danh sách phi công drone có chứng chỉ
export const INITIAL_PILOTS: AvailablePilot[] = [
  {
    id: 'pilot-01',
    name: 'Lê Hoàng Long',
    roleLabel: 'Drone Pilot — Đội bay Hoàng Hải 01',
    phone: '0988.123.456',
    license: 'Cục Tác Chiến #TC-UAV-2024-089',
    device: 'DJI Matrice 350 RTK + Zenmuse P1'
  },
  {
    id: 'pilot-02',
    name: 'Trần Quang Khải',
    roleLabel: 'Drone Pilot — Đội bay Hoàng Hải 02',
    phone: '0972.555.888',
    license: 'Cục Tác Chiến #TC-UAV-2025-112',
    device: 'DJI Mavic 3 Enterprise RTK'
  },
  {
    id: 'pilot-03',
    name: 'Nguyễn Thành Đạt',
    roleLabel: 'Drone Pilot — Chuyên gia bay địa hình & SfM',
    phone: '0915.777.999',
    license: 'Cục Tác Chiến #TC-UAV-2025-240',
    device: 'DJI Matrice 300 RTK + Zenmuse H20T'
  },
  {
    id: 'pilot-04',
    name: 'Phạm Minh Tuấn',
    roleLabel: 'Drone Pilot — Đội bay dự phòng khẩn cấp',
    phone: '0903.444.222',
    license: 'Cục Tác Chiến #TC-UAV-2026-031',
    device: 'DJI Phantom 4 RTK'
  }
]

// In-memory Mock State (KHÔNG dùng localStorage)
let surveyStore: SurveyMissionItem[] = JSON.parse(JSON.stringify(INITIAL_SURVEY_MISSIONS))
let surveyRoutesStore: ProjectRouteConfig[] = JSON.parse(JSON.stringify(INITIAL_SURVEY_ROUTES))
let surveyPilotsStore: AvailablePilot[] = JSON.parse(JSON.stringify(INITIAL_PILOTS))
let surveyDetectionsStore: Record<string, AIDetectionItem[]> = {
  'srv-01': JSON.parse(JSON.stringify(INITIAL_DETECTIONS))
}

export interface CreateSurveyPayload {
  project_id: string
  project_name: string
  start_km: string
  end_km: string
  pilot_name: string
  drone_model?: string
  flight_date?: string
  notes?: string
}

export const surveyService = {
  /**
   * Lấy danh sách nhiệm vụ bay khảo sát qua Mock API chuẩn RESTful
   */
  async getSurveys(): Promise<SurveyMissionItem[]> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.get<SurveyMissionItem[]>('/surveys')
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
    return JSON.parse(JSON.stringify(surveyStore))
  },

  /**
   * Lấy danh sách Tuyến chính & Tuyến phụ để bay khảo sát qua Mock API
   */
  async getSurveyRoutes(): Promise<ProjectRouteConfig[]> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.get<ProjectRouteConfig[]>('/surveys/routes')
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    return JSON.parse(JSON.stringify(INITIAL_SURVEY_ROUTES))
  },

  /**
   * Lấy danh sách phi công khả dụng qua Mock API
   */
  async getAvailablePilots(): Promise<AvailablePilot[]> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.get<AvailablePilot[]>('/surveys/pilots')
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 150))
    return JSON.parse(JSON.stringify(surveyPilotsStore))
  },

  /**
   * Lấy chi tiết nhiệm vụ khảo sát theo ID hoặc Code
   */
  async getSurveyById(id: string): Promise<SurveyMissionItem | undefined> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.get<SurveyMissionItem>(`/surveys/${id}`)
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 150))
    return surveyStore.find((s) => s.id === id || s.code === id)
  },

  /**
   * Tạo nhiệm vụ bay mới (Mock POST API)
   */
  async createSurvey(data: CreateSurveyPayload): Promise<SurveyMissionItem> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.post<SurveyMissionItem>('/surveys', data)
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
    const missionCode = `#MS-2026-${String(surveyStore.length + 10).padStart(4, '0')}`
    const newSurvey: SurveyMissionItem = {
      id: `srv-${Date.now()}`,
      code: missionCode,
      title: `Bay khảo sát trắc địa đoạn ${data.start_km} - ${data.end_km}`,
      project_id: data.project_id,
      project_name: data.project_name,
      start_km: data.start_km,
      end_km: data.end_km,
      flight_date: data.flight_date || 'Hôm nay',
      pilot_name: data.pilot_name,
      drone_model: data.drone_model || 'DJI Matrice 350 RTK',
      total_photos: 0,
      gsd_resolution: '~1.15 cm/pixel',
      ai_defects_count: 0,
      ai_pending_count: 0,
      coverage_percent: 0,
      status: 'SCHEDULED',
      status_label: 'Đang lên lịch bay (Sẵn sàng cất cánh)'
    }

    surveyStore = [newSurvey, ...surveyStore]
    return JSON.parse(JSON.stringify(newSurvey))
  },

  /**
   * TRIGGER MÔ PHỎNG DRONE BAY XONG (Mock API Endpoint)
   */
  async simulateDroneFlightCompletion(surveyId: string): Promise<SurveyMissionItem | null> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.post<SurveyMissionItem>(`/surveys/${surveyId}/simulate-complete`)
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    let completedItem: SurveyMissionItem | null = null

    surveyStore = surveyStore.map((item) => {
      if (item.id === surveyId || item.code === surveyId) {
        completedItem = {
          ...item,
          total_photos: 1920,
          gsd_resolution: '1.12 cm/pixel',
          ai_defects_count: 8,
          ai_pending_count: 8,
          coverage_percent: 98,
          status: 'PENDING_AI_REVIEW',
          status_label: 'Chờ thẩm định AI Canvas (WF-09)'
        }
        return completedItem
      }
      return item
    })

    return completedItem ? JSON.parse(JSON.stringify(completedItem)) : null
  },

  /**
   * Lấy danh sách phát hiện AI của đợt bay qua Mock API
   */
  async getSurveyDetections(surveyId: string): Promise<AIDetectionItem[]> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.get<AIDetectionItem[]>(`/surveys/${surveyId}/detections`)
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 180))
    const list = surveyDetectionsStore[surveyId] || surveyDetectionsStore['srv-01'] || INITIAL_DETECTIONS
    return JSON.parse(JSON.stringify(list))
  },

  /**
   * Cập nhật thẩm định phát hiện AI (Duyệt / Từ chối / Chỉnh sửa)
   */
  async updateSurveyDetection(
    surveyId: string,
    detectionId: string,
    updates: Partial<AIDetectionItem>
  ): Promise<AIDetectionItem | null> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.patch<AIDetectionItem>(`/surveys/${surveyId}/detections/${detectionId}`, updates)
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 150))
    const list = surveyDetectionsStore[surveyId] || surveyDetectionsStore['srv-01'] || []
    let updatedItem: AIDetectionItem | null = null

    const updatedList = list.map((item) => {
      if (item.id === detectionId) {
        updatedItem = {
          ...item,
          ...updates,
          metrics: {
            ...item.metrics,
            ...(updates.metrics || {})
          }
        }
        return updatedItem
      }
      return item
    })

    surveyDetectionsStore[surveyId] = updatedList
    if (surveyId !== 'srv-01' && !surveyDetectionsStore['srv-01']) {
      surveyDetectionsStore['srv-01'] = updatedList
    }

    return updatedItem ? JSON.parse(JSON.stringify(updatedItem)) : null
  },

  /**
   * Yêu cầu bay bổ sung để bù độ phủ trắc địa
   */
  async requestReFlight(
    surveyId: string,
    payload: { note: string; targetKm?: string }
  ): Promise<{ success: boolean; newCoverage: number }> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.post<{ success: boolean; newCoverage: number }>(`/surveys/${surveyId}/re-flight`, payload)
      return res.data
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
    // Cập nhật coverage lên 98% cho survey
    surveyStore = surveyStore.map((s) => (s.id === surveyId ? { ...s, coverage_percent: 98 } : s))
    return { success: true, newCoverage: 98 }
  },

  /**
   * Khóa Baseline đoạn đường sau khi thẩm định 100%
   */
  async lockBaseline(surveyId: string): Promise<boolean> {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'
    if (!isMock) {
      const res = await apiClient.post<{ success: boolean }>(`/surveys/${surveyId}/lock-baseline`)
      return res.data.success
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    surveyStore = surveyStore.map((s) =>
      s.id === surveyId
        ? { ...s, status: 'BASELINE_LOCKED', status_label: 'Đã khóa Baseline' }
        : s
    )
    return true
  },

  /**
   * Đặt lại mock data ban đầu
   */
  async resetSurveys(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    surveyStore = JSON.parse(JSON.stringify(INITIAL_SURVEY_MISSIONS))
    surveyRoutesStore = JSON.parse(JSON.stringify(INITIAL_SURVEY_ROUTES))
    surveyPilotsStore = JSON.parse(JSON.stringify(INITIAL_PILOTS))
    surveyDetectionsStore = {
      'srv-01': JSON.parse(JSON.stringify(INITIAL_DETECTIONS))
    }
  }
}
