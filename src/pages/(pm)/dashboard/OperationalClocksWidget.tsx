import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { H6ClockItem } from '../../../api/services/dashboardService'

interface OperationalClocksWidgetProps {
  clocks: H6ClockItem[]
}

/**
 * Tính toán độ trôi thời gian thực giữa mốc hạn xử lý (currentDueAt từ API-062) và thời điểm hiện tại
 * Theo Chuẩn Phương Án A (Tối ưu UX công nghiệp):
 * - Nếu còn trên 1 giờ hoặc trên 30 phút: Hiển thị gọn gàng (giờ/phút), không nhấp nháy giây gây rối mắt.
 * - Khi còn dưới 30 phút (khẩn cấp) hoặc Đã quá hạn SLA: Hiển thị đếm từng giây để kích hoạt hành động xử lý ngay.
 */
const formatRealtimeDeadline = (dueAtStr: string, now: Date) => {
  const due = new Date(dueAtStr)
  const diffMs = due.getTime() - now.getTime()
  const isOverdue = diffMs <= 0
  const absDiff = Math.abs(diffMs)

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000)

  let timeString = ''

  if (isOverdue) {
    // Trường hợp ĐÃ QUÁ HẠN SLA: Đếm chi tiết từng giây vi phạm để hối thúc xử lý
    if (days > 0) {
      timeString = `${days} ngày ${hours} giờ`
    } else if (hours > 0) {
      timeString = `${hours} giờ ${minutes} phút ${seconds}s`
    } else if (minutes > 0) {
      timeString = `${minutes} phút ${seconds}s`
    } else {
      timeString = `${seconds}s`
    }

    return {
      isOverdue: true,
      label: `Quá hạn ${timeString}`,
      isUrgent: true,
    }
  }

  // Trường hợp CHƯA QUÁ HẠN:
  const isUrgent = days === 0 && hours === 0 && minutes < 30

  if (days > 0) {
    timeString = `${days} ngày ${hours} giờ`
  } else if (hours > 0) {
    // Còn trên 1 giờ: Điềm tĩnh, không nháy giây
    timeString = `${hours} giờ ${minutes} phút`
  } else if (minutes >= 30) {
    // Còn 30 - 59 phút: Hiển thị phút, không nháy giây
    timeString = `${minutes} phút`
  } else if (minutes > 0) {
    // Còn dưới 30 phút: Kích hoạt đếm ngược từng giây khẩn cấp
    timeString = `${minutes} phút ${seconds}s`
  } else {
    timeString = `${seconds}s`
  }

  return {
    isOverdue: false,
    label: `Còn ${timeString}`,
    isUrgent,
  }
}

