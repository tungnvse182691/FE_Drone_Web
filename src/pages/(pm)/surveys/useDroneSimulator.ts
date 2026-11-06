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
    if (!selectedMissionForSim) return
    clearCurrentTimer()
    setSimStep('FLYING')
    setSimFlightProgress(5)

    const targetMissionId = selectedMissionForSim.id
    let p = 5

    const flyInterval = setInterval(() => {
      p += 15
      if (p >= 100) {
        clearInterval(flyInterval)
        setSimFlightProgress(100)
        setSimStep('INGESTING')

        let ph = 0
        const ingestInterval = setInterval(() => {
          ph += 25
          if (ph >= 100) {
            ph = 100
            clearInterval(ingestInterval)
            setSimPhotosCount(100)
            setSimStep('AI_SCANNING')

            let scanStep = 0
            const aiInterval = setInterval(() => {
              scanStep += 1
              if (scanStep >= 2) {
                clearInterval(aiInterval)
                timerRef.current = null
                setSimDefectCount(1)
                setSimStep('COMPLETED')

                surveyService
                  .simulateDroneFlightCompletion(targetMissionId)
                  .then((updated) => {
                    if (updated) {
                      setSelectedMissionForSim(updated)
                      setSimDefectCount(updated.ai_defects_count || 1)
                    }
                    onMissionUpdated()
                  })
                  .catch((err) => {
                    console.error('Lỗi khi hoàn tất mô phỏng bay:', err)
                  })
              } else {
                setSimDefectCount(1)
              }
            }, 300)
            timerRef.current = aiInterval
          } else {
            setSimPhotosCount(ph)
          }
        }, 150)
        timerRef.current = ingestInterval
      } else {
        setSimFlightProgress(p)
        setSimBattery((prev) => Math.max(82, prev - 1))
      }
    }, 200)

    timerRef.current = flyInterval
  }

  const handleCloseSimulator = () => {
    clearCurrentTimer()
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
