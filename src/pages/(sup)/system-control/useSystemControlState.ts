import { useState, useEffect } from 'react'
import { RoleCode } from '../../../types/enums'
import { AIModelVersion, DefectCatalogItem } from '../../../types/domain'
import { mockDefectSafetyCatalog } from '../../../api/mock/data'
import { useLegalHoldState } from './useLegalHoldState'

export function useSystemControlState(
  currentUser: { id?: string; full_name?: string; role?: RoleCode } | null,
  isSupervisor: boolean
) {
  const [activeTab, setActiveTab] = useState<'retention-legal-hold' | 'ai-models' | 'defect-catalog'>(
    'retention-legal-hold'
  )

  useEffect(() => {
    if (!isSupervisor) {
      setActiveTab('retention-legal-hold')
    }
  }, [isSupervisor])

  const [aiModels, setAiModels] = useState<AIModelVersion[]>([
    {
      id: 'mod-yolo-v9',
      name: 'Road-YOLOv9-Civil-Edge',
      version: 'v2.4.1-prod',
      status: 'ACTIVE',
      map_50: 92.4,
      recall: 89.6,
      f1_score: 0.91,
      deployed_at: '10/08/2026',
      sha256_hash: '8f3a9e4b7c1d2e5f6a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f',
      fast_track_auto: true
    },
    {
      id: 'mod-yolo-v8',
      name: 'Road-YOLOv8-Baseline',
      version: 'v1.2.0-legacy',
      status: 'DEPRECATED',
      map_50: 84.1,
      recall: 81.3,
      f1_score: 0.83,
      deployed_at: '15/01/2026',
      sha256_hash: '2e90f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9',
      fast_track_auto: false
    }
  ])
  const [defectCatalog, setDefectCatalog] = useState<DefectCatalogItem[]>(mockDefectSafetyCatalog)
  const [showDefectModal, setShowDefectModal] = useState(false)
  const [defectModalMode, setDefectModalMode] = useState<'CREATE' | 'EDIT'>('CREATE')
  const [selectedDefectForEdit, setSelectedDefectForEdit] = useState<DefectCatalogItem | null>(null)
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null)

  const triggerNotice = (msg: string) => {
    setActionSuccessNotice(msg)
    setTimeout(() => setActionSuccessNotice(null), 3000)
  }

  const handleOpenCreateDefect = () => {
    setDefectModalMode('CREATE')
    setSelectedDefectForEdit(null)
    setShowDefectModal(true)
  }

  const handleOpenEditDefect = (item: DefectCatalogItem) => {
    setDefectModalMode('EDIT')
    setSelectedDefectForEdit(item)
    setShowDefectModal(true)
  }

  const handleSaveDefect = (item: DefectCatalogItem) => {
    setDefectCatalog((prev) => {
      const exists = prev.some((d) => d.code === item.code)
      if (exists) {
        return prev.map((d) => (d.code === item.code ? item : d))
      }
      return [item, ...prev]
    })
    triggerNotice(
      defectModalMode === 'CREATE'
        ? `Đã thêm mới thành công khiếm khuyết [${item.code}] vào danh mục TCVN!`
        : `Đã cập nhật thành công thông tin khiếm khuyết [${item.code}]!`
    )
  }

  const handleToggleDefectActive = (code: string, newActive: boolean) => {
    setDefectCatalog((prev) =>
      prev.map((item) => (item.code === code ? { ...item, is_active: newActive } : item))
    )
    if (newActive) {
      triggerNotice(`Đã kích hoạt mã khiếm khuyết [${code}] cho các đợt khảo sát mới.`)
    } else {
      triggerNotice(`Đã tạm ngưng mã [${code}]. Hồ sơ lịch sử vẫn được bảo tồn theo quy chuẩn QT03.`)
    }
  }

  const handleToggleFastTrack = (modelId: string, val: boolean) => {
    setAiModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, fast_track_auto: val } : m))
    )
    triggerNotice('Đã cập nhật cấu hình tự động phân luồng Fast Track theo FR-18!')
  }

  const handleExportLabels = () => {
    const dummyExport = {
      export_code: `EXP-LABELS-${Date.now()}`,
      exported_at: new Date().toISOString(),
      standard_ref: 'TCVN 8864:2011',
      framework: 'YOLOv9-Civil-Edge-Dataset',
      total_labeled_images: 1420,
      total_defect_instances: 3840,
      classes: ['POTHOLE', 'LONGITUDINAL_CRACK', 'TRANSVERSE_CRACK', 'RUTTING'],
      validation_gate: 'PM_APPROVED_AND_SUP_INSPECTED (FR-36, QT07)',
      weights_sha256: aiModels.find((m) => m.status === 'ACTIVE')?.sha256_hash
    }

    const blob = new Blob([JSON.stringify(dummyExport, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `roadguard-approved-labels-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    triggerNotice(
      'Đã xuất thành công gói dữ liệu 1.420 nhãn kiểm định đã duyệt cho huấn luyện AI (QT07)!'
    )
  }

  const legalHold = useLegalHoldState(currentUser, isSupervisor, triggerNotice)

  return {
    activeTab,
    setActiveTab,
    aiModels,
    handleToggleFastTrack,
    handleExportLabels,
    defectCatalog,
    handleToggleDefectActive,
    showDefectModal,
    setShowDefectModal,
    defectModalMode,
    selectedDefectForEdit,
    handleOpenCreateDefect,
    handleOpenEditDefect,
    handleSaveDefect,
    actionSuccessNotice,
    triggerNotice,
    ...legalHold
  }
}
