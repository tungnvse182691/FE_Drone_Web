import React, { useState, useMemo, useRef } from 'react'
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
import { initialNotifications } from './notifications/mockData'
import { AudioConfigModal } from './notifications/AudioConfigModal'
import { NotificationsHeader } from './notifications/NotificationsHeader'
import { NotificationsFilterBar } from './notifications/NotificationsFilterBar'
import { NotificationsFeed } from './notifications/NotificationsFeed'
import { NotificationsSlaWidgets } from './notifications/NotificationsSlaWidgets'

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

  // --- DỮ LIỆU THÔNG BÁO VÀ BÀN GIAO CHUẨN BACKEND V2.2 ---
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)

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
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('Đã đánh dấu tất cả thông báo là đã đọc!')
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

  // Giải quyết đường dẫn điều hướng tương thích đúng vai trò hiện tại
  const resolveActionUrl = (item: NotificationItem) => {
    if (item.actionUrl) {
      if (isSupervisor && item.actionUrl.startsWith('/pm/')) {
        return item.actionUrl.replace('/pm/', '/sup/')
      }
      if (!isSupervisor && item.actionUrl.startsWith('/sup/')) {
        return item.actionUrl.replace('/sup/', '/pm/')
      }
      return item.actionUrl
    }
    switch (item.resourceType) {
      case 'REPAIR_PROPOSAL':
        return isSupervisor ? '/sup/proposals/PKG-2026-08' : '/pm/proposals'
      case 'DEFECT':
        return `${basePath}/fast-track`
      case 'ACCEPTANCE_DOSSIER':
        return `${basePath}/acceptance`
      case 'SURVEY_MISSION':
        return `${basePath}/drone-mission`
      case 'FIELD_TASK':
        return isSupervisor ? '/sup/surveys' : '/pm/field-tasks'
      default:
        return `${basePath}/dashboard`
    }
  }

  const handleNavigateAction = (item: NotificationItem) => {
    handleMarkAsRead(item.id)
    navigate(resolveActionUrl(item))
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

      {/* MAIN TWO-COLUMN WORKSPACE: 70% Feed / 30% Delivery SLA Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <NotificationsFeed
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
    </div>
  )
}

export default NotificationsHandoffHub
