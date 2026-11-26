import React from 'react'
import { CaseItem } from './types'
import { ReworkModal } from './ReworkModal'
import { ExportPdfAModal } from './ExportPdfAModal'
import { ExportZipModal } from './ExportZipModal'
import { DeclareConstructionModal, ReviewModalVariant } from './DeclareConstructionModal'
import { AcceptancePackage } from '../../../api/services/acceptanceService'

export interface CloseoutModalsProps {
  currentItem: CaseItem
  caseItems: CaseItem[]
  currentPackage?: AcceptancePackage | null
  isDeclareModalOpen?: boolean
  setIsDeclareModalOpen?: (open: boolean) => void
  onConfirmDeclaration?: (notes: string) => void
  reviewVariant?: ReviewModalVariant
  busy?: boolean
  modalError?: string
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
  isExportModalOpen,
  setIsExportModalOpen,
  exportFormat,
  setExportFormat,
  includeSha256Checksum,
  setIncludeSha256Checksum,
  includeDroneRawTiff,
  setIncludeDroneRawTiff,
  isExporting,
  handleTriggerExport,
  currentPackage,
  isDeclareModalOpen,
  setIsDeclareModalOpen,
  onConfirmDeclaration,
  reviewVariant,
  busy,
  modalError
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
        busy={busy}
        error={isReworkModalOpen ? modalError : undefined}
      />


      {/* MODAL 3: EXPORT EVIDENCE DOSSIER RPT-07 */}
      {isExportModalOpen && (
        exportFormat === 'PDF_A' ? (
          <ExportPdfAModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            currentItem={currentItem}
            setExportFormat={setExportFormat}
            caseCode={currentPackage?.case_code}
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
            caseCode={currentPackage?.case_code}
            includeDroneRawTiff={includeDroneRawTiff}
            setIncludeDroneRawTiff={setIncludeDroneRawTiff}
            isExporting={isExporting}
            onExport={handleTriggerExport}
          />
        )
      )}

      {/* MODAL 4: PM REVIEW ACCEPT / FAST TRACK / GIÁM SÁT XÁC NHẬN CUỐI */}
      {isDeclareModalOpen && setIsDeclareModalOpen && onConfirmDeclaration && (
        <DeclareConstructionModal
          isOpen={isDeclareModalOpen}
          onClose={() => setIsDeclareModalOpen(false)}
          currentPackage={currentPackage || null}
          currentItem={currentItem}
          variant={reviewVariant}
          busy={busy}
          error={modalError}
          onConfirmDeclaration={onConfirmDeclaration}
        />
      )}
    </>
  )
}
export default CloseoutModals
