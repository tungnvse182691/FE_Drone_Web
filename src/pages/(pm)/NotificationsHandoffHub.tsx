import React, { useState, useMemo, useRef, useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { NotificationItem, NotificationPriorityFilter } from './notifications/types'
import { notificationService, notificationError, type NotificationDto } from '../../api/services/notificationService'
import { NotificationsFeed } from './notifications/NotificationsFeed'
import { DutyPanel } from './notifications/DutyPanel'
import { PanelButton } from '../../components/ui/PanelKit'

export type { NotificationItem }

/**
 * Trung tâm thông báo (SUP-09 / PM-12): GET /notifications (+ /{id}, /{id}/scope), POST /notifications/{id}/read, POST /notifications/read-batch.
 * Chỉ dùng trường BE trả; mức ưu tiên do máy chủ tính; người gửi/hạn lấy từ scope khi mở chi tiết.
 */
export const NotificationsHandoffHub: React.FC = () => {
  const { user } = useAuthStore()
  const epoch = useAuthStore((s) => s.authEpoch)
  const sessionScope = `${epoch}:${user?.id}:${user?.role}`
  const latest = useRef(sessionScope); latest.current = sessionScope
  const [snapshot, setSnapshot] = useState<{ scope: string; items: NotificationItem[] } | null>(null)
  const [loading, setLoading] = useState(true), [apiError, setApiError] = useState(''), [reload, setReload] = useState(0)
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriorityFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState(''), [unreadOnly, setUnreadOnly] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500) }

  const mapNotification = (n: NotificationDto): NotificationItem => ({
    id: n.id, category: 'UNKNOWN', categoryLabel: 'Thông báo', title: 'Thông báo', message: n.message || 'Máy chủ không trả nội dung.',
    resourceType: 'UNKNOWN', resourceId: n.resourceId || '', routeCode: '', stationing: '', sender: '', senderRole: '', recipientRole: user!.role,
    priority: (n.priority === 'HIGH' || n.priority === 'NORMAL' ? n.priority : 'UNKNOWN') as NotificationItem['priority'],
    read: n.read, occurredAt: n.occurredAt, timeAgo: new Date(n.occurredAt).toLocaleString('vi-VN'), actionUrl: '', actionLabel: 'Xem chi tiết và phạm vi', version: n.version || undefined,
  })
  useEffect(() => {
    const c = new AbortController(); setSnapshot(null); setLoading(true); setApiError('')
    notificationService.list(c.signal).then((items) => { if (!c.signal.aborted) setSnapshot({ scope: sessionScope, items: items.map(mapNotification) }) })
      .catch((e) => { if (!c.signal.aborted) setApiError(notificationError(e)) }).finally(() => { if (!c.signal.aborted) setLoading(false) })
    return () => c.abort()
  }, [sessionScope, reload]) // eslint-disable-line react-hooks/exhaustive-deps
  const notifications = snapshot?.scope === sessionScope ? snapshot.items : []
  const updateNotification = (item: NotificationItem) => setSnapshot((old) => old?.scope === sessionScope ? { ...old, items: old.items.map((n) => n.id === item.id ? item : n) } : old)

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); const target = notifications.find((n) => n.id === id), start = sessionScope
    if (!target) return
    try { const result = await notificationService.markRead(id, target.version || ''); if (latest.current === start) updateNotification({ ...target, ...mapNotification(result), scope: target.scope }) }
    catch (err: any) { if (latest.current === start) setApiError(notificationError(err)) }
  }
  const markingAll = useRef(false)
  const handleMarkAllAsRead = async () => {
    if (markingAll.current) return; markingAll.current = true; const start = sessionScope
    try { const updated = await notificationService.markAllRead(); if (latest.current !== start) return; setReload((v) => v + 1); showToast(`Đã đánh dấu ${updated} thông báo đã đọc (đọc theo lô từ máy chủ).`) }
    catch (err: any) { if (latest.current === start) setApiError(notificationError(err)) } finally { markingAll.current = false }
  }
  const handleNavigateAction = async (item: NotificationItem) => {
    const start = sessionScope
    try {
      const detail = await notificationService.detail(item.id); const scope = await notificationService.scope(item.id)
      if (latest.current !== start) return
      updateNotification({ ...mapNotification(detail), scope, title: scope.title || 'Thông báo', categoryLabel: scope.classification || 'Thông báo', sender: scope.senderKind && scope.senderKind !== 'UNKNOWN' ? scope.senderKind : '', stationing: '' })
    } catch (err: any) { if (latest.current === start) setApiError(notificationError(err)) }
  }

  const filtered = useMemo(() => notifications.filter((n) => {
    if (priorityFilter !== 'ALL' && n.priority !== priorityFilter) return false
    if (unreadOnly && n.read) return false
    const q = searchQuery.trim().toLowerCase()
    return !q || n.message.toLowerCase().includes(q) || n.resourceId.toLowerCase().includes(q)
  }), [notifications, priorityFilter, unreadOnly, searchQuery])
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-5" data-testid="notifications-hub">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2"><X className="w-4 h-4" /></button>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trung tâm thông báo</h1>
          <p className="text-xs text-slate-500 mt-1">{unreadCount} chưa đọc / {notifications.length} thông báo của tài khoản hiện tại. Mức ưu tiên do máy chủ tính theo hạn bắt buộc còn hiệu lực (CAO / THƯỜNG; chưa xác định khi thiếu nguồn hạn); người gửi và hạn lấy từ "Xem chi tiết và phạm vi".</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PanelButton disabled={loading} onClick={() => setReload((n) => n + 1)}>Tải lại</PanelButton>
          <PanelButton variant="primary" disabled={loading || unreadCount === 0} onClick={() => { void handleMarkAllAsRead() }}>Đánh dấu tất cả đã đọc</PanelButton>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input aria-label="Tìm thông báo" className="rg-field !w-64" placeholder="Tìm theo nội dung hoặc mã nguồn" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        <select aria-label="Lọc theo ưu tiên" className="rg-field !w-auto" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as NotificationPriorityFilter)}>
          <option value="ALL">Mọi mức ưu tiên</option><option value="HIGH">Cao (quá hạn bắt buộc)</option><option value="NORMAL">Thường</option><option value="UNKNOWN">Chưa xác định</option>
        </select>
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={unreadOnly} onChange={() => setUnreadOnly(!unreadOnly)} />Chỉ chưa đọc</label>
      </div>
      <NotificationsFeed loading={loading} error={apiError} filteredNotifications={filtered} onMarkAsRead={handleMarkAsRead} onNavigateAction={handleNavigateAction} />
      <DutyPanel />
    </div>
  )
}

export default NotificationsHandoffHub
