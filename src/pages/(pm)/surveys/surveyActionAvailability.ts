export type TaskAct = 'reassign' | 'cancel' | 'supplement'

// Web only requests a postponement (no replacement time), so don't offer it twice.
export const canPostpone = (status: string) => status === 'PLANNED' || status === 'IN_PROGRESS'

export function taskActions(status: string, supplementTaskId?: string | null): TaskAct[] {
  if (status === 'SUBMITTED' || status === 'SUPPLEMENT_REQUIRED') return ['supplement']
  if (!['NEW_ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'REASSIGNED', 'REJECTED'].includes(status)) return []
  return supplementTaskId ? ['cancel'] : ['reassign', 'cancel']
}
