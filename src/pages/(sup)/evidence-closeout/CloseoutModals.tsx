import React from 'react'
import {
  X,
  Share2
} from 'lucide-react'
import { CaseItem } from './types'
import { ReworkModal } from './ReworkModal'
import { VerifyModal } from './VerifyModal'
import { ExportPdfAModal } from './ExportPdfAModal'
import { ExportZipModal } from './ExportZipModal'

export interface CloseoutModalsProps {
  publishHeadline: string
  setPublishHeadline: (h: string) => void
  currentItem: CaseItem
  caseItems: CaseItem[]
  acceptedCount: number
  isReworkModalOpen: boolean
  setIsReworkModalOpen: (open: boolean) => void
  reworkChecklist: {
    bond_coat: boolean
    flatness_3m: boolean
    temperature_slip: boolean
    compaction_k98: boolean
    other_defect: boolean
  }
  setReworkChecklist: React.Dispatch<React.SetStateAction<{
    bond_coat: boolean
    flatness_3m: boolean
    temperature_slip: boolean
    compaction_k98: boolean
    other_defect: boolean
  }>>
  otherDefectText: string
  setOtherDefectText: (s: string) => void
  reworkNotes: string
  setReworkNotes: (s: string) => void
  handleSubmitRework: () => void
  isPublishModalOpen: boolean
  setIsPublishModalOpen: (open: boolean) => void
  onConfirmPublish: () => void
  isCloseCaseModalOpen: boolean
  setIsCloseCaseModalOpen: (open: boolean) => void
  onConfirmCloseCase: () => void
  isExportModalOpen: boolean
  setIsExportModalOpen: (open: boolean) => void
  exportFormat: 'PDF_A' | 'ZIP_PACKAGE'
  setExportFormat: (f: 'PDF_A' | 'ZIP_PACKAGE') => void
  includeSha256Checksum: boolean
  setIncludeSha256Checksum: (b: boolean) => void
  includeDroneRawTiff: boolean
  setIncludeDroneRawTiff: (b: boolean) => void
  isExporting: boolean
  handleTriggerExport: () => void
}

export const CloseoutModals: React.FC<CloseoutModalsProps> = ({
  publishHeadline,
  setPublishHeadline,
  currentItem,
  caseItems,
  acceptedCount: _acceptedCount,
  isReworkModalOpen,
  setIsReworkModalOpen,
  reworkChecklist,
  setReworkChecklist,
  otherDefectText,
  setOtherDefectText,
  reworkNotes,
  setReworkNotes,
  handleSubmitRework,
  isPublishModalOpen,
  setIsPublishModalOpen,
  onConfirmPublish,
  isCloseCaseModalOpen,
  setIsCloseCaseModalOpen,
  onConfirmCloseCase,
  isExportModalOpen,
  setIsExportModalOpen,
  exportFormat,
  setExportFormat,
  includeSha256Checksum,
  setIncludeSha256Checksum,
  includeDroneRawTiff,
  setIncludeDroneRawTiff,
  isExporting,
  handleTriggerExport
}) => {
  return (
    <>
      {/* MODAL 1: REWORK REQUEST MODAL */}
      <ReworkModal
        isOpen={isReworkModalOpen}
        onClose={() => setIsReworkModalOpen(false)}
        currentItem={currentItem}
        reworkChecklist={reworkChecklist}
        setReworkChecklist={setReworkChecklist}
        otherDefectText={otherDefectText}
        setOtherDefectText={setOtherDefectText}
        reworkNotes={reworkNotes}
        setReworkNotes={setReworkNotes}
        onSubmitRework={handleSubmitRework}
      />

      {/* MODAL 2: CITIZEN APP PUBLISH PREVIEW MODAL */}
      {isPublishModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsPublishModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col">
            <div className="p-4 bg-blue-50 border-b border-blue-200 text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base font-sansation">
                  Công bố kết quả sửa chữa lên Citizen App &amp; Cổng giao thông
                </h3>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Tiêu đề bản tin công bố cho người dân:</label>
                <input
                  type="text"
                  value={publishHeadline}
                  onChange={(e) => setPublishHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-blue-700">Citizen App • Bản tin giao thông cộng đồng</span>
                  <span>Vừa xong</span>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 relative bg-black">
                  <img
                    src={currentItem.after_image}
                    alt="Kết quả sau khi hoàn thành"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                    ✓ ĐÃ KHẮC PHỤC XONG
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{publishHeadline}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Vị trí: {currentItem.chainage} • Nhà thầu Hoàng Hải đã hoàn thành thảm lại bê tông nhựa phẳng phiu, đảm bảo an toàn giao thông cho người dân. Cảm ơn phản ánh của cộng đồng!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onConfirmPublish}
                type="button"
                className="px-5 h-9 bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Phát hành công bố ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CLOSE COMPOSITE CASE MODAL (SUPERVISOR CLOSEOUT) */}
      <VerifyModal
        isOpen={isCloseCaseModalOpen}
        onClose={() => setIsCloseCaseModalOpen(false)}
        onConfirm={onConfirmCloseCase}
        caseItems={caseItems}
      />

      {/* MODAL 4: EXPORT EVIDENCE DOSSIER RPT-07 */}
      {isExportModalOpen && (
        exportFormat === 'PDF_A' ? (
          <ExportPdfAModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            currentItem={currentItem}
            setExportFormat={setExportFormat}
            includeSha256Checksum={includeSha256Checksum}
            setIncludeSha256Checksum={setIncludeSha256Checksum}
            isExporting={isExporting}
            onExport={handleTriggerExport}
          />
        ) : (
          <ExportZipModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            currentItem={currentItem}
            setExportFormat={setExportFormat}
            includeDroneRawTiff={includeDroneRawTiff}
            setIncludeDroneRawTiff={setIncludeDroneRawTiff}
            isExporting={isExporting}
            onExport={handleTriggerExport}
          />
        )
      )}
    </>
  )
}
export default CloseoutModals
