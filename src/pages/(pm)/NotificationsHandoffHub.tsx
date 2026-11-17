import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  NotificationItem,
  NotificationCategoryTab,
  NotificationPriorityFilter,
  AudioModeConfig
} from './notifications/types'
import { notificationService, notificationError, type NotificationDto } from '../../api/services/notificationService'
import { AudioConfigModal } from './notifications/AudioConfigModal'
import { NotificationsHeader } from './notifications/NotificationsHeader'
import { NotificationsFilterBar } from './notifications/NotificationsFilterBar'
import { NotificationsFeed } from './notifications/NotificationsFeed'
import { NotificationsSlaWidgets } from './notifications/NotificationsSlaWidgets'
import { DutyPanel } from './notifications/DutyPanel'

export type { NotificationItem }

export const NotificationsHandoffHub: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisor ? '/sup' : '/pm'

  // --- AUDIO SYNTHESIZER (Web Audio API - Không phụ thuộc file ngoại tuyến) ---
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true)
  const [audioVolume, setAudioVolume] = useState<number>(0.8)
  const [audioMode, setAudioMode] = useState<AudioModeConfig>({
    emergencySiren: true,
    slaChime: true,
    handoverPing: true
  })

  const audioCtxRef = useRef<AudioContext | null>(null)

  // Hàm phát âm thanh kiểm tra hoặc cảnh báo
  const playSound = (type: 'EMERGENCY' | 'SLA_WARNING' | 'PING') => {
    if (!isAudioEnabled) return

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioContextClass()
      }

      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime

      if (type === 'EMERGENCY' && audioMode.emergencySiren) {
        // Còi cảnh báo 2 âm tần số 880Hz -> 1200Hz
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(880, now)
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.18)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.36)

        gain.gain.setValueAtTime(audioVolume * 0.45, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.45)
      } else if (type === 'SLA_WARNING' && audioMode.slaChime) {
        // Âm beep cảnh báo đứt quãng 3 tiếng
        [0, 0.12, 0.24].forEach((offset) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(750, now + offset)
          gain.gain.setValueAtTime(audioVolume * 0.35, now + offset)
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08)

          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + offset)
          osc.stop(now + offset + 0.08)
        })
      } else if (type === 'PING' && audioMode.handoverPing) {
        // Âm ping chuông nhẹ nhàng (Ding)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(659.25, now) // Mi (E5)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08) // La (A5)

        gain.gain.setValueAtTime(audioVolume * 0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.5)
      }
    } catch {
      // Audio context bị chặn bởi trình duyệt nếu chưa có tương tác
    }
  }

  // Danh sách thông báo theo người nhận hiện tại từ API039–042.
  const epoch=useAuthStore(s=>s.authEpoch),sessionScope=`${epoch}:${user?.id}:${user?.role}`
  const latest=useRef(sessionScope);latest.current=sessionScope
  const [snapshot,setSnapshot]=useState<{scope:string;items:NotificationItem[]}|null>(null)
  const [loading,setLoading]=useState(true),[apiError,setApiError]=useState(''),[reload,setReload]=useState(0)
  const mapNotification=(n:NotificationDto):NotificationItem=>({id:n.id,category:'UNKNOWN',categoryLabel:'Thông báo',title:'Thông báo',message:n.message||'Chưa có nội dung trong dữ liệu máy chủ.',resourceType:'UNKNOWN',resourceId:n.resourceId||'',routeCode:'',stationing:'Chưa có dữ liệu lý trình',sender:'Chưa có thông tin người gửi',senderRole:'',recipientRole:user!.role,priority:'UNKNOWN',read:n.read,occurredAt:n.occurredAt,timeAgo:new Date(n.occurredAt).toLocaleString('vi-VN'),actionUrl:'',actionLabel:'Xem chi tiết và phạm vi',version:n.version||undefined})
  useEffect(()=>{const c=new AbortController();setSnapshot(null);setLoading(true);setApiError('');notificationService.list(c.signal).then(items=>{if(!c.signal.aborted)setSnapshot({scope:sessionScope,items:items.map(mapNotification)})}).catch(e=>{if(!c.signal.aborted)setApiError(notificationError(e))}).finally(()=>{if(!c.signal.aborted)setLoading(false)});return()=>c.abort()},[sessionScope,reload])
  const notifications=snapshot?.scope===sessionScope?snapshot.items:[]
  const updateNotification=(item:NotificationItem)=>setSnapshot(old=>old?.scope===sessionScope?{...old,items:old.items.map(n=>n.id===item.id?item:n)}:old)

  // Lọc thông báo
  const [activeTab, setActiveTab] = useState<NotificationCategoryTab>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriorityFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false)

  // Modal cấu hình âm thanh & cảnh báo
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkAsRead = async (id:string,e?:React.MouseEvent)=>{
    e?.stopPropagation();const target=notifications.find(n=>n.id===id),start=sessionScope
    if(!target)return
    try{const result=await notificationService.markRead(id,target.version||'');if(latest.current===start)updateNotification({...target,...mapNotification(result)})}catch(e:any){if(latest.current===start)setApiError(notificationError(e))}
  }
  const markingAll=useRef(false)
  const handleMarkAllAsRead = async ()=>{
    if(markingAll.current)return;markingAll.current=true;const start=sessionScope
    try{for(const item of notifications.filter(n=>!n.read)){if(latest.current!==start)return;const result=await notificationService.markRead(item.id,item.version||'');if(latest.current!==start)return;updateNotification({...item,...mapNotification(result)})}if(latest.current===start)showToast('Đã GET xác nhận các thông báo trong danh sách đã đọc.')}catch(e:any){if(latest.current===start)setApiError(notificationError(e))}finally{markingAll.current=false}
  }

  // 1. Phân lập thông báo theo vai trò tài khoản hiện tại (RBAC Notification Isolation)
  const currentRole = user?.role || RoleCode.PROJECT_MANAGER
  const roleFilteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.recipientRole === 'ALL') return true
      return n.recipientRole === currentRole
    })
  }, [notifications, currentRole])

  // 2. Bộ lọc danh sách dựa trên các thông báo đã phân lập theo quyền
  const filteredNotifications = useMemo(() => {
    return roleFilteredNotifications.filter((n) => {
      // Tab filter
      if (activeTab !== 'ALL' && n.category !== activeTab) return false

      // Priority filter
      if (priorityFilter !== 'ALL' && n.priority !== priorityFilter) return false

      // Unread only toggle
      if (unreadOnly && n.read) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.resourceId.toLowerCase().includes(q) ||
          n.stationing.toLowerCase().includes(q) ||
          n.sender.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [roleFilteredNotifications, activeTab, priorityFilter, unreadOnly, searchQuery])

  // Thống kê đếm chuẩn xác theo vai trò hiện tại
  const unreadCount = roleFilteredNotifications.filter((n) => !n.read).length
  const emergencyCount = roleFilteredNotifications.filter((n) => n.priority === 'EMERGENCY' && !n.read).length
  const actionRequiredCount = roleFilteredNotifications.filter((n) => n.category === 'ACTION_REQUIRED' && !n.read).length
  const handoverCount = roleFilteredNotifications.filter((n) => n.category === 'HANDOVER').length
  const aiSystemCount = roleFilteredNotifications.filter((n) => n.category === 'AI_SYSTEM').length

  // Danh sách các mục có SLA cần theo dõi gấp của vai trò hiện tại
  const criticalSlaItems = useMemo(() => {
    return roleFilteredNotifications
      .filter((n) => n.slaHoursRemaining !== undefined && !n.read)
      .sort((a, b) => (a.slaHoursRemaining || 0) - (b.slaHoursRemaining || 0))
  }, [roleFilteredNotifications])

  const handleNavigateAction = async (item:NotificationItem)=>{
    const start=sessionScope
    try{const detail=await notificationService.detail(item.id);const scope=await notificationService.scope(item.id);if(latest.current!==start)return;updateNotification({...mapNotification(detail),scope,categoryLabel:scope.classification||'Thông báo'})}catch(e:any){if(latest.current===start)setApiError(notificationError(e))}
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL CẤU HÌNH ÂM THANH & CẢNH BÁO SLA */}
      <AudioConfigModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        isAudioEnabled={isAudioEnabled}
        onToggleAudioEnabled={() => setIsAudioEnabled(!isAudioEnabled)}
        audioVolume={audioVolume}
        onChangeAudioVolume={setAudioVolume}
        audioMode={audioMode}
        onChangeAudioMode={setAudioMode}
        onPlaySound={playSound}
        onSave={() => {
          setIsAudioModalOpen(false)
          showToast('Đã lưu cấu hình âm thanh cảnh báo!')
        }}
      />

      {/* TOPBAR BREADCRUMB & REALTIME SYNC STATUS & HERO BANNER */}
      <NotificationsHeader
        basePath={basePath}
        isSupervisor={isSupervisor}
        unreadCount={unreadCount}
        emergencyCount={emergencyCount}
        isAudioEnabled={isAudioEnabled}
        onMarkAllAsRead={handleMarkAllAsRead}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
      />

      {/* FILTER TABS & SEARCH BAR */}
      <NotificationsFilterBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        totalCount={notifications.length}
        actionRequiredCount={actionRequiredCount}
        handoverCount={handoverCount}
        aiSystemCount={aiSystemCount}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        onChangePriorityFilter={setPriorityFilter}
        unreadOnly={unreadOnly}
        onToggleUnreadOnly={() => setUnreadOnly(!unreadOnly)}
      />

      <div className="flex flex-wrap gap-2 text-xs"><button type="button" disabled={loading} onClick={()=>setReload(n=>n+1)} className="rg-btn">Tải lại thông báo</button>{loading&&<p role="status">Đang đọc thông báo…</p>}{apiError&&<p role="alert" className="text-rose-700">{apiError}</p>}</div>
      <p className="text-xs text-slate-500">Danh sách thuộc người nhận hiện tại. Máy chủ chưa cung cấp mức ưu tiên, người gửi và thời hạn SLA trong dữ liệu thông báo; các trường này không được suy diễn. Danh sách rỗng nghĩa là chưa có thông báo phù hợp trong CSDL.</p>
      {/* MAIN TWO-COLUMN WORKSPACE: 70% Feed / 30% Delivery SLA Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <NotificationsFeed
          loading={loading}
          error={apiError}
          filteredNotifications={filteredNotifications}
          onMarkAsRead={handleMarkAsRead}
          onNavigateAction={handleNavigateAction}
        />

        <NotificationsSlaWidgets
          criticalSlaItems={criticalSlaItems}
          onNavigateAction={handleNavigateAction}
          isAudioEnabled={isAudioEnabled}
          onPlaySound={playSound}
        />
      </div>

      <DutyPanel />
    </div>
  )
}

export default NotificationsHandoffHub
