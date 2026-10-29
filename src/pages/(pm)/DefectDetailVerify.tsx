import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import {
  surveyService,
  BackendDefectDto,
  CandidateMatchItemDto,
  formatDefectTypeLabel,
  getAiCandidateOverrides
} from '../../api/services/surveyService'
import { projectService } from '../../api/services/projectService'
import { triageService } from '../../api/services/triageService'
import { DefectStatus, Severity, DefectType, RoleCode } from '../../types/enums'
import { Defect } from '../../types/domain'
import { useAuthStore } from '../../store/authStore'
import { AIDetectionItem } from './drone-review/types'
import { Icon } from '../../components/ui/Icon'
import { DefectVerifyHeader } from './defect-verify/DefectVerifyHeader'
import { DefectBoundingBoxViewer, BoundingBoxCoords } from './defect-verify/DefectBoundingBoxViewer'
import { DefectTemporalComparison } from './defect-verify/DefectTemporalComparison'
import { DefectGisMapViewer } from './defect-verify/DefectGisMapViewer'
import { DefectVerifyForm } from './defect-verify/DefectVerifyForm'

const STANDARD_DEFECT_CODES = new Set<string>([
  DefectType.LONGITUDINAL_CRACK,
  DefectType.POTHOLE,
  DefectType.TRANSVERSE_CRACK,
  DefectType.ALLIGATOR_CRACK,
  DefectType.RUTTING,
  DefectType.RAVELING
])

function resolveDomainDefectType(rawCode?: string | null): DefectType {
  const upper = (rawCode || '').toUpperCase()
  if (upper === 'POTHOLE') return DefectType.POTHOLE
  if (upper === 'TRANSVERSE_CRACK') return DefectType.TRANSVERSE_CRACK
  if (upper === 'ALLIGATOR_CRACK') return DefectType.ALLIGATOR_CRACK
  if (upper === 'RUTTING') return DefectType.RUTTING
  if (upper === 'RAVELING') return DefectType.RAVELING
  return DefectType.LONGITUDINAL_CRACK
}

