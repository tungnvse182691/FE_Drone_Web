import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { surveyService, type SurveyMissionItem as SurveyMission } from '../../api/services'
import { SurveyHeader } from './surveys/SurveyHeader'
import { SurveyKpiCards } from './surveys/SurveyKpiCards'
import { SurveyTable } from './surveys/SurveyTable'
import { DroneSimulatorModal } from './surveys/DroneSimulatorModal'
import { useDroneSimulator } from './surveys/useDroneSimulator'
import { Icon } from '../../components/ui/Icon'

export const SurveyRequests: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const highlightCode = searchParams.get('highlightCode')
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'>('ALL')
  const [searchQuery, setSearchQuery] = useState(highlightCode || '')
  const [missions, setMissions] = useState<SurveyMission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(location.state?.successMessage || null)

  useEffect(() => {
    if (location.state?.successMessage) {
      setToastMessage(location.state.successMessage)
      const timer = setTimeout(() => setToastMessage(null), 4500)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  useEffect(() => {
    if (highlightCode) {
      setSearchQuery(highlightCode)
      setActiveTab('ALL')
    }
  }, [highlightCode])

  // Fetch dữ liệu từ Mock API bất đồng bộ (RESTful standard)
  const fetchMissions = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await surveyService.getSurveys()
      setMissions(data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhiệm vụ bay:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  const sim = useDroneSimulator(fetchMissions)

  const filteredMissions = missions.filter((m) => {
    if (activeTab === 'PENDING' && m.status !== 'PENDING_AI_REVIEW') return false
    if (activeTab === 'SCHEDULED' && m.status !== 'SCHEDULED') return false
    if (activeTab === 'COMPLETED' && m.status !== 'BASELINE_LOCKED') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        m.code.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.start_km.toLowerCase().includes(q) ||
        m.pilot_name.toLowerCase().includes(q)
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
      <SurveyKpiCards />

      {/* 3. Table of Survey Missions */}
      {isLoading ? (
        <div className="bg-white border border-[#E2E5E9] rounded-xl p-8 flex flex-col items-center justify-center space-y-3 min-h-[300px]">
          <Icon name="sync" size={28} className="text-[#C9A227] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tải danh sách nhiệm vụ bay từ máy chủ...</p>
        </div>
      ) : (
        <SurveyTable
          missions={missions}
          filteredMissions={filteredMissions}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          basePath={basePath}
          onNavigate={navigate}
          onOpenSimulator={sim.handleOpenSimulator}
        />
      )}

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
