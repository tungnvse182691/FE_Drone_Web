import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { mockDefects } from '../../api/mock/data'
import { surveyService } from '../../api/services'
import { triageService } from '../../api/services/triageService'
import { DefectStatus, Severity, DefectType } from '../../types/enums'
import { Defect } from '../../types/domain'
import { AIDetectionItem } from './drone-review/types'
import { INITIAL_DETECTIONS } from './drone-review/mockData'
import { Icon } from '../../components/ui/Icon'
import { DefectVerifyHeader } from './defect-verify/DefectVerifyHeader'
import { DefectBoundingBoxViewer } from './defect-verify/DefectBoundingBoxViewer'
import { DefectTemporalComparison } from './defect-verify/DefectTemporalComparison'
import { DefectGisMapViewer } from './defect-verify/DefectGisMapViewer'
import { DefectVerifyForm } from './defect-verify/DefectVerifyForm'

// Bản đồ ảnh thực tế tương ứng với từng loại hư hỏng mặt đường
const DETECTION_SURFACE_IMAGES: Record<string, { image: string; prevImage: string; type: DefectType }> = {
  'DET-01': {
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.POTHOLE
  },
  'DET-02': {
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.LONGITUDINAL_CRACK
  },
  'DET-03': {
    image: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.POTHOLE
  },
  'DET-04': {
    // False Positive: Vũng nước đọng phản xạ ánh nắng mặt trời
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.POTHOLE
  },
  'DET-05': {
    image: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.TRANSVERSE_CRACK
  },
  'DET-06': {
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.RAVELING
  },
  'DET-07': {
    image: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.RUTTING
  },
  'DET-08': {
    image: 'https://images.unsplash.com/photo-1584463699043-441d8e1c6b3e?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.TRANSVERSE_CRACK
  }
}

function convertDetectionToDefect(item?: AIDetectionItem | null): Defect {
  const safeItem = item || INITIAL_DETECTIONS[0]
  const surfaceInfo = (safeItem?.id && DETECTION_SURFACE_IMAGES[safeItem.id]) || {
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80',
    prevImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    type: DefectType.POTHOLE
  }

  // Parse bounding box percentages to 0..1 ratio an toàn
  const bboxX = parseFloat(safeItem?.bbox?.left || '30%') / 100 || 0.3
  const bboxY = parseFloat(safeItem?.bbox?.top || '30%') / 100 || 0.3
  const bboxW = parseFloat(safeItem?.bbox?.width || '30%') / 100 || 0.3
  const bboxH = parseFloat(safeItem?.bbox?.height || '30%') / 100 || 0.3

  // Status mapping
  let status = DefectStatus.OPEN
  if (safeItem?.status === 'APPROVED') status = DefectStatus.VERIFIED
  if (safeItem?.status === 'REJECTED') status = DefectStatus.REJECTED

  // Severity mapping an toàn
  let severity = Severity.MEDIUM
  const sev = safeItem?.severityLevel || ''
  if (sev.includes('L3') || sev.includes('Khẩn cấp')) {
    severity = Severity.CRITICAL
  } else if (sev.includes('L2') || sev.includes('Trung bình') || sev.includes('Cần xử lý')) {
    severity = Severity.HIGH
  } else if (sev.includes('L1') || sev.includes('Nhẹ') || sev.includes('Bỏ qua')) {
    severity = Severity.LOW
  }

  const lengthM = parseFloat(safeItem?.metrics?.length?.replace(' m', '') || '0.85') || 0.85
  const widthM = parseFloat(safeItem?.metrics?.crackWidth?.replace(' mm', '') || '0.65') / (safeItem?.metrics?.crackWidth ? 1000 : 1) || 0.65
  const depthMm = safeItem?.metrics?.depth
    ? parseFloat(safeItem.metrics.depth.replace(' cm', '')) * 10
    : undefined

  return {
    id: safeItem?.id?.toLowerCase() || 'det-01',
    code: safeItem?.defectCode || safeItem?.code || '#DET-01',
    survey_id: 'srv-01',
    project_id: 'prj-ql1a-02',
    project_name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    chainage_km: safeItem?.kmValue || 1024.35,
    gps_lat: parseFloat((16.2405 - ((safeItem?.kmValue || 1024.35) - 1024) * 0.007).toFixed(4)),
    gps_lng: parseFloat((108.1310 + ((safeItem?.kmValue || 1024.35) - 1024) * 0.006).toFixed(4)),
    defect_type: surfaceInfo.type,
    severity,
    confidence_score: (safeItem?.confidence || 90) / 100,
    status,
    image_url: surfaceInfo.image,
    previous_epoch_image_url: surfaceInfo.prevImage,
    bounding_box: {
      x: bboxX,
      y: bboxY,
      width: bboxW,
      height: bboxH
    },
    length_m: lengthM,
    width_m: widthM,
    depth_mm: depthMm,
    batch_id: 'pkg-05',
    created_at: '2026-09-24'
  }
}

