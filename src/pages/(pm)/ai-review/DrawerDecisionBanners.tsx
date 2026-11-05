import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerDecisionBannersProps {
  selectedCase: TriageCase
  setSelectedCaseId: (id: string) => void
  onUnlinkReport: (childId: string) => void
  onResetConclusion: (c?: TriageCase) => void
  isSupervisor?: boolean
}

export const DrawerDecisionBanners: React.FC<DrawerDecisionBannersProps> = ({
  selectedCase,
  setSelectedCaseId,
  onUnlinkReport,
  onResetConclusion,
  isSupervisor = false,
}) => {
  const navigate = useNavigate()
  const basePath = isSupervisor ? '/sup' : '/pm'

  const severityLabel =
    selectedCase.severity === 'UNKNOWN' ? 'Chưa xác định' : selectedCase.severity === 'CRITICAL'
      ? 'Khẩn cấp'
      : selectedCase.severity === 'HIGH'
        ? 'Nghiêm trọng'
        : selectedCase.severity === 'MEDIUM'
          ? 'Vừa'
          : 'Nhẹ'

  const urgencyLabel =
    selectedCase.urgency === 'UNKNOWN' ? 'Chưa xác định' : selectedCase.urgency === 'EMERGENCY'
      ? 'Đặc biệt khẩn cấp'
      : selectedCase.urgency === 'URGENT'
        ? 'Khẩn cấp (24-48h)'
        : 'Bình thường'

  return (
    <>
      {(selectedCase.master_case_id || selectedCase.status === 'MERGED' || selectedCase.decision_kind === 'LINK_EXISTING') && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-purple-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Icon name="link" size={20} className="text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">
                {selectedCase.decision_kind === 'LINK_EXISTING' && selectedCase.linked_defect_id ? `ĐÃ LIÊN KẾT DEFECT #DEF-${selectedCase.linked_defect_id.slice(0, 8).toUpperCase()}` : 'HỒ SƠ CÓ LIÊN KẾT BÁO CÁO'}
              </span>
              <span className="text-[11px] text-purple-700">
                Liên kết báo cáo giữa các Case không xác nhận đã liên kết hoặc thẩm định một Defect.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedCase.master_case_id ? (
              <button
                type="button"
                onClick={() => setSelectedCaseId(selectedCase.master_case_id!)}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>Xem hồ sơ gốc</span>
                <Icon name="arrow_forward" size={14} />
              </button>
            ) : (
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg border border-purple-200">
                Đã liên kết CSDL
              </span>
            )}
            {!isSupervisor && selectedCase.master_case_id && (
              <button
                type="button"
                onClick={() => onUnlinkReport(selectedCase.id)}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-purple-800 border border-purple-200 text-xs font-semibold rounded-lg cursor-pointer"
                title="Tách thành hồ sơ riêng"
              >
                Tách riêng
              </button>
            )}
          </div>
        </div>
      )}

      {selectedCase.conclusion === 'DEFECT_FOUND' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check_circle" size={20} className="text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: ĐÃ XÁC MINH CÓ KHIẾM KHUYẾT (HỢP LỆ)</span>
              <span className="text-[11px] text-emerald-700">
                Mức độ: <strong>{severityLabel}</strong> • Khẩn cấp: <strong>{urgencyLabel}</strong>
                {selectedCase.area_sqm > 0 && (
                  <> • S: <strong>{selectedCase.area_sqm} m²</strong></>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {!isSupervisor && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/proposals`)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
                  title="Gom vào gói đề xuất sửa chữa kỹ thuật (Repair Package)"
                >
                  <span>Gom gói sửa chữa</span>
                  <Icon name="arrow_forward" size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onResetConclusion(selectedCase)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] rounded-lg cursor-pointer"
                  title="Đặt lại để thẩm định lại"
                >
                  Sửa lại
                </button>
              </>
            )}
            {isSupervisor && (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300">
                Chờ PM lập đợt sửa
              </span>
            )}
          </div>
        </div>
      )}

      {selectedCase.conclusion === 'NO_DEFECT' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between text-red-950 animate-in fade-in">
          <div className="flex items-start gap-2">
            <Icon name="close" size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT (BÁO SAI)</span>
              <p className="text-[11px] text-red-800 mt-0.5 italic">
                Lý do kỹ thuật: "{selectedCase.conclusion_reason || selectedCase.pm_notes}"
              </p>
            </div>
          </div>
          {!isSupervisor && (
            <button
              type="button"
              onClick={() => onResetConclusion(selectedCase)}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
            >
              Thẩm định lại
            </button>
          )}
        </div>
      )}

      {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between text-amber-950 animate-in fade-in">
          <div className="flex items-start gap-2">
            <Icon name="warning" size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: NGOÀI PHẠM VI BẢO HÀNH</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.
              </p>
            </div>
          </div>
          {!isSupervisor && (
            <button
              type="button"
              onClick={() => onResetConclusion(selectedCase)}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
            >
              Thẩm định lại
            </button>
          )}
        </div>
      )}

      {selectedCase.status === 'NEED_SURVEY' && <div role="status">
        <strong>Yêu cầu bổ sung bằng chứng</strong>
        <p>{selectedCase.conclusion_reason || 'Chưa có lý do trong dữ liệu server.'}</p>
        <p>Chưa có dữ liệu nhiệm vụ FIELD/Drone được tạo hoặc giao từ kết luận này.</p>
      </div>}

      {selectedCase.is_published && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1 text-sky-950 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-sky-800 flex items-center gap-1.5">
              <Icon name="campaign" size={16} className="text-sky-600" />
              <span>Đã công bố tiến độ cho người dân</span>
            </span>
            <span className="text-[10px] text-sky-600 font-mono">{selectedCase.published_at}</span>
          </div>
          <p className="text-[11px] text-sky-900 italic bg-white p-2 rounded-lg border border-sky-100">
            "{selectedCase.public_notice}"
          </p>
        </div>
      )}
    </>
  )
}
