import React, { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'
import { PhotoLightboxModal } from '../../../../components/common/PhotoLightboxModal'

export interface ConflictServerStateCardProps {
  selectedConflict: SyncConflictItem
}

export const ConflictServerStateCard: React.FC<ConflictServerStateCardProps> = ({
  selectedConflict
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
      ? 'Ảnh khảo sát vị trí ổ gà lưu trên máy chủ'
      : 'Ảnh hiện trạng lưu trữ trên máy chủ'

  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <Card className="p-4 bg-slate-50 border border-slate-200 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Tiêu đề & Nhãn cột 1 thay đổi động theo từng loại xung đột */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Icon name="archive" size={16} className="text-slate-600" />
              <span className="font-bold text-slate-900 text-sm tracking-wide">
                1. Dữ liệu máy chủ (Server Version)
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-200 text-slate-700">
              Server
            </span>
          </div>

          {/* Ảnh Cột Trái */}
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
                    ? 'DRONE_SURVEY_MAP'
                    : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? 'DRONE_SURVEY_MAP'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'BROKEN_DEVICE_INCIDENT'
                    : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'RUTTING_3M_BEAM'
                    : 'EXPANSION_JOINT'
                }
                chainage={selectedConflict.chainage}
                value={
                  selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
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
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a
                    ? selectedConflict.duplicate_device_a.captured_at
                    : selectedConflict.server_state.last_updated}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                <span className="text-white text-[11px] font-mono font-medium">
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a
                    ? `Thiết bị 1 ghi nhận lúc: ${selectedConflict.duplicate_device_a.captured_at}`
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? `Thời điểm xảy ra sự cố hỏng máy: ${selectedConflict.server_state.last_updated}`
                    : `Máy chủ cập nhật lúc: ${selectedConflict.server_state.last_updated}`}
                </span>
              </div>
            </div>
          </div>

          {/* Nội dung chi tiết Cột Trái: Tinh giản, chỉ giữ dữ liệu kỹ thuật trọng yếu */}
          <div className="space-y-2 text-xs">
            {/* Trường hợp ASSIGNMENT_REASSIGNED: Lịch sử điều chuyển */}
            {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' ? (
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                  Điều chuyển đội thi công:
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-600">Ban đầu (07:00):</span>
                    <span className="font-semibold text-slate-800">
                      {selectedConflict.server_state.initial_assignee || 'Tổ cơ động 02'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-blue-50 border border-blue-200">
                    <span className="text-blue-800 font-medium">Hiện hành (09:30):</span>
                    <span className="font-bold text-blue-900">
                      {selectedConflict.server_state.current_assignee}
                    </span>
                  </div>
                </div>
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
