import { useState, useRef, useMemo, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { RiskPortfolioItem } from './types'
import { REGION_PROJECTS, MOCK_RISK_ITEMS } from './mockData'

export function useSupDashboardState() {
  const [selectedMonth, setSelectedMonth] = useState('2026-08')
  const [selectedRegion, setSelectedRegion] = useState('ALL')
  const [selectedProject, setSelectedProject] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [sortField, setSortField] = useState<
    'risk_level' | 'project_name' | 'chainage' | 'open_defects_count' | 'sla_status'
  >('open_defects_count')
  const [sortAsc, setSortAsc] = useState<boolean>(false)

  const handleToggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion)
    if (newRegion !== 'ALL') {
      const allowed = REGION_PROJECTS[newRegion]?.map((p) => p.id) || []
      if (!allowed.includes(selectedProject)) {
        setSelectedProject('ALL')
      }
    }
  }

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'PDF_A' | 'ZIP_PACKAGE'>('PDF_A')
  const [isExporting, setIsExporting] = useState(false)

  const [activePinId, setActivePinId] = useState<string>('risk-01')
  const [mapLayer, setMapLayer] = useState<'satellite' | 'vector'>('satellite')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Đã làm mới dữ liệu danh mục bảo hành và tính toán lại các chỉ số KPI!')
    }, 600)
  }

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

  const activePinItem = useMemo(() => {
    return filteredRiskItems.find((i) => i.id === activePinId) || filteredRiskItems[0] || MOCK_RISK_ITEMS[0]
  }, [filteredRiskItems, activePinId])

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
  }, [mapLayer])

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

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const resetFilters = () => {
    setSelectedMonth('2026-08')
    setSelectedRegion('ALL')
    setSelectedProject('ALL')
    setSortField('open_defects_count')
    setSortAsc(false)
    showToast('Đã đặt lại bộ lọc và sắp xếp mặc định!')
  }

  return {
    selectedMonth,
    setSelectedMonth,
    selectedRegion,
    selectedProject,
    setSelectedProject,
    isRefreshing,
    toastMessage,
    setToastMessage,
    sortField,
    sortAsc,
    handleToggleSort,
    handleRegionChange,
    isExportModalOpen,
    setIsExportModalOpen,
    exportFormat,
    setExportFormat,
    isExporting,
    activePinId,
    mapLayer,
    setMapLayer,
    mapContainerRef,
    showToast,
    handleRefresh,
    filteredRiskItems,
    activePinItem,
    handleZoomIn,
    handleZoomOut,
    handleFitBounds,
    handleFocusPin,
    handleTriggerExport,
    resetFilters
  }
}
