import React from 'react'

export interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      // Defect Status
      case 'OPEN':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'VERIFIED':
        return 'bg-amber-50 text-amber-700 border-amber-300'
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'RESOLVED':
      case 'COMPLETED':
      case 'PASSED':
        return 'bg-green-50 text-green-700 border-green-200'

      // Severity
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300 font-semibold'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200'

      // RepairBatchStatus
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
      case 'REVISION_REQUIRED':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'

      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  const getReadableLabel = (val: string) => {
    if (label) return label
    switch (val) {
      case 'OPEN': return 'Mới phát hiện'
      case 'VERIFIED': return 'Đã thẩm định'
      case 'REJECTED': return 'Từ chối (Báo giả)'
      case 'RESOLVED': return 'Đã sửa chữa'
      case 'CRITICAL': return 'Đặc biệt khẩn cấp'
      case 'HIGH': return 'Nghiêm trọng'
      case 'MEDIUM': return 'Trung bình'
      case 'LOW': return 'Nhẹ'
      case 'PENDING_APPROVAL': return 'Chờ phê duyệt'
      case 'APPROVED': return 'Đã phê duyệt'
      case 'REVISION_REQUIRED': return 'Yêu cầu sửa đổi'
      case 'IN_PROGRESS': return 'Đang thi công'
      case 'COMPLETED': return 'Hoàn thành'
      default: return val
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      {getReadableLabel(status)}
    </span>
  )
}
