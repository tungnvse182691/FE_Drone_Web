import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { KeyRound } from 'lucide-react'

export const ForceChangePassword: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập đổi mật khẩu thành công
    if (user) user.must_change_password = false
    if (user?.role === RoleCode.PROJECT_MANAGER) {
      navigate('/pm/dashboard')
    } else {
      navigate('/sup/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-brand-border p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-amber-50 rounded-xl text-brand-gold mb-2">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-brand-dark">Đổi Mật Khẩu Lần Đầu</h1>
          <p className="text-xs text-slate-500">
            Đây là lần đầu đăng nhập hoặc tài khoản được cấp lại mật khẩu. Vui lòng thiết lập mật khẩu mới an toàn.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <InputField
            label="Mật Khẩu Mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự..."
            required
          />
          <InputField
            label="Xác Nhận Mật Khẩu Mới"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu..."
            required
          />
          <Button type="submit" className="w-full mt-2" size="lg">
            Cập Nhật & Vào Hệ Thống
          </Button>
        </form>
      </div>
    </div>
  )
}
