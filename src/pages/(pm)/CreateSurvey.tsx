import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { surveyService, INITIAL_SURVEY_ROUTES, INITIAL_PILOTS } from '../../api/services'
import { getSubLineCoordinates } from './create-survey/mockData'
import { CreateSurveyHeader } from './create-survey/CreateSurveyHeader'
import { CreateSurveyForm } from './create-survey/CreateSurveyForm'
import { FlightCorridorMap } from './create-survey/FlightCorridorMap'
import { ProjectRouteConfig, AvailablePilot } from './create-survey/types'
import { Icon } from '../../components/ui/Icon'

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const queryProject = searchParams.get('project') || searchParams.get('projectId')
  const queryStartKm = searchParams.get('startKm')
  const queryEndKm = searchParams.get('endKm')

  // State nạp từ Mock API (Khởi tạo sẵn với đầy đủ Tuyến chính & Tuyến phụ)
  const [routes, setRoutes] = useState<ProjectRouteConfig[]>(INITIAL_SURVEY_ROUTES)
  const [pilots, setPilots] = useState<AvailablePilot[]>(INITIAL_PILOTS)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // State dự án và lý trình (Ưu tiên nạp từ query parameters nếu được chuyển tiếp từ RPT-06)
  const [projectId, setProjectId] = useState<string>(queryProject || INITIAL_SURVEY_ROUTES[0]?.id || 'prj-ql1a-02')
  const [startKm, setStartKm] = useState<string>(queryStartKm || '1020.0')
  const [endKm, setEndKm] = useState<string>(queryEndKm || '1025.0')
  const [date, setDate] = useState<string>('2026-10-15')

  // Phi công chỉ định
  const [pilotId, setPilotId] = useState<string>('')

  // Độ cao bay thiết kế
  const [altitudeMode, setAltitudeMode] = useState<'preset' | 'custom'>('preset')
  const [presetAltitude, setPresetAltitude] = useState<string>('65')
  const [customAltitude, setCustomAltitude] = useState<string>('65')

  // Độ phủ chồng ảnh
  const [overlap, setOverlap] = useState<string>('80')
  const [showOverlapHelp, setShowOverlapHelp] = useState<boolean>(false)

  // Ghi chú
  const [notes, setNotes] = useState<string>(() => {
    if (queryStartKm && queryEndKm) {
      return `Bay khảo sát rà soát nứt lún suy thoái đoạn Km ${queryStartKm} - Km ${queryEndKm} theo cảnh báo RPT-06. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.`
    }
    return 'Khảo sát định kỳ quý IV sau mùa bão lũ. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.'
  })

  // Nạp dữ liệu Tuyến đường & Phi công từ Mock API bất đồng bộ
  useEffect(() => {
    let isMounted = true
    const loadMockApiData = async () => {
      try {
        setIsLoading(true)
        const [routesData, pilotsData] = await Promise.all([
          surveyService.getSurveyRoutes(),
          surveyService.getAvailablePilots()
        ])
        if (!isMounted) return

        setRoutes(routesData)
        setPilots(pilotsData)

        if (routesData.length > 0) {
          const matchedRoute = queryProject
            ? routesData.find((r) => r.id === queryProject || r.code === queryProject)
            : null
          const activeRoute = matchedRoute || routesData[0]
          setProjectId(activeRoute.id)

          if (queryStartKm) {
            setStartKm(queryStartKm)
          } else if (!matchedRoute) {
            setStartKm(activeRoute.startKm.toFixed(1))
          }

          if (queryEndKm) {
            setEndKm(queryEndKm)
          } else if (!matchedRoute) {
            setEndKm(Math.min(activeRoute.startKm + 5.0, activeRoute.endKm).toFixed(1))
          }
        }

        if (pilotsData.length > 0) {
          setPilotId(pilotsData[0].id)
        }
      } catch (err) {
        console.error('Lỗi khi tải danh mục tuyến & phi công từ Mock API:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadMockApiData()
    return () => {
      isMounted = false
    }
  }, [queryProject, queryStartKm, queryEndKm])

  const currentProject = useMemo(() => {
    return (
      routes.find((p) => p.id === projectId) ||
      INITIAL_SURVEY_ROUTES.find((p) => p.id === projectId) ||
      routes[0] ||
      INITIAL_SURVEY_ROUTES[0]
    )
  }, [routes, projectId])

  const handleProjectChange = (newPrjId: string) => {
    setProjectId(newPrjId)
    const targetPrj =
      routes.find((p) => p.id === newPrjId) ||
      INITIAL_SURVEY_ROUTES.find((p) => p.id === newPrjId)
    if (!targetPrj) return

    if (targetPrj.type === 'BRANCH') {
      // Tuyến phụ: Tự động khởi tạo từ Km 0.0 đến hết chiều dài nhánh
      setStartKm(targetPrj.startKm.toFixed(2))
      setEndKm(targetPrj.endKm.toFixed(2))
      setNotes(
        `Khảo sát chuyên đề tuyến phụ [${targetPrj.code}] ${targetPrj.name} (${targetPrj.branchStationText || ''}). Yêu cầu bay trần 50-65m kiểm tra nứt lún bề mặt.`
      )
    } else {
      // Tuyến chính
      setStartKm(targetPrj.startKm.toFixed(1))
      setEndKm(Math.min(targetPrj.startKm + 5.0, targetPrj.endKm).toFixed(1))
      setNotes(
        `Khảo sát định kỳ tuyến chính [${targetPrj.code}] ${targetPrj.name}. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.`
      )
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedPilot = pilots.find((p) => p.id === pilotId)

    const newSurvey = await surveyService.createSurvey({
      project_id: currentProject.id,
      project_name: currentProject.name,
      start_km: `Km ${sKm.toFixed(currentProject.type === 'BRANCH' ? 2 : 1)}`,
      end_km: `Km ${eKm.toFixed(currentProject.type === 'BRANCH' ? 2 : 1)}`,
      pilot_name: selectedPilot?.name || 'Lê Hoàng Long',
      drone_model: selectedPilot?.device || 'DJI Matrice 350 RTK',
      notes
    })

    navigate(`/pm/surveys?highlightCode=${encodeURIComponent(newSurvey.code)}`, {
      state: {
        successMessage: `Đã ban hành Lệnh bay khảo sát [${newSurvey.code}] thành công! Trạng thái: Lên lịch bay.`
      }
    })
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E5E9] rounded-xl shadow-2xs min-h-[360px]">
        <Icon name="sync" size={32} className="text-[#C9A227] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải danh mục Tuyến chính & Tuyến phụ từ máy chủ...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto overflow-x-hidden space-y-6">
      {/* 1. Header */}
      <CreateSurveyHeader onBack={() => navigate('/pm/surveys')} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Form Cột Trái (7 cols) */}
        <div className="lg:col-span-7">
          <CreateSurveyForm
            projects={routes}
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
            pilots={pilots}
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
            currentProject={currentProject}
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
