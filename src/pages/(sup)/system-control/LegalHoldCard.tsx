import React from 'react'
import { LegalHoldProject } from '../../../types/domain'

export interface LegalHoldCardProps {
  legalHoldProjects: LegalHoldProject[]
  isSupervisor: boolean
  handleToggleLegalHold: (projectId: string) => void
  onViewProjectDetail?: (project: LegalHoldProject) => void
}

export const LegalHoldCard: React.FC<LegalHoldCardProps> = ({
  legalHoldProjects,
  isSupervisor,
  handleToggleLegalHold,
  onViewProjectDetail
}) => {
  return (
    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-rose-600">
            gavel
          </span>
          <h2 className="text-sm font-bold text-slate-900">
            Cơ Chế Phong Tỏa Pháp Lý (Legal Hold)
          </h2>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
          Lưu trữ bảo hành
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Thiết lập giữ nguyên trạng hồ sơ công trình phục vụ các đoàn thanh tra, kiểm toán nhà nước. Khi chế độ phong tỏa được kích hoạt, hệ thống sẽ tự động khóa cứng và nghiêm cấm mọi thao tác xóa dữ liệu.
      </p>

      {/* Danh sách các dự án và trạng thái Legal Hold */}
      <div className="space-y-3">
        {legalHoldProjects.map((proj) => (
          <div
            key={proj.project_id}
            onClick={() => onViewProjectDetail?.(proj)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-xs hover:border-slate-300 ${
              proj.is_legal_hold
                ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50/70'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
            title="Nhấp để xem chi tiết hồ sơ lưu trữ và quyết định phong tỏa pháp lý"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-slate-900 hover:text-brand-gold transition-colors">
                    {proj.project_name}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600 font-semibold">
                    {proj.project_code}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">
                    info
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Hạn bảo hành: <span className="font-semibold text-slate-800">{proj.warranty_end_date}</span>{' '}
                  {proj.is_warranty_expired ? (
                    <span className="text-emerald-700 font-semibold">
                      (Hết hạn đã {proj.years_since_warranty_end.toFixed(1)} năm)
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium">(Đang trong thời hạn bảo hành)</span>
                  )}
                </div>
              </div>

              {/* Điều khiển Bật/Tắt Legal Hold (chặn click lan ra ngoài thẻ) */}
              <div
                className="flex flex-col items-end gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {isSupervisor ? (
                  <>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={proj.is_legal_hold}
                        onChange={() => handleToggleLegalHold(proj.project_id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        proj.is_legal_hold ? 'text-rose-700' : 'text-slate-500'
                      }`}
                    >
                      {proj.is_legal_hold ? 'PHONG TỎA: BẬT' : 'BÌNH THƯỜNG'}
                    </span>
                  </>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      proj.is_legal_hold
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-slate-200/70 text-slate-600 border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {proj.is_legal_hold ? 'lock' : 'check'}
                    </span>
                    {proj.is_legal_hold ? 'ĐANG PHONG TỎA' : 'BÌNH THƯỜNG'}
                  </span>
                )}
              </div>
            </div>

            {/* Chi tiết lệnh thanh tra nếu đang bật */}
            {proj.is_legal_hold && (
              <div className="mt-2.5 pt-2 border-t border-rose-200 text-[11px] space-y-1 text-rose-800">
                <div className="flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[15px] text-rose-600">lock</span>
                  <span>{proj.hold_reason}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  Cơ quan: {proj.hold_authority} • VB: {proj.hold_reference} (từ {proj.hold_since})
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chú thích lưu trữ */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <span className="material-symbols-outlined text-[16px] text-brand-gold shrink-0 mt-0.5">
          info
        </span>
        <p className="leading-relaxed">
          Hồ sơ công trình bắt buộc phải được lưu trữ tối thiểu đến hết thời hạn bảo hành cộng thêm <strong>5 năm</strong>. Mọi đề xuất xóa dữ liệu chỉ có hiệu lực khi được <strong>Giám sát phê duyệt</strong>; các hồ sơ đang trong diện phong tỏa thanh tra bị nghiêm cấm xóa vĩnh viễn. Nhấp vào từng dự án để xem chi tiết hồ sơ lưu trữ.
        </p>
      </div>
    </div>
  )
}
