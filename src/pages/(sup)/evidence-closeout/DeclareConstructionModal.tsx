import React, { useState } from 'react'
import { CaseItem } from './types'
import { AcceptancePackage } from '../../../api/services/acceptanceService'

export interface DeclareConstructionModalProps {
  isOpen: boolean
  onClose: () => void
  currentPackage: AcceptancePackage | null
  currentItem: CaseItem
  onConfirmDeclaration: (evidenceIds: string[], notes: string) => void
}

export const DeclareConstructionModal: React.FC<DeclareConstructionModalProps> = ({
  isOpen,
  onClose,
  currentPackage,
  currentItem,
  onConfirmDeclaration
}) => {
  const [evidenceList, setEvidenceList] = useState<string[]>([
    'EV-AFTER-01 (Ảnh chụp bề mặt thảm hoàn thiện)',
    'EV-AFTER-02 (Ảnh chụp mép cắt vuốt nối chuẩn)',
    'DOC-K98-01 (Phiếu kiểm định độ chặt lu lèn K98)',
    'DOC-3M-01 (Biên bản đo độ bằng phẳng thước 3m)'
  ])
  const [selectedEvidences, setSelectedEvidences] = useState<string[]>([
    'EV-AFTER-01 (Ảnh chụp bề mặt thảm hoàn thiện)',
    'EV-AFTER-02 (Ảnh chụp mép cắt vuốt nối chuẩn)',
    'DOC-K98-01 (Phiếu kiểm định độ chặt lu lèn K98)',
    'DOC-3M-01 (Biên bản đo độ bằng phẳng thước 3m)'
  ])
  const [contractorNotes, setContractorNotes] = useState(
    'Đội thi công Hoàng Hải 01 đã hoàn tất 100% công tác cào bóc và thảm BTN C12.5 theo quy chuẩn TCVN 8819:2011. Kính trình Giám sát viên thẩm duyệt nghiệm thu.'
  )
  const [isCommitmentChecked, setIsCommitmentChecked] = useState(true)

  if (!isOpen) return null

  const toggleEvidence = (ev: string) => {
    if (selectedEvidences.includes(ev)) {
      setSelectedEvidences(selectedEvidences.filter((item) => item !== ev))
    } else {
      setSelectedEvidences([...selectedEvidences, ev])
    }
  }

  const handleConfirm = () => {
    if (selectedEvidences.length === 0 || !isCommitmentChecked) return
    onConfirmDeclaration(selectedEvidences, contractorNotes)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-[1.5px] border-[#E2E5E9] space-y-4 animate-in fade-in zoom-in-95 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A227] via-amber-500 to-amber-200" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1D20]">
                Khai Báo Hoàn Thành Thi Công (API-110)
              </h3>
              <p className="text-[11px] text-slate-500">
                Lệnh <code>construction-declarations</code> của Chỉ huy trưởng nhà thầu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Thông tin gói & hạng mục */}
        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-600 font-medium">
            <span>Gói kỹ thuật: <strong className="text-slate-900">{currentPackage?.code || 'PKG-2026-08'}</strong></span>
            <span>Lý trình: <strong className="text-slate-900 font-mono">{currentItem.chainage}</strong></span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 text-[11px] text-slate-600">
            <div>Khối lượng cào bóc: <strong className="text-slate-900">{currentItem.area_m2} m²</strong></div>
            <div>Định mức BTN C12.5: <strong className="text-slate-900">{currentItem.volume_btn_c125_kg} kg</strong></div>
          </div>
        </div>

        {/* Danh sách bằng chứng hiện trường (evidenceFileIds) */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Bằng chứng hiện trường sau thi công (evidenceFileIds):
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Đã chọn: {selectedEvidences.length}/{evidenceList.length}
            </span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {evidenceList.map((ev, idx) => {
              const isChecked = selectedEvidences.includes(ev)
              return (
                <div
                  key={idx}
                  onClick={() => toggleEvidence(ev)}
                  className={`p-2 rounded-lg border text-[11px] flex items-center justify-between cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-amber-50/60 border-amber-300 text-slate-900'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{ev}</span>
                  <span className={`material-symbols-outlined text-[16px] shrink-0 ${isChecked ? 'text-[#C9A227]' : 'text-slate-300'}`}>
                    {isChecked ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ghi chú của nhà thầu */}
        <div className="space-y-1 text-xs">
          <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            Nội dung khai báo hoàn thành:
          </label>
          <textarea
            value={contractorNotes}
            onChange={(e) => setContractorNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-[#E2E5E9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C9A227] text-xs text-slate-800"
            placeholder="Nhập ghi chú hoàn công hoặc lưu ý kỹ thuật..."
          />
        </div>

        {/* Cam kết của Chỉ huy trưởng */}
        <label className="flex items-start gap-2 text-[11px] text-slate-700 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isCommitmentChecked}
            onChange={(e) => setIsCommitmentChecked(e.target.checked)}
            className="mt-0.5 rounded text-[#C9A227] focus:ring-[#C9A227]"
          />
          <span className="leading-tight">
            Tôi (Chỉ huy trưởng PM) xác nhận đội thi công đã hoàn thành 100% khối lượng kỹ thuật tại hiện trường, bảo đảm tuân thủ TCVN 8819:2011 và sẵn sàng để Giám sát viên thẩm duyệt nghiệm thu.
          </span>
        </label>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={selectedEvidences.length === 0 || !isCommitmentChecked}
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#C9A227] hover:bg-[#8C6D1F] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Khai Báo Hoàn Thành &amp; Trình Giám Sát</span>
          </button>
        </div>
      </div>
    </div>
  )
}
