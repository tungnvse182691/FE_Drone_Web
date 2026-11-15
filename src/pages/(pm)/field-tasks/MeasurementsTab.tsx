import {fieldEvidenceReuseCommands,type ReuseSource} from '../../../api/services/fieldEvidenceReuseCommands'
import {fieldCreateCommands,type FieldDefectOption} from '../../../api/services/fieldCreateCommands'
import {TriageGeometryScope} from '../ai-review/TriageGeometryScope'
import type {TriageGeometryPins} from '../../../api/services/triageGeometryService'
import { FieldTaskReadDetails } from './FieldTaskReadDetails'
import React, { useState, useMemo } from 'react'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { FieldTask, Project, HubProject } from '../../../types/domain'
import { SafeImage } from '../../../components/common/SafeImage'
import {
  fieldTaskService,
} from '../../../api/services/fieldTaskService'
import { PhotoLightboxModal } from '../../../components/common/PhotoLightboxModal'
import { ImageComparisonSlider } from '../../../components/common/ImageComparisonSlider'

export interface MeasurementsTabProps {
  fieldTasks: FieldTask[]
  onRefreshTasks: (projId?: string) => Promise<void>
  highlightCode: string | null
  isLoading?: boolean
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void
  isSupervisor?: boolean
  selectedProjectId?: string
  projects?: (Project | HubProject)[]
}

