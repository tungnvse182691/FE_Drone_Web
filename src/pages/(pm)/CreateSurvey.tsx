import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { surveyService } from '../../api/services'
import {
  SURVEY_PROJECTS,
  AVAILABLE_PILOTS,
  getSubLineCoordinates
} from './create-survey/mockData'
import { CreateSurveyHeader } from './create-survey/CreateSurveyHeader'
import { CreateSurveyForm } from './create-survey/CreateSurveyForm'
import { FlightCorridorMap } from './create-survey/FlightCorridorMap'

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()

  // State dự án và lý trình
  const [projectId, setProjectId] = useState<string>(SURVEY_PROJECTS[0].id)
  const currentProject = useMemo(() => {
    return SURVEY_PROJECTS.find((p) => p.id === projectId) || SURVEY_PROJECTS[0]
  }, [projectId])

  const [startKm, setStartKm] = useState<string>('1020.0')
  const [endKm, setEndKm] = useState<string>('1025.0')
  const [date, setDate] = useState<string>('2026-10-15')

  // Phi công chỉ định
  const [pilotId, setPilotId] = useState<string>(AVAILABLE_PILOTS[0].id)

  // Độ cao bay thiết kế
  const [altitudeMode, setAltitudeMode] = useState<'preset' | 'custom'>('preset')
  const [presetAltitude, setPresetAltitude] = useState<string>('65')
  const [customAltitude, setCustomAltitude] = useState<string>('65')

  // Độ phủ chồng ảnh
  const [overlap, setOverlap] = useState<string>('80')
  const [showOverlapHelp, setShowOverlapHelp] = useState<boolean>(false)

  // Ghi chú
  const [notes, setNotes] = useState<string>(
    'Khảo sát định kỳ quý IV sau mùa bão lũ. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.'
  )

  const handleProjectChange = (newPrjId: string) => {
    setProjectId(newPrjId)
    const targetPrj = SURVEY_PROJECTS.find((p) => p.id === newPrjId) || SURVEY_PROJECTS[0]
    setStartKm(targetPrj.startKm.toFixed(1))
    setEndKm(Math.min(targetPrj.startKm + 5.0, targetPrj.endKm).toFixed(1))
  }

  const actualAltitude = altitudeMode === 'custom' ? parseFloat(customAltitude) || 65 : parseFloat(presetAltitude) || 65
  const gsdCmPx = (actualAltitude * 0.0215).toFixed(1)

  const sKm = parseFloat(startKm) || currentProject.startKm
  const eKm = parseFloat(endKm) || Math.min(currentProject.startKm + 5.0, currentProject.endKm)
  const flightDistanceKm = Math.max(0.2, Math.abs(eKm - sKm))
  const estimatedDurationMinutes = Math.round(flightDistanceKm * 3.8 + 4)
  const estimatedBatteries = Math.ceil(flightDistanceKm / 2.8)

  const fullRouteCoords = currentProject.defaultCoords
  const surveySegmentCoords = useMemo(() => {
    return getSubLineCoordinates(sKm, eKm, currentProject.defaultCoords, currentProject.defaultKmPoints)
  }, [sKm, eKm, currentProject])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedPilot = AVAILABLE_PILOTS.find((p) => p.id === pilotId)

    const newSurvey = surveyService.createSurvey({
      project_id: currentProject.id,
      project_name: currentProject.name,
      start_km: `Km ${sKm.toFixed(1)}`,
      end_km: `Km ${eKm.toFixed(1)}`,
      pilot_name: selectedPilot?.name || 'Lê Hoàng Long',
      drone_model: selectedPilot?.device || 'DJI Matrice 350 RTK',
      notes
    })

    alert(
      `Đã ban hành thành công Lệnh Bay Khảo Sát [${newSurvey.code}]!\n` +
      `• Dự án: [${currentProject.code}] ${currentProject.name}\n` +
      `• Đoạn lý trình: Km ${sKm.toFixed(1)} → Km ${eKm.toFixed(1)} (Cự ly: ${flightDistanceKm.toFixed(1)} km)\n` +
      `• Độ cao bay thiết kế: ${actualAltitude}m (GSD: ~${gsdCmPx} cm/px)\n` +
      `• Độ phủ ảnh: ${overlap}% dọc / ${parseInt(overlap) - 10}% ngang\n` +
      `• Phi công được chỉ định: ${selectedPilot?.name} (${selectedPilot?.device})\n` +
      `Hồ sơ đã được lưu trữ và đồng bộ tới danh sách nhiệm vụ bay!`
    )
    navigate(`/pm/surveys?highlightCode=${encodeURIComponent(newSurvey.code)}`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header */}
      <CreateSurveyHeader onBack={() => navigate('/pm/surveys')} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Form Cột Trái (7 cols) */}
        <div className="lg:col-span-7">
          <CreateSurveyForm
            projects={SURVEY_PROJECTS}
            projectId={projectId}
            onProjectChange={handleProjectChange}
            currentProject={currentProject}
            startKm={startKm}
            setStartKm={setStartKm}
            endKm={endKm}
            setEndKm={setEndKm}
            altitudeMode={altitudeMode}
            setAltitudeMode={setAltitudeMode}
            presetAltitude={presetAltitude}
            setPresetAltitude={setPresetAltitude}
            customAltitude={customAltitude}
            setCustomAltitude={setCustomAltitude}
            gsdCmPx={gsdCmPx}
            overlap={overlap}
            setOverlap={setOverlap}
            showOverlapHelp={showOverlapHelp}
            setShowOverlapHelp={setShowOverlapHelp}
            date={date}
            setDate={setDate}
            pilots={AVAILABLE_PILOTS}
            pilotId={pilotId}
            setPilotId={setPilotId}
            notes={notes}
            setNotes={setNotes}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/pm/surveys')}
          />
        </div>

        {/* 3. Bản Đồ Cột Phải (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <FlightCorridorMap
            fullRouteCoords={fullRouteCoords}
            surveySegmentCoords={surveySegmentCoords}
            sKm={sKm}
            eKm={eKm}
            flightDistanceKm={flightDistanceKm}
            estimatedDurationMinutes={estimatedDurationMinutes}
            estimatedBatteries={estimatedBatteries}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateSurvey
