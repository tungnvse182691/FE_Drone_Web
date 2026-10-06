import React from 'react'
import { Send, X, AlertTriangle, Info } from 'lucide-react'
import { RouteConfig, DefectItem, WorkMode, CrewTeam, PolicyThresholdConfig } from './types'

export interface FastTrackDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  workMode: WorkMode
  currentRouteConfig: RouteConfig
  selectedDefectIds: string[]
  surveyDistanceM: number
  selectedItems: DefectItem[]
  selectedDispatchCrew: string
  setSelectedDispatchCrew: (crew: string) => void
  crewTeams: CrewTeam[]
  dispatchNotes: string
  setDispatchNotes: (notes: string) => void
  handleExecuteDispatch: () => void
  currentPolicy: PolicyThresholdConfig
}

export const FastTrackDispatchModal: React.FC<FastTrackDispatchModalProps> = ({
  isOpen,
  onClose,
  workMode,
  currentRouteConfig,
  selectedDefectIds,
  surveyDistanceM,
  selectedItems,
  selectedDispatchCrew,
  setSelectedDispatchCrew,
  crewTeams,
  dispatchNotes,
  setDispatchNotes,
  handleExecuteDispatch,
  currentPolicy
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227]">
              <Send className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">
                {workMode === 'MEASURE_ONLY'
                  ? 'Lệnh Khảo Sát Đo Đạc Hiện Trường'
                  : workMode === 'INSPECT_AND_REPAIR'
                  ? 'Lệnh Đo & Sửa Ngay Fast Track Tại Chỗ'
                  : 'Lệnh Ứng Cứu Khẩn Cấp Mặt Đường 24/7'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-semibold text-brand-dark">{currentRouteConfig.code}</span>
                <span>•</span>
                <span className="font-mono">{selectedDefectIds.length} hạng mục</span>
                <span>•</span>
                <span>Cự ly: {surveyDistanceM} m</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Danh sách hạng mục tóm tắt */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
              <span>Các vị trí khiếm khuyết được giao ({selectedItems.length})</span>
              <span className="text-slate-500 font-mono text-[10px]">Tuyến: {currentRouteConfig.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedItems.map((d) => (
                <span
                  key={d.id}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                    d.isFastTrackEligible
                      ? 'bg-white text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {d.code} ({d.stationing})
                </span>
              ))}
            </div>
          </div>

          {/* Chọn tổ đội thi công / đo đạc */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase text-[11px]">
              Chỉ định Tổ đội kỹ thuật tiếp nhận nhiệm vụ
            </label>
            <select
              value={selectedDispatchCrew}
              onChange={(e) => setSelectedDispatchCrew(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] cursor-pointer"
            >
              {crewTeams.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} — Phụ trách: {c.leader} ({c.memberCount} nhân sự) {c.isAvailable ? '• Sẵn sàng' : '• Đang bận'}
                </option>
              ))}
            </select>

            {/* Thông tin chi tiết của tổ đội được chọn */}
            {(() => {
              const currentCrewObj = crewTeams.find((c) => c.name === selectedDispatchCrew) || crewTeams[0]
              return (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  <div>
                    <span className="text-slate-500">Chỉ huy tổ:</span>{' '}
                    <strong>{currentCrewObj.leader}</strong> ({currentCrewObj.memberCount} kỹ thuật viên)
                  </div>
                  <div>
                    <span className="text-slate-500">Trạng thái:</span>{' '}
                    <strong className={currentCrewObj.isAvailable ? 'text-emerald-700' : 'text-amber-700'}>
                      {currentCrewObj.isAvailable ? 'Sẵn sàng xuất quân' : 'Đang thực hiện nhiệm vụ khác'}
                    </strong>
                  </div>
                  <div className="col-span-2 text-slate-600">
                    <span className="text-slate-500">Trang thiết bị mang theo:</span>{' '}
                    <span className="font-medium text-slate-800">{currentCrewObj.equipment}</span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Cảnh báo nghiêm ngặt khi chọn lỗi chưa vượt ngưỡng ở chế độ Khẩn cấp */}
          {workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && (
            <div className="p-3 bg-amber-50/90 border-2 border-amber-300 rounded-xl space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>CẢNH BÁO QUY TRÌNH: HƯ HỎNG CHƯA VƯỢT NGƯỠNG AN TOÀN ({selectedItems[0]?.code})</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Khiếm khuyết này có diện tích <strong>{selectedItems[0]?.areaM2} m²</strong> (&le; {currentPolicy.maxAreaM2} m²) và độ sâu <strong>{selectedItems[0]?.depthCm} cm</strong> (&le; {currentPolicy.maxDepthCm} cm). Đây là hư hỏng nhỏ đạt chuẩn <strong>Đo &amp; Sửa ngay (Fast Track)</strong> thông thường.
              </p>
              <div className="text-[11px] text-amber-950 font-bold bg-white/80 p-2 rounded-lg border border-amber-200">
                ⚡ Bắt buộc Chỉ huy trưởng (PM) phải nhập lý do xuất quân khẩn cấp đặc biệt vào ô bên dưới (tối thiểu 15 ký tự) để phục vụ thanh tra dự án!
              </div>
            </div>
          )}

          {/* Chỉ đạo & Ghi chú của PM */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Chỉ đạo của Chỉ huy trưởng (PM Dispatch Notes)
              </label>
              {workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && (
                <span className="text-[10px] text-amber-700 font-bold">
                  * Bắt buộc giải trình ({dispatchNotes.trim().length}/15 ký tự)
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder={
                workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible
                  ? 'BẮT BUỘC: Nhập lý do xuất quân khẩn cấp cho lỗi chưa vượt ngưỡng (VD: Phản ánh từ CSGT, khúc cua nguy hiểm...)'
                  : 'Ghi rõ yêu cầu an toàn, rào chắn phân luồng, phương tiện đo...'
              }
              className={`w-full px-3 py-2 bg-white border rounded-xl text-xs focus:outline-none ${
                workMode === 'EMERGENCY' && selectedItems[0]?.isFastTrackEligible && dispatchNotes.trim().length < 15
                  ? 'border-amber-400 focus:ring-2 focus:ring-amber-400'
                  : 'border-slate-300 focus:border-[#C9A227]'
              }`}
            />
          </div>

          {/* Hộp quy chế nhắc nhở */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
            <span>
              {workMode === 'MEASURE_ONLY' && (
                <>
                  <strong>Quy chuẩn MEASURE_ONLY:</strong> Lệnh chỉ cấp quyền đo đạc và chụp ảnh trắc địa. Tổ đội tuyệt đối không được tự ý cào bóc hay sửa chữa khi chưa có biên bản dự toán BOQ được duyệt.
                </>
              )}
              {workMode === 'INSPECT_AND_REPAIR' && (
                <>
                  <strong>Quy chuẩn FAST TRACK:</strong> Tổ đội mang vật liệu vá nguội và được phép thi công dứt điểm tại hiện trường nếu số đo thực tế đạt chuẩn chính sách ({currentPolicy.version}).
                </>
              )}
              {workMode === 'EMERGENCY' && (
                <>
                  <strong>Quy chuẩn EMERGENCY:</strong> Cắm biển báo nguy hiểm và phân luồng ngay lập tức. Được phép khắc phục tạm thời trước để bảo đảm an toàn giao thông thông suốt.
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleExecuteDispatch}
            type="button"
            className="px-5 py-2 bg-[#C9A227] hover:bg-[#B38E1F] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Phát lệnh xuất quân (Đồng bộ App Mobile)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
