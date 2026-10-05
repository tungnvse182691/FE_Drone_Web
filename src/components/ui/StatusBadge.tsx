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

      // RepairBatchStatus & Approval
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300'
      case 'PENDING_APPROVAL':
      case 'PENDING':
      case 'SUBMITTED':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'APPROVED':
      case 'DECIDED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium'
      case 'REVISION_REQUIRED':
      case 'REVISION_REQUIRED_WORK':
      case 'REQUEST_RECONSIDER':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'REQUEST_EVIDENCE':
        return 'bg-sky-50 text-sky-800 border-sky-300'
      case 'ASSIGNED':
      case 'IN_PROGRESS':
      case 'DISPATCHED':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300'
      case 'PENDING_INSPECTION':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300'

      // Survey Status
      case 'PLANNED':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'IN_FLIGHT':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'UPLOADED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'PROCESSING':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'

      // User Accounts
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'SUSPENDED':
        return 'bg-slate-100 text-slate-700 border-slate-300 line-through'
      case 'INVITED':
        return 'bg-amber-50 text-amber-800 border-amber-300'

      // Tracks
      case 'APPROVAL_TRACK':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'FAST_TRACK':
        return 'bg-sky-50 text-sky-800 border-sky-200'
      case 'DIRECT_DISPATCH':
        return 'bg-rose-50 text-rose-800 border-rose-200'

      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  const getReadableLabel = (val: string) => {
    if (label) return label
    switch (val) {
      // Defect Status
      case 'OPEN': return 'Mới phát hiện'
      case 'VERIFIED': return 'Đã thẩm định'
      case 'REJECTED': return 'Từ chối'
      case 'RESOLVED': return 'Đã xử lý'

      // Severity
      case 'CRITICAL': return 'Đặc biệt khẩn cấp'
      case 'HIGH': return 'Nghiêm trọng'
      case 'MEDIUM': return 'Trung bình'
      case 'LOW': return 'Nhẹ'

      // Defect Types
      case 'POTHOLE': return 'Ổ gà'
      case 'LONGITUDINAL_CRACK': return 'Nứt dọc'
      case 'TRANSVERSE_CRACK': return 'Nứt ngang'
      case 'ALLIGATOR_CRACK': return 'Nứt rạn da cá sấu'
      case 'RUTTING': return 'Lún vệt bánh xe'
      case 'RAVELING': return 'Bong bật cốt liệu'

      // RepairBatchStatus
      case 'DRAFT': return 'Bản nháp'
      case 'PENDING_APPROVAL':
      case 'PENDING':
      case 'SUBMITTED':
        return 'Chờ phê duyệt'
      case 'APPROVED':
      case 'DECIDED':
        return 'Đã phê duyệt'
      case 'REVISION_REQUIRED': return 'Yêu cầu sửa đổi'
      case 'REVISION_REQUIRED_WORK': return 'Yêu cầu làm lại'
      case 'REQUEST_EVIDENCE': return 'Yêu cầu bổ sung minh chứng'
      case 'REQUEST_RECONSIDER': return 'Xem xét lại phương án'
      case 'ASSIGNED': return 'Đã giao việc'
      case 'IN_PROGRESS':
      case 'DISPATCHED':
        return 'Đang thi công'
      case 'PENDING_INSPECTION': return 'Chờ nghiệm thu'
      case 'COMPLETED': return 'Đã hoàn thành'
      case 'PASSED': return 'Nghiệm thu đạt'

      // Survey Status
      case 'PLANNED': return 'Lên kế hoạch'
      case 'IN_FLIGHT': return 'Đang bay'
      case 'UPLOADED': return 'Đã tải ảnh lên'
      case 'PROCESSING': return 'Đang xử lý AI'

      // User Accounts
      case 'ACTIVE': return 'Đang hoạt động'
      case 'SUSPENDED': return 'Đã tạm khóa'
      case 'INVITED': return 'Chờ kích hoạt'

      // Tracks
      case 'APPROVAL_TRACK': return 'Quy trình phê duyệt tiêu chuẩn'
      case 'FAST_TRACK': return 'Xử lý cấp bách'
      case 'DIRECT_DISPATCH': return 'Điều phối trực tiếp'

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