export const DefectDetailVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const returnUrl = (location.state as any)?.from || '/pm/surveys/srv-01/review'

  const [detections, setDetections] = useState<AIDetectionItem[]>(INITIAL_DETECTIONS)
  const [localStatusOverride, setLocalStatusOverride] = useState<DefectStatus | null>(null)
  const [localCodeOverride, setLocalCodeOverride] = useState<string | null>(null)

  // Tải danh sách detections từ store để đảm bảo đồng bộ mới nhất
  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const list = await surveyService.getSurveyDetections('srv-01')
        if (list && list.length > 0) {
          setDetections(list)
        }
      } catch (e) {
        console.warn('Lỗi khi tải detections:', e)
      }
    }
    fetchDetections()
  }, [id])

  // Chuẩn hóa ID tìm kiếm
  const targetId = (id || 'det-01').toLowerCase()

  // Tìm trong detections đợt bay trước
  const matchedDetection = useMemo(() => {
    return detections.find(
      (d) => d.id.toLowerCase() === targetId || d.code.toLowerCase() === targetId || (targetId === 'det-03' && d.id === 'DET-03')
    )
  }, [detections, targetId])

  // Tìm trong mockDefects
  const matchedMockDefect = useMemo(() => {
    return mockDefects.find((d) => d.id.toLowerCase() === targetId)
  }, [targetId])

  // Đối tượng Defect hiển thị hiện tại
  const [customDefectType, setCustomDefectType] = useState<DefectType | null>(null)
  const [customDimensions, setCustomDimensions] = useState<{ lengthM: number; widthM: number } | null>(null)
  const [isBboxModified, setIsBboxModified] = useState<boolean>(false)

  const defect: Defect = useMemo(() => {
    if (matchedDetection) {
      const converted = convertDetectionToDefect(matchedDetection)
      if (localStatusOverride) converted.status = localStatusOverride
      if (localCodeOverride) converted.code = localCodeOverride
      if (customDefectType) converted.defect_type = customDefectType
      if (customDimensions) {
        converted.length_m = customDimensions.lengthM
        converted.width_m = customDimensions.widthM
      }
      return converted
    }
    if (matchedMockDefect) {
      const copy = { ...matchedMockDefect }
      if (localStatusOverride) copy.status = localStatusOverride
      if (localCodeOverride) copy.code = localCodeOverride
      if (customDefectType) copy.defect_type = customDefectType
      if (customDimensions) {
        copy.length_m = customDimensions.lengthM
        copy.width_m = customDimensions.widthM
      }
      return copy
    }
    // Fallback sang DET-01
    const fallback = convertDetectionToDefect(detections[0] || INITIAL_DETECTIONS[0])
    if (localStatusOverride) fallback.status = localStatusOverride
    if (localCodeOverride) fallback.code = localCodeOverride
    if (customDefectType) fallback.defect_type = customDefectType
    if (customDimensions) {
      fallback.length_m = customDimensions.lengthM
      fallback.width_m = customDimensions.widthM
    }
    return fallback
  }, [matchedDetection, matchedMockDefect, detections, localStatusOverride, localCodeOverride, customDefectType, customDimensions])

  // Danh sách chuyển đổi nhanh giữa các khuyết tật trong header
  const availableItems = useMemo(() => {
    return detections.map((d) => ({
      id: d.id.toLowerCase(),
      label: `${d.code} (${d.stationing} • ${d.type}${d.status === 'APPROVED' ? ' [ĐÃ DUYỆT]' : d.status === 'REJECTED' ? ' [BỎ QUA]' : ''})`
    }))
  }, [detections])

  // Tab chuyển đổi (đồng bộ theo route verify-a hoặc verify-b)
  const isTemporalRoute = location.pathname.includes('/verify-b')
  const [viewMode, setViewMode] = useState<'SINGLE' | 'TEMPORAL' | 'GIS_MAP'>(
    isTemporalRoute ? 'TEMPORAL' : 'SINGLE'
  )

  useEffect(() => {
    if (location.pathname.includes('/verify-b')) {
      setViewMode('TEMPORAL')
    } else if (location.pathname.includes('/verify-a')) {
      setViewMode('SINGLE')
    }
  }, [location.pathname])

  const [severity, setSeverity] = useState<Severity>(defect.severity)
  const [notes, setNotes] = useState('Đã đối chiếu với kích thước thước đo thực tế')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    setSeverity(defect.severity)
    setLocalStatusOverride(null)
    setLocalCodeOverride(null)
    setCustomDefectType(null)
    setCustomDimensions(null)
    setIsBboxModified(false)
  }, [id, defect.id])

  const handleVerify = async (newStatus: DefectStatus) => {
    if (!notes.trim()) {
      showToast('Vui lòng nhập ý kiến / lý do thẩm định trước khi xác nhận hoặc từ chối!')
      return
    }

    setLocalStatusOverride(newStatus)
    setSeverity(severity)

    // Xác định chính xác detection ID trong surveyService (ví dụ: DET-01, DET-04)
    const rawId = id || defect.id || 'det-01'
    const cleanDetId = rawId.toUpperCase().replace('DEF-', 'DET-').replace('DET-2026-', 'DET-')
    const finalDetId = cleanDetId.startsWith('DET-') ? cleanDetId : `DET-${cleanDetId.slice(-2)}`

    const newDefectCode =
      defect.code.startsWith('DEF-')
        ? defect.code
        : `DEF-2026-0${finalDetId.replace('DET-', '')}0`

    if (newStatus === DefectStatus.VERIFIED) {
      setLocalCodeOverride(newDefectCode)
    }

    try {
      await surveyService.updateSurveyDetection('srv-01', finalDetId, {
        status: newStatus === DefectStatus.VERIFIED ? 'APPROVED' : 'REJECTED',
        defectCode: newStatus === DefectStatus.VERIFIED ? newDefectCode : undefined,
        type: (customDefectType || defect.defect_type) as any,
        metrics: {
          reviewer: 'KS. Đỗ Quốc Hoàng (PM)',
          dismissReason: newStatus === DefectStatus.REJECTED ? notes : undefined,
          length: `${customDimensions?.lengthM ?? defect.length_m ?? 1.2} m`,
          crackWidth: `${customDimensions?.widthM ?? defect.width_m ?? 0.8} m`
        }
      })
    } catch (err) {
      console.warn('Sync to survey detections warning:', err)
    }

    const msg =
      newStatus === DefectStatus.VERIFIED
        ? `Đã xác nhận khiếm khuyết [${newDefectCode}] (${finalDetId} - ${customDefectType || defect.defect_type}) hợp lệ vào hồ sơ kỹ thuật.`
        : `Đã từ chối khiếm khuyết [${finalDetId}] (Báo sai AI / False Positive).`
    showToast(msg)

    setTimeout(() => {
      navigate(returnUrl)
    }, 1200)
  }

  const handleRequestSurvey = async (reason: string, mode: 'DRONE_RESURVEY' | 'MEASURE_ONLY') => {
    const rawId = id || defect.id || 'det-01'
    const cleanDetId = rawId.toUpperCase().replace('DEF-', 'DET-').replace('DET-2026-', 'DET-')
    const finalDetId = cleanDetId.startsWith('DET-') ? cleanDetId : `DET-${cleanDetId.slice(-2)}`

    if (mode === 'DRONE_RESURVEY') {
      try {
        await surveyService.updateSurveyDetection('srv-01', finalDetId, {
          status: 'PENDING',
          metrics: { dismissReason: `Yêu cầu bay bổ sung KS11/BR-43: ${reason}` }
        })
      } catch (e) {}
      try {
        await triageService.updateCase(rawId, {
          status: 'NEED_SURVEY',
          status_label: 'Cần đo đạc',
          conclusion: 'NEED_SURVEY',
          survey_assignment: {
            mode: 'DRONE_RESURVEY',
            reason: reason || 'Yêu cầu bay Drone bổ sung',
            assigned_crew: 'Đội bay Drone Hoàng Hải 01 - Phi công: Lê Minh Khôi',
            sla_hours: 24,
            created_at: new Date().toLocaleTimeString('vi-VN')
          }
        })
      } catch (e) {}
      showToast(`Đã tạo Lệnh Bay Bổ Sung (KS11 / BR-43) tại Km ${defect.chainage_km}. Tiếp tục rà soát đợt bay.`)
      setTimeout(() => {
        navigate(returnUrl)
      }, 1200)
    } else {
      setLocalStatusOverride(DefectStatus.OPEN)
      try {
        await surveyService.updateSurveyDetection('srv-01', finalDetId, {
          status: 'PENDING',
          metrics: { depth: 'Chờ đo thực địa AI13', reviewer: 'Chờ kết quả đo' }
        })
      } catch (e) {}
      try {
        await triageService.updateCase(rawId, {
          status: 'NEED_SURVEY',
          status_label: 'Cần đo đạc',
          conclusion: 'NEED_SURVEY',
          survey_assignment: {
            mode: 'MEASURE_ONLY',
            reason: reason || 'Yêu cầu đo đạc hiện trường bổ sung',
            assigned_crew: 'Tổ đo đạc hiện trường 01 (Km 1020 - Km 1035)',
            sla_hours: 24,
            created_at: new Date().toLocaleTimeString('vi-VN')
          }
        })
      } catch (e) {}
      showToast(`Đã giao nhiệm vụ Đo Đạc Hiện Trường (AI13 / TN01) tại Km ${defect.chainage_km}.`)
      setTimeout(() => {
        navigate(returnUrl)
      }, 1200)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Switcher */}
      <DefectVerifyHeader
        defect={defect}
        severity={severity}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onBack={() => navigate(returnUrl)}
        availableItems={availableItems}
      />

      {/* 2. Main Grid: Left is Photo Viewer / GIS Map, Right is Verification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2 Columns on Desktop */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {viewMode === 'GIS_MAP' && (
              <DefectGisMapViewer defect={defect} severity={severity} />
            )}

            {viewMode === 'SINGLE' && (
              <DefectBoundingBoxViewer
                defect={defect}
                currentType={customDefectType || defect.defect_type}
                onBboxChange={(_newBbox, lengthM, widthM) => {
                  setIsBboxModified(true)
                  setCustomDimensions({ lengthM, widthM })
                }}
              />
            )}

            {viewMode === 'TEMPORAL' && (
              <DefectTemporalComparison defect={defect} />
            )}
          </Card>
        </div>

        {/* Right: Verification Form */}
        <div className="space-y-4">
          <DefectVerifyForm
            defect={defect}
            currentType={customDefectType || defect.defect_type}
            onTypeChange={(newType) => setCustomDefectType(newType)}
            dimensions={customDimensions || { lengthM: defect.length_m || 1.2, widthM: defect.width_m || 0.8 }}
            isBboxModified={isBboxModified}
            severity={severity}
            setSeverity={setSeverity}
            notes={notes}
            setNotes={setNotes}
            onVerify={handleVerify}
            onRequestSurvey={handleRequestSurvey}
          />
        </div>
      </div>

      {/* In-app Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default DefectDetailVerify
