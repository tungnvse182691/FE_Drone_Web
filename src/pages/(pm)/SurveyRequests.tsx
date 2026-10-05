import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { surveyService, type SurveyMissionItem as SurveyMission } from '../../api/services'
import { SurveyHeader } from './surveys/SurveyHeader'
import { SurveyKpiCards } from './surveys/SurveyKpiCards'
import { SurveyTable } from './surveys/SurveyTable'
import { DroneSimulatorModal } from './surveys/DroneSimulatorModal'
import { useDroneSimulator } from './surveys/useDroneSimulator'

export const SurveyRequests: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [missions, setMissions] = useState<SurveyMission[]>(() => surveyService.getSurveys())

  // Reactive listener for localStorage updates across components
  useEffect(() => {
    const handleStateChange = () => {
      setMissions(surveyService.getSurveys())
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => window.removeEventListener('roadguard_state_change', handleStateChange)
  }, [])

  const sim = useDroneSimulator(() => setMissions(surveyService.getSurveys()))

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
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <SurveyHeader
        basePath={basePath}
        isSupervisor={isSupervisor}
        onNavigate={navigate}
      />

      {/* 2. KPI Metrics Summary Cards */}
      <SurveyKpiCards />

      {/* 3. Table of Survey Missions */}
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
    </div>
  )
}

export default SurveyRequests
