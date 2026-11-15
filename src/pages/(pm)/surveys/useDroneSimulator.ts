import { useState, useRef } from 'react'
import { surveyService, type SurveyMissionItem as SurveyMission } from '../../../api/services'

export function useDroneSimulator(onMissionUpdated: () => void) {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [selectedMissionForSim, setSelectedMissionForSim] = useState<SurveyMission | null>(null)
  const [simStep, setSimStep] = useState<'IDLE' | 'FLYING' | 'INGESTING' | 'AI_SCANNING' | 'COMPLETED'>('IDLE')
  const [simFlightProgress, setSimFlightProgress] = useState(0)
  const [simPhotosCount, setSimPhotosCount] = useState(0)
  const [simDefectCount, setSimDefectCount] = useState(0)
  const [simAltitude, setSimAltitude] = useState(65.0)
  const [simSpeed, setSimSpeed] = useState(5.4)
  const [simBattery, setSimBattery] = useState(96)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearCurrentTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const handleOpenSimulator = (mission: SurveyMission) => {
    clearCurrentTimer()
    setSelectedMissionForSim(mission)
    setSimStep('IDLE')
    setSimFlightProgress(0)
    setSimPhotosCount(0)
    setSimDefectCount(0)
    setSimAltitude(65.0)
    setSimSpeed(5.4)
    setSimBattery(96)
    setIsSimulatorOpen(true)
  }

  const handleRunSimulation = () => {
    // Live business progress is server-owned. Keep the viewer, never run the legacy timer/writer.
    clearCurrentTimer()
  }

  const handleCloseSimulator = () => { clearCurrentTimer(); setIsSimulatorOpen(false); setSelectedMissionForSim(null) }

  return {
    isSimulatorOpen,
    selectedMissionForSim,
    simStep,
    simFlightProgress,
    simPhotosCount,
    simDefectCount,
    simAltitude,
    simSpeed,
    simBattery,
    handleOpenSimulator,
    handleRunSimulation,
    handleCloseSimulator
  }
}
