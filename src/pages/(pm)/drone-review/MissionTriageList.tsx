import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { AIDetectionItem } from './types'

export interface MissionTriageListProps {
  surveyRange?: string
  detections: AIDetectionItem[]
  selectedDetectionId: string
  onSelectDetection: (item: AIDetectionItem) => void
  onApproveDetection?: (
    id: string,
    reason?: string,
    customTypeCode?: 'POTHOLE' | 'CRACK',
    customSeverityLevel?: string
  ) => void
  onRejectDetection?: (id: string, reason?: string) => void
  onResetDetection?: (id: string) => void
  statusFilter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  setStatusFilter: (f: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') => void
  totalCount: number
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  reviewedCount: number
  reviewProgressPercent: number
  showToast: (msg: string) => void
  isBaselineLocked?: boolean
}

export const MissionTriageList: React.FC<MissionTriageListProps> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
  statusFilter,
  setStatusFilter,
  totalCount,
  approvedCount,
  rejectedCount,
  pendingCount,
  reviewedCount,
  reviewProgressPercent,
  showToast: _showToast,
  surveyRange,
  isBaselineLocked = false
}) => {
  const { user } = useAuthStore()
  const location = useLocation()
  const basePath = user?.role === RoleCode.SUPERVISOR ? '/sup' : '/pm'

  const filteredDetections = detections.filter((d) => {
    if (statusFilter === 'PENDING') return d.status === 'PENDING'
    if (statusFilter === 'APPROVED') return d.status === 'APPROVED'
    if (statusFilter === 'REJECTED') return d.status === 'REJECTED'
    return true
  })

  return (
    <section className="lg:col-span-5 bg-white border border-brand-border rounded-xl shadow-2xs p-4 flex flex-col gap-3 min-w-0">
      {/* Header & Filter Chips */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="auto_awesome" size={18} className="text-brand-gold" />
            <h3 className="font-bold text-sm text-brand-dark">Danh sách phát hiện AI</h3>
          </div>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            {totalCount} mục / {surveyRange || 'Toàn tuyến'}
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#C9A227] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Chờ duyệt ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Hợp lệ ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-slate-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Báo sai ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Detections Card Stack */}
      <div className="flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1">
        {filteredDetections.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            Không có bản ghi phát hiện AI nào trong trạng thái này.
          </div>
        ) : (
          filteredDetections.map((item) => {
            const isSelected = item.id === selectedDetectionId || item.code === selectedDetectionId
            const isApproved = item.status === 'APPROVED'
            const isRejected = item.status === 'REJECTED'
            const isPending = item.status === 'PENDING'
            const viTypeLabel = item.type || 'Vết nứt mặt đường'
            const severityLabel =
              item.severityLevel || (item.confidence >= 85 ? 'Nghiêm trọng' : 'Trung bình')

            return (
              <div
                key={item.id}
                onClick={() => onSelectDetection(item)}
                className={`rounded-xl border transition-all flex flex-col relative cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50/50 border-brand-gold ring-2 ring-brand-gold/50 shadow-xs p-3.5 gap-2.5'
                    : isApproved
                    ? 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/30 p-3 gap-1.5'
                    : isRejected
                    ? 'bg-slate-50/70 border-slate-200 opacity-80 hover:opacity-100 p-3 gap-1.5'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs p-3 gap-1.5'
                }`}
              >
                {/* Left accent color bar */}
                <div
                  style={{
                    backgroundColor:
                      item.decisionKind === 'LINK_EXISTING'
                        ? '#D97706'
                        : isApproved
                        ? '#10B981'
                        : isRejected
                        ? '#94A3B8'
                        : item.confidence >= 90
                        ? '#EF4444'
                        : '#F59E0B'
                  }}
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                ></div>

                {/* TẦNG 1: HEADER THẺ */}
                <div className="flex items-center justify-between gap-2 pl-2">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                      {item.code}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/80">
                      {item.stationing}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {item.lane}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        severityLabel.includes('Khẩn cấp')
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : severityLabel.includes('Nghiêm trọng')
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : severityLabel.includes('Nhẹ')
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      Mức độ: {severityLabel}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 flex items-center gap-1 ${
                      item.decisionKind === 'LINK_EXISTING'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isRejected
                        ? 'bg-slate-200 text-slate-600 border border-slate-300'
                        : item.confidence >= 90
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.decisionKind === 'LINK_EXISTING' ? (
                      <>
                        <Icon name="link" size={12} className="text-amber-700" />
                        <span>
                          Đã gom lỗi cũ {item.defectCode ? `→ ${item.defectCode}` : ''}
                        </span>
                      </>
                    ) : isApproved ? (
                      <>
                        <Icon name="check_circle" size={12} className="text-emerald-700" />
                        <span>
                          Đã duyệt {item.defectCode ? `→ ${item.defectCode}` : ''}
                        </span>
                      </>
                    ) : isRejected ? (
                      <>
                        <Icon name="cancel" size={12} className="text-slate-500" />
                        <span>Báo sai AI</span>
                      </>
                    ) : (
                      <>
                        <Icon
                          name="auto_awesome"
                          size={12}
                          className={item.confidence >= 90 ? 'text-red-600' : 'text-amber-600'}
                        />
                        <span>
                          {viTypeLabel} • {item.confidence}%
                        </span>
                      </>
                    )}
                  </span>
                </div>

                {/* TẦNG 2: MÔ TẢ KỸ THUẬT */}
                <div className="pl-2">
                  <p
                    className={`text-xs font-normal leading-relaxed break-words ${
                      isRejected ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                {/* KHI THẺ ĐƯỢC CHỌN: Hiển thị thông số nhận diện AI từ CSDL & Nút dẫn sang màn Thẩm định chi tiết */}
                {isSelected ? (
                  <>
                    <div className="pl-2 animate-in fade-in duration-200">
                      <div className="p-2.5 bg-white/95 rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-semibold">
                            Thông số nhận diện AI (CSDL):
                          </span>
                          <span className="font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.fixtureVersion || 'Road-YOLOv9'} • Độ tin cậy: {item.confidence}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[11px]">
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                            <span className="text-slate-500">Loại khiếm khuyết:</span>
                            <strong className="text-slate-900">{viTypeLabel}</strong>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                            <span className="text-slate-500">Mức độ ghi nhận:</span>
                            <strong className="text-slate-900">{severityLabel}</strong>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                            <span className="text-slate-500">Tọa độ khung bao:</span>
                            <strong className="font-mono text-slate-900">
                              {item.bbox.left}, {item.bbox.top}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                            <span className="text-slate-500">Kích thước khung:</span>
                            <strong className="font-mono text-slate-900">
                              {item.bbox.width} × {item.bbox.height}
                            </strong>
                          </div>
                        </div>
                        {item.timestampMs != null && (
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Lý trình khảo sát: {item.stationing}</span>
                            <span className="font-mono">Thời điểm trích xuất: {item.timestampMs}ms ({(item.timestampMs / 1000).toFixed(2)}s)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TẦNG 4: TRẠNG THÁI THẨM ĐỊNH HIỆN TẠI & NÚT XEM CHI TIẾT */}
                    <div className="pl-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
                      {isApproved ? (
                        <div className="w-full flex items-center justify-between text-xs font-medium text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                          <span className="flex items-center gap-1.5">
                            <Icon name="check_circle" size={15} className="text-emerald-600" />
                            <span>
                              {item.decisionKind === 'LINK_EXISTING'
                                ? `Đã gom vào hồ sơ cũ ${item.defectCode || ''}`
                                : `Đã xác nhận hợp lệ ${item.defectCode ? `(${item.defectCode})` : ''}`}
                            </span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200">
                            {severityLabel}
                          </span>
                        </div>
                      ) : isRejected ? (
                        <div className="w-full flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="flex items-center gap-1.5">
                            <Icon name="cancel" size={15} className="text-slate-400" />
                            <span>Đã từ chối (Báo sai AI)</span>
                          </span>
                        </div>
                      ) : null}

                      {/* Nút duy nhất dẫn sang màn hình Thẩm định chi tiết (Màn 08 & 09) */}
                      <Link
                        to={`${basePath}/defects/${item.id}/verify-a`}
                        state={{ from: location.pathname }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                          isPending && basePath === '/pm' && !isBaselineLocked
                            ? 'bg-[#C9A227] hover:bg-[#8C6D1F] text-white'
                            : 'bg-amber-50 hover:bg-amber-100 border border-[#C9A227]/50 text-[#8F7212]'
                        }`}
                      >
                        <Icon name="center_focus_strong" size={16} />
                        <span>
                          {basePath === '/sup' || isBaselineLocked
                            ? 'Xem Chi Tiết Khiếm Khuyết & Ảnh Đa Kỳ'
                            : isPending
                            ? 'Xem Chi Tiết & Thẩm Định Lỗi'
                            : 'Xem Chi Tiết & Thay Đổi Thẩm Định'}
                        </span>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="pl-2 pt-1 border-t border-slate-100/70 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500 hover:text-brand-dark">
                      <Icon name="ads_click" size={13} className="text-brand-gold" />
                      <span>Bấm để xem thông số &amp; Thẩm định</span>
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {item.bbox.dims}
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Triage Audit Summary Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
          <span>
            Đã rà soát:{' '}
            <strong className="text-[#8F7212] font-mono">
              {reviewedCount}/{totalCount} mục
            </strong>
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-700">Hợp lệ: {approvedCount}</span>
            <span className="text-slate-300">•</span>
            <span className="text-red-600">Báo sai: {rejectedCount}</span>
            <span className="text-slate-300">•</span>
            <span className="text-sky-700">Chờ duyệt: {pendingCount}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-gold h-full rounded-full transition-all duration-300"
            style={{ width: `${reviewProgressPercent}%` }}
          ></div>
        </div>
      </div>
    </section>
  )
}
