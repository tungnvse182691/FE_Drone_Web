import React, { useState } from 'react'
import { Segment } from './types'

interface ProjectSegmentsTableProps {
  projectId: string
  segments: Segment[]
  branches?: any[]
  mainlineLengthKm?: number
  branchesLengthKm?: number
  basePath: string
  onNavigate: (path: string) => void
  onViewSegment: (code: string) => void
  activeTab?: 'MAINLINE' | 'BRANCHES'
  onTabChange?: (tab: 'MAINLINE' | 'BRANCHES') => void
}

export const ProjectSegmentsTable: React.FC<ProjectSegmentsTableProps> = ({
  activeTab: controlledTab,
  onTabChange
}) => {
  const [internalTab, setInternalTab] = useState<'MAINLINE' | 'BRANCHES'>('MAINLINE')
  const currentTab = controlledTab !== undefined ? controlledTab : internalTab

  const handleTabSwitch = (tab: 'MAINLINE' | 'BRANCHES') => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      setInternalTab(tab)
    }
  }

  return <section className="bg-white border border-slate-200 rounded-[20px] p-5 space-y-4">
    <h2 className="font-bold text-slate-900">Tuyến đường</h2>
    <div role="tablist" aria-label="Loại tuyến" className="flex flex-wrap gap-2">
      {(['MAINLINE', 'BRANCHES'] as const).map(tab => <button key={tab} role="tab" type="button" aria-selected={currentTab === tab}
        onClick={() => handleTabSwitch(tab)} className={`rounded-lg px-4 py-2 text-sm font-semibold border ${currentTab === tab ? 'bg-[#C9A227] border-[#C9A227] text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-[#C9A227]'}`}>
        {tab === 'MAINLINE' ? 'Tuyến chính' : 'Tuyến phụ'}
      </button>)}
    </div>
    <div role="tabpanel"><p className="text-sm text-slate-500">Chưa cập nhật</p></div>
  </section>
}
