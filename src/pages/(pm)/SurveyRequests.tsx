import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { type SurveyMissionItem as SurveyMission, type HubProject } from '../../api/services'
import { surveyPlanningService, type SurveyRecord, type SurveyPresentation } from '../../api/services/surveyPlanningService'
import { SurveyHeader } from './surveys/SurveyHeader'
import { SurveyKpiCards } from './surveys/SurveyKpiCards'
import { SurveyTable } from './surveys/SurveyTable'
import { DroneSimulatorModal } from './surveys/DroneSimulatorModal'
import { useDroneSimulator } from './surveys/useDroneSimulator'
import { Icon } from '../../components/ui/Icon'
import { SurveyRecordDetailModal } from './surveys/SurveyRecordDetailModal'

export const SurveyRequests: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightCode = searchParams.get('highlightCode')
  const { user, authEpoch } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'>('ALL')
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [missions, setMissions] = useState<SurveyMission[]>([])
  const [projects, setProjects] = useState<HubProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(location.state?.successMessage || null)

  const [highlightedCode, setHighlightedCode] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.successMessage) {
      setToastMessage(location.state.successMessage)
      const timer = setTimeout(() => setToastMessage(null), 4500)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  useEffect(() => {
    if (highlightCode) {
      setHighlightedCode(highlightCode)
      setActiveTab('ALL')
      setSelectedRouteFilter('ALL')
      setSearchQuery('')
    }
  }, [highlightCode])

  const [readError,setReadError] = useState(''), [detail,setDetail] = useState<SurveyRecord | null>(null), [detailError,setDetailError] = useState(''), [detailLoading,setDetailLoading] = useState(false), [detailTarget,setDetailTarget] = useState<SurveyMission | null>(null)
  const [description,setDescription]=useState<SurveyPresentation|null>(null)
  const generation = useRef(0), detailGeneration=useRef(0)
  const fetchMissions = useCallback(async()=>{
    const n=++generation.current
    const current=()=>generation.current===n&&useAuthStore.getState().authEpoch===authEpoch
    setIsLoading(true);setReadError('');setMissions([])
    try{
      const projects=await surveyPlanningService.projects()
      const rows=await surveyPlanningService.missions(projects)
      if(!current())return
      setMissions(rows)
      setProjects(projects.map(p=>({id:p.projectId,code:p.projectCode,name:p.name,status:p.status} as HubProject)))
    }catch(e:any){if(current())setReadError(`Không đọc được danh sách khảo sát: ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`)}finally{if(current())setIsLoading(false)}
  },[authEpoch])
  useEffect(()=>{setDetail(null);setDetailTarget(null);detailGeneration.current++;void fetchMissions();return()=>{generation.current++;detailGeneration.current++}},[fetchMissions])
  const selectedRecord = searchParams.get('surveyRecordId') || '', selectedKind = searchParams.get('surveyRecordKind') || ''
  const openDetail=async(mission:SurveyMission)=>{
    if(selectedRecord!==mission.id||selectedKind!==mission.serverRecordKind){const next = new URLSearchParams(searchParams); next.set('surveyRecordId',mission.id); next.set('surveyRecordKind',mission.serverRecordKind!); setSearchParams(next)}

    const n=++detailGeneration.current
    setDetailTarget(mission);setDetail(null);setDescription(null);setDetailError('');setDetailLoading(true)
    try{const value=await surveyPlanningService.detail(mission.project_id,mission.id,mission.serverRecordKind!);if(n!==detailGeneration.current||useAuthStore.getState().authEpoch!==authEpoch)return;setDetail(value);const description=await surveyPlanningService.describe(value);if(n===detailGeneration.current&&useAuthStore.getState().authEpoch===authEpoch)setDescription(description)}
    catch(e:any){if(n===detailGeneration.current&&useAuthStore.getState().authEpoch===authEpoch)setDetailError(`Không đọc được chi tiết: ${e?.response?.status||''} ${e?.response?.data?.code||e.message}`)}finally{if(n===detailGeneration.current&&useAuthStore.getState().authEpoch===authEpoch)setDetailLoading(false)}
  }
  useEffect(()=>{
    if(isLoading || readError || !selectedRecord)return
    const mission=missions.find(m=>m.id===selectedRecord&&m.serverRecordKind===selectedKind)
    if(mission)void openDetail(mission)
    else{setDetailTarget(null);setDetail(null);setDetailError('Reference chi tiết không thuộc danh sách dự án được phép đọc.');setReadError('Reference khảo sát không hợp lệ hoặc không thuộc phạm vi phiên hiện tại; không mở bản ghi thay thế.')}
  },[selectedRecord,selectedKind,isLoading,readError,missions])
  const navigateRead=(path:string)=>{const id=path.match(/surveys\/([^/]+)\/review/)?.[1],mission=missions.find(m=>m.id===id);if(mission)void openDetail(mission);else navigate(path)}
  const sim = useDroneSimulator(fetchMissions)

  const filteredMissions = missions.filter((m) => {
    // 1. Lọc theo Tab trạng thái
    if (activeTab === 'PENDING' && m.serverRecordKind !== 'TASK') return false
    if (activeTab === 'SCHEDULED' && m.serverRecordKind !== 'PLAN') return false
    if (activeTab === 'COMPLETED' && m.status !== 'BASELINE_LOCKED') return false

    // 2. Lọc theo Tuyến đường / Dự án theo BR-32, BR-36
    if (selectedRouteFilter !== 'ALL' && m.project_id !== selectedRouteFilter) {
      return false
    }

    // 3. Tìm kiếm từ khóa bao quát theo DA05 & BR-32 (Mã, tên tuyến, lý trình từ Km đến Km, phi công, thiết bị)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        m.code.toLowerCase().includes(q) ||
        m.short_code?.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.project_name.toLowerCase().includes(q) ||
        m.scope_summary?.toLowerCase().includes(q) ||
        m.start_km.toLowerCase().includes(q) ||
        m.end_km.toLowerCase().includes(q) ||
        m.pilot_name.toLowerCase().includes(q) ||
        m.drone_model.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6">
      {/* 1. Header & Quick Actions */}
      <SurveyHeader
        basePath={basePath}
        isSupervisor={isSupervisor}
        onNavigate={navigate}
      />

      {/* 2. KPI Metrics Summary Cards */}
      <SurveyKpiCards missions={missions} serverReadOnly loading={isLoading} readError={readError} />

      {/* 3. Table of Survey Missions */}
      {readError ? <div role="alert" className="bg-white border rounded-xl p-6 text-sm">{readError}<button type="button" onClick={()=>{void fetchMissions()}} className="ml-3 underline">Thử lại</button></div> : isLoading ? (
        <div className="bg-white border border-[#E2E5E9] rounded-xl p-8 flex flex-col items-center justify-center space-y-3 min-h-[300px]">
          <Icon name="sync" size={28} className="text-[#C9A227] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách nhiệm vụ bay từ máy chủ...</p>
        </div>
      ) : (
        <SurveyTable
          projects={projects}
          missions={missions}
          filteredMissions={filteredMissions}
          activeTab={activeTab}
          setActiveTab={tab=>{if(tab!=='COMPLETED')setActiveTab(tab);else setToastMessage('API plan/task chưa cung cấp trạng thái AI/Baseline; chỉ đọc trạng thái server trên từng bản ghi.')}}
          selectedRouteFilter={selectedRouteFilter}
          setSelectedRouteFilter={setSelectedRouteFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          highlightedCode={highlightedCode}
          basePath={basePath}
          onNavigate={navigateRead}
          onOpenSimulator={mission=>{void openDetail(mission)}}
          onOpenRelated={id=>{const target=missions.find(m=>m.id===id);if(target)void openDetail(target);else setToastMessage('Bản ghi liên quan không nằm trong danh sách được phép đọc.')}}
          serverReadOnly
        />
      )}

      {detailTarget && <SurveyRecordDetailModal projectName={detailTarget.project_name} target={detailTarget} planTasks={detailTarget.serverRecordKind==='PLAN'?missions.filter(m=>m.plan_id===detailTarget.id).map(m=>({id:m.id,status:m.serverStatus||''})):undefined} onOpenRelated={id=>{const target=missions.find(m=>m.id===id);if(target)void openDetail(target);else setToastMessage('Bản ghi liên quan không nằm trong danh sách được phép đọc.')}} record={detail} description={description} loading={detailLoading} error={detailError} onRetry={()=>{void openDetail(detailTarget)}} onChanged={()=>{void fetchMissions();void openDetail(detailTarget)}} onClose={()=>{detailGeneration.current++;setDetailTarget(null);setDetail(null);setDescription(null);const next=new URLSearchParams(searchParams);next.delete('surveyRecordId');next.delete('surveyRecordKind');setSearchParams(next)}} />}
      {/* 4. Drone Simulator Modal */}
      <DroneSimulatorModal
        isOpen={sim.isSimulatorOpen}
        mission={sim.selectedMissionForSim}
        simStep={sim.simStep}
        simFlightProgress={sim.simFlightProgress}
        simPhotosCount={sim.simPhotosCount}
        simDefectCount={sim.simDefectCount}
        simAltitude={sim.simAltitude}
        simSpeed={sim.simSpeed}
        simBattery={sim.simBattery}
        basePath={basePath}
        onClose={sim.handleCloseSimulator}
        onRunSimulation={sim.handleRunSimulation}
        onNavigate={navigate}
      />

      {/* 5. Floating Toast Notification (Style chuẩn Tim tuyến) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
            <Icon name="check" size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-3"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default SurveyRequests
