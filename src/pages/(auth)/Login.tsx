import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { ShieldCheck, UserCheck } from 'lucide-react'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [username, setUsername] = useState('hoang_pm')
  const [password, setPassword] = useState('••••••••')
  const [selectedRole, setSelectedRole] = useState<RoleCode>(RoleCode.PROJECT_MANAGER)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(selectedRole)
    if (selectedRole === RoleCode.PROJECT_MANAGER) {
      navigate('/pm/dashboard')
    } else {
      navigate('/sup/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-brand-border p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-brand-gold/10 rounded-xl text-brand-gold mb-2">
            <span className="font-headline font-black text-2xl tracking-wider text-brand-gold">CÁT TƯỜNG</span>
          </div>
          <h1 className="text-xl font-bold text-brand-dark tracking-tight">Hệ Thống Quản Lý Đường Bộ RoadGuard</h1>
          <p className="text-xs text-slate-500">Đăng nhập tài khoản cán bộ quản lý & giám sát</p>
        </div>

        {/* Role Quick Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Chọn Vai Trò Đăng Nhập
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole(RoleCode.PROJECT_MANAGER)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
                selectedRole === RoleCode.PROJECT_MANAGER
                  ? 'border-brand-gold bg-amber-50/50 text-brand-goldDark ring-2 ring-brand-gold/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-5 h-5 text-brand-gold" />
              <span>Project Manager</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole(RoleCode.SUPERVISOR)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
                selectedRole === RoleCode.SUPERVISOR
                  ? 'border-brand-navy bg-slate-50 text-brand-navy ring-2 ring-brand-navy/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-brand-navy" />
              <span>Giám Sát / Chủ Đầu Tư</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Tên Đăng Nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập..."
            required
          />
          <InputField
            label="Mật Khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full mt-2" size="lg">
            Đăng Nhập Hệ Thống
          </Button>
        </form>

        <div className="text-center pt-2">
          <span className="text-xs text-slate-400">© 2026 Nhà thầu Cát Tường. RoadGuard v2.2</span>
        </div>
      </div>
    </div>
  )
}
