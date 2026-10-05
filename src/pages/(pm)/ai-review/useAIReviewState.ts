import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { mockTriageCases, mockProjects } from '../../../data/mockData'
import { TriageCase, ViewSourceMode, ActiveTabFilter } from './types'
import { initReviewGisModalMap, initReviewDrawerMap } from './reviewMapSetup'

const TRIAGE_STORAGE_KEY = 'roadguard_triage_cases_v2'

export const useAIReviewState = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const sourceParam = searchParams.get('source')

  // Dữ liệu hồ sơ tiếp nhận từ Single Source of Truth + Đồng bộ LocalStorage
  const [cases, setCases] = useState<TriageCase[]>(() => {
    try {
      const saved = localStorage.getItem(TRIAGE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (err) {
      console.error('Failed to load triage cases from storage', err)
    }
    return mockTriageCases
  })

  // Tự động lưu LocalStorage khi dữ liệu cases thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(TRIAGE_STORAGE_KEY, JSON.stringify(cases))
    } catch (err) {
      console.error('Failed to save triage cases to storage', err)
    }
  }, [cases])

  // Reset dữ liệu mẫu
  const handleResetTriageData = () => {
    setCases(mockTriageCases)
    try {
      localStorage.removeItem(TRIAGE_STORAGE_KEY)
    } catch {}
    setSelectedReportIds([])
    showToast('Đã đặt lại dữ liệu phản ánh & triage về mặc định ban đầu!')
  }

  // Chế độ xem: Bảng tiếp nhận & điều phối phản ánh dân (PA03, PA04) vs Hộp thư Drone AI
  const [viewSourceMode, setViewSourceMode] = useState<ViewSourceMode>(() => {
    if (sourceParam === 'drone') return 'DRONE_AI'
    if (sourceParam === 'all') return 'ALL'
    return 'CITIZEN_TRIAGE'
  })

  useEffect(() => {
    if (sourceParam === 'drone') setViewSourceMode('DRONE_AI')
    else if (sourceParam === 'citizen') setViewSourceMode('CITIZEN_TRIAGE')
    else if (sourceParam === 'all') setViewSourceMode('ALL')
  }, [sourceParam])

  const handleSetViewSourceMode = (mode: ViewSourceMode) => {
    setViewSourceMode(mode)
    if (mode === 'DRONE_AI') setSearchParams({ source: 'drone' })
    else if (mode === 'CITIZEN_TRIAGE') setSearchParams({ source: 'citizen' })
    else setSearchParams({ source: 'all' })
  }

  // Thu gọn / Mở rộng nhóm báo cáo trùng (Accordion)
  const [expandedMasterIds, setExpandedMasterIds] = useState<string[]>(['cas-05'])
  const [collapseMergedRows, setCollapseMergedRows] = useState<boolean>(true)

  const handleToggleExpandMaster = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedMasterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Multi-select cho bảng tiếp nhận phản ánh người dân (Link Reports)
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])

  // Modal Liên kết báo trùng (Link Reports - PA04)
  const [isLinkReportsModalOpen, setIsLinkReportsModalOpen] = useState<boolean>(false)
  const [linkMasterCaseId, setLinkMasterCaseId] = useState<string>('')
  const [linkAuditNotes, setLinkAuditNotes] = useState<string>('')

  // Modal Điều phối dự án (Triage Case - PA03)
  const [isTriageProjectModalOpen, setIsTriageProjectModalOpen] = useState<boolean>(false)
  const [targetTriageCase, setTargetTriageCase] = useState<TriageCase | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('prj-ql1a-02')

  // Modal Kết luận Không có khiếm khuyết NO_DEFECT (Bắt buộc lý do theo BR-39)
  const [isNoDefectModalOpen, setIsNoDefectModalOpen] = useState<boolean>(false)
  const [noDefectReason, setNoDefectReason] = useState<string>('')

  // Modal Công bố kết quả sửa chữa cho người dân (PA07)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false)
  const [publishPublicNote, setPublishPublicNote] = useState<string>('')

  // Modal Yêu cầu đo đạc bổ sung / Bay drone lại (WF-11 / NEEDS_MEASUREMENT)
  const [isRequestSurveyModalOpen, setIsRequestSurveyModalOpen] = useState<boolean>(false)
  const [surveyMode, setSurveyMode] = useState<'MEASURE_ONLY' | 'DRONE_RESURVEY'>('MEASURE_ONLY')
  const [surveyReason, setSurveyReason] = useState<string>('')
  const [surveyAssignedCrew, setSurveyAssignedCrew] = useState<string>(
    'Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)'
  )
  const [surveySlaHours, setSurveySlaHours] = useState<number>(24)

  // Selected Case for Right Detail Panel
  const [selectedCaseId, setSelectedCaseId] = useState<string>('cas-05')
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)
  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0]
  }, [cases, selectedCaseId])

  // Tabs Filter
  const [activeTab, setActiveTab] = useState<ActiveTabFilter>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [projectFilter, setProjectFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // View Mode for right drawer photo card: 'PHOTO' or 'GIS_MAP'
  const [detailViewMode, setDetailViewMode] = useState<'PHOTO' | 'GIS_MAP'>('PHOTO')
  const [modalMapType, setModalMapType] = useState<'SATELLITE' | 'STREET'>('SATELLITE')

  // Modals state
  const [isGISModalOpen, setIsGISModalOpen] = useState<boolean>(false)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false)
  const [isPhotoZoomModalOpen, setIsPhotoZoomModalOpen] = useState<boolean>(false)

  // Refs for MapLibre map containers
  const modalMapContainerRef = useRef<HTMLDivElement>(null)
  const drawerMapContainerRef = useRef<HTMLDivElement>(null)

  // Effect: Khởi tạo MapLibre trong Modal GIS Preview
  useEffect(() => {
    if (!isGISModalOpen || !modalMapContainerRef.current) return
    const { cleanup } = initReviewGisModalMap(
      modalMapContainerRef.current,
      selectedCase,
      modalMapType === 'SATELLITE'
    )
    return () => cleanup()
  }, [isGISModalOpen, selectedCase, modalMapType])

  // Effect: Khởi tạo MapLibre mini trong panel Drawer khi người dùng bấm tab Bản đồ
  useEffect(() => {
    if (detailViewMode !== 'GIS_MAP' || !drawerMapContainerRef.current) return
    const { cleanup } = initReviewDrawerMap(drawerMapContainerRef.current, selectedCase)
    return () => cleanup()
  }, [detailViewMode, selectedCase])

  // Form states for selected case editing
  const [currentSeverity, setCurrentSeverity] = useState<TriageCase['severity']>(
    selectedCase?.severity || 'CRITICAL'
  )
  const [currentUrgency, setCurrentUrgency] = useState<TriageCase['urgency']>(
    selectedCase?.urgency || 'EMERGENCY'
  )
  const [currentArea, setCurrentArea] = useState<number>(selectedCase?.area_sqm || 1.45)
  const [currentDepth, setCurrentDepth] = useState<number>(selectedCase?.max_depth_cm || 8.5)
  const [currentNotes, setCurrentNotes] = useState<string>(selectedCase?.pm_notes || '')

  // Update form inputs when selectedCase changes
  const handleSelectCase = (c: TriageCase) => {
    setSelectedCaseId(c.id)
    setCurrentSeverity(c.severity)
    setCurrentUrgency(c.urgency)
    setCurrentArea(c.area_sqm)
    setCurrentDepth(c.max_depth_cm)
    setCurrentNotes(c.pm_notes)
    setIsDetailModalOpen(true)
  }

  // Checkbox toggle for duplicate cluster items
  const handleToggleClusterItem = (code: string) => {
    if (!selectedCase?.cluster_duplicates) return
    const updatedDuplicates = selectedCase.cluster_duplicates.map((dup) =>
      dup.code === code ? { ...dup, selected: !dup.selected } : dup
    )
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, cluster_duplicates: updatedDuplicates } : c
      )
    )
  }

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // View Source Mode Filter
      if (viewSourceMode === 'CITIZEN_TRIAGE' && c.source === 'DRONE_AI') return false
      if (viewSourceMode === 'DRONE_AI' && c.source !== 'DRONE_AI') return false

      // Tab filter
      if (activeTab === 'PENDING' && c.status !== 'PENDING') return false
      if (activeTab === 'MERGED' && c.status !== 'MERGED') return false
      if (activeTab === 'NEED_SURVEY' && c.status !== 'NEED_SURVEY') return false
      if (activeTab === 'CRITICAL' && c.severity !== 'CRITICAL') return false

      // Dropdown filters
      if (sourceFilter !== 'ALL' && c.source !== sourceFilter) return false
      if (projectFilter !== 'ALL' && c.project_name !== projectFilter) return false
      if (priorityFilter !== 'ALL' && c.severity !== priorityFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          c.code.toLowerCase().includes(q) ||
          c.defect_title.toLowerCase().includes(q) ||
          c.stationing.toLowerCase().includes(q) ||
          c.project_name.toLowerCase().includes(q) ||
          (c.reporter_name && c.reporter_name.toLowerCase().includes(q)) ||
          (c.reporter_phone && c.reporter_phone.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [cases, viewSourceMode, activeTab, sourceFilter, projectFilter, priorityFilter, searchQuery])

  // Count stats
  const pendingCount = cases.filter((c) => c.status === 'PENDING').length
  const criticalCount = cases.filter((c) => c.severity === 'CRITICAL').length
  const mergedCount = cases.filter((c) => c.status === 'MERGED').length
  const surveyCount = cases.filter((c) => c.status === 'NEED_SURVEY').length

  const citizenCount = cases.filter((c) => c.source === 'CITIZEN' || c.source === 'PATROL').length
  const unassignedCitizenCount = cases.filter(
    (c) => (c.source === 'CITIZEN' || c.source === 'PATROL') && (!c.project_id || c.project_id === '')
  ).length
  const droneAICount = cases.filter((c) => c.source === 'DRONE_AI').length

  // Handlers for Triage Decision Actions
  const handleVerifyDefect = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'VERIFIED',
              status_label: 'Đã xác minh (Verified)',
              conclusion: 'DEFECT_FOUND',
              severity: currentSeverity,
              urgency: currentUrgency,
              area_sqm: currentArea,
              max_depth_cm: currentDepth,
              pm_notes: currentNotes || 'Đã xác minh hư hỏng đạt tiêu chí kích hoạt sửa chữa.'
            }
          : item
      )
    )
    showToast(
      `Đã xác minh hợp lệ hồ sơ [${target.code}]! Đã tạo khiếm khuyết OPEN sẵn sàng đưa vào lệnh sửa chữa (WF-05).`
    )
  }

  const handleRejectDefect = () => {
    handleOpenNoDefectModal(selectedCase)
  }

  // Yêu cầu đo đạc bổ sung / Bay drone lại (WF-11 / NEEDS_MEASUREMENT)
  const handleOpenRequestSurveyModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setSurveyReason('')
    setSurveyMode('MEASURE_ONLY')
    setSurveyAssignedCrew('Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)')
    setSurveySlaHours(24)
    setIsRequestSurveyModalOpen(true)
  }

  const handleConfirmRequestSurvey = () => {
    if (!surveyReason.trim()) {
      showToast('Lỗi WF-11: Bắt buộc nêu rõ lý do kỹ thuật yêu cầu khảo sát / đo đạc lại!')
      return
    }
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    const targetCode = targetTriageCase ? targetTriageCase.code : selectedCase.code
    const nowTime =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString('vi-VN')

    setCases((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              status: 'NEED_SURVEY',
              status_label: 'Cần đo đạc',
              survey_assignment: {
                mode: surveyMode,
                reason: surveyReason,
                assigned_crew: surveyAssignedCrew,
                sla_hours: surveySlaHours,
                created_at: nowTime
              },
              pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[LỆNH ĐO ĐẠC WF-11] Hình thức: ${
                surveyMode === 'MEASURE_ONLY' ? 'Đo đạc hiện trường' : 'Bay quét Drone bổ sung'
              }. Đơn vị: ${surveyAssignedCrew}. Hạn SLA: ${surveySlaHours}h. Lý do: ${surveyReason}`
            }
          : c
      )
    )

    try {
      const existingTasksRaw = localStorage.getItem('roadguard_field_tasks')
      const existingTasks = existingTasksRaw ? JSON.parse(existingTasksRaw) : []
      const newTask = {
        id: `FT-${Date.now()}`,
        code: `TASK-${targetCode}`,
        defectId: targetId,
        defectCode: targetCode,
        title: `Đo đạc bổ sung: ${targetTriageCase?.defect_title || selectedCase.defect_title}`,
        mode: surveyMode,
        stationing: targetTriageCase?.stationing || selectedCase.stationing,
        assignedTo: surveyAssignedCrew,
        reason: surveyReason,
        slaHours: surveySlaHours,
        status: 'ASSIGNED',
        createdAt: nowTime
      }
      localStorage.setItem('roadguard_field_tasks', JSON.stringify([newTask, ...existingTasks]))
    } catch (e) {
      console.warn('Could not save field task to localStorage', e)
    }

    setIsRequestSurveyModalOpen(false)
    showToast(
      `Đã phát lệnh đo đạc [WF-11] cho hồ sơ [${targetCode}]: Giao cho "${surveyAssignedCrew}", hạn SLA ${surveySlaHours}h!`
    )
  }

  // Điều phối chuyển sang Fast Track (WF-05): Tự động truyền hồ sơ đang chọn
  const handleNavigateFastTrack = (c?: TriageCase) => {
    const target = c || selectedCase
    navigate(
      `/pm/fast-track?defectCode=${encodeURIComponent(target.code)}&caseId=${encodeURIComponent(target.id)}`,
      {
        state: { targetDefect: target }
      }
    )
  }

  // Multi-select for Citizen Reports Table
  const handleToggleSelectReport = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAllReports = () => {
    const currentIds = filteredCases.map((c) => c.id)
    if (selectedReportIds.length === currentIds.length) {
      setSelectedReportIds([])
    } else {
      setSelectedReportIds(currentIds)
    }
  }

  // Link Duplicate Reports Modal (PA04, BR-30, BR-31)
  const handleOpenLinkReportsModal = () => {
    if (selectedReportIds.length < 2) {
      showToast('Vui lòng chọn ít nhất 2 phản ánh để thực hiện liên kết báo trùng (PA04)!')
      return
    }
    setLinkMasterCaseId(selectedReportIds[0])
    setLinkAuditNotes(
      'Liên kết báo trùng: Các phản ánh được ghi nhận cùng một vị trí hư hỏng lân cận, hợp nhất bằng chứng ảnh và mô tả hiện trường.'
    )
    setIsLinkReportsModalOpen(true)
  }

  const handleConfirmLinkReports = () => {
    if (!linkMasterCaseId) {
      showToast('Vui lòng chọn hồ sơ gốc tiếp nhận chính!')
      return
    }
    const master = cases.find((c) => c.id === linkMasterCaseId)
    if (!master) return

    const secondaryIds = selectedReportIds.filter((id) => id !== linkMasterCaseId)
    const secondaryCodes = cases.filter((c) => secondaryIds.includes(c.id)).map((c) => c.code)

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === linkMasterCaseId) {
          const updatedLinkedCodes = Array.from(new Set([...(c.linked_report_ids || []), ...secondaryCodes]))
          return {
            ...c,
            linked_report_ids: updatedLinkedCodes,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[LIÊN KẾT BÁO TRÙNG PA04] Đã gộp hồ sơ từ: ${secondaryCodes.join(', ')}. Ghi chú: ${linkAuditNotes}`
          }
        }
        if (secondaryIds.includes(c.id)) {
          return {
            ...c,
            status: 'MERGED',
            status_label: 'Đã gộp trùng',
            master_case_id: master.id,
            pm_notes: `Đã liên kết báo trùng vào hồ sơ chính ${master.code} (Theo PA04). Ghi chú: ${linkAuditNotes}`
          }
        }
        return c
      })
    )

    setExpandedMasterIds((prev) => Array.from(new Set([...prev, linkMasterCaseId])))
    setIsLinkReportsModalOpen(false)
    setSelectedReportIds([])
    setSelectedCaseId(linkMasterCaseId)
    showToast(
      `Đã liên kết thành công ${secondaryIds.length} phản ánh vào hồ sơ chính [${master.code}] (Tuân thủ PA04, BR-30, BR-31)!`
    )
  }

  // Tách hồ sơ con khỏi hồ sơ Master (Unlink - Tuân thủ BR-30, BR-31)
  const handleUnlinkReport = (secondaryIdentifier: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const target = cases.find((c) => c.id === secondaryIdentifier || c.code === secondaryIdentifier)
    const targetCode = target ? target.code : secondaryIdentifier
    const targetId = target ? target.id : secondaryIdentifier

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === targetId || c.code === targetCode) {
          return {
            ...c,
            status: 'PENDING',
            status_label: 'Chờ xử lý',
            master_case_id: undefined,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[TÁCH HỒ SƠ] Đã tách khỏi hồ sơ gốc, chuyển về hàng đợi độc lập.`
          }
        }
        const isThisMaster =
          c.id === selectedCaseId ||
          (c.linked_report_ids && (c.linked_report_ids.includes(targetCode) || c.linked_report_ids.includes(targetId))) ||
          (target?.master_case_id && c.id === target.master_case_id)

        if (isThisMaster) {
          const updatedDups = (c.cluster_duplicates || []).map((dup) =>
            dup.code === targetCode ? { ...dup, is_merged: false, selected: false } : dup
          )
          const updatedLinked = (c.linked_report_ids || []).filter(
            (code) => code !== targetCode && code !== targetId
          )
          return {
            ...c,
            linked_report_ids: updatedLinked,
            cluster_duplicates: updatedDups,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[TÁCH HỒ SƠ] Đã gỡ bỏ phản ánh ${targetCode} khỏi cụm liên kết.`
          }
        }
        return c
      })
    )
    showToast(`Đã tách phản ánh [${targetCode}] thành hồ sơ độc lập thành công!`)
  }

  // Triage Project Assignment Modal (PA03)
  const handleOpenTriageProject = (c: TriageCase, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setTargetTriageCase(c)
    setSelectedProjectId(c.project_id || 'prj-ql1a-02')
    setIsTriageProjectModalOpen(true)
  }

  const handleConfirmTriageProject = () => {
    if (!targetTriageCase) return
    const project = mockProjects.find((p) => p.id === selectedProjectId)
    const projectName = project ? project.name : 'Dự án đã chỉ định'

    const targetIds =
      selectedReportIds.includes(targetTriageCase.id) && selectedReportIds.length > 1
        ? selectedReportIds
        : [targetTriageCase.id]

    setCases((prev) =>
      prev.map((c) => {
        if (targetIds.includes(c.id)) {
          return {
            ...c,
            project_id: selectedProjectId,
            project_name: projectName,
            is_assigned: true,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[ĐIỀU PHỐI DỰ ÁN PA03] Đã tiếp nhận và gán vào dự án: ${projectName}`
          }
        }
        return c
      })
    )

    setIsTriageProjectModalOpen(false)
    setSelectedReportIds([])
    showToast(`Đã điều phối ${targetIds.length} hồ sơ vào dự án "${projectName}" thành công (PA03)!`)
  }

  // NO_DEFECT Conclusion with Mandatory Justification (BR-39)
  const handleOpenNoDefectModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setNoDefectReason('')
    setIsNoDefectModalOpen(true)
  }

  const handleConfirmNoDefect = () => {
    if (!noDefectReason.trim()) {
      showToast('Lỗi BR-39: Bắt buộc nhập lý do giải trình kỹ thuật khi kết luận NO_DEFECT!')
      return
    }
    const targetId = targetTriageCase ? targetTriageCase.id : selectedCase.id
    setCases((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? {
              ...c,
              status: 'REJECTED',
              status_label: 'Báo sai (No Defect)',
              conclusion: 'NO_DEFECT',
              conclusion_reason: noDefectReason,
              pm_notes: `[NO_DEFECT - BR-39] ${noDefectReason}`
            }
          : c
      )
    )
    setIsNoDefectModalOpen(false)
    showToast(
      `Đã ghi nhận kết luận NO_DEFECT cho hồ sơ [${targetTriageCase?.code || selectedCase.code}] (Tuân thủ BR-39)!`
    )
  }

  // OUT_OF_SCOPE Conclusion
  const handleConclusionOutOfScope = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'REJECTED',
              status_label: 'Ngoài phạm vi',
              conclusion: 'OUT_OF_SCOPE',
              conclusion_reason: 'Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.',
              pm_notes:
                '[OUT_OF_SCOPE] Vị trí nằm ngoài phạm vi bảo hành. Đã chuyển hồ sơ sang cơ quan quản lý đường bộ địa phương.'
            }
          : item
      )
    )
    showToast(`Đã phân loại hồ sơ [${target.code}] là NGOÀI PHẠM VI BẢO HÀNH (OUT_OF_SCOPE).`)
  }

  // Reset conclusion to PENDING for re-evaluating
  const handleResetConclusion = (c?: TriageCase) => {
    const target = c || selectedCase
    setCases((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'PENDING',
              status_label: 'Chờ thẩm định',
              conclusion: null,
              conclusion_reason: undefined
            }
          : item
      )
    )
    showToast(`Đã mở lại trạng thái chờ thẩm định cho hồ sơ [${target.code}].`)
  }

  // Publish Public Result (PA07)
  const handleOpenPublishModal = (c?: TriageCase) => {
    const target = c || selectedCase
    setTargetTriageCase(target)
    setPublishPublicNote(
      'Đơn vị bảo hành Hoàng Hải đã tiếp nhận và đưa vị trí này vào kế hoạch kiểm tra / sửa chữa. Cảm ơn thông tin phản ánh của Quý công dân.'
    )
    setIsPublishModalOpen(true)
  }

  const handleConfirmPublishResult = () => {
    const target = targetTriageCase || selectedCase
    const nowTime =
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString('vi-VN')
    setCases((prev) =>
      prev.map((c) =>
        c.id === target.id
          ? {
              ...c,
              is_published: true,
              published_at: nowTime,
              public_notice: publishPublicNote
            }
          : c
      )
    )
    showToast(
      `Đã công bố kết quả tiếp nhận & tiến độ xử lý hồ sơ [${target.code}] lên Ứng dụng Di động Citizen (PA07)!`
    )
    setIsPublishModalOpen(false)
  }

  const handleExecuteMerge = () => {
    const selectedDups = selectedCase.cluster_duplicates?.filter((d) => d.selected) || []
    if (selectedDups.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 hồ sơ trùng lặp để gộp!')
      return
    }

    const dupCodes = selectedDups.map((d) => d.code)
    setCases((prev) =>
      prev.map((c) => {
        if (dupCodes.includes(c.code)) {
          return {
            ...c,
            status: 'MERGED',
            status_label: 'Đã gộp trùng',
            master_case_id: selectedCase.id,
            pm_notes: `Đã tự động gộp dữ liệu vào hồ sơ chính ${selectedCase.code}`
          }
        }
        if (c.id === selectedCase.id) {
          const updatedDups = (c.cluster_duplicates || []).map((dup) =>
            dupCodes.includes(dup.code) ? { ...dup, selected: false, is_merged: true } : dup
          )
          const updatedLinked = Array.from(new Set([...(c.linked_report_ids || []), ...dupCodes]))
          return {
            ...c,
            linked_report_ids: updatedLinked,
            cluster_duplicates: updatedDups,
            pm_notes: `${c.pm_notes ? c.pm_notes + '\n' : ''}[GỘP CỤM SPATIAL] Đã tích hợp bằng chứng từ ${dupCodes.join(', ')}`
          }
        }
        return c
      })
    )
    setExpandedMasterIds((prev) => Array.from(new Set([...prev, selectedCase.id])))
    setIsMergeModalOpen(false)
    showToast(`Gộp thành công ${selectedDups.length} phản ánh lân cận vào hồ sơ gốc [${selectedCase.code}]!`)
  }

  return {
    cases,
    setCases,
    viewSourceMode,
    handleSetViewSourceMode,
    expandedMasterIds,
    handleToggleExpandMaster,
    collapseMergedRows,
    setCollapseMergedRows,
    selectedReportIds,
    setSelectedReportIds,
    isLinkReportsModalOpen,
    setIsLinkReportsModalOpen,
    linkMasterCaseId,
    setLinkMasterCaseId,
    linkAuditNotes,
    setLinkAuditNotes,
    isTriageProjectModalOpen,
    setIsTriageProjectModalOpen,
    targetTriageCase,
    setTargetTriageCase,
    selectedProjectId,
    setSelectedProjectId,
    isNoDefectModalOpen,
    setIsNoDefectModalOpen,
    noDefectReason,
    setNoDefectReason,
    isPublishModalOpen,
    setIsPublishModalOpen,
    publishPublicNote,
    setPublishPublicNote,
    isRequestSurveyModalOpen,
    setIsRequestSurveyModalOpen,
    surveyMode,
    setSurveyMode,
    surveyReason,
    setSurveyReason,
    surveyAssignedCrew,
    setSurveyAssignedCrew,
    surveySlaHours,
    setSurveySlaHours,
    selectedCaseId,
    setSelectedCaseId,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedCase,
    activeTab,
    setActiveTab,
    sourceFilter,
    setSourceFilter,
    projectFilter,
    setProjectFilter,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    toastMessage,
    setToastMessage,
    showToast,
    detailViewMode,
    setDetailViewMode,
    modalMapType,
    setModalMapType,
    isGISModalOpen,
    setIsGISModalOpen,
    isMergeModalOpen,
    setIsMergeModalOpen,
    isPhotoZoomModalOpen,
    setIsPhotoZoomModalOpen,
    modalMapContainerRef,
    drawerMapContainerRef,
    currentSeverity,
    setCurrentSeverity,
    currentUrgency,
    setCurrentUrgency,
    currentArea,
    setCurrentArea,
    currentDepth,
    setCurrentDepth,
    currentNotes,
    setCurrentNotes,
    filteredCases,
    pendingCount,
    criticalCount,
    mergedCount,
    surveyCount,
    citizenCount,
    unassignedCitizenCount,
    droneAICount,
    handleResetTriageData,
    handleSelectCase,
    handleToggleClusterItem,
    handleVerifyDefect,
    handleRejectDefect,
    handleOpenRequestSurveyModal,
    handleConfirmRequestSurvey,
    handleNavigateFastTrack,
    handleToggleSelectReport,
    handleSelectAllReports,
    handleOpenLinkReportsModal,
    handleConfirmLinkReports,
    handleUnlinkReport,
    handleOpenTriageProject,
    handleConfirmTriageProject,
    handleOpenNoDefectModal,
    handleConfirmNoDefect,
    handleConclusionOutOfScope,
    handleResetConclusion,
    handleOpenPublishModal,
    handleConfirmPublishResult,
    handleExecuteMerge
  }
}
