import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'

export interface ProposalStatsProps {
  stats: {
    draft: number
    submitted: number
    decided: number
    dispatched: number
  }
  activeFilterTab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT'
  onTabChange: (tab: 'ALL' | 'SUBMITTED' | 'DECIDED' | 'DISPATCHED' | 'DRAFT') => void
}

interface KpiCardProps {
  title: string
  count: number
  badgeLabel: string
  subText: string
  icon: string
  isActive: boolean
  onClick: () => void
  cfg: {
    border: string
    activeBorder: string
    gradient: string
    dot: string
    halo: string
    bgTint: string
    hoverShadow: string
    badgeBg: string
    badgeText: string
    badgeBorder: string
    iconBg: string
    iconColor: string
    numColor: string
  }
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  count,
  badgeLabel,
  subText,
  icon,
  isActive,
  onClick,
  cfg
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `1.5px solid ${isActive ? cfg.activeBorder : cfg.border}`,
        background: cfg.bgTint,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? cfg.hoverShadow
          : isActive
          ? `0 0 0 2px ${cfg.halo}, 0 4px 12px rgba(0,0,0,0.04)`
          : '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="rounded-[20px] overflow-hidden cursor-pointer flex flex-col justify-between relative"
    >
      {/* 4px top gradient line */}
      <div className="h-1 w-full" style={{ background: cfg.gradient }} />

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              {/* Dot 10px + Halo 4px */}
              <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cfg.dot }}
                />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: cfg.halo }}
                />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-600 truncate">
                {title}
              </span>
            </div>

            <div className="pt-1">
              <span
                className="text-3xl font-bold font-sansation tracking-tight"
                style={{ color: cfg.numColor }}
              >
                {count.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
            style={{ backgroundColor: cfg.iconBg, color: cfg.iconColor }}
          >
            <Icon name={icon} size={20} />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          <span className="text-slate-400 text-[11px] truncate">{subText}</span>
          <span
            className="px-[14px] py-[5px] rounded-full text-[11px] font-bold shrink-0 border"
            style={{
              backgroundColor: cfg.badgeBg,
              color: cfg.badgeText,
              borderColor: cfg.badgeBorder
            }}
          >
            {badgeLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

export const ProposalStats: React.FC<ProposalStatsProps> = ({
  stats,
  activeFilterTab,
  onTabChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 font-body">
      {/* Stat 1: Draft */}
      <KpiCard
        title="Gói đang soạn thảo"
        count={stats.draft}
        badgeLabel="Bản nháp"
        subText="Chưa khóa trình duyệt"
        icon="edit"
        isActive={activeFilterTab === 'DRAFT'}
        onClick={() => onTabChange(activeFilterTab === 'DRAFT' ? 'ALL' : 'DRAFT')}
        cfg={{
          border: '#E5D8B4',
          activeBorder: '#C9A227',
          gradient: 'linear-gradient(90deg, #C9A227 0%, #8C6D1F 100%)',
          dot: '#C9A227',
          halo: 'rgba(201, 162, 39, 0.2)',
          bgTint: 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)',
          hoverShadow: '0 12px 28px rgba(201, 162, 39, 0.15)',
          badgeBg: '#FFFDF5',
          badgeText: '#8C6D1F',
          badgeBorder: '#E5D8B4',
          iconBg: '#FFFDF5',
          iconColor: '#C9A227',
          numColor: '#1A1D20'
        }}
      />

      {/* Stat 2: Submitted */}
      <KpiCard
        title="Gói chờ duyệt"
        count={stats.submitted}
        badgeLabel="Đã gửi"
        subText="Giám sát thẩm định"
        icon="schedule"
        isActive={activeFilterTab === 'SUBMITTED'}
        onClick={() => onTabChange(activeFilterTab === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')}
        cfg={{
          border: '#E3D3AC',
          activeBorder: '#B45309',
          gradient: 'linear-gradient(90deg, #B45309 0%, #92400E 100%)',
          dot: '#B45309',
          halo: 'rgba(180, 83, 9, 0.2)',
          bgTint: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
          hoverShadow: '0 12px 28px rgba(180, 83, 9, 0.15)',
          badgeBg: '#FFFBEB',
          badgeText: '#B45309',
          badgeBorder: '#E3D3AC',
          iconBg: '#FFFBEB',
          iconColor: '#B45309',
          numColor: '#B45309'
        }}
      />

      {/* Stat 3: Decided */}
      <KpiCard
        title="Gói đã phê duyệt"
        count={stats.decided}
        badgeLabel="Đã duyệt"
        subText="Đã phê duyệt phương án"
        icon="check_circle"
        isActive={activeFilterTab === 'DECIDED'}
        onClick={() => onTabChange(activeFilterTab === 'DECIDED' ? 'ALL' : 'DECIDED')}
        cfg={{
          border: '#A7C4B8',
          activeBorder: '#047857',
          gradient: 'linear-gradient(90deg, #047857 0%, #065F46 100%)',
          dot: '#047857',
          halo: 'rgba(4, 120, 87, 0.2)',
          bgTint: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
          hoverShadow: '0 12px 28px rgba(4, 120, 87, 0.15)',
          badgeBg: '#F0FDF7',
          badgeText: '#047857',
          badgeBorder: '#A7C4B8',
          iconBg: '#F0FDF7',
          iconColor: '#047857',
          numColor: '#047857'
        }}
      />

      {/* Stat 4: Dispatched */}
      <KpiCard
        title="Gói đã giao việc"
        count={stats.dispatched}
        badgeLabel="Đã giao việc"
        subText="Đã phân công tổ thi công"
        icon="local_shipping"
        isActive={activeFilterTab === 'DISPATCHED'}
        onClick={() => onTabChange(activeFilterTab === 'DISPATCHED' ? 'ALL' : 'DISPATCHED')}
        cfg={{
          border: '#B8C5D9',
          activeBorder: '#1E40AF',
          gradient: 'linear-gradient(90deg, #1E40AF 0%, #3B5BA9 100%)',
          dot: '#1E40AF',
          halo: 'rgba(30, 64, 175, 0.2)',
          bgTint: 'linear-gradient(180deg, #F0F9FF 0%, #ffffff 45%)',
          hoverShadow: '0 12px 28px rgba(30, 64, 175, 0.15)',
          badgeBg: '#F0F9FF',
          badgeText: '#1E40AF',
          badgeBorder: '#B8C5D9',
          iconBg: '#F0F9FF',
          iconColor: '#1E40AF',
          numColor: '#1E40AF'
        }}
      />
    </div>
  )
}

export default ProposalStats
