import { useQueries, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { personnelService } from '../../../api/services/personnelService'
import { projectService } from '../../../api/services/projectService'

/** Share the permitted member directory across FastTrack cards and policy history. */
export function useFastTrackPeople(projectIds: string[]) {
  const epoch = useAuthStore(s => s.authEpoch), user = useAuthStore(s => s.user)
  const projects = [...new Set(projectIds.filter(Boolean))].sort()
  const queries = useQueries({ queries: projects.map(projectId => ({
    queryKey: ['fasttrack-member-names', epoch, user?.id, user?.role, projectId],
    queryFn: () => projectService.fetchProjectMembers(projectId, true),
    enabled: !!user,
    staleTime: 30_000,
    retry: false,
  })) })
  const directory = useQuery({
    queryKey: ['fasttrack-user-names', epoch, user?.id, user?.role],
    queryFn: () => personnelService.fetchStaffDirectory(),
    enabled: !!projects.length && user?.role === 'SUPERVISOR',
    staleTime: 30_000,
    retry: false,
  })
  const name = (projectId: string, userId?: string) => {
    const members = queries[projects.indexOf(projectId)]?.data || []
    const rows = [...members, ...(user?.role === 'SUPERVISOR' ? directory.data || [] : [])]
    const names = [...new Set(rows.filter(m => m.userId === userId).map(m => String(m.displayName || '').trim()).filter(n => n && !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(n)))]
    return names.length === 1 ? names[0] : undefined
  }
  const status = (projectId: string) => {
    const q = queries[projects.indexOf(projectId)]
    const error = q?.error as { response?: { status?: number } } | undefined
    return error?.response?.status === 403 ? 'forbidden' : q?.isError ? 'error' : q?.isPending ? 'loading' : 'ready'
  }
  return { name, status }
}
