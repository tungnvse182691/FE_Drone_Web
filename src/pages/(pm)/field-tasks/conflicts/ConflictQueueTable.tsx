import React, { useState } from 'react'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'

export interface ConflictQueueTableProps {
  filteredConflicts: SyncConflictItem[]
  selectedConflict: SyncConflictItem
  setSelectedConflictId: (id: string) => void
  onOpenDetail?: (id: string) => void
}

interface ConflictCardProps {
  item: SyncConflictItem
  isSelected: boolean
  onClick: () => void
  onOpenDetail?: (id: string) => void
}

const ConflictCard: React.FC<ConflictCardProps> = ({
  item,
  isSelected,
  onClick,
  onOpenDetail
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const isCritical = item.severity === 'CRITICAL' || item.status === 'RESOLVED_KEEP_SERVER' || item.status === 'RESCUE_REJECTED'
  const isResolvedOk = item.status === 'RESOLVED_ACCEPT_INCOMING' || item.status === 'RESCUE_AUTHORIZED'
  const isRescuePending = item.conflict_type === 'DEVICE_RESCUE_PENDING'
  const isPending = item.status === 'CONFLICT_INTAKE' || item.status === 'RESOLVED_FORK_ATTEMPT'

  const cfg = (() => {
    if (isCritical) {
      return {
        border: '#E6A8A8',
        gradient: 'linear-gradient(90deg, #B91C1C 0%, #7F1D1D 100%)',
        dot: '#B91C1C',
        halo: 'rgba(185, 28, 28, 0.15)',
        bgTint: 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(185, 28, 28, 0.15)'
      }
    }
    if (isResolvedOk) {
      return {
        border: '#A7C4B8',
        gradient: 'linear-gradient(90deg, #047857 0%, #065F46 100%)',
        dot: '#047857',
        halo: 'rgba(4, 120, 87, 0.15)',
        bgTint: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(4, 120, 87, 0.15)'
      }
    }
    if (isRescuePending) {
      return {
        border: '#D8B4FE',
        gradient: 'linear-gradient(90deg, #7E22CE 0%, #581C87 100%)',
        dot: '#7E22CE',
        halo: 'rgba(126, 34, 206, 0.15)',
        bgTint: 'linear-gradient(180deg, #FAF5FF 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(126, 34, 206, 0.15)'
      }
    }
    if (isPending) {
      return {
        border: '#E3D3AC',
        gradient: 'linear-gradient(90deg, #B45309 0%, #92400E 100%)',
        dot: '#B45309',
        halo: 'rgba(180, 83, 9, 0.15)',
        bgTint: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
        hoverShadow: '0 12px 28px rgba(180, 83, 9, 0.15)'
      }
    }
    return {
      border: '#E5D8B4',
      gradient: 'linear-gradient(90deg, #C9A227 0%, #8C6D1F 100%)',
      dot: '#C9A227',
      halo: 'rgba(201, 162, 39, 0.15)',
      bgTint: 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)',
      hoverShadow: '0 12px 28px rgba(201, 162, 39, 0.15)'
    }
  })()

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        border: `1.5px solid ${isSelected ? '#C9A227' : cfg.border}`,
        background: cfg.bgTint,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? cfg.hoverShadow
          : isSelected
          ? '0 0 0 2px rgba(201, 162, 39, 0.35), 0 4px 12px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="rounded-[20px] overflow-hidden cursor-pointer relative"
    >
      {/* 4px top gradient line */}
      <div className="h-1 w-full" style={{ background: cfg.gradient }} />

      <div className="p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Hàng 1: Tiêu đề + Chấm tròn halo + Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Chấm tròn 10px + Halo 4px */}
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

            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
              <span className="font-mono font-bold text-sm text-slate-900">
                {item.conflict_code}
              </span>
              <span className="text-sm font-bold text-slate-800">
                {item.defect_type_label}
              </span>
              <span className="text-xs font-mono text-slate-500">
                • {item.defect_code} • {item.chainage}
              </span>
              {item.severity === 'CRITICAL' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" title="Khẩn cấp" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Loại xung đột */}
            <span
              className={`inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold ${
                item.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : item.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? 'bg-[#F0F9FF] text-[#1E40AF] border border-[#B8C5D9]'
                  : 'bg-[#FFFBEB] text-[#B45309] border border-[#E3D3AC]'
              }`}
            >
              {item.conflict_type === 'DEVICE_RESCUE_PENDING' && (
                <Icon name="phonelink_erase" size={13} />
              )}
              {item.conflict_type === 'ASSIGNMENT_REASSIGNED' && (
                <Icon name="call_split" size={13} />
              )}
              <span>{item.conflict_type_label}</span>
            </span>

            {/* Trạng thái phân giải */}
            <span
              className={`inline-flex items-center px-[14px] py-[5px] rounded-full text-[11px] font-bold ${
                item.status === 'CONFLICT_INTAKE'
                  ? 'bg-[#FFFBEB] text-[#B45309] border border-[#E3D3AC]'
                  : item.status === 'RESCUE_AUTHORIZED'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : item.status === 'RESOLVED_KEEP_SERVER' || item.status === 'RESCUE_REJECTED'
                  ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#E6A8A8]'
                  : item.status === 'RESOLVED_FORK_ATTEMPT'
                  ? 'bg-[#FFFBEB] text-[#B45309] border border-[#E3D3AC]'
                  : 'bg-[#F0FDF7] text-[#047857] border border-[#A7C4B8]'
              }`}
            >
              {item.status_label}
            </span>
          </div>
        </div>

        {/* Hàng 2: Thông tin chi tiết + Nút hành động */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 flex-1">
            {/* Đội ngoại tuyến */}
            <div className="flex items-center gap-2">
              <Icon name="engineering" size={15} className="text-slate-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">{item.offline_actor.name}</span>
                <span className="text-slate-500 ml-1">({item.offline_actor.team})</span>
              </div>
            </div>

            {/* Thời gian bắt lại mạng */}
            <div className="flex items-center gap-2 font-mono">
              <Icon name="schedule" size={15} className="text-[#C9A227] shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">{item.offline_actor.captured_at}</span>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 ml-1.5">
                  Mất: {item.offline_actor.offline_duration}
                </span>
              </div>
            </div>

            {/* Mã băm SHA-256 */}
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
              <Icon name="tag" size={14} className="text-slate-400 shrink-0" />
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                SHA: {item.incoming_data.sha256_hash.substring(0, 10)}...
              </span>
            </div>
          </div>

          {/* Nút hành động xem đối chiếu */}
          <div className="shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
                if (onOpenDetail) {
                  onOpenDetail(item.id)
                }
              }}
              className="px-3.5 py-2 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer bg-white text-slate-800 border-[#E2E5E9] hover:bg-[#1A1D20] hover:text-[#F1E5C6] hover:border-[#1A1D20] shadow-2xs"
              title="Mở tab đối chiếu chi tiết và phân giải"
            >
              <Icon name="compare_arrows" size={15} className="text-[#C9A227]" />
              <span>Xem đối chiếu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ConflictQueueTable: React.FC<ConflictQueueTableProps> = ({
  filteredConflicts,
  selectedConflict,
  setSelectedConflictId,
  onOpenDetail
}) => {
  if (filteredConflicts.length === 0) {
    return (
      <div className="bg-white border border-[#E2E5E9] rounded-[20px] p-12 text-center flex flex-col items-center justify-center space-y-2">
        <Icon name="check_circle" size={36} className="text-emerald-500" />
        <h4 className="text-sm font-bold text-slate-700">Không có ca xung đột dữ liệu nào</h4>
        <p className="text-xs text-slate-400">
          Toàn bộ dữ liệu đo đạc ngoại tuyến đã được đồng bộ chuẩn xác với máy chủ
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {filteredConflicts.map((item) => {
        const isSelected = item.id === selectedConflict?.id
        const handleClick = () => {
          setSelectedConflictId(item.id)
          if (onOpenDetail) {
            onOpenDetail(item.id)
          }
        }

        return (
          <ConflictCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            onClick={handleClick}
            onOpenDetail={onOpenDetail}
          />
        )
      })}
    </div>
  )
}
