import { useState, useEffect } from 'react'
import { RoleCode } from '../../../types/enums'
import { AIModelVersion } from '../../../types/domain'
import { defectTypeCatalog, DefectTypeOption } from '../../../api/services/defectTypeCatalog'
import { useLegalHoldState } from './useLegalHoldState'

export const AI_MODELS_UNAVAILABLE = 'Máy chủ chưa có API danh mục mô hình AI'
export const DEFECT_CATALOG_READONLY = 'Máy chủ chỉ cho đọc danh mục'
export const DEFECT_CATALOG_PM_ONLY = 'Máy chủ chỉ cho PM đọc danh mục loại lỗi'
export const EXPORT_LABELS_UNAVAILABLE = 'Máy chủ chưa có API xuất nhãn huấn luyện'
export const FAST_TRACK_UNAVAILABLE = 'Máy chủ chưa có API bật/tắt Fast Track theo mô hình'

function apiErrorText(e: any): string {
  const r = e?.response
  if (r) return `HTTP ${r.status} · ${r.data?.code || r.data?.title || 'Lỗi máy chủ'}`
  return e?.message || 'Không đọc được danh mục loại lỗi.'
}

export function useSystemControlState(
  currentUser: { id?: string; full_name?: string; role?: RoleCode } | null,
  isSupervisor: boolean
) {
  const isPM = currentUser?.role === RoleCode.PROJECT_MANAGER
  const [activeTab, setActiveTab] = useState<'retention-legal-hold' | 'ai-models' | 'defect-catalog'>(
    'retention-legal-hold'
  )

  useEffect(() => {
    if (!isSupervisor && !isPM) {
      setActiveTab('retention-legal-hold')
    }
  }, [isSupervisor, isPM])

  // BE chưa có API danh mục/phiên bản mô hình AI -> luôn rỗng, không dữ liệu mẫu
  const aiModels: AIModelVersion[] = []

  const [defectCatalog, setDefectCatalog] = useState<DefectTypeOption[]>([])
  const [defectCatalogLoading, setDefectCatalogLoading] = useState(false)
  const [defectCatalogError, setDefectCatalogError] = useState<string | null>(null)

  useEffect(() => {
    if (!isPM) {
      setDefectCatalog([])
      setDefectCatalogError(null)
      return
    }
    const ctrl = new AbortController()
    setDefectCatalogLoading(true)
    setDefectCatalogError(null)
    defectTypeCatalog
      .read(ctrl.signal)
      .then((rows) => setDefectCatalog(rows))
      .catch((e) => {
        if (ctrl.signal.aborted) return
        setDefectCatalog([])
        setDefectCatalogError(apiErrorText(e))
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setDefectCatalogLoading(false)
      })
    return () => ctrl.abort()
  }, [isPM])

  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null)

  const triggerNotice = (msg: string) => {
    setActionSuccessNotice(msg)
    setTimeout(() => setActionSuccessNotice(null), 3000)
  }

  const legalHold = useLegalHoldState(currentUser, isSupervisor, triggerNotice)

  return {
    isPM,
    activeTab,
    setActiveTab,
    aiModels,
    defectCatalog,
    defectCatalogLoading,
    defectCatalogError,
    actionSuccessNotice,
    triggerNotice,
    ...legalHold
  }
}
