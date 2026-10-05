import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'

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

export const surveyService = {
  getSurveys(): SurveyMissionItem[] {
    return getFromStorage<SurveyMissionItem[]>(STORAGE_KEYS.SURVEYS, INITIAL_SURVEY_MISSIONS)
  },

  getSurveyById(id: string): SurveyMissionItem | undefined {
    const list = this.getSurveys()
    return list.find((s) => s.id === id || s.code === id)
  },

  createSurvey(data: {
    project_id: string
    project_name: string
    start_km: string
    end_km: string
    pilot_name: string
    drone_model?: string
    flight_date?: string
    notes?: string
  }): SurveyMissionItem {
    const list = this.getSurveys()
    const missionCode = `#MS-2026-${String(list.length + 10).padStart(4, '0')}`
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
    const updated = [newSurvey, ...list]
    saveToStorage(STORAGE_KEYS.SURVEYS, updated)
    return newSurvey
  },

  /**
   * TRIGGER MÔ PHỎNG DRONE BAY XONG (DRONE FLIGHT SIMULATOR - THIẾU 3)
   * Chuyển trạng thái từ SCHEDULED -> PENDING_AI_REVIEW, nạp ảnh và khiếm khuyết
   */
  simulateDroneFlightCompletion(surveyId: string): SurveyMissionItem | null {
    const list = this.getSurveys()
    let completedItem: SurveyMissionItem | null = null

    const updated = list.map((item) => {
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

    if (completedItem) {
      saveToStorage(STORAGE_KEYS.SURVEYS, updated)
    }
    return completedItem
  },

  resetSurveys(): void {
    saveToStorage(STORAGE_KEYS.SURVEYS, INITIAL_SURVEY_MISSIONS)
  }
}
