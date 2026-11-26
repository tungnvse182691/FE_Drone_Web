import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'

export const PMLayout: React.FC = () => {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-brand-surfaceAlt flex flex-col">
      <Header />
      <div className="flex flex-1 min-w-0">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-6 xl:p-8 max-w-7xl mx-auto w-full">
          <div key={pathname} className="rg-page-enter"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}
