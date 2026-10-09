import React from 'react'
import { LegalHoldProject } from '../../../types/domain'

export interface ProjectRetentionDetailModalProps {
  project: LegalHoldProject | null
  isOpen: boolean
  onClose: () => void
  onOpenCreateDeletionForProject?: (projectId: string) => void
}

export const ProjectRetentionDetailModal: React.FC<ProjectRetentionDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenCreateDeletionForProject
}) => {
  if (!isOpen || !project) return null

  const isEligible = project.is_warranty_expired && project.years_since_warranty_end >= 5 && !project.is_legal_hold

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-brand-gold">
              folder_managed
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Chi Tiết Hồ Sơ &amp; Tình Trạng Lưu Trữ
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {project.project_code} • {project.project_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Trạng thái pháp lý nổi bật */}
        <div className="px-5 pt-4 pb-1">
          {project.is_legal_hold ? (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <span className="material-symbols-outlined text-[18px] text-rose-600">
                  gavel
                </span>
                <span>ĐANG CÓ LỆNH PHONG TỎA PHÁP LÝ (LEGAL HOLD)</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Hồ sơ công trình đang chịu sự thanh tra, kiểm tra đột xuất. Toàn bộ chức năng đề xuất xóa hoặc tiêu hủy dữ liệu đối với dự án này bị khóa cứng trên toàn hệ thống.
              </p>
              {project.hold_reason && (
                <div className="mt-2 pt-2 border-t border-rose-200 text-[11px] space-y-0.5 text-slate-700">
                  <div><strong>Nội dung thanh tra:</strong> {project.hold_reason}</div>
                  <div><strong>Cơ quan yêu cầu:</strong> {project.hold_authority}</div>
                  <div><strong>Số văn bản:</strong> <span className="font-mono font-semibold">{project.hold_reference}</span> (từ {project.hold_since})</div>
                </div>
              )}
            </div>
          ) : isEligible ? (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                check_circle
              </span>
              <div>
                <span className="font-bold block">ĐỦ ĐIỀU KIỆN ĐỀ XUẤT HỦY DỮ LIỆU</span>
                <span className="text-[11px] text-emerald-700">
                  Công trình đã kết thúc bảo hành trên 5 năm và không có tranh chấp pháp lý.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                schedule
              </span>
              <div>
                <span className="font-bold block">ĐANG TRONG THỜI HẠN LƯU TRỮ PHÁP LÝ</span>
                <span className="text-[11px] text-slate-600">
                  {project.is_warranty_expired
                    ? `Đã hết hạn bảo hành ${project.years_since_warranty_end.toFixed(1)} năm (yêu cầu tối thiểu 5 năm).`
                    : 'Công trình đang trong thời hạn bảo hành. Không được phép đề xuất hủy dữ liệu.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bảng chi tiết thông số */}
        <div className="p-5 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 text-[11px] block">Mã dự án:</span>
              <span className="font-mono font-semibold text-slate-800">{project.project_code}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Thời hạn bảo hành:</span>
              <span className="font-semibold text-slate-800">{project.warranty_end_date}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Tình trạng bảo hành:</span>
              <span className="font-semibold text-slate-800">
                {project.is_warranty_expired ? 'Đã hết bảo hành' : 'Đang bảo hành'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Thời gian sau bảo hành:</span>
              <span className="font-semibold text-brand-goldDark">
                {project.years_since_warranty_end > 0 ? `${project.years_since_warranty_end.toFixed(1)} năm` : '0 năm'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-brand-gold">info</span>
              <span>Quy định thời hạn lưu trữ hồ sơ công trình:</span>
            </div>
            <p className="leading-relaxed">
              Theo quy định quản lý chất lượng công trình giao thông và quy tắc <strong>BR-45</strong>, toàn bộ ảnh khảo sát Drone, video hành trình tuần đường, hồ sơ đo đạc và biên bản nghiệm thu phải được lưu trữ tối thiểu <strong>hết hạn bảo hành + 5 năm</strong>.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Đóng
          </button>

          {isEligible && onOpenCreateDeletionForProject && (
            <button
              type="button"
              onClick={() => {
                onOpenCreateDeletionForProject(project.project_id)
                onClose()
              }}
              className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldDark text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span>Lập đề xuất hủy hồ sơ này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
