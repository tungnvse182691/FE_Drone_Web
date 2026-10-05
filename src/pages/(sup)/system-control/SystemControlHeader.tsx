import React from 'react'
import { ShieldCheck, Lock, Trash2, UserPlus, Gavel } from 'lucide-react'
import { LegalHoldProject } from '../../../types/domain'

interface SystemControlHeaderProps {
  isSupervisor: boolean
  activeLegalHoldProject?: LegalHoldProject
  onOpenCreateDeletion: () => void
  onOpenAddPersonnel: () => void
  onViewLegalHoldDetail: () => void
}

export const SystemControlHeader: React.FC<SystemControlHeaderProps> = ({
  isSupervisor,
  activeLegalHoldProject,
  onOpenCreateDeletion,
  onOpenAddPersonnel,
  onViewLegalHoldDetail
}) => {
  return (
    <>
      {/* 1. TOP BREADCRUMB & HEADER SECTION */}
      <div className="flex flex-col gap-3 bg-white border border-[#E2E5E9] p-5 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs text-[#555F6F] font-medium">
            <span className="hover:text-[#151C27] transition-colors cursor-pointer">
              Trang chủ
            </span>
            <span className="text-[#CAC7B5]">/</span>
            <span className="hover:text-[#151C27] transition-colors cursor-pointer">Cấu hình</span>
            <span className="text-[#CAC7B5]">/</span>
            <span className="text-[#151C27] font-semibold">Quản trị hệ thống &amp; Lưu trữ pháp lý</span>
          </nav>

          <div className="flex items-center gap-2">
            {isSupervisor ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151C27] text-white font-mono text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                SUPERVISOR: TOÀN QUYỀN QUẢN TRỊ ADMIN (BR-02)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9E3F6] text-[#3D4756] font-mono text-xs font-bold shadow-sm border border-[#BAC7D9]">
                <Lock className="w-3.5 h-3.5" />
                PROJECT MANAGER: QUẢN TRỊ DỰ ÁN ĐƯỢC GIAO
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF6E9] border border-[#F3E6C4] text-[#8C6D15] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
              QUY CHUẨN BR-45 &amp; ISO 27001
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FBF6E9] text-[#8C6D15] font-mono text-xs font-bold border border-[#F3E6C4]">
                Mã màn hình: WF-12
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F0F2F5] text-[#555F6F] font-mono text-xs font-medium border border-[#E2E5E9]">
                Căn cứ: FR-02, FR-35, FR-36, BR-45, UAT-09, UAT-10
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#151C27] tracking-tight">
              {isSupervisor
                ? 'Quản trị hệ thống, Kiểm soát AI & Phong tỏa pháp lý'
                : 'Lưu trữ bảo hành, Nhân sự dự án & Phong tỏa pháp lý'}
            </h1>
            <p className="text-sm text-[#555F6F] leading-relaxed">
              {isSupervisor
                ? 'Quản lý phân quyền tài khoản, thu hồi phiên làm việc tức thì và kích hoạt chế độ bảo lưu chứng cứ pháp lý (Legal Hold) theo quy định lưu trữ bảo hành công trình.'
                : 'Theo dõi tình trạng bảo lưu chứng cứ kỹ thuật, danh sách nhân sự phụ trách dự án và lập yêu cầu xóa dữ liệu hồ sơ đã hết hạn bảo hành (+5 năm).'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenCreateDeletion}
              className="px-4 py-2.5 rounded-lg border border-[#E2E5E9] bg-white hover:bg-[#F8F9FA] hover:border-[#C9A227] hover:text-[#C9A227] text-[#374151] font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
              <span>Lập yêu cầu xóa dữ liệu</span>
            </button>

            {isSupervisor && (
              <button
                type="button"
                onClick={onOpenAddPersonnel}
                className="px-4 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B38E1F] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Thêm nhân sự vào dự án</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CẢNH BÁO LEGAL HOLD NỔI BẬT */}
      {activeLegalHoldProject && (
        <div className="p-4 rounded-xl bg-[#FFDAD6] border border-[#FFCDD2] text-[#BA1A1A] flex flex-col md:flex-row items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#BA1A1A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Gavel className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm text-[#93000A]">
                LỆNH PHONG TỎA PHÁP LÝ (LEGAL HOLD = TRUE) ĐANG HIỆU LỰC
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#BA1A1A] font-mono text-[11px] font-bold border border-[#FFCDD2]">
                {activeLegalHoldProject.project_name}
              </span>
              <span className="font-mono text-xs text-[#93000A] font-semibold">
                {activeLegalHoldProject.hold_reference}
              </span>
            </div>
            <p className="text-xs text-[#93000A]/90 leading-relaxed">
              Dự án đang trong diện thanh tra phục vụ đối chiếu của <strong>{activeLegalHoldProject.hold_authority}</strong>. Theo quy tắc <strong>BR-45</strong>, toàn bộ quyền xóa dữ liệu đối với dự án này bị khóa cứng trên toàn hệ thống (mã lỗi <code className="bg-white/70 px-1 py-0.5 rounded font-bold">LEGAL_HOLD_ACTIVE</code>). Mọi hành vi tự ý tiêu hủy chứng cứ kỹ thuật đều bị nghiêm cấm.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewLegalHoldDetail}
            className="px-3.5 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold shrink-0 transition-colors shadow-sm self-center"
          >
            Xem chi tiết Legal Hold
          </button>
        </div>
      )}
    </>
  )
}
