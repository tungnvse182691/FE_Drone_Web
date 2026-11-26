import { apiClient } from '../client'
import { repairWorkflowService, type RepairHistory } from './repairWorkflowService'
import { constructionLifecycleService } from './constructionLifecycleService'

export type RecurrenceInput = { previousDefectId: string; priorRepairDecisionId: string; evidenceFileIds: string[]; expectedLifecycleVersion: string }
type Source = Pick<RecurrenceInput, 'previousDefectId' | 'priorRepairDecisionId'> & { itemId: string }
type Action = { id: string; kind: string; projectId: string; defectId?: string; linkedDefectId?: string; priorRepairDecisionId?: string }
const guid = (value?: string | null): value is string => !!value && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value) && value !== '00000000-0000-0000-0000-000000000000'

export function confirmedRecurrenceSource(projectId: string, defectId: string, h: RepairHistory): Source | null {
  const { item } = h
  if (item.projectId !== projectId || item.defectId !== defectId || item.state !== 'Confirmed' || item.result !== 'CONFIRMED' || !guid(item.effectiveDecisionId)) return null
  const exact = h.decisions.filter(d => d.id === item.effectiveDecisionId && d.itemId === item.id && d.obligationId === item.obligationId && d.defectId === defectId && d.result === 'CONFIRMED')
  return exact.length === 1 ? { itemId: item.id, previousDefectId: defectId, priorRepairDecisionId: item.effectiveDecisionId } : null
}

export function recurrenceAction(data: { projectId: string; actions: Action[] }, projectId: string, newDefectId: string, input: Pick<RecurrenceInput, 'previousDefectId' | 'priorRepairDecisionId'>) {
  if (data?.projectId !== projectId || !Array.isArray(data.actions) || !guid(newDefectId) || newDefectId === input.previousDefectId) return
  return data.actions.find(a => guid(a.id) && a.kind === 'LinkRecurrence' && a.projectId === projectId && a.linkedDefectId === newDefectId && a.defectId === input.previousDefectId && a.priorRepairDecisionId === input.priorRepairDecisionId)
}

export const defectRecurrenceService = {
  async options(projectId: string, signal?: AbortSignal) {
    const [packages, lifecycle, files] = await Promise.all([
      repairWorkflowService.packages(projectId, signal),
      constructionLifecycleService.read(projectId, signal),
      constructionLifecycleService.readEvidence(projectId, signal),
    ])
    const sources = new Map<string, Source>()
    for (const pkg of packages) {
      const items = await repairWorkflowService.items(projectId, pkg.id, signal)
      for (const item of items.filter(i => i.defectId === pkg.defectId && i.state === 'Confirmed' && i.result === 'CONFIRMED')) {
        const history = await repairWorkflowService.history(projectId, pkg.id, item.id, signal)
        const source = confirmedRecurrenceSource(projectId, pkg.defectId, history)
        if (source) sources.set(source.priorRepairDecisionId, source)
      }
    }
    return { sources: [...sources.values()], files, version: lifecycle.version }
  },
  async confirm(projectId: string, newDefectId: string, input: RecurrenceInput) {
    const { data } = await apiClient.get<{ projectId: string; actions: Action[] }>(`/projects/${projectId}/lifecycle`)
    if (!recurrenceAction(data, projectId, newDefectId, input)) throw new Error('Đã nhận quyết định nhưng chưa đối chiếu được hành động tái phát. Không gửi lệnh mới.')
  },
}
