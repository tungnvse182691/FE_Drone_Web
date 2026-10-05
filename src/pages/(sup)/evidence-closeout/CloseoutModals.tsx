import React from 'react'
import {
  AlertTriangle,
  X,
  AlertCircle,
  RotateCcw,
  Share2,
  CheckCircle2,
  Send,
  Lock,
  Layers,
  FileDown,
  FileCheck,
  FileArchive,
  Printer,
  Download
} from 'lucide-react'
import { CaseItem } from './types'

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
  acceptedCount,
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
      {/* ========================================================================= */}
      {/* MODAL 1: REWORK REQUEST MODAL                                            */}
      {/* ========================================================================= */}
      {isReworkModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsReworkModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base font-sansation">Lập lệnh yêu cầu tái thi công (Rework Order)</h3>
              </div>
              <button
                onClick={() => setIsReworkModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 block">Hạng mục đối chiếu:</span>
                <p className="text-slate-600 leading-relaxed">
                  {currentItem.item_code}: {currentItem.title} - {currentItem.chainage}. Hồ sơ sẽ được chuyển ngược về{' '}
                  <strong className="text-slate-900">{currentItem.after_crew}</strong> kèm chỉ đạo kỹ thuật.
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900 block">Danh mục lỗi kỹ thuật cần khắc phục:</label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.bond_coat}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, bond_coat: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Mép nối thảm nhựa chưa được tưới đủ nhũ tương dính bám (Bong tróc mép)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.flatness_3m}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, flatness_3m: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Độ bằng phẳng thước 3m vượt quá dung sai (&gt; 3mm)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.temperature_slip}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, temperature_slip: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Thiếu phiếu cân và biên bản đo nhiệt độ thảm tại hiện trường</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.compaction_k98}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, compaction_k98: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span>Độ chặt lu lèn móng K98 chưa đạt chứng chỉ kiểm định</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-800 cursor-pointer pt-1 border-t border-slate-200/80">
                    <input
                      type="checkbox"
                      checked={reworkChecklist.other_defect}
                      onChange={(e) => setReworkChecklist({ ...reworkChecklist, other_defect: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <span className="font-semibold text-rose-700">Lỗi kỹ thuật khác ngoài danh mục</span>
                  </label>

                  {reworkChecklist.other_defect && (
                    <div className="pl-6 pt-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Nhập tên lỗi kỹ thuật phát sinh (VD: Cắt mép chưa vuông vắn, vụn nhựa chưa dọn...)"
                        value={otherDefectText}
                        onChange={(e) => setOtherDefectText(e.target.value)}
                        className={`w-full px-3 py-2 text-xs bg-white rounded-lg border text-slate-800 font-medium focus:outline-none transition ${
                          !otherDefectText.trim()
                            ? 'border-rose-400 bg-rose-50/40 focus:ring-2 focus:ring-rose-400'
                            : 'border-slate-300 focus:ring-2 focus:ring-[#C9A227]'
                        }`}
                        autoFocus
                      />
                      {!otherDefectText.trim() && (
                        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Bắt buộc nhập tên lỗi kỹ thuật phát sinh mới được phát lệnh.</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes textarea */}
              <div className="space-y-1">
                <label className="font-bold text-slate-900 block">Ý kiến chỉ đạo của Kỹ sư Giám sát:</label>
                <textarea
                  rows={3}
                  value={reworkNotes}
                  onChange={(e) => setReworkNotes(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Lưu ý: Phát lệnh Rework sẽ tự động chuyển trạng thái hồ sơ về "REWORK_REQUIRED" và gia hạn thêm SLA hoàn công 24 giờ cho nhà thầu.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsReworkModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmitRework}
                disabled={
                  (reworkChecklist.other_defect && !otherDefectText.trim()) ||
                  (!reworkChecklist.bond_coat &&
                    !reworkChecklist.flatness_3m &&
                    !reworkChecklist.temperature_slip &&
                    !reworkChecklist.compaction_k98 &&
                    !reworkChecklist.other_defect)
                }
                type="button"
                className={`px-5 h-9 transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 ${
                  (reworkChecklist.other_defect && !otherDefectText.trim()) ||
                  (!reworkChecklist.bond_coat &&
                    !reworkChecklist.flatness_3m &&
                    !reworkChecklist.temperature_slip &&
                    !reworkChecklist.compaction_k98 &&
                    !reworkChecklist.other_defect)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát lệnh Rework (Tạo Work Order bù)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CITIZEN APP PUBLISH PREVIEW MODAL (PM ACTION)                   */}
      {/* ========================================================================= */}
      {isPublishModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsPublishModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Header */}
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

            {/* Body */}
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

              {/* Citizen App Mobile Card Preview */}
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

            {/* Footer */}
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

      {/* ========================================================================= */}
      {/* MODAL 3: CLOSE COMPOSITE CASE MODAL (SUPERVISOR CLOSEOUT)                 */}
      {/* ========================================================================= */}
      {isCloseCaseModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsCloseCaseModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden z-10 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <FileCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-900 font-sansation">Đóng tổng thể vụ việc phức hợp</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toàn bộ <strong className="text-slate-900">{caseItems.length}/{caseItems.length} hạng mục</strong> trong vụ việc{' '}
                <strong className="text-slate-900">#CASE-2026-0842</strong> đã được nghiệm thu đạt chất lượng. Xác nhận đóng hồ sơ và lưu trữ bảo hành pháp lý?
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span>Mã vụ việc:</span>
                <span className="font-mono font-bold text-slate-900">#CASE-2026-0842</span>
              </div>
              <div className="flex justify-between">
                <span>Dự án:</span>
                <span className="font-semibold text-slate-900">QL1A - Giai đoạn 2 (Km 1020 - Km 1045)</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng diện tích khắc phục:</span>
                <span className="font-mono font-bold text-[#92700C]">2.45 m²</span>
              </div>
              <div className="flex justify-between">
                <span>Thời hạn bảo hành:</span>
                <span className="font-semibold text-slate-900">12 tháng (đến 30/08/2027)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsCloseCaseModalOpen(false)}
                type="button"
                className="w-1/2 h-10 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={onConfirmCloseCase}
                type="button"
                className="w-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-xl font-bold text-xs shadow-xs cursor-pointer"
              >
                Xác nhận đóng vụ việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EXPORT EVIDENCE DOSSIER RPT-07 (POST /api/v1/exports)           */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
          <div
            onClick={() => setIsExportModalOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>

          <div className="relative bg-white border border-[#E2E5E9] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-bold text-base font-sansation">
                  Xuất hồ sơ bằng chứng số (RPT-07 Evidence Dossier)
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Hệ thống khởi tạo tác vụ xuất bất đồng bộ (<code>POST /api/v1/exports</code>), kết xuất hồ sơ nghiệm thu kỹ thuật theo quy chuẩn pháp lý TCVN 8819:2011 kèm mã băm SHA-256 chống chỉnh sửa.
              </p>

              <div className="space-y-2">
                <label className="font-bold text-slate-900 block">Chọn định dạng hồ sơ kết xuất:</label>

                {/* Option 1: PDF/A */}
                <div
                  onClick={() => setExportFormat('PDF_A')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    exportFormat === 'PDF_A'
                      ? 'bg-[#FEF9E7] border-[#C9A227] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'PDF_A'}
                    onChange={() => setExportFormat('PDF_A')}
                    className="mt-0.5 accent-[#C9A227]"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Biên bản nghiệm thu kỹ thuật (PDF/A)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Tệp PDF chuẩn lưu trữ lâu dài (ISO 19005), tích hợp hình ảnh Before/After, thông số K98 và mã băm SHA-256 Checksum bảo mật.
                    </span>
                  </div>
                </div>

                {/* Option 2: ZIP Package */}
                <div
                  onClick={() => setExportFormat('ZIP_PACKAGE')}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    exportFormat === 'ZIP_PACKAGE'
                      ? 'bg-[#FEF9E7] border-[#C9A227] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'ZIP_PACKAGE'}
                    onChange={() => setExportFormat('ZIP_PACKAGE')}
                    className="mt-0.5 accent-[#C9A227]"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">Gói hồ sơ bằng chứng gốc nén (ZIP Dossier)</span>
                    <span className="text-slate-500 text-[11px] block">
                      Chứa toàn bộ ảnh RAW độ phân giải 4K, video giám sát lu lèn, log tọa độ RTK GPS và file <code>checksum.sha256</code> chống chối bỏ.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Hạng mục:</span>
                  <span className="font-mono font-bold text-slate-900">{currentItem.defect_code} ({currentItem.item_code})</span>
                </div>
                <div className="flex justify-between">
                  <span>Vụ việc liên quan:</span>
                  <span className="font-mono font-bold text-slate-900">#CASE-2026-0842</span>
                </div>
                <div className="flex justify-between">
                  <span>Mã băm toàn vẹn:</span>
                  <span className="font-mono text-purple-700 font-bold">{currentItem.after_hash.slice(0, 16)}...</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsExportModalOpen(false)}
                type="button"
                className="px-4 h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition rounded-xl font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleTriggerExport}
                disabled={isExporting}
                type="button"
                className="px-5 h-9 bg-[#C9A227] hover:bg-[#B38E1F] text-white transition rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang khởi tạo Job...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải xuống hồ sơ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
