import React from 'react'
import { Edit3, X, CheckCircle2, XCircle, Check } from 'lucide-react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'

export interface EditUserModalProps {
  userToEdit: SystemUserAccount | null
  setUserToEdit: (u: SystemUserAccount | null) => void
  editFullName: string
  setEditFullName: (val: string) => void
  editEmail: string
  setEditEmail: (val: string) => void
  editPhone: string
  setEditPhone: (val: string) => void
  editRole: RoleCode
  setEditRole: (val: RoleCode) => void
  editProjectScope: string
  setEditProjectScope: (val: string) => void
  editCertificate: string
  setEditCertificate: (val: string) => void
  editStatus: 'ACTIVE' | 'SUSPENDED'
  setEditStatus: (val: 'ACTIVE' | 'SUSPENDED') => void
  handleSaveEdit: (e: React.FormEvent) => void
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  userToEdit,
  setUserToEdit,
  editFullName,
  setEditFullName,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editRole,
  setEditRole,
  editProjectScope,
  setEditProjectScope,
  editCertificate,
  setEditCertificate,
  editStatus,
  setEditStatus,
  handleSaveEdit,
}) => {
  if (!userToEdit) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 text-[#8C6D15] flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Chỉnh sửa nhân sự trong dự án
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật chức vụ, tuyến phụ trách và trạng thái tài khoản
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUserToEdit(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Họ và tên nhân sự: <span className="text-rose-600">*</span></label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Email công vụ: <span className="text-rose-600">*</span></label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Số điện thoại liên hệ:</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="0912.xxx.xxx"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Vai trò phân quyền: <span className="text-rose-600">*</span></label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as RoleCode)}
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
            <label className="font-semibold text-slate-700">Tuyến / Dự án phân công phụ trách: <span className="text-slate-400 font-normal">(Tùy chọn)</span></label>
            <select
              value={editProjectScope}
              onChange={(e) => setEditProjectScope(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
            >
              <option value="">-- Để trống (Chưa phân công dự án) --</option>
              <option value="Chưa phân công dự án">-- Chưa phân công dự án --</option>
              <option value="QL1A - Giai đoạn 2 (Km 1024 - 1045)">QL1A - Giai đoạn 2 (Km 1024 - 1045)</option>
              <option value="QL1A - Giai đoạn 1 (Km 990 - 1024)">QL1A - Giai đoạn 1 (Km 990 - 1024)</option>
              <option value="Cao tốc Bắc - Nam (Km 45 - 80)">Cao tốc Bắc - Nam (Km 45 - 80)</option>
              <option value="Cao tốc Bắc Nam - Đoạn Diễn Châu">Cao tốc Bắc Nam - Đoạn Diễn Châu</option>
              <option value="Cao tốc La Sơn - Túy Loan">Cao tốc La Sơn - Túy Loan</option>
              <option value="Quốc lộ 14 - Đoạn Chơn Thành">Quốc lộ 14 - Đoạn Chơn Thành</option>
              <option value="Toàn hệ thống dự án & Ban QLDA 7">Toàn hệ thống dự án &amp; Ban QLDA 7</option>
              <option value="Cục Đường bộ Việt Nam">Cục Đường bộ Việt Nam</option>
              <option value="Đội Bay Trắc Địa Không Ảnh 01">Đội Bay Trắc Địa Không Ảnh 01</option>
              <option value="Tổ thi công Asphalt Hoàng Hải 01">Tổ thi công Asphalt Hoàng Hải 01</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Chứng chỉ hành nghề / Chuyên môn:</label>
            <input
              type="text"
              value={editCertificate}
              onChange={(e) => setEditCertificate(e.target.value)}
              placeholder="VD: CCHN Giám sát thi công Hạng I, Bằng phi công UAV..."
              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Trạng thái làm việc:</label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditStatus('ACTIVE')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  editStatus === 'ACTIVE'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đang hoạt động (ACTIVE)</span>
              </button>
              <button
                type="button"
                onClick={() => setEditStatus('SUSPENDED')}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  editStatus === 'SUSPENDED'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Đình chỉ phiên (SUSPENDED)</span>
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUserToEdit(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu cập nhật nhân sự</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
