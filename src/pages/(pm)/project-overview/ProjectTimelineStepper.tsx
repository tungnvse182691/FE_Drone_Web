import React from 'react'
import { Route as RouteIcon, Check, Map, PlaneTakeoff, Play, Lock } from 'lucide-react'

interface ProjectTimelineStepperProps {
  projectId: string
  basePath: string
  onNavigate: (path: string) => void
}

export const ProjectTimelineStepper: React.FC<ProjectTimelineStepperProps> = ({
  projectId,
  basePath,
  onNavigate
}) => {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-brand-gold" />
            <span>Tiến trình bàn giao &amp; Vòng đời bảo hành</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi luân chuyển trách nhiệm giữa Supervisor, Project Manager và Đội hiện trường.
          </p>
        </div>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          Giai đoạn: 04/05
        </span>
      </div>

      {/* Vertical Stepper */}
      <div className="relative pl-6 sm:pl-8 flex flex-col gap-5 pt-2">
        <div className="absolute left-3 sm:left-4 top-3 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2"></div>

        {/* Step 1 */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-brand-dark font-bold">
                Bước 1: Khởi tạo dự án &amp; Gán PM điều hành
              </span>
              <span className="font-mono text-[11px] text-slate-500">15/06/2026 • 09:30</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thực hiện bởi <strong className="text-brand-dark">Supervisor Nguyễn Văn An</strong>. Bàn giao đầy đủ hồ sơ pháp lý và quyền quản trị tuyến cho <strong className="text-brand-dark">PM Đỗ Quốc Hoàng</strong>.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-brand-dark font-bold">
                Bước 2: Dựng tim tuyến &amp; Duyệt hình học WGS84 (WF-02)
              </span>
              <span className="font-mono text-[11px] text-slate-500">20/06/2026 • Ký số SHA-256</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Đã nắn 14 đỉnh tọa độ góc, chia 5 phân đoạn lý trình chuẩn. Supervisor đã ký duyệt chứng thư số mã hóa tọa độ WGS84 lên hệ thống bảo an.
            </p>
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => onNavigate(`${basePath}/projects/${projectId}/alignment`)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-dark bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded shadow-2xs transition-colors"
              >
                <Map className="w-3 h-3 text-brand-gold" />
                Xem bản đồ tim tuyến &amp; Slabs (WF-02) →
              </button>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xs border border-emerald-200">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-brand-dark font-bold">
                Bước 3: Bay Drone lập Baseline dữ liệu ban đầu (WF-09)
              </span>
              <span className="font-mono text-[11px] text-slate-500">05/07/2026 • Matrice 300 RTK</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Đội bay hoàn thành quét không ảnh 21.5 km với độ phân giải 1.2 cm/pixel, lập mây điểm 3D và khóa mốc mặt đường làm căn cứ đối soát khiếu nại phát sinh.
            </p>
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => onNavigate(`${basePath}/surveys/srv-01/review`)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8F7212] bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/30 px-2.5 py-1 rounded shadow-2xs transition-colors"
              >
                <PlaneTakeoff className="w-3 h-3 text-brand-gold" />
                Mở Canvas Thẩm định AI (WF-09) →
              </button>
            </div>
          </div>
        </div>

        {/* Step 4 (ACTIVE) */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-brand-gold text-white flex items-center justify-center ring-4 ring-brand-gold/30 shadow-md animate-pulse">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </div>
          <div className="bg-amber-50/40 border-2 border-brand-gold/50 rounded-xl p-4 flex-1 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-dark font-bold">
                  Bước 4: Vận hành bảo hành &amp; Triage khiếm khuyết (WF-04, 05, 07, 08)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold text-white uppercase tracking-wide">
                  Active Running
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#8F7212]">
                Đang thực thi liên tục
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Đang theo dõi 12 khiếm khuyết mặt đường. Ban điều hành đang phối hợp với Tổ tuần kiểm hiện trường và xử lý 02 gói sửa chữa bảo trì định kỳ.
            </p>
            <div className="mt-2.5 pt-2.5 flex items-center justify-between text-xs bg-white border border-brand-border p-2 rounded-lg">
              <span className="text-slate-500">Trách nhiệm phê duyệt hiện tại:</span>
              <span className="font-semibold text-[#8F7212]">
                Kỹ sư Nguyễn Văn An (Supervisor)
              </span>
            </div>
          </div>
        </div>

        {/* Step 5 (LOCKED) */}
        <div className="relative flex items-start gap-4 opacity-60">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white">
            <Lock className="w-3 h-3" />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-500 font-medium">
                Bước 5: Nghiệm thu hoàn tất bàn giao &amp; Đóng gói lưu trữ pháp lý (+5 năm)
              </span>
              <span className="font-mono text-[11px] text-slate-400">Dự kiến: 31/08/2027</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kích hoạt khi hết hạn bảo hành 36 tháng. Đóng băng dữ liệu WGS84, báo cáo IRI/PCI và chuyển vào kho lưu trữ số vĩnh viễn theo Luật Xây dựng.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
