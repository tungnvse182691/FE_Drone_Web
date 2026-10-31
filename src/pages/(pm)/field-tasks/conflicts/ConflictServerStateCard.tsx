import React, { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'
import { PhotoLightboxModal } from '../../../../components/common/PhotoLightboxModal'
import { formatConflictDateTime } from '../../../../utils/date'

export interface ConflictServerStateCardProps {
  selectedConflict: SyncConflictItem
  isPM?: boolean
  isSupervisor?: boolean
  handleOpenResolve?: (
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

export const ConflictServerStateCard: React.FC<ConflictServerStateCardProps> = ({
  selectedConflict,
  isPM,
  isSupervisor,
  handleOpenResolve
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const photoUrl =
    selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a?.photo_url
      ? selectedConflict.duplicate_device_a.photo_url
      : selectedConflict.server_state.server_photo_url

  const photoTitle =
    selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
      ? 'Ảnh sơ bộ chụp từ Thiết Bị 1 (Máy phụ)'
      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
      ? 'Bằng chứng hiện trường: Thiết bị rơi vỡ màn hình'
      : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
      ? 'Ảnh đo kích thước ổ gà thực địa (Chụp ngoại tuyến)'
      : 'Ảnh hiện trạng lưu trữ trên máy chủ'

  return (
    <div className="lg:col-span-6 flex flex-col gap-4">
      <Card className="p-4 bg-slate-50 border border-slate-200 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Tiêu đề & Nhãn cột 1 thay đổi động theo từng loại xung đột */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Icon
                name={
                  selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'group'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'phonelink_erase'
                    : 'archive'
                }
                size={16}
                className={
                  selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'text-amber-700'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'text-purple-700'
                    : 'text-slate-600'
                }
              />
              <span className="font-bold text-slate-900 text-sm tracking-wide">
                {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? `1. Số liệu Đội ban đầu: ${selectedConflict.offline_actor.name}`
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? '1. Thiết bị gặp sự cố & Hồ sơ máy chủ'
                  : '1. Dữ liệu máy chủ (Server Version)'}
              </span>
            </div>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                ? 'Đội ban đầu'
                : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                ? 'Thiết bị hỏng'
                : 'Server'}
            </span>
          </div>

          {/* Nội dung Cột Trái: Phân nhánh theo loại xung đột */}
          {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' ? (
            /* Ca LỆCH CHÍNH SÁCH KỸ THUẬT: Máy chủ chỉ quản lý Văn bản & Quy chuẩn chính sách mới (Không có ảnh khảo sát) */
            <div className="space-y-3">
              {/* Thông tin quy chuẩn kỹ thuật máy chủ hiện hành */}
              <div className="p-3.5 rounded-xl bg-white border border-blue-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="gavel" size={18} className="text-blue-700" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                        Quy Chuẩn Kỹ Thuật Máy Chủ Hiện Hành
                      </span>
                      <span className="text-[10px] text-slate-500">Áp dụng cho khiếm khuyết {selectedConflict.defect_code}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-blue-100 text-blue-900 border border-blue-300">
                    {selectedConflict.server_state.policy_version || 'Chưa xác định'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Cấp ban hành</span>
                    <span className="font-bold text-slate-800">{selectedConflict.server_state.current_assignee || 'Hệ thống'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">Thời điểm hiệu lực</span>
                    <span className="font-mono font-bold text-slate-800">{formatConflictDateTime(selectedConflict.server_state.last_updated)}</span>
                  </div>
                </div>

                {/* BẢNG THÔNG SỐ ĐỊNH MỨC KỸ THUẬT THEO CSDL (RepairMeasurementRule) */}
                <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 flex items-center justify-between">
                    <span>ĐỊNH MỨC QUY ĐỊNH MÁY CHỦ ({selectedConflict.server_state.policy_version})</span>
                    <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {selectedConflict.server_state.current_status}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {selectedConflict.server_state.policy_measurements && selectedConflict.server_state.policy_measurements.length > 0 ? (
                      selectedConflict.server_state.policy_measurements.map((rule, rIdx) => (
                        <div key={rIdx} className="p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {rule.code === 'CRACK_WIDTH' 
                                ? 'Bề rộng vết nứt' 
                                : rule.code === 'CRACK_LENGTH' 
                                ? 'Chiều dài vết nứt' 
                                : (rule.name || rule.code)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 text-xs">
                              ≤ {rule.maximum} {rule.unit}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-slate-400 italic text-xs">
                        Không có quy tắc đo đạc trong CSDL
                      </div>
                    )}
                  </div>
                </div>

                {/* Tóm tắt căn cứ điều chỉnh chính sách */}
                {selectedConflict.server_state.policy_summary && (
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs">
                    <span className="text-[10px] text-blue-800 font-semibold uppercase block">Căn cứ điều chỉnh chính sách:</span>
                    <p className="text-[11px] text-slate-700 italic pt-0.5">
                      "{selectedConflict.server_state.policy_summary}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Ảnh Cột Trái cho các ca đo đạc, đổi đội hoặc cứu hộ thiết bị */
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  {photoTitle}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <Icon name="zoom_in" size={12} />
                  <span>Phóng to ảnh</span>
                </button>
              </div>
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                title="Bấm để xem ảnh phóng to toàn màn hình"
              >
                <SafeImage
                  src={photoUrl}
                  alt="Ảnh Cột Trái"
                  vectorType={
                    selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? 'POTHOLE_BEFORE'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'BROKEN_DEVICE_INCIDENT'
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                      ? 'RUTTING_3M_BEAM'
                      : 'EXPANSION_JOINT'
                  }
                  chainage={selectedConflict.chainage}
                  value={
                    selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? '4.8 cm (S: 1.15 m²)'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'THIẾT BỊ HỎNG VẬT LÝ'
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                      ? 'LÚN SƠ BỘ ~20mm'
                      : undefined
                  }
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-slate-950/80 text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Icon name="zoom_in" size={14} />
                    <span>Bấm để phóng to chi tiết</span>
                  </span>
                </div>
                {/* Floating Top Timestamp Badge */}
                <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1.5 shadow-md z-10">
                  <Icon name="schedule" size={12} className="text-brand-gold" />
                  <span>
                    {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? formatConflictDateTime(selectedConflict.offline_actor.captured_at)
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a
                      ? formatConflictDateTime(selectedConflict.duplicate_device_a.captured_at)
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? formatConflictDateTime(selectedConflict.incoming_data.handover_timestamp || selectedConflict.offline_actor.captured_at)
                      : formatConflictDateTime(selectedConflict.server_state.last_updated)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                  <span className="text-white text-[11px] font-mono font-medium">
                    {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? `Đo ngoại tuyến lúc: ${formatConflictDateTime(selectedConflict.offline_actor.captured_at)}`
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a
                      ? `Thiết bị 1 ghi nhận lúc: ${formatConflictDateTime(selectedConflict.duplicate_device_a.captured_at)}`
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? `Thời điểm ghi nhận sự cố: ${formatConflictDateTime(selectedConflict.incoming_data.handover_timestamp || selectedConflict.offline_actor.captured_at)}`
                      : `Máy chủ cập nhật lúc: ${formatConflictDateTime(selectedConflict.server_state.last_updated)}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nội dung chi tiết Cột Trái: Tinh giản, chỉ giữ dữ liệu kỹ thuật trọng yếu */}
          <div className="space-y-2 text-xs">
            {/* Trường hợp ASSIGNMENT_REASSIGNED: Số liệu chi tiết của Đội Ban Đầu */}
            {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' ? (
              <div className="p-3.5 rounded-xl bg-white border border-amber-300 shadow-2xs space-y-3 text-xs">
                {/* Header thông tin Đội Ban Đầu */}
                <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="assignment" size={18} className="text-amber-800" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                        Phiếu Đo Đạc Thực Địa - Đội Ban Đầu
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Nhiệm vụ {selectedConflict.task_code} • {selectedConflict.defect_code}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    ĐỘI BAN ĐẦU
                  </span>
                </div>

                {/* Thông tin nhân sự và thiết bị của Đội Ban Đầu */}
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

                {/* BẢNG CHỈ SỐ ĐO LƯỜNG KỸ THUẬT CỦA ĐỘI BAN ĐẦU */}
                <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-[11px] text-slate-700 flex items-center justify-between">
                    <span>CHỈ SỐ ĐO LƯỜNG HÌNH HỌC (Ổ GÀ)</span>
                    <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
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
                          {selectedConflict.incoming_data.policy_measurements?.find(m => m.code === 'POTHOLE_DEPTH')?.measured_value ?? 4.8} cm
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
                          {selectedConflict.incoming_data.policy_measurements?.find(m => m.code === 'POTHOLE_AREA')?.measured_value ?? 1.15} m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ghi chú thực địa của Đội Ban Đầu */}
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
            ) : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a ? (
              /* Trường hợp DUPLICATE_WORK_ATTEMPT: Thiết bị 1 */
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Người nộp (Thiết bị 1):</span>
                  <span className="font-semibold text-slate-800 text-xs">
                    {selectedConflict.duplicate_device_a.name} ({selectedConflict.duplicate_device_a.device_id})
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Số đo sơ bộ:</span>
                  <span className="font-bold text-blue-700 text-sm">
                    {selectedConflict.duplicate_device_a.measured_value}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Mã băm SHA-256:</span>
                  <span className="text-slate-700">{selectedConflict.duplicate_device_a.sha256_hash.substring(0, 16)}...</span>
                </div>
              </div>
            ) : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' ? (
              /* Trường hợp POLICY_VERSION_MISMATCH: Thông tin kiểm toán chính sách */
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Mã khiếm khuyết áp dụng:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedConflict.defect_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Trạng thái chính sách máy chủ:</span>
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                    selectedConflict.server_state.current_status === 'PUBLISHED'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : selectedConflict.server_state.current_status === 'REVOKED'
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                  }`}>
                    {selectedConflict.server_state.current_status}
                  </span>
                </div>
              </div>
            ) : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
              /* Trường hợp DEVICE_RESCUE_PENDING: Hồ sơ sự cố thiết bị & Đối soát máy chủ theo Quy trình Q17 (TCVN 8864) */
              <div className="space-y-3">
                {/* 1. Khối thông tin sự cố hư hỏng vật lý */}
                <div className="p-3.5 rounded-xl bg-white border border-purple-200 shadow-2xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="phonelink_erase" size={18} className="text-purple-700" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                          Biên Bản Sự Cố Thiết Bị Hiện Trường
                        </span>
                        <span className="text-[10px] text-slate-500">Mã thiết bị gặp sự cố: {selectedConflict.offline_actor.device_id || '—'}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                      SỰ CỐ PHẦN CỨNG
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Kỹ sư phụ trách</span>
                      <span className="font-bold text-slate-800">{selectedConflict.offline_actor.name || '—'}</span>
                      <span className="text-[10px] text-slate-500 block truncate font-mono">
                        {selectedConflict.offline_actor.device_model || selectedConflict.offline_actor.device_id || '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Thời điểm phát sinh</span>
                      <span className="font-mono font-bold text-slate-800">
                        {selectedConflict.incoming_data.handover_timestamp
                          ? formatConflictDateTime(selectedConflict.incoming_data.handover_timestamp)
                          : formatConflictDateTime(selectedConflict.offline_actor.captured_at)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
                    <span className="text-slate-500 text-[10px] font-semibold uppercase block">Mô tả sự cố vật lý:</span>
                    <p className="text-[11px] text-purple-950 font-medium pt-0.5 italic">
                      "{selectedConflict.incoming_data.notes || '—'}"
                    </p>
                  </div>
                </div>

                {/* 2. Khối thông tin đối soát máy chủ trung tâm */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="dns" size={16} className="text-slate-700" />
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                        Đối Soát Máy Chủ Trung Tâm
                      </span>
                    </div>
                    {selectedConflict.server_state.security_status && (
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {selectedConflict.server_state.security_status}
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100">
                    {selectedConflict.server_state.last_updated && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Đồng bộ bình thường cuối cùng:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatConflictDateTime(selectedConflict.server_state.last_updated)}
                        </span>
                      </div>
                    )}
                    {selectedConflict.server_state.sla_deadline && (
                      <div className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Hạn mức xử lý sự cố (SLA):</span>
                        <span className="font-mono text-[11px] font-bold text-slate-800">
                          {selectedConflict.server_state.sla_deadline}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Các trường hợp còn lại */
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Đơn vị ghi nhận:</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedConflict.server_state.current_assignee}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Quy chuẩn áp dụng:</span>
                  <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedConflict.server_state.policy_version}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <span className="text-slate-500 text-[11px] block">Ghi chú hệ thống:</span>
                  <p className="text-slate-700 text-xs italic mt-0.5">"{selectedConflict.server_state.server_notes}"</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NÚT THAO TÁC CÔNG NHẬN ĐỘI BAN ĐẦU (NẰM TRỰC TIẾP DƯỚI CHÂN CỘT ĐỘI BAN ĐẦU) */}
        {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' && handleOpenResolve && (
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {selectedConflict.status === 'CONFLICT_INTAKE' ? (
                <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <Icon name="schedule" size={15} /> Chờ phân giải
                </span>
              ) : selectedConflict.status === 'RESOLVED_ACCEPT_INCOMING' ? (
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Icon name="check_circle" size={15} /> Đã công nhận {selectedConflict.offline_actor.name}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Icon name="cancel" size={15} /> Đã bác bỏ
                </span>
              )}
            </div>

            {selectedConflict.status === 'CONFLICT_INTAKE' && isPM && (
              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3.5 py-2 rounded-lg text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title={`Công nhận số liệu đo thực địa của ${selectedConflict.offline_actor.name}, bác bỏ số liệu ${selectedConflict.server_state.current_assignee}`}
              >
                <Icon name="check_circle" size={15} />
                <span>Công nhận {selectedConflict.offline_actor.name} (Bác bỏ {selectedConflict.server_state.current_assignee})</span>
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Lightbox Phóng to ảnh Cột Trái */}
      {isLightboxOpen && (
        <PhotoLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={`Đối Chiếu: ${selectedConflict.conflict_code} • ${photoTitle}`}
          subtitle={`Khiếm khuyết: ${selectedConflict.defect_code} — Lý trình ${selectedConflict.chainage}`}
          primaryPhotoUrl={photoUrl}
          primaryPhotoLabel="Dữ Liệu Cơ Sở (Server Version)"
          secondaryPhotoUrl={selectedConflict.incoming_data.photo_evidence_url}
          secondaryPhotoLabel="Ảnh Thước Đo Thực Địa (Mobile Client)"
          chainage={selectedConflict.chainage}
          deviceInfo={
            selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
              ? 'Samsung Galaxy Tab Active 3 (Thiết bị 1)'
              : 'Server Central Database'
          }
          capturedAt={
            selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a
              ? selectedConflict.duplicate_device_a.captured_at
              : selectedConflict.server_state.last_updated
          }
          notes={selectedConflict.server_state.server_notes}
          statusBadge={
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200">
              {selectedConflict.conflict_type_label}
            </span>
          }
        />
      )}
    </div>
  )
}
