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
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false'

    if (!isMock) {
      const res = await apiClient.get<PMDashboardData>('/dashboard/pm')
      return res.data
    }

    // Mô phỏng network delay bất đồng bộ chuẩn RESTful
    await new Promise((resolve) => setTimeout(resolve, 350))

    const citizenCases = mockTriageCases.filter((c) => c.source === 'CITIZEN')
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
