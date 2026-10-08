import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { AIDetectionItem } from './types'

export interface MissionTriageListProps {
  detections: AIDetectionItem[]
  selectedDetectionId: string
  onSelectDetection: (item: AIDetectionItem) => void
  onApproveDetection: (id: string, reason?: string) => void
  onRejectDetection: (id: string, reason?: string) => void
  kmFilter: 'ALL' | 'KM_1024_1026' | 'KM_1026_1028' | 'KM_1028_1030'
  setKmFilter: (f: 'ALL' | 'KM_1024_1026' | 'KM_1026_1028' | 'KM_1028_1030') => void
  totalCount: number
  approvedCount: number
  rejectedCount: number
  pendingCount: number
  reviewedCount: number
  reviewProgressPercent: number
  showToast: (msg: string) => void
}

export const MissionTriageList: React.FC<MissionTriageListProps> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
  onApproveDetection,
  onRejectDetection,
  kmFilter,
  setKmFilter,
  totalCount,
  approvedCount,
  rejectedCount,
  pendingCount,
  reviewedCount,
  reviewProgressPercent,
  showToast: _showToast
}) => {
  const filteredDetections = detections.filter((d) => {
    if (kmFilter === 'ALL') return true
    if (kmFilter === 'KM_1024_1026') return d.kmValue >= 1024 && d.kmValue < 1026
    if (kmFilter === 'KM_1026_1028') return d.kmValue >= 1026 && d.kmValue < 1028
    if (kmFilter === 'KM_1028_1030') return d.kmValue >= 1028 && d.kmValue <= 1030
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
            {totalCount} mục / Km 1024 - 1030
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setKmFilter('ALL')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              kmFilter === 'ALL'
                ? 'bg-brand-gold text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setKmFilter('KM_1024_1026')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              kmFilter === 'KM_1024_1026'
                ? 'bg-brand-gold text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Km 1024 - 1026 (3)
          </button>
          <button
            type="button"
            onClick={() => setKmFilter('KM_1026_1028')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              kmFilter === 'KM_1026_1028'
                ? 'bg-brand-gold text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Km 1026 - 1028 (3)
          </button>
          <button
            type="button"
            onClick={() => setKmFilter('KM_1028_1030')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              kmFilter === 'KM_1028_1030'
                ? 'bg-brand-gold text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Km 1028 - 1030 (2)
          </button>
        </div>
      </div>

      {/* Detections Card Stack - Hiển thị đầy đủ, không bị khuất chữ */}
      <div className="flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1">
        {filteredDetections.map((item) => {
          const isSelected = item.id === selectedDetectionId
          const isApproved = item.status === 'APPROVED'
          const isRejected = item.status === 'REJECTED'
          const isPending = item.status === 'PENDING'

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
                  backgroundColor: isApproved
                    ? '#10B981'
                    : isRejected
                    ? '#94A3B8'
                    : item.confidence >= 90
                    ? '#EF4444'
                    : '#F59E0B'
                }}
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
              ></div>

              {/* TẦNG 1: HEADER THẺ (Định danh + Cấp độ phát hiện) */}
              <div className="flex items-center justify-between gap-2 pl-2">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                    {item.code}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200/80">
                    {item.stationing}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    {item.lane}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8F7212] bg-[#FDF8E8] px-2 py-0.5 rounded border border-[#EAD598]">
                      <Icon name="videocam" size={12} className="text-[#C9A227]" />
                      Đang trích xuất
                    </span>
                  )}
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 flex items-center gap-1 ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isRejected
                      ? 'bg-slate-200 text-slate-600 border border-slate-300'
                      : item.confidence >= 90
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isApproved ? (
                    <>
                      <Icon name="check_circle" size={12} className="text-emerald-700" />
                      <span>ĐÃ DUYỆT → {item.defectCode}</span>
                    </>
                  ) : isRejected ? (
                    <>
                      <Icon name="cancel" size={12} className="text-slate-500" />
                      <span>BỎ QUA</span>
                    </>
                  ) : (
                    <>
                      <Icon name="auto_awesome" size={12} className={item.confidence >= 90 ? 'text-red-600' : 'text-amber-600'} />
                      <span>{item.type} • {item.confidence}%</span>
                    </>
                  )}
                </span>
              </div>

              {/* TẦNG 2: MÔ TẢ KỸ THUẬT (Hiển thị đầy đủ, không bị cắt nửa chữ) */}
              <div className="pl-2">
                <p
                  className={`text-xs font-normal leading-relaxed break-words ${
                    isRejected ? 'text-slate-400 line-through' : 'text-slate-800'
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* KHI THẺ ĐƯỢC CHỌN (EXPANDED): Hiện thông số & nút sang màn hình thẩm định chi tiết */}
              {isSelected ? (
                <>
                  {/* TẦNG 3: THÔNG SỐ ĐO ĐẠC HÌNH HỌC TỰ ĐỘNG CỦA AI */}
                  <div className="pl-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-1.5 p-2 bg-white/90 rounded-lg border border-amber-200/70 text-[11px] text-slate-600 shadow-2xs">
                      {item.metrics.area && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Diện tích (ước lượng 2D):</span>
                          <strong className="font-mono text-slate-900 font-semibold">{item.metrics.area}</strong>
                        </div>
                      )}
                      {item.metrics.depth && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Độ sâu (chờ đo):</span>
                          <strong className="font-mono text-amber-700 font-semibold">{item.metrics.depth}</strong>
                        </div>
                      )}
                      {item.metrics.length && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Chiều dài ước lượng:</span>
                          <strong className="font-mono text-slate-900 font-semibold">{item.metrics.length}</strong>
                        </div>
                      )}
                      {item.metrics.crackWidth && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Độ hở khe (chờ đo):</span>
                          <strong className="font-mono text-amber-700 font-semibold">{item.metrics.crackWidth}</strong>
                        </div>
                      )}
                      {item.metrics.reviewer && (
                        <div className="col-span-2 flex items-center justify-between text-emerald-800 pt-1 border-t border-slate-200/60 font-medium">
                          <span>Người duyệt thẩm định:</span>
                          <span className="font-semibold">{item.metrics.reviewer}</span>
                        </div>
                      )}
                      {item.metrics.dismissReason && (
                        <div className="col-span-2 text-slate-500 italic pt-1 border-t border-slate-200/60">
                          Lý do loại bỏ: {item.metrics.dismissReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TẦNG 4: HÀNG NÚT BẤM HÀNH ĐỘNG - CHUYỂN HƯỚNG SANG MÀN HÌNH THẨM ĐỊNH CHI TIẾT */}
                  <div className="pl-2 pt-2 border-t border-amber-200/60 flex items-center gap-2">
                    {isPending ? (
                      <Link
                        to={`/pm/defects/${item.id.toLowerCase()}/verify-a`}
                        state={{ from: window.location.pathname }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                        title="Mở màn hình Thẩm định chi tiết Bounding box & Đa kỳ để duyệt hoặc xử lý chuyên sâu"
                      >
                        <Icon name="layers" size={16} className="text-white" />
                        <span>Thẩm định chi tiết (Bounding Box & Đa kỳ)</span>
                        <Icon name="arrow_forward" size={14} className="text-white/80" />
                      </Link>
                    ) : isApproved ? (
                      <div className="w-full flex items-center justify-between text-xs font-medium text-emerald-800">
                        <span className="flex items-center gap-1">
                          <Icon name="check_circle" size={14} className="text-emerald-600" />
                          Đã ghi nhận vào hồ sơ khiếm khuyết
                        </span>
                        <Link
                          to={`/pm/defects/${item.id.toLowerCase()}/verify-a`}
                          state={{ from: window.location.pathname }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-0.5"
                        >
                          <span>Xem chi tiết hồ sơ</span>
                          <Icon name="chevron_right" size={14} />
                        </Link>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-slate-500 italic">
                        <span className="flex items-center gap-1">
                          <Icon name="cancel" size={14} className="text-slate-400 not-italic" />
                          Đã loại bỏ (Báo giả AI)
                        </span>
                        <Link
                          to={`/pm/defects/${item.id.toLowerCase()}/verify-a`}
                          state={{ from: window.location.pathname }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-slate-600 hover:underline flex items-center gap-0.5 not-italic"
                        >
                          <span>Xem lại</span>
                          <Icon name="chevron_right" size={14} />
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* KHI CHƯA CHỌN: Hiển thị hint nhỏ gọn để khuyến khích bấm xem trích xuất */
                <div className="pl-2 pt-1 border-t border-slate-100/70 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500 hover:text-brand-dark">
                    <Icon name="ads_click" size={13} className="text-brand-gold" />
                    <span>Bấm để trích xuất ảnh & Bounding Box</span>
                  </span>
                  {item.metrics.area && (
                    <span className="font-mono text-slate-500">{item.metrics.area}</span>
                  )}
                  {item.metrics.length && (
                    <span className="font-mono text-slate-500">{item.metrics.length}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Triage Audit Summary Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
          <span>
            Đã rà soát: <strong className="text-[#8F7212] font-mono">{reviewedCount}/{totalCount} mục</strong>
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

