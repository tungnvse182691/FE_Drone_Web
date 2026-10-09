import React, { useState } from 'react'
import { Card } from '../../../../components/ui/Card'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'
import { PhotoLightboxModal } from '../../../../components/common/PhotoLightboxModal'
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
    <div className="lg:col-span-7 flex flex-col gap-4">
      <Card className="p-4 bg-white border-2 border-brand-gold/40 shadow-xs flex-1 flex flex-col justify-between relative">
        <div className="space-y-4">
          {/* Tiêu đề & Nhãn cột 2 thay đổi động theo từng loại xung đột */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Icon name="smartphone" size={16} className="text-brand-gold" />
              <span className="font-bold text-slate-900 text-sm tracking-wide">
                2. Dữ liệu hiện trường (Mobile Client)
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FBF6E9] text-brand-goldMuted border border-[#F1E5C6] font-bold">
              Hiện trường
            </span>
          </div>

          {/* 2 Ảnh Thực Tế Trước/Sau với SafeImage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'Ảnh thước dưỡng 3m (TCVN 8864)'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'Ảnh trắc địa sụt lún chênh cốt'
                    : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'Ảnh đo dưỡng độ sâu ổ gà (62mm)'
                    : 'Ảnh đo đạc thước vạch (Chụp ngoại tuyến)'}
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
                className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                title="Bấm để xem ảnh phóng to toàn màn hình"
              >
                <SafeImage
                  src={selectedConflict.incoming_data.photo_evidence_url}
                  alt="Ảnh thước đo thực tế"
                  vectorType={
                    selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? 'POTHOLE_BEFORE'
                      : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                      ? 'CRACK_OPTICAL'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'BRIDGE_SETTLEMENT'
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                      ? 'RUTTING_3M_BEAM'
                      : 'EXPANSION_JOINT'
                  }
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
                  <span>{selectedConflict.offline_actor.captured_at}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                  <span className="text-white text-[10px] font-mono leading-tight">
                    GPS: {selectedConflict.incoming_data.gps_coords} (±{selectedConflict.incoming_data.accuracy_m}m)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'Ảnh cào bóc tạo phẳng (Wirtgen 1.0m)'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'Ảnh kiểm tra khe co giãn mố cầu'
                    : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'Ảnh vá phẳng Carboncor Asphalt K95'
                    : 'Ảnh sau hoàn thiện thi công'}
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
                className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group cursor-pointer"
                title="Bấm để xem ảnh phóng to toàn màn hình"
              >
                <SafeImage
                  src={selectedConflict.incoming_data.photo_after_url}
                  alt="Ảnh hoàn thiện"
                  vectorType={
                    selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? 'POTHOLE_AFTER'
                      : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                      ? 'CRACK_OPTICAL'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'BRIDGE_SETTLEMENT'
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                      ? 'RUTTING_AFTER_MILLING'
                      : 'EXPANSION_JOINT_MASTIC'
                  }
                  chainage={selectedConflict.chainage}
                  value="ĐẦM LÈN K95 HOÀN THIỆN"
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
                  <Icon name="schedule" size={12} className="text-emerald-400" />
                  <span>Hoàn tất: {selectedConflict.offline_actor.captured_at}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                  <span className="text-white text-[10px] font-mono leading-tight">
                    Thời điểm chụp: {selectedConflict.offline_actor.captured_at}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin thời gian ngoại tuyến tinh gọn */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Icon name="schedule" size={14} className="text-brand-gold" />
              <span>Mất sóng: <strong className="font-mono text-slate-900">{selectedConflict.offline_actor.offline_duration}</strong></span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Chụp lúc: {selectedConflict.offline_actor.captured_at}
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
                {selectedConflict.offline_actor.name} ({selectedConflict.offline_actor.team})
              </div>
              <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                {selectedConflict.offline_actor.device_model || selectedConflict.offline_actor.device_id}
              </div>
            </div>
          </div>

          {/* Toàn vẹn chuỗi chứng cứ số */}
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Mã băm SHA-256 (Mobile):</span>
              <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold border border-emerald-200">
                VERIFIED
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 break-all select-all">
              {selectedConflict.incoming_data.sha256_hash.substring(0, 32)}...
            </div>
            {selectedConflict.incoming_data.notes && (
              <div className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-100">
                Ghi chú: "{selectedConflict.incoming_data.notes}"
              </div>
            )}
          </div>

          {/* Lịch sử phân giải nếu đã quyết định */}
          {selectedConflict.resolution && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1">
                  <Icon name="check_circle" size={14} className="text-emerald-600" />
                  {selectedConflict.resolution.decision}
                </span>
                <span className="font-mono text-[10px] text-emerald-700">
                  {selectedConflict.resolution.decided_at}
                </span>
              </div>
              <div className="text-slate-600 text-[11px] italic">
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
          subtitle={`Đội thi công: ${selectedConflict.offline_actor.name} (${selectedConflict.offline_actor.team}) — Lý trình ${selectedConflict.chainage}`}
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
