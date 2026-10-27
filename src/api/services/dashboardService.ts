import { apiClient } from '../client'
import { mockSurveys, mockDefects, mockRepairBatches, mockTriageCases } from '../mock/data'
import { SurveyRequest, Defect, RepairBatch, TriageCase } from '../../types/domain'

export interface H6ClockItem {
  id: string
  projectId: string
  kind: 'SURVEY_VERIFICATION' | 'FIELD_INSPECTION' | 'CONSTRUCTION_DECLARATION' | string
  title: string
  targetCode: string
  targetPath: string
  currentDueAt: string
  overdue: boolean
  remainingTime: string
  appointedRole: string
}

export interface PMDashboardStats {
  surveysCount: number
  pendingAIDefectsCount: number
  citizenCasesCount: number
  runningBatchesCount: number
  overdueClocksCount: number
}

export interface PMDashboardData {
  stats: PMDashboardStats
  surveys: SurveyRequest[]
  defects: Defect[]
  citizenCases: TriageCase[]
  repairBatches: RepairBatch[]
  clocks: H6ClockItem[]
}

export const dashboardService = {
  /**
   * Lấy toàn bộ số liệu và danh sách cho Dashboard PM qua API
   * (Có async, loading, error state và sẵn sàng swap sang API thật)
   */
  async getPMDashboard(): Promise<PMDashboardData> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true'

    let realCitizenCases: TriageCase[] = []
    let realProjectsCount = 0

    if (!isMock) {
      try {
        const res = await apiClient.get<PMDashboardData>('/dashboard/pm')
        if (res.data) return res.data
      } catch {
        // Backend Candidate3 không có endpoint tổng hợp /dashboard/pm, tiếp tục tổng hợp từ các endpoint rời
      }

      // Thử gọi các endpoint con của Candidate3
      try {
        const casesRes = await apiClient.get<{ items?: any[] }>('/cases')
        if (casesRes.data?.items) {
          realCitizenCases = casesRes.data.items.map((item: any, idx: number) => ({
            id: item.caseId || item.id || `case-${idx}`,
            code: item.caseCode || item.code || `CASE-${(item.caseId || '').slice(0, 8)}`,
            source: 'CITIZEN',
            source_label: 'Phản ánh người dân',
            source_detail: 'Ứng dụng RoadGuard Citizen',
            project_id: item.projectId || '72f84201-c001-4000-8000-000000000001',
            project_name: item.projectName || 'Synthetic Project A',
            stationing: item.stationing || 'Km 0+000',
            lane: item.lane || 'Làn 1',
            defect_title: item.title || item.description || 'Phản ánh mặt đường người dân',
            defect_type: item.defectType || 'POTHOLE',
            severity: item.severity || 'MEDIUM',
            urgency: item.urgency || 'NORMAL',
            time_ago: 'Hôm nay',
            created_at: item.createdAt || new Date().toISOString(),
            status: item.status || 'PENDING',
            status_label: 'Chờ xử lý',
            image_url: item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1545158826-646e7f8e8f81?w=800',
            gps: {
              lat: item.lat || 16.0544,
              lng: item.lng || 108.2022,
              altitude_m: 10,
              resolution_cm_px: 0.5,
            },
            ai_confidence: item.confidence || 0.85,
            area_sqm: item.areaSqm || 1.2,
            ai_area_sqm: item.areaSqm || 1.2,
            max_depth_cm: item.depthCm || 3.5,
            ai_depth_cm: item.depthCm || 3.5,
            pm_notes: '',
            description: item.description || '',
            conclusion: item.conclusion || null,
          }))
        }
      } catch (e) {
        console.warn('⚠️ [Candidate3] Chưa tải được /cases:', e)
      }
    }

    const citizenCases = realCitizenCases.length > 0 
      ? realCitizenCases 
      : mockTriageCases.filter((c) => c.source === 'CITIZEN')
    const pendingAIDefects = mockDefects.filter((d) => d.status === 'OPEN' || d.status === 'VERIFIED')

    const nowTs = Date.now()
    const mockClocks: H6ClockItem[] = [
      {
        id: 'clk-01',
        projectId: 'prj-01',
        kind: 'FIELD_INSPECTION',
        title: 'Nghiệm thu kích thước đo đạc nứt lún thực địa Km 1025+110',
        targetCode: 'TASK-1025',
        targetPath: '/pm/field-tasks',
        currentDueAt: new Date(nowTs - 90 * 60 * 1000).toISOString(), // Quá hạn 90 phút trước
        overdue: true,
        remainingTime: 'Quá hạn 1 giờ 30 phút',
        appointedRole: 'PROJECT_MANAGER',
      },
      {
        id: 'clk-02',
        projectId: 'prj-01',
        kind: 'SURVEY_VERIFICATION',
        title: 'Thẩm định phát hiện AI đợt bay #SRV-01 (Km 1024 - Km 1030)',
        targetCode: '#SRV-01',
        targetPath: '/pm/surveys/srv-01/review',
        currentDueAt: new Date(nowTs + 22 * 60 * 1000).toISOString(), // Còn 22 phút (Khẩn cấp < 30m đếm giây)
        overdue: false,
        remainingTime: 'Còn 22 phút',
        appointedRole: 'PROJECT_MANAGER',
      },
      {
        id: 'clk-03',
        projectId: 'prj-01',
        kind: 'CONSTRUCTION_DECLARATION',
        title: 'Khai báo hoàn thành thi công (Before/After) gói PKG-2026-05',
        targetCode: 'PKG-2026-05',
        targetPath: '/pm/acceptance',
        currentDueAt: new Date(nowTs + 19 * 3600 * 1000).toISOString(), // Còn 19 giờ
        overdue: false,
        remainingTime: 'Còn 19 giờ',
        appointedRole: 'PROJECT_MANAGER',
      },
    ]

    return {
      stats: {
        surveysCount: mockSurveys.length,
        pendingAIDefectsCount: pendingAIDefects.length,
        citizenCasesCount: citizenCases.length,
        runningBatchesCount: mockRepairBatches.length,
        overdueClocksCount: mockClocks.filter((c) => c.overdue).length,
      },
      surveys: mockSurveys,
      defects: mockDefects,
      citizenCases,
      repairBatches: mockRepairBatches,
      clocks: mockClocks,
    }
  },
}
