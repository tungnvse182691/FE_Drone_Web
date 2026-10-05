import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../utils/maplibre'
import { CheckCircle2, X } from 'lucide-react'

import { RiskPortfolioItem } from './dashboard/types'
import { REGION_PROJECTS, MOCK_RISK_ITEMS } from './dashboard/mockData'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { DashboardTopMetrics } from './dashboard/DashboardTopMetrics'
import { DashboardRiskMapTable } from './dashboard/DashboardRiskMapTable'
import { DashboardRightCards } from './dashboard/DashboardRightCards'
import { DashboardExportModal } from './dashboard/DashboardExportModal'

export type { RiskPortfolioItem } from './dashboard/types'
export { REGION_PROJECTS } from './dashboard/mockData'

export const SupDashboard: React.FC = () => {
  const navigate = useNavigate()

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('2026-08')
  const [selectedRegion, setSelectedRegion] = useState('ALL')
  const [selectedProject, setSelectedProject] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sort States cho bảng danh mục rủi ro
  const [sortField, setSortField] = useState<'risk_level' | 'project_name' | 'chainage' | 'open_defects_count' | 'sla_status'>('open_defects_count')
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  // Toggle Sort handler
  const handleToggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false) // Mặc định giảm dần (lỗi nhiều/nguy cấp lên trước)
    }
  }

  // Handle Region Change: Khi đổi khu vực, tự động đồng bộ danh sách dự án
  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion)
    if (newRegion !== 'ALL') {
      const allowed = REGION_PROJECTS[newRegion]?.map((p) => p.id) || []
      if (!allowed.includes(selectedProject)) {
        setSelectedProject('ALL')
      }
    }
  }

  // Export Dossier RPT-01 / RPT-07 Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'PDF_A' | 'ZIP_PACKAGE'>('PDF_A')
  const [isExporting, setIsExporting] = useState(false)

  // Map Interactive States
  const [activePinId, setActivePinId] = useState<string>('risk-01')
  const [mapLayer, setMapLayer] = useState<'satellite' | 'vector'>('satellite')

  // MapLibre Refs
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Đã làm mới dữ liệu danh mục bảo hành và tính toán lại các chỉ số KPI!')
    }, 600)
  }

  // Filtered & Sorted Risk Items (Lọc theo cả Khu vực & Dự án, kết hợp Sắp xếp)
  const filteredRiskItems = useMemo(() => {
    const result = MOCK_RISK_ITEMS.filter((item: RiskPortfolioItem) => {
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false
      if (selectedProject !== 'ALL' && item.project_id !== selectedProject) return false
      return true
    })

    return [...result].sort((a: RiskPortfolioItem, b: RiskPortfolioItem) => {
      let comparison = 0
      if (sortField === 'open_defects_count') {
        comparison = a.open_defects_count - b.open_defects_count
      } else if (sortField === 'risk_level') {
        const weight = { Critical: 3, Watch: 2, Moderate: 1 }
        comparison = weight[a.risk_level] - weight[b.risk_level]
      } else if (sortField === 'project_name') {
        comparison = a.project_name.localeCompare(b.project_name, 'vi')
      } else if (sortField === 'chainage') {
        comparison = a.chainage_display.localeCompare(b.chainage_display, 'vi')
      } else if (sortField === 'sla_status') {
        const slaWeight = { urgent: 3, warning: 2, normal: 1 }
        comparison = slaWeight[a.sla_status] - slaWeight[b.sla_status]
      }
      return sortAsc ? comparison : -comparison
    })
  }, [selectedRegion, selectedProject, sortField, sortAsc])

  // Active pin item
  const activePinItem = useMemo(() => {
    return filteredRiskItems.find((i) => i.id === activePinId) || filteredRiskItems[0] || MOCK_RISK_ITEMS[0]
  }, [filteredRiskItems, activePinId])

  // MapLibre Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn({ duration: 300 })
  }
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut({ duration: 300 })
  }
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || filteredRiskItems.length === 0) return
    const bounds = new maplibregl.LngLatBounds()
    filteredRiskItems.forEach((it) => bounds.extend([it.gps_lng, it.gps_lat]))
    mapInstanceRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 })
  }

  const handleFocusPin = (item: RiskPortfolioItem) => {
    setActivePinId(item.id)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [item.gps_lng, item.gps_lat],
        zoom: 14.5,
        speed: 1.2,
        curve: 1.4
      })
    }
  }

  // Handle Trigger Export
  const handleTriggerExport = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setIsExportModalOpen(false)
      showToast(
        exportFormat === 'PDF_A'
          ? 'Đã tạo thành công Báo cáo Hồ sơ Bằng chứng (RPT-01.pdf) tiêu chuẩn PDF/A!'
          : 'Đã đóng gói thành công Danh mục Bảo hành & Toàn vẹn dữ liệu (RPT-07.zip) kèm mã SHA-256!'
      )
    }, 1200)
  }

  // Init MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: getMapLibreStyle('SATELLITE'),
        center: [108.2025, 16.0547],
        zoom: 11,
        minZoom: 5,
        maxZoom: 18,
        pitch: 25,
        bearing: -10
      })

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')
      mapInstanceRef.current = map
    } else {
      const styleUrl = getMapLibreStyle(mapLayer === 'satellite' ? 'SATELLITE' : 'STREETS')
      mapInstanceRef.current.setStyle(styleUrl)
    }

    return () => {
      // cleanup when unmount
    }
  }, [mapLayer])

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    filteredRiskItems.forEach((item) => {
      const isSelected = item.id === activePinId
      const el = document.createElement('div')
      el.className = 'cursor-pointer transition-transform duration-200'
      el.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)'

      const badgeColor =
        item.risk_level === 'Critical'
          ? 'bg-rose-600 border-rose-200 text-white'
          : item.risk_level === 'Watch'
          ? 'bg-amber-600 border-amber-200 text-white'
          : 'bg-blue-600 border-blue-200 text-white'

      el.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border ${badgeColor} whitespace-nowrap mb-1">
            ${item.route_code}: ${item.open_defects_count} lỗi
          </div>
          <div class="w-4 h-4 rounded-full ${item.risk_level === 'Critical' ? 'bg-rose-500' : item.risk_level === 'Watch' ? 'bg-amber-500' : 'bg-blue-500'} border-2 border-white shadow-lg animate-pulse"></div>
        </div>
      `

      el.addEventListener('click', () => {
        handleFocusPin(item)
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.gps_lng, item.gps_lat])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [filteredRiskItems, activePinId])

  // Cleanup Map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // KPI Metrics (5 dự án bảo hành, 1 dự án sắp hết hạn)
  const totalActiveProjects = 5
  const expiringProjectsCount = 1
  const pendingBaselineKm = 14.5

  return (
    <div className="space-y-6 pb-12 font-sansation text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200 font-sansation">
          <CheckCircle2 className="w-5 h-5 text-[#C9A227] shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Filter Controls Bar */}
      <DashboardHeader
        showToast={showToast}
        onResetFilters={() => {
          setSelectedMonth('2026-08')
          setSelectedRegion('ALL')
          setSelectedProject('ALL')
          setSortField('open_defects_count')
          setSortAsc(false)
          showToast('Đã đặt lại bộ lọc và sắp xếp mặc định!')
        }}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedRegion={selectedRegion}
        handleRegionChange={handleRegionChange}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        isRefreshing={isRefreshing}
        handleRefresh={handleRefresh}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Dashboard Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Sub-Column (8 cols): KPIs + Map + Risk Table */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <DashboardTopMetrics
              totalActiveProjects={totalActiveProjects}
              expiringProjectsCount={expiringProjectsCount}
              pendingBaselineKm={pendingBaselineKm}
            />

            <DashboardRiskMapTable
              mapContainerRef={mapContainerRef}
              mapLayer={mapLayer}
              setMapLayer={setMapLayer}
              activePinId={activePinId}
              activePinItem={activePinItem}
              filteredRiskItems={filteredRiskItems}
              sortField={sortField}
              sortAsc={sortAsc}
              onToggleSort={handleToggleSort}
              onFocusPin={handleFocusPin}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onFitBounds={handleFitBounds}
            />
          </div>

          {/* Right Sub-Column (4 cols): SLA, Audit Trail, PCI */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <DashboardRightCards
              onNavigateAuditTrail={() => navigate('/sup/audit-trail')}
              onNavigateRiskAnalytics={() => navigate('/sup/risk-analytics')}
            />
          </div>
        </div>
      </div>

      {/* Export Dossier Modal */}
      <DashboardExportModal
        selectedProject={selectedProject}
        selectedMonth={selectedMonth}
        isExportModalOpen={isExportModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        isExporting={isExporting}
        onTriggerExport={handleTriggerExport}
        filteredCount={filteredRiskItems.length}
      />
    </div>
  )
}
