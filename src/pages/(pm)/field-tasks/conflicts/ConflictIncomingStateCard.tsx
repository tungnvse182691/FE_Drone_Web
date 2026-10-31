import React, { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'
import { PhotoLightboxModal } from '../../../../components/common/PhotoLightboxModal'
import { formatConflictDateTime } from '../../../../utils/date'
import { ConflictResolutionActions } from './ConflictResolutionActions'

export interface ConflictIncomingStateCardProps {
  selectedConflict: SyncConflictItem
  isPM: boolean
  isSupervisor: boolean
  handleOpenResolve: (
    decision:
      | 'ACCEPT_INCOMING'
      | 'KEEP_SERVER_STATE'
      | 'FORK_NEW_ATTEMPT'
      | 'SUBMIT_RESCUE_TO_SUP'
      | 'AUTHORIZE_RESCUE'
      | 'SUPERVISOR_REJECT_RESCUE'
      | 'REQUEST_ADDITIONAL_EVIDENCE'
  ) => void
}

export const ConflictIncomingStateCard: React.FC<ConflictIncomingStateCardProps> = ({
  selectedConflict,
  isPM,
  isSupervisor,
  handleOpenResolve
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxInitialMode, setLightboxInitialMode] = useState<'PRIMARY' | 'SECONDARY' | 'SPLIT'>('PRIMARY')
  return (
    <div className="lg:col-span-6 flex flex-col gap-4">
      <Card className="p-4 bg-white border-2 border-brand-gold/40 shadow-xs flex-1 flex flex-col justify-between relative">
        <div className="space-y-4">
          {/* Tiêu đề & Nhãn cột 2 thay đổi động theo từng loại xung đột */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Icon
                name={
                  selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'swap_horiz'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'phonelink_setup'
                    : 'smartphone'
                }
                size={16}
                className={
                  selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'text-blue-700'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'text-purple-700'
                    : 'text-brand-gold'
                }
              />
              <span className="font-bold text-slate-900 text-sm tracking-wide">
                {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? `2. Số liệu Đội điều chuyển: ${selectedConflict.server_state.current_assignee}`
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? '2. Gói Dữ Liệu Cứu Hộ Ngoại Tuyến (Trích xuất SQLite OTG)'
                  : '2. Dữ liệu hiện trường (Mobile Client)'}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : 'bg-[#FBF6E9] text-brand-goldMuted border border-[#F1E5C6]'
              }`}
            >
              {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                ? 'Đội điều chuyển'
                : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                ? 'Cứu hộ thiết bị'
                : 'Hiện trường'}
            </span>
          </div>

          {/* Phân nhánh hiển thị: Ca POLICY_VERSION_MISMATCH */}
          {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' ? (
            <div className="space-y-3">
              {/* 1. Ảnh đo đạc thước vạch thực tế của Crew */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Ảnh Đo Đạc Thước Vạch Thực Địa (Chụp Ngoại Tuyến)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxInitialMode('PRIMARY')
                      setIsLightboxOpen(true)
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Icon name="zoom_in" size={12} />
                    <span>Phóng to ảnh</span>
                  </button>
                </div>
                <div
                  onClick={() => {
                    setLightboxInitialMode('PRIMARY')
                    setIsLightboxOpen(true)
                  }}
                  className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                  title="Bấm để xem ảnh phóng to toàn màn hình"
                >
                  <SafeImage
                    src={selectedConflict.incoming_data.photo_evidence_url}
                    alt="Ảnh thước đo thực tế"
                    vectorType="CRACK_OPTICAL"
                    chainage={selectedConflict.chainage}
                    value={selectedConflict.incoming_data.measured_value}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-slate-950/80 text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Icon name="zoom_in" size={14} />
                      <span>Bấm để phóng to chi tiết</span>
                    </span>
                  </div>
                  {/* Floating Timestamp Badge */}
                  <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                    <Icon name="schedule" size={12} className="text-brand-gold" />
                    <span>{formatConflictDateTime(selectedConflict.offline_actor.captured_at)}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                    <span className="text-white text-[10px] font-mono leading-tight">
                      Lý trình: {selectedConflict.chainage}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. PHIẾU KẾT QUẢ ĐO ĐẠC THỰC ĐỊA DO CREW NHẬP & ĐỐI CHIẾU CHÍNH SÁCH */}
              <div className="p-3.5 rounded-xl bg-white border border-amber-300 shadow-2xs space-y-3 text-xs">
                {/* Header phiếu đo đạc */}
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="assignment" size={18} className="text-amber-800" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                        Phiếu Đo Đạc Thực Địa Do Tổ Đo Nộp
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Áp dụng chính sách lưu cục bộ trên thiết bị
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {selectedConflict.incoming_data.applied_policy_version || 'POL-TCVN-2024-V1'}
                  </span>
                </div>

                {/* Thông tin nhân sự & thiết bị nộp */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Kỹ sư thực hiện</span>
                    <span className="font-bold text-slate-800">{selectedConflict.offline_actor.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {selectedConflict.offline_actor.device_model || selectedConflict.offline_actor.device_id}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Thời điểm đo</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatConflictDateTime(selectedConflict.offline_actor.captured_at)}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium block">
                      Đo ngoại tuyến tại hiện trường
                    </span>
                  </div>
                </div>

                {/* BẢNG CÁC SỐ ĐO CREW ĐÃ NHẬP VÀO FORM & ĐỐI CHIẾU 2 BỘ CHÍNH SÁCH */}
                <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 flex items-center justify-between">
                    <span>ĐỐI CHIẾU SỐ ĐO VỚI QUY CHUẨN</span>
                    <span className="font-mono text-[10px] text-blue-800 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {selectedConflict.incoming_data.policy_measurements?.length || 0} thông số
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {selectedConflict.incoming_data.policy_measurements && selectedConflict.incoming_data.policy_measurements.length > 0 ? (
                      selectedConflict.incoming_data.policy_measurements.map((m, mIdx) => {
                        const serverRule = selectedConflict.server_state.policy_measurements?.find(r => r.code === m.code)
                        const isExceeded = serverRule != null && m.measured_value > serverRule.maximum
                        const paramLabel = m.code === 'CRACK_WIDTH' 
                          ? 'Bề rộng vết nứt' 
                          : m.code === 'CRACK_LENGTH' 
                          ? 'Chiều dài vết nứt' 
                          : (m.name || m.code)

                        return (
                          <div key={mIdx} className="p-2.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">{paramLabel}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                                  {m.measured_value} {m.unit}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <span className="text-slate-500 text-[10px]">CS Cũ ({selectedConflict.incoming_data.applied_policy_version || 'V1'} ≤ {m.policy_maximum} {m.unit}):</span>
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  ✓ Đạt
                                </span>
                              </div>
                              <div className={`p-1.5 rounded border flex items-center justify-between ${isExceeded ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                                <span className="text-slate-500 text-[10px]">CS Mới ({selectedConflict.server_state.policy_version} ≤ {serverRule ? serverRule.maximum : '—'} {m.unit}):</span>
                                {isExceeded ? (
                                  <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.5 rounded border border-rose-300">
                                    ✕ Vượt ({m.measured_value} &gt; {serverRule?.maximum})
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    ✓ Đạt
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-3 text-slate-400 italic text-center">Không có số đo chi tiết trong CSDL</div>
                    )}
                  </div>
                </div>

                {/* Ghi chú thực địa do Crew nhập */}
                {selectedConflict.incoming_data.notes && (
                  <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200 text-xs flex items-start justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] font-semibold uppercase block">Ghi chú hiện trường:</span>
                      <p className="text-[11px] text-slate-700 italic pt-0.5">
                        "{selectedConflict.incoming_data.notes}"
                      </p>
                    </div>
                    <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300 shrink-0">
                      XÁC THỰC THỰC ĐỊA
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' ? (
            /* Ca ĐỔI ĐỘI NGOẠI TUYẾN: Cột 2 hiển thị toàn bộ hồ sơ đo đối chứng của Đội Điều Chuyển (Synthetic crew-b) */
            <div className="space-y-3">
              {/* 1. Ảnh đo kích thước ổ gà đối chứng */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Ảnh Đo Kích Thước Ổ Gà Đối Chứng (Chụp Trực Tuyến)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxInitialMode('PRIMARY')
                      setIsLightboxOpen(true)
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Icon name="zoom_in" size={12} />
                    <span>Phóng to</span>
                  </button>
                </div>
                <div
                  onClick={() => {
                    setLightboxInitialMode('PRIMARY')
                    setIsLightboxOpen(true)
                  }}
                  className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                  title="Bấm để xem ảnh phóng to toàn màn hình"
                >
                  <SafeImage
                    src={selectedConflict.server_state.server_photo_url}
                    alt="Ảnh đo đối chứng của Đội Điều Chuyển"
                    vectorType="POTHOLE_BEFORE"
                    chainage={selectedConflict.chainage}
                    value={
                      selectedConflict.server_state.reassigned_measurements
                        ? `${selectedConflict.server_state.reassigned_measurements.find(m => m.code === 'POTHOLE_DEPTH')?.measured_value ?? 5.2} cm (S: ${selectedConflict.server_state.reassigned_measurements.find(m => m.code === 'POTHOLE_AREA')?.measured_value ?? 1.20} m²)`
                        : '5.2 cm (S: 1.20 m²)'
                    }
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-slate-950/80 text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Icon name="zoom_in" size={14} />
                      <span>Bấm để phóng to chi tiết</span>
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                    <Icon name="schedule" size={12} className="text-blue-400" />
                    <span>
                      {formatConflictDateTime(selectedConflict.server_state.measured_at || selectedConflict.server_state.last_updated)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                    <span className="text-white text-[10px] font-mono leading-tight">
                      Lý trình: {selectedConflict.chainage} • Đo đối chứng trực tuyến
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. PHIẾU KẾT QUẢ ĐO ĐỐI CHỨNG CỦA ĐỘI ĐIỀU CHUYỂN */}
              <div className="p-3.5 rounded-xl bg-white border border-blue-300 shadow-2xs space-y-3 text-xs">
                {/* Header phiếu */}
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="assignment_turned_in" size={18} className="text-blue-800" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                        Phiếu Đo Đạc Đối Chứng - Đội Điều Chuyển
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Nhiệm vụ {selectedConflict.task_code} • {selectedConflict.defect_code}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-blue-100 text-blue-900 border border-blue-300">
                    ĐỘI ĐIỀU CHUYỂN
                  </span>
                </div>

                {/* Thông tin nhân sự và thiết bị của Đội Điều Chuyển */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Kỹ sư thực hiện</span>
                    <span className="font-bold text-slate-800">{selectedConflict.server_state.current_assignee}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {selectedConflict.server_state.device_model || selectedConflict.server_state.device_id || 'TB-CREW-02'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Thời điểm đo</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatConflictDateTime(selectedConflict.server_state.measured_at || selectedConflict.server_state.last_updated)}
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium block">
                      Đo đối chứng trực tuyến
                    </span>
                  </div>
                </div>

                {/* BẢNG CHỈ SỐ ĐO LƯỜNG KỸ THUẬT CỦA ĐỘI ĐIỀU CHUYỂN */}
                <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 flex items-center justify-between">
                    <span>CHỈ SỐ ĐO LƯỜNG ĐỐI CHỨNG (Ổ GÀ)</span>
                    <span className="font-mono text-[10px] text-blue-800 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      2 chỉ số
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    <div className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block">Chiều sâu ổ gà</span>
                        <span className="text-[10px] text-slate-500">Thước vạch cắm đáy hố (TCVN 8864)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-xs">
                          {selectedConflict.server_state.reassigned_measurements?.find(m => m.code === 'POTHOLE_DEPTH')?.measured_value ?? selectedConflict.server_state.depth_cm ?? 5.2} cm
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block">Diện tích bề mặt</span>
                        <span className="text-[10px] text-slate-500">Đo chu vi đáy & diện tích chiếu phẳng</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-xs">
                          {selectedConflict.server_state.reassigned_measurements?.find(m => m.code === 'POTHOLE_AREA')?.measured_value ?? selectedConflict.server_state.area_sqm ?? 1.20} m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ghi chú thực địa của Đội Điều Chuyển */}
                {selectedConflict.server_state.server_notes && (
                  <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-200 text-xs flex items-start justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] font-semibold uppercase block">Ghi chú hiện trường:</span>
                      <p className="text-[11px] text-slate-700 italic pt-0.5">
                        "{selectedConflict.server_state.server_notes}"
                      </p>
                    </div>
                    <span className="font-mono text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold border border-blue-300 shrink-0">
                      ĐỐI CHỨNG TRỰC TUYẾN
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
            /* Ca CỨU HỘ THIẾT BỊ NGOẠI TUYẾN: Cột 2 hiển thị gói dữ liệu trích xuất SQLite cục bộ qua cáp OTG / ADB Dump */
            <div className="space-y-3">
              {/* 1. Ảnh đo đạc thực tế trích xuất từ dữ liệu SQLite */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                    Ảnh Đo Đạc Thực Địa Trích Xuất Từ Bộ Nhớ Cục Bộ
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxInitialMode('PRIMARY')
                      setIsLightboxOpen(true)
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Icon name="zoom_in" size={12} />
                    <span>Phóng to</span>
                  </button>
                </div>
                <div
                  onClick={() => {
                    setLightboxInitialMode('PRIMARY')
                    setIsLightboxOpen(true)
                  }}
                  className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                  title="Bấm để xem ảnh phóng to toàn màn hình"
                >
                  <SafeImage
                    src={selectedConflict.incoming_data.photo_evidence_url}
                    alt="Ảnh trích xuất cứu hộ"
                    vectorType="CRACK_OPTICAL"
                    chainage={selectedConflict.chainage}
                    value={selectedConflict.incoming_data.measured_value}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-slate-950/80 text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Icon name="zoom_in" size={14} />
                      <span>Bấm để phóng to chi tiết</span>
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                    <Icon name="schedule" size={12} className="text-purple-400" />
                    <span>
                      {formatConflictDateTime(selectedConflict.incoming_data.handover_timestamp || selectedConflict.offline_actor.captured_at)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                    <span className="text-white text-[10px] font-mono leading-tight">
                      Lý trình: {selectedConflict.chainage} • Dữ liệu trích xuất ADB/OTG
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Phiếu kiểm định gói dữ liệu cứu hộ */}
              <div className="p-3.5 rounded-xl bg-white border border-purple-300 shadow-2xs space-y-3 text-xs">
                {/* Header phiếu */}
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="phonelink_setup" size={18} className="text-purple-800" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                        Phiếu Kiểm Định Gói Dữ Liệu Cứu Hộ SQLite
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Nhiệm vụ {selectedConflict.task_code} • {selectedConflict.defect_code}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-extrabold px-2.5 py-1 rounded bg-purple-100 text-purple-900 border border-purple-300">
                    CỨU HỘ NGOẠI LỆ
                  </span>
                </div>

                {/* Thông tin thiết bị cứu hộ & nhân sự bàn giao */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Thiết bị tiếp nhận cứu hộ</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedConflict.incoming_data.rescue_device_serial || '—'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Thời điểm bàn giao</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedConflict.incoming_data.handover_timestamp
                        ? formatConflictDateTime(selectedConflict.incoming_data.handover_timestamp)
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* BẢNG CHỈ SỐ KỸ THUẬT TRÍCH XUẤT ĐƯỢC TỪ CSDL CỤC BỘ */}
                <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 flex items-center justify-between">
                    <span>CHỈ SỐ ĐO ĐẠC TRÍCH XUẤT TỪ BỘ NHỚ</span>
                    <span className="font-mono text-[10px] text-purple-800 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                      {selectedConflict.incoming_data.extracted_measurements
                        ? Object.keys(selectedConflict.incoming_data.extracted_measurements).length
                        : 0}{' '}
                      chỉ số
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {selectedConflict.incoming_data.extracted_measurements?.width_mm != null && (
                      <div className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-800 block">Bề rộng vết nứt</span>
                          <span className="text-[10px] text-slate-500">Đo độ mở rộng khe nứt</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-xs">
                            {selectedConflict.incoming_data.extracted_measurements.width_mm} mm
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedConflict.incoming_data.extracted_measurements?.crack_length_m != null && (
                      <div className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-800 block">Chiều dài vết nứt</span>
                          <span className="text-[10px] text-slate-500">Đo dọc theo vệt hư hỏng</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-xs">
                            {selectedConflict.incoming_data.extracted_measurements.crack_length_m} m
                          </span>
                        </div>
                      </div>
                    )}
                    {!selectedConflict.incoming_data.extracted_measurements && (
                      <div className="p-2.5 flex items-center justify-between text-xs">
                        <span className="text-slate-600">Số đo ghi nhận:</span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 text-xs">
                          {selectedConflict.incoming_data.measured_value || 'Chưa có số liệu'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ghi chú sự cố từ CSDL hiện trường */}
                {selectedConflict.incoming_data.notes && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] font-semibold uppercase block">Ghi chú sự cố:</span>
                      <p className="text-[11px] text-slate-800 italic pt-0.5">
                        "{selectedConflict.incoming_data.notes}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Các ca xung đột khác (DUPLICATE_WORK_ATTEMPT) */
            <>
              <div className={selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'w-full space-y-1'}>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                      {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                        ? 'Ảnh thước dưỡng 3m (TCVN 8864)'
                        : 'Ảnh đo kích thước ổ gà thực địa (Chụp ngoại tuyến)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxInitialMode('PRIMARY')
                        setIsLightboxOpen(true)
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      <Icon name="zoom_in" size={12} />
                      <span>Phóng to</span>
                    </button>
                  </div>
                  <div
                    onClick={() => {
                      setLightboxInitialMode('PRIMARY')
                      setIsLightboxOpen(true)
                    }}
                    className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                    title="Bấm để xem ảnh phóng to toàn màn hình"
                  >
                    <SafeImage
                      src={selectedConflict.incoming_data.photo_evidence_url}
                      alt="Ảnh thước đo thực tế"
                      vectorType={
                        selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                          ? 'RUTTING_3M_BEAM'
                          : 'EXPANSION_JOINT'
                      }
                      chainage={selectedConflict.chainage}
                      value={selectedConflict.incoming_data.measured_value}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-slate-950/80 text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Icon name="zoom_in" size={14} />
                        <span>Bấm để phóng to chi tiết</span>
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                      <Icon name="schedule" size={12} className="text-brand-gold" />
                      <span>{formatConflictDateTime(selectedConflict.offline_actor.captured_at)}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                      <span className="text-white text-[10px] font-mono leading-tight">
                        Lý trình: {selectedConflict.chainage}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                        Ảnh cào bóc tạo phẳng (Wirtgen 1.0m)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxInitialMode('SECONDARY')
                          setIsLightboxOpen(true)
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                      >
                        <Icon name="zoom_in" size={12} />
                        <span>Phóng to</span>
                      </button>
                    </div>
                    <div
                      onClick={() => {
                        setLightboxInitialMode('SECONDARY')
                        setIsLightboxOpen(true)
                      }}
                      className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                      title="Bấm để xem ảnh phóng to toàn màn hình"
                    >
                      <SafeImage
                        src={selectedConflict.incoming_data.photo_after_url}
                        alt="Ảnh hoàn thiện"
                        vectorType="RUTTING_AFTER_MILLING"
                        chainage={selectedConflict.chainage}
                        value="ĐẦM LÈN K95 HOÀN THIỆN"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-slate-950/80 text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Icon name="zoom_in" size={14} />
                          <span>Bấm để phóng to chi tiết</span>
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                        <Icon name="schedule" size={12} className="text-emerald-400" />
                        <span>{formatConflictDateTime(selectedConflict.offline_actor.captured_at)}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                        <span className="text-white text-[10px] font-mono leading-tight">
                          Thời điểm chụp: {formatConflictDateTime(selectedConflict.offline_actor.captured_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Thông tin thời gian ngoại tuyến */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Icon name="schedule" size={14} className="text-brand-gold" />
                  <span>Thời điểm ghi nhận ngoại tuyến:</span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  {formatConflictDateTime(selectedConflict.offline_actor.captured_at)}
                </span>
              </div>

              {/* Chi tiết đo đạc và thông tin thiết bị thợ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Số liệu đo hiện trường:</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedConflict.incoming_data.measured_value}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Phương pháp: {selectedConflict.incoming_data.measurement_type}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Kỹ sư & Thiết bị nộp:</span>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {selectedConflict.offline_actor.name}
                  </div>
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                    {selectedConflict.offline_actor.device_model || selectedConflict.offline_actor.device_id}
                  </div>
                </div>
              </div>

              {/* Thông tin xác thực & Ghi chú từ hiện trường */}
              {selectedConflict.incoming_data.notes && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] font-semibold">Ghi chú hiện trường:</span>
                    <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                      XÁC THỰC THỰC ĐỊA
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 italic pt-0.5">
                    "{selectedConflict.incoming_data.notes}"
                  </div>
                </div>
              )}
            </>
          )}

          {/* Lịch sử phân giải nếu đã quyết định */}
          {selectedConflict.resolution && (
            <div
              className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                selectedConflict.resolution.decision === 'REQUEST_ADDITIONAL_EVIDENCE'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : selectedConflict.resolution.decision === 'SUBMIT_RESCUE_TO_SUP'
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : selectedConflict.resolution.decision === 'SUPERVISOR_REJECT_RESCUE'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Icon
                    name={
                      selectedConflict.resolution.decision === 'REQUEST_ADDITIONAL_EVIDENCE'
                        ? 'add_a_photo'
                        : selectedConflict.resolution.decision === 'SUBMIT_RESCUE_TO_SUP'
                        ? 'hourglass_top'
                        : selectedConflict.resolution.decision === 'SUPERVISOR_REJECT_RESCUE'
                        ? 'cancel'
                        : 'check_circle'
                    }
                    size={14}
                    className={
                      selectedConflict.resolution.decision === 'REQUEST_ADDITIONAL_EVIDENCE'
                        ? 'text-amber-600'
                        : selectedConflict.resolution.decision === 'SUBMIT_RESCUE_TO_SUP'
                        ? 'text-purple-600'
                        : selectedConflict.resolution.decision === 'SUPERVISOR_REJECT_RESCUE'
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }
                  />
                  {selectedConflict.resolution.decision === 'ACCEPT_INCOMING'
                    ? selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? `Đã công nhận ${selectedConflict.offline_actor.name}`
                      : 'Công nhận số đo hiện trường'
                    : selectedConflict.resolution.decision === 'KEEP_SERVER_STATE'
                    ? selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? `Đã công nhận ${selectedConflict.server_state.current_assignee}`
                      : 'Giữ nguyên chính sách máy chủ'
                    : selectedConflict.resolution.decision === 'SUBMIT_RESCUE_TO_SUP'
                    ? 'Đã gửi tờ trình Giám sát'
                    : selectedConflict.resolution.decision === 'REQUEST_ADDITIONAL_EVIDENCE'
                    ? 'Đã phát lệnh yêu cầu đo lại & bổ sung ảnh'
                    : selectedConflict.resolution.decision === 'AUTHORIZE_RESCUE'
                    ? 'Đã xác nhận dữ liệu cứu hộ'
                    : selectedConflict.resolution.decision === 'SUPERVISOR_REJECT_RESCUE'
                    ? 'Đã từ chối gói cứu hộ'
                    : selectedConflict.resolution.decision === 'FORK_NEW_ATTEMPT'
                    ? 'Đã tạo phụ lục đợt mới'
                    : selectedConflict.resolution.decision}
                </span>
                <span className="font-mono text-[10px] opacity-75">
                  {formatConflictDateTime(selectedConflict.resolution.decided_at)}
                </span>
              </div>
              <div className="text-[11px] opacity-90 italic">
                "{selectedConflict.resolution.reason}" — {selectedConflict.resolution.decided_by}
              </div>
            </div>
          )}
        </div>

        {/* Cụm nút thao tác phân giải theo ngữ cảnh từng loại xung đột */}
        <ConflictResolutionActions
          selectedConflict={selectedConflict}
          isPM={isPM}
          isSupervisor={isSupervisor}
          handleOpenResolve={handleOpenResolve}
        />
      </Card>

      {/* Lightbox Phóng to ảnh Chứng cứ Ngoại Tuyến */}
      {isLightboxOpen && (
        <PhotoLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={`Chứng Cứ Ngoại Tuyến: ${selectedConflict.conflict_code} • ${selectedConflict.defect_code}`}
          subtitle={`Đội thi công: ${selectedConflict.offline_actor.name} — Lý trình ${selectedConflict.chainage}`}
          primaryPhotoUrl={
            (lightboxInitialMode === 'SECONDARY'
              ? selectedConflict.incoming_data.photo_after_url
              : selectedConflict.incoming_data.photo_evidence_url) || ''
          }
          primaryPhotoLabel={
            lightboxInitialMode === 'SECONDARY'
              ? 'Ảnh Hoàn Thiện Sau Thi Công'
              : 'Ảnh Thước Đo Thực Địa (Mobile Client)'
          }
          secondaryPhotoUrl={
            lightboxInitialMode === 'SECONDARY'
              ? selectedConflict.incoming_data.photo_evidence_url
              : selectedConflict.server_state.server_photo_url || selectedConflict.incoming_data.photo_after_url
          }
          secondaryPhotoLabel={
            lightboxInitialMode === 'SECONDARY'
              ? 'Ảnh Thước Đo Thực Địa'
              : 'Dữ Liệu Cơ Sở (Server Version)'
          }
          chainage={selectedConflict.chainage}
          deviceInfo={selectedConflict.offline_actor.device_model || 'Samsung Galaxy Tab Active 4 Pro'}
          capturedAt={selectedConflict.offline_actor.captured_at}
          technicianName={selectedConflict.offline_actor.name}
          notes={selectedConflict.incoming_data.notes}
          statusBadge={
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-900/80 text-amber-200">
              {selectedConflict.status_label}
            </span>
          }
        />
      )}
    </div>
  )
}
