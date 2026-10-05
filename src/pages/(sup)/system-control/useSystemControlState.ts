import { useState, useEffect } from 'react'
import { RoleCode } from '../../../types/enums'
import { AIModelVersion, DefectCatalogItem } from '../../../types/domain'
import { mockAIModelRegistry, mockDefectSafetyCatalog } from '../../../api/mock/data'
import { usePersonnelState } from './usePersonnelState'
import { useLegalHoldState } from './useLegalHoldState'

export function useSystemControlState(
  currentUser: { id?: string; full_name?: string; role?: RoleCode } | null,
  isSupervisor: boolean
) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'ai-models' | 'defect-catalog' | 'retention-legal-hold'>(
    'retention-legal-hold'
  )

  useEffect(() => {
    if (!isSupervisor && (activeTab === 'ai-models' || activeTab === 'defect-catalog')) {
      setActiveTab('retention-legal-hold')
    }
  }, [isSupervisor, activeTab])

  const [aiModels, setAiModels] = useState<AIModelVersion[]>(mockAIModelRegistry)
  const [defectCatalog, setDefectCatalog] = useState<DefectCatalogItem[]>(mockDefectSafetyCatalog)
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null)

  const triggerNotice = (msg: string) => {
    setActionSuccessNotice(msg)
    setTimeout(() => setActionSuccessNotice(null), 3000)
  }

  const personnel = usePersonnelState(triggerNotice)
  const legalHold = useLegalHoldState(currentUser, isSupervisor, triggerNotice)

  return {
    activeTab,
    setActiveTab,
    aiModels,
    setAiModels,
    defectCatalog,
    setDefectCatalog,
    actionSuccessNotice,
    triggerNotice,
    ...personnel,
    ...legalHold
  }
}
