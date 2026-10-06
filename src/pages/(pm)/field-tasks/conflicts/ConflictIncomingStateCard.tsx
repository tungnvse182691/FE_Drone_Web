import React from 'react'
import { Smartphone, Clock, FileCheck, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Card } from '../../../../components/ui/Card'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'
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
  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      <Card className="p-4 bg-white border-2 border-[#C9A227]/40 shadow-xs flex-1 flex flex-col justify-between relative">
        <div className="space-y-4">
          {/* Tiêu đề & Nhãn cột 2 thay đổi động theo từng loại xung đột */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#C9A227]" />
              <span className="font-bold text-slate-900 font-sansation text-sm uppercase tracking-wide">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                  '2. Bản Nộp Thiết Bị 2 (Máy Chính - Đội Trưởng 15:10)'}
                {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                  '2. Kết Quả Thực Tế Đội 02 Đã Thi Công Xong (10:15)'}
                {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                  '2. Đề Xuất Fast Track Của Kỹ Sư Hiện Trường (11:45)'}
                {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' &&
                  '2. Gói Dữ Liệu SQLite Trắc Địa Trích Xuất Qua ADB'}
                {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' &&
                  '2. Chứng Cứ Thi Công Gửi Muộn Từ Hiện Trường (14:20)'}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FBF6E9] text-[#8C6D1F] border border-[#F1E5C6] font-bold">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && 'Thiết Bị 2 (Bản Đo Chuẩn)'}
              {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' && 'Tổ 02 Hoàn Thành (10:15)'}
              {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' && 'Snapshot v1.8 (07:00)'}
              {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' && 'Trích Xuất ADB An Toàn'}
              {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' && 'Gửi Muộn (Offline 11h45)'}
            </span>
          </div>

          {/* 2 Ảnh Thực Tế Trước/Sau với SafeImage vectorType kỹ thuật công trình */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                  ? 'Ảnh thước dưỡng 3m (TCVN 8864)'
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? 'Ảnh trắc địa sụt lún chênh cốt'
                  : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? 'Ảnh đo dưỡng độ sâu ổ gà (62mm)'
                  : 'Ảnh đo đạc thước vạch (Chụp ngoại tuyến)'}
              </span>
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group">
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
                {/* Floating Timestamp Badge */}
                <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                  <Clock className="w-3 h-3 text-[#C9A227]" />
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
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                  ? 'Ảnh cào bóc tạo phẳng (Wirtgen 1.0m)'
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? 'Ảnh kiểm tra khe co giãn mố cầu'
                  : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? 'Ảnh vá phẳng Carboncor Asphalt K95'
                  : 'Ảnh sau hoàn thiện thi công'}
              </span>
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group">
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
                {/* Floating Timestamp Badge */}
                <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                  <Clock className="w-3 h-3 text-emerald-400" />
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

          {/* Bảng phân tích thời gian công tác ngoại tuyến */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                Nhật ký thời gian ngoại tuyến (Offline Work Log):
              </span>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                Mất sóng: {selectedConflict.offline_actor.offline_duration}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Bắt đầu mất sóng:</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? '07:30 Sáng'
                    : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? '07:35 Sáng'
                    : 'Lúc ra hiện trường'}
                </div>
                <div className="text-[10px] text-slate-500">Khu vực lõm sóng đèo</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Thời điểm thi công xong:</div>
                <div className="font-mono font-bold text-emerald-800 mt-0.5">
                  {selectedConflict.offline_actor.captured_at}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">Chụp ảnh & băm SHA</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Thời điểm đồng bộ 4G:</div>
                <div className="font-mono font-bold text-blue-800 mt-0.5">
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? '11:45 Trưa'
                    : 'Khi bắt lại sóng'}
                </div>
                <div className="text-[10px] text-blue-700 font-semibold">Phát sinh xung đột</div>
              </div>
            </div>
          </div>

          {/* Chi tiết đo đạc và thông tin thiết bị thợ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>
                  {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'Số liệu trắc địa phục hồi thành công:'
                    : 'Kết quả đo đạc thực tế tại hiện trường:'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-sansation text-[#8C6D1F]">
                {selectedConflict.incoming_data.measured_value}
              </div>
              <div className="text-[11px] text-slate-600">
                Loại kiểm tra: <strong>{selectedConflict.incoming_data.measurement_type}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Thông số thiết bị & Kỹ sư nộp:</span>
              </div>
              <div className="text-xs font-bold text-slate-900">
                {selectedConflict.offline_actor.name} ({selectedConflict.offline_actor.team})
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                ID: {selectedConflict.offline_actor.device_id} • {selectedConflict.offline_actor.device_model}
              </div>
            </div>
          </div>

          {/* Toàn vẹn chuỗi chứng cứ (Chain of Custody SHA-256) */}
          <div className="p-3 rounded-xl bg-[#FBF6E9]/40 border border-[#F1E5C6] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#8C6D1F] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                Chuỗi chứng cứ số (Chain of Custody SHA-256):
              </span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#E2E5E9] text-emerald-800 font-bold">
                VERIFIED MATCH
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 break-all select-all bg-white p-2 rounded border border-slate-200">
              {selectedConflict.incoming_data.sha256_hash}
            </div>
            <div className="text-[11px] text-slate-600 pt-1">
              Ghi chú hiện trường: <em>"{selectedConflict.incoming_data.notes}"</em>
            </div>
          </div>

          {/* Lịch sử phân giải nếu đã quyết định */}
          {selectedConflict.resolution && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Quyết định phân giải: {selectedConflict.resolution.decision}
                </span>
                <span className="font-mono text-[10px] text-emerald-700">
                  {selectedConflict.resolution.decided_at}
                </span>
              </div>
              <div className="text-emerald-800 text-[11px]">
                Người ký duyệt:{' '}
                <strong>
                  {selectedConflict.resolution.decided_by} ({selectedConflict.resolution.decided_by_role})
                </strong>
              </div>
              <div className="text-slate-700 text-[11px] bg-white/80 p-2 rounded border border-emerald-100 italic">
                Lý do: "{selectedConflict.resolution.reason}"
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                Mã kiểm toán: {selectedConflict.resolution.audit_hash}
              </div>
            </div>
          )}
        </div>

        {/* 7. CỤM NÚT THAO TÁC PHÂN GIẢI THEO NGỮ CẢNH TỪNG LOẠI XUNG ĐỘT */}
        <ConflictResolutionActions
          selectedConflict={selectedConflict}
          isPM={isPM}
          isSupervisor={isSupervisor}
          handleOpenResolve={handleOpenResolve}
        />
      </Card>
    </div>
  )
}
