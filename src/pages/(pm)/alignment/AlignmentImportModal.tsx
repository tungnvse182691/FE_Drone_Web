import React from 'react'
import { X, FileUp } from 'lucide-react'
import { AssignedProjectOption } from './types'
import { ImportPanel } from './ImportPanel'

export interface AlignmentImportModalProps {
  isOpen: boolean
  onClose: () => void
  importTab: 'FILE' | 'MANUAL'
  onSetImportTab: (tab: 'FILE' | 'MANUAL') => void
  onLoadPreset: (name: string, dist: number) => void
  onProcessGeoJsonFile: (file: File) => void
  manualCoordsText: string
  onSetManualCoordsText: (text: string) => void
  onProcessManualCoordinates: (text: string) => void
  activeProject: AssignedProjectOption
}

export const AlignmentImportModal: React.FC<AlignmentImportModalProps> = ({
  isOpen,
  onClose,
  importTab,
  onSetImportTab,
  onLoadPreset,
  onProcessGeoJsonFile,
  manualCoordsText,
  onSetManualCoordsText,
  onProcessManualCoordinates,
  activeProject
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-[#C9A227]" />
            <h3 className="font-bold text-slate-900 text-base">Thiết Lập Tim Tuyến (WF-02 • Spec v2.2)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ImportPanel
          importTab={importTab}
          onSetImportTab={onSetImportTab}
          onLoadPreset={onLoadPreset}
          onProcessGeoJsonFile={onProcessGeoJsonFile}
          manualCoordsText={manualCoordsText}
          onSetManualCoordsText={onSetManualCoordsText}
          onProcessManualCoordinates={onProcessManualCoordinates}
          activeProject={activeProject}
        />
      </div>
    </div>
  )
}
