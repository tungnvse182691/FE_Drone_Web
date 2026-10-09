import { FieldTask } from '../../types/domain'
import { mockFieldTasks } from '../../data/mockData'

/**
 * ============================================================================
 * MODULE: fieldTaskService (Quản lý Nhiệm vụ Đo đạc Bổ sung Hiện trường KT01, KT02)
 * Giả lập RESTful API bất đồng bộ theo kiến trúc chuẩn của RoadGuard
 * In-Memory Mock Store (Zero direct localStorage coupling trong UI components)
 * ============================================================================
 */

let inMemoryTasks: FieldTask[] = JSON.parse(JSON.stringify(mockFieldTasks))

export interface FieldTaskFilterParams {
  status?: string
  search?: string
}

export interface CreateFieldTaskPayload {
  defect_id?: string
  defect_code: string
  measurement_type: string
  chainage_km: number
  lane?: string
  technician_name: string
  notes?: string
}

export const fieldTaskService = {
  /**
   * Lấy danh sách nhiệm vụ đo đạc hiện trường (GET /api/v1/field-tasks)
   */
  async getTasks(params?: FieldTaskFilterParams): Promise<FieldTask[]> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    let list = [...inMemoryTasks]

    if (params?.status && params.status !== 'ALL') {
      list = list.filter((t) => t.status === params.status)
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.defect_code.toLowerCase().includes(q) ||
          t.measurement_type.toLowerCase().includes(q) ||
          t.technician_name.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      )
    }

    return JSON.parse(JSON.stringify(list))
  },

  /**
   * Lấy chi tiết một nhiệm vụ theo ID (GET /api/v1/field-tasks/:id)
   */
  async getTaskById(id: string): Promise<FieldTask | null> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const task = inMemoryTasks.find((t) => t.id === id)
    return task ? JSON.parse(JSON.stringify(task)) : null
  },

  /**
   * Tạo mới nhiệm vụ đo đạc bổ sung (POST /api/v1/field-tasks)
   */
  async createTask(payload: CreateFieldTaskPayload): Promise<FieldTask> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const newTask: FieldTask = {
      id: `ft-${Date.now()}`,
      code: `TSK-MEAS-${Math.floor(1000 + Math.random() * 9000)}`,
      defect_id: payload.defect_id || `def-${Date.now()}`,
      defect_code: payload.defect_code.trim().toUpperCase(),
      defect_name: 'Hư hỏng mặt đường BTXM yêu cầu kiểm tra hiện trường',
      defect_photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
      measurement_type: payload.measurement_type,
      chainage_km: Number(payload.chainage_km) || 1025.4,
      lane: payload.lane || 'Làn cơ giới 1',
      status: 'ASSIGNED',
      technician_name: payload.technician_name,
      created_at: new Date().toISOString().split('T')[0],
      notes: payload.notes || 'Lệnh đo đạc phát sinh từ thẩm định kỹ thuật',
      gps_lat: 16.2405,
      gps_lng: 108.1310,
      exif_device: 'DJI Matrice 350 RTK (Zenmuse P1)',
      exif_captured_at: new Date().toLocaleString('vi-VN')
    }

    inMemoryTasks = [newTask, ...inMemoryTasks]
    return JSON.parse(JSON.stringify(newTask))
  },

  /**
   * Bắt đầu đo đạc - Kỹ sư hiện trường nhận lệnh (PUT /api/v1/field-tasks/:id/start)
   */
  async startMeasuring(id: string): Promise<FieldTask> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const index = inMemoryTasks.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error(`Không tìm thấy nhiệm vụ đo đạc ID: ${id}`)
    }

    inMemoryTasks[index] = {
      ...inMemoryTasks[index],
      status: 'IN_PROGRESS'
    }

    return JSON.parse(JSON.stringify(inMemoryTasks[index]))
  },

  /**
   * Ghi nhận số đo & ảnh hiện trường (POST /api/v1/field-tasks/:id/measurements)
   */
  async recordMeasurement(
    id: string,
    measuredValue: number,
    photoUrl?: string,
    notes?: string
  ): Promise<FieldTask> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryTasks.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error(`Không tìm thấy nhiệm vụ đo đạc ID: ${id}`)
    }

    inMemoryTasks[index] = {
      ...inMemoryTasks[index],
      status: 'SUBMITTED',
      measured_value: measuredValue,
      evidence_photo_url:
        photoUrl ||
        inMemoryTasks[index].evidence_photo_url ||
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&auto=format&fit=crop&q=80',
      notes: notes || inMemoryTasks[index].notes
    }

    return JSON.parse(JSON.stringify(inMemoryTasks[index]))
  },

  /**
   * Thẩm định & Xác minh số liệu vào hồ sơ lỗi (POST /api/v1/field-tasks/:id/verify)
   */
  async verifyTask(id: string): Promise<FieldTask> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    const index = inMemoryTasks.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error(`Không tìm thấy nhiệm vụ đo đạc ID: ${id}`)
    }

    inMemoryTasks[index] = {
      ...inMemoryTasks[index],
      status: 'VERIFIED'
    }

    return JSON.parse(JSON.stringify(inMemoryTasks[index]))
  },

  /**
   * Khôi phục danh sách về dữ liệu mẫu ban đầu phục vụ kiểm thử
   */
  async resetTasks(): Promise<FieldTask[]> {
    await new Promise((resolve) => setTimeout(resolve, 60))
    inMemoryTasks = JSON.parse(JSON.stringify(mockFieldTasks))
    return JSON.parse(JSON.stringify(inMemoryTasks))
  }
}
