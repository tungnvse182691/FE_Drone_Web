import React from 'react'
import { Trash2, X } from 'lucide-react'

export interface CreateDeletionRequestModalProps {
  showCreateDeletionRequestModal: boolean
  setShowCreateDeletionRequestModal: (show: boolean) => void
  newDelProject: string
  setNewDelProject: (val: string) => void
  newDelDataType: string
  setNewDelDataType: (val: string) => void
  newDelSize: number
  setNewDelSize: (val: number) => void
  newDelJustification: string
  setNewDelJustification: (val: string) => void
  handleCreateDeletionSubmit: (e: React.FormEvent) => void
}

export const CreateDeletionRequestModal: React.FC<CreateDeletionRequestModalProps> = ({
  showCreateDeletionRequestModal,
  setShowCreateDeletionRequestModal,
  newDelProject,
  setNewDelProject,
  newDelDataType,
  setNewDelDataType,
  newDelSize,
  setNewDelSize,
  newDelJustification,
  setNewDelJustification,
  handleCreateDeletionSubmit,
}) => {
  if (!showCreateDeletionRequestModal) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-md w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#BA1A1A]" />
            <h3 className="text-base font-bold text-[#151C27]">
              Lập yêu cầu xóa dữ liệu hết hạn (BR-45)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateDeletionRequestModal(false)}
            className="p-1 rounded-lg text-[#555F6F] hover:text-[#151C27] hover:bg-[#F8F9FA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateDeletionSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#151C27]">Dự án bảo hành:</label>
            <select
              value={newDelProject}
              onChange={(e) => setNewDelProject(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-medium text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
            >
              <option value="proj-04">Sửa chữa bảo trì Km 990 - 1000 (Hết BH năm 2020 - Đủ 5 năm)</option>
              <option value="proj-02">QL1A - Giai đoạn 1 (Hết BH năm 2021 - Đang Legal Hold)</option>
              <option value="proj-01">QL1A - Giai đoạn 2 (Hạn BH 31/12/2026 - Chưa hết hạn)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#151C27]">Loại tệp dữ liệu đề xuất xóa:</label>
            <select
              value={newDelDataType}
              onChange={(e) => setNewDelDataType(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-medium text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
            >
              <option value="Ảnh thô Drone (RAW Media)">Ảnh thô Drone phân giải cao (RAW)</option>
              <option value="Video hành trình tuần đường">Video hành trình tuần đường xe cơ giới</option>
              <option value="Dữ liệu cảm biến RTK">Dữ liệu thô cảm biến đo đạc RTK</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#151C27]">Dung lượng ước tính (GB):</label>
            <input
              type="number"
              required
              min={1}
              value={newDelSize}
              onChange={(e) => setNewDelSize(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs text-[#151C27] focus:outline-none focus:border-[#C9A227]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#151C27]">Căn cứ &amp; Giải trình hết hạn bảo hành (+5 năm):</label>
            <textarea
              required
              rows={3}
              value={newDelJustification}
              onChange={(e) => setNewDelJustification(e.target.value)}
              placeholder="Ghi rõ thời điểm hết hạn bảo hành của công trình và tình trạng sao lưu..."
              className="w-full p-2.5 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs text-[#151C27] focus:outline-none focus:border-[#C9A227] resize-none"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E2E5E9] text-[11px] text-[#555F6F]">
            Lưu ý: Yêu cầu sẽ được chuyển đến Supervisor xem xét. Hệ thống sẽ tự động chặn nếu dự án đang có lệnh <strong>Legal Hold</strong> hoặc chưa đủ thời hạn <strong>5 năm sau bảo hành</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5E9]">
            <button
              type="button"
              onClick={() => setShowCreateDeletionRequestModal(false)}
              className="px-4 py-2 rounded-lg bg-[#F8F9FA] hover:bg-[#E2E5E9] text-[#374151] text-xs font-semibold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-sm"
            >
              Gửi yêu cầu xóa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
