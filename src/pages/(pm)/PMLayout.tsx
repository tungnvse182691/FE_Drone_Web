import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'

export const PMLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.must_change_password) {
    return <Navigate to="/force-change-password" replace />
  }

  // Nếu người dùng không phải PM (ví dụ là Giám sát), chuyển hướng sang /sup/dashboard
  if (user?.role !== RoleCode.PROJECT_MANAGER) {
    return <Navigate to="/sup/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-brand-surfaceAlt flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
