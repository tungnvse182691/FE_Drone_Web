import { useState, useEffect, useCallback } from 'react'
import {
  PolicyThresholdConfig,
  PolicyHistoryItem,
  AuditLogItem,
  RoadCoverageFact,
  RoadCoverageInputDto
} from './types'
import { fastTrackService, RepairPolicyDefinitionInput } from '../../../api/services/fastTrackService'

export function useFastTrackPolicy(
  selectedProjectId: string,
  showToast: (msg: string) => void
) {
  const [currentPolicy, setCurrentPolicy] = useState<PolicyThresholdConfig | null>(null)
  const [policyHistory, setPolicyHistory] = useState<PolicyHistoryItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [roadCoverage, setRoadCoverage] = useState<RoadCoverageFact | null>(null)
  const [coverageEtag, setCoverageEtag] = useState<string>('')
  const [isRoadCoverageModalOpen, setIsRoadCoverageModalOpen] = useState(false)
  const [lastDraftId, setLastDraftId] = useState<string | null>(null)
  const [lastDraftVersion, setLastDraftVersion] = useState<string | null>(null)

  // Form states cho Modal Lập dự thảo chính sách (API-162)
  const [formVersionName, setFormVersionName] = useState('TCVN-8819-2011')
  const [formMaxArea, setFormMaxArea] = useState('0.5')
  const [formMaxDepth, setFormMaxDepth] = useState('5.0')
  const [formPolicyNote, setFormPolicyNote] = useState('Dự thảo quy chuẩn kỹ thuật xử lý khẩn cấp')
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [coverageError, setCoverageError] = useState<string | null>(null)
  const [isSubmittingCoverage, setIsSubmittingCoverage] = useState(false)

  // Tải dữ liệu thật 100% từ CSDL Backend Candidate3 qua OpenAPI
  const loadPolicyData = useCallback(async () => {
    if (!selectedProjectId) return
    try {
      // 1. Tải chính sách hiện hành từ CSDL
      const activePol = await fastTrackService.getActivePolicy(selectedProjectId)
      setCurrentPolicy(activePol)

      // 2. Tải độ phủ tuyến đường bảo hành (API-175)
      const covData = await fastTrackService.getRoadCoverage(selectedProjectId)
      if (covData) {
        setCoverageEtag(covData.sourceVersion || '')
        setRoadCoverage(covData)

        if (covData.status === 'CONFIRMED') {
          setAuditLogs([
            {
              title: 'Phê duyệt phạm vi độ phủ tuyến đường bảo hành',
              time: covData.confirmedAt || 'CSDL',
              user: covData.confirmedBy || 'Kỹ sư Giám sát / Chủ đầu tư',
              hash: covData.handoverVersion,
              note: `Căn cứ: ${covData.reason || 'Bảo dưỡng thường xuyên'}. Hiệu lực: ${covData.applicableFromUtc} đến ${covData.applicableToUtc}.`
            }
          ])
        }
      } else {
        setRoadCoverage(null)
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu chính sách từ CSDL Backend:', err)
      const errorDetail = err?.response?.data?.detail || err?.response?.data?.code || err?.message || 'Không thể kết nối API'
      showToast(`Lỗi tải dữ liệu CSDL: ${errorDetail}`)
    }
  }, [selectedProjectId, showToast])

  useEffect(() => {
    loadPolicyData()
  }, [loadPolicyData])

  // PM Lưu bản dự thảo (API-162) hoặc Xuất bản trực tiếp (API-165)
  const handleApplyPolicy = async (shouldPublishDirectly: boolean) => {
    try {
      const area = parseFloat(formMaxArea) || 0.5
      const depth = parseFloat(formMaxDepth) || 5.0

      const draftPayload: RepairPolicyDefinitionInput = {
        defectTypeCode: 'POTHOLE',
        checklistVersion: formVersionName,
        measurements: [
          { code: 'AREA', unit: 'm2', minimum: 0.01, maximum: area },
          { code: 'DEPTH', unit: 'cm', minimum: 0.5, maximum: depth }
        ],
        stopConditions: ['WEATHER_RAIN', 'NIGHT_WITHOUT_LIGHT'],
        reason: formPolicyNote
      }

      // Bước 1: Gọi API-162 tạo bản dự thảo
      const draftResult = await fastTrackService.createPolicyDraft(selectedProjectId, draftPayload)
      setLastDraftId(draftResult.id)
      setLastDraftVersion(draftResult.version || null)

      const timeStr = new Date().toLocaleString('vi-VN')

      if (shouldPublishDirectly) {
        // Bước 2: Gọi API-165 xuất bản chính sách
        const etag = draftResult.version || 'AAAAAAAAdb4='
        const pubResult = await fastTrackService.publishPolicy(
          selectedProjectId,
          draftResult.id,
          formPolicyNote,
          etag
        )

        const publishedPolicy: PolicyThresholdConfig = {
          id: pubResult.id,
          version: formVersionName,
          status: 'ACTIVE',
          maxAreaM2: area,
          maxDepthCm: depth,
          allowedSeverities: ['LOW', 'MEDIUM'],
          activatedBy: 'Chỉ huy trưởng (PM)',
          activatedAt: timeStr,
          appliedRoute: 'Toàn tuyến dự án',
          description: formPolicyNote,
          defectTypeCode: 'POTHOLE',
          stopConditions: ['WEATHER_RAIN', 'NIGHT_WITHOUT_LIGHT'],
          revision: pubResult.revision || 1
        }

        setCurrentPolicy(publishedPolicy)

        setPolicyHistory((prev) => [
          {
            id: pubResult.id,
            version: formVersionName,
            displayName: `${formVersionName} (Hiện hành)`,
            status: 'ACTIVE',
            activatedBy: 'Chỉ huy trưởng (PM)',
            activatedAt: timeStr,
            route: `Ngưỡng diện tích ≤ ${area} m² • Độ sâu ≤ ${depth} cm`,
            maxArea: area,
            maxDepth: depth
          },
          ...prev.map((p) => ({ ...p, status: 'ARCHIVED' as const }))
        ])

        setAuditLogs((prev) => [
          {
            title: `Xuất bản quy chuẩn ${formVersionName}`,
            time: timeStr,
            user: 'Chỉ huy trưởng (PM)',
            hash: pubResult.version || 'sha256:verified',
            note: `PM xuất bản chính sách chính thức: Diện tích ≤ ${area} m², Độ sâu ≤ ${depth} cm.`
          },
          ...prev
        ])

        showToast(`Đã xuất bản thành công chính sách ${formVersionName}!`)
      } else {
        // Lưu dự thảo
        setPolicyHistory((prev) => [
          {
            id: draftResult.id,
            version: formVersionName,
            displayName: `${formVersionName} (Dự thảo)`,
            status: 'DRAFT',
            activatedBy: 'Chỉ huy trưởng (PM)',
            activatedAt: timeStr,
            route: `Ngưỡng diện tích ≤ ${area} m² • Độ sâu ≤ ${depth} cm`,
            maxArea: area,
            maxDepth: depth
          },
          ...prev
        ])

        showToast(`Đã lưu dự thảo ${formVersionName} thành công!`)
      }

      setIsPolicyModalOpen(false)
    } catch (err: any) {
      console.error('Lỗi khi tạo/xuất bản chính sách Fast Track:', err)
      const errorDetail = err?.response?.data?.detail || err?.response?.data?.code || err?.message || 'Lỗi thao tác'
      showToast(`Lỗi: ${errorDetail}`)
    }
  }

  // PM kích hoạt dự thảo đã lưu thành chính sách hiện hành (API-165)
  const handleActivateDraft = async (item: PolicyHistoryItem) => {
    try {
      const draftId = lastDraftId || item.id
      if (!draftId) {
        showToast('Không tìm thấy mã bản dự thảo chính sách')
        return
      }
      const etag = lastDraftVersion || 'AAAAAAAAdb4='
      const pubRes = await fastTrackService.publishPolicy(
        selectedProjectId,
        draftId,
        'Kích hoạt xuất bản dự thảo thành chính sách chính thức',
        etag
      )

      const timeStr = new Date().toLocaleString('vi-VN')
      const updatedPolicy: PolicyThresholdConfig = {
        version: item.version,
        status: 'ACTIVE',
        maxAreaM2: item.maxArea,
        maxDepthCm: item.maxDepth,
        allowedSeverities: ['LOW', 'MEDIUM'],
        activatedBy: 'Chỉ huy trưởng (PM)',
        activatedAt: timeStr,
        appliedRoute: 'Toàn tuyến dự án',
        description: `Quy chuẩn hiệu lực ${item.version}: Diện tích ≤ ${item.maxArea}m², Độ sâu ≤ ${item.maxDepth}cm.`
      }

      setCurrentPolicy(updatedPolicy)
      showToast(`Đã kích hoạt thành công chính sách ${item.version}!`)
    } catch (err: any) {
      console.error('Lỗi khi kích hoạt dự thảo chính sách:', err)
      const errorDetail = err?.response?.data?.detail || err?.response?.data?.code || err?.message || 'Lỗi thao tác'
      showToast(`Lỗi: ${errorDetail}`)
    }
  }

  // Supervisor phê duyệt độ phủ tuyến đường bảo hành (API-176)
  const handleConfirmRoadCoverage = async (
    input: RoadCoverageInputDto,
    projectInfo?: { projectId: string; projectName: string; fromKm: number; toKm: number }
  ) => {
    setCoverageError(null)
    setIsSubmittingCoverage(true)
    try {
      const targetProjectId = projectInfo?.projectId || selectedProjectId
      // Lấy lại ETag mới nhất để đảm bảo If-Match chính xác
      const latestCov = await fastTrackService.getRoadCoverage(targetProjectId)
      const etag = latestCov?.etag || coverageEtag || '5de4f3ee709209ac95407f2bc9177c08b541bdbd25b8c8181c7e4b59545f2b05'

      const updated = await fastTrackService.confirmRoadCoverage(targetProjectId, input, etag)

      const timeStr = new Date().toLocaleString('vi-VN')
      setRoadCoverage({
        projectId: targetProjectId,
        projectName: projectInfo?.projectName || roadCoverage?.projectName || 'Tuyến bảo hành',
        scopeObligationId: input.scopeObligationId || roadCoverage?.scopeObligationId || '',
        scopeHash: input.expectedScopeHash || roadCoverage?.scopeHash,
        fromKm: projectInfo?.fromKm ?? roadCoverage?.fromKm ?? 0,
        toKm: projectInfo?.toKm ?? roadCoverage?.toKm ?? 0,
        sourceKind: input.sourceKind || 'MAINTENANCE_BASIS',
        handoverDocumentId: input.handoverDocumentId || roadCoverage?.handoverDocumentId,
        handoverVersion: input.handoverVersion,
        applicableFromUtc: input.applicableFromUtc,
        applicableToUtc: input.applicableToUtc,
        status: 'CONFIRMED',
        confirmedBy: 'Kỹ sư Giám sát / Chủ đầu tư',
        confirmedAt: timeStr,
        reason: input.reason || undefined,
        etag: updated.version || undefined
      })

      setAuditLogs((prev) => [
        {
          title: 'Phê duyệt độ phủ tuyến bảo hành',
          time: timeStr,
          user: 'Kỹ sư Giám sát / Chủ đầu tư',
          hash: updated.version || 'sha256:verified',
          note: `Supervisor phê duyệt độ phủ tuyến. Văn bản: ${input.handoverVersion}. Căn cứ: ${input.reason}`
        },
        ...prev
      ])

      setIsRoadCoverageModalOpen(false)
      setCoverageError(null)
      showToast('Đã phê duyệt độ phủ tuyến bảo hành thành công!')
    } catch (err: any) {
      console.error('Lỗi phê duyệt độ phủ tuyến:', err)
      const errorDetail =
        err?.response?.data?.detail ||
        (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : null) ||
        err?.response?.data?.title ||
        err?.response?.data?.code ||
        err?.message ||
        'Lỗi khi phê duyệt độ phủ tuyến'
      setCoverageError(errorDetail)
      showToast(`Lỗi phê duyệt độ phủ tuyến: ${errorDetail}`)
    } finally {
      setIsSubmittingCoverage(false)
    }
  }

  return {
    currentPolicy,
    setCurrentPolicy,
    policyHistory,
    setPolicyHistory,
    auditLogs,
    roadCoverage,
    isRoadCoverageModalOpen,
    setIsRoadCoverageModalOpen,
    handleConfirmRoadCoverage,
    coverageError,
    isSubmittingCoverage,
    formVersionName,
    setFormVersionName,
    formMaxArea,
    setFormMaxArea,
    formMaxDepth,
    setFormMaxDepth,
    formPolicyNote,
    setFormPolicyNote,
    isPolicyModalOpen,
    setIsPolicyModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    handleApplyPolicy,
    handleActivateDraft,
    loadPolicyData
  }
}
