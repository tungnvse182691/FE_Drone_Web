import { useState, useEffect } from 'react'
import { supDashboardService, dashboardErrorText, type SupDashboardData } from '../../../api/services/supDashboardService'

/** Dashboard Giám sát: chỉ dữ liệu BE (GET /projects, /projects/overviews, /reports/summary|timeline). Không có API danh mục rủi ro/bản đồ nên không dựng. */
export function useSupDashboardState() {
  const [dashboardData, setDashboardData] = useState<SupDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedProject, setSelectedProject] = useState('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setLoadError(null)
    supDashboardService
      .load(controller.signal)
      .then((d) => { if (controller.signal.aborted) return; setDashboardData(d); setIsLoading(false); setIsRefreshing(false) })
      .catch((e) => { if (controller.signal.aborted) return; setLoadError(dashboardErrorText(e)); setIsLoading(false); setIsRefreshing(false) })
    return () => controller.abort()
  }, [reloadKey])

  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3500) }
  const handleRefresh = () => { setIsRefreshing(true); setReloadKey((k) => k + 1) }
  const resetFilters = () => { setSelectedProject('ALL') }

  return { dashboardData, isLoading, loadError, selectedProject, setSelectedProject, isRefreshing, toastMessage, setToastMessage, showToast, handleRefresh, resetFilters }
}