function mapDetectionToDefect(
  item: AIDetectionItem,
  projectId: string,
  projectName: string,
  companionRunItem?: AIDetectionItem | null
): Defect {
  const bboxX = item.rawBbox?.x ?? (parseFloat(item.bbox?.left || '20%') / 100 || 0.2)
  const bboxY = item.rawBbox?.y ?? (parseFloat(item.bbox?.top || '20%') / 100 || 0.2)
  const bboxW = item.rawBbox?.width ?? (parseFloat(item.bbox?.width || '30%') / 100 || 0.3)
  const bboxH = item.rawBbox?.height ?? (parseFloat(item.bbox?.height || '25%') / 100 || 0.25)

  let status = DefectStatus.OPEN
  if (item.status === 'APPROVED') status = DefectStatus.VERIFIED
  if (item.status === 'REJECTED') status = DefectStatus.REJECTED

  let severity = Severity.HIGH
  const sev = (item.severityLevel || '').toUpperCase()
  if (sev.includes('CRITICAL') || sev.includes('L3') || sev.includes('KHẨN CẤP')) {
    severity = Severity.CRITICAL
  } else if (sev.includes('HIGH') || sev.includes('L2') || sev.includes('CẦN XỬ LÝ') || sev.includes('NGHIÊM TRỌNG')) {
    severity = Severity.HIGH
  } else if (sev.includes('LOW') || sev.includes('L1') || sev.includes('NHẸ')) {
    severity = Severity.LOW
  } else if (sev.includes('MEDIUM') || sev.includes('TRUNG BÌNH')) {
    severity = Severity.MEDIUM
  }

  const defectType = resolveDomainDefectType(item.rawTypeCode)
  const kmVal = typeof item.kmValue === 'number' ? item.kmValue : 0.351

  let prevBbox = undefined
  if (companionRunItem) {
    prevBbox = companionRunItem.rawBbox || {
      x: parseFloat(companionRunItem.bbox?.left || '20%') / 100 || 0.2,
      y: parseFloat(companionRunItem.bbox?.top || '20%') / 100 || 0.2,
      width: parseFloat(companionRunItem.bbox?.width || '30%') / 100 || 0.3,
      height: parseFloat(companionRunItem.bbox?.height || '25%') / 100 || 0.25
    }
  }

  return {
    id: item.id,
    code: item.code,
    survey_id: item.runId || projectId,
    project_id: projectId,
    project_name: projectName,
    chainage_km: kmVal,
    gps_lat: parseFloat((16.0582 + kmVal * 0.004).toFixed(5)),
    gps_lng: parseFloat((108.2045 + kmVal * 0.004).toFixed(5)),
    defect_type: defectType,
    severity,
    confidence_score: (item.confidence || 80) / 100,
    status,
    image_url: '',
    previous_epoch_image_url: undefined,
    previous_epoch_frame_id: companionRunItem?.frameFileId,
    previous_epoch_bbox: prevBbox,
    previous_epoch_label: companionRunItem
      ? `Kỳ khảo sát trước (${companionRunItem.fixtureVersion || 'Road-YOLOv9'} • ${companionRunItem.type} ${companionRunItem.confidence}%)`
      : undefined,
    current_epoch_label: `Kỳ khảo sát hiện tại (${item.fixtureVersion || 'Road-YOLOv9'} • ${item.type} ${item.confidence}%)`,
    bounding_box: {
      x: bboxX,
      y: bboxY,
      width: bboxW,
      height: bboxH
    },
    created_at: new Date().toISOString().slice(0, 10),
    source_kind: 'AI_DETECTION',
    run_id: item.runId,
    fixture_version: item.fixtureVersion,
    frame_file_id: item.frameFileId,
    timestamp_ms: item.timestampMs,
    source_version: item.sourceVersion,
    geometry_version: item.geometryVersion,
    route_version_id: item.routeVersionId,
    disposition_id: item.disposition?.decisionId || null,
    disposition_version: item.disposition?.version || null,
    decision_kind: item.decisionKind,
    linked_defect_id: item.decisionKind === 'LINK_EXISTING' ? item.defectId : null
  }
}

function mapBackendDefectDtoToDomain(
  dto: BackendDefectDto,
  projectId: string,
  projectName: string
): Defect {
  const sevMap: Record<string, Severity> = {
    CRITICAL: Severity.CRITICAL,
    HIGH: Severity.HIGH,
    MEDIUM: Severity.MEDIUM,
    LOW: Severity.LOW
  }
  const status =
    dto.status === 'VERIFIED'
      ? DefectStatus.VERIFIED
      : dto.status === 'REJECTED'
      ? DefectStatus.REJECTED
      : DefectStatus.OPEN

  const overrides = getAiCandidateOverrides()
  const ov = overrides[dto.id] || overrides[dto.id.toLowerCase()]

  return {
    id: dto.id,
    code: `#DEF-${dto.id.slice(0, 8).toUpperCase()}`,
    survey_id: projectId,
    project_id: projectId,
    project_name: projectName,
    chainage_km: 0.351,
    gps_lat: 16.0582,
    gps_lng: 108.2045,
    defect_type: resolveDomainDefectType(ov?.rawTypeCode || dto.defectTypeCode),
    severity: sevMap[dto.severity || 'HIGH'] || Severity.HIGH,
    confidence_score: 1.0,
    status,
    image_url: '',
    bounding_box: ov?.bbox || { x: 0.25, y: 0.25, width: 0.35, height: 0.28 },
    created_at: new Date().toISOString().slice(0, 10),
    source_kind: 'DEFECT',
    route_version_id: dto.roadSectionVersionId,
    version: dto.version,
    verification_status: dto.status,
    lifecycle_status: dto.status
  }
}

