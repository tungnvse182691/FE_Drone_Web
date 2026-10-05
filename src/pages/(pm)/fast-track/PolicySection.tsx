import React from 'react'
import {
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Scale,
  Check,
  AlertTriangle,
  Lock,
  Clock,
  History as HistoryIcon,
  FileText,
} from 'lucide-react'
import type { PolicyThresholdConfig, PolicyHistoryItem } from './types'

export interface PolicySectionProps {
  currentPolicy: PolicyThresholdConfig
  policyHistory: (PolicyHistoryItem | any)[]
  onActivateDraft: (item: any) => void
  onOpenAuditModal: () => void
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  currentPolicy,
  policyHistory,
  onActivateDraft,
  onOpenAuditModal,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-brand-border space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
            <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
          </div>
          <h2 className="text-lg font-bold text-brand-dark">Phiên bản chính sách Fast Track hiện hành</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            {currentPolicy.version} (ACTIVE) — Bất biến sau kích hoạt
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Quy chuẩn kích hoạt: <strong className="text-brand-dark font-semibold">3/3 Tiêu chí</strong> bắt buộc phải
            thỏa mãn để tự động mở luồng Fast Track
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Cột trái: 3 Thẻ ngưỡng kỹ thuật & SLA Card (8 cols) */}
        <div className="xl:col-span-8 flex flex-col space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Threshold 1: Diện tích */}
            <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Ngưỡng diện tích tối đa
                </span>
                <Sliders className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight">
                  ≤ {currentPolicy.maxAreaM2} m²
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Chu vi biên dạng khép kín &lt; {currentPolicy.maxPerimeterM} m
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Sparkles className="w-3 h-3" />
                  AI &amp; Tuần tra xác thực
                </span>
              </div>
            </div>

            {/* Threshold 2: Độ sâu */}
            <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Ngưỡng độ sâu tối đa
                </span>
                <Scale className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight">
                  ≤ {currentPolicy.maxDepthCm} cm
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Độ lệch mặt đường cơ sở đo laser</p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <Check className="w-3 h-3" />
                  Kiểm tra đo đạc thước
                </span>
              </div>
            </div>

            {/* Threshold 3: Mức nghiêm trọng */}
            <div className="bg-slate-50/70 rounded-xl p-4 flex flex-col justify-between space-y-3 border border-slate-200 shadow-2xs">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mức nghiêm trọng</span>
                <AlertTriangle className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <div className="text-2xl font-black text-brand-dark tracking-tight">LOW / MEDIUM</div>
                <p className="text-[11px] text-slate-500 mt-1">Không gây mất an toàn giao thông tức thì</p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Lock className="w-3 h-3" />
                  Cấm tự duyệt HIGH / CRITICAL
                </span>
              </div>
            </div>
          </div>

          {/* SLA Card */}
          <div className="bg-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-[#C9A227] border border-amber-200 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-dark block">
                  Thời gian cam kết chu trình Fast Track
                </span>
                <span className="text-xs text-slate-500">
                  Thời hạn tối đa từ lúc xác thực đến hoàn tất thi công sửa nguội:{' '}
                  <strong className="text-brand-dark font-semibold">≤ {currentPolicy.slaHours} giờ</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-full text-slate-700 border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>SLA SLA-FT-24H</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Lịch sử phiên bản & Audit Log (4 cols) */}
        <div className="xl:col-span-4 bg-slate-50/60 rounded-xl p-4 flex flex-col justify-between border border-slate-200 shadow-2xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                <HistoryIcon className="w-4 h-4 text-[#C9A227]" />
                <span>Lịch sử phiên bản chính sách</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                {policyHistory.length} bản ghi
              </span>
            </div>

            <div className="space-y-2">
              {policyHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-2.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                    item.status === 'ACTIVE'
                      ? 'bg-white border-brand-border shadow-xs'
                      : item.status === 'DRAFT'
                      ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                      : 'bg-slate-100/70 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-brand-dark">{item.version}</span>
                      {item.status === 'ACTIVE' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Hiện hành
                        </span>
                      )}
                      {item.status === 'DRAFT' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Dự thảo
                        </span>
                      )}
                      {item.status === 'ARCHIVED' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                          Đã đóng
                        </span>
                      )}
                    </div>
                    {item.status === 'DRAFT' && (
                      <button
                        type="button"
                        onClick={() => onActivateDraft(item)}
                        className="px-2.5 py-0.5 text-[11px] font-bold text-white bg-[#C9A227] hover:bg-[#B38E1F] rounded-md transition-colors cursor-pointer shadow-xs"
                      >
                        Kích hoạt ngay
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {item.status === 'DRAFT' ? 'Soạn bởi' : 'Kích hoạt bởi'} {item.activatedBy} • {item.activatedAt}
                  </p>
                  <div className="text-[11px] text-[#8F7212] font-semibold">{item.route}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Ngưỡng: Diện tích ≤ {item.maxArea}m² • Sâu ≤ {item.maxDepth}cm • SLA {item.slaHours}h
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAuditModal}
            type="button"
            className="mt-3 w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Xem nhật ký chi tiết thay đổi (Audit Log)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
