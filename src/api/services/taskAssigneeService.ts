import { apiClient } from '../client'

/**
 * GET /projects/{p}/task-assignees?taskIds=… (PM/Sup, ≤100 task/lần): tên người đang/đã được giao, kể cả sau reassign.
 * Tên là tên tài khoản HIỆN HÀNH (nameSource CURRENT_ACCOUNT), null khi tài khoản thiếu tên → không tự bịa.
 */
export interface TaskAssignee { taskId: string; taskKind: string; assignmentId: string; userId: string; displayName: string | null; nameSource?: string | null; assignedAt?: string | null; endedAt?: string | null; current: boolean }

export const taskAssigneeService = {
  /** Tất cả lượt giao (lịch sử + hiện tại) của các task. */
  async list(projectId: string, taskIds: string[]): Promise<TaskAssignee[]> {
    const rows: TaskAssignee[] = []
    const ids = [...new Set(taskIds)]
    for (let i = 0; i < ids.length; i += 100) {
      const { data } = await apiClient.get<TaskAssignee[]>(`/projects/${projectId}/task-assignees`, { params: { taskIds: ids.slice(i, i + 100) }, paramsSerializer: { indexes: null } })
      if (!Array.isArray(data)) throw new Error('Danh sách người được giao sai contract.')
      rows.push(...data)
    }
    return rows
  },
  /** taskId → tên người đang được giao (current=true). Thiếu tên thì không có khóa. */
  async currentNames(projectId: string, taskIds: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>()
    for (const r of await this.list(projectId, taskIds)) if (r.current && r.displayName?.trim()) map.set(r.taskId.toLowerCase(), r.displayName.trim())
    return map
  },
}
