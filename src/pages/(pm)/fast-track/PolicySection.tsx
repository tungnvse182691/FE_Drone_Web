import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { PolicyThresholdConfig, PolicyHistoryItem, RoadCoverageFact } from './types'

export interface PolicySectionProps {
  currentPolicy: PolicyThresholdConfig
  policyHistory: (PolicyHistoryItem | any)[]
  isSupervisor?: boolean
  roadCoverage?: RoadCoverageFact
  onOpenRoadCoverageModal?: () => void
  onActivateDraft: (item: any) => void
  onOpenAuditModal: () => void
  onOpenPolicyModal?: () => void
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  currentPolicy,
  policyHistory,
  isSupervisor = false,
  roadCoverage,
  onOpenRoadCoverageModal,
  onActivateDraft,
  onOpenAuditModal,
  onOpenPolicyModal
}) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-5">
        {/* 1. HEADER SECTION: THÔNG TIN PHIÊN BẢN & PHÂN QUYỀN */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold shrink-0">
              <Icon name="verified_user" size={20} className="text-brand-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-brand-dark tracking-tight">
                  Quy chuẩn chính sách xử lý nhanh áp dụng
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  {currentPolicy.version} (HIỆU LỰC)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chính sách do Chỉ huy trưởng (PM) lập dự thảo &amp; xuất bản • Căn cứ phạm vi tuyến bảo hành được phê duyệt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            {isSupervisor ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  <Icon name="visibility" size={14} className="text-slate-400" />
                  <span>Chế độ Giám sát: Theo dõi &amp; Thẩm duyệt</span>
                </span>
                {onOpenRoadCoverageModal && (
                  <button
                    onClick={onOpenRoadCoverageModal}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C9A227] hover:bg-[#b08d20] text-white text-xs font-bold rounded-lg border border-amber-400 shadow-2xs cursor-pointer transition-colors"
                    title="Phê duyệt hoặc cập nhật độ phủ tuyến đường bảo hành áp dụng cơ chế xử lý khẩn cấp"
                  >
                    <Icon name="verified" size={14} />
                    <span>Phê duyệt độ phủ tuyến</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200">
                  <Icon name="manage_accounts" size={14} className="text-brand-gold" />
                  <span>Quyền PM: Lập dự thảo &amp; Xuất bản chính sách</span>
                </span>
                {onOpenPolicyModal && (
                  <button
                    onClick={onOpenPolicyModal}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs cursor-pointer transition-colors"
                    title="Chỉnh sửa hoặc lập dự thảo chính sách xử lý nhanh mới"
                  >
                    <Icon name="tune" size={14} className="text-brand-gold" />
                    <span>Điều chỉnh chính sách</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 1.1. KHỐI THÔNG TIN ĐỘ PHỦ TUYẾN ĐƯỜNG BẢO HÀNH */}
        {roadCoverage && (
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
            <div className="flex items-start md:items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-amber-800 shrink-0 mt-0.5 md:mt-0">
                <Icon name="route" size={16} />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">
                    Phạm vi tuyến bảo hành cấp phép:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {roadCoverage.projectName}
                  </span>
                  <span className="font-mono text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200 text-[11px]">
                    Km {roadCoverage.fromKm} &rarr; Km {roadCoverage.toKm}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px] flex-wrap">
                  <span>Căn cứ: <strong>{roadCoverage.sourceKind === 'WARRANTY' ? 'Bảo hành công trình' : 'Bảo dưỡng thường xuyên'}</strong></span>
                  <span>•</span>
                  <span>Văn bản: <strong className="font-mono">{roadCoverage.handoverVersion}</strong></span>
                  <span>•</span>
                  <span>Hiệu lực: <strong className="font-mono">{roadCoverage.applicableFromUtc} &rarr; {roadCoverage.applicableToUtc}</strong></span>
                  {roadCoverage.confirmedBy && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700">Duyệt bởi: <strong>{roadCoverage.confirmedBy}</strong> ({roadCoverage.confirmedAt})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              {roadCoverage.status === 'CONFIRMED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <Icon name="check_circle" size={13} className="text-emerald-600" />
                  <span>ĐÃ PHÊ DUYỆT ĐỘ PHỦ BẢO HÀNH</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                  <Icon name="hourglass_empty" size={13} className="text-amber-800" />
                  <span>CHỜ DUYỆT ĐỘ PHỦ BẢO HÀNH</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* 2. BODY: CÁC THẺ ĐỊNH MỨC KỸ THUẬT THỐNG NHẤT THEO SPEC 17_10 & TCVN */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="straighten" size={15} className="text-brand-gold" />
              <span>Định mức đo đạc kỹ thuật xử lý nhanh (TCVN 8864 / TCVN 8819:2011)</span>
            </span>
            <span className="font-mono text-[10px] text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Quy chuẩn: {currentPolicy.version}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Bề rộng vết nứt */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Bề rộng vết nứt
                </span>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-700 shrink-0">
                  <Icon name="linear_scale" size={16} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                  ≤ {currentPolicy.crackWidthMm ?? 1.5} <span className="text-sm font-normal text-slate-500 font-sans">mm</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Khoảng chuẩn: 0 – {currentPolicy.crackWidthMm ?? 1.5} mm • Đo quang học
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Icon name="check_circle" size={12} className="text-blue-600" />
                  Khe nứt BTXM &amp; Asphalt
                </span>
              </div>
            </div>

            {/* Card 2: Chiều dài vết nứt */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Chiều dài vết nứt
                </span>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-700 shrink-0">
                  <Icon name="straighten" size={16} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                  ≤ {currentPolicy.crackLengthM ?? 3.0} <span className="text-sm font-normal text-slate-500 font-sans">m</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Khoảng chuẩn: 0 – {currentPolicy.crackLengthM ?? 3.0} m • Thước trắc địa
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Icon name="check_circle" size={12} className="text-blue-600" />
                  Nứt dọc / nứt ngang
                </span>
              </div>
            </div>

            {/* Card 3: Ngưỡng Diện Tích Ổ Gà (AREA) */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Ngưỡng diện tích ổ gà (AREA)
                </span>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-gold shrink-0">
                  <Icon name="tune" size={16} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                  ≤ {currentPolicy.maxAreaM2} <span className="text-sm font-normal text-slate-500 font-sans">m²</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chu vi biên dạng khép kín &lt; {currentPolicy.maxPerimeterM} m
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Icon name="check_circle" size={12} className="text-sky-600" />
                  AI &amp; Tuần tra xác thực
                </span>
              </div>
            </div>

            {/* Card 4: Ngưỡng Độ Sâu Ổ Gà (DEPTH) */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Ngưỡng độ sâu ổ gà (DEPTH)
                </span>
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-gold shrink-0">
                  <Icon name="balance" size={16} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                  ≤ {currentPolicy.maxDepthCm} <span className="text-sm font-normal text-slate-500 font-sans">cm</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Độ lệch mặt đường đo laser / thước
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Icon name="check_circle" size={12} className="text-sky-600" />
                  Kiểm tra đo đạc thước
                </span>
              </div>
            </div>
          </div>

          {/* Hàng điều kiện phụ: Mức độ nghiêm trọng cho phép & SLA thời gian hoàn tất */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Card 5: Mức Nghiêm Trọng Cho Phép */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-600 shrink-0">
                  <Icon name="warning" size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Mức độ hư hỏng cho phép
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    Thấp / Trung bình (LOW &amp; MEDIUM)
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Cấm tự duyệt lỗi Nặng (HIGH) hoặc Nguy hiểm (CRITICAL)
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                <Icon name="lock" size={12} className="text-amber-600" />
                Ràng buộc an toàn
              </span>
            </div>

            {/* Card 6: Cam Kết Thời Gian SLA Hoàn Tất */}
            <div className="bg-slate-50/80 hover:bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Icon name="schedule" size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Thời hạn hoàn tất xử lý (SLA Window)
                  </span>
                  <div className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    ≤ {currentPolicy.slaHours} giờ (Original Window 24h)
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Tính từ khi phát lệnh điều phối đến nghiệm thu đạt
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                <Icon name="schedule" size={12} className="text-emerald-600" />
                SLA-FT-24H
              </span>
            </div>
          </div>
        </div>

        {/* 3. FOOTER BAR: CĂN CỨ PHÁP LÝ & CÁC NÚT XEM LỊCH SỬ / AUDIT */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <Icon name="info" size={16} className="text-brand-gold shrink-0" />
            <span className="truncate">
              Căn cứ pháp lý: <strong className="text-slate-800">TCVN 8819:2011</strong> &amp; Phụ lục HĐ bảo dưỡng thường xuyên Q4/2026 • Ràng buộc bất biến <strong className="text-slate-800">BR-04 &amp; BR-08</strong>.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs cursor-pointer transition-colors"
            >
              <Icon name="history" size={14} className="text-brand-gold" />
              <span>Lịch sử phiên bản ({policyHistory.length})</span>
            </button>
            <button
              onClick={onOpenAuditModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs cursor-pointer transition-colors"
            >
              <Icon name="description" size={14} className="text-brand-gold" />
              <span>Nhật ký kiểm toán</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL LỊCH SỬ PHIÊN BẢN CHÍNH SÁCH */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Icon name="history" size={20} className="text-brand-gold" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Lịch sử các phiên bản chính sách xử lý nhanh</h3>
                  <p className="text-[11px] text-slate-500">
                    Hồ sơ quy chuẩn kỹ thuật áp dụng theo từng giai đoạn dự án
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {policyHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                    item.status === 'ACTIVE'
                      ? 'bg-amber-50/30 border-amber-300 shadow-2xs'
                      : item.status === 'DRAFT'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-dark text-sm">{item.version}</span>
                      {item.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Hiệu lực hiện hành
                        </span>
                      )}
                      {item.status === 'DRAFT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Dự thảo
                        </span>
                      )}
                      {item.status === 'ARCHIVED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          Đã đóng / Lưu trữ
                        </span>
                      )}
                    </div>

                    {!isSupervisor && item.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => {
                          onActivateDraft(item)
                          setIsHistoryModalOpen(false)
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-brand-gold hover:bg-[#B38E1F] rounded-lg transition-colors cursor-pointer shadow-xs"
                        title="Xuất bản dự thảo này thành chính sách hiệu lực chính thức"
                      >
                        Xuất bản chính sách
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Người phụ trách: <strong>{item.activatedBy}</strong> • {item.activatedAt}
                  </p>
                  <div className="text-[11px] text-[#8F7212] font-semibold">{item.route}</div>
                  <div className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200/80">
                    Ngưỡng: Diện tích ≤ {item.maxArea}m² • Sâu ≤ {item.maxDepth}cm • SLA {item.slaHours}h
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
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
