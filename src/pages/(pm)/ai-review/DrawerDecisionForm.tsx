import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerDecisionFormProps {
  selectedCase: TriageCase
  currentSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  setCurrentSeverity: (s: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => void
  currentUrgency?: 'NORMAL' | 'URGENT' | 'EMERGENCY'
  setCurrentUrgency?: (u: 'NORMAL' | 'URGENT' | 'EMERGENCY') => void
  currentArea: number
  setCurrentArea: (a: number) => void
  currentDepth: number
  setCurrentDepth: (d: number) => void
  currentNotes: string
  setCurrentNotes: (n: string) => void
  isSupervisor?: boolean
  onVerifyDefect: (c?: TriageCase) => void
  onOpenNoDefectModal: (c?: TriageCase) => void
  onConclusionOutOfScope: (c?: TriageCase) => void
  onOpenRequestSurveyModal: (c?: TriageCase) => void
  onOpenPublishModal: (c?: TriageCase) => void
  onNavigateFastTrack: (c: TriageCase) => void
}

export const DrawerDecisionForm: React.FC<DrawerDecisionFormProps> = ({
  selectedCase,
  currentSeverity,
  setCurrentSeverity,
  currentUrgency,
  setCurrentUrgency,
  currentArea,
  setCurrentArea,
  currentDepth,
  setCurrentDepth,
  currentNotes,
  setCurrentNotes,
  isSupervisor = false,
  onVerifyDefect,
  onOpenNoDefectModal,
  onConclusionOutOfScope,
  onOpenRequestSurveyModal,
  onOpenPublishModal,
  onNavigateFastTrack,
}) => {
  const navigate = useNavigate()
  const basePath = isSupervisor ? '/sup' : '/pm'

  return (
    <div className="space-y-3.5">
      {/* Supervisor Read-only Banner */}
      {isSupervisor && (
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5 flex items-start gap-2 text-slate-800 text-xs">
          <Icon name="visibility" size={16} className="text-[#2D3748] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[12px] text-[#1A1D20]">Chế độ Giám sát (Chỉ đọc)</div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Hồ sơ khiếm khuyết do Chỉ huy trưởng (PM) phụ trách thẩm định, phân loại kỹ thuật và lập đề xuất sửa chữa.
            </div>
          </div>
        </div>
      )}

      {/* Thông báo nghiệp vụ chuẩn Spec 17_10 cho phản ánh hiện trường */}
      <div className="bg-blue-50/70 border border-blue-200/90 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900 shadow-2xs">
        <Icon name="info" size={17} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[11.5px]">
          <span className="font-bold block text-blue-950 mb-0.5">Quy trình kỹ thuật Spec 17_10:</span>
          Phản ánh ban đầu chưa có số đo thực địa. Sau khi Chỉ huy trưởng duyệt yêu cầu đo đạc, Đội tuần tra sẽ đo đạc kích thước thực tế (Dài x Rộng x Sâu) để hệ thống xác định mức độ nghiêm trọng và phân luồng Fast Track / Đợt sửa chữa.
        </div>
      </div>

      {/* Thông số kỹ thuật từ CSDL Candidate3 */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 grid grid-cols-2 gap-3 text-xs shadow-xs">
        <div>
          <span className="text-slate-400 text-[11px] block font-medium">Nguồn tiếp nhận:</span>
          <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedCase.source_label}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[11px] block font-medium">
            Phân loại khiếm khuyết sơ bộ:
          </span>
          <span className="font-bold text-slate-800 text-xs mt-0.5 block">
            {selectedCase.defect_type === 'POTHOLE'
              ? 'Ổ gà mặt đường'
              : selectedCase.defect_type === 'CRACK'
              ? 'Vết nứt mặt đường'
              : selectedCase.defect_type || 'Chưa phân loại'}
          </span>
        </div>
        {selectedCase.fixture_version && (
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Mô hình nhận diện AI:</span>
            <span className="font-mono text-slate-700 text-xs mt-0.5 block">{selectedCase.fixture_version}</span>
          </div>
        )}
        {selectedCase.linked_defect_id && (
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Hồ sơ khiếm khuyết CSDL:</span>
            <span className="font-mono font-bold text-emerald-700 text-xs mt-0.5 block">
              #DEF-{selectedCase.linked_defect_id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* PM Notes */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-800">Ghi chú thẩm định PM</label>
          <span className="text-[11px] text-slate-400 font-normal">Lưu nhật ký công trình</span>
        </div>
        <textarea
          rows={3}
          disabled={isSupervisor || !selectedCase.project_id}
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          placeholder={
            !selectedCase.project_id
              ? 'Hồ sơ chưa được gán vào dự án • Đang chờ Giám sát điều phối tuyến...'
              : 'Nhập ghi chú kỹ thuật, chỉ đạo đo đạc thực địa hoặc đề xuất cắm biển cảnh báo tạm...'
          }
          className="w-full bg-white border border-slate-300 text-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] disabled:bg-slate-100 disabled:text-slate-500 shadow-xs"
        />
      </div>

      {/* Decision Action Buttons or Status Card for Supervisor */}
      {isSupervisor ? (
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Kết luận thẩm định kỹ thuật:
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCase.conclusion === 'NEEDS_EVIDENCE' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Icon name="straighten" size={14} className="text-blue-600" />
                Hợp lệ • Yêu cầu đo đạc hiện trường
              </span>
            )}
            {selectedCase.conclusion === 'DEFECT_FOUND' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Icon name="check_circle" size={14} className="text-emerald-600" />
                Xác minh có khiếm khuyết (Hợp lệ)
              </span>
            )}
            {selectedCase.conclusion === 'NO_DEFECT' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <Icon name="cancel" size={14} className="text-red-600" />
                Không có khiếm khuyết (Báo sai)
              </span>
            )}
            {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Icon name="warning" size={14} className="text-amber-600" />
                Ngoài phạm vi bảo hành
              </span>
            )}
            {!selectedCase.conclusion && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Icon name="hourglass_empty" size={14} className="text-slate-500" />
                Đang chờ PM thẩm định
              </span>
            )}
          </div>
          {selectedCase.is_published && (
            <div className="text-[11px] text-sky-700 flex items-center gap-1 pt-1.5 border-t border-slate-100">
              <Icon name="campaign" size={14} className="text-sky-600" />
              <span>Đã công bố tiến độ cho người dân ({selectedCase.published_at || 'Hôm nay'})</span>
            </div>
          )}
        </div>
      ) : !selectedCase.project_id ? (
        /* Khi ca chưa được Supervisor gán vào dự án mà PM phụ trách */
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Icon name="hourglass_empty" size={15} className="text-amber-600 shrink-0" />
            <span>Chờ Giám sát (Supervisor) điều phối dự án</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Theo quy định Spec 17_10, phản ánh hiện trường phải được Giám sát điều phối gán vào dự án cụ thể trước khi Chỉ huy trưởng (PM) có thẩm quyền kết luận thẩm định.
          </p>
        </div>
      ) : selectedCase.conclusion ? (
        /* Khi hồ sơ đã có kết luận thẩm định: Hiển thị trạng thái rõ ràng */
        <div className="space-y-3 pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Kết luận thẩm định kỹ thuật</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Đã ghi nhận CSDL
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedCase.conclusion === 'NEEDS_EVIDENCE' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 w-full">
                  <Icon name="straighten" size={16} className="text-blue-600" />
                  <span>Hợp lệ • Yêu cầu đo đạc hiện trường</span>
                </div>
              )}
              {selectedCase.conclusion === 'DEFECT_FOUND' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-full">
                  <Icon name="check_circle" size={16} className="text-emerald-600" />
                  <span>Xác minh có khiếm khuyết (Hợp lệ)</span>
                </div>
              )}
              {selectedCase.conclusion === 'NO_DEFECT' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 w-full">
                  <Icon name="cancel" size={16} className="text-red-600" />
                  <span>Không có khiếm khuyết (Báo sai)</span>
                </div>
              )}
              {selectedCase.conclusion === 'OUT_OF_SCOPE' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-full">
                  <Icon name="warning" size={16} className="text-amber-600" />
                  <span>Ngoài phạm vi bảo hành Hoàng Hải</span>
                </div>
              )}
            </div>

            {(selectedCase.conclusion_reason || selectedCase.pm_notes) && (
              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                <span className="font-semibold text-slate-900 block text-[11px] mb-0.5">Lý do thẩm định ghi nhận:</span>
                {selectedCase.conclusion_reason || selectedCase.pm_notes}
              </div>
            )}

            {/* Nút công bố cho người dân nếu là ca phản ánh người dân */}
            {selectedCase.source === 'CITIZEN' && (
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => onOpenPublishModal(selectedCase)}
                  className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all border border-sky-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="campaign" size={15} />
                  <span>{selectedCase.is_published ? 'Cập nhật thông báo cho người dân' : 'Công bố tiến độ cho người dân'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Khi hồ sơ chưa thẩm định: Hiển thị bộ nút thao tác thẩm định chuẩn nghiệp vụ */
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => onVerifyDefect(selectedCase)}
            className="w-full py-3 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer bg-brand-gold hover:bg-[#B38E1F]"
          >
            <Icon name="straighten" size={16} />
            <span>Xác nhận hợp lệ (Yêu cầu đo đạc hiện trường)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenNoDefectModal(selectedCase)}
              className="border px-3 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer bg-white border-slate-300 hover:bg-rose-50 text-rose-600"
              title="Không có khiếm khuyết (Báo sai)"
            >
              <Icon name="close" size={15} />
              <span>Báo sai (Không có lỗi)</span>
            </button>

            <button
              type="button"
              onClick={() => onConclusionOutOfScope(selectedCase)}
              className="border px-3 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer bg-white border-slate-300 hover:bg-amber-50 text-amber-700"
              title="Ngoài phạm vi bảo hành Hoàng Hải"
            >
              <Icon name="warning" size={15} />
              <span>Ngoài phạm vi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
