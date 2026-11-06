import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { surveyService } from '../../api/services'
import { getSubLineCoordinates } from './create-survey/mockData'
import { CreateSurveyHeader } from './create-survey/CreateSurveyHeader'
import { CreateSurveyForm } from './create-survey/CreateSurveyForm'
import { FlightCorridorMap } from './create-survey/FlightCorridorMap'
import { ProjectRouteConfig, AvailablePilot } from './create-survey/types'
import { Icon } from '../../components/ui/Icon'
import { useToastStore } from '../../store/toastStore'

export const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const queryProject = searchParams.get('project') || searchParams.get('projectId')
  const queryStartKm = searchParams.get('startKm')
  const queryEndKm = searchParams.get('endKm')

  // State nạp trực tiếp 100% từ CSDL Backend Candidate3 Docker
  const [routes, setRoutes] = useState<ProjectRouteConfig[]>([])
  const [pilots, setPilots] = useState<AvailablePilot[]>([])
  const [existingMissions, setExistingMissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // State dự án và lý trình
  const [projectId, setProjectId] = useState<string>('')
  const [startKm, setStartKm] = useState<string>('0.0')
  const [endKm, setEndKm] = useState<string>('0.702')
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [surveyType, setSurveyType] = useState<'PERIODIC' | 'AD_HOC' | 'BASELINE'>('PERIODIC')

  // Phi công chỉ định
  const [pilotId, setPilotId] = useState<string>('')

  // Độ cao bay thiết kế
  const [altitudeMode, setAltitudeMode] = useState<'preset' | 'custom'>('preset')
  const [presetAltitude, setPresetAltitude] = useState<string>('65')
  const [customAltitude, setCustomAltitude] = useState<string>('65')

  // Độ phủ chồng ảnh
  const [overlapMode, setOverlapMode] = useState<'preset' | 'custom'>('preset')
  const [overlap, setOverlap] = useState<string>('80')
  const [customOverlapForward, setCustomOverlapForward] = useState<string>('80')
  const [customOverlapSide, setCustomOverlapSide] = useState<string>('70')
  const [showOverlapHelp, setShowOverlapHelp] = useState<boolean>(false)

  // Ghi chú kỹ thuật
  const [notes, setNotes] = useState<string>(
    'Khảo sát định kỳ trắc địa mặt đường. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.'
  )

  // Nạp dữ liệu Tuyến đường & Phi công từ CSDL Backend
  useEffect(() => {
    let isMounted = true
    const loadBackendData = async () => {
      try {
        setIsLoading(true)
        const routesData = await surveyService.getSurveyRoutes()
        if (!isMounted) return

        setRoutes(routesData)

        if (routesData.length > 0) {
          const matchedRoute = queryProject
            ? routesData.find((r) => r.id === queryProject || r.code === queryProject)
            : null
          const activeRoute = matchedRoute || routesData[0]
          setProjectId(activeRoute.id)

          const sVal = queryStartKm !== null ? queryStartKm : activeRoute.startKm.toFixed(activeRoute.startKm % 1 !== 0 ? 3 : 1)
          const eVal = queryEndKm !== null ? queryEndKm : activeRoute.endKm.toFixed(activeRoute.endKm % 1 !== 0 ? 3 : 1)
          setStartKm(sVal)
          setEndKm(eVal)

          setNotes(
            `Khảo sát định kỳ trắc địa tuyến [${activeRoute.code}] ${activeRoute.name} đoạn Km ${sVal} - Km ${eVal}. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.`
          )

          // Nạp phi công của dự án đang chọn từ CSDL
          try {
            const pilotsData = await surveyService.getAvailablePilots(activeRoute.id)
            if (isMounted) {
              setPilots(pilotsData)
              if (pilotsData.length > 0) {
                setPilotId(pilotsData[0].id)
              }
            }
          } catch (pilotErr) {
            console.warn('Lỗi khi tải phi công dự án:', pilotErr)
          }

          // Nạp các đợt bay hiện có của dự án để kiểm tra trùng lặp
          try {
            const missionsData = await surveyService.getSurveys(activeRoute.id)
            if (isMounted) setExistingMissions(missionsData)
          } catch {}
        }
      } catch (err: any) {
        console.error('Lỗi khi tải danh mục dự án từ CSDL Backend:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadBackendData()
    return () => {
      isMounted = false
    }
  }, [queryProject, queryStartKm, queryEndKm])

  const currentProject = useMemo(() => {
    return routes.find((p) => p.id === projectId) || routes[0]
  }, [routes, projectId])

  // Xử lý khi người dùng đổi Dự án khảo sát
  const handleProjectChange = async (newPrjId: string) => {
    setProjectId(newPrjId)
    const targetPrj = routes.find((p) => p.id === newPrjId)
    if (!targetPrj) return

    if (!targetPrj.hasAlignment) {
      setStartKm('0.0')
      setEndKm('0.0')
      setNotes(`Dự án [${targetPrj.code}] ${targetPrj.name} chưa được thiết lập tim tuyến kỹ thuật.`)
    } else {
      const sVal = targetPrj.startKm.toFixed(targetPrj.startKm % 1 !== 0 ? 3 : 1)
      const eVal = targetPrj.endKm.toFixed(targetPrj.endKm % 1 !== 0 ? 3 : 1)
      setStartKm(sVal)
      setEndKm(eVal)
      setNotes(
        `Khảo sát định kỳ trắc địa tuyến [${targetPrj.code}] ${targetPrj.name} đoạn Km ${sVal} - Km ${eVal}. Yêu cầu bay trần 65m, tốc độ chụp 4m/s, định vị RTK liên tục.`
      )
    }

    // Tải lại phi công của dự án mới từ CSDL
    try {
      const pilotsData = await surveyService.getAvailablePilots(newPrjId)
      setPilots(pilotsData)
      if (pilotsData.length > 0) {
        setPilotId(pilotsData[0].id)
      }
    } catch (err) {
      console.warn('Lỗi khi cập nhật phi công cho dự án:', err)
    }

    // Tải lại đợt bay hiện có của dự án mới để kiểm tra trùng lặp
    try {
      const missionsData = await surveyService.getSurveys(newPrjId)
      setExistingMissions(missionsData)
    } catch {}
  }

  const actualAltitude = altitudeMode === 'custom' ? parseFloat(customAltitude) || 65 : parseFloat(presetAltitude) || 65
  const gsdCmPx = (actualAltitude * 0.0215).toFixed(1)

  const sKm = parseFloat(startKm) || currentProject?.startKm || 0
  const eKm = parseFloat(endKm) || currentProject?.endKm || 0
  const flightDistanceKm = currentProject?.hasAlignment ? Math.max(0.1, Math.abs(eKm - sKm)) : 0

  const fullRouteCoords = currentProject?.defaultCoords || []
  const surveySegmentCoords = useMemo(() => {
    if (!currentProject?.hasAlignment || !currentProject?.defaultCoords?.length) return []
    return getSubLineCoordinates(
      sKm,
      eKm,
      currentProject.defaultCoords,
      currentProject.defaultKmPoints || []
    )
  }, [sKm, eKm, currentProject])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const toast = useToastStore()

  // Kiểm tra tính hợp lệ và trùng lặp theo quy chuẩn an toàn bay trắc địa
  const hasBaseline = useMemo(() => {
    return existingMissions.some((m) => m.survey_type === 'BASELINE')
  }, [existingMissions])

  const hasActivePeriodic = useMemo(() => {
    return existingMissions.some(
      (m) => m.survey_type === 'PERIODIC' && m.status !== 'BASELINE_LOCKED'
    )
  }, [existingMissions])

  const hasActiveAdHoc = useMemo(() => {
    return existingMissions.some(
      (m) => m.survey_type === 'AD_HOC' && m.status !== 'BASELINE_LOCKED'
    )
  }, [existingMissions])

  const conflictReason = useMemo(() => {
    if (!currentProject?.hasAlignment) return null
    if (surveyType === 'BASELINE' && hasBaseline) {
      return 'Đã có đợt bay Cơ sở (Baseline) cho tuyến đường này.'
    }
    if (surveyType === 'PERIODIC' && hasActivePeriodic) {
      return 'Đã có đợt bay Định kỳ chưa hoàn thành.'
    }
    if (surveyType === 'AD_HOC' && hasActiveAdHoc) {
      return 'Đã có đợt bay Đột xuất chưa hoàn thành.'
    }
    return null
  }, [currentProject, surveyType, hasBaseline, hasActivePeriodic, hasActiveAdHoc])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !currentProject) return
    if (!currentProject.hasAlignment) {
      toast.error(`Dự án [${currentProject.code}] chưa có tim tuyến kỹ thuật được phê duyệt. Vui lòng thiết lập tim tuyến trước!`)
      return
    }
    if (conflictReason) {
      toast.error(conflictReason)
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)
    const selectedPilot = pilots.find((p) => p.id === pilotId) || pilots[0]

    const overlapText =
      overlapMode === 'custom'
        ? `${customOverlapForward}% Dọc / ${customOverlapSide}% Ngang`
        : overlap === '80'
        ? '80% Dọc / 70% Ngang'
        : overlap === '85'
        ? '85% Dọc / 75% Ngang'
        : '75% Dọc / 65% Ngang'
    const fullNotes = `[Thông số bay trắc địa: Trần bay ${actualAltitude}m (GSD ~${gsdCmPx} cm/px) - Phủ ảnh ${overlapText}]. ${notes}`

    try {
      const newSurvey = await surveyService.createSurvey({
        project_id: currentProject.id,
        project_name: currentProject.name,
        start_km: `Km ${sKm.toFixed(sKm % 1 !== 0 ? 3 : 1)}`,
        end_km: `Km ${eKm.toFixed(eKm % 1 !== 0 ? 3 : 1)}`,
        pilot_name: selectedPilot?.name || 'Synthetic operator-a',
        drone_model: selectedPilot?.device || 'DJI Matrice 350 RTK',
        flight_date: date,
        survey_type: surveyType,
        notes: fullNotes
      })

      navigate(`/pm/surveys?highlightCode=${encodeURIComponent(newSurvey.code)}`, {
        state: {
          successMessage: `Đã ban hành Lệnh bay khảo sát [${newSurvey.code}] thành công! Trạng thái: Lên lịch bay.`
        }
      })
    } catch (err: any) {
      console.error('Lỗi khi ban hành kế hoạch bay:', err)
      const msg =
        err?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        'Không thể tạo kế hoạch bay khảo sát'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading && !currentProject) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E5E9] rounded-xl shadow-2xs min-h-[360px]">
        <Icon name="sync" size={32} className="text-[#C9A227] animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang tải danh mục dự án từ CSDL máy chủ...</p>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="w-full max-w-6xl mx-auto p-12 flex flex-col items-center justify-center space-y-3 bg-white border border-[#E2E5E9] rounded-xl shadow-2xs min-h-[360px] text-center">
        <Icon name="wrong_location" size={48} className="text-amber-500" />
        <p className="text-base font-bold text-[#1A1D20]">Chưa có dự án nào được phê duyệt tim tuyến kỹ thuật</p>
        <p className="text-xs text-slate-500 max-w-md">
          Theo quy chuẩn kỹ thuật bay trắc địa mặt đường UAV, dự án cần được Chỉ huy trưởng (PM) lập tim tuyến và được Giám sát (Supervisor) phê duyệt trước khi ban hành lệnh bay.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => navigate('/pm/projects')}
            className="px-4 py-2 bg-[#C9A227] text-white text-xs font-semibold rounded-lg hover:bg-[#b08d20] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="route" size={15} />
            <span>Đến thiết lập tim tuyến dự án</span>
          </button>
          <button
            onClick={() => navigate('/pm/surveys')}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Quay lại danh sách khảo sát
          </button>
        </div>
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
            overlapMode={overlapMode}
            setOverlapMode={setOverlapMode}
            customOverlapForward={customOverlapForward}
            setCustomOverlapForward={setCustomOverlapForward}
            customOverlapSide={customOverlapSide}
            setCustomOverlapSide={setCustomOverlapSide}
            showOverlapHelp={showOverlapHelp}
            setShowOverlapHelp={setShowOverlapHelp}
            date={date}
            setDate={setDate}
            surveyType={surveyType}
            setSurveyType={setSurveyType}
            pilots={pilots}
            pilotId={pilotId}
            setPilotId={setPilotId}
            notes={notes}
            setNotes={setNotes}
            hasBaseline={hasBaseline}
            hasActivePeriodic={hasActivePeriodic}
            hasActiveAdHoc={hasActiveAdHoc}
            conflictReason={conflictReason}
            errorMessage={submitError}
            onClearError={() => setSubmitError(null)}
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
          />
        </div>
      </div>
    </div>
  )
}

export default CreateSurvey
