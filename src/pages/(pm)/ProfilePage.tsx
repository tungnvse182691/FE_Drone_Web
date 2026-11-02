import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { profileService, UserProfileFact } from '../../api/services/profileService'
import { userDirectory } from '../../api/services/userDirectory'

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [profile, setProfile] = useState<UserProfileFact | null>(null)

  // Chỉnh sửa hồ sơ
  const [fullName, setFullName] = useState<string>('')

  // Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false)
  const [showNewPass, setShowNewPass] = useState<boolean>(false)

  // Thông báo
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const triggerNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 4500)
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    profileService
      .getProfile()
      .then((prof) => {
        if (!isMounted) return
        setProfile(prof)
        setFullName(prof.displayName)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('Lỗi khi tải thông tin profile từ Backend:', err)
        const fallbackName =
          user?.full_name ||
          (user as any)?.displayName ||
          user?.email?.split('@')[0] ||
          'Nhân sự Hoàng Hải'
        setFullName(fallbackName)
        setProfile({
          userId: user?.id || '',
          username: user?.username || user?.email || '',
          displayName: fallbackName,
          email: user?.email || '',
          roleCode: user?.role || RoleCode.PROJECT_MANAGER,
          roleTitle:
            user?.role === RoleCode.SUPERVISOR
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
  }, [user])

  // Lưu thông tin cá nhân lên CSDL Backend (API-048)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    const trimmed = fullName.trim()
    if (!trimmed) {
      triggerNotice('error', 'Họ và tên không được để trống.')
      return
    }

    try {
      setSaving(true)
      const updated = await profileService.updateProfile({
        displayName: trimmed,
        email: profile.email || user?.email,
        expectedRowVersion: profile.rowVersion
      })
      setProfile(updated)
      setFullName(updated.displayName)

      updateUser({
        full_name: updated.displayName,
        displayName: updated.displayName
      } as any)

      triggerNotice('success', `Đã cập nhật Họ và tên thành [${updated.displayName}] trên CSDL thành công!`)
    } catch (err: any) {
      console.error('Lỗi khi cập nhật profile:', err)
      const data = err?.response?.data
      const msg = data?.detail || data?.title || err?.message || 'Lỗi khi cập nhật thông tin hồ sơ.'
      triggerNotice('error', msg)
    } finally {
      setSaving(false)
    }
  }

  // Đổi mật khẩu qua Backend (API-004)
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
      triggerNotice('error', err?.message || 'Lỗi khi đổi mật khẩu.')
    } finally {
      setSaving(false)
    }
  }

  const initials =
    (fullName || profile?.displayName || 'HH')
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'HH'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Banner hồ sơ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-32 bg-linear-to-r from-[#2D3748] to-[#1A1D20] relative p-6 flex items-end">
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isSupervisor
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40 backdrop-blur-xs'
                  : 'bg-amber-500/20 text-amber-200 border border-amber-400/40 backdrop-blur-xs'
              }`}
            >
              {profile?.roleTitle || (isSupervisor ? 'Kỹ sư Giám sát (SUP)' : 'Chỉ huy trưởng (PM)')}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-full bg-[#C9A227]/20 border-4 border-white text-[#8C6D15] font-bold text-2xl flex items-center justify-center ring-2 ring-brand-gold/40 shadow-md font-mono shrink-0">
              {initials}
            </div>
            <div className="mb-1">
              <h1 className="text-xl font-bold text-slate-900 font-headline">
                {profile?.displayName || fullName || 'Nhân sự Hoàng Hải'}
              </h1>
              <p className="text-xs text-slate-500 font-mono">{profile?.email || user?.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">Công ty TNHH Xây dựng Bê tông Hoàng Hải</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className={`w-2 h-2 rounded-full ${profile?.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{profile?.status === 'ACTIVE' ? 'Đang hoạt động (Bình thường)' : 'Đã bị khóa / Đình chỉ'}</span>
            </span>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-t border-slate-200 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-brand-gold text-brand-goldDark'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Thông tin cá nhân &amp; Dự án</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-brand-gold text-brand-goldDark'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            <span>Đổi mật khẩu tài khoản</span>
          </button>
        </div>
      </div>

      {/* Thông báo Alert */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border animate-in fade-in duration-150 ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">
            {notice.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-medium text-sm">{notice.message}</span>
        </div>
      )}

      {/* Nội dung theo Tab */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <span className="material-symbols-outlined text-[36px] animate-spin text-brand-gold">
              progress_activity
            </span>
            <span className="text-xs">Đang tải thông tin hồ sơ từ CSDL Backend...</span>
          </div>
        ) : activeTab === 'profile' ? (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên hiển thị trong hệ thống <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                  placeholder="Nhập họ và tên thật..."
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Họ và tên sẽ được đồng bộ lên Header, tài liệu dự án và biên bản nghiệm thu.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email tài khoản (Chỉ đọc)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-500 bg-slate-100 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số điện thoại liên hệ (Chỉ đọc)
                </label>
                <input
                  type="text"
                  disabled
                  value={userDirectory.findUser(user?.id, user?.full_name)?.phone || (user as any)?.phone || '—'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-100 font-mono cursor-not-allowed"
                  title="Số điện thoại bảo mật được đồng bộ trực tiếp từ CSDL Backend"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vai trò hệ thống
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.roleTitle || ''}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-100 cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Đơn vị chủ quản
                </label>
                <input
                  type="text"
                  disabled
                  value="Công ty TNHH Xây dựng Bê tông Hoàng Hải"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 bg-slate-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Trạng thái tài khoản
                </label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-emerald-700 font-bold">
                  <span className={`w-2 h-2 rounded-full ${profile?.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{profile?.status === 'ACTIVE' ? 'Đang hoạt động (Bình thường)' : 'Đã bị khóa / Đình chỉ'}</span>
                </div>
              </div>
            </div>

            {/* Danh sách dự án đang phụ trách thật */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Dự án &amp; Tuyến đường đang phụ trách ({profile?.assignedProjects.length || 0})
              </label>
              {profile?.assignedProjects && profile.assignedProjects.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {profile.assignedProjects.map((proj) => (
                    <span
                      key={proj.id}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px] text-brand-gold">
                        route
                      </span>
                      <span>{proj.name}</span>
                      {proj.code && (
                        <span className="text-[11px] text-amber-700 font-mono">({proj.code})</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-slate-50/50">
                  Tài khoản hiện chưa được phân công quản lý dự án nào trong CSDL.
                </div>
              )}
            </div>

            {/* Nút lưu thay đổi */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{saving ? 'Đang lưu...' : 'Lưu Họ và Tên'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0 mt-0.5">
                info
              </span>
              <div className="leading-relaxed">
                <strong>Quy định đổi mật khẩu (API-004):</strong> Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm cả chữ hoa, chữ thường, số và ký tự đặc biệt.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu hiện tại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                  placeholder="Nhập mật khẩu hiện tại..."
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showCurrentPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                    placeholder="Tối thiểu 8 ký tự..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showNewPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                  placeholder="Nhập lại mật khẩu mới..."
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>{saving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
