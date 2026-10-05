import React from 'react'
import {
  AlertOctagon,
  X,
  Lock,
  Trash2,
  Briefcase,
  MapPin,
  Award,
  Phone,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  XCircle,
  Check,
  UserPlus,
  Plus,
  UserCheck
} from 'lucide-react'
import { RoleCode } from '../../../types/enums'
import { SystemUserAccount } from '../../../types/domain'

interface SystemControlModalsProps {
  // 1. Suspend Modal
  showSuspendModal: boolean
  setShowSuspendModal: (show: boolean) => void
  userToSuspend: SystemUserAccount | null
  handoffAssignee: string
  setHandoffAssignee: (val: string) => void
  handleConfirmSuspend: () => void

  // 2. Deletion Request Modal
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

  // 3. User Detail Modal
  selectedUserDetail: SystemUserAccount | null
  setSelectedUserDetail: (u: SystemUserAccount | null) => void
  isSupervisor: boolean
  handleOpenEdit: (u: SystemUserAccount) => void

  // 4. Edit User Modal
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

  // 5. Add Personnel Modal
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

export const SystemControlModals: React.FC<SystemControlModalsProps> = ({
  showSuspendModal,
  setShowSuspendModal,
  userToSuspend,
  handoffAssignee,
  setHandoffAssignee,
  handleConfirmSuspend,

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

  selectedUserDetail,
  setSelectedUserDetail,
  isSupervisor,
  handleOpenEdit,

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
  handleAddPersonnelSubmit
}) => {
  return (
    <>
      {/* MODAL: ĐÌNH CHỈ TÀI KHOẢN & BÀN GIAO CÔNG VIỆC */}
      {showSuspendModal && userToSuspend && (
        <div className="fixed inset-0 z-50 bg-[#151C27]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9]">
              <div className="flex items-center gap-2 text-[#BA1A1A]">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#151C27]">
                  Đình chỉ tài khoản &amp; Bàn giao công việc (UAT-09)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="p-1 rounded-lg text-[#555F6F] hover:text-[#151C27] hover:bg-[#F8F9FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#555F6F] space-y-3">
              <p>
                Bạn đang chuẩn bị đình chỉ quyền truy cập của{' '}
                <strong className="text-[#151C27]">{userToSuspend.full_name}</strong> ({userToSuspend.email}).
              </p>

              <div className="p-3 bg-[#FFDAD6] border border-[#FFCDD2] rounded-xl text-[#BA1A1A] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Quy trình thu hồi token tức thì (UAT-09):
                </div>
                <p className="text-[11px] leading-relaxed">
                  Toàn bộ phiên làm việc (Web/Mobile) sẽ bị thu hồi ngay lập tức. Toàn bộ lịch sử thao tác của nhân sự này được bảo tồn nguyên vẹn trên Audit Trail (BR-45).
                </p>
              </div>

              {/* Bàn giao công việc dở dang */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#151C27] block">
                  Chọn nhân sự tiếp nhận bàn giao công việc dở dang:
                </label>
                <select
                  value={handoffAssignee}
                  onChange={(e) => setHandoffAssignee(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA] text-xs font-semibold text-[#151C27] focus:outline-none focus:border-[#C9A227] cursor-pointer"
                >
                  <option value="usr-01">Kỹ sư Nguyễn Văn An (Supervisor / Ban Giám Sát)</option>
                  <option value="usr-04">PM Lê Tuấn (Chỉ huy trưởng QL1A-01)</option>
                  <option value="usr-03">PM Đỗ Quốc Hoàng (Chỉ huy trưởng QL1A-02)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5E9]">
              <button
                type="button"
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 rounded-lg bg-[#F8F9FA] hover:bg-[#E2E5E9] text-[#374151] text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="px-4 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold shadow-sm transition-colors"
              >
                Xác nhận đình chỉ &amp; Bàn giao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LẬP YÊU CẦU XÓA DỮ LIỆU LƯU TRỮ */}
      {showCreateDeletionRequestModal && (
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
      )}

      {/* MODAL: XEM CHI TIẾT NHÂN SỰ */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-[#151C27]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E5E9] max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-full font-bold flex items-center justify-center text-sm shadow-md text-white border-2 border-white/20 ${
                    selectedUserDetail.status === 'SUSPENDED'
                      ? 'bg-slate-600'
                      : selectedUserDetail.role === RoleCode.SUPERVISOR
                      ? 'bg-[#C9A227]'
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
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {selectedUserDetail.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#C9A227]" />
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
                      <MapPin className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                      {selectedUserDetail.project_scope}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 text-[11px] block">Chứng chỉ hành nghề &amp; Chuyên môn:</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Award className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
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
                  <Phone className="w-4 h-4 text-[#C9A227]" />
                  <span>Thông tin liên hệ &amp; Thiết bị hiện trường</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Số điện thoại di động:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {selectedUserDetail.phone || '0988.667.234'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Email công vụ:</span>
                    <span className="font-mono text-slate-800">
                      {selectedUserDetail.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Thiết bị đăng nhập gần nhất:</span>
                    <span className="font-medium text-slate-800">
                      {selectedUserDetail.device_info}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Địa chỉ IP &amp; Lần cuối hoạt động:</span>
                    <span className="font-mono text-slate-700">
                      {selectedUserDetail.ip_address} • {selectedUserDetail.last_active}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                <h4 className="font-bold text-amber-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  <span>Ma trận quyền hạn nghiệp vụ (RBAC Spec v2.2)</span>
                </h4>
                <ul className="space-y-1.5 text-[11px] text-amber-900/90 list-disc list-inside">
                  {selectedUserDetail.role === RoleCode.SUPERVISOR ? (
                    <>
                      <li>Toàn quyền thẩm duyệt hồ sơ đợt sửa chữa &amp; dự toán (WF-12).</li>
                      <li>Quyền bật / tắt lệnh phong tỏa pháp lý (Legal Hold BR-45) khi có yêu cầu thanh tra.</li>
                      <li>Nghiệm thu chất lượng thi công hiện trường &amp; Ký số đóng đợt sửa chữa (WF-16/18).</li>
                      <li>Quản lý danh sách nhân sự, phân bổ dự án và phê duyệt hủy dữ liệu hết hạn bảo hành.</li>
                    </>
                  ) : selectedUserDetail.role === RoleCode.PROJECT_MANAGER ? (
                    <>
                      <li>Tạo và quản lý yêu cầu bay khảo sát Drone trên tuyến được giao (WF-05/06).</li>
                      <li>Thẩm định kết quả phát hiện hư hỏng tự động của AI (Bounding box &amp; Đa kỳ WF-08/09).</li>
                      <li>Gom đợt sửa chữa, lập bảng quy chuẩn kỹ thuật và trình duyệt hồ sơ lên Giám sát (WF-10/11).</li>
                      <li>Giao việc cho Đội thi công (Crew) và xác nhận hoàn thành công việc hiện trường (WF-14/17).</li>
                    </>
                  ) : selectedUserDetail.role === RoleCode.DRONE_OPERATOR ? (
                    <>
                      <li>Thực thi kế hoạch bay khảo sát không ảnh theo lịch trình được PM duyệt (WF-05).</li>
                      <li>Đồng bộ ảnh thô, dữ liệu trắc địa vệ tinh RTK và nhật ký tọa độ chuyến bay.</li>
                      <li>Báo cáo an toàn bay, thời tiết và hiện trạng thiết bị phần cứng UAV.</li>
                    </>
                  ) : (
                    <>
                      <li>Tiếp nhận lệnh sửa chữa (Work Order) ngoài hiện trường từ PM (WF-14).</li>
                      <li>Thực hiện vá dặm ổ gà, trám khe nứt và chụp ảnh đối chứng nghiệm thu trước/sau.</li>
                      <li>Đồng bộ biên bản thi công ngoại tuyến về máy chủ khi có mạng 4G/Wi-Fi.</li>
                    </>
                  )}
                </ul>
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
                    className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
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
      )}

      {/* MODAL: CHỈNH SỬA NHÂN SỰ TRONG DỰ ÁN */}
      {userToEdit && (
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
      )}

      {/* MODAL: THÊM & GÁN NHÂN SỰ VÀO DỰ ÁN */}
      {showAddPersonnelModal && (
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
      )}
    </>
  )
}
