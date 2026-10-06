import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'

interface ProtectedRouteProps {
  allowedRole?: RoleCode
}

/**
 * Route guard cho các trang nội bộ (/pm/*, /sup/*):
 * 1. Chặn chưa login -> /login
 * 2. user.must_change_password -> /force-change-password
 * 3. role PM vào /sup/* (và ngược lại) -> đá về dashboard đúng vai
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.must_change_password) {
    return <Navigate to="/force-change-password" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    const targetDashboard =
      user.role === RoleCode.SUPERVISOR ? '/sup/dashboard' : '/pm/dashboard'
    return <Navigate to={targetDashboard} replace />
  }

  return <Outlet />
}

/**
 * Guard cho trang Login & Invitation:
 * Nếu đã login:
 * - must_change_password -> /force-change-password
 * - nếu không -> đá về dashboard đúng vai
 */
export const PublicAuthRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()

  if (isAuthenticated && user) {
    if (user.must_change_password) {
      return <Navigate to="/force-change-password" replace />
    }
    const targetDashboard =
      user.role === RoleCode.SUPERVISOR ? '/sup/dashboard' : '/pm/dashboard'
    return <Navigate to={targetDashboard} replace />
  }

  return <Outlet />
}

/**
 * Guard cho trang Đổi mật khẩu lần đầu (/force-change-password):
 * 1. Chưa login -> /login
 * 2. Đã login nhưng không cần đổi mật khẩu -> đá về dashboard đúng vai
 */
export const ForcePasswordRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!user.must_change_password) {
    const targetDashboard =
      user.role === RoleCode.SUPERVISOR ? '/sup/dashboard' : '/pm/dashboard'
    return <Navigate to={targetDashboard} replace />
  }

  return <Outlet />
}
