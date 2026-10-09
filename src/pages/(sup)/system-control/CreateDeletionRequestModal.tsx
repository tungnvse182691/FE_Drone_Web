import React from 'react'
import { LegalHoldProject } from '../../../types/domain'

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
  legalHoldProjects?: LegalHoldProject[]
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
  legalHoldProjects = []
}) => {
  if (!showCreateDeletionRequestModal) return null

  const currentProj = legalHoldProjects.find((p) => p.project_id === newDelProject)
  const isBlockedByHold = currentProj?.is_legal_hold || false
  const isNotExpired5Y = !currentProj?.is_warranty_expired || (currentProj?.years_since_warranty_end || 0) < 5
  const isEligible = !isBlockedByHold && !isNotExpired5Y

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-rose-600">
              delete_forever
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Lập Yêu Cầu Hủy Hồ Sơ Lưu Trữ
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateDeletionRequestModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleCreateDeletionSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-800">Dự án công trình:</label>
            <select
              value={newDelProject}
              onChange={(e) => setNewDelProject(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-gold cursor-pointer"
            >
              {legalHoldProjects.length > 0 ? (
                legalHoldProjects.map((p) => {
                  const isHold = p.is_legal_hold
                  const isUnder5 = !p.is_warranty_expired || p.years_since_warranty_end < 5
                  let tag = 'Đủ điều kiện (> 5 năm)'
                  if (isHold) tag = 'Đang phong tỏa - Bị chặn'
                  else if (isUnder5) tag = 'Chưa đủ 5 năm - Bị chặn'

                  return (
                    <option key={p.project_id} value={p.project_id}>
                      {p.project_name} ({tag})
                    </option>
                  )
                })
              ) : (
                <>
                  <option value="proj-04">Sửa chữa bảo trì Km 990 - 1000 (Đủ điều kiện &gt; 5 năm)</option>
                  <option value="proj-02">QL1A - Giai đoạn 1 (Đang phong tỏa - Bị chặn)</option>
                  <option value="proj-01">QL1A - Giai đoạn 2 (Chưa đủ 5 năm - Bị chặn)</option>
                </>
              )}
            </select>
          </div>

          {/* Cảnh báo vi phạm điều kiện nếu chọn dự án không hợp lệ */}
          {!isEligible && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[16px] text-rose-600">block</span>
                <span>HỆ THỐNG TỰ ĐỘNG CHẶN ĐỀ XUẤT</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-700">
                {isBlockedByHold
                  ? 'Dự án đang trong diện thanh tra phong tỏa pháp lý (Legal Hold). Tuyệt đối không được phép lập đề xuất hủy dữ liệu.'
                  : 'Hồ sơ chưa đủ thời hạn 5 năm sau thời điểm kết thúc bảo hành (quy định BR-45). Nút gửi đề xuất đã bị vô hiệu hóa.'}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-800">Loại tệp dữ liệu đề xuất hủy:</label>
            <select
              value={newDelDataType}
              onChange={(e) => setNewDelDataType(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-gold cursor-pointer"
            >
              <option value="Ảnh thô Drone phân giải cao (RAW)">Ảnh thô Drone độ phân giải cao (RAW)</option>
              <option value="Video hành trình tuần đường">Video hành trình tuần đường xe cơ giới</option>
              <option value="Dữ liệu thô cảm biến RTK">Dữ liệu thô cảm biến đo đạc RTK</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-800">Dung lượng giải phóng ước tính (GB):</label>
            <input
              type="number"
              required
              min={1}
              value={newDelSize}
              onChange={(e) => setNewDelSize(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-800">Căn cứ &amp; Giải trình hết hạn bảo hành (+5 năm):</label>
            <textarea
              required
              rows={3}
              value={newDelJustification}
              onChange={(e) => setNewDelJustification(e.target.value)}
              placeholder="Ghi rõ số quyết định hoàn công, thời điểm hết hạn bảo hành và căn cứ thanh lý..."
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-brand-gold resize-none"
            />
          </div>

          {isEligible && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">
                check_circle
              </span>
              <span>Dự án đủ điều kiện lưu trữ (&gt; 5 năm sau bảo hành). Yêu cầu sẽ được chuyển đến Giám sát thẩm duyệt.</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateDeletionRequestModal(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isEligible}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                isEligible
                  ? 'bg-brand-gold hover:bg-brand-goldDark text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">send</span>
              <span>{isEligible ? 'Gửi sang Giám sát' : 'Bị khóa do chưa đủ điều kiện'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
