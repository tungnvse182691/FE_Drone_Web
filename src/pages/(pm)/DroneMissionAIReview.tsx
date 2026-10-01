import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Home,
  ChevronRight,
  PlaneTakeoff,
  Lock,
  RefreshCw,
  Verified,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Video,
  Eye,
  EyeOff,
  Camera,
  Maximize2,
  Minimize2,
  MapPin,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Map as MapIcon,
  Wand2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  X,
  FileCheck2,
  ShieldCheck,
  Radio,
  Sliders,
  Check,
  ChevronDown
} from 'lucide-react'

// Interface cho mục phát hiện AI
interface AIDetectionItem {
  id: string
  code: string
  stationing: string
  lane: string
  type: string
  severityLevel: string
  confidence: number
  description: string
  metrics: {
    area?: string
    depth?: string
    length?: string
    crackWidth?: string
    reviewer?: string
    dismissReason?: string
  }
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  defectCode?: string
  kmValue: number
  bbox: {
    top: string
    left: string
    width: string
    height: string
    label: string
    dims: string
    borderColor: string
    isDashed?: boolean
  }
}

export const DroneMissionAIReview: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Trạng thái bật/tắt lớp AI Bounding Box trên Canvas
  const [isAiOverlayVisible, setIsAiOverlayVisible] = useState<boolean>(true)

  // Trạng thái phát lại video/timeline bay (Play/Pause)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentFrame, setCurrentFrame] = useState<number>(1420)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0)
  const totalFrames = 1920

  // Trạng thái toàn màn hình canvas
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false)

  // Bộ lọc phân đoạn phát hiện AI
  const [kmFilter, setKmFilter] = useState<'ALL' | 'KM_1024_1026' | 'KM_1026_1028' | 'KM_1028_1030'>('ALL')

  // Mục phát hiện AI đang được chọn
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>('DET-01')

  // Trạng thái tỷ lệ phủ hình ảnh (Ban đầu 87% cảnh báo, sau khi bay bù -> 98% đạt)
  const [coveragePercentage, setCoveragePercentage] = useState<number>(87)
  const [hasBlindspot, setHasBlindspot] = useState<boolean>(true)

  // Modal yêu cầu bay bổ sung
  const [isReFlightModalOpen, setIsReFlightModalOpen] = useState<boolean>(false)
  const [pilotNote, setPilotNote] = useState<string>('Bay quét bù dải phân cách giữa tại lý trình Km 1027+100 bằng góc nghiêng 45° Oblique.')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Danh sách 8 phát hiện AI từ chuyến bay quét
  const [detections, setDetections] = useState<AIDetectionItem[]>([
    {
      id: 'DET-01',
      code: '#DET-01',
      stationing: 'Km 1024+350',
      lane: 'Làn phải',
      type: 'Ổ gà cấp 3',
      severityLevel: 'L3 (Nghiêm trọng)',
      confidence: 94,
      description: 'Ổ gà sâu, bong bật lớp bê tông nhựa C19, lộ cốt liệu đá 1x2',
      metrics: {
        area: '0.27 m²',
        depth: '6.8 cm'
      },
      status: 'PENDING',
      kmValue: 1024.35,
      bbox: {
        top: '34%',
        left: '28%',
        width: '42%',
        height: '38%',
        label: '[AI #DET-01] Ổ gà cấp độ 3 (Pothole L3) • 94%',
        dims: 'Dài 60cm × Rộng 45cm • Sâu 6.8cm',
        borderColor: '#EF4444'
      }
    },
    {
      id: 'DET-02',
      code: '#DET-02',
      stationing: 'Km 1025+110',
      lane: 'Làn giữa',
      type: 'Nứt dọc',
      severityLevel: 'L2 (Trung bình)',
      confidence: 88,
      description: 'Vết nứt dọc dạng chân chim liên tục theo vệt bánh xe',
      metrics: {
        length: '1.8 m',
        crackWidth: '4.2 mm'
      },
      status: 'PENDING',
      kmValue: 1025.11,
      bbox: {
        top: '16%',
        left: '72%',
        width: '18%',
        height: '55%',
        label: '[AI #DET-02] Nứt dọc • 88%',
        dims: 'L: 1.8m • Khe: 4.2mm',
        borderColor: '#F97316',
        isDashed: true
      }
    },
    {
      id: 'DET-03',
      code: '#DET-03',
      stationing: 'Km 1025+890',
      lane: 'Lề đường',
      type: 'Vỡ mép thảm',
      severityLevel: 'L2 (Trung bình)',
      confidence: 91,
      description: 'Vỡ mép thảm bê tông nhựa cạnh rãnh thu nước dọc tuyến',
      metrics: {
        length: '1.2 m',
        area: '0.18 m²',
        reviewer: 'KS. Đỗ Quốc Hoàng'
      },
      status: 'APPROVED',
      defectCode: 'DEF-2026-0120',
      kmValue: 1025.89,
      bbox: {
        top: '65%',
        left: '10%',
        width: '25%',
        height: '25%',
        label: '[AI #DET-03] ĐÃ DUYỆT → DEF-2026-0120',
        dims: 'L: 1.2m • Rộng 15cm',
        borderColor: '#10B981'
      }
    },
    {
      id: 'DET-04',
      code: '#DET-04',
      stationing: 'Km 1026+420',
      lane: 'Vệt bánh xe',
      type: 'Bóng nước / Phản xạ',
      severityLevel: 'Bỏ qua',
      confidence: 62,
      description: 'Vũng nước phản xạ ánh nắng gây hiểu nhầm ổ gà',
      metrics: {
        dismissReason: 'Phản chiếu bóng cây và đọng nước mặt đường sau mưa'
      },
      status: 'REJECTED',
      kmValue: 1026.42,
      bbox: {
        top: '40%',
        left: '50%',
        width: '20%',
        height: '20%',
        label: '[AI #DET-04] BỎ QUA - FALSE POSITIVE',
        dims: 'Độ tin cậy ban đầu: 62%',
        borderColor: '#94A3B8'
      }
    },
    {
      id: 'DET-05',
      code: '#DET-05',
      stationing: 'Km 1027+100',
      lane: 'Làn trái',
      type: 'Nứt chéo khe co giãn',
      severityLevel: 'L2 (Cần xử lý)',
      confidence: 79,
      description: 'Nứt chéo bề mặt khu vực tiếp giáp khe co giãn cầu vượt',
      metrics: {
        length: '0.95 m',
        crackWidth: '3.5 mm'
      },
      status: 'PENDING',
      kmValue: 1027.1,
      bbox: {
        top: '20%',
        left: '30%',
        width: '30%',
        height: '35%',
        label: '[AI #DET-05] Nứt chéo • 79%',
        dims: 'L: 0.95m • Khe: 3.5mm',
        borderColor: '#0284C7'
      }
    },
    {
      id: 'DET-06',
      code: '#DET-06',
      stationing: 'Km 1027+850',
      lane: 'Làn giữa',
      type: 'Bong tróc vi mô',
      severityLevel: 'L1 (Nhẹ)',
      confidence: 75,
      description: 'Bề mặt nhựa asphalt mất lớp nhựa mịn, trồi cát hạt',
      metrics: {
        area: '0.45 m²',
        depth: '1.2 cm'
      },
      status: 'PENDING',
      kmValue: 1027.85,
      bbox: {
        top: '55%',
        left: '60%',
        width: '22%',
        height: '25%',
        label: '[AI #DET-06] Bong tróc • 75%',
        dims: 'Diện tích: 0.45 m²',
        borderColor: '#0284C7'
      }
    },
    {
      id: 'DET-07',
      code: '#DET-07',
      stationing: 'Km 1028+600',
      lane: 'Làn xe tải',
      type: 'Hằn lún vệt bánh xe',
      severityLevel: 'L3 (Nghiêm trọng)',
      confidence: 86,
      description: 'Hằn lún sống trâu liên tục dọc vệt bánh xe tải nặng',
      metrics: {
        length: '4.5 m',
        depth: '3.2 cm'
      },
      status: 'PENDING',
      kmValue: 1028.6,
      bbox: {
        top: '25%',
        left: '15%',
        width: '24%',
        height: '60%',
        label: '[AI #DET-07] Lún vệt bánh xe • 86%',
        dims: 'Dài 4.5m • Lún sâu 3.2cm',
        borderColor: '#EF4444'
      }
    },
    {
      id: 'DET-08',
      code: '#DET-08',
      stationing: 'Km 1029+400',
      lane: 'Toàn mặt đường',
      type: 'Nứt ngang mặt đường',
      severityLevel: 'L2 (Trung bình)',
      confidence: 82,
      description: 'Vết nứt ngang vuông góc với tim đường xuyên suốt 2 làn xe',
      metrics: {
        length: '7.0 m',
        crackWidth: '2.8 mm'
      },
      status: 'PENDING',
      kmValue: 1029.4,
      bbox: {
        top: '48%',
        left: '5%',
        width: '90%',
        height: '14%',
        label: '[AI #DET-08] Nứt ngang • 82%',
        dims: 'L: 7.0m • Khe: 2.8mm',
        borderColor: '#F97316'
      }
    }
  ])

  // Trình phát mô phỏng tiến trình frame khi bấm Play
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= totalFrames) {
            setIsPlaying(false)
            return totalFrames
          }
          return prev + Math.floor(4 * playbackSpeed)
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed])

  // Lọc phát hiện theo Km
  const filteredDetections = detections.filter((d) => {
    if (kmFilter === 'KM_1024_1026') return d.kmValue >= 1024 && d.kmValue < 1026
    if (kmFilter === 'KM_1026_1028') return d.kmValue >= 1026 && d.kmValue < 1028
    if (kmFilter === 'KM_1028_1030') return d.kmValue >= 1028 && d.kmValue <= 1030
    return true
  })

  // Thống kê rà soát
  const totalCount = detections.length
  const approvedCount = detections.filter((d) => d.status === 'APPROVED').length
  const rejectedCount = detections.filter((d) => d.status === 'REJECTED').length
  const pendingCount = detections.filter((d) => d.status === 'PENDING').length
  const reviewedCount = approvedCount + rejectedCount
  const reviewProgressPercent = Math.round((reviewedCount / totalCount) * 100)

  // Điều kiện để được khóa Baseline: Độ phủ >= 95% và giải quyết 100% mục phát hiện
  const isBaselineLocked = coveragePercentage >= 95 && pendingCount === 0

  // Duyệt phát hiện AI -> Tạo Defect OPEN
  const handleApproveDetection = (id: string) => {
    const defectCodeGenerated = `DEF-2026-0${Math.floor(100 + Math.random() * 900)}`
    setDetections((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'APPROVED',
              defectCode: defectCodeGenerated,
              metrics: { ...d.metrics, reviewer: 'KS. Đỗ Quốc Hoàng' }
            }
          : d
      )
    )
    showToast(`Đã phê duyệt ${id}! Hệ thống đã tự động khởi tạo Hồ sơ khiếm khuyết mã ${defectCodeGenerated}.`)
  }

  // Báo sai (False Positive)
  const handleRejectDetection = (id: string) => {
    setDetections((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'REJECTED',
              metrics: { ...d.metrics, dismissReason: 'Xác minh thực tế: Nhiễu bóng đổ và phản xạ ánh sáng.' }
            }
          : d
      )
    )
    showToast(`Đã đánh dấu ${id} là Báo sai (False Positive). Dữ liệu này được gửi ngược về huấn luyện Road-YOLOv9.`)
  }

  // Chọn mục phát hiện để focus
  const handleSelectDetection = (item: AIDetectionItem) => {
    setSelectedDetectionId(item.id)
    showToast(`Đã định vị khung hình ${item.code} tại lý trình ${item.stationing}`)
  }

  // Gửi lệnh bay quét bổ sung
  const handleSubmitReFlight = () => {
    setCoveragePercentage(98)
    setHasBlindspot(false)
    setIsReFlightModalOpen(false)
    showToast('Đã tiếp nhận nhiệm vụ bay bổ sung QL1A-MS-04B! Tỷ lệ độ phủ ảnh đã cập nhật đạt 98% (PASS).')
  }

  // Khóa Baseline tim tuyến
  const handleLockBaseline = () => {
    if (!isBaselineLocked) {
      alert('Chưa đủ điều kiện khóa Baseline: Cần độ phủ ≥ 95% và giải quyết hết các mục chờ rà soát!')
      return
    }
    showToast('Đoạn đường Km 1024 - Km 1030 đã chính thức KHÓA BASELINE THÀNH CÔNG! Bản đồ hoàn công số đã được kích hoạt.')
  }

  const selectedItem = detections.find((d) => d.id === selectedDetectionId) || detections[0]

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal Yêu Cầu Bay Bổ Sung */}
      {isReFlightModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-base">Lập Lệnh Bay Quét Bổ Sung (Re-flight)</h3>
              </div>
              <button
                onClick={() => setIsReFlightModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Điểm mù trắc địa hiện tại:</strong> Khu vực Km 1027+100 bị khuất bóng cây và rào chắn, độ phủ dải giữa chỉ đạt 68%. Cần bay quét góc nghiêng Oblique 45° để bù đắp dữ liệu.
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Chỉ dẫn kỹ thuật cho Phi công Drone:</label>
              <textarea
                rows={3}
                value={pilotNote}
                onChange={(e) => setPilotNote(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Thiết bị dự kiến:</span>
                <span className="font-bold text-slate-800">DJI Matrice 300 RTK</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-400 block">Độ phân giải GSD yêu cầu:</span>
                <span className="font-bold text-slate-800">≤ 0.35 cm/pixel</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsReFlightModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitReFlight}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#C9A227] hover:bg-[#B38E1F] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <PlaneTakeoff className="w-3.5 h-3.5" />
                <span>Xác nhận phát lệnh bay bù</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BREADCRUMB & HEADER TOPBAR */}
      <section className="bg-white rounded-xl px-5 py-4 shadow-2xs border border-brand-border flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link to="/pm/dashboard" className="hover:text-brand-gold transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/pm/surveys" className="hover:text-brand-gold transition-colors">
              Khảo sát
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">Nhiệm vụ bay QL1A-MS-04</span>
          </nav>

          {/* Thiết bị khảo sát RTK Fix Widget nhỏ gọn */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-xs">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="text-slate-500 text-[11px]">DJI Matrice 300 RTK</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              RTK Fix: 100%
            </span>
          </div>
        </div>

        {/* Title and Top Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-1 border-t border-slate-100">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-brand-dark tracking-tight">
                Khảo sát Drone: Đợt bay quét QL1A (Đoạn Km 1024 - 1030)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                #MS-2026-0924
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                Đang rà soát AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Thu thập ảnh Nadir độ phân giải trắc địa phục vụ số hóa bề mặt và kiểm định độ võng nứt gãy cơ học.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* AI Status Button */}
            <button
              onClick={() => showToast('Mô hình Road-YOLOv9 đang xử lý batch 16 frames trên GPU Cloud')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang xử lý phân tích AI (Mã phản hồi: 202)</span>
            </button>

            {/* Re-flight Button */}
            <button
              onClick={() => setIsReFlightModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              type="button"
            >
              <PlaneTakeoff className="w-3.5 h-3.5 text-slate-500" />
              <span>Yêu cầu bay bổ sung</span>
            </button>

            {/* Baseline Lock Button with Tooltip */}
            <div className="relative group">
              <button
                onClick={handleLockBaseline}
                disabled={!isBaselineLocked}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                  isBaselineLocked
                    ? 'bg-[#C9A227] hover:bg-[#B38E1F] text-white cursor-pointer active:scale-98'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
                type="button"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Xác nhận Baseline đoạn đường</span>
              </button>

              {!isBaselineLocked && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white rounded-xl text-xs shadow-xl hidden group-hover:block z-50 pointer-events-none">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Chưa thể khóa Baseline: Độ phủ mới đạt {coveragePercentage}% (&lt; 95%) và còn {pendingCount} phát hiện AI chưa được rà soát.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3-DIMENSIONAL DATA QUALITY INGEST ASSESSMENT (ISO/IEC 19157:2013) */}
      <section className="bg-white border border-brand-border rounded-xl p-4 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Verified className="w-5 h-5 text-[#C9A227]" />
            <h2 className="font-bold text-sm text-brand-dark">
              Đánh giá 3 chiều chất lượng dữ liệu bay (Tri-axial Quality Ingest Assessment)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Giao thức kiểm định: ISO/IEC 19157:2013</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dimension 1: Corridor */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                <span className="text-xs text-brand-dark font-bold">1. Vị trí & Hành lang (Corridor)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PASS (Hợp lệ)
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Độ lệch tim bay:</span>
                <span className="font-mono font-bold text-slate-800">0.85m (&lt; 1.2m)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Tần số RTK-GPS:</span>
                <span className="font-mono font-semibold text-slate-800">10Hz Đồng bộ</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Góc nghiêng Gimbal:</span>
                <span className="font-mono font-semibold text-slate-800">90° Nadir Chuẩn</span>
              </div>
            </div>
          </div>

          {/* Dimension 2: Integrity & SRT */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                <span className="text-xs text-brand-dark font-bold">2. Toàn vẹn tệp & SRT Metadata</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PASS
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Mã băm SHA-256:</span>
                <span className="font-mono font-bold text-slate-800">4f9d..a82e (OK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Đồng bộ RTK:</span>
                <span className="font-mono font-semibold text-slate-800">1,920 / 1,920 frames</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Tốc độ trập:</span>
                <span className="font-mono font-semibold text-slate-800">1/1200s (Sắc nét)</span>
              </div>
            </div>
          </div>

          {/* Dimension 3: Coverage */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                <span className="text-xs text-brand-dark font-bold">3. Tỷ lệ phủ hình ảnh</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  coveragePercentage >= 95
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {coveragePercentage >= 95 ? `ĐẠT (${coveragePercentage}%)` : `CẢNH BÁO (${coveragePercentage}%)`}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Phủ dọc / Phủ ngang:</span>
                <span className="font-mono font-bold text-slate-800">
                  {coveragePercentage >= 95 ? '92% | 85%' : '82% | 68%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Điểm mù trắc địa:</span>
                <button
                  onClick={() => {
                    if (hasBlindspot) {
                      setCurrentFrame(1680)
                      showToast('Đã định vị camera tới điểm mù dải phân cách giữa tại Km 1027+100')
                    }
                  }}
                  className={`font-mono font-bold truncate max-w-[150px] cursor-pointer hover:underline ${
                    hasBlindspot ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {hasBlindspot ? 'Km 1027+100 (Xem)' : 'Không có (Đã phủ kín)'}
                </button>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Yêu cầu tiêu chuẩn:</span>
                <span className="font-mono font-semibold text-slate-800">≥ 95% Đồng nhất</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Ingest Guideline Callout */}
        <div className="flex items-start gap-2 bg-sky-50 text-sky-900 p-2.5 rounded-lg border border-sky-200 text-xs">
          <Lightbulb className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Quy tắc thẩm định hạ tầng:</strong> Bay đúng hành lang không đồng nghĩa đủ độ phủ. Hệ thống yêu cầu tối thiểu <span className="font-bold underline decoration-sky-500 decoration-2">≥ 95% độ phủ chuẩn trắc địa</span> để cấp phép khóa Baseline đoạn đường và kết xuất bản đồ hoàn công số.
          </p>
        </div>
      </section>

      {/* ASYNC AI JOB PROGRESS BAR */}
      <section className="bg-white border border-brand-border rounded-xl p-3.5 shadow-2xs flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#C9A227] animate-pulse" />
            <span className="font-bold text-slate-800">
              Mô hình nhận diện Road-YOLOv9 (Civil Infrastructure Edge AI) - Đang xử lý bất đồng bộ
            </span>
          </div>
          <span className="text-slate-500">
            Tiến độ: <strong className="text-slate-800 font-mono">74%</strong> (Đã phân tích 1,420 / 1,920 frames) • Ước tính còn lại: ~ 1 phút 20 giây
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-[#C9A227] rounded-full transition-all duration-500 relative flex items-center justify-end pr-1"
            style={{ width: '74%' }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Batch Size: 16
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              Tốc độ: 42 FPS
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-mono font-medium">
              GPU: NVIDIA RTX 4090 Cloud Instance
            </span>
          </div>
          <span className="text-[#8F7212] font-semibold">Tự động nạp khung phát hiện theo thời gian thực</span>
        </div>
      </section>

      {/* INTERACTIVE AI REVIEW WORKSPACE (60/40 SPLIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (60% ~ 7 cols): DRONE VIEWER & AI BOUNDING BOX OVERLAY */}
        <section
          className={`lg:col-span-7 bg-white border border-brand-border rounded-xl shadow-2xs overflow-hidden flex flex-col ${
            isCanvasFullscreen ? 'fixed inset-4 z-50 max-w-none h-auto' : ''
          }`}
        >
          {/* Canvas Header */}
          <div className="p-3 bg-slate-50 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[#C9A227]" />
              <div>
                <h3 className="font-bold text-xs text-brand-dark leading-tight">
                  Khung hình trích xuất #FR-{currentFrame}
                </h3>
                <span className="font-mono text-[11px] text-slate-500">
                  Đoạn trắc lượng: {selectedItem.stationing} • Cảm biến RGB Sony Alpha 7R V
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {/* Toggle AI Layer Button */}
              <button
                type="button"
                onClick={() => {
                  setIsAiOverlayVisible(!isAiOverlayVisible)
                  showToast(isAiOverlayVisible ? 'Đã tắt lớp AI Bounding Box.' : 'Đã bật lớp AI Bounding Box.')
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                  isAiOverlayVisible
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isAiOverlayVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Lớp AI ({isAiOverlayVisible ? 'Bật' : 'Tắt'})</span>
              </button>

              {/* Snapshot Button */}
              <button
                onClick={() => showToast(`Đã xuất ảnh chụp trắc địa khung hình #FR-${currentFrame}.png`)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="Chụp ảnh khung hình"
                type="button"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsCanvasFullscreen(!isCanvasFullscreen)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                title="Toàn màn hình Canvas"
                type="button"
              >
                {isCanvasFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Canvas Viewport with Asphalt Drone Photo + Dynamic AI Bounding Boxes */}
          <div className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden select-none group">
            {/* Ảnh chụp trắc địa mặt đường thực tế từ trên cao */}
            <img
              alt="Surface Road Drone Frame"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1578873375969-d65275e7a938?w=1400&auto=format&fit=crop&q=80"
            />

            {/* Vignette Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none"></div>

            {/* AI Bounding Boxes (Chỉ hiển thị khi isAiOverlayVisible === true) */}
            {isAiOverlayVisible && (
              <>
                {/* Bounding Box 1: Ổ gà DET-01 */}
                <div
                  onClick={() => handleSelectDetection(detections[0])}
                  style={{
                    top: detections[0].bbox.top,
                    left: detections[0].bbox.left,
                    width: detections[0].bbox.width,
                    height: detections[0].bbox.height,
                    borderColor: detections[0].bbox.borderColor
                  }}
                  className={`absolute border-2 rounded-lg transition-all cursor-pointer ${
                    selectedDetectionId === 'DET-01'
                      ? 'shadow-[0_0_20px_rgba(239,68,68,0.8)] ring-2 ring-white scale-102'
                      : 'shadow-[0_0_12px_rgba(239,68,68,0.4)] opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Corner marks */}
                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white"></div>

                  {/* Label tag */}
                  <div className="absolute -top-7 left-0 bg-red-600 text-white px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap text-[11px] font-mono font-bold">
                    <AlertTriangle className="w-3 h-3 text-white" />
                    <span>{detections[0].bbox.label}</span>
                  </div>

                  {/* Dimensions badge */}
                  <div className="absolute -bottom-6 right-0 bg-slate-900/90 backdrop-blur-md text-white px-2 py-0.5 rounded font-mono text-[10px] shadow">
                    {detections[0].bbox.dims}
                  </div>
                </div>

                {/* Bounding Box 2: Nứt dọc DET-02 */}
                <div
                  onClick={() => handleSelectDetection(detections[1])}
                  style={{
                    top: detections[1].bbox.top,
                    left: detections[1].bbox.left,
                    width: detections[1].bbox.width,
                    height: detections[1].bbox.height,
                    borderColor: detections[1].bbox.borderColor
                  }}
                  className={`absolute border-2 border-dashed rounded-lg transition-all cursor-pointer ${
                    selectedDetectionId === 'DET-02'
                      ? 'shadow-[0_0_20px_rgba(249,115,22,0.8)] ring-2 ring-white scale-102'
                      : 'shadow-[0_0_12px_rgba(249,115,22,0.4)] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="absolute -top-7 left-0 bg-amber-600 text-white px-2 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap text-[10px] font-mono font-bold">
                    <Sliders className="w-3 h-3" />
                    <span>{detections[1].bbox.label}</span>
                  </div>
                  <div className="absolute -bottom-6 left-0 bg-slate-900/85 backdrop-blur-md text-white px-1.5 py-0.5 rounded font-mono text-[10px]">
                    {detections[1].bbox.dims}
                  </div>
                </div>
              </>
            )}

            {/* Drone Nadir Reticle (Tâm ngắm trắc địa) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
              <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Telemetry HUD Overlay Bottom Left */}
            <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2.5 text-[11px] font-mono pointer-events-none shadow-md border border-slate-700/60">
              <span className="flex items-center gap-1 text-sky-300">
                <MapPin className="w-3.5 h-3.5" />
                16.0544° N, 108.2022° E
              </span>
              <span className="text-slate-500">|</span>
              <span>AGL: 45.0m</span>
              <span className="text-slate-500">|</span>
              <span>V: 4.2 m/s</span>
              <span className="text-slate-500">|</span>
              <span className="text-[#FEF08A] font-bold">GSD: 0.35 cm/px</span>
            </div>
          </div>

          {/* Video Timeline Scrubber & Player Controls */}
          <div className="p-3 bg-white flex flex-col gap-2 border-t border-slate-200">
            <div className="flex items-center justify-between font-mono text-xs text-slate-500">
              <span className="text-slate-800 font-bold">02:14</span>
              <span className="text-xs">
                Đang xem: <strong>{selectedItem.stationing}</strong> (Frame {currentFrame} / {totalFrames})
              </span>
              <span>03:45</span>
            </div>

            {/* Scrubber track */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                setCurrentFrame(Math.floor(ratio * totalFrames))
              }}
              className="w-full bg-slate-100 h-2 rounded-full relative cursor-pointer group"
            >
              <div
                className="bg-[#C9A227] h-full rounded-full transition-all"
                style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
              ></div>

              {/* Defect marker dots along timeline */}
              {detections.map((d) => {
                const percent = ((d.kmValue - 1024) / (1030 - 1024)) * 100
                const dotColor =
                  d.status === 'APPROVED'
                    ? 'bg-emerald-500'
                    : d.status === 'REJECTED'
                    ? 'bg-slate-400'
                    : d.confidence >= 90
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                return (
                  <div
                    key={d.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectDetection(d)
                    }}
                    style={{ left: `${percent}%` }}
                    className={`absolute top-0 bottom-0 w-2 ${dotColor} rounded-full transition-transform hover:scale-150`}
                    title={`${d.code}: ${d.type} tại ${d.stationing}`}
                  ></div>
                )
              })}

              {/* Scrubber thumb */}
              <div
                style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 bg-[#C9A227] rounded-full shadow border-2 border-white pointer-events-none"
              ></div>
            </div>

            {/* Player buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentFrame((prev) => Math.max(1, prev - 50))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Lùi 50 frames"
                  type="button"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-full bg-[#C9A227] hover:bg-[#B38E1F] text-white shadow-xs flex items-center justify-center cursor-pointer transition-all"
                  title={isPlaying ? 'Tạm dừng' : 'Phát'}
                  type="button"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setCurrentFrame((prev) => Math.min(totalFrames, prev + 50))}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  title="Tiến 50 frames"
                  type="button"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Speed toggle */}
                <button
                  onClick={() => setPlaybackSpeed((s) => (s === 1.0 ? 2.0 : s === 2.0 ? 0.5 : 1.0))}
                  className="font-mono text-[11px] text-slate-500 hover:text-slate-800 ml-2 px-2 py-0.5 rounded bg-slate-100 cursor-pointer"
                >
                  {playbackSpeed}x Speed
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/pm/projects/prj-ql1a-02/alignment"
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Xem trên GIS (MapLibre)</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN (40% ~ 5 cols): AI DETECTION LIST & TRIAGE AUDIT */}
        <section className="lg:col-span-5 bg-white border border-brand-border rounded-xl shadow-2xs p-4 flex flex-col gap-3">
          {/* Header & Filter Chips */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#C9A227]" />
                <h3 className="font-bold text-sm text-brand-dark">Danh sách phát hiện AI</h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {totalCount} mục / Km 1024 - 1030
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setKmFilter('ALL')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'ALL'
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setKmFilter('KM_1024_1026')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'KM_1024_1026'
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Km 1024 - 1026 (3)
              </button>
              <button
                type="button"
                onClick={() => setKmFilter('KM_1026_1028')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'KM_1026_1028'
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Km 1026 - 1028 (3)
              </button>
              <button
                type="button"
                onClick={() => setKmFilter('KM_1028_1030')}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  kmFilter === 'KM_1028_1030'
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Km 1028 - 1030 (2)
              </button>
            </div>
          </div>

          {/* Detections Card Stack */}
          <div className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredDetections.map((item) => {
              const isSelected = item.id === selectedDetectionId
              const isApproved = item.status === 'APPROVED'
              const isRejected = item.status === 'REJECTED'

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectDetection(item)}
                  className={`p-3 rounded-xl border transition-all flex flex-col gap-2 relative overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/40 border-[#C9A227] ring-1 ring-[#C9A227] shadow-xs'
                      : isApproved
                      ? 'bg-emerald-50/30 border-emerald-200 opacity-90'
                      : isRejected
                      ? 'bg-slate-50 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Left accent color bar */}
                  <div
                    style={{
                      backgroundColor: isApproved
                        ? '#10B981'
                        : isRejected
                        ? '#94A3B8'
                        : item.confidence >= 90
                        ? '#EF4444'
                        : '#F97316'
                    }}
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                  ></div>

                  <div className="flex items-start justify-between gap-2 pl-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{item.code}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
                        {item.stationing}
                      </span>
                      <span className="text-[11px] text-slate-500">{item.lane}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-slate-200 text-slate-600'
                          : item.confidence >= 90
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isApproved
                        ? `ĐÃ DUYỆT → ${item.defectCode}`
                        : isRejected
                        ? 'BỎ QUA - FALSE POSITIVE'
                        : `${item.type} • ${item.confidence}%`}
                    </span>
                  </div>

                  <p
                    className={`text-xs pl-1 font-medium ${
                      isRejected ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.description}
                  </p>

                  {/* Metrics preview */}
                  <div className="grid grid-cols-2 gap-2 text-xs pl-1 text-slate-500">
                    {item.metrics.area && (
                      <div>
                        Diện tích: <strong className="font-mono text-slate-800">{item.metrics.area}</strong>
                      </div>
                    )}
                    {item.metrics.depth && (
                      <div>
                        Độ sâu: <strong className="font-mono text-red-600">{item.metrics.depth}</strong>
                      </div>
                    )}
                    {item.metrics.length && (
                      <div>
                        Chiều dài: <strong className="font-mono text-slate-800">{item.metrics.length}</strong>
                      </div>
                    )}
                    {item.metrics.crackWidth && (
                      <div>
                        Độ hở: <strong className="font-mono text-amber-600">{item.metrics.crackWidth}</strong>
                      </div>
                    )}
                    {item.metrics.reviewer && (
                      <div className="col-span-2 text-[11px] text-emerald-700">
                        Người duyệt: <strong>{item.metrics.reviewer}</strong>
                      </div>
                    )}
                    {item.metrics.dismissReason && (
                      <div className="col-span-2 text-[11px] text-slate-500 italic">
                        Lý do: {item.metrics.dismissReason}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons (Chỉ hiện khi chưa duyệt hoặc rejected) */}
                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1 pl-1 border-t border-slate-100 mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApproveDetection(item.id)
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Phê duyệt tạo Defect OPEN</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRejectDetection(item.id)
                        }}
                        className="py-1.5 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Báo sai</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Triage Audit Summary Footer */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>
                Đã rà soát: <strong className="text-[#8F7212] font-mono">{reviewedCount}/{totalCount} mục</strong>
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-700">Hợp lệ: {approvedCount}</span>
                <span className="text-slate-300">•</span>
                <span className="text-red-600">Báo sai: {rejectedCount}</span>
                <span className="text-slate-300">•</span>
                <span className="text-sky-700">Chờ duyệt: {pendingCount}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C9A227] h-full rounded-full transition-all duration-300"
                style={{ width: `${reviewProgressPercent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 italic leading-snug">
              * Chỉ sau khi giải quyết 100% mục chờ duyệt và bay bù độ phủ ≥ 95%, hệ thống mới kích hoạt nút Khóa Baseline.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
