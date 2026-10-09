import React, { useState } from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Scale,
  AlertTriangle,
  Lock,
  Clock,
  History as HistoryIcon,
  FileText,
  Info,
  X,
  ExternalLink
} from 'lucide-react'
import type { PolicyThresholdConfig, PolicyHistoryItem } from './types'

export interface PolicySectionProps {
  currentPolicy: PolicyThresholdConfig
  policyHistory: (PolicyHistoryItem | any)[]
  isSupervisor?: boolean
  onActivateDraft: (item: any) => void
  onOpenAuditModal: () => void
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  currentPolicy,
  policyHistory,
  isSupervisor = false,
  onActivateDraft,
  onOpenAuditModal,
}) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-5">
        {/* 1. HEADER SECTION: THÔNG TIN PHIÊN BẢN & PHÂN QUYỀN */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-brand-dark tracking-tight">
                  Quy chuẩn chính sách Fast Track áp dụng
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  {currentPolicy.version} (HIỆU LỰC)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Chính sách do Ban Giám Sát / CĐT phê duyệt ban hành • Áp dụng toàn tuyến QL1A (Km 1000 - Km 1080)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            {isSupervisor ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" />
                <span>Quyền phê duyệt: Giám sát / Ban QLDA</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Chỉ huy trưởng tuân thủ thực thi (Chế độ Xem)</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. BODY: 4 THẺ CHỈ SỐ KỸ THUẬT ĐỐI XỨNG CÂN ĐỐI (1 HÀNG 4 CỘT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Ngưỡng Diện Tích */}
          <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ngưỡng diện tích tối đa
              </span>
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-gold shrink-0">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                ≤ {currentPolicy.maxAreaM2} <span className="text-sm font-normal text-slate-500 font-sans">m²</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Chu vi biên dạng khép kín &lt; {currentPolicy.maxPerimeterM} m
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                AI &amp; Tuần tra xác thực
              </span>
            </div>
          </div>

          {/* Card 2: Ngưỡng Độ Sâu */}
          <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ngưỡng độ sâu tối đa
              </span>
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-gold shrink-0">
                <Scale className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                ≤ {currentPolicy.maxDepthCm} <span className="text-sm font-normal text-slate-500 font-sans">cm</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Độ lệch mặt đường đo laser/thước
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                Kiểm tra đo đạc thước
              </span>
            </div>
          </div>

          {/* Card 3: Mức Nghiêm Trọng */}
          <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mức độ cho phép
              </span>
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                LOW / MEDIUM
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Hư hỏng nhẹ, không gây ách tắc
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Lock className="w-3 h-3 text-amber-600" />
                Cấm tự duyệt lỗi Nặng
              </span>
            </div>
          </div>

          {/* Card 4: Cam Kết Thời Gian SLA */}
          <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Thời hạn hoàn tất SLA
              </span>
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-brand-dark tracking-tight font-mono">
                ≤ {currentPolicy.slaHours} <span className="text-sm font-normal text-slate-500 font-sans">giờ</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Từ phát lệnh đến vá nguội hoàn tất
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Clock className="w-3 h-3 text-emerald-600" />
                SLA SLA-FT-24H
              </span>
            </div>
          </div>
        </div>

        {/* 3. FOOTER BAR: CĂN CỨ PHÁP LÝ & CÁC NÚT XEM LỊCH SỬ / AUDIT */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 min-w-0">
            <Info className="w-4 h-4 text-brand-gold shrink-0" />
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
              <HistoryIcon className="w-3.5 h-3.5 text-brand-gold" />
              <span>Lịch sử phiên bản ({policyHistory.length})</span>
            </button>
            <button
              onClick={onOpenAuditModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-brand-gold" />
              <span>Nhật ký kiểm toán (Audit Trail)</span>
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
                <HistoryIcon className="w-5 h-5 text-brand-gold" />
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Lịch sử các phiên bản chính sách Fast Track</h3>
                  <p className="text-[11px] text-slate-500">
                    Hồ sơ quy chuẩn kỹ thuật áp dụng theo từng giai đoạn dự án
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
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

                    {isSupervisor && item.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => {
                          onActivateDraft(item)
                          setIsHistoryModalOpen(false)
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-brand-gold hover:bg-[#B38E1F] rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Kích hoạt ngay
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Phê duyệt bởi: <strong>{item.activatedBy}</strong> • {item.activatedAt}
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
