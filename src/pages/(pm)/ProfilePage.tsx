import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { profileService, UserProfile, UserSession } from '../../api/services/profileService'

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const isSupervisor = user?.role === RoleCode.SUPERVISOR

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile')
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])

  // Chỉnh sửa hồ sơ
  const [fullName, setFullName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [department, setDepartment] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [certificate, setCertificate] = useState<string>('')
  const [certificateExpiry, setCertificateExpiry] = useState<string>('')
  const [certificateImages, setCertificateImages] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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
    setTimeout(() => setNotice(null), 3500)
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    const userId = user?.id || 'usr-pm-01'

    Promise.all([
      profileService.getProfile(userId),
      profileService.getSessions(userId)
    ])
      .then(([prof, sess]) => {
        if (!isMounted) return
        setProfile(prof)
        setSessions(sess)
        setFullName(prof.full_name)
        setPhone(prof.phone)
        setDepartment(prof.department)
        setAvatarUrl(prof.avatar_url)
        setCertificate(prof.certificate || '')
        setCertificateExpiry(prof.certificate_expiry || '')
        setCertificateImages(prof.certificate_images || [])
      })
      .catch((err) => {
        if (!isMounted) return
        triggerNotice('error', err?.message || 'Không thể tải thông tin hồ sơ.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [user?.id])

  // Tải ảnh chứng chỉ CCHN lên
  const handleUploadCertificateImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (result) {
          setCertificateImages((prev) => [...prev, result])
          triggerNotice('success', `Đã đính kèm ảnh chứng chỉ: ${file.name}`)
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleRemoveCertificateImage = (index: number) => {
    setCertificateImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Lưu thông tin
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    if (!fullName.trim()) {
      triggerNotice('error', 'Họ và tên không được để trống.')
      return
    }

    try {
      setSaving(true)
      const updated = await profileService.updateProfile(profile.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        department: department.trim(),
        avatar_url: avatarUrl.trim() || profile.avatar_url,
        certificate: certificate.trim(),
        certificate_expiry: certificateExpiry.trim(),
        certificate_images: certificateImages
      })
      setProfile(updated)
      updateUser({
        full_name: updated.full_name,
        avatar_url: updated.avatar_url
      })
      triggerNotice('success', 'Đã lưu thay đổi hồ sơ và ảnh chứng chỉ hành nghề thành công.')
    } catch (err: any) {
      triggerNotice('error', err?.message || 'Lỗi khi cập nhật hồ sơ.')
    } finally {
      setSaving(false)
    }
  }

  // Đổi mật khẩu
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
      const res = await profileService.changePassword(profile.id, currentPassword, newPassword)
      triggerNotice('success', res.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      triggerNotice('error', err?.message || 'Lỗi khi đổi mật khẩu.')
    } finally {
      setSaving(false)
    }
  }

  // Đăng xuất phiên
  const handleRevokeSession = async (sessionId: string) => {
    if (!profile) return
    try {
      await profileService.revokeSession(profile.id, sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      triggerNotice('success', 'Đã đăng xuất phiên thiết bị từ xa.')
    } catch (err: any) {
      triggerNotice('error', err?.message || 'Lỗi khi đăng xuất phiên.')
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full pb-16 bg-slate-50/50">
      {/* Toast thông báo */}
      {notice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-800">
          <span
            className={`material-symbols-outlined text-[18px] ${
              notice.type === 'success' ? 'text-brand-gold' : 'text-rose-400'
            }`}
          >
            {notice.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{notice.message}</span>
        </div>
      )}

      {/* Header trang Profile */}
      <div className="flex flex-col gap-3 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">
            Trang chủ
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold">Hồ sơ cá nhân &amp; Bảo mật</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl || user?.avatar_url}
                alt={profile?.full_name || user?.full_name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-brand-gold/40 shadow-xs"
              />
              <span
                className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                title="Đang hoạt động"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 font-headline">
                  {profile?.full_name || user?.full_name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isSupervisor
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}
                >
                  {isSupervisor ? 'Giám sát (SUP)' : 'Chỉ huy trưởng (PM)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {profile?.email || user?.email}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {profile?.company || 'Công ty TNHH Xây dựng Bê tông Hoàng Hải'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 px-4 pt-2 rounded-xl shadow-xs flex items-center gap-2 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-slate-900 font-bold border-b-2 border-brand-gold'
              : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              activeTab === 'profile' ? 'text-brand-gold' : 'text-slate-400'
            }`}
          >
            person
          </span>
          <span>Hồ sơ &amp; Chuyên môn kỹ thuật</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'text-slate-900 font-bold border-b-2 border-brand-gold'
              : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              activeTab === 'security' ? 'text-brand-gold' : 'text-slate-400'
            }`}
          >
            lock
          </span>
          <span>Bảo mật &amp; Mật khẩu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-4 flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'sessions'
              ? 'text-slate-900 font-bold border-b-2 border-brand-gold'
              : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              activeTab === 'sessions' ? 'text-brand-gold' : 'text-slate-400'
            }`}
          >
            devices
          </span>
          <span>Thiết bị &amp; Phiên hoạt động ({sessions.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <span className="material-symbols-outlined text-[36px] animate-spin text-brand-gold">
              progress_activity
            </span>
            <span className="text-xs">Đang tải hồ sơ từ hệ thống...</span>
          </div>
        ) : activeTab === 'profile' ? (
          /* TAB 1: THÔNG TIN HỒ SƠ */
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                  placeholder="Họ và tên..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                  placeholder="Số điện thoại..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email hệ thống (Read-only)
                </label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phòng ban điều hành
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                  placeholder="Phòng ban..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Đường dẫn ảnh đại diện (Avatar URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 font-mono"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() =>
                    setAvatarUrl(
                      isSupervisor
                        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                    )
                  }
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Mặc định
                </button>
              </div>
            </div>

            {/* Khối chứng chỉ chuyên môn */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="material-symbols-outlined text-[18px] text-brand-gold">
                    workspace_premium
                  </span>
                  <span>Chứng chỉ hành nghề &amp; Thẩm quyền kỹ thuật</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Cho phép chỉnh sửa &amp; cập nhật</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tên chứng chỉ &amp; Số hiệu CCHN
                  </label>
                  <input
                    type="text"
                    value={certificate}
                    onChange={(e) => setCertificate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30"
                    placeholder="Ví dụ: Chứng chỉ Chỉ huy trưởng công trình Giao thông Cấp I (Số CCHN-XD-00892)..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hạn hiệu lực chứng chỉ
                    </label>
                    <input
                      type="text"
                      value={certificateExpiry}
                      onChange={(e) => setCertificateExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30 font-mono"
                      placeholder="DD/MM/YYYY (Ví dụ: 15/12/2028)..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tiêu chuẩn áp dụng (Quy chuẩn nhà thầu)
                    </label>
                    <input
                      type="text"
                      disabled
                      value="TCVN 10380:2014 & TCVN 8819:2011"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-500 bg-slate-100 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Ảnh chụp / Scan minh chứng chứng chỉ gốc */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Ảnh chụp / Bản scan CCHN đối soát ({certificateImages.length} ảnh)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Đính kèm ảnh 2 mặt để đối chiếu con dấu, số hiệu CCHN và tránh chứng chỉ giả mạo
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                      <span className="material-symbols-outlined text-[17px] text-brand-gold">
                        add_photo_alternate
                      </span>
                      <span>Tải ảnh CCHN lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUploadCertificateImage}
                      />
                    </label>
                  </div>

                  {certificateImages.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-white">
                      Chưa có ảnh chứng chỉ đính kèm. Vui lòng tải ảnh scan mặt trước / mặt sau để phục vụ thẩm định hồ sơ.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {certificateImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-brand-gold transition-all"
                        >
                          <img
                            src={imgUrl}
                            alt={`Bản scan CCHN #${idx + 1}`}
                            className="w-full h-28 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setPreviewImage(imgUrl)}
                          />
                          <div className="p-2 bg-white flex items-center justify-between text-[11px] text-slate-700 border-t border-slate-100">
                            <span className="font-semibold truncate">Mặt #{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewImage(imgUrl)}
                                className="p-1 text-slate-500 hover:text-brand-dark cursor-pointer rounded"
                                title="Xem phóng to chi tiết"
                              >
                                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCertificateImage(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer rounded"
                                title="Xóa ảnh này"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Các gói thầu đang quản lý */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Dự án &amp; Gói thầu đang phụ trách ({profile?.assigned_projects.length || 0})
              </label>
              <div className="flex flex-wrap gap-2">
                {profile?.assigned_projects.map((proj, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium"
                  >
                    <span className="material-symbols-outlined text-[15px] text-brand-gold">
                      route
                    </span>
                    <span>{proj}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}</span>
              </button>
            </div>
          </form>
        ) : activeTab === 'security' ? (
          /* TAB 2: ĐỔI MẬT KHẨU */
          <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">
                info
              </span>
              <div className="leading-relaxed">
                <strong>Quy định an toàn thông tin Hoàng Hải (BR-02):</strong> Mật khẩu mới bắt buộc tối thiểu 8 ký tự, bao gồm cả chữ hoa, chữ thường và chữ số để bảo đảm an toàn truy cập dữ liệu công trình.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                  placeholder="Nhập mật khẩu hiện tại..."
                  required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                    placeholder="Tối thiểu 8 ký tự..."
                    required
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
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-gold"
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                <span>{saving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* TAB 3: PHIÊN LÀM VIỆC & THIẾT BỊ */
          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Các thiết bị hiện đang duy trì phiên đăng nhập với hệ thống kiểm soát chất lượng RoadGuard. Bạn có thể thu hồi quyền truy cập từ xa cho các thiết bị không sử dụng:
            </p>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    sess.is_current
                      ? 'border-brand-gold/40 bg-amber-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        sess.is_current ? 'bg-brand-gold text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {sess.device_name.toLowerCase().includes('mac') || sess.device_name.toLowerCase().includes('dell')
                          ? 'laptop'
                          : 'tablet'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{sess.device_name}</span>
                        {sess.is_current && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Phiên này
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sess.browser} • {sess.location} • IP: <span className="font-mono">{sess.ip_address}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {sess.last_active}
                      </div>
                    </div>
                  </div>

                  {!sess.is_current && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Đăng xuất thiết bị này"
                    >
                      <span className="material-symbols-outlined text-[15px]">logout</span>
                      <span>Đăng xuất</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox xem ảnh chứng chỉ CCHN phóng to */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-bold">
                <span className="material-symbols-outlined text-[19px] text-brand-gold">
                  verified
                </span>
                <span>Đối soát ảnh chụp gốc Chứng chỉ hành nghề kỹ thuật</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-3 overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-950">
              <img
                src={previewImage}
                alt="Chứng chỉ phóng to"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Độ phân giải cao • Đảm bảo đối chiếu số hiệu, thẩm quyền cấp và con dấu</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
