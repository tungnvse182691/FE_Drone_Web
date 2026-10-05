import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'

export interface AlignmentState {
  projectId: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  submittedAt?: string
  confirmedAt?: string
  confirmedBy?: string
}

export const alignmentService = {
  getAlignmentState(projectId: string): AlignmentState {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    return getFromStorage<AlignmentState>(key, {
      projectId,
      status: 'CONFIRMED', // Mặc định tuyến QL1A đã được phê duyệt sẵn để bay drone
      confirmedAt: '01/01/2026',
      confirmedBy: 'Tư vấn giám sát trưởng (Supervisor)'
    })
  },

  submitAlignment(projectId: string): AlignmentState {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    const updated: AlignmentState = {
      projectId,
      status: 'PENDING_APPROVAL',
      submittedAt: new Date().toLocaleDateString('vi-VN') + ' - ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    saveToStorage(key, updated)
    return updated
  },

  confirmAlignment(projectId: string, supervisorName = 'Giám sát trưởng (Supervisor)'): AlignmentState {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    const updated: AlignmentState = {
      projectId,
      status: 'CONFIRMED',
      confirmedAt: new Date().toLocaleDateString('vi-VN') + ' - ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      confirmedBy: supervisorName
    }
    saveToStorage(key, updated)
    return updated
  },

  resetAlignment(projectId: string): void {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    saveToStorage(key, {
      projectId,
      status: 'DRAFT'
    })
  }
}
