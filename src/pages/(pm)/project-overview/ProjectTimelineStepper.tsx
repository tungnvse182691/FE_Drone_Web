import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

interface ProjectTimelineStepperProps {
  project: HubProject
  basePath: string
  isSupervisor?: boolean
  onNavigate: (path: string) => void
}

export const ProjectTimelineStepper: React.FC<ProjectTimelineStepperProps> = ({
  project,
  basePath,
  isSupervisor = false,
  onNavigate
}) => {
  const isAlignmentDone = project.length_km > 0
  const isClosed = project.status === 'CLOSED'
  const isSuspended = project.status === 'RESTRICTED'
  const isOperating = isAlignmentDone && !isClosed && !isSuspended

  // Xác định giai đoạn hiện tại (1 - 4)
  const isEarlyClosedWithoutAlignment = isClosed && !isAlignmentDone
  const currentStageNum = isClosed ? 4 : isSuspended ? 3 : isAlignmentDone ? 3 : 2
  const currentStageLabel = isClosed
    ? (isEarlyClosedWithoutAlignment ? 'Đã đóng hồ sơ trước hạn (Chưa nạp tuyến)' : 'Giai đoạn: 04/04 • Đã đóng dự án')
    : isSuspended
    ? 'Giai đoạn: 03/04 • Tạm dừng vận hành'
    : isAlignmentDone
    ? 'Giai đoạn: 03/04 • Đang vận hành bảo hành'
    : 'Giai đoạn: 02/04 • Thiết lập tim tuyến'

  return (
    <div className="relative bg-white border border-[#E2E5E9] rounded-[20px] p-6 shadow-2xs overflow-hidden flex flex-col gap-4 font-body">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] to-slate-200" />
      
      {/* Header card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-[#EDEFF2]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227] ring-4 ring-[#C9A227]/20" />
            <h2 className="text-base font-bold text-slate-900 font-headline">
              Vòng đời quản lý dự án bảo hành
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình chuẩn hóa 4 giai đoạn từ bàn giao tiếp nhận đến kết thúc nghĩa vụ bảo hành.
          </p>
        </div>
        <span className="font-mono text-xs px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 shrink-0">
          {currentStageLabel}
        </span>
      </div>

      {/* Vertical Stepper: 4 Giai đoạn chuẩn */}
      <div className="relative pl-6 sm:pl-8 flex flex-col gap-4 pt-2">
        <div className="absolute left-3 sm:left-4 top-3 bottom-4 w-0.5 bg-[#E2E5E9] -translate-x-1/2" />

        {/* GIAI ĐOẠN 1: Khởi tạo dự án & Bàn giao tuyến */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-50 text-[#047857] flex items-center justify-center ring-4 ring-white shadow-2xs border border-emerald-200">
            <Icon name="check" size={14} />
          </div>
          <div className="bg-slate-50 border border-[#E2E5E9] rounded-xl p-3.5 flex-1 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-900 font-bold">
                Giai đoạn 1: Tiếp nhận bàn giao &amp; Khởi tạo dự án
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                {project.handover_date || 'Bàn giao khởi tạo'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Giám sát trưởng đã lập hồ sơ quản lý công trình và bàn giao quyền điều phối tuyến cho Chỉ huy trưởng{' '}
              <strong className="text-slate-900">{project.pm_name}</strong> ({project.pm_email}).
            </p>
          </div>
        </div>

        {/* GIAI ĐOẠN 2: Thiết lập & Phê duyệt tim tuyến */}
        <div className="relative flex items-start gap-4">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs border ${
              isAlignmentDone
                ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                : isClosed
                ? 'bg-slate-100 text-slate-400 border-slate-300'
                : 'bg-amber-50 text-[#C9A227] border-amber-200 animate-pulse'
            }`}
          >
            <Icon name={isAlignmentDone ? 'check' : isClosed ? 'remove' : 'play_arrow'} size={14} />
          </div>
          <div
            className={`border rounded-xl p-3.5 flex-1 shadow-2xs ${
              isAlignmentDone
                ? 'bg-slate-50 border-[#E2E5E9]'
                : isClosed
                ? 'bg-slate-50/70 border-slate-200'
                : 'bg-amber-50/40 border-amber-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-900 font-bold">
                Giai đoạn 2: Thiết lập &amp; Phê duyệt tim tuyến (Baseline trắc địa)
              </span>
              <span className={`font-mono text-[11px] font-semibold ${
                isAlignmentDone
                  ? 'text-emerald-700'
                  : isClosed
                  ? 'text-slate-500'
                  : 'text-[#8C6D1F]'
              }`}>
                {isAlignmentDone
                  ? 'Đã duyệt & khóa SHA-256'
                  : isClosed
                  ? 'Đã đóng trước khi thiết lập tuyến'
                  : 'Đang chờ PM nạp tuyến'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isAlignmentDone ? (
                <>
                  Đã chuẩn hóa tim tuyến trục chính dài <strong className="text-slate-900">{project.length_km} km</strong>, hệ quy chiếu WGS84 EPSG:4326. Giám sát đã ký duyệt khóa mốc lý trình bất biến.
                </>
              ) : isClosed ? (
                <>
                  Dự án đã được Giám sát thực hiện thủ tục đóng kết thúc bảo hành trước hạn khi chưa phát sinh hồ sơ tim tuyến trắc địa.
                </>
              ) : (
                <>PM cần nạp tệp tọa độ KML / GeoJSON và thiết lập phân đoạn để Giám sát thẩm duyệt khóa mốc lý trình.</>
              )}
            </p>
            {!isAlignmentDone && !isClosed && (
              <div className="mt-2.5">
                {!isSupervisor ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#8C6D1F] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Icon name="alt_route" size={14} />
                    <span>Vào thiết lập tim tuyến ngay</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-100/70 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
                    <Icon name="schedule" size={14} />
                    <span>Trách nhiệm: Chỉ huy trưởng PM đang tiến hành nạp hồ sơ tim tuyến</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* GIAI ĐOẠN 3: Vận hành theo dõi & Khắc phục bảo hành */}
        <div className="relative flex items-start gap-4">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs border ${
              isClosed
                ? (isAlignmentDone ? 'bg-emerald-50 text-[#047857] border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-300')
                : isSuspended
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : isOperating
                ? 'bg-amber-500 text-white border-amber-300 ring-amber-200/50'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            {isClosed ? (
              isAlignmentDone ? <Icon name="check" size={14} /> : <Icon name="remove" size={14} />
            ) : isSuspended ? (
              <Icon name="pause" size={14} />
            ) : isOperating ? (
              <span className="text-[11px] font-bold">3</span>
            ) : (
              <Icon name="lock" size={14} />
            )}
          </div>
          <div
            className={`border rounded-xl p-3.5 flex-1 shadow-2xs ${
              isSuspended
                ? 'bg-amber-50/50 border-amber-300'
                : isOperating
                ? 'bg-amber-50/30 border-amber-200/80'
                : isClosed
                ? 'bg-slate-50 border-[#E2E5E9]'
                : 'bg-slate-50 border-[#E2E5E9] opacity-75'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                <span>Giai đoạn 3: Vận hành theo dõi &amp; Khắc phục hư hỏng</span>
                {isOperating && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                )}
                {isSuspended && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                    TẠM DỪNG
                  </span>
                )}
              </span>
              <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                isClosed
                  ? (isAlignmentDone ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-slate-100 border-slate-200')
                  : isSuspended
                  ? 'text-amber-800 bg-amber-100/80 border-amber-200'
                  : 'text-amber-800 bg-amber-100/80 border-amber-200'
              }`}>
                {isClosed
                  ? (isAlignmentDone ? 'Đã hoàn thành nghĩa vụ' : 'Không phát sinh chu trình vận hành')
                  : isSuspended
                  ? 'Chu trình tạm ngưng vận hành'
                  : `Chu trình lặp • Còn ${project.days_remaining} ngày`}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
              {isClosed && !isAlignmentDone ? (
                <>Dự án kết thúc sớm và đóng băng hồ sơ lưu trữ trước khi bước vào chu trình theo dõi định kỳ và khảo sát bay Drone.</>
              ) : isSuspended ? (
                <>Dự án đang tạm dừng vận hành. Các hoạt động tạo yêu cầu bay Drone và lập gói sửa chữa mới đang tạm ngưng theo lệnh điều hành.</>
              ) : (
                <>Chu trình tuần hoàn trong suốt thời hạn bảo hành: Khảo sát Drone AI phát hiện nứt vỡ, PM gom gói sửa chữa kỹ thuật và Giám sát nghiệm thu hiện trường đạt 100%.</>
              )}
            </p>

            {/* Các thẻ chỉ số hoạt động lặp lại của dự án */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/70">
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">Gói sửa chữa</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {project.repair_packages} gói kỹ thuật
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">Khiếm khuyết mở</span>
                <span className={`text-xs font-mono font-bold ${project.open_defects > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {project.open_defects} điểm tồn đọng
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">Thời hạn đã qua</span>
                <span className="text-xs font-mono font-bold text-amber-900">
                  {project.warranty_passed_percent}% thời gian
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col">
                <span className="text-[10px] text-slate-500 font-medium">Hết hạn bảo hành</span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  {project.warranty_end_date || '3 năm từ bàn giao'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GIAI ĐOẠN 4: Nghiệm thu đóng dự án & Lưu trữ hồ sơ số */}
        <div className="relative flex items-start gap-4">
          <div
            className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs border ${
              isClosed
                ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            <Icon name={isClosed ? 'check' : 'lock'} size={14} />
          </div>
          <div
            className={`border rounded-xl p-3.5 flex-1 shadow-2xs ${
              isClosed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-[#E2E5E9] opacity-75'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs text-slate-900 font-bold">
                Giai đoạn 4: Nghiệm thu đóng dự án &amp; Lưu trữ hồ sơ số
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-semibold">
                {isClosed ? (isEarlyClosedWithoutAlignment ? 'Đã đóng trước hạn' : 'Đã đóng dự án') : 'Hết hạn bảo hành & Sạch 100% lỗi'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isClosed ? (
                <>
                  Dự án đã chính thức đóng kết thúc bảo hành vào ngày{' '}
                  <strong>
                    {project.closed_at
                      ? new Date(project.closed_at).toLocaleDateString('vi-VN')
                      : 'vừa qua'}
                  </strong>{' '}
                  bởi <strong>{project.closed_by || 'Giám sát viên'}</strong>. Toàn bộ hồ sơ trắc địa, nhật ký bay và nghiệm thu được chuyển sang kho số lưu trữ 5 năm.
                </>
              ) : (
                <>
                  Khi hết hạn bảo hành công trình và không còn bất kỳ khiếm khuyết nào tồn đọng (0 lỗi), Giám sát trưởng cùng Chủ đầu tư kiểm tra tổng thể lần cuối, ký số biên bản đóng dự án và chuyển sang chế độ lưu trữ số.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

