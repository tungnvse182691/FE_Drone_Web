import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { ExportRecord, AsyncExportJob, Rpt06RiskSegment, ProjectConfig } from './types'
import {useAuthStore} from '../../../store/authStore'
import {projectExportService,exportError,exportPeriod,type ExportJob,type ExportManifest} from '../../../api/services/projectExportService'
import { filterAndSortRecords } from './riskAnalyticsCalculations'
import { projectService, HubProject } from '../../../api/services/projectService'

export function useRiskAnalyticsState() {
  const [projects, setProjects] = useState<HubProject[]>([])
  const [projectsConfig, setProjectsConfig] = useState<Record<string, ProjectConfig>>({})
  const [selectedProject, setSelectedProject] = useState('ALL')
  const [selectedTimeRange, setSelectedTimeRange] = useState('ALL')
  const [selectedTrack, setSelectedTrack] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PROCESSING' | 'FAILED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const [sortField, setSortField] = useState<
    'as_of_timestamp' | 'code' | 'scope_display' | 'file_size_mb' | 'status'
  >('as_of_timestamp')
  const [sortAsc, setSortAsc] = useState(false)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const epoch=useAuthStore(s=>s.authEpoch),userId=useAuthStore(s=>s.user?.id),role=useAuthStore(s=>s.user?.role),actorScope=`${epoch}:${userId}:${role}`
  const currentScope=useRef(`${actorScope}:${selectedProject}`);currentScope.current=`${actorScope}:${selectedProject}`
  const requestId=useRef(0),detailId=useRef(0),exportController=useRef<AbortController|null>(null)
  useEffect(()=>()=>exportController.current?.abort(),[actorScope,selectedProject])
  const [apiError,setApiError]=useState(''),[exportBusy,setExportBusy]=useState(false),[detailError,setDetailError]=useState('')
  const emptyProject:ProjectConfig={id:selectedProject,code:projects.find(p=>p.id===selectedProject)?.code||'Chọn dự án',name:projects.find(p=>p.id===selectedProject)?.name||'Chưa chọn dự án',shortName:'',route:'',chainage:'Chưa có lý trình',serverNode:'Chưa có dữ liệu',met01_ratio:NaN,met01_change:'Chưa có dữ liệu chỉ số',met01_completed_text:'Chưa nối nguồn chỉ số SLA',met01_target:NaN,met04_mtta:NaN,met04_change:'Chưa có dữ liệu chỉ số',met04_sup_days:NaN,met04_pm_days:NaN,met08_recurrence:NaN,met08_status:'BÌNH THƯỜNG',met08_note:'Chưa nối nguồn tỷ lệ tái phát',met11_integrity:NaN,met11_items_text:'Đối chiếu từng manifest và nội dung tải xuống'}
  const currentProject=projectsConfig[selectedProject]||emptyProject
  const record=(job:ExportJob,manifest?:ExportManifest):ExportRecord=>({id:job.id,code:job.id,project_id:job.projectId,project_code:projects.find(p=>p.id===job.projectId)?.code||job.projectId,quarter:`Q${Math.floor(new Date(job.createdAt).getMonth()/3)+1}_${new Date(job.createdAt).getFullYear()}`,track:'ALL',type:job.kind==='DOSSIER'?'Hồ sơ kỹ thuật':'Dữ liệu huấn luyện',type_badge_color:'',type_category_name:job.kind,dossier_no:job.snapshotId||'Đọc chi tiết để lấy snapshot',scope_display:job.projectId,as_of_time:job.createdAt,as_of_timestamp:Date.parse(job.createdAt),file_size:'Đọc nội dung để xác định',file_size_mb:NaN,format_display:job.format,status:job.status==='SUCCEEDED'?'COMPLETED':job.status==='FAILED'?'FAILED':'PROCESSING',error_message:job.errorCode||undefined,hash_sha256:job.snapshotHash,total_items:manifest?.files.length,server:job,manifest})

  const [activeJob, setActiveJob] = useState<AsyncExportJob | null>(null)
  const [exportRecords, setExportRecords] = useState<ExportRecord[]>([])

  // RPT-06 Deterioration Risks & GIS State
  const [rpt06Segments, setRpt06Segments] = useState<Rpt06RiskSegment[]>([])
  const [mainlineCoords, setMainlineCoords] = useState<[number, number][]>([])
  const [activeSegmentId, setActiveSegmentId] = useState<string>('')
  const [mapLayer, setMapLayer] = useState<'satellite' | 'vector'>('satellite')

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isTimeRangeModalOpen, setIsTimeRangeModalOpen] = useState(false)
  const [selectedRecordForDetail, setDetailRecord] = useState<ExportRecord | null>(null)

  const [exportForm, setExportForm] = useState({
    reportType: 'DOSSIER',
    scope: '',
    asOfDate: '',fromDate:'',
    includeOriginalFiles: false,
    includeSha256Checksum: true,
    compressRawTiff: false,
    format: ''
  })

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }, [])

  useEffect(()=>{let live=true;setProjects([]);setProjectsConfig({});projectService.fetchProjects().then(rows=>{if(!live)return;setProjects(rows);setProjectsConfig(Object.fromEntries(rows.map(p=>[p.id,{...emptyProject,id:p.id,code:p.code,name:p.name,shortName:p.name,chainage:p.stationing_text||'Chưa có lý trình'}])))}).catch(e=>{if(live)setApiError(exportError(e))});return()=>{live=false}},[actorScope])
  const loadData=useCallback(async()=>{
    const scope=`${actorScope}:${selectedProject}`,n=++requestId.current
    setExportRecords([]);setActiveJob(null);setApiError('');setRpt06Segments([]);setMainlineCoords([])
    if(selectedProject==='ALL')return
    try{const rows=await projectExportService.list(selectedProject);if(currentScope.current!==scope||requestId.current!==n)return;setExportRecords(rows.map(r=>record(r)))
      const running=rows.find(r=>r.status==='QUEUED'||r.status==='RUNNING');if(running)setActiveJob({id:running.id,name:running.kind,progress:NaN,processedItems:NaN,totalItems:NaN,estimatedSecondsRemaining:NaN,tempSizeMb:NaN,status:'PROCESSING'})
    }catch(e){if(currentScope.current===scope&&requestId.current===n)setApiError(exportError(e))}
  },[actorScope,selectedProject,projects])
  useEffect(()=>{setDetailRecord(null);setDetailError('');setIsPreviewModalOpen(false);setIsExportModalOpen(false);setExportBusy(false);void loadData()},[loadData])
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
      const code = selectedProject
      setExportForm((prev) => ({ ...prev, scope: code }))
    }
  }, [selectedProject, projectsConfig])

  // Only GET refreshes existing jobs; no timer creates, retries or invents progress.
  useEffect(()=>{if(!activeJob||activeJob.status!=='PROCESSING')return;const timer=setInterval(()=>{void loadData()},10000);return()=>clearInterval(timer)},[activeJob?.id,activeJob?.status,loadData])

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

  const setSelectedRecordForDetail=async(r:ExportRecord)=>{
    const scope=currentScope.current,n=++detailId.current;setDetailRecord(r);setDetailError('');setIsPreviewModalOpen(true)
    try{const value=await projectExportService.manifest(r.project_id,r.id);if(currentScope.current!==scope||detailId.current!==n)return;setDetailRecord(record(value.detail,value.manifest))}catch(e){if(currentScope.current===scope&&detailId.current===n)setDetailError(exportError(e))}
  }
  let held:ReturnType<typeof projectExportService.pending>=null,journalError=''
  try{if(selectedProject!=='ALL')held=projectExportService.pending(selectedProject)}catch(e){journalError=(e as Error).message}
  const openExport=(open:boolean)=>{
    if(open&&selectedProject==='ALL'){setApiError('Chọn dự án cụ thể trước khi xuất hồ sơ.');return}
    const local=(iso?:string)=>{if(!iso)return '';const d=new Date(iso);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
    if(open)setExportForm({reportType:held?.body.kind||'DOSSIER',scope:selectedProject,asOfDate:local(held?.body.to),fromDate:local(held?.body.from),includeOriginalFiles:held?.body.includeOriginalFiles||false,includeSha256Checksum:true,compressRawTiff:false,format:held?.body.format||''})
    setIsExportModalOpen(open)
  }
  const handleCreateExportJob=async(e:React.FormEvent)=>{
    e.preventDefault();if(exportBusy)return;const scope=currentScope.current;setExportBusy(true);setApiError('')
    try{if(exportForm.scope!==selectedProject)throw new Error('Dự án của yêu cầu đã thay đổi; mở lại form để xác nhận.');const input=held?.body||{kind:'DOSSIER' as const,format:exportForm.format as 'PDF'|'ZIP',includeOriginalFiles:exportForm.includeOriginalFiles,...exportPeriod(exportForm.fromDate,exportForm.asOfDate)};const controller=new AbortController();exportController.current=controller;const job=await projectExportService.create(selectedProject,input,controller.signal);if(currentScope.current!==scope)return;setIsExportModalOpen(false);await loadData();if(currentScope.current===scope)showToast(`Đã GET xác nhận yêu cầu ${job.id}; trạng thái ${job.status}.`)}catch(e){if(currentScope.current===scope)setApiError(exportError(e))}finally{if(currentScope.current===scope)setExportBusy(false)}
  }
  const handleCancelActiveJob=()=>{setApiError('Chưa có lệnh hủy export trong contract hiện tại; không thay trạng thái tác vụ.')}
  const handleDeleteRecord=()=>{setApiError('Chưa có lệnh xóa export trong contract hiện tại; hồ sơ vẫn được giữ.')}
  const handleRetryRecord=async(id:string)=>{const r=exportRecords.find(r=>r.id===id);if(r)await setSelectedRecordForDetail(r)}
  const handleDownloadFile=async(id:string)=>{
    const scope=currentScope.current;setApiError('')
    try{const r=exportRecords.find(r=>r.id===id);if(!r)throw new Error('Chọn export từ danh mục thật; không tải theo tên file mẫu.');const content=await projectExportService.content(r.project_id,r.id);if(currentScope.current!==scope)return;const url=URL.createObjectURL(content.blob);const a=document.createElement('a');a.href=url;a.download=content.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast(`Đã đối chiếu SHA-256 nội dung tải: ${content.checksum}`)}catch(e){if(currentScope.current===scope)setApiError(exportError(e))}
  }
  const handleRefresh=async()=>{setIsRefreshing(true);await loadData();setIsRefreshing(false)}

  const resetFilters = () => {
    setSelectedProject('ALL')
    setSelectedTimeRange('ALL')
    setSelectedTrack('ALL')
    setStatusFilter('ALL')
    setSearchQuery('')
    setSortField('as_of_timestamp')
    setSortAsc(false)
    showToast('Đã đặt lại toàn bộ bộ lọc và sắp xếp mặc định')
  }

  return {
    apiError,detailError,exportBusy,held,journalError,
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
    setIsExportModalOpen:openExport,
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
