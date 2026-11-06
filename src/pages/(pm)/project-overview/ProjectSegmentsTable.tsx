import { Icon } from '../../../components/ui/Icon'
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
    <div role="tablist" aria-label="Loại tuyến" className="flex flex-wrap gap-2">{(['MAINLINE','BRANCHES'] as const).map(tab => <button key={tab} type="button" role="tab" aria-selected={currentTab===tab} onClick={() => handleTabSwitch(tab)} className={`px-4 py-2 rounded-full text-xs font-semibold border ${currentTab===tab?'bg-[#C9A227] border-[#C9A227] text-white':'bg-white border-slate-200 text-slate-600'}`}><span className="inline-flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${currentTab===tab ? 'bg-white' : 'bg-slate-400'}`} />{tab==='MAINLINE'?'Tuyến chính':'Tuyến phụ'}</span><span className="ml-2 text-[10px]">Chưa cập nhật</span></button>)}</div>
    <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center gap-2.5"><div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"><Icon name="alt_route" size={22} /></div><h3 className="text-xs font-bold text-slate-800">Chưa cập nhật hồ sơ phân đoạn</h3><p className="text-xs text-slate-500">Mở hồ sơ tuyến để đối chiếu hình học và phiên bản đã xác nhận.</p><button type="button" onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)} className="px-3.5 py-1.5 rounded-xl bg-[#C9A227] text-white text-xs font-bold inline-flex items-center gap-1.5"><Icon name="arrow_forward" size={14} />Mở hồ sơ tuyến</button></div>
    <div role="tabpanel" className="overflow-x-auto border border-slate-200 rounded-xl"><table className="w-full text-xs"><thead className="bg-slate-50 text-slate-600"><tr>{['Phân đoạn','Lý trình','Chiều dài','Tình trạng mặt đường','Khiếm khuyết mở','Thao tác'].map(label=><th key={label} className="p-3 text-left">{label}</th>)}</tr></thead><tbody><tr><td colSpan={6} className="p-8 text-center text-slate-500">Chưa cập nhật</td></tr></tbody></table></div>
  </section>
}
