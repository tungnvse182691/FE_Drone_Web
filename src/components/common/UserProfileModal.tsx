import React, { useState, useEffect } from 'react'
import { RoleCode } from '../../types/enums'
import { User } from '../../types/domain'
import { profileService, UserProfileFact } from '../../api/services/profileService'
import { userDirectory } from '../../api/services/userDirectory'
import { useAuthStore } from '../../store/authStore'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User | null
  onUpdateCurrentUser?: (data: Partial<User>) => void
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser
}) => {
  const { updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [profile, setProfile] = useState<UserProfileFact | null>(null)

  // State chỉnh sửa thông tin cá nhân
  const [fullName, setFullName] = useState<string>('')

  // State đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false)
  const [showNewPass, setShowNewPass] = useState<boolean>(false)

  // Thông báo phản hồi
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const triggerNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 4500)
  }

  // Load profile khi mở modal từ CSDL Backend thật
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)
    setNotice(null)

    profileService
      .getProfile()
      .then((prof) => {
        if (!isMounted) return
        setProfile(prof)
        setFullName(prof.displayName)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Lỗi khi tải profile từ Backend:', err)
        const fallbackName =
          currentUser?.full_name ||
          (currentUser as any)?.displayName ||
          currentUser?.email?.split('@')[0] ||
          'Nhân sự Hoàng Hải'
        setFullName(fallbackName)
        setProfile({
          userId: currentUser?.id || '',
          username: currentUser?.username || currentUser?.email || '',
          displayName: fallbackName,
          email: currentUser?.email || '',
          roleCode: currentUser?.role || RoleCode.PROJECT_MANAGER,
          roleTitle:
            currentUser?.role === RoleCode.SUPERVISOR
              ? 'Kỹ sư Giám sát / Đại diện Chủ đầu tư (Supervisor)'
              : 'Chỉ huy trưởng dự án (Project Manager)',
          status: 'ACTIVE',
          rowVersion: '',
          assignedProjects: []
        })
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, currentUser])

  if (!isOpen) return null

  // Xử lý lưu thông tin cá nhân lên CSDL Backend (API-048)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    const trimmedName = fullName.trim()
    if (!trimmedName) {
      triggerNotice('error', 'Họ và tên không được để trống.')
      return
    }

    try {
      setSaving(true)
      const updated = await profileService.updateProfile({
        displayName: trimmedName,
        email: profile.email || currentUser?.email,
        expectedRowVersion: profile.rowVersion
      })

      setProfile(updated)
      setFullName(updated.displayName)

      // Cập nhật ngay vào AuthStore và callback
      updateUser({
        full_name: updated.displayName,
        displayName: updated.displayName
      } as any)

      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({
          full_name: updated.displayName,
          displayName: updated.displayName
        } as any)
      }

      triggerNotice('success', `Đã cập nhật Họ và tên thành [${updated.displayName}] trên CSDL thành công!`)
    } catch (err: any) {
      console.error('Lỗi khi cập nhật profile:', err)
      const data = err?.response?.data
      const msg = data?.detail || data?.title || err?.message || 'Lỗi khi cập nhật thông tin hồ sơ lên Backend.'
      triggerNotice('error', msg)
    } finally {
      setSaving(false)
    }
  }

  // Xử lý đổi mật khẩu qua Backend (API-004)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    if (!currentPassword) {
      triggerNotice('error', 'Vui lòng nhập mật khẩu hiện tại.')
      return
    }
    if (newPassword.length < 8) {
      triggerNotice('error', 'Mật khẩu mới phải có tối thiểu 8 ký tự theo quy định BR-02.')
      return
    }
    if (newPassword !== confirmPassword) {
      triggerNotice('error', 'Xác nhận mật khẩu mới không khớp.')
      return
    }

    try {
      setSaving(true)
      const res = await profileService.changePassword(currentPassword, newPassword)
      triggerNotice('success', res.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error('Lỗi khi đổi mật khẩu:', err)
      triggerNotice('error', err?.message || 'Lỗi khi đổi mật khẩu trên hệ thống bảo mật.')
    } finally {
      setSaving(false)
    }
  }

  const isSupervisor = (profile?.roleCode || currentUser?.role) === RoleCode.SUPERVISOR
  const initials =
    (fullName || profile?.displayName || 'HH')
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'HH'

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Banner & Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-full bg-[#C9A227]/20 border-2 border-[#C9A227] text-[#8C6D15] font-bold text-base flex items-center justify-center ring-2 ring-brand-gold/30 shadow-xs">
                {initials}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                  profile?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={profile?.status === 'ACTIVE' ? 'Tài khoản đang hoạt động' : 'Tài khoản đã bị đình chỉ'}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-headline">
                  {profile?.displayName || fullName || 'Nhân sự Hoàng Hải'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isSupervisor
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}
                >
                  {isSupervisor ? 'Giám sát (SUP)' : 'Chỉ huy trưởng (PM)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {profile?.email || currentUser?.email}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Công ty TNHH Xây dựng Bê tông Hoàng Hải
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab chuyển đổi: Hồ sơ & Bảo mật */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-brand-gold text-brand-goldDark'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Hồ sơ cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-brand-gold text-brand-goldDark'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">lock_reset</span>
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Thông báo Alert */}
        {notice && (
          <div
            className={`mx-5 mt-4 p-3 rounded-lg text-xs flex items-center gap-2 border animate-in fade-in duration-150 ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] shrink-0">
              {notice.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-medium">{notice.message}</span>
          </div>
        )}

        {/* Nội dung Modal */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <span className="material-symbols-outlined text-[32px] animate-spin text-brand-gold">
                progress_activity
              </span>
              <span className="text-xs">Đang tải hồ sơ từ CSDL Backend...</span>
            </div>
          ) : activeTab === 'profile' ? (
            /* TAB 1: THÔNG TIN CÁ NHÂN */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Họ và tên (Cho phép chỉnh sửa để cập nhật database) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Họ và tên hiển thị trong hệ thống <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                    placeholder="Nhập họ và tên thật của bạn..."
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tên này sẽ hiển thị trên góc Header, biên bản nghiệm thu và nhật ký hoạt động dự án.
                  </p>
                </div>

                {/* Email hệ thống */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email đăng nhập (Chỉ đọc)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || currentUser?.email || ''}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 bg-slate-100 cursor-not-allowed"
                  />
                </div>

                {/* Số điện thoại liên hệ */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Số điện thoại liên hệ (Chỉ đọc)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userDirectory.findUser(currentUser?.id, currentUser?.full_name)?.phone || (currentUser as any)?.phone || '—'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-100 cursor-not-allowed"
                    title="Số điện thoại bảo mật được đồng bộ trực tiếp từ CSDL Backend"
                  />
                </div>

                {/* Vai trò */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vai trò nhiệm vụ
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.roleTitle || ''}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-100 cursor-not-allowed font-medium"
                  />
                </div>

                {/* Đơn vị công tác */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Đơn vị chủ quản
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Công ty TNHH Xây dựng Bê tông Hoàng Hải"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 bg-slate-100 cursor-not-allowed"
                  />
                </div>

                {/* Trạng thái tài khoản (Chuẩn ngữ cảnh thực tế) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Trạng thái tài khoản
                  </label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-emerald-700 font-bold">
                    <span className={`w-2 h-2 rounded-full ${profile?.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{profile?.status === 'ACTIVE' ? 'Đang hoạt động (Bình thường)' : 'Đã bị khóa / Đình chỉ'}</span>
                  </div>
                </div>
              </div>

              <section className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-bold text-slate-900 flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-brand-gold">workspace_premium</span>Chứng chỉ hành nghề &amp; Thẩm quyền kỹ thuật</h3><span className="text-[11px] text-slate-500">Chưa cập nhật</span></div>
                <fieldset disabled className="grid sm:grid-cols-2 gap-3">{['Phòng ban điều hành', 'Tên chứng chỉ & Số hiệu CCHN', 'Hạn hiệu lực chứng chỉ', 'Tiêu chuẩn áp dụng'].map(label => <label key={label} className="text-xs text-slate-600">{label}<input type="text" placeholder="Chưa cập nhật" className="block w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs" /></label>)}</fieldset>
                <div className="pt-3 border-t border-slate-200 space-y-3"><div className="flex flex-wrap justify-between items-center gap-2"><h4 className="text-xs font-bold text-slate-700">Ảnh chụp / Bản scan CCHN đối soát</h4><button type="button" disabled className="inline-flex gap-1 items-center px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 text-xs"><span className="material-symbols-outlined text-[17px]">add_photo_alternate</span>Tải ảnh CCHN lên</button></div><div className="p-5 rounded-lg border border-dashed border-slate-300 bg-white text-xs text-center text-slate-500">Chưa cập nhật</div><p className="text-[11px] text-slate-500">Chưa hỗ trợ cập nhật hồ sơ chuyên môn tại đây.</p></div>
              </section>

              {/* Dự án đang phụ trách thật từ CSDL */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Dự án &amp; Tuyến đường đang phụ trách ({profile?.assignedProjects.length || 0})
                </label>
                {profile?.assignedProjects && profile.assignedProjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.assignedProjects.map((proj) => (
                      <span
                        key={proj.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium"
                      >
                        <span className="material-symbols-outlined text-[14px] text-brand-gold">
                          route
                        </span>
                        <span>{proj.name}</span>
                        {proj.code && (
                          <span className="text-[10px] text-amber-700">({proj.code})</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50/50">
                    Tài khoản hiện chưa được phân công quản lý dự án nào trong CSDL.
                  </div>
                )}
              </div>

              {/* Footer nút hành động */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>{saving ? 'Đang lưu...' : 'Lưu Họ và Tên'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: ĐỔI MẬT KHẨU */
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">
                  info
                </span>
                <div className="leading-relaxed">
                  <strong>Quy tắc bảo mật Hoàng Hải (API-004):</strong> Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm cả chữ hoa, chữ thường, số và ký tự đặc biệt.
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                    placeholder="Nhập mật khẩu đang sử dụng..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showCurrentPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                      placeholder="Tối thiểu 8 ký tự..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showNewPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                    placeholder="Nhập lại mật khẩu mới..."
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  <span>{saving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
