import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storageHelper'
import { projectService } from './projectService'

export interface AlignmentState {
  projectId: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'CONFIRMED'
  submittedAt?: string
  confirmedAt?: string
  confirmedBy?: string
  coords?: [number, number][]
  kmPoints?: number[]
  segments?: any[]
  branches?: any[]
}

export const alignmentService = {
  getAlignmentState(projectId: string): AlignmentState {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    // Chỉ duy nhất dự án demo ban đầu 'prj-ql1a-02' mới mặc định là CONFIRMED.
    // Các dự án khác hoặc dự án mới tạo (PENDING_ALIGNMENT) mặc định là 'DRAFT' để PM có thể nạp/chỉnh và bấm "Trình duyệt tim tuyến".
    const defaultStatus = projectId === 'prj-ql1a-02' ? 'CONFIRMED' : 'DRAFT'

    return getFromStorage<AlignmentState>(key, {
      projectId,
      status: defaultStatus,
      ...(projectId === 'prj-ql1a-02' ? {
        confirmedAt: '01/01/2026',
        confirmedBy: 'Tư vấn giám sát trưởng (Supervisor)'
      } : {})
    })
  },

  getAlignmentData(projectId: string): Partial<AlignmentState> {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_data_${projectId}`
    const data = getFromStorage<Partial<AlignmentState>>(key, {})
    // 1. Dọn dẹp phân đoạn mẫu tạm cũ
    if (data.segments && Array.isArray(data.segments)) {
      const isAutoDummy = data.segments.some((s: any) => s.id && s.id.startsWith(`seg-${projectId}-`))
      if (isAutoDummy) {
        data.segments = []
        this.saveAlignmentData(projectId, { segments: [] })
      }
    }
    // 2. Dọn dẹp 5 tọa độ mẫu tự sinh trước đây (Bình Phước, Nghệ An, Huế) cho các dự án mới
    if (data.coords && Array.isArray(data.coords) && data.coords.length === 5 && projectId !== 'prj-ql1a-02') {
      const p0 = data.coords[0]
      if (p0 && ((p0[0] === 106.85 && p0[1] === 11.20) || (p0[0] === 105.78 && p0[1] === 20.95) || (p0[0] === 108.15 && p0[1] === 16.20))) {
        data.coords = []
        data.kmPoints = []
        this.saveAlignmentData(projectId, { coords: [], kmPoints: [] })
      }
    }
    return data
  },

  saveAlignmentData(projectId: string, data: Partial<AlignmentState>): void {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_data_${projectId}`
    const existing = this.getAlignmentData(projectId)
    saveToStorage(key, { ...existing, ...data })
  },

  submitAlignment(projectId: string, totalLengthKm?: number): AlignmentState {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    const current = this.getAlignmentState(projectId)
    const updated: AlignmentState = {
      ...current,
      projectId,
      status: 'PENDING_APPROVAL',
      submittedAt: new Date().toLocaleDateString('vi-VN') + ' - ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
    saveToStorage(key, updated)

    // Cập nhật thông số tim tuyến dự án
    projectService.updateProjectAlignment(projectId, {
      status: 'PENDING_ALIGNMENT',
      kml_status: 'Chờ duyệt tim tuyến',
      ...(totalLengthKm !== undefined ? { length_km: totalLengthKm } : {})
    })
    window.dispatchEvent(new Event('roadguard_state_change'))
    return updated
  },

  confirmAlignment(projectId: string, supervisorName = 'Giám sát trưởng (Supervisor)', totalLengthKm?: number): AlignmentState {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    const current = this.getAlignmentState(projectId)
    const updated: AlignmentState = {
      ...current,
      projectId,
      status: 'CONFIRMED',
      confirmedAt: new Date().toLocaleDateString('vi-VN') + ' - ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      confirmedBy: supervisorName
    }
    saveToStorage(key, updated)

    // Supervisor duyệt -> Chuyển dự án sang ACTIVE, kml_status: 'Đã phê duyệt'
    projectService.updateProjectAlignment(projectId, {
      status: 'ACTIVE',
      kml_status: 'Đã phê duyệt',
      ...(totalLengthKm !== undefined ? { length_km: totalLengthKm } : {})
    })
    window.dispatchEvent(new Event('roadguard_state_change'))
    return updated
  },

  resetAlignment(projectId: string): void {
    const key = `${STORAGE_KEYS.ALIGNMENTS}_${projectId}`
    saveToStorage(key, {
      projectId,
      status: 'DRAFT'
    })
    window.dispatchEvent(new Event('roadguard_state_change'))
  }
}

