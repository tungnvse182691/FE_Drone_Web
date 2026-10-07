import { apiClient } from '../client'
import { mockSurveys, mockDefects, mockRepairBatches, mockTriageCases } from '../mock/data'
import { SurveyRequest, Defect, RepairBatch, TriageCase } from '../../types/domain'

export interface PMDashboardStats {
  surveysCount: number
  pendingAIDefectsCount: number
  citizenCasesCount: number
  runningBatchesCount: number
}

export interface PMDashboardData {
  stats: PMDashboardStats
  surveys: SurveyRequest[]
  defects: Defect[]
  citizenCases: TriageCase[]
  repairBatches: RepairBatch[]
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

    return {
      stats: {
        surveysCount: mockSurveys.length,
        pendingAIDefectsCount: pendingAIDefects.length,
        citizenCasesCount: citizenCases.length,
        runningBatchesCount: mockRepairBatches.length,
      },
      surveys: mockSurveys,
      defects: mockDefects,
      citizenCases,
      repairBatches: mockRepairBatches,
    }
  },
}
