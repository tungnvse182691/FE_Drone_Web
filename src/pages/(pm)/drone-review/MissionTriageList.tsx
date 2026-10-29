import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { useAuthStore } from '../../../store/authStore'
import { RoleCode } from '../../../types/enums'
import { AIDetectionItem } from './types'

export interface MissionTriageListProps {
  surveyRange?: string
  detections: AIDetectionItem[]
  selectedDetectionId: string
  onSelectDetection: (item: AIDetectionItem) => void
  onApproveDetection: (id: string, reason?: string) => void
  onRejectDetection: (id: string, reason?: string) => void
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
  onApproveDetection,
  onRejectDetection,
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
  const basePath = user?.role === RoleCode.SUPERVISOR ? '/sup' : '/pm'
  const isReadOnly = isBaselineLocked || basePath === '/sup'

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
            {totalCount} mục / {surveyRange || "Toàn tuyến"}
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

      {/* Detections Card Stack - Hiển thị đầy đủ, không bị khuất chữ */}
      <div className="flex flex-col gap-2.5 max-h-[640px] overflow-y-auto pr-1">
        {filteredDetections.map((item) => {
          const isSelected = item.id === selectedDetectionId || item.code === selectedDetectionId
          const isRecurrent = item.isRecurrent === true
          const isApproved = item.status === 'APPROVED' && !isRecurrent
          const isRejected = item.status === 'REJECTED'
          const isPending = item.status === 'PENDING'

          return (
            <div
              key={item.id}
              onClick={() => onSelectDetection(item)}
              className={`rounded-xl border transition-all flex flex-col relative cursor-pointer ${
                isSelected
                  ? 'bg-amber-50/50 border-brand-gold ring-2 ring-brand-gold/50 shadow-xs p-3.5 gap-2.5'
                  : isRecurrent
                  ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400 p-3 gap-1.5'
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
                  backgroundColor: isRecurrent
                    ? '#C9A227'
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
                    isRecurrent
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
                  {isRecurrent ? (
                    <>
                      <Icon name="history" size={12} className="text-[#C9A227]" />
                      <span>TÁI PHÁT ({item.priorDefectCode || 'DEF-OLD'})</span>
                    </>
                  ) : isApproved ? (
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
                  {/* TẦNG 3: TRẠNG THÁI KÍCH THƯỚC HÌNH HỌC */}
                  <div className="pl-2 animate-in fade-in duration-200">
                    <div className="p-2.5 bg-white/90 rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-2xs space-y-1.5">
                      {isApproved && (item.metrics.length || item.metrics.area || item.metrics.depth) ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-700 font-semibold">Kích thước hình học:</span>
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <Icon name="check_circle" size={12} className="text-emerald-600" />
                              <span>Đã đo thực tế</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                            {item.metrics.length && (
                              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                                <span className="text-slate-500">Chiều dài (L):</span>
                                <strong className="font-mono text-slate-900">{item.metrics.length}</strong>
                              </div>
                            )}
                            {item.metrics.crackWidth && (
                              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                                <span className="text-slate-500">Bề rộng (W):</span>
                                <strong className="font-mono text-slate-900">{item.metrics.crackWidth}</strong>
                              </div>
                            )}
                            {item.metrics.depth && (
                              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                                <span className="text-slate-500">Chiều sâu (H):</span>
                                <strong className="font-mono text-slate-900">{item.metrics.depth}</strong>
                              </div>
                            )}
                            {item.metrics.area && (
                              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded">
                                <span className="text-slate-500">Diện tích (S):</span>
                                <strong className="font-mono text-slate-900">{item.metrics.area}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-semibold">Kích thước hình học:</span>
                            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              Chờ đo thực tế
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic leading-snug mt-1">
                            AI BBox chỉ định vị nhận diện. Kích thước vật lý chính thức do Đội hiện trường đo bằng thước nộp về.
                          </p>
                        </div>
                      )}
                      {item.metrics.reviewer && (
                        <div className="flex items-center justify-between text-emerald-800 pt-1 border-t border-slate-200/60 font-medium">
                          <span>Người duyệt thẩm định:</span>
                          <span className="font-semibold">{item.metrics.reviewer}</span>
                        </div>
                      )}
                      {item.metrics.dismissReason && (
                        <div className="text-slate-500 italic pt-1 border-t border-slate-200/60">
                          Lý do loại bỏ: {item.metrics.dismissReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TẦNG 4: HÀNG NÚT BẤM HÀNH ĐỘNG THẨM ĐỊNH TRỰC TIẾP TẠI CHỖ */}
                  <div className="pl-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                    {isPending ? (
                      isReadOnly ? (
                        <div className="w-full flex items-center justify-between text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <span className="flex items-center gap-1.5">
                            <Icon name="pending" size={15} className="text-amber-600" />
                            <span>Đang chờ Chỉ huy trưởng (PM) thẩm định</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApproveDetection(item.id);
                            }}
                            className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                          >
                            <Icon name="check_circle" size={15} />
                            <span>Chấp nhận (Hợp lệ)</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRejectDetection(item.id, 'Nhận diện nhầm vật cản / bóng râm');
                            }}
                            className="py-2 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Icon name="cancel" size={15} />
                            <span>Bỏ qua (Báo sai)</span>
                          </button>
                        </div>
                      )
                    ) : isApproved ? (
                      <div className="w-full flex items-center justify-between text-xs font-medium text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                        <span className="flex items-center gap-1.5">
                          <Icon name="check_circle" size={15} className="text-emerald-600" />
                          <span>Đã xác nhận là khiếm khuyết hợp lệ</span>
                        </span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRejectDetection(item.id, 'Xem xét lại');
                            }}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                          >
                            Thay đổi
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="flex items-center gap-1.5">
                          <Icon name="cancel" size={15} className="text-slate-400" />
                          <span>Đã đánh dấu loại bỏ (Báo sai)</span>
                        </span>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApproveDetection(item.id);
                            }}
                            className="text-[11px] font-semibold text-[#C9A227] hover:underline cursor-pointer"
                          >
                            Khôi phục hợp lệ
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* KHI CHƯA CHỌN: Hiển thị hint nhỏ gọn để khuyến khích bấm xem trích xuất */
                <div className="pl-2 pt-1 border-t border-slate-100/70 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500 hover:text-brand-dark">
                    <Icon name="ads_click" size={13} className="text-brand-gold" />
                    <span>Bấm để trích xuất ảnh & khung nhận diện</span>
                  </span>
                  {isApproved && (item.metrics.length || item.metrics.area) ? (
                    <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.metrics.length || item.metrics.area}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Chờ đo thực tế
                    </span>
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

