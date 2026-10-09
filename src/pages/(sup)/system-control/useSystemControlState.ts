import { useState, useEffect } from 'react'
import { RoleCode } from '../../../types/enums'
import { AIModelVersion, DefectCatalogItem } from '../../../types/domain'
import { mockAIModelRegistry, mockDefectSafetyCatalog } from '../../../api/mock/data'
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

  const [aiModels] = useState<AIModelVersion[]>(mockAIModelRegistry)
  const [defectCatalog] = useState<DefectCatalogItem[]>(mockDefectSafetyCatalog)
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null)

  const triggerNotice = (msg: string) => {
    setActionSuccessNotice(msg)
    setTimeout(() => setActionSuccessNotice(null), 3000)
  }

  const legalHold = useLegalHoldState(currentUser, isSupervisor, triggerNotice)

  return {
    activeTab,
    setActiveTab,
    aiModels,
    defectCatalog,
    actionSuccessNotice,
    triggerNotice,
    ...legalHold
  }
}
