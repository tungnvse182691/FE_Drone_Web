import React from 'react'
import { CaseItem } from './types'
import { ReworkModal } from './ReworkModal'
import { VerifyModal } from './VerifyModal'
import { ExportPdfAModal } from './ExportPdfAModal'
import { ExportZipModal } from './ExportZipModal'

export interface CloseoutModalsProps {
  currentItem: CaseItem
  caseItems: CaseItem[]
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
  currentItem,
  caseItems,
  isReworkModalOpen,
  setIsReworkModalOpen,
  reworkChecklist,
  setReworkChecklist,
  otherDefectText,
  setOtherDefectText,
  reworkNotes,
  setReworkNotes,
  handleSubmitRework,
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
      {/* MODAL 1: REWORK REQUEST MODAL (HT10) */}
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

      {/* MODAL 2: CLOSE COMPOSITE CASE MODAL (SUPERVISOR CLOSEOUT - BR-26) */}
      <VerifyModal
        isOpen={isCloseCaseModalOpen}
        onClose={() => setIsCloseCaseModalOpen(false)}
        onConfirm={onConfirmCloseCase}
        caseItems={caseItems}
      />

      {/* MODAL 3: EXPORT EVIDENCE DOSSIER RPT-07 */}
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
