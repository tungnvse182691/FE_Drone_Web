import React from 'react'
import { UserPlus, X, Plus, UserCheck, Check } from 'lucide-react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'

export interface AddPersonnelModalProps {
  showAddPersonnelModal: boolean
  setShowAddPersonnelModal: (show: boolean) => void
  addPersonnelTab: 'NEW' | 'ASSIGN'
  setAddPersonnelTab: (tab: 'NEW' | 'ASSIGN') => void
  newPersonnelName: string
  setNewPersonnelName: (val: string) => void
  newPersonnelEmail: string
  setNewPersonnelEmail: (val: string) => void
  newPersonnelPhone: string
  setNewPersonnelPhone: (val: string) => void
  newPersonnelRole: RoleCode
  setNewPersonnelRole: (val: RoleCode) => void
  newPersonnelProject: string
  setNewPersonnelProject: (val: string) => void
  newPersonnelCert: string
  setNewPersonnelCert: (val: string) => void
  assignExistingUserId: string
  setAssignExistingUserId: (val: string) => void
  assignExistingProject: string
  setAssignExistingProject: (val: string) => void
  usersList: SystemUserAccount[]
  handleAddPersonnelSubmit: (e: React.FormEvent) => void
}

export const AddPersonnelModal: React.FC<AddPersonnelModalProps> = ({
  showAddPersonnelModal,
  setShowAddPersonnelModal,
  addPersonnelTab,
  setAddPersonnelTab,
  newPersonnelName,
  setNewPersonnelName,
  newPersonnelEmail,
  setNewPersonnelEmail,
  newPersonnelPhone,
  setNewPersonnelPhone,
  newPersonnelRole,
  setNewPersonnelRole,
  newPersonnelProject,
  setNewPersonnelProject,
  newPersonnelCert,
  setNewPersonnelCert,
  assignExistingUserId,
  setAssignExistingUserId,
  assignExistingProject,
  setAssignExistingProject,
  usersList,
  handleAddPersonnelSubmit,
}) => {
  if (!showAddPersonnelModal) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Quản trị nhân sự dự án
              </h3>
              <p className="text-xs text-slate-500">
                Thêm nhân sự mới hoặc phân công lại nhân sự vào tuyến đường bảo hành
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPersonnelModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 pb-0 bg-white">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setAddPersonnelTab('NEW')}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                addPersonnelTab === 'NEW'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>1. Thêm nhân sự mới</span>
            </button>
            <button
              type="button"
              onClick={() => setAddPersonnelTab('ASSIGN')}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                addPersonnelTab === 'ASSIGN'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>2. Điều chuyển nhân sự hiện có</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleAddPersonnelSubmit} className="p-6 overflow-y-auto space-y-3.5 text-xs">
          {addPersonnelTab === 'NEW' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Họ và tên nhân sự: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Kỹ sư Hoàng Nam"
                    value={newPersonnelName}
                    onChange={(e) => setNewPersonnelName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Email công vụ: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nam.hoang@hoanghai-infra.vn"
                    value={newPersonnelEmail}
                    onChange={(e) => setNewPersonnelEmail(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Số điện thoại liên hệ:</label>
                  <input
                    type="text"
                    placeholder="0912.xxx.xxx"
                    value={newPersonnelPhone}
                    onChange={(e) => setNewPersonnelPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Vai trò phân quyền: <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={newPersonnelRole}
                    onChange={(e) => setNewPersonnelRole(e.target.value as RoleCode)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                  >
                    <option value={RoleCode.PROJECT_MANAGER}>PROJECT_MANAGER (Chỉ huy trưởng PM)</option>
                    <option value={RoleCode.SUPERVISOR}>SUPERVISOR (Giám sát / Chủ đầu tư)</option>
                    <option value={RoleCode.DRONE_OPERATOR}>DRONE_OPERATOR (Phi công UAV)</option>
                    <option value={RoleCode.REPAIR_CREW}>REPAIR_CREW (Đội thi công hiện trường)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Chỉ định tuyến / Dự án phụ trách: <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <select
                  value={newPersonnelProject}
                  onChange={(e) => setNewPersonnelProject(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                >
                  <option value="">-- Để trống (Chưa phân công dự án - Có thể sửa sau) --</option>
                  <option value="QL1A - Giai đoạn 2 (Km 1024 - 1045)">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                  <option value="QL1A - Giai đoạn 1 (Km 990 - 1024)">QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
                  <option value="Cao tốc Bắc - Nam (Km 45 - 80)">Cao tốc Bắc - Nam (Km 45 - 80)</option>
                  <option value="Cao tốc Bắc Nam - Đoạn Diễn Châu">Cao tốc Bắc Nam - Đoạn Diễn Châu</option>
                  <option value="Cao tốc La Sơn - Túy Loan">Cao tốc La Sơn - Túy Loan</option>
                  <option value="Quốc lộ 14 - Đoạn Chơn Thành">Quốc lộ 14 - Đoạn Chơn Thành</option>
                </select>
                <p className="text-[10px] text-slate-500 italic">
                  * Có thể để trống nếu nhân sự mới chưa nhận dự án, Supervisor có thể bấm nút "Sửa" trong danh bạ để phân công dự án bất cứ lúc nào.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Chứng chỉ hành nghề / Chuyên môn:</label>
                <input
                  type="text"
                  placeholder="VD: CCHN Chỉ huy trưởng Hạng I (Số: CHT-1234/BXD)"
                  value={newPersonnelCert}
                  onChange={(e) => setNewPersonnelCert(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed">
                Tài khoản mới sẽ được cấp mật khẩu ban đầu và bắt buộc đổi mật khẩu khi đăng nhập lần đầu theo chính sách bảo mật RoadGuard (BR-02).
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Chọn nhân sự cần điều chuyển / phân công: <span className="text-rose-600">*</span>
                </label>
                <select
                  value={assignExistingUserId}
                  onChange={(e) => setAssignExistingUserId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email}) — Hiện tại: {u.project_scope}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Dự án điều chuyển sang phụ trách: <span className="text-rose-600">*</span>
                </label>
                <select
                  value={assignExistingProject}
                  onChange={(e) => setAssignExistingProject(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
                >
                  <option value="Chưa phân công dự án">-- Thu hồi dự án (Chờ phân công sau) --</option>
                  <option value="QL1A - Giai đoạn 2 (Km 1024 - 1045)">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
                  <option value="QL1A - Giai đoạn 1 (Km 990 - 1024)">QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
                  <option value="Cao tốc Bắc - Nam (Km 45 - 80)">Cao tốc Bắc - Nam (Km 45 - 80)</option>
                  <option value="Cao tốc Bắc Nam - Đoạn Diễn Châu">Cao tốc Bắc Nam - Đoạn Diễn Châu</option>
                  <option value="Cao tốc La Sơn - Túy Loan">Cao tốc La Sơn - Túy Loan</option>
                  <option value="Quốc lộ 14 - Đoạn Chơn Thành">Quốc lộ 14 - Đoạn Chơn Thành</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
                Sau khi điều chuyển, quyền hạn truy cập của nhân sự sẽ tự động chuyển sang phạm vi dự án mới, cập nhật danh bạ điều hành công trường.
              </div>
            </>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddPersonnelModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>
                {addPersonnelTab === 'NEW' ? 'Thêm nhân sự vào dự án' : 'Xác nhận điều chuyển'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
