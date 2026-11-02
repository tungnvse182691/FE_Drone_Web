import React from 'react'
import {
  X,
  Briefcase,
  MapPin,
  Award,
  Phone,
  ShieldCheck,
  Edit3,
} from 'lucide-react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'

export interface UserDetailModalProps {
  selectedUserDetail: SystemUserAccount | null
  setSelectedUserDetail: (u: SystemUserAccount | null) => void
  isSupervisor: boolean
  handleOpenEdit: (u: SystemUserAccount) => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  selectedUserDetail,
  setSelectedUserDetail,
  isSupervisor,
  handleOpenEdit,
}) => {
  if (!selectedUserDetail) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-brand-border max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-[#C9A227] to-[#A88214] text-white p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm shadow-md text-white border-2 border-white/20 ${
                selectedUserDetail.status === 'SUSPENDED'
                  ? 'bg-slate-600'
                  : selectedUserDetail.role === RoleCode.SUPERVISOR
                  ? 'bg-brand-gold'
                  : selectedUserDetail.role === RoleCode.PROJECT_MANAGER
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}
            >
              {selectedUserDetail.full_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold leading-tight font-headline">
                  {selectedUserDetail.full_name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    selectedUserDetail.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : selectedUserDetail.status === 'SUSPENDED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {selectedUserDetail.status}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-mono mt-0.5">
                {selectedUserDetail.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedUserDetail(null)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/15 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-gold" />
              <span>Nhiệm vụ &amp; Phạm vi dự án</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Vai trò phân quyền:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {selectedUserDetail.role_label}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Tuyến / Dự án phân công:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  {selectedUserDetail.project_scope}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[11px] block">Chứng chỉ hành nghề &amp; Chuyên môn:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  {selectedUserDetail.certificate || 'Hồ sơ lưu trữ nội bộ Hoàng Hải'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Ngày tiếp nhận công tác:</span>
                <span className="font-mono text-slate-700">
                  {selectedUserDetail.joined_date || '15/01/2024'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Mã định danh nội bộ:</span>
                <span className="font-mono text-slate-700">
                  {selectedUserDetail.id}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-gold" />
              <span>Thông tin liên hệ &amp; Tài khoản</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Số điện thoại di động:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {selectedUserDetail.phone || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Email / Gmail:</span>
                <span className="font-mono text-slate-800">
                  {selectedUserDetail.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Mã định danh tài khoản (User ID):</span>
                <span className="font-mono text-slate-700 text-[11px] select-all">
                  {selectedUserDetail.id}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Trạng thái tài khoản:</span>
                <span className={`font-semibold ${
                  selectedUserDetail.status === 'ACTIVE'
                    ? 'text-emerald-700'
                    : selectedUserDetail.status === 'SUSPENDED'
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }`}>
                  {selectedUserDetail.status === 'ACTIVE'
                    ? 'Đang hoạt động'
                    : selectedUserDetail.status === 'SUSPENDED'
                    ? 'Đã đình chỉ'
                    : 'Chờ kích hoạt'}
                </span>
              </div>
            </div>
          </div>


        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            RoadGuard Security • Đã xác thực token phân quyền
          </span>
          <div className="flex items-center gap-2">
            {isSupervisor && (
              <button
                type="button"
                onClick={() => {
                  const u = selectedUserDetail
                  setSelectedUserDetail(null)
                  handleOpenEdit(u)
                }}
                className="px-4 py-2 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa nhân sự này</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedUserDetail(null)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
