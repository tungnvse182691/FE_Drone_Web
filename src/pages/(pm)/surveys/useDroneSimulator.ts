import { useState } from 'react'
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
  const [simTimerId, setSimTimerId] = useState<NodeJS.Timeout | null>(null)

  const handleOpenSimulator = (mission: SurveyMission) => {
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
    if (!selectedMissionForSim) return
    setSimStep('FLYING')
    setSimFlightProgress(5)

    let p = 5
    const flyInterval = setInterval(() => {
      p += 15
      if (p >= 100) {
        clearInterval(flyInterval)
        setSimFlightProgress(100)
        setSimStep('INGESTING')

        let ph = 0
        const ingestInterval = setInterval(() => {
          ph += 240
          if (ph >= 1920) {
            ph = 1920
            clearInterval(ingestInterval)
            setSimPhotosCount(1920)
            setSimStep('AI_SCANNING')

            let def = 0
            const aiInterval = setInterval(() => {
              def += 2
              if (def >= 8) {
                def = 8
                clearInterval(aiInterval)
                setSimDefectCount(8)
                setSimStep('COMPLETED')

                const updated = surveyService.simulateDroneFlightCompletion(selectedMissionForSim.id)
                onMissionUpdated()
                if (updated) {
                  setSelectedMissionForSim(updated)
                }
              } else {
                setSimDefectCount(def)
              }
            }, 350)
          } else {
            setSimPhotosCount(ph)
          }
        }, 150)
      } else {
        setSimFlightProgress(p)
        setSimBattery((prev) => Math.max(82, prev - 1))
      }
    }, 200)

    setSimTimerId(flyInterval)
  }

  const handleCloseSimulator = () => {
    if (simTimerId) clearInterval(simTimerId)
    setIsSimulatorOpen(false)
  }

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
