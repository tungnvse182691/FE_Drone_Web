import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { PolicyThresholdConfig, PolicyHistoryItem, RoadCoverageFact, AuditLogItem } from './types'

export interface PolicySectionProps {
  currentPolicy: PolicyThresholdConfig | null
  policyHistory: (PolicyHistoryItem | any)[]
  auditLogs?: AuditLogItem[]
  isSupervisor?: boolean
  roadCoverage: RoadCoverageFact | null
  onOpenRoadCoverageModal?: () => void
  onActivateDraft?: (item: any) => void
  onOpenPolicyModal?: () => void
}

function formatDefectTypeVi(code?: string): string {
  if (!code) return 'Không xác định'
  const c = code.toUpperCase()
  if (c.includes('POTHOLE')) return 'Ổ gà'
  if (c.includes('CRACK')) return 'Nứt mặt đường'
  if (c.includes('RUT')) return 'Vệt lún bánh xe'
  if (c.includes('RAVEL')) return 'Bong bật cốt liệu'
  return code
}

function formatStopConditionVi(cond: string): string {
  const c = cond.trim().toUpperCase()
  if (c.includes('WEATHER_RAIN') || c.includes('RAIN')) return 'Trời mưa'
  if (c.includes('NIGHT_WITHOUT_LIGHT') || c.includes('NIGHT')) return 'Ban đêm thiếu ánh sáng'
  if (c.includes('TRAFFIC')) return 'Mật độ xe cao'
  return cond
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  currentPolicy,
  policyHistory,
  auditLogs = [],
  isSupervisor = false,
  roadCoverage,
  onOpenRoadCoverageModal,
  onOpenPolicyModal
}) => {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'audit' | 'history'>('audit')

  const totalLogs = auditLogs.length + policyHistory.length

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-5">
        {/* 1. HEADER SECTION: THÔNG TIN QUY CHUẨN KỸ THUẬT */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold shrink-0">
              <Icon name="verified_user" size={20} className="text-[#C9A227]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-brand-dark tracking-tight">
                  Quy chuẩn chính sách xử lý nhanh áp dụng
                </h2>
                {currentPolicy ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {currentPolicy.version} (HIỆU LỰC)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    CHƯA XUẤT BẢN CHÍNH SÁCH
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chính sách do Chỉ huy trưởng lập dự thảo &amp; xuất bản • Căn cứ phạm vi tuyến bảo hành được phê duyệt
              </p>
            </div>
          </div>

          {/* Nút hành động trên Header: Đã dọn dẹp các nhãn chế độ thừa thãi */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            {!isSupervisor && onOpenPolicyModal && (
              <button
                onClick={onOpenPolicyModal}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A227] hover:bg-[#b08d20] text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-colors"
                title="Chỉnh sửa hoặc lập dự thảo quy chuẩn kỹ thuật xử lý nhanh mới"
              >
                <Icon name="tune" size={14} />
                <span>Điều chỉnh chính sách</span>
              </button>
            )}

            {/* GỘP DUY NHẤT 1 NÚT: NHẬT KÝ & LỊCH SỬ THAY ĐỔI */}
            <button
              onClick={() => setIsActivityModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 cursor-pointer transition-colors shadow-2xs"
              title="Tra cứu toàn bộ nhật ký kiểm toán hệ thống và lịch sử các lần sửa đổi chính sách"
            >
              <Icon name="history_edu" size={15} className="text-[#C9A227]" />
              <span>Nhật ký &amp; Lịch sử ({totalLogs})</span>
            </button>
          </div>
        </div>

        {/* 2. SUB-CARD PHẠM VI TUYẾN ĐƯỜNG BẢO HÀNH */}
        {roadCoverage ? (
          <div className="bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0 mt-0.5">
                <Icon name="map" size={18} className="text-[#C9A227]" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    Phạm vi tuyến bảo hành
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                    Lý trình: Km {roadCoverage.fromKm} - Km {roadCoverage.toKm}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                      roadCoverage.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <Icon
                      name={roadCoverage.status === 'CONFIRMED' ? 'verified' : 'pending_actions'}
                      size={12}
                    />
                    {roadCoverage.status === 'CONFIRMED' ? 'ĐỘ PHỦ TUYẾN ĐÃ DUYỆT' : 'CHỜ GIÁM SÁT DUYỆT'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-3 flex-wrap">
                  <span>Căn cứ pháp lý: <strong className="text-slate-800">{roadCoverage.sourceKind === 'WARRANTY' ? 'Hợp đồng bảo hành' : 'Bảo dưỡng thường xuyên'}</strong></span>
                  <span>•</span>
                  <span>Số hiệu văn bản: <strong className="font-mono text-slate-800">{roadCoverage.documentNo || 'BB-BG-2026/QL1A-PK01'}</strong></span>
                  <span>•</span>
                  <span>Hiệu lực áp dụng: <strong className="text-slate-800">{roadCoverage.applicableFromUtc === '—' ? 'Chưa xác lập ngày' : `${roadCoverage.applicableFromUtc} → ${roadCoverage.applicableToUtc}`}</strong></span>
                  {roadCoverage.confirmedBy && (
                    <>
                      <span>•</span>
                      <span>Người phê duyệt: <strong className="text-emerald-700">{roadCoverage.confirmedBy}</strong> ({roadCoverage.confirmedAt})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Nút phê duyệt độ phủ tuyến duy nhất dành cho Giám sát */}
            {isSupervisor && roadCoverage.status !== 'CONFIRMED' && onOpenRoadCoverageModal && (
              <button
                onClick={onOpenRoadCoverageModal}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C9A227] hover:bg-[#b08d20] text-white text-xs font-bold rounded-lg shadow-2xs shrink-0 cursor-pointer transition-colors"
              >
                <Icon name="verified" size={14} />
                <span>Phê duyệt độ phủ tuyến</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 text-center">
            Chưa có thông tin độ phủ tuyến đường bảo hành cho dự án này trong CSDL.
          </div>
        )}

        {/* 3. GRID CHỈ SỐ NGƯỠNG KỸ THUẬT (CHUẨN 100% TIẾNG VIỆT & SPEC 17_10) */}
        {currentPolicy ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Cột 1: Diện tích tối đa */}
            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Diện tích mặt đường tối đa
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-brand-dark">
                  ≤ {currentPolicy.maxAreaM2}
                </span>
                <span className="text-xs font-bold text-slate-500">m²</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Vượt ngưỡng: Bắt buộc Giám sát phê duyệt
              </p>
            </div>

            {/* Cột 2: Độ sâu tối đa */}
            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Độ sâu hư hỏng tối đa
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-brand-dark">
                  ≤ {currentPolicy.maxDepthCm}
                </span>
                <span className="text-xs font-bold text-slate-500">cm</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Hạn mức kỹ thuật an toàn mặt đường
              </p>
            </div>

            {/* Cột 3: Loại hư hỏng áp dụng & Điều kiện dừng */}
            <div className="bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Hư hỏng áp dụng
              </span>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded">
                  {formatDefectTypeVi(currentPolicy.defectTypeCode)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  (Lần ban hành {currentPolicy.revision || 1})
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Điều kiện dừng: {currentPolicy.stopConditions && currentPolicy.stopConditions.length > 0
                  ? currentPolicy.stopConditions.map(formatStopConditionVi).join(', ')
                  : 'Không có'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-center space-y-2">
            <Icon name="info" size={24} className="text-[#C9A227] mx-auto" />
            <p className="text-xs font-medium text-slate-700">
              Dự án này hiện chưa xuất bản chính sách xử lý nhanh nào trong CSDL Backend.
            </p>
            {!isSupervisor && onOpenPolicyModal && (
              <button
                onClick={onOpenPolicyModal}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A227] hover:bg-[#b08d20] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                <Icon name="add" size={14} />
                <span>Lập dự thảo chính sách mới</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL TÍCH HỢP: NHẬT KÝ KIỂM TOÁN & LỊCH SỬ CHÍNH SÁCH */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
                  <Icon name="history_edu" size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Nhật Ký Hoạt Động &amp; Lịch Sử Chính Sách</h3>
                  <p className="text-[10px] text-slate-500">Hồ sơ kiểm toán điện tử bất biến và lịch sử các lần ban hành quy chuẩn</p>
                </div>
              </div>
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* TAB CHUYỂN ĐỔI: NHẬT KÝ KIỂM TOÁN vs LỊCH SỬ PHIÊN BẢN */}
            <div className="flex border-b border-slate-200 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`pb-2.5 px-3 text-xs font-bold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'border-[#C9A227] text-[#C9A227]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon name="fact_check" size={14} />
                <span>Nhật ký thao tác hệ thống ({auditLogs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`pb-2.5 px-3 text-xs font-bold cursor-pointer transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'border-[#C9A227] text-[#C9A227]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon name="history" size={14} />
                <span>Lịch sử các phiên bản quy chuẩn ({policyHistory.length})</span>
              </button>
            </div>

            {/* NỘI DUNG TAB 1: NHẬT KÝ THAO TÁC (AUDIT TRAIL) */}
            {activeTab === 'audit' && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.title}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{log.time}</span>
                      </div>
                      <p className="text-slate-600">
                        Người thực hiện: <strong className="text-slate-800">{log.user}</strong> • Mã băm xác thực:{' '}
                        <code className="bg-white px-1.5 py-0.5 rounded text-[10px] text-amber-700 border border-slate-200 font-mono">
                          {log.hash}
                        </code>
                      </p>
                      <div className="text-[11px] text-slate-500 pt-0.5">
                        {log.note}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Chưa có nhật ký kiểm toán nào được ghi nhận.
                  </div>
                )}
              </div>
            )}

            {/* NỘI DUNG TAB 2: LỊCH SỬ PHIÊN BẢN (POLICY HISTORY) */}
            {activeTab === 'history' && (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {policyHistory.length > 0 ? (
                  policyHistory.map((h, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{h.version}</span>
                        <span className="text-[11px] text-slate-500">{h.activatedAt}</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-3">
                        <span>Diện tích hư hỏng ≤ {h.maxArea} m²</span>
                        <span>•</span>
                        <span>Độ sâu hư hỏng ≤ {h.maxDepth} cm</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Chưa có dữ liệu lịch sử phiên bản nào được ghi nhận trong CSDL.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsActivityModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
