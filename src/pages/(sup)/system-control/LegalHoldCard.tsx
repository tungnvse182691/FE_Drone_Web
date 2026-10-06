import React from 'react'
import { Gavel, Lock, Info } from 'lucide-react'
import { LegalHoldProject } from '../../../types/domain'

export interface LegalHoldCardProps {
  legalHoldProjects: LegalHoldProject[]
  isSupervisor: boolean
  handleToggleLegalHold: (projectId: string) => void
}

export const LegalHoldCard: React.FC<LegalHoldCardProps> = ({
  legalHoldProjects,
  isSupervisor,
  handleToggleLegalHold,
}) => {
  return (
    <div className="lg:col-span-5 bg-white border border-brand-border rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-[#BA1A1A]" />
          <h2 className="text-sm font-bold text-[#151C27]">
            Cơ chế Đóng băng pháp lý (Legal Hold)
          </h2>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#FFDAD6] text-[#BA1A1A] font-mono text-[11px] font-bold border border-[#FFCDD2]">
          Quy tắc BR-45
        </span>
      </div>

      <p className="text-xs text-[#555F6F] leading-relaxed">
        Thiết lập giữ hồ sơ tranh chấp thanh tra phục vụ các cơ quan quản lý nhà nước (Bộ GTVT, Cục ĐBVN). Khi kích hoạt, chức năng xóa đối với dự án này bị vô hiệu hóa hoàn toàn trên toàn bộ hệ thống.
      </p>

      {/* Danh sách các dự án và công tắc Legal Hold */}
      <div className="space-y-3">
        {legalHoldProjects.map((proj) => (
          <div
            key={proj.project_id}
            className={`p-3.5 rounded-xl border transition-all ${
              proj.is_legal_hold
                ? 'bg-[#FFDAD6]/30 border-[#FFCDD2]'
                : 'bg-brand-surfaceAlt border-brand-border'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#151C27]">{proj.project_name}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white rounded border border-brand-border text-[#555F6F]">
                    {proj.project_code}
                  </span>
                </div>
                <div className="text-[11px] text-[#555F6F]">
                  Hạn bảo hành: <span className="font-semibold text-[#151C27]">{proj.warranty_end_date}</span>{' '}
                  {proj.is_warranty_expired ? (
                    <span className="text-[#059669] font-semibold">
                      (Hết hạn đã {proj.years_since_warranty_end.toFixed(1)} năm)
                    </span>
                  ) : (
                    <span className="text-[#3D4756] font-medium">(Đang trong bảo hành)</span>
                  )}
                </div>
              </div>

              {/* Công tắc Bật/Tắt Legal Hold */}
              <div className="flex flex-col items-end gap-1">
                <label className={`relative inline-flex items-center ${isSupervisor ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <input
                    type="checkbox"
                    disabled={!isSupervisor}
                    checked={proj.is_legal_hold}
                    onChange={() => handleToggleLegalHold(proj.project_id)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-10 h-5 bg-[#DCE2F3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                      !isSupervisor ? 'opacity-50' : ''
                    } peer-checked:bg-brand-gold`}
                  ></div>
                </label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    proj.is_legal_hold ? 'text-[#BA1A1A]' : 'text-[#7A7768]'
                  }`}
                >
                  {proj.is_legal_hold ? 'LEGAL HOLD: BẬT' : 'BÌNH THƯỜNG'}
                </span>
              </div>
            </div>

            {/* Chi tiết lệnh thanh tra nếu đang bật */}
            {proj.is_legal_hold && (
              <div className="mt-2.5 pt-2 border-t border-[#FFCDD2] text-[11px] space-y-1 text-[#BA1A1A]">
                <div className="flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3 text-[#BA1A1A]" />
                  <span>{proj.hold_reason}</span>
                </div>
                <div className="text-[10px] text-[#555F6F] font-mono">
                  Cơ quan: {proj.hold_authority} • VB: {proj.hold_reference} (từ {proj.hold_since})
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chú thích pháp lý Retention BR-45 */}
      <div className="p-3 bg-brand-surfaceAlt rounded-xl border border-brand-border text-[11px] text-[#555F6F] flex items-start gap-2">
        <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Hồ sơ dự án phải được lưu trữ tối thiểu đến hết thời hạn bảo hành cộng thêm <strong>5 năm</strong>. Lệnh xóa dữ liệu chỉ có hiệu lực khi do <strong>Supervisor phê duyệt</strong>; mọi hồ sơ có tranh chấp (Legal Hold) bị nghiêm cấm xóa vĩnh viễn.
        </p>
      </div>
    </div>
  )
}