export const MeasurementsTab: React.FC<MeasurementsTabProps> = ({
  fieldTasks,
  onRefreshTasks,
  highlightCode,
  isLoading = false,
  showToast,
  isSupervisor = false,
  selectedProjectId = 'ALL',
  projects = []
}) => {
  const createContext = React.useRef({project:selectedProjectId,active:true})
  if(createContext.current.project!==selectedProjectId)createContext.current={project:selectedProjectId,active:true}
  React.useEffect(()=>{const context=createContext.current;context.active=true;return()=>{context.active=false}},[selectedProjectId])
  // Bộ lọc trạng thái & từ khóa
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Hàm thông báo an toàn
  const notify = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (showToast) {
      showToast(msg, type)
    }
  }

  // Danh mục khiếm khuyết trong dự án để PM chọn khi tạo lệnh đo đạc
  // Danh mục khiếm khuyết trong dự án từ CSDL Backend để PM chọn khi tạo lệnh đo đạc
  const [availableDefects, setAvailableDefects] = useState<FieldDefectOption[]>([])

  const [catalogError,setCatalogError]=useState('')
  const [crewError,setCrewError]=useState('')
  const [defectsLoading,setDefectsLoading]=useState(false)
  const [crewMembers,setCrewMembers]=useState<{id:string;name:string}[]>([])
  const [selectedCrewId,setSelectedCrewId]=useState('')
  React.useEffect(()=>{const c=new AbortController();setAvailableDefects([]);setCrewMembers([]);setCatalogError('');setCrewError('');setSelectedCrewId('');setDefectsLoading(false)
    const error=(e:any)=>e?.response?`HTTP ${e.response.status} ${e.response.data?.code||e.message}`:e.message
    if(!isSupervisor&&selectedProjectId!=='ALL'){
      setDefectsLoading(true)
      fieldCreateCommands.defects(selectedProjectId,c.signal).then(defects=>{if(!c.signal.aborted)setAvailableDefects(defects)}).catch(e=>{if(!c.signal.aborted)setCatalogError(`Không tải được Defect: ${error(e)}`)}).finally(()=>{if(!c.signal.aborted)setDefectsLoading(false)})
      fieldCreateCommands.crews(selectedProjectId).then(crews=>{if(!c.signal.aborted)setCrewMembers(crews)}).catch(e=>{if(!c.signal.aborted)setCrewError(`Không tải được Crew: ${error(e)}`)})
    }
    return()=>c.abort()
  },[selectedProjectId,isSupervisor])

  // Modal Tạo nhiệm vụ mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createModalError, setCreateModalError] = useState<string | null>(null)
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)


  const [selectedDefectId, setSelectedDefectId] = useState<string>('')
  const [newDefectCode, setNewDefectCode] = useState('')
  const [newDefectName, setNewDefectName] = useState('')
  const [newMethod, setNewMethod] = useState('')
  const [isCustomMethod, setIsCustomMethod] = useState(false)
  const [customMethodText, setCustomMethodText] = useState('')
  const [newNotes, setNewNotes] = useState('')

  const [newMeasurementType,setNewMeasurementType]=useState(0),[newDueAt,setNewDueAt]=useState('')
  const [createScope,setCreateScope]=useState<{project:string;enabled?:boolean;pins?:TriageGeometryPins}>({project:''})
  let heldCreate:ReturnType<typeof fieldCreateCommands.pending>=null,createJournalError=''
  try{if(!isSupervisor&&selectedProjectId!=='ALL')heldCreate=fieldCreateCommands.pending(selectedProjectId)}catch(e){createJournalError=(e as Error).message}
  const selectedDefect=availableDefects.find(d=>d.id===selectedDefectId)
  const isSelectedDefectEligible=!!selectedDefect&&selectedDefect.status.toUpperCase()==='OPEN'
  const selectedDefectStatusReason=selectedDefect&&!isSelectedDefectEligible?'Chỉ Defect OPEN được tạo phiếu FIELD.':null
  const handleSelectDefect=(id:string)=>{setCreateScope({project:selectedProjectId});setNewMeasurementType(0);setSelectedDefectId(id);const d=availableDefects.find(r=>r.id===id);setNewDefectCode(d?.code||'');setNewDefectName(d?.defect_type||'')}
  const handleOpenCreateModal=()=>{
    if(isSupervisor||selectedProjectId==='ALL'){notify('Chọn một dự án thật trước khi tạo FIELD.','error');return}
    setCreateModalError(null);setIsCustomMethod(false);setCustomMethodText('');setCreateScope({project:selectedProjectId})
    setSelectedDefectId(heldCreate?.input.defectId||'');setNewDefectCode(heldCreate?.input.defectId||'');setNewDefectName('');setNewMethod(heldCreate?.input.measurementScope||'');setNewNotes(heldCreate?.input.instructions||'');setSelectedCrewId(heldCreate?.input.assignedToUserId||'');setNewMeasurementType(heldCreate?.input.requiredMeasurementType||0);setNewDueAt(heldCreate?.input.dueAt||'');setIsCreateModalOpen(true)
  }

  // Modal Ghi nhận số đo
  const [isSubmitValueModalOpen, setIsSubmitValueModalOpen] = useState(false)
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState<FieldTask | null>(null)
  const [inputMeasuredValue, setInputMeasuredValue] = useState<number>(38)
  const [submitNotes, setSubmitNotes] = useState<string>('')

  // Modal Xem chi tiết & Ảnh thước đo
  const [selectedDetailTask, setSelectedDetailTask] = useState<FieldTask | null>(null)
  const [modalPhotoTab, setModalPhotoTab] = useState<'RULER' | 'DRONE' | 'SPLIT' | 'REUSED'>('RULER')

  // Modal Lightbox Phóng to ảnh & So sánh song song
  const [lightboxTask, setLightboxTask] = useState<FieldTask | null>(null)
  const [lightboxInitialMode, setLightboxInitialMode] = useState<'PRIMARY' | 'SECONDARY' | 'SPLIT'>('PRIMARY')

  // Modal Tái sử dụng ảnh phản ánh (API-084 Evidence Reuse)
  const [isReuseModalOpen, setIsReuseModalOpen] = useState(false)
  const [taskForReuse, setTaskForReuse] = useState<FieldTask | null>(null)
  const [reuseReason,setReuseReason]=useState('')
  const [isSubmittingReuse,setIsSubmittingReuse]=useState(false)
  const [reuseSources,setReuseSources]=useState<ReuseSource[]>([]),[reuseChoice,setReuseChoice]=useState(''),[reuseError,setReuseError]=useState(''),[reuseLoading,setReuseLoading]=useState(false)
  const [reusePhoto,setReusePhoto]=useState<{url:string;checksum:string}|null>(null)
  const [reuseResult,setReuseResult]=useState<Awaited<ReturnType<typeof fieldEvidenceReuseCommands.result>>>(null)
  const reuseScope=`${isReuseModalOpen}:${taskForReuse?.project_id}:${taskForReuse?.id}`
  const latestReuse=React.useRef(reuseScope);latestReuse.current=reuseScope
  let reuseHeld:ReturnType<typeof fieldEvidenceReuseCommands.pending>=null,reuseJournalError=''
  try{if(!isSupervisor&&taskForReuse?.project_id)reuseHeld=fieldEvidenceReuseCommands.pending(taskForReuse.project_id,taskForReuse.id)}catch(e){reuseJournalError=(e as Error).message}
  const reuseSource=reuseSources.find(r=>r.evidence.evidenceId===reuseChoice)
  React.useEffect(()=>{const c=new AbortController();setReuseSources([]);setReuseChoice('');setReuseError('');setReusePhoto(null);setReuseResult(null);setReuseLoading(false)
    if(isReuseModalOpen&&!isSupervisor&&taskForReuse?.project_id){setReuseLoading(true)
      fieldEvidenceReuseCommands.sources(taskForReuse.project_id,taskForReuse.id,c.signal).then(rows=>{if(!c.signal.aborted)setReuseSources(rows)}).catch(e=>{if(!c.signal.aborted)setReuseError(e?.response?`HTTP ${e.response.status} ${e.response.data?.code||e.message}`:e.message)}).finally(()=>{if(!c.signal.aborted)setReuseLoading(false)})
      fieldEvidenceReuseCommands.result(taskForReuse.project_id,taskForReuse.id).then(result=>{if(!c.signal.aborted)setReuseResult(result)}).catch(e=>{if(!c.signal.aborted)setReuseError(e.message)})
    }return()=>c.abort()
  },[reuseScope,isSupervisor])
  React.useEffect(()=>{const c=new AbortController();let url='';setReusePhoto(null)
    if(reuseSource)fieldEvidenceReuseCommands.image(reuseSource,c.signal).then(image=>{if(!c.signal.aborted){url=URL.createObjectURL(image.blob);setReusePhoto({url,checksum:image.checksum})}}).catch(e=>{if(!c.signal.aborted)setReuseError(e?.response?`HTTP ${e.response.status} ${e.response.data?.code||e.message}`:e.message)})
    return()=>{c.abort();if(url)URL.revokeObjectURL(url)}
  },[reuseScope,reuseChoice])

  // Đếm theo từng trạng thái phục vụ hiển thị số lượng trên Tab lọc
  const counts = useMemo(() => {
    return {
      all: fieldTasks.length,
      assigned: fieldTasks.filter((t) => t.status === 'ASSIGNED').length,
      inProgress: fieldTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      submitted: fieldTasks.filter((t) => t.status === 'SUBMITTED').length,
      verified: fieldTasks.filter((t) => t.status === 'VERIFIED').length
    }
  }, [fieldTasks])

  // Lọc danh sách theo Tab trạng thái và Tìm kiếm
  const filteredTasks = useMemo(() => {
    return fieldTasks.filter((task) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false
      }
      // 2. Lọc theo từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase()
        const match =
          task.code.toLowerCase().includes(q) ||
          task.defect_code.toLowerCase().includes(q) ||
          task.measurement_type.toLowerCase().includes(q) ||
          task.technician_name.toLowerCase().includes(q) ||
          (task.lane && task.lane.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  }, [fieldTasks, statusFilter, searchTerm])

  // Xử lý tạo nhiệm vụ mới qua API
  const handleCreateTask = async (e:React.FormEvent)=>{
    e.preventDefault();if(isSubmittingCreate||isSupervisor)return
    const context=createContext.current,current=()=>context.active&&createContext.current===context
    setCreateModalError(null);setIsSubmittingCreate(true)
    try{
      if(selectedProjectId==='ALL')throw new Error('Chọn dự án cụ thể; không tự lấy dự án đầu tiên.')
      const target=availableDefects.find(d=>d.id===selectedDefectId),method=isCustomMethod?customMethodText.trim():newMethod
      if(!heldCreate&&(!target||!isSelectedDefectEligible||!method||createScope.project!==selectedProjectId||createScope.enabled&&!createScope.pins))throw new Error('Chọn Defect OPEN, phương pháp và phạm vi PUBLISHED thật.')
      const choice=heldCreate?.input||{defectId:target!.id,defectVersion:target!.version,routeVersionId:target!.route_version_id,assignedToUserId:selectedCrewId,requiredMeasurementType:newMeasurementType,measurementScope:method,instructions:newNotes,dueAt:newDueAt,...(createScope.pins?{pins:createScope.pins}:{})}
      const created=await fieldCreateCommands.request(selectedProjectId,choice)
      if(!current())return
      setIsCreateModalOpen(false);await onRefreshTasks();if(current())notify(`Đã GET xác nhận tạo phiếu FIELD ${created.id}.`,'success')
    }catch(e:any){if(!current())return;const message=e?.response?`HTTP ${e.response.status} ${e.response.data?.code||e.message}`:e.message;setCreateModalError(message);notify(message,'error')}finally{if(current())setIsSubmittingCreate(false)}
  }

  // Xử lý chuyển sang trạng thái Đang đo đạc (IN_PROGRESS)
  const handleStartMeasuring = async (taskId: string, code: string) => {
    setActionLoadingId(taskId)
    try {
      const task = fieldTasks.find((t) => t.id === taskId);
      const pId = task?.project_id || (selectedProjectId !== 'ALL' ? selectedProjectId : projects[0]?.id);
      if (!pId) throw new Error('Không xác định được dự án của phiếu đo đạc.');
      await fieldTaskService.startMeasuring(pId, taskId)
      await onRefreshTasks()
      notify(`Đã chuyển phiếu [${code}] sang trạng thái ĐANG ĐO ĐẠC ngoài hiện trường`, 'info')
    } catch (err: any) {
      notify(`Lỗi: ${err?.message || 'Không thể cập nhật'}`, 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Mở modal nhập số đo
  const handleOpenSubmitModal = (task: FieldTask) => {
    setSelectedTaskToSubmit(task)
    setInputMeasuredValue(task.measured_value || 42)
    setSubmitNotes(task.notes || '')
    setIsSubmitValueModalOpen(true)
  }

  // Xác nhận nộp số đo thực tế (chuyển sang SUBMITTED)
  const handleConfirmSubmitValue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTaskToSubmit) return

    setActionLoadingId(selectedTaskToSubmit.id)
    try {
      const pId = selectedTaskToSubmit.project_id || (selectedProjectId !== 'ALL' ? selectedProjectId : projects[0]?.id)
      if (!pId) throw new Error('Không xác định được dự án của phiếu đo đạc.')
      await fieldTaskService.recordMeasurement(
        pId,
        selectedTaskToSubmit.id,
        Number(inputMeasuredValue) || 40,
        submitNotes
      )
      const code = selectedTaskToSubmit.code
      const val = inputMeasuredValue
      setIsSubmitValueModalOpen(false)
      setSelectedTaskToSubmit(null)
      await onRefreshTasks()
      notify(`✅ Đã ghi nhận số đo thực tế ${val} mm cho phiếu [${code}] lên CSDL!`, 'success')
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Không thể ghi nhận số đo'
      notify(`❌ Lỗi: ${errMsg}`, 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Xác minh số liệu vào hồ sơ (chuyển sang VERIFIED)
  const handleVerifyTask = (taskId:string) => {
    const task=fieldTasks.find(item=>item.id===taskId)
    if(task){setSelectedDetailTask(old=>old?.id===task.id?old:task);setTimeout(()=>document.querySelector<HTMLSelectElement>('[aria-label="Quyết định review FIELD"]')?.focus(),0)}
    else notify('Không tìm thấy nhiệm vụ trong danh sách hiện tại; hãy đọc lại.','error')
  }

  // Mở modal phê duyệt tái sử dụng ảnh phản ánh (API-084)
  const handleOpenReuseModal = (task: FieldTask) => {
    setTaskForReuse(task)
    setReuseReason('')
    setIsReuseModalOpen(true)
  }

  // Xác nhận gọi API-084 Tái sử dụng ảnh phản ánh
  const handleConfirmReuseEvidence = async () => {
    if (!taskForReuse?.project_id||isSupervisor||isSubmittingReuse) return
    const scope=reuseScope,context=createContext.current
    setIsSubmittingReuse(true);setReuseError('')
    try {
      const result=await fieldEvidenceReuseCommands.request(taskForReuse.project_id,taskForReuse.id,reuseHeld?null:reuseSource||null,reuseHeld?.body.expectedChecksum||reusePhoto?.checksum||'',reuseHeld?.body.reason||reuseReason,reuseHeld?.version||taskForReuse.version||'')
      if(latestReuse.current!==scope||!context.active)return
      setReuseResult(result);await onRefreshTasks();if(latestReuse.current===scope&&context.active)notify('Đã đối chiếu receipt và GET bằng chứng tái sử dụng.','success')
    } catch(e:any){if(latestReuse.current===scope&&context.active)setReuseError(e?.response?`HTTP ${e.response.status} ${e.response.data?.code||e.message}`:e.message)}
    finally{if(latestReuse.current===scope&&context.active)setIsSubmittingReuse(false)}
  }

  return (
    <div className="rounded-[20px] overflow-hidden border border-[#E2E5E9] bg-white shadow-2xs">
      {/* Banner thông báo khi được chuyển tiếp từ Triage */}
      {highlightCode && (
        <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Icon name="bolt" size={16} className="text-[#C9A227]" />
            <span>
              Đang lọc theo hồ sơ Triage: <strong className="font-mono text-slate-900">{highlightCode}</strong>
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">Đã đồng bộ từ Hộp thư lỗi</span>
        </div>
      )}

      {/* TOOLBAR: FILTER TABS & ACTIONS */}
      <div className="p-3.5 border-b border-[#EDEFF2] bg-[#F8F9FA]/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Bộ lọc trạng thái (Pills) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              statusFilter === 'ALL'
                ? 'bg-[#1A1D20] text-white border-[#1A1D20] shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ASSIGNED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              statusFilter === 'ASSIGNED'
                ? 'bg-[#1A1D20] text-white border-[#1A1D20] shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
            }`}
          >
            Cần thực hiện ({counts.assigned})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
            }`}
          >
            Đang đo đạc ({counts.inProgress})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SUBMITTED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              statusFilter === 'SUBMITTED'
                ? 'bg-[#B45309] text-white border-[#B45309] shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
            }`}
          >
            Đã có số đo ({counts.submitted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              statusFilter === 'VERIFIED'
                ? 'bg-[#047857] text-white border-[#047857] shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-[#E2E5E9]'
            }`}
          >
            Đã xác minh ({counts.verified})
          </button>
        </div>

        {/* Search input & Nút Tạo nhiệm vụ */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã, lỗi, kỹ sư..."
              className="pl-8 pr-3 py-1.5 bg-white border border-[#E2E5E9] rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#C9A227] w-48 sm:w-56"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-3.5 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Icon name="add" size={15} />
            <span>Tạo nhiệm vụ</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#EDEFF2] bg-[#F8F9FA] text-slate-600">
              <th className="sticky left-0 bg-[#F8F9FA] z-10 py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 shadow-[1px_0_0_#EDEFF2] whitespace-nowrap">
                Mã Nhiệm Vụ
              </th>
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Khiếm Khuyết & Vị Trí</th>
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Phương Pháp Đo</th>
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Số Đo Thực Tế</th>
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Kỹ Sư Phụ Trách</th>
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap">Ảnh Đối Chứng</th>
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 text-center whitespace-nowrap">Trạng Thái</th>
              <th className="py-3.5 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600 text-right whitespace-nowrap">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEFF2]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Icon name="sync" size={16} className="animate-spin text-[#C9A227]" />
                    <span>Đang tải dữ liệu từ máy chủ...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A227] flex items-center justify-center border border-amber-200">
                        <Icon name="straighten" size={22} />
                      </div>
                      <div className="font-bold text-sm text-slate-800">Chưa có nhiệm vụ đo đạc nào trong CSDL</div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Tuyến đường này chưa phát sinh lệnh đo đạc hiện trường. PM có thể bấm "+ Tạo Nhiệm Vụ Đo Đạc" để chỉ định kỹ sư thực địa đo đạc bổ sung.
                      </p>
                    </div>
                  </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isHighlighted =
                  Boolean(highlightCode) &&
                  (task.defect_code.toLowerCase().includes(highlightCode!.toLowerCase()) ||
                    task.code.toLowerCase().includes(highlightCode!.toLowerCase()))
                const isProcessing = actionLoadingId === task.id

                return (
                  <tr
                    key={task.id}
                    className={`group transition-colors hover:bg-slate-50/80 border-b border-[#EDEFF2] ${
                      isHighlighted ? 'bg-amber-50/80 border-l-4 border-l-[#C9A227]' : ''
                    }`}
                  >
                    {/* Mã nhiệm vụ (Sticky trái) */}
                    <td className={`sticky left-0 z-10 py-3.5 px-4 font-mono font-medium text-slate-800 shadow-[1px_0_0_#EDEFF2] transition-colors ${
                      isHighlighted ? 'bg-amber-50/90' : 'bg-white group-hover:bg-slate-50/90'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailTask(task)}
                        className="flex items-center gap-1.5 hover:text-[#C9A227] text-left transition-colors cursor-pointer group/btn"
                        title="Bấm để xem chi tiết & ảnh phóng to"
                      >
                        {isHighlighted && <Icon name="bolt" size={13} className="text-[#C9A227]" />}
                        <span className="font-semibold underline decoration-slate-300 group-hover/btn:decoration-[#C9A227] underline-offset-2">
                          {task.code}
                        </span>
                      </button>
                    </td>

                    {/* Khiếm khuyết & Vị trí */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-900">{task.defect_code}</div>
                      {task.defect_name && (
                        <div className="text-[11px] text-slate-600 line-clamp-1">{task.defect_name}</div>
                      )}
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        Km {task.chainage_km} {task.lane ? `• ${task.lane}` : ''}
                      </div>
                    </td>

                    {/* Phương pháp đo */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                      <div className="line-clamp-2 leading-relaxed text-xs">{task.measurement_type}</div>
                    </td>

                    {/* Số đo thực tế */}
                    <td className="py-3.5 px-4 font-mono">
                      {task.status === 'ASSIGNED' ? (
                        <span className="text-slate-400 italic text-[11px]">Chưa đo</span>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <span className="text-[#1E40AF] italic text-[11px] flex items-center gap-1">
                          <Icon name="pending" size={13} />
                          <span>Đang thực hiện</span>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900 text-xs font-mono">
                          {task.measured_value} mm
                        </span>
                      )}
                    </td>

                    {/* Kỹ sư phụ trách */}
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      <span>{task.technician_name}</span>
                    </td>

                    {/* Ảnh đối chứng (Cặp Trước - Sau: Hiện trạng vs Thước đo) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {/* 1. ẢNH TRƯỚC (Before): Hiện trạng ban đầu hoặc Ảnh phản ánh được duyệt API-084 */}
                        {task.reused_evidence ? (
                          <div className="flex flex-col items-start gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setTaskForReuse(task)
                                setIsReuseModalOpen(true)
                              }}
                              className="relative group w-11 h-11 rounded-lg overflow-hidden border border-amber-400 ring-2 ring-amber-300/60 bg-slate-100 block cursor-pointer transition-transform hover:scale-105 shrink-0"
                              title={`Ảnh TRƯỚC: Đã duyệt tái sử dụng từ Phản ánh người dân (API-084)\nLý do: ${task.reused_evidence.reason}\n(Bấm để xem hồ sơ API-084)`}
                            >
                              <img
                                src={
                                  task.reused_evidence.photo_url ||
                                  task.defect_photo_url ||
                                  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=1200&auto=format&fit=crop&q=80'
                                }
                                alt="Ảnh phản ánh"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Icon name="zoom_in" size={14} />
                              </div>
                              <span className="absolute bottom-0 inset-x-0 text-[8px] font-mono font-bold text-center py-0.2 bg-amber-900/90 text-amber-200">
                                Trước • API-084
                              </span>
                            </button>
                          </div>
                        ) : task.defect_photo_url ? (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxTask(task)
                              setLightboxInitialMode('SECONDARY')
                            }}
                            className="relative group w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 block cursor-pointer transition-transform hover:scale-105 shrink-0"
                            title="Ảnh TRƯỚC: Hiện trạng khảo sát ban đầu từ Drone (Bấm để phóng to)"
                          >
                            <img
                              src={task.defect_photo_url}
                              alt="Ảnh Drone"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Icon name="zoom_in" size={14} />
                            </div>
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] font-mono font-bold text-amber-300 text-center py-0.2">
                              Trước • Drone
                            </span>
                          </button>
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center w-11 h-11 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 shrink-0"
                            title="Chưa có ảnh hiện trạng ban đầu"
                          >
                            <Icon name="hide_image" size={14} className="text-slate-400" />
                            <span className="text-[7px] font-medium leading-tight text-center text-slate-500 mt-0.5">
                              Không ảnh
                            </span>
                          </div>
                        )}

                        {/* 2. ẢNH SAU (After): Thước đo đối chứng từ Kỹ sư hiện trường */}
                        {task.evidence_photo_url ? (
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxTask(task)
                              setLightboxInitialMode('PRIMARY')
                            }}
                            className="relative group w-11 h-11 rounded-lg overflow-hidden border border-emerald-400 ring-2 ring-emerald-300/60 bg-slate-100 block cursor-pointer transition-transform hover:scale-105 shrink-0"
                            title="Ảnh SAU: Thước đo đối chứng từ Mobile do Kỹ sư nộp (Bấm để phóng to)"
                          >
                            <img
                              src={task.evidence_photo_url}
                              alt="Ảnh thước đo"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Icon name="zoom_in" size={14} />
                            </div>
                            <span className="absolute bottom-0 inset-x-0 text-[8px] font-mono font-bold text-center py-0.2 bg-emerald-900/90 text-emerald-200">
                              Sau • Thước đo
                            </span>
                          </button>
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center w-11 h-11 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 shrink-0"
                            title="Ảnh SAU: Đang chờ Kỹ sư hiện trường cắm thước đo chụp nộp về"
                          >
                            <Icon name="straighten" size={14} className="text-slate-400" />
                            <span className="text-[7px] font-medium leading-tight text-center text-slate-500 mt-0.5">
                              Chờ đo
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái (Pill 999px chuẩn spec) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {task.status === 'ASSIGNED' ? (
                        <span className="inline-block px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          CẦN THỰC HIỆN
                        </span>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <span className="inline-block px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#F0F9FF] text-[#1E40AF] border border-[#B8C5D9]">
                          ĐANG ĐO ĐẠC
                        </span>
                      ) : task.status === 'SUBMITTED' ? (
                        <span className="inline-block px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#E3D3AC]">
                          ĐÃ CÓ SỐ ĐO
                        </span>
                      ) : (
                        <span className="inline-block px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#F0FDF7] text-[#047857] border border-[#A7C4B8]">
                          {task.status==='VERIFIED'?'ĐÃ HOÀN TẤT FIELD':task.status==='SUPPLEMENT_REQUIRED'?'CẦN BỔ SUNG':'CHƯA ÁNH XẠ TRẠNG THÁI'}
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isProcessing ? (
                        <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                          <Icon name="sync" size={13} className="animate-spin" />
                          <span>Đang lưu...</span>
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Nút Tái sử dụng ảnh phản ánh (API-084) - Chỉ hiện khi chưa có ảnh đo thực tế hoặc đã được duyệt tái sử dụng */}
                          {task.reused_evidence ? (
                            <button
                              type="button"
                              onClick={() => handleOpenReuseModal(task)}
                              className="px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-200/70"
                              title={
                                isSupervisor
                                  ? 'Giám sát xem bằng chứng ảnh phản ánh đã tái sử dụng (API-084)'
                                  : 'Xem & cập nhật ảnh phản ánh đã phê duyệt tái sử dụng (API-084)'
                              }
                            >
                              <Icon name="history_edu" size={13} className="text-amber-700" />
                              <span>Xem ảnh phản ánh</span>
                            </button>
                          ) : !isSupervisor &&
                            !task.reused_evidence &&
                            (task.source_origin === 'CITIZEN_REPORT' ||
                              Boolean(task.linked_case_code)) &&
                            (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') ? (
                            <button
                              type="button"
                              onClick={() => handleOpenReuseModal(task)}
                              className="px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100"
                              title="Chỉ huy trưởng (PM) tái sử dụng ảnh từ nguồn phản ánh người dân làm bằng chứng đối chứng trước thi công (API-084)"
                            >
                              <Icon name="history_edu" size={13} className="text-amber-700" />
                              <span>Tái sử dụng ảnh</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => setSelectedDetailTask(task)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Xem chi tiết phiếu đo & ảnh phóng to"
                          >
                            <Icon name="visibility" size={13} className="text-slate-500" />
                            <span>Chi tiết & Ảnh</span>
                          </button>

                          {!isSupervisor && task.status === 'SUBMITTED' && (
                            <button
                              type="button"
                              onClick={() => setSelectedDetailTask(task)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Chỉ huy trưởng (PM) thẩm định ảnh đối chứng & xác minh số liệu"
                            >
                              <Icon name="check" size={13} />
                              <span>Xác minh số liệu</span>
                            </button>
                          )}

                          {task.status === 'VERIFIED' && (
                            <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                              <Icon name="check_circle" size={14} className="text-emerald-600" />
                              <span>Đã lưu</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: TẠO NHIỆM VỤ ĐO ĐẠC MỚI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Icon name="straighten" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tạo Nhiệm Vụ Đo Đạc Hiện Trường</h3>
                  <p className="text-[11px] text-slate-500">Chỉ định khiếm khuyết, phương pháp đo và người thực hiện</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              {heldCreate&&<p role="status" className="break-all">Giữ yêu cầu tạo FIELD {heldCreate.key} cho Defect {heldCreate.input.defectId}; dùng đúng body/key đã lưu để đối chiếu.</p>}
              {(catalogError||createJournalError)&&<p role="alert" className="text-rose-700">{catalogError||createJournalError}</p>}
              {crewError&&<p role="alert" className="text-rose-700">{crewError}</p>}
              <fieldset disabled={isSubmittingCreate||!!heldCreate} className="border-0 p-0 m-0 space-y-3.5 min-w-0">
              {/* Chọn khiếm khuyết nguồn từ đợt bay Drone / khảo sát */}
              <div className="flex flex-col bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Icon name="search_insights" size={15} className="text-[#C9A227]" />
                    <span>Chọn khiếm khuyết cần đo đạc</span>
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">
                    {defectsLoading?'Đang tải Defect…':catalogError?'Lỗi tải Defect':`${availableDefects.length} hồ sơ trong tuyến`}
                  </span>
                </div>
                <select
                  value={selectedDefectId}
                  onChange={(e) => handleSelectDefect(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#C9A227] cursor-pointer font-medium"
                >
                  <option value="">Chọn Defect nguồn</option>
                  {availableDefects.length === 0 ? (
                    <option value="">{defectsLoading?'Đang tải Defect…':catalogError?'Không tải được danh sách Defect':'Không có khiếm khuyết nào trong tuyến cần đo đạc'}</option>
                  ) : (
                    availableDefects.map((d) => {
                      const notOpen = d.status.toUpperCase()!=='OPEN'
                      const activeTask = fieldTasks.find(
                        (t) =>
                          (t.defect_id?.toLowerCase() === d.id.toLowerCase() || t.defect_code === d.code) &&
                          (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
                      )
                      const isCompleted = fieldTasks.some(
                        (t) =>
                          (t.defect_id?.toLowerCase() === d.id.toLowerCase() || t.defect_code === d.code) &&
                          t.status === 'VERIFIED'
                      )

                      let label = `${d.code} • ${d.defect_type} • ${d.status}`
                      let isDisabled = false

                      if (notOpen) {
                        label += ' [Không phải Defect OPEN]'
                        isDisabled = true
                      } else if (activeTask) {
                        label += ` [Có phiếu FIELD đang chạy: ${activeTask.code}]`
                      } else if (isCompleted) {
                        label += ' (Đã có FIELD hoàn tất; máy chủ kiểm điều kiện mới)'
                      } else {
                        label += ' (Chọn để kiểm tra điều kiện nguồn)'
                      }

                      return (
                        <option key={d.id} value={d.id} disabled={isDisabled}>
                          {label}
                        </option>
                      )
                    })
                  )}
                </select>

                {selectedDefectId ? (
                  <div className="mt-2.5 p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C9A227] border border-amber-200 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                        DEF
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-900">{newDefectCode}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-700 font-semibold truncate">{newDefectName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Hồ sơ khiếm khuyết đã được xác thực trong CSDL
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-slate-900 font-bold text-xs">
                        Chưa có thông tin lý trình
                      </div>
                      <div className="text-[10px] text-slate-500">Lý trình thực địa</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 p-2.5 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200">
                    Vui lòng chọn một khiếm khuyết có sẵn trong dự án để lập lệnh đo đạc hiện trường.
                  </div>
                )}

                {selectedDefectStatusReason && (
                  <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-300 text-amber-900 text-xs flex items-center gap-2 animate-in fade-in">
                    <Icon name="warning" size={16} className="text-amber-600 shrink-0" />
                    <span className="font-medium">{selectedDefectStatusReason}</span>
                  </div>
                )}
              </div>

              

              <div className="flex flex-col">
                <div className="mb-1">
                  <label className="font-medium text-slate-700">Phương pháp & Thiết bị đo <span className="text-rose-500">*</span></label>
                </div>
                {!isCustomMethod ? (
                  <select
                    value={newMethod}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomMethod(true)
                        setCustomMethodText('')
                      } else {
                        setNewMethod(e.target.value)
                      }
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227] cursor-pointer"
                  >
                    <option value="">Chọn phương pháp / thiết bị</option>
                    <option value="Đo dưỡng chiều sâu vỡ góc bản BTXM & diện tích bóc tách">
                      Đo dưỡng chiều sâu vỡ góc bản BTXM & diện tích bóc tách
                    </option>
                    <option value="Thước đo kính hiển vi quang học độ mở rộng khe nứt BTXM">
                      Thước đo kính hiển vi quang học độ mở rộng khe nứt BTXM
                    </option>
                    <option value="Thước laser trắc địa đo độ chênh cốt hai mép khe co giãn tấm BTXM">
                      Thước laser trắc địa đo độ chênh cốt hai mép khe co giãn tấm BTXM
                    </option>
                    <option value="Thước đo độ sâu hố sụt lòng đường & vệt lún bánh xe">
                      Thước đo độ sâu hố sụt lòng đường & vệt lún bánh xe
                    </option>
                    <option value="CUSTOM">[+] Phương pháp & thiết bị khác...</option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customMethodText}
                      onChange={(e) => setCustomMethodText(e.target.value)}
                      placeholder="Nhập phương pháp / thiết bị chuyên dụng (VD: Khoan lấy mẫu lõi bê tông, Thước đo 3m độ võng bánh xe)..."
                      className="w-full bg-amber-50/40 border border-amber-300 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227]"
                      autoFocus
                      required
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>PM được phép chỉ định thiết bị đo đặc thù theo yêu cầu kiểm tra kỹ thuật</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomMethod(false)
                          setNewMethod('Đo dưỡng chiều sâu vỡ góc bản BTXM & diện tích bóc tách')
                        }}
                        className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Quay lại chọn danh mục
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Kỹ sư / Tổ đo đạc thực hiện <span className="text-rose-500">*</span></label>
                <select
                  value={selectedCrewId}
                  onChange={(e) => {
                    setSelectedCrewId(e.target.value)
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  <option value="">Chọn Crew đang ACTIVE trong dự án</option>
                  {crewMembers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Ghi chú chỉ dẫn</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227]"
                />
              </div>

              <label className="grid gap-1">Chỉ số cần đo<select aria-label="Loại đo FIELD canonical" value={newMeasurementType||''} onChange={e=>setNewMeasurementType(Number(e.target.value))} className="w-full border rounded-lg p-2"><option value="">Chọn loại đo</option><option value={1}>Độ sâu lún</option><option value={2}>Chênh cao tấm</option><option value={3}>Phạm vi xói vai đường</option><option value={4}>Diện tích</option></select></label>
              <label className="grid gap-1">Hạn xử lý<input aria-label="Hạn xử lý FIELD" type="datetime-local" value={newDueAt} onChange={e=>setNewDueAt(e.target.value)} className="w-full border rounded-lg p-2" /></label>
              <TriageGeometryScope forField projectId={selectedProjectId==='ALL'?'':selectedProjectId} caseId={selectedDefectId} disabled={!!heldCreate||isSubmittingCreate} onChange={(enabled,pins)=>setCreateScope(old=>old.project===selectedProjectId&&old.enabled===enabled&&old.pins?.geometryVersion===(enabled?pins?.geometryVersion:undefined)&&old.pins?.routeVersionId===(enabled?pins?.routeVersionId:undefined)&&old.pins?.segmentSetId===(enabled?pins?.segmentSetId:undefined)?old:{project:selectedProjectId,enabled,pins:enabled?pins:undefined})} />
              <p>Chỉ tạo phiếu từ phản ánh đã ghi nhận và đối chiếu được nguồn. Nguồn khảo sát chưa có đủ thông tin đối chiếu sẽ bị chặn.</p>
              </fieldset>
              {/* Thông báo lỗi trực tiếp bên trong Modal nếu Backend trả về lỗi */}
              {createModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                  <Icon name="error" size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">Lỗi từ máy chủ CSDL:</div>
                    <div className="mt-0.5 text-rose-800 leading-relaxed font-medium">{createModalError}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateModalError(null)}
                    className="text-rose-500 hover:text-rose-800 cursor-pointer p-0.5"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate||!!createJournalError||!heldCreate&&(!selectedDefectId||!isSelectedDefectEligible||!newMeasurementType||!newDueAt||!selectedCrewId||createScope.enabled&&!createScope.pins)}
                  className="px-3.5 py-1.5 text-xs font-medium bg-[#C9A227] hover:bg-[#B38E1F] text-white rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="check" size={15} />
                  <span>{heldCreate?.received?'Đọc lại phiếu đã tạo':heldCreate?'Đối chiếu đúng yêu cầu đang chờ':'Khởi tạo phiếu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GHI NHẬN SỐ ĐO THỰC ĐỊA */}
      {isSubmitValueModalOpen && selectedTaskToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                  <Icon name="straighten" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">[Mô Phỏng Mobile] Đồng Bộ Số Đo Hiện Trường</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Giả lập App Mobile của Crew nộp số đo cho {selectedTaskToSubmit.code} • {selectedTaskToSubmit.defect_code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitValueModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmitValue} className="space-y-3.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                <div className="font-medium text-slate-800">{selectedTaskToSubmit.measurement_type}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Người đo: <strong>{selectedTaskToSubmit.technician_name}</strong>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">
                  Giá trị đo thực tế (mm) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center bg-white border border-slate-300 px-3 py-2 rounded-lg focus-within:border-[#C9A227]">
                  <input
                    type="number"
                    step="0.1"
                    value={inputMeasuredValue}
                    onChange={(e) => setInputMeasuredValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono text-sm font-bold text-slate-900 focus:outline-none"
                    required
                    autoFocus
                  />
                  <span className="text-xs font-bold text-slate-500 ml-2">mm</span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-medium text-slate-700 mb-1">Ghi chú hiện trường</label>
                <input
                  type="text"
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  placeholder="Ghi chú thêm về điều kiện đo đạc..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2 rounded-lg focus:outline-none focus:border-[#C9A227]"
                />
              </div>

<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitValueModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="check" size={15} />
                  <span>Xác nhận nộp số liệu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM CHI TIẾT NHIỆM VỤ & ẢNH THƯỚC ĐO */}
      {selectedDetailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-3xl w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#C9A227] border border-amber-200">
                  <Icon name="straighten" size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Chi Tiết Phiếu Đo Đạc Hiện Trường</h3>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedDetailTask.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Đối chiếu ảnh chụp thực địa và số đo do Repair Crew nộp về</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {selectedDetailTask.project_id?<FieldTaskReadDetails projectId={selectedDetailTask.project_id} taskId={selectedDetailTask.id} onReviewed={task=>{setSelectedDetailTask(old=>old?.id===task.id?{...old,version:task.version,status:task.status?.toUpperCase()==='COMPLETED'?'VERIFIED':task.status?.replace(/_/g,'').toUpperCase()==='SUPPLEMENTREQUIRED'?'SUPPLEMENT_REQUIRED':'UNKNOWN'}:old);void onRefreshTasks()}} />:<p role="alert" className="text-xs text-rose-700">Nhiệm vụ thiếu projectId từ máy chủ; chưa đọc hồ sơ.</p>}

            {/* Content: 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột trái: Xem ảnh với Tabs chuyển đổi & Chế độ so sánh song song */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Hình ảnh kỹ thuật đối chứng
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Tab Ảnh Thước đo */}
                    {selectedDetailTask.evidence_photo_url && (
                      <button
                        type="button"
                        onClick={() => setModalPhotoTab('RULER')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          modalPhotoTab === 'RULER'
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Thước đo
                      </button>
                    )}

                    {/* Tab Ảnh Drone */}
                    {selectedDetailTask.defect_photo_url && (
                      <button
                        type="button"
                        onClick={() => setModalPhotoTab('DRONE')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          modalPhotoTab === 'DRONE'
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Drone
                      </button>
                    )}

                    {/* Tab Ảnh Phản ánh tái sử dụng */}
                    {selectedDetailTask.reused_evidence && (
                      <button
                        type="button"
                        onClick={() => setModalPhotoTab('REUSED')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          modalPhotoTab === 'REUSED'
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        }`}
                      >
                        <Icon name="history_edu" size={11} />
                        <span>Phản ánh (API-084)</span>
                      </button>
                    )}

                    {/* Tab Chia đôi nội bộ */}
                    {selectedDetailTask.evidence_photo_url && selectedDetailTask.defect_photo_url && (
                      <button
                        type="button"
                        onClick={() => setModalPhotoTab(modalPhotoTab === 'SPLIT' ? 'RULER' : 'SPLIT')}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          modalPhotoTab === 'SPLIT'
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Xem 2 ảnh cạnh nhau trong bảng này"
                      >
                        Chia đôi
                      </button>
                    )}

                    {/* Nút So sánh 2 ảnh Fullscreen */}
                    {selectedDetailTask.evidence_photo_url && selectedDetailTask.defect_photo_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxTask(selectedDetailTask)
                          setLightboxInitialMode('SPLIT')
                        }}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 bg-[#C9A227] hover:bg-[#b08d20] text-white shadow-2xs"
                        title="Bung toàn màn hình so sánh song song 1-1 giữa Ảnh Drone và Ảnh Thước đo Mobile"
                      >
                        <Icon name="vertical_split" size={13} />
                        <span>So sánh 2 ảnh</span>
                      </button>
                    )}

                    {/* Nút Phóng to toàn màn hình */}
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxTask(selectedDetailTask)
                        setLightboxInitialMode(
                          modalPhotoTab === 'SPLIT'
                            ? 'SPLIT'
                            : modalPhotoTab === 'DRONE'
                            ? 'SECONDARY'
                            : 'PRIMARY'
                        )
                      }}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer flex items-center gap-1"
                      title="Phóng to toàn màn hình để soi chi tiết vạch thước kẻ"
                    >
                      <Icon name="zoom_in" size={13} />
                      <span>Phóng to</span>
                    </button>
                  </div>
                </div>

                {/* KHUNG HIỂN THỊ ẢNH THEO CHẾ ĐỘ ĐANG CHỌN */}
                <div className="space-y-2">
                  {modalPhotoTab === 'SPLIT' && selectedDetailTask.evidence_photo_url && selectedDetailTask.defect_photo_url ? (
                    /* 1. CHẾ ĐỘ KÉO THANH TRƯỢT SPLIT-SCREEN SO SÁNH TRỰC TIẾP */
                    <div className="space-y-2">
                      <ImageComparisonSlider
                        leftImageUrl={selectedDetailTask.defect_photo_url}
                        leftLabel="Không ảnh Drone"
                        leftSubLabel="Triage"
                        rightImageUrl={selectedDetailTask.evidence_photo_url}
                        rightLabel="Thước đo Mobile"
                        rightSubLabel={selectedDetailTask.exif_device || 'Thực địa'}
                        aspectRatioClass="h-56"
                        showControls={true}
                        showPresets={true}
                      />
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[10px] text-amber-900 flex items-center justify-between">
                        <span>Kéo thanh trượt để đối chiếu sự tương ứng giữa Không ảnh Drone và Thước đo thực địa</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxTask(selectedDetailTask)
                            setLightboxInitialMode('SPLIT')
                          }}
                          className="font-bold underline hover:text-amber-950 cursor-pointer flex items-center gap-0.5"
                        >
                          <span>Toàn màn hình</span>
                          <Icon name="open_in_full" size={11} />
                        </button>
                      </div>
                    </div>
                  ) : modalPhotoTab === 'DRONE' && selectedDetailTask.defect_photo_url ? (
                    /* 2. CHẾ ĐỘ XEM ẢNH DRONE KHẢO SÁT BAN ĐẦU */
                    <div
                      onClick={() => {
                        setLightboxTask(selectedDetailTask)
                        setLightboxInitialMode('SECONDARY')
                      }}
                      className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group cursor-pointer"
                    >
                      <img
                        src={selectedDetailTask.defect_photo_url}
                        alt="Ảnh Drone khảo sát ban đầu"
                        className="w-full h-56 object-cover object-center group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition-opacity">
                          <Icon name="zoom_in" size={16} />
                          <span>Bấm để phóng to ảnh Drone</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon name="flight" size={13} className="text-amber-400" />
                          <span className="font-medium text-amber-300">Ảnh Drone khảo sát ban đầu</span>
                        </div>
                        <span className="font-mono text-slate-300 text-[10px]">
                          Zenmuse P1 (GSD 0.8cm/px)
                        </span>
                      </div>
                    </div>
                  ) : modalPhotoTab === 'REUSED' && selectedDetailTask.reused_evidence ? (
                    /* 4. CHẾ ĐỘ XEM ẢNH PHẢN ÁNH TÁI SỬ DỤNG (API-084) */
                    <div
                      onClick={() => {
                        handleOpenReuseModal(selectedDetailTask)
                      }}
                      className="relative rounded-xl overflow-hidden border border-amber-300 bg-slate-900 shadow-inner group cursor-pointer"
                    >
                      <img
                        src={
                          selectedDetailTask.reused_evidence.photo_url ||
                          selectedDetailTask.defect_photo_url ||
                          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80'
                        }
                        alt="Ảnh phản ánh tái sử dụng"
                        className="w-full h-56 object-cover object-center group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-amber-950/90 text-amber-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition-opacity border border-amber-400">
                          <Icon name="history_edu" size={16} />
                          <span>Xem chi tiết hồ sơ thẩm định API-084</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon name="history_edu" size={13} className="text-amber-400" />
                          <span className="font-medium text-amber-300">
                            Ảnh phản ánh ({selectedDetailTask.reused_evidence.source_kind === 'CITIZEN_REPORT' ? 'Người dân' : 'Tuần kiểm'})
                          </span>
                        </div>
                        <span className="font-mono text-amber-400 font-bold text-[10px]">
                          API-084 Approved
                        </span>
                      </div>
                    </div>
                  ) : selectedDetailTask.evidence_photo_url ? (
                    /* 3. CHẾ ĐỘ XEM ẢNH THƯỚC ĐO HIỆN TRƯỜNG */
                    <div
                      onClick={() => {
                        setLightboxTask(selectedDetailTask)
                        setLightboxInitialMode('PRIMARY')
                      }}
                      className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group cursor-pointer"
                    >
                      <img
                        src={selectedDetailTask.evidence_photo_url}
                        alt="Ảnh thước đo đối chứng"
                        className="w-full h-56 object-cover object-center group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transition-opacity">
                          <Icon name="zoom_in" size={16} />
                          <span>Bấm để phóng to & soi chi tiết vạch thước</span>
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon name="straighten" size={13} className="text-emerald-400" />
                          <span className="font-medium text-emerald-300">Ảnh thước đo Mobile</span>
                        </div>
                        <span className="font-mono text-slate-300 text-[10px]">
                          {selectedDetailTask.exif_device || 'EXIF Verified'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                      <Icon name="pending" size={28} className="text-slate-300 mb-1" />
                      <span className="font-medium text-slate-600">Đang chờ Repair Crew đo đạc ngoài hiện trường</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Số đo và ảnh thước đo sẽ tự động đồng bộ khi kỹ sư nộp</span>
                    </div>
                  )}

                  {/* Thumbnail chuyển đổi nhanh ở phía dưới */}
                  {modalPhotoTab !== 'SPLIT' && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {selectedDetailTask.evidence_photo_url && (
                        <button
                          type="button"
                          onClick={() => setModalPhotoTab('RULER')}
                          className={`flex-1 min-w-[120px] p-1.5 rounded-lg border text-left transition-colors flex items-center gap-2 cursor-pointer ${
                            modalPhotoTab === 'RULER'
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={selectedDetailTask.evidence_photo_url}
                            alt="Thước đo"
                            className="w-10 h-8 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-800 block truncate">
                              Ảnh thước đo
                            </span>
                            <span className="text-[9px] text-slate-500 block">Mobile hiện trường</span>
                          </div>
                        </button>
                      )}

                      {selectedDetailTask.reused_evidence && (
                        <button
                          type="button"
                          onClick={() => setModalPhotoTab('REUSED')}
                          className={`flex-1 min-w-[120px] p-1.5 rounded-lg border text-left transition-colors flex items-center gap-2 cursor-pointer ${
                            modalPhotoTab === 'REUSED'
                              ? 'bg-amber-100/80 border-amber-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={
                              selectedDetailTask.reused_evidence.photo_url ||
                              selectedDetailTask.defect_photo_url ||
                              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80'
                            }
                            alt="Phản ánh"
                            className="w-10 h-8 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-amber-900 block truncate">
                              Ảnh phản ánh
                            </span>
                            <span className="text-[9px] text-amber-700 block">API-084</span>
                          </div>
                        </button>
                      )}

                      {selectedDetailTask.defect_photo_url && (
                        <button
                          type="button"
                          onClick={() => setModalPhotoTab('DRONE')}
                          className={`flex-1 min-w-[120px] p-1.5 rounded-lg border text-left transition-colors flex items-center gap-2 cursor-pointer ${
                            modalPhotoTab === 'DRONE'
                              ? 'bg-amber-50/70 border-amber-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <img
                            src={selectedDetailTask.defect_photo_url}
                            alt="Drone"
                            className="w-10 h-8 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-slate-800 block truncate">
                              Ảnh Drone
                            </span>
                            <span className="text-[9px] text-slate-500 block">Flycam ban đầu</span>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Thông số kỹ thuật & Số đo */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Trạng thái:</span>
                  <div>
                    {selectedDetailTask.status === 'ASSIGNED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        CẦN THỰC HIỆN
                      </span>
                    ) : selectedDetailTask.status === 'IN_PROGRESS' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        ĐANG ĐO ĐẠC
                      </span>
                    ) : selectedDetailTask.status === 'SUBMITTED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        ĐÃ CÓ SỐ ĐO
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedDetailTask.status==='VERIFIED'?'ĐÃ HOÀN TẤT FIELD':selectedDetailTask.status==='SUPPLEMENT_REQUIRED'?'CẦN BỔ SUNG':'CHƯA ÁNH XẠ TRẠNG THÁI'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mã khiếm khuyết liên kết:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {selectedDetailTask.defect_code}
                    </span>
                    {selectedDetailTask.defect_name && (
                      <span className="text-slate-600 block text-xs mt-0.5 font-medium">
                        {selectedDetailTask.defect_name}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Vị trí lý trình:</span>
                    <span className="font-semibold text-slate-800">
                      Km {selectedDetailTask.chainage_km} {selectedDetailTask.lane ? `• ${selectedDetailTask.lane}` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Phương pháp & Thiết bị:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedDetailTask.measurement_type}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Kỹ sư / Đội thực hiện:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedDetailTask.technician_name}
                    </span>
                  </div>

                  {/* Giá trị đo đạc nổi bật */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 mt-2">
                    <span className="text-[11px] font-medium text-slate-500 block">
                      Kết quả đo thực tế (mm):
                    </span>
                    {selectedDetailTask.measured_value ? (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold font-mono text-rose-600">
                          {selectedDetailTask.measured_value} mm
                        </span>
                        <span className="text-[11px] text-rose-600 font-medium">
                          (Vượt ngưỡng kỹ thuật cho phép)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs mt-1 block">
                        Chưa có số đo nộp về
                      </span>
                    )}
                  </div>

                  {/* Thông tin bằng chứng tái sử dụng (API-084) nếu có */}
                  {selectedDetailTask.reused_evidence && (
                    <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-300 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                        <Icon name="history_edu" size={15} className="text-amber-700" />
                        <span>Đã tái sử dụng ảnh phản ánh (API-084)</span>
                      </div>
                      <div className="text-[11px] text-amber-900 space-y-0.5">
                        <p>
                          <span className="text-amber-700 font-medium">Nguồn dữ liệu: </span>
                          <span className="font-semibold">
                            Phản ánh người dân (CITIZEN_REPORT • API-084)
                          </span>
                        </p>
                        <p>
                          <span className="text-amber-700 font-medium">Lý do PM duyệt: </span>
                          <span>{selectedDetailTask.reused_evidence.reason}</span>
                        </p>
                        {selectedDetailTask.reused_evidence.checksum_sha256 && (
                          <p className="font-mono text-[10px] text-amber-800 break-all">
                            <span className="text-amber-700 font-sans font-medium">SHA-256: </span>
                            {selectedDetailTask.reused_evidence.checksum_sha256}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedDetailTask.notes && (
                    <div>
                      <span className="text-slate-500 block text-[11px]">Ghi chú hiện trường:</span>
                      <p className="text-slate-700 italic bg-white p-2 rounded border border-slate-200 text-[11px] mt-0.5">
                        "{selectedDetailTask.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <span className="text-[11px] text-slate-400">
                Thẩm quyền: Chỉ huy trưởng (PM) kiểm tra ảnh & xác minh
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Nút Tái sử dụng ảnh phản ánh (API-084) */}
                {selectedDetailTask.reused_evidence ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenReuseModal(selectedDetailTask)
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Xem & cập nhật thông tin bằng chứng ảnh phản ánh đã phê duyệt tái sử dụng (API-084)"
                  >
                    <Icon name="history_edu" size={14} className="text-amber-700" />
                    <span>Xem ảnh phản ánh (API-084)</span>
                  </button>
                ) : !isSupervisor &&
                  !selectedDetailTask.reused_evidence &&
                  (selectedDetailTask.source_origin === 'CITIZEN_REPORT' ||
                    Boolean(selectedDetailTask.linked_case_code)) &&
                  (selectedDetailTask.status === 'ASSIGNED' || selectedDetailTask.status === 'IN_PROGRESS') ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenReuseModal(selectedDetailTask)
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Phê duyệt tái sử dụng ảnh từ nguồn phản ánh người dân/tuần kiểm làm bằng chứng đối chứng trước thi công (API-084)"
                  >
                    <Icon name="history_edu" size={14} className="text-amber-700" />
                    <span>Tái sử dụng ảnh phản ánh (API-084)</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setSelectedDetailTask(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Đóng
                </button>
                {!isSupervisor && selectedDetailTask.status === 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = selectedDetailTask.id
                      handleVerifyTask(id)
                    }}
                    className="px-4 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Icon name="check" size={15} />
                    <span>Xác minh số liệu này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TÁI SỬ DỤNG ẢNH PHẢN ÁNH (API-084 Evidence Reuse) */}
      {isReuseModalOpen && taskForReuse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <Icon name="history_edu" size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Tái Sử Dụng Ảnh Phản Ánh Hiện Trường
                    </h3>
                    <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                      API-084
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Phê duyệt dùng ảnh phản ánh chất lượng cao làm bằng chứng "Trước thi công" cho nhiệm vụ {taskForReuse.code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReuseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {reuseLoading&&<p role="status">Đang đọc bằng chứng nguồn…</p>}
            {(reuseError||reuseJournalError)&&<p role="alert" className="text-rose-700 text-xs">{reuseError||reuseJournalError}</p>}
            {reuseHeld&&<p role="status" className="text-xs break-all">Giữ yêu cầu {reuseHeld.key} cho file {reuseHeld.body.fileId}; không thay body/key/version.</p>}
            {reuseResult&&<p role="status" className="text-emerald-800 text-xs break-all">Đã GET đối chiếu file {reuseResult.receipt.fileId} · checksum {reuseResult.receipt.fileChecksum}. Receipt {reuseResult.receipt.id} · {reuseResult.receipt.reason}</p>}
            <select aria-label="Bằng chứng Report tái sử dụng" disabled={isSubmittingReuse||!!reuseHeld||!!reuseResult} value={reuseChoice} onChange={e=>{setReuseChoice(e.target.value);setReuseError('')}} className="w-full border border-slate-200 rounded-lg p-2 text-xs"><option value="">{reuseLoading?'Đang tải bằng chứng':reuseError?'Chưa tải được bằng chứng':'Chọn bằng chứng Report'}</option>{reuseSources.map(r=><option key={r.evidence.evidenceId} value={r.evidence.evidenceId}>{r.report.reportId} • {r.evidence.evidenceId}{r.evidence.supplementId?' • Bổ sung':' • Gốc'}</option>)}</select>
            {!reuseLoading&&!reuseError&&!reuseSources.length&&<p className="text-xs">Không có bằng chứng của Report trong dữ liệu nguồn.</p>}
            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Cột trái: Ảnh phản ánh & Metadata GPS/EXIF */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                    Ảnh phản ánh hiện trường
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    Metadata từ Report
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 w-full h-56 sm:h-64 group shadow-inner">
                  {reusePhoto?<img src={reusePhoto.url} alt="Ảnh bằng chứng Report được phép đọc" className="w-full h-full object-cover block" />:<p className="text-slate-200 p-4">{reuseSource?'Đang đọc ảnh gốc…':'Chọn bằng chứng để xem ảnh gốc.'}</p>}
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 font-semibold">
                    <Icon name="location_on" size={12} className="text-amber-400" />
                    <span>{taskForReuse.chainage_km!=null?`Km ${taskForReuse.chainage_km}`:'Chưa có lý trình'}</span>
                  </div>
                </div>

                {/* Box Metadata Kỹ thuật */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tọa độ GPS:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {reuseSource?.evidence.location?`${reuseSource.evidence.location.latitude ?? '—'}, ${reuseSource.evidence.location.longitude ?? '—'}`:'Chưa có tọa độ nguồn'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Độ lệch vị trí:</span>
                    <span className="text-emerald-700 font-semibold">{reuseSource?.evidence.location?.accuracyMeters!=null?`${reuseSource.evidence.location.accuracyMeters} mét`:'Chưa có độ chính xác vị trí'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Thiết bị ghi nhận:</span>
                    <span className="text-slate-800">
                      Chưa có dữ liệu thiết bị
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Thời gian chụp:</span>
                    <span className="text-slate-800">
                      {reuseSource?.evidence.capturedAt||'Chưa có thời gian chụp'}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Mã băm an toàn SHA-256:</span>
                    <span className="font-mono text-[9px] text-slate-600 block truncate">
                      {reusePhoto?.checksum||'Chưa đọc nội dung ảnh'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cột phải: Form thẩm duyệt tái sử dụng của PM */}
              <div className="space-y-3">
                {/* Thông tin hồ sơ nhiệm vụ */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 font-medium">Nhiệm vụ:</span>
                    <span className="font-mono font-bold text-slate-900">{taskForReuse.code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 font-medium">Khiếm khuyết:</span>
                    <span className="font-mono font-semibold text-slate-800">{taskForReuse.defect_code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 font-medium">Vị trí:</span>
                    <span className="text-slate-700 font-medium">
                      {taskForReuse.chainage_km!=null?`Km ${taskForReuse.chainage_km}`:'Chưa có lý trình'} • {taskForReuse.lane || 'Chưa có làn'}
                    </span>
                  </div>
                </div>

                {/* Hồ sơ nguồn gốc tin báo (Source Provenance) */}
                <div className="p-3 bg-white rounded-xl border border-amber-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <Icon name="assignment" size={14} className="text-amber-700" />
                      <span>Hồ sơ phản ánh tiếp nhận gốc:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                      {reuseSource?.caseId||'Chưa chọn nguồn'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Người dân phản ánh:</span>
                      <span className="font-semibold text-slate-900">
                        {reuseSource?.report.reporterDisplayName||'Chưa có thông tin nguồn'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Kênh tiếp nhận:</span>
                      <span className="text-slate-800 font-medium flex items-center gap-1">
                        <Icon name="smartphone" size={13} className="text-emerald-600" />
                        <span>Report được phép đọc</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Thời gian tiếp nhận:</span>
                      <span className="font-mono text-slate-800">{reuseSource?.report.receivedAt||'Chưa có thời gian tiếp nhận'}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-500 block text-[10px]">Nội dung phản ánh:</span>
                      <p className="italic text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] mt-0.5">
                        "{reuseSource?.report.description||'Chưa có nội dung nguồn'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lý do phê duyệt (reason) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">
                      Lý do phê duyệt của Chỉ huy trưởng <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Tối đa 2000 ký tự</span>
                  </div>

                  <textarea
                    rows={4}
                    value={reuseHeld?.body.reason||reuseReason}
                    maxLength={2000}
                    disabled={!!reuseHeld||isSubmittingReuse||!!reuseResult}
                    onChange={(e) => setReuseReason(e.target.value)}
                    placeholder="Nhập căn cứ thẩm định của Chỉ huy trưởng..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#C9A227] focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Người thực hiện: Chỉ huy trưởng dự án
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReuseModalOpen(false)}
                  disabled={isSubmittingReuse}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                {!isSupervisor ? (
                  <button
                    type="button"
                    onClick={handleConfirmReuseEvidence}
                    disabled={isSubmittingReuse||!!reuseResult||!!reuseJournalError||!reuseHeld&&(!reuseReason.trim()||!reusePhoto||!reuseSource)}
                    className="px-4 py-1.5 text-xs font-semibold bg-[#C9A227] hover:bg-[#b08d20] disabled:bg-slate-300 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    {isSubmittingReuse ? (
                      <>
                        <Icon name="sync" size={14} className="animate-spin" />
                        <span>Đang lưu phê duyệt...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={14} />
                        <span>{reuseHeld?.received?'Đọc lại bằng chứng đã phê duyệt':reuseHeld?'Đối chiếu đúng yêu cầu đang chờ':'Xác nhận tái sử dụng ảnh'}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 italic px-2 py-1">
                    (Giám sát xem bằng chứng đối soát • Quyền duyệt: Chỉ huy trưởng)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: LIGHTBOX PHÓNG TO ẢNH FULLSCREEN VỚI ZOOM & EXIF */}
      {lightboxTask && (
        <PhotoLightboxModal
          isOpen={Boolean(lightboxTask)}
          onClose={() => setLightboxTask(null)}
          title={`Phiếu Đo: ${lightboxTask.code} • ${lightboxTask.defect_code}`}
          subtitle={`${lightboxTask.defect_name || lightboxTask.measurement_type} — Km ${lightboxTask.chainage_km} (${lightboxTask.lane || 'Làn cơ giới'})`}
          initialViewMode={lightboxInitialMode}
          primaryPhotoUrl={lightboxTask.evidence_photo_url || ''}
          primaryPhotoLabel="Ảnh Thước Đo (Hiện trường)"
          secondaryPhotoUrl={lightboxTask.defect_photo_url || ''}
          secondaryPhotoLabel="Ảnh Khảo Sát Drone"
          measuredValue={lightboxTask.measured_value}
          unit="mm"
          chainage={lightboxTask.chainage_km ?? undefined}
          lane={lightboxTask.lane}
          gpsLat={lightboxTask.gps_lat || 16.2405}
          gpsLng={lightboxTask.gps_lng || 108.1310}
          deviceInfo={lightboxTask.exif_device || 'Samsung Galaxy Tab Active 4 Pro'}
          capturedAt={lightboxTask.exif_captured_at || lightboxTask.created_at}
          technicianName={lightboxTask.technician_name}
          notes={lightboxTask.notes}
          statusBadge={
            lightboxTask.status === 'ASSIGNED' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-200">
                CẦN THỰC HIỆN
              </span>
            ) : lightboxTask.status === 'IN_PROGRESS' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-900/80 text-blue-200">
                ĐANG ĐO ĐẠC
              </span>
            ) : lightboxTask.status === 'SUBMITTED' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-900/80 text-amber-200">
                ĐÃ CÓ SỐ ĐO
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/80 text-emerald-200">
                {lightboxTask.status==='VERIFIED'?'ĐÃ HOÀN TẤT FIELD':lightboxTask.status==='SUPPLEMENT_REQUIRED'?'CẦN BỔ SUNG':'CHƯA ÁNH XẠ TRẠNG THÁI'}
              </span>
            )
          }
          onVerifyAction={
            !isSupervisor && lightboxTask.status === 'SUBMITTED'
              ? () => {
                  const id = lightboxTask.id
                  setLightboxTask(null)
                  handleVerifyTask(id)
                }
              : undefined
          }
          verifyButtonText="Xác minh số liệu này ngay"
        />
      )}
    </div>
  )
}
