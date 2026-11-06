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

type InspectOnlyImportProps = { inspectOnly: true; isOpen: boolean; onClose: () => void; onProcessGeoJsonFile: (file: File) => void }

export const AlignmentImportModal: React.FC<AlignmentImportModalProps | InspectOnlyImportProps> = (props) => {
  if ('inspectOnly' in props) {
    if (!props.isOpen) return null
    return <div role="dialog" aria-modal="true" aria-label="Thiết lập tim tuyến" className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"><section className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"><header className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="font-bold text-slate-900 text-base flex items-center gap-2"><FileUp className="w-5 h-5 text-brand-gold" />Thiết lập tim tuyến</h2><button type="button" aria-label="Đóng hộp thoại nhập tuyến" onClick={props.onClose}><X className="w-5 h-5 text-slate-400" /></button></header><div className="flex border-b border-slate-200 text-xs"><span className="pb-2.5 px-4 border-b-2 border-brand-gold font-bold">Tải tệp GeoJSON</span><button type="button" disabled className="pb-2.5 px-4 text-slate-400">Dán chuỗi tọa độ</button></div><label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center gap-3 text-center"><FileUp className="w-8 h-8 text-brand-gold" /><span className="text-sm font-semibold">Chọn tệp tim tuyến để kiểm tra</span><input type="file" aria-label="Tệp GeoJSON trong hộp thoại" accept=".geojson,.json" className="text-xs w-full" onChange={event => { const file = event.target.files?.[0]; if (file) props.onProcessGeoJsonFile(file); event.target.value = '' }} /></label><p className="text-xs text-slate-500">Chỉ kiểm tra đầu vào, chưa lưu bản nháp. Tệp thiếu hệ quy chiếu giữ trạng thái chưa xác định; không chuyển đổi hoặc tự điền thông số kỹ thuật.</p><footer className="flex justify-end"><button type="button" className="px-4 py-2 border rounded-lg text-sm" onClick={props.onClose}>Đóng</button></footer></section></div>
  }
  const {
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
  } = props
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-slate-900 text-base">Thiết Lập Tim Tuyến</h3>
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