export const DefectDetailVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'
  const fallbackReturnUrl = isSupervisor ? '/sup/ai-inbox' : '/pm/ai-inbox'
  const returnUrl = (location.state as any)?.from || fallbackReturnUrl

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSavingBbox, setIsSavingBbox] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [allDetections, setAllDetections] = useState<
    Array<{ item: AIDetectionItem; projectId: string; projectName: string }>
  >([])
  const [allDefects, setAllDefects] = useState<
    Array<{ dto: BackendDefectDto; projectId: string; projectName: string }>
  >([])
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatchItemDto[]>([])

  const [customDefectType, setCustomDefectType] = useState<DefectType | string | null>(null)
  const [customTypeText, setCustomTypeText] = useState<string>('')
  const [liveBbox, setLiveBbox] = useState<BoundingBoxCoords | undefined>(undefined)
  const [isBboxModified, setIsBboxModified] = useState<boolean>(false)
  const [severity, setSeverity] = useState<Severity>(Severity.HIGH)
  const [notes, setNotes] = useState('Đã kiểm tra đối chiếu khung nhận diện AI và tọa độ trên CSDL.')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isRecurrent, setIsRecurrent] = useState(false)
  const [linkedPriorCode, setLinkedPriorCode] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadBackendData = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsLoading(true)
    setApiError(null)
    try {
      let projects = projectService.getProjects()
      if (!projects || projects.length === 0) {
        projects = await projectService.fetchProjects()
      }

      const scopedProjects = isSupervisor
        ? projects
        : projects.filter((p) => {
            if (!user) return true
            const uEmail = (user.email || '').toLowerCase()
            const pmEmail = (p.pm_email || '').toLowerCase()
            const pmName = (p.pm_name || '').toLowerCase()
            if (user.id && p.pm_user_id && user.id === p.pm_user_id) return true
            if (uEmail && pmEmail && uEmail === pmEmail) return true
            if (uEmail.includes('pm-a') && (pmEmail.includes('pm-a') || pmName.includes('pm-a'))) return true
            if (uEmail.includes('pm-b') && (pmEmail.includes('pm-b') || pmName.includes('pm-b'))) return true
            return false
          })

      const targetProjects = scopedProjects.length > 0 ? scopedProjects : projects

      const detEntries: Array<{ item: AIDetectionItem; projectId: string; projectName: string }> = []
      const defEntries: Array<{ dto: BackendDefectDto; projectId: string; projectName: string }> = []

      for (const proj of targetProjects) {
        try {
          const dets = await surveyService.getAllProjectAiDetections(proj.id)
          for (const d of dets) {
            detEntries.push({ item: d, projectId: proj.id, projectName: proj.name })
          }
        } catch (err) {
          console.warn(`Không thể tải AI detections của dự án ${proj.id}:`, err)
        }

        try {
          const defs = await surveyService.getProjectDefects(proj.id)
          for (const df of defs) {
            defEntries.push({ dto: df, projectId: proj.id, projectName: proj.name })
          }
        } catch (err) {
          console.warn(`Không thể tải Defects của dự án ${proj.id}:`, err)
        }
      }

      const rawTargetId = (id || '').toLowerCase()
      const isDirectDet = detEntries.some((e) => e.item.id.toLowerCase() === rawTargetId)
      const isDirectDef = defEntries.some((e) => e.dto.id.toLowerCase() === rawTargetId)

      if (rawTargetId && !isDirectDet && !isDirectDef && /^[0-9a-f-]{36}$/i.test(rawTargetId)) {
        try {
          const caseDetail = await triageService.getCaseById(rawTargetId)
          if (caseDetail && caseDetail.project_id) {
            const pDefs = await surveyService.getProjectDefects(caseDetail.project_id)
            for (const df of pDefs) {
              if (!defEntries.some((x) => x.dto.id === df.id)) {
                defEntries.push({
                  dto: df,
                  projectId: caseDetail.project_id,
                  projectName: caseDetail.project_name
                })
              }
            }
          }
        } catch {}
      }

      setAllDetections(detEntries)
      setAllDefects(defEntries)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Không thể tải dữ liệu khiếm khuyết từ CSDL Backend.'
      setApiError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [id, isSupervisor, user])

  useEffect(() => {
    loadBackendData()
  }, [loadBackendData])

  const targetId = (id || '').toLowerCase()

  const activeRecord = useMemo(() => {
    const matchedDet = allDetections.find(
      (d) => d.item.id.toLowerCase() === targetId || d.item.code.toLowerCase() === targetId
    )
    if (matchedDet) {
      const companion = allDetections.find(
        (other) =>
          other.projectId === matchedDet.projectId &&
          other.item.id !== matchedDet.item.id &&
          other.item.runId !== matchedDet.item.runId
      )
      return {
        kind: 'AI_DETECTION' as const,
        rawTypeCode: matchedDet.item.rawTypeCode,
        defect: mapDetectionToDefect(
          matchedDet.item,
          matchedDet.projectId,
          matchedDet.projectName,
          companion?.item || null
        )
      }
    }

    const matchedDef = allDefects.find((d) => d.dto.id.toLowerCase() === targetId)
    if (matchedDef) {
      return {
        kind: 'DEFECT' as const,
        rawTypeCode: matchedDef.dto.defectTypeCode,
        defect: mapBackendDefectDtoToDomain(matchedDef.dto, matchedDef.projectId, matchedDef.projectName)
      }
    }

    if (allDetections.length > 0) {
      const first = allDetections[0]
      const companion = allDetections.find(
        (other) =>
          other.projectId === first.projectId &&
          other.item.id !== first.item.id &&
          other.item.runId !== first.item.runId
      )
      return {
        kind: 'AI_DETECTION' as const,
        rawTypeCode: first.item.rawTypeCode,
        defect: mapDetectionToDefect(first.item, first.projectId, first.projectName, companion?.item || null)
      }
    }

    if (allDefects.length > 0) {
      const firstDef = allDefects[0]
      return {
        kind: 'DEFECT' as const,
        rawTypeCode: firstDef.dto.defectTypeCode,
        defect: mapBackendDefectDtoToDomain(firstDef.dto, firstDef.projectId, firstDef.projectName)
      }
    }

    return null
  }, [allDetections, allDefects, targetId])

  const defect = useMemo(() => {
    if (!activeRecord) return null
    const copy = { ...activeRecord.defect }
    if (customDefectType && STANDARD_DEFECT_CODES.has(customDefectType)) {
      copy.defect_type = customDefectType as DefectType
    }
    // Không gán URL trực tiếp để tránh trình duyệt tự gọi GET /files/{id}/content không có Bearer token
    copy.image_url = ''
    copy.previous_epoch_image_url = undefined
    return copy
  }, [activeRecord, customDefectType])

  const [resolvedImageUrl, setResolvedImageUrl] = useState<string>('')
  const [resolvedPrevImageUrl, setResolvedPrevImageUrl] = useState<string>('')

  // Tải nội dung ảnh an toàn qua Bearer Token / Blob URL để tránh lỗi 401 Unauthorized
  useEffect(() => {
    let isMounted = true

    const currentFrameId = activeRecord?.defect?.frame_file_id
    if (currentFrameId) {
      surveyService.getFileContentUrl(currentFrameId).then((url) => {
        if (isMounted && url) {
          setResolvedImageUrl(url)
        }
      })
    } else {
      setResolvedImageUrl('')
    }

    const prevFrameId = (activeRecord?.defect as any)?.previous_epoch_frame_id
    if (prevFrameId) {
      surveyService.getFileContentUrl(prevFrameId).then((url) => {
        if (isMounted && url) {
          setResolvedPrevImageUrl(url)
        }
      })
    } else {
      setResolvedPrevImageUrl('')
    }

    return () => {
      isMounted = false
    }
  }, [activeRecord?.defect?.frame_file_id, (activeRecord?.defect as any)?.previous_epoch_frame_id])

  const defectWithAuthImage = useMemo(() => {
    if (!defect) return null
    return {
      ...defect,
      image_url: resolvedImageUrl || '',
      previous_epoch_image_url: resolvedPrevImageUrl || undefined
    }
  }, [defect, resolvedImageUrl, resolvedPrevImageUrl])

  useEffect(() => {
    if (!defect || defect.source_kind !== 'AI_DETECTION') {
      setCandidateMatches([])
      return
    }
    let isMounted = true
    surveyService
      .getCandidateMatches(defect.project_id, 'AI_DETECTION', defect.id)
      .then((page) => {
        if (isMounted) {
          setCandidateMatches(page.items || [])
        }
      })
      .catch((err) => {
        console.warn('Không thể tải candidate matches:', err)
      })
    return () => {
      isMounted = false
    }
  }, [defect?.id, defect?.project_id, defect?.source_kind])

  useEffect(() => {
    if (defect) {
      setSeverity(defect.severity)
      setLiveBbox(defect.bounding_box)
      setIsBboxModified(false)

      const overrides = getAiCandidateOverrides()
      const ov = overrides[defect.id] || overrides[defect.id.toLowerCase()]
      if (ov?.customTypeLabel) {
        setCustomDefectType('CUSTOM')
        setCustomTypeText(ov.customTypeLabel)
      } else if (ov?.rawTypeCode && STANDARD_DEFECT_CODES.has(ov.rawTypeCode)) {
        setCustomDefectType(ov.rawTypeCode)
        setCustomTypeText('')
      } else {
        setCustomDefectType(null)
        setCustomTypeText('')
      }

      setIsRecurrent(defect.decision_kind === 'LINK_EXISTING')
      setLinkedPriorCode(
        defect.decision_kind === 'LINK_EXISTING' && defect.linked_defect_id
          ? `#DEF-${defect.linked_defect_id.slice(0, 8).toUpperCase()}`
          : null
      )
    }
  }, [defect?.id, defect?.decision_kind, defect?.disposition_id, defect?.linked_defect_id])

  const projectExistingDefects = useMemo(() => {
    if (!defect) return []
    return allDefects.filter((d) => d.projectId === defect.project_id).map((d) => d.dto)
  }, [allDefects, defect])

  const availableItems = useMemo(() => {
    const decisionViMap: Record<string, string> = {
      KEEP_NEW: 'Chấp nhận',
      LINK_EXISTING: 'Đã gom lỗi cũ',
      REJECT: 'Báo sai'
    }
    const statusViMap: Record<string, string> = {
      VERIFIED: 'Đã xác minh',
      REJECTED: 'Báo sai',
      OPEN: 'Chờ xử lý'
    }
    const aiOpts = allDetections.map((d) => ({
      id: d.item.id,
      label: `${d.item.code} (${d.projectName} • ${d.item.type} ${d.item.confidence}%${
        d.item.decisionKind ? ` [${decisionViMap[d.item.decisionKind] || d.item.decisionKind}]` : ' [Chờ duyệt]'
      })`
    }))
    const defOpts = allDefects.map((d) => ({
      id: d.dto.id,
      label: `#DEF-${d.dto.id.slice(0, 8).toUpperCase()} (${d.projectName} • ${formatDefectTypeLabel(d.dto.defectTypeCode)} [${statusViMap[d.dto.status || ''] || d.dto.status}])`
    }))
    return [...aiOpts, ...defOpts]
  }, [allDetections, allDefects])

  const isTemporalRoute = location.pathname.includes('/verify-b')
  const [viewMode, setViewMode] = useState<'SINGLE' | 'TEMPORAL' | 'GIS_MAP'>(
    isTemporalRoute ? 'TEMPORAL' : 'SINGLE'
  )

  useEffect(() => {
    if (location.pathname.includes('/verify-b')) {
      setViewMode('TEMPORAL')
    } else if (location.pathname.includes('/verify-a')) {
      setViewMode('SINGLE')
    }
  }, [location.pathname])

  const handleSaveBbox = async (bboxToSave?: BoundingBoxCoords) => {
    if (!defect) return
    const targetBbox = bboxToSave || liveBbox || defect.bounding_box
    setIsSavingBbox(true)
    try {
      await surveyService.saveAiCandidateOverride(defect.id, {
        bbox: targetBbox
      })
      setLiveBbox(targetBbox)
      setIsBboxModified(false)
      showToast(
        `✅ Đã lưu tọa độ khung nhận diện (${targetBbox.x.toFixed(2)}, ${targetBbox.y.toFixed(2)}, ${targetBbox.width.toFixed(2)}, ${targetBbox.height.toFixed(2)}) vào CSDL!`
      )
      await loadBackendData()
    } catch (err: any) {
      showToast(`❌ Không thể lưu tọa độ khung nhận diện: ${err?.message || 'Lỗi kết nối'}`)
    } finally {
      setIsSavingBbox(false)
    }
  }

  const handleVerify = async (newStatus: DefectStatus) => {
    if (!defect) return
    if (!notes.trim()) {
      showToast('Vui lòng nhập ý kiến / lý do thẩm định trước khi bấm Chấp nhận hoặc Báo sai!')
      return
    }

    const effectiveType = customDefectType || defect.defect_type
    const isCustom = effectiveType === 'CUSTOM'
    if (isCustom && !customTypeText.trim()) {
      showToast('Vui lòng nhập tên loại khiếm khuyết!')
      return
    }

    let resolvedTypeCode = String(effectiveType)
    let resolvedCustomLabel: string | undefined = undefined

    if (isCustom) {
      const slug = customTypeText
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 28)
      resolvedTypeCode = slug ? `CUSTOM_${slug}` : 'CUSTOM_DEFECT'
      resolvedCustomLabel = customTypeText.trim()
    } else if (effectiveType === DefectType.LONGITUDINAL_CRACK && !customDefectType) {
      resolvedTypeCode = 'CRACK'
    }

    setIsSubmitting(true)
    setApiError(null)

    try {
      // Nếu PM có chỉnh khung nhận diện trên ảnh và bấm Chấp nhận, tự động lưu tọa độ khung mới vào CSDL cùng lúc
      if (newStatus === DefectStatus.VERIFIED && isBboxModified && liveBbox) {
        await surveyService.saveAiCandidateOverride(defect.id, {
          bbox: liveBbox,
          rawTypeCode: resolvedTypeCode,
          customTypeLabel: resolvedCustomLabel
        })
        setIsBboxModified(false)
      }

      if (defect.source_kind === 'DEFECT') {
        const evidenceIds = await surveyService.resolveDefectEvidenceIds(defect.project_id, defect.id)

        await surveyService.assessDefect(defect.project_id, defect.id, {
          defectTypeCode: resolvedTypeCode,
          customTypeLabel: resolvedCustomLabel,
          severity: severity as any,
          reason: notes.trim(),
          evidenceIds
        })

        await surveyService.verifyDefect(defect.project_id, defect.id, {
          decision: newStatus === DefectStatus.VERIFIED ? 'CONFIRM' : 'REJECT',
          verificationMethod: 'EXISTING_EVIDENCE',
          reason: notes.trim(),
          evidenceIds
        })

        showToast(
          `✅ Đã lưu quyết định (${newStatus === DefectStatus.VERIFIED ? 'Chấp nhận' : 'Báo sai'}) cho [${defect.code}] vào CSDL!`
        )
        await loadBackendData()
      } else {
        const decisionRes = await surveyService.decideCandidate(defect.project_id, {
          sourceKind: 'AI_DETECTION',
          sourceId: defect.id,
          decision: newStatus === DefectStatus.VERIFIED ? 'KEEP_NEW' : 'REJECT',
          defectTypeCode: resolvedTypeCode,
          customTypeLabel: resolvedCustomLabel,
          severity: severity as any,
          reason: notes.trim()
        })

        const isVerify = newStatus === DefectStatus.VERIFIED
        const targetDecisionKind = isVerify ? 'KEEP_NEW' : 'REJECT'
        setAllDetections((prev) =>
          prev.map((entry) => {
            if (
              entry.item.id.toLowerCase() === defect.id.toLowerCase() ||
              entry.item.code.toLowerCase() === defect.code.toLowerCase()
            ) {
              return {
                ...entry,
                item: {
                  ...entry.item,
                  status: isVerify ? 'APPROVED' : 'REJECTED',
                  decisionKind: targetDecisionKind,
                  defectId: decisionRes.defectId || null
                }
              }
            }
            return entry
          })
        )

        const newDefCode = decisionRes.defectId
          ? `#DEF-${decisionRes.defectId.slice(0, 8).toUpperCase()}`
          : defect.code

        const msg =
          newStatus === DefectStatus.VERIFIED
            ? `✅ Đã lưu quyết định Chấp nhận! Tạo hồ sơ khiếm khuyết [${newDefCode}] từ [${defect.code}].`
            : `✅ Đã lưu quyết định Báo sai cho [${defect.code}].`
        showToast(msg)
        await loadBackendData(true)
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Lỗi khi lưu quyết định thẩm định lên CSDL Backend.'
      setApiError(errMsg)
      showToast(`❌ Lỗi Backend: ${errMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetDecision = async () => {
    if (!defect || defect.source_kind !== 'AI_DETECTION') return
    const isUnlink = defect.decision_kind === 'LINK_EXISTING'
    setIsSubmitting(true)
    setApiError(null)

    // 1. Phản hồi giao diện tức thì 0ms (Optimistic Update)
    setAllDetections((prev) =>
      prev.map((entry) => {
        if (
          entry.item.id.toLowerCase() === defect.id.toLowerCase() ||
          entry.item.code.toLowerCase() === defect.code.toLowerCase()
        ) {
          return {
            ...entry,
            item: {
              ...entry.item,
              status: 'PENDING',
              decisionKind: null,
              defectId: null,
              disposition: null
            }
          }
        }
        return entry
      })
    )
    setIsRecurrent(false)
    setLinkedPriorCode(null)
    showToast(
      isUnlink
        ? `✅ Đã tách ra thành công! Ứng viên AI [${defect.code}] đã trở lại trạng thái Chờ duyệt.`
        : `✅ Đã mở lại thành công! Ứng viên AI [${defect.code}] đã trở lại trạng thái Chờ duyệt.`
    )

    try {
      await surveyService.resetSurveyDetection(defect.id)
      await loadBackendData(true)
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Không thể mở lại trạng thái Chờ duyệt trên CSDL.'
      setApiError(errMsg)
      showToast(`❌ Lỗi Backend: ${errMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLinkRecurrence = async (
    targetDefectId: string,
    targetVersion: string,
    notesText: string
  ) => {
    if (!defect) return
    setIsSubmitting(true)
    setApiError(null)

    // 1. Phản hồi giao diện tức thì 0ms (Optimistic Update)
    setAllDetections((prev) =>
      prev.map((entry) => {
        if (
          entry.item.id.toLowerCase() === defect.id.toLowerCase() ||
          entry.item.code.toLowerCase() === defect.code.toLowerCase()
        ) {
          return {
            ...entry,
            item: {
              ...entry.item,
              status: 'APPROVED',
              decisionKind: 'LINK_EXISTING',
              defectId: targetDefectId
            }
          }
        }
        return entry
      })
    )
    setIsRecurrent(true)
    setLinkedPriorCode(`#DEF-${targetDefectId.slice(0, 8).toUpperCase()}`)
    const auditNote = `[Gom vào hồ sơ cũ] Đã liên kết vào khiếm khuyết #DEF-${targetDefectId.slice(0, 8).toUpperCase()}. ${notesText}`
    setNotes((prev) => (prev ? `${prev}\n${auditNote}` : auditNote))
    showToast(
      `✅ Đã gom [${defect.code}] vào hồ sơ khiếm khuyết [#DEF-${targetDefectId.slice(0, 8).toUpperCase()}] trên CSDL!`
    )

    try {
      await surveyService.decideCandidate(defect.project_id, {
        sourceKind: 'AI_DETECTION',
        sourceId: defect.id,
        decision: 'LINK_EXISTING',
        targetDefectId,
        targetVersion,
        reason: notesText.trim() || `Gom ứng viên AI vào hồ sơ khiếm khuyết hiện hữu ${targetDefectId}`
      })
      await loadBackendData(true)
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Lỗi khi gom vào khiếm khuyết hiện hữu trên CSDL Backend.'
      setApiError(errMsg)
      showToast(`❌ Lỗi Backend: ${errMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#C9A227] border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-800">
          Đang tải dữ liệu ứng viên AI &amp; khiếm khuyết từ CSDL...
        </p>
      </div>
    )
  }

  if (!defect) {
    return (
      <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Icon name="error" size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            Không có dữ liệu khiếm khuyết trong CSDL
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {apiError || 'Không tìm thấy bản ghi ứng viên AI hoặc Defect tương ứng trong CSDL Backend.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(returnUrl)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    )
  }

  const effectiveCustomLabel =
    customDefectType === 'CUSTOM' ? customTypeText.trim() || 'Loại lỗi tự nhập' : undefined

  return (
    <div className="space-y-6">
      {/* Error Banner minh bạch nếu API trả lỗi */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Icon name="error" size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Thông báo lỗi từ CSDL Backend</div>
              <div className="mt-0.5 text-rose-800">{apiError}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="text-rose-500 hover:text-rose-800 cursor-pointer"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. Header & Switcher */}
      <DefectVerifyHeader
        defect={defect}
        severity={severity}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={() => navigate(returnUrl)}
        availableItems={availableItems}
        basePath={basePath}
        isRecurrent={isRecurrent}
        linkedPriorCode={linkedPriorCode}
      />

      {/* 2. Main Grid: Left is Photo Viewer / GIS Map, Right is Verification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {viewMode === 'GIS_MAP' && <DefectGisMapViewer defect={defectWithAuthImage || defect} severity={severity} />}

            {viewMode === 'SINGLE' && (
              <DefectBoundingBoxViewer
                defect={defectWithAuthImage || defect}
                currentType={customDefectType || defect.defect_type}
                customTypeLabel={effectiveCustomLabel}
                onBboxChange={(newBbox) => {
                  setLiveBbox(newBbox)
                  setIsBboxModified(true)
                }}
                onSaveBbox={!isSupervisor ? (newBbox) => handleSaveBbox(newBbox) : undefined}
                isSavingBbox={isSavingBbox}
              />
            )}

            {viewMode === 'TEMPORAL' && <DefectTemporalComparison defect={defectWithAuthImage || defect} />}
          </Card>
        </div>

        <div className="space-y-4">
          <DefectVerifyForm
            defect={defect}
            currentType={customDefectType || defect.defect_type}
            onTypeChange={(newType) => setCustomDefectType(newType)}
            customTypeText={customTypeText}
            onCustomTypeTextChange={setCustomTypeText}
            liveBbox={liveBbox}
            isBboxModified={isBboxModified}
            onSaveBbox={!isSupervisor ? () => handleSaveBbox() : undefined}
            isSavingBbox={isSavingBbox}
            severity={severity}
            setSeverity={setSeverity}
            notes={notes}
            setNotes={setNotes}
            onVerify={handleVerify}
            onResetDecision={defect.source_kind === 'AI_DETECTION' ? handleResetDecision : undefined}
            onLinkRecurrence={handleLinkRecurrence}
            existingDefects={projectExistingDefects}
            candidateMatches={candidateMatches}
            isSubmitting={isSubmitting}
            isSupervisor={isSupervisor}
          />
        </div>
      </div>

      {/* In-app Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default DefectDetailVerify