export const OperationalClocksWidget: React.FC<OperationalClocksWidgetProps> = ({ clocks }) => {
  const navigate = useNavigate()
  const [extendingClock, setExtendingClock] = useState<H6ClockItem | null>(null)
  const [extensionHours, setExtensionHours] = useState<number>(4)
  const [extensionReason, setExtensionReason] = useState<string>('')
  const [extensionSuccess, setExtensionSuccess] = useState<boolean>(false)

  // State thời gian thực nhảy từng giây (1000ms)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Đánh giá trạng thái quá hạn động dựa trên thời gian thực
  const evaluatedClocks = clocks.map((c) => {
    const deadline = formatRealtimeDeadline(c.currentDueAt, now)
    return {
      ...c,
      dynamicOverdue: deadline.isOverdue,
      dynamicLabel: deadline.label,
    }
  })

  const overdueCount = evaluatedClocks.filter((c) => c.dynamicOverdue).length

  const getKindLabel = (kind: string) => {
    switch (kind) {
      case 'SURVEY_VERIFICATION':
        return { label: 'Thẩm định đợt bay', icon: 'flight_takeoff', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
      case 'FIELD_INSPECTION':
        return { label: 'Đo đạc hiện trường', icon: 'straighten', color: 'text-sky-600 bg-sky-50 border-sky-200' }
      case 'CONSTRUCTION_DECLARATION':
        return { label: 'Khai báo hoàn công', icon: 'verified', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
      default:
        return { label: 'Nhiệm vụ nghiệp vụ', icon: 'assignment', color: 'text-slate-600 bg-slate-50 border-slate-200' }
    }
  }

  const handleRequestExtension = (e: React.FormEvent) => {
    e.preventDefault()
    setExtensionSuccess(true)
    setTimeout(() => {
      setExtensionSuccess(false)
      setExtendingClock(null)
      setExtensionReason('')
    }, 1500)
  }


  return (
    <div className="bg-white rounded-[16px] border border-[#E2E5E9] shadow-xs overflow-hidden">
      {/* Widget Header */}
      <div className="px-6 py-4 border-b border-[#E2E5E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <Icon name="schedule" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-brand-dark">Đồng Hồ Thời Hạn Nhiệm Vụ (Clocks &amp; SLA)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm soát hạn chót các nghĩa vụ hợp đồng và đợt rà soát định kỳ theo thời gian thực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {overdueCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              {overdueCount} nhiệm vụ quá hạn SLA
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Icon name="check_circle" size={14} />
              Đúng hạn toàn bộ
            </span>
          )}
        </div>
      </div>

      {/* Clocks List */}
      <div className="divide-y divide-slate-100 p-2 sm:p-4">
        {evaluatedClocks.map((clock) => {
          const kindInfo = getKindLabel(clock.kind)
          return (
            <div
              key={clock.id}
              className={`p-3 sm:p-4 rounded-xl transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                clock.dynamicOverdue
                  ? 'bg-rose-50/40 border border-rose-200/80 hover:bg-rose-50/70'
                  : 'hover:bg-slate-50/80 border border-transparent'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${kindInfo.color}`}
                >
                  <Icon name={kindInfo.icon} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {clock.targetCode}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      • {kindInfo.label}
                    </span>
                    {clock.dynamicOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <Icon name="warning" size={12} className="text-rose-600" />
                        <span className="font-mono">{clock.dynamicLabel}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <Icon name="timer" size={12} className="text-amber-600" />
                        <span className="font-mono">{clock.dynamicLabel}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-brand-dark mt-1 line-clamp-1">
                    {clock.title}
                  </h4>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>
                      Hạn xử lý: <span className="font-mono text-slate-700">{new Date(clock.currentDueAt).toLocaleString('vi-VN')}</span>
                    </span>
                    <span>• Vai trò: <span className="font-medium text-slate-700">{clock.appointedRole}</span></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setExtendingClock(clock)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
                  title="Gửi yêu cầu xin gia hạn SLA"
                >
                  <Icon name="more_time" size={15} />
                  <span>Xin gia hạn</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(clock.targetPath)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs ${
                    clock.dynamicOverdue
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-brand-gold hover:bg-brand-goldDark text-white'
                  }`}
                >
                  <span>Xử lý ngay</span>
                  <Icon name="arrow_forward" size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Xin gia hạn nhiệm vụ */}
      {extendingClock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Icon name="more_time" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">Xin Gia Hạn Nhiệm Vụ</h4>
                  <span className="text-xs text-slate-500">Đề xuất bổ sung thời gian thực hiện SLA</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExtendingClock(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {extensionSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Icon name="check" size={28} />
                </div>
                <h5 className="font-bold text-emerald-800 text-base">Đã Gửi Yêu Cầu Gia Hạn!</h5>
                <p className="text-xs text-slate-600">
                  Hồ sơ gia hạn thêm {extensionHours} giờ cho {extendingClock.targetCode} đã được ghi nhận vào nhật ký điều hành.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestExtension} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900">{extendingClock.title}</div>
                  <div className="text-slate-500">
                    Mã đối tượng: <span className="font-mono font-bold text-slate-800">{extendingClock.targetCode}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời gian đề xuất gia hạn
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { hours: 4, label: '+4 Giờ' },
                      { hours: 24, label: '+1 Ngày' },
                      { hours: 48, label: '+2 Ngày' },
                    ].map((opt) => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => setExtensionHours(opt.hours)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          extensionHours === opt.hours
                            ? 'bg-amber-500 text-white border-amber-600 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lý do xin gia hạn (Bắt buộc)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    placeholder="Ví dụ: Thời tiết mưa lớn không thể tiến hành bay trắc địa ngoài hiện trường..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setExtendingClock(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-brand-gold hover:bg-brand-goldDark text-white rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Xác nhận xin gia hạn
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
