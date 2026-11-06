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
  projectId, basePath, onNavigate,
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

  return <section className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-6 shadow-2xs overflow-hidden space-y-4">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C9A227] to-slate-200" />
    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3"><h2 className="font-bold text-base text-slate-900">Hình học tuyến & Phân đoạn công trình</h2><button onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)} className="text-xs font-semibold text-[#8C6D1F]">Quản lý tuyến và bản nháp</button></div>
    <div role="tablist" aria-label="Loại tuyến" className="flex flex-wrap gap-2">{(['MAINLINE','BRANCHES'] as const).map(tab => <button key={tab} type="button" role="tab" aria-selected={currentTab===tab} onClick={() => handleTabSwitch(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold border ${currentTab===tab?'bg-[#C9A227] border-[#C9A227] text-white':'bg-white border-slate-200 text-slate-600'}`}>{tab==='MAINLINE'?'Tuyến chính':'Tuyến phụ'}</button>)}</div>
    <div role="tabpanel" className="overflow-x-auto border border-slate-200 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-600"><tr>{['Phân đoạn','Lý trình','Chiều dài','Trạng thái'].map(label=><th key={label} className="p-3 text-left">{label}</th>)}</tr></thead><tbody><tr><td colSpan={4} className="p-8 text-center text-slate-500">Chưa cập nhật</td></tr></tbody></table></div>
  </section>
}
