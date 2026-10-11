import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectTimelineStepperProps {
  project: HubProject
  basePath: string
  onNavigate: (path: string) => void
}

export const ProjectTimelineStepper: React.FC<ProjectTimelineStepperProps> = ({
  project,
  basePath,
  onNavigate
}) => {
  const isAlignmentDone = project.length_km > 0
  const isSurveyDone = project.open_defects > 0 || isAlignmentDone
  const isRepairDone = project.repair_packages > 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col gap-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-headline">
            <Icon name="alt_route" size={20} className="text-brand-gold" />
            <span>Tiến trình bàn giao &amp; Vòng đời bảo hành</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Luân chuyển trách nhiệm giữa Giám sát (Supervisor) và Chỉ huy trưởng (PM).
          </p>
        </div>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
          {isAlignmentDone ? 'Giai đoạn: 03/05' : 'Giai đoạn: 01/05'}
        </span>
      </div>

      {/* Vertical Stepper */}
      <div className="relative pl-6 sm:pl-8 flex flex-col gap-4 pt-2">
        <div className="absolute left-3 sm:left-4 top-3 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2"></div>

        {/* Step 1: Khởi tạo dự án (SUP - DA01, BR-01) - Đã hoàn thành */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-4 ring-white shadow-2xs border border-emerald-200">
            <Icon name="check" size={14} />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-900 font-bold">
                Bước 1: Khởi tạo dự án &amp; Phân quyền PM điều hành (DA01, BR-01)
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {project.handover_date || 'Ngày bàn giao'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supervisor đã khởi tạo hồ sơ quản lý và bàn giao quyền quản trị tuyến cho <strong className="text-slate-900">{project.pm_name}</strong> ({project.pm_email}).
            </p>
          </div>
        </div>

        {/* Step 2: Thiết lập tim tuyến & bề rộng (PM - WF-02, FR-06) */}
        <div className="relative flex items-start gap-4">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs border ${
              isAlignmentDone
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-amber-50 text-brand-gold border-amber-200 animate-pulse'
            }`}
          >
            <Icon name={isAlignmentDone ? 'check' : 'play_arrow'} size={14} />
          </div>
          <div
            className={`border rounded-xl p-3.5 flex-1 shadow-2xs ${
              isAlignmentDone ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/40 border-amber-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-900 font-bold">
                Bước 2: Thiết lập tim tuyến &amp; bề rộng mặt đường (PM - WF-02)
              </span>
              <span className="font-mono text-[11px] text-brand-gold font-semibold">
                {isAlignmentDone ? 'Đã duyệt tuyến' : 'Đang chờ PM'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAlignmentDone ? (
                <>Đã thiết lập tim tuyến chiều dài <strong className="text-slate-900">{project.length_km} km</strong>, hệ quy chiếu WGS84 EPSG:4326.</>
              ) : (
                <>PM cần nhập chuỗi tọa độ tim tuyến GPX/KML và bề rộng theo từng đoạn để phân đoạn mặt đường.</>
              )}
            </p>
            {!isAlignmentDone && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
                  className="px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-brand-goldMuted text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Icon name="alt_route" size={14} />
                  <span>Vào thiết lập tim tuyến ngay</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Khảo sát Drone AI */}
        <div className="relative flex items-start gap-4">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs border ${
              isSurveyDone
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            <Icon name={isSurveyDone ? 'check' : 'lock'} size={14} />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-2xs opacity-90">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-800 font-semibold">
                Bước 3: Khảo sát không ảnh Drone AI &amp; Thẩm định lỗi
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {isSurveyDone ? 'Đã kích hoạt' : 'Chờ hoàn thành Bước 2'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Drone bay chụp ảnh hiện trường, AI phát hiện nứt vỡ, PM thẩm định bounding box &amp; so sánh đa kỳ.
            </p>
          </div>
        </div>

        {/* Step 4: Gom đợt & Lập phương án */}
        <div className="relative flex items-start gap-4">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs border ${
              isRepairDone
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            <Icon name={isRepairDone ? 'check' : 'lock'} size={14} />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-2xs opacity-80">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-800 font-semibold">
                Bước 4: Gom đợt sửa chữa &amp; Trình duyệt phương án kỹ thuật (WF-07)
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {isRepairDone ? `${project.repair_packages} đợt` : 'Chờ kích hoạt'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Gom khiếm khuyết cùng lý trình, tính khối lượng cào bóc m², trám nứt m, trình Supervisor phê duyệt.
            </p>
          </div>
        </div>

        {/* Step 5: Nghiệm thu & Đóng bảo hành */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center ring-4 ring-white shadow-2xs border border-slate-200">
            <Icon name="lock" size={14} />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex-1 shadow-2xs opacity-75">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-800 font-semibold">
                Bước 5: Nghiệm thu Before/After &amp; Ký số đóng đợt (WF-10)
              </span>
              <span className="font-mono text-[11px] text-slate-400">Giai đoạn cuối</span>
            </div>
            <p className="text-xs text-slate-500">
              Supervisor đối soát ảnh trước/sau sửa chữa, kiểm tra đạt 100% và ký số giải ngân tiền bảo hành.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
