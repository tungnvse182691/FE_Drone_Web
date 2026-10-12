import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { ExportRecord, AsyncExportJob, Rpt06RiskSegment, ProjectConfig } from './types'
import { PROJECTS_CONFIG } from './data'
import { computeProjectMetrics, filterAndSortRecords } from './riskAnalyticsCalculations'
import { reportService } from '../../../api/services/reportService'
import { projectService, HubProject } from '../../../api/services/projectService'

export function useRiskAnalyticsState() {
  const [projects, setProjects] = useState<HubProject[]>([])
  const [projectsConfig, setProjectsConfig] = useState<Record<string, ProjectConfig>>(PROJECTS_CONFIG)
  const [selectedProject, setSelectedProject] = useState('prj-ql1a-02')
  const [selectedTimeRange, setSelectedTimeRange] = useState('Q3_2026')
  const [selectedTrack, setSelectedTrack] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'FAILED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const [sortField, setSortField] = useState<
    'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status'
  >('as_of_timestamp')
  const [sortAsc, setSortAsc] = useState(false)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentProject = useMemo(() => {
    const base = projectsConfig[selectedProject] || PROJECTS_CONFIG[selectedProject] || PROJECTS_CONFIG['prj-ql1a-02']
    return computeProjectMetrics(base, selectedTrack, selectedTimeRange)
  }, [projectsConfig, selectedProject, selectedTrack, selectedTimeRange])

  const [activeJob, setActiveJob] = useState<AsyncExportJob | null>(null)
  const [exportRecords, setExportRecords] = useState<ExportRecord[]>([])

  // RPT-06 Deterioration Risks & GIS State
  const [rpt06Segments, setRpt06Segments] = useState<Rpt06RiskSegment[]>([])
  const [mainlineCoords, setMainlineCoords] = useState<[number, number][]>([])
  const [activeSegmentId, setActiveSegmentId] = useState<string>('rpt06-ql1a-01')
  const [mapLayer, setMapLayer] = useState<'satellite' | 'vector'>('satellite')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isTimeRangeModalOpen, setIsTimeRangeModalOpen] = useState(false)
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ExportRecord | null>(null)

  const [exportForm, setExportForm] = useState({
    reportType: 'DOSSIER_COMPLETE',
    scope: 'PRJ-QL1A-02',
    asOfDate: '2026-08-25T21:45',
    includeOriginalFiles: true,
    includeSha256Checksum: true,
    compressRawTiff: false,
    format: 'ZIP_PDF'
  })

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  // Load initial data from async Mock API (No localStorage!)
  const loadData = useCallback(async () => {
    try {
      const [records, job, segments, mainline, projectList] = await Promise.all([
        reportService.getExportRecords(),
        reportService.getActiveJob(),
        reportService.getRpt06DeteriorationRisks(selectedProject),
        reportService.getProjectMainline(selectedProject),
        projectService.fetchProjects()
      ])
      setProjects(projectList)
      setExportRecords(records as ExportRecord[])
      if (job) {
        setActiveJob(job as AsyncExportJob)
      }
      setRpt06Segments(segments as Rpt06RiskSegment[])
      setMainlineCoords(mainline)
      if (segments.length > 0) {
        setActiveSegmentId(segments[0].id)
      }

      // Xây dựng cấu hình động cho toàn bộ dự án từ projectService
      const configMap: Record<string, ProjectConfig> = { ...PROJECTS_CONFIG }
      projectList.forEach((p) => {
        if (!configMap[p.id]) {
          configMap[p.id] = {
            id: p.id,
            code: p.code,
            name: p.name,
            shortName: p.name.length > 25 ? p.code : p.name,
            route: p.code,
            chainage: p.stationing_text || `Km 0+000 → Km ${(p.length_km || 10).toFixed(1)}`,
            serverNode: `Trạm giám sát ${p.code}`,
            met01_ratio: p.warranty_passed_percent ? Math.min(95, Math.max(60, p.warranty_passed_percent)) : 78.4,
            met01_change: '+2.5% so với kỳ trước',
            met01_completed_text: `${Math.max(1, (p.open_defects || 0) * 3)}/${Math.max(2, (p.open_defects || 0) * 4)} khiếm khuyết xử lý đúng hạn cam kết`,
            met01_target: 75.0,
            met04_mtta: 3.2,
            met04_change: '-0.8 ngày',
            met04_sup_days: 2.1,
            met04_pm_days: 1.1,
            met08_recurrence: 3.8,
            met08_status: 'ĐẠT CHUẨN',
            met08_note: 'Mặt đường ổn định, tuân thủ TCVN 8819:2011',
            met11_integrity: 99.8,
            met11_items_text: '100% hồ sơ & ảnh đối soát hợp lệ'
          }
        }
      })
      setProjectsConfig(configMap)
    } catch {
      // Fallback
    }
  }, [selectedProject])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Lắng nghe sự kiện toàn hệ thống để cập nhật danh sách dự án tức thì
  useEffect(() => {
    const handleStateChange = () => {
      loadData()
    }
    window.addEventListener('roadguard_state_change', handleStateChange)
    return () => {
      window.removeEventListener('roadguard_state_change', handleStateChange)
    }
  }, [loadData])

  // Cập nhật scope khi chọn dự án
  useEffect(() => {
    if (selectedProject && selectedProject !== 'ALL') {
      const code = projectsConfig[selectedProject]?.code || selectedProject.toUpperCase()
      setExportForm((prev) => ({ ...prev, scope: code }))
    }
  }, [selectedProject, projectsConfig])

  // Background worker progress simulation
  useEffect(() => {
    if (!activeJob || activeJob.status !== 'PROCESSING') return
    const interval = setInterval(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'PROCESSING') return prev
        if (prev.progress >= 98) {
          showToast(`Tác vụ #${prev.id} đã hoàn tất đóng gói hồ sơ!`)
          return {
            ...prev,
            progress: 100,
            status: 'COMPLETED',
            estimatedSecondsRemaining: 0
          }
        }
        const nextProgress = Math.min(prev.progress + 3, 98)
        const nextItems = Math.min(Math.floor((nextProgress / 100) * prev.totalItems), prev.totalItems)
        const nextTime = Math.max(Math.round(((100 - nextProgress) / 100) * 20), 2)
        return {
          ...prev,
          progress: nextProgress,
          processedItems: nextItems,
          estimatedSecondsRemaining: nextTime
        }
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [activeJob?.status, showToast])

  const processedRecords = useMemo(() => {
    return filterAndSortRecords(
      exportRecords,
      selectedProject,
      statusFilter,
      selectedTimeRange,
      selectedTrack,
      searchQuery,
      sortField,
      sortAsc
    )
  }, [exportRecords, selectedProject, statusFilter, selectedTimeRange, selectedTrack, searchQuery, sortField, sortAsc])

  const activeSegment = useMemo(() => {
    return rpt06Segments.find((s) => s.id === activeSegmentId) || rpt06Segments[0]
  }, [rpt06Segments, activeSegmentId])

  // Đồng bộ nguồn dữ liệu GeoJSON đường tim tuyến và các dải phân đoạn nứt lún lên MapLibre
  const syncMapGeometry = useCallback(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!map.isStyleLoaded()) {
      map.once('load', () => syncMapGeometry())
      return
    }

    // 1. Tuyến đường tim tuyến toàn dự án (LineString chính)
    if (mainlineCoords && mainlineCoords.length > 1) {
      const mainlineGeoJson: GeoJSON.Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: mainlineCoords
        }
      }

      if (map.getSource('project-mainline')) {
        ;(map.getSource('project-mainline') as maplibregl.GeoJSONSource).setData(mainlineGeoJson)
      } else {
        map.addSource('project-mainline', {
          type: 'geojson',
          data: mainlineGeoJson
        })
      }

      if (!map.getLayer('project-mainline-casing')) {
        map.addLayer({
          id: 'project-mainline-casing',
          type: 'line',
          source: 'project-mainline',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#0F172A',
            'line-width': 8,
            'line-opacity': 0.8
          }
        })
      }

      if (!map.getLayer('project-mainline-layer')) {
        map.addLayer({
          id: 'project-mainline-layer',
          type: 'line',
          source: 'project-mainline',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#94A3B8',
            'line-width': 4.5,
            'line-opacity': 0.95,
            'line-dasharray': [3, 1.5]
          }
        })
      }
    }

    // 2. Các phân đoạn suy thoái mặt đường rủi ro cao (RPT-06)
    const validSegments = rpt06Segments.filter((s) => s.coordinates && s.coordinates.length > 1)
    if (validSegments.length > 0) {
      const features: GeoJSON.Feature[] = validSegments.map((s) => ({
        type: 'Feature',
        properties: {
          id: s.id,
          color: s.risk_level === 'CRITICAL' ? '#E11D48' : s.risk_level === 'WATCH' ? '#F59E0B' : '#3B82F6',
          chainage: s.chainage_display
        },
        geometry: {
          type: 'LineString',
          coordinates: s.coordinates
        }
      }))

      const segmentsGeoJson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features
      }

      if (map.getSource('risk-segments')) {
        ;(map.getSource('risk-segments') as maplibregl.GeoJSONSource).setData(segmentsGeoJson)
      } else {
        map.addSource('risk-segments', {
          type: 'geojson',
          data: segmentsGeoJson
        })
      }

      // Viền phát quang (glow halo)
      if (!map.getLayer('risk-segments-halo')) {
        map.addLayer({
          id: 'risk-segments-halo',
          type: 'line',
          source: 'risk-segments',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 14,
            'line-opacity': 0.55,
            'line-blur': 4
          }
        })
      }

      // Nét vẽ chính của phân đoạn hư hỏng
      if (!map.getLayer('risk-segments-line')) {
        map.addLayer({
          id: 'risk-segments-line',
          type: 'line',
          source: 'risk-segments',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 6.5
          }
        })

        // Bắt sự kiện click vào đường phân đoạn để chọn
        map.on('click', 'risk-segments-line', (e) => {
          if (e.features && e.features[0]) {
            const clickedId = e.features[0].properties?.id
            if (clickedId) {
              setActiveSegmentId(clickedId)
            }
          }
        })

        map.on('mouseenter', 'risk-segments-line', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'risk-segments-line', () => {
          map.getCanvas().style.cursor = ''
        })
      }

      // Viền đứt nét màu trắng cho phân đoạn đang chọn
      if (!map.getLayer('risk-segments-selected')) {
        map.addLayer({
          id: 'risk-segments-selected',
          type: 'line',
          source: 'risk-segments',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          filter: ['==', ['get', 'id'], activeSegmentId],
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 8.5,
            'line-opacity': 0.95,
            'line-dasharray': [2, 1]
          }
        })
      } else {
        map.setFilter('risk-segments-selected', ['==', ['get', 'id'], activeSegmentId])
      }
    }
  }, [mainlineCoords, rpt06Segments, activeSegmentId])

  // 1. Khởi tạo bản đồ MapLibre duy nhất 1 lần khi component mount
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const defaultCenter: [number, number] = [108.1492, 16.2238]
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: defaultCenter,
      zoom: 12,
      minZoom: 5,
      maxZoom: 18,
      pitch: 25
    })

    // Đã xóa NavigationControl top-right bị trùng với nút zoom custom ở góc dưới phải (bottom-right)

    map.on('load', () => {
      syncMapGeometry()
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // 2. Chuyển đổi lớp vệ tinh / bản đồ số tức thì mà không làm mất các nguồn dữ liệu GeoJSON
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !map.isStyleLoaded()) return
    const isSat = mapLayer === 'satellite'
    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', isSat ? 'visible' : 'none')
    }
    if (map.getLayer('osm-layer')) {
      map.setLayoutProperty('osm-layer', 'visibility', !isSat ? 'visible' : 'none')
    }
  }, [mapLayer])

  // 3. Kích hoạt vẽ đường hình học khi dữ liệu hoặc phân đoạn chọn thay đổi
  useEffect(() => {
    const map = mapInstanceRef.current
    if (map) {
      if (map.isStyleLoaded()) {
        syncMapGeometry()
      } else {
        map.once('load', () => {
          syncMapGeometry()
        })
      }
    }
  }, [syncMapGeometry])

  // Render Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    rpt06Segments.forEach((item) => {
      const isSelected = item.id === activeSegmentId
      const el = document.createElement('div')
      el.className = 'cursor-pointer transition-transform duration-200'
      el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)'

      const badgeColor =
        item.risk_level === 'CRITICAL'
          ? 'bg-rose-600 border-rose-200 text-white'
          : item.risk_level === 'WATCH'
          ? 'bg-amber-600 border-amber-200 text-white'
          : 'bg-blue-600 border-blue-200 text-white'

      el.innerHTML = `
        <div class="flex flex-col items-center">
          <div class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border ${badgeColor} whitespace-nowrap mb-1">
            ${item.chainage_start}: ${item.open_defects_count} lỗi
          </div>
          <div class="w-4 h-4 rounded-full ${
            item.risk_level === 'CRITICAL' ? 'bg-rose-500' : item.risk_level === 'WATCH' ? 'bg-amber-500' : 'bg-blue-500'
          } border-2 border-white shadow-lg animate-pulse"></div>
        </div>
      `

      el.addEventListener('click', () => {
        setActiveSegmentId(item.id)
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.gps_lng, item.gps_lat])
        .addTo(map)

      markersRef.current.push(marker)
    })

    // If active segment changes, center map
    if (activeSegment && map) {
      map.flyTo({
        center: [activeSegment.gps_lng, activeSegment.gps_lat],
        zoom: 14,
        speed: 1.2
      })
    }
  }, [rpt06Segments, activeSegmentId, activeSegment])

  const handleFocusSegment = useCallback((segment: Rpt06RiskSegment) => {
    setActiveSegmentId(segment.id)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [segment.gps_lng, segment.gps_lat],
        zoom: 14.5,
        speed: 1.2,
        curve: 1.4
      })
    }
  }, [])

  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn({ duration: 300 })
  }, [])

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut({ duration: 300 })
  }, [])

  const handleFitBounds = useCallback(() => {
    if (!mapInstanceRef.current || rpt06Segments.length === 0) return
    const bounds = new maplibregl.LngLatBounds()
    rpt06Segments.forEach((s) => bounds.extend([s.gps_lng, s.gps_lat]))
    mapInstanceRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 })
  }, [rpt06Segments])

  const handleToggleSort = (field: 'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const handleCreateExportJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsExportModalOpen(false)

    try {
      const res = await reportService.createExportJob(exportForm)
      setActiveJob(res.job as AsyncExportJob)
      setExportRecords((prev) => [res.record as ExportRecord, ...prev])
      showToast(`Đã khởi tạo lệnh xuất hồ sơ (${res.job.id})!`)
    } catch {
      showToast('Có lỗi xảy ra khi tạo tác vụ xuất.')
    }
  }

  const handleCancelActiveJob = async () => {
    if (!activeJob) return
    await reportService.cancelExportJob(activeJob.id)
    setActiveJob((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null))
    showToast(`Đã dừng tác vụ ${activeJob.id}`)
  }

  const handleDeleteRecord = async (id: string, code: string) => {
    await reportService.deleteExportRecord(id)
    setExportRecords((prev) => prev.filter((r) => r.id !== id))
    showToast(`Đã xóa hồ sơ lưu trữ ${code}`)
  }

  const handleRetryRecord = async (id: string) => {
    try {
      const updated = await reportService.retryExportRecord(id)
      setExportRecords((prev) => prev.map((r) => (r.id === id ? (updated as ExportRecord) : r)))
      showToast('Đã gửi yêu cầu chạy lại tiến trình xuất!')
    } catch {
      showToast('Có lỗi khi khởi động lại tiến trình.')
    }
  }

  const handleDownloadFile = async (filename: string) => {
    const res = await reportService.downloadExportFile(filename)
    showToast(`Đang tải tệp: ${res.fileName} (Chứng thực mã băm SHA-256 hợp lệ)`)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    showToast('Dữ liệu chỉ số KPI, bản đồ rủi ro và hàng đợi xuất đã được đồng bộ mới nhất!')
  }

  const resetFilters = () => {
    setSelectedProject('prj-ql1a-02')
    setSelectedTimeRange('Q3_2026')
    setSelectedTrack('ALL')
    setStatusFilter('ALL')
    setSearchQuery('')
    setSortField('as_of_timestamp')
    setSortAsc(false)
    showToast('Đã đặt lại toàn bộ bộ lọc và sắp xếp mặc định')
  }

  return {
    projects,
    projectsConfig,
    selectedProject,
    setSelectedProject,
    selectedTimeRange,
    setSelectedTimeRange,
    selectedTrack,
    setSelectedTrack,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortAsc,
    setSortAsc,
    isRefreshing,
    toastMessage,
    currentProject,
    activeJob,
    exportRecords,
    isExportModalOpen,
    setIsExportModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isTimeRangeModalOpen,
    setIsTimeRangeModalOpen,
    selectedRecordForDetail,
    setSelectedRecordForDetail,
    exportForm,
    setExportForm,
    showToast,
    processedRecords,
    rpt06Segments,
    activeSegmentId,
    activeSegment,
    mapContainerRef,
    mapLayer,
    setMapLayer,
    handleFocusSegment,
    handleZoomIn,
    handleZoomOut,
    handleFitBounds,
    handleToggleSort,
    handleCreateExportJob,
    handleCancelActiveJob,
    handleDeleteRecord,
    handleRetryRecord,
    handleDownloadFile,
    handleRefresh,
    resetFilters
  }
}
