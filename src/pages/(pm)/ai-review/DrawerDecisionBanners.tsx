import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerDecisionBannersProps {
  selectedCase: TriageCase
  setSelectedCaseId: (id: string) => void
  onUnlinkReport: (childId: string) => void
  onResetConclusion: (c?: TriageCase) => void
}

export const DrawerDecisionBanners: React.FC<DrawerDecisionBannersProps> = ({
  selectedCase,
  setSelectedCaseId,
  onUnlinkReport,
  onResetConclusion,
}) => {
  const navigate = useNavigate()

  return (
    <>
      {selectedCase.master_case_id && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-purple-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Icon name="link" size={20} className="text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">HỒ SƠ ĐÃ ĐƯỢC GỘP VÀO MASTER CASE</span>
              <span className="text-[11px] text-purple-700">
                Dữ liệu được hợp nhất để không tạo trùng lệnh thi công (BR-30).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCaseId(selectedCase.master_case_id!)}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <span>Xem Case Gốc</span>
              <Icon name="arrow_forward" size={14} />
            </button>
            <button
              type="button"
              onClick={() => onUnlinkReport(selectedCase.id)}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-purple-800 border border-purple-200 text-xs font-semibold rounded-lg cursor-pointer"
              title="Tách thành hồ sơ riêng"
            >
              Tách riêng
            </button>
          </div>
        </div>
      )}

      {selectedCase.conclusion === 'DEFECT_FOUND' && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Icon name="check_circle" size={20} className="text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: ĐÃ XÁC MINH CÓ KHIẾM KHUYẾT (DEFECT_FOUND)</span>
              <span className="text-[11px] text-emerald-700">
                Mức độ: <strong>{selectedCase.severity}</strong> • Khẩn cấp: <strong>{selectedCase.urgency}</strong> • S:{' '}
                <strong>{selectedCase.area_sqm} m²</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate('/pm/proposals')}
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
          </div>
        </div>
      )}

      {selectedCase.conclusion === 'NO_DEFECT' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between text-red-950 animate-in fade-in">
          <div className="flex items-start gap-2">
            <Icon name="close" size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: KHÔNG CÓ KHIẾM KHUYẾT (NO_DEFECT - BÁO SAI)</span>
              <p className="text-[11px] text-red-800 mt-0.5 italic">
                Lý do kỹ thuật (BR-39): "{selectedCase.conclusion_reason || selectedCase.pm_notes}"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onResetConclusion(selectedCase)}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
          >
            Thẩm định lại
          </button>
        </div>
      )}

      {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between text-amber-950 animate-in fade-in">
          <div className="flex items-start gap-2">
            <Icon name="warning" size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs block">KẾT LUẬN: NGOÀI PHẠM VI BẢO HÀNH (OUT_OF_SCOPE)</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Vị trí nằm ngoài phạm vi đoạn đường thuộc hợp đồng bảo hành của Hoàng Hải.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onResetConclusion(selectedCase)}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
          >
            Thẩm định lại
          </button>
        </div>
      )}

      {selectedCase.status === 'NEED_SURVEY' && (
        <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl space-y-2.5 text-blue-950 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="photo_camera" size={20} className="text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-xs block text-blue-900">
                  LỆNH KHẢO SÁT &amp; ĐO ĐẠC BỔ SUNG (WF-11)
                </span>
                <span className="text-[11px] text-blue-700">
                  {selectedCase.survey_assignment
                    ? selectedCase.survey_assignment.mode === 'MEASURE_ONLY'
                      ? '📐 Đo đạc hiện trường bằng thước chuyên dụng (MEASURE_ONLY)'
                      : '🛸 Bay quét Drone chụp bổ sung (DRONE_RESURVEY)'
                    : 'Đã chuyển sang hàng đợi nhiệm vụ khảo sát thực địa.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/pm/field-tasks?tab=MEASUREMENTS&highlightCode=${encodeURIComponent(selectedCase.code)}`
                )
              }
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Xem nhiệm vụ</span>
              <Icon name="arrow_forward" size={14} />
            </button>
          </div>

          {selectedCase.survey_assignment && (
            <div className="p-2.5 bg-white rounded-lg border border-blue-200/80 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Đơn vị nhận việc:</span>
                <span className="font-bold text-blue-950">{selectedCase.survey_assignment.assigned_crew}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Hạn cam kết SLA:</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                  Trong {selectedCase.survey_assignment.sla_hours} giờ
                </span>
              </div>
              {selectedCase.survey_assignment.reason && (
                <div className="pt-1.5 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500 font-medium block">Lý do yêu cầu:</span>
                  <p className="italic text-slate-800 mt-0.5">"{selectedCase.survey_assignment.reason}"</p>
                </div>
              )}
              <div className="text-[10px] text-slate-400 text-right pt-0.5">
                Thời gian giao: {selectedCase.survey_assignment.created_at}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedCase.is_published && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1 text-sky-950 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-sky-800 flex items-center gap-1.5">
              <Icon name="campaign" size={16} className="text-sky-600" />
              <span>Đã công bố tiến độ cho người dân (PA07)</span>
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
