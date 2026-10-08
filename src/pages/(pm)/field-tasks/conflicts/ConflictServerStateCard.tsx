import React from 'react'
import { Card } from '../../../../components/ui/Card'
import { Icon } from '../../../../components/ui/Icon'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'

export interface ConflictServerStateCardProps {
  selectedConflict: SyncConflictItem
}

export const ConflictServerStateCard: React.FC<ConflictServerStateCardProps> = ({
  selectedConflict
}) => {
  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <Card className="p-4 bg-slate-50 border border-slate-200 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Tiêu đề & Nhãn cột 1 thay đổi động theo từng loại xung đột */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' ? (
                <Icon name="smartphone" size={16} className="text-blue-600" />
              ) : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
                <Icon name="phonelink_erase" size={16} className="text-purple-600" />
              ) : (
                <Icon name="archive" size={16} className="text-slate-600" />
              )}
              <span className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                  '1. Bản Nộp Thiết Bị 1 (Máy Phụ - 14:00)'}
                {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                  '1. Lệnh Phân Công Mới Trên Máy Chủ (09:30)'}
                {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                  '1. Chính Sách Mới Cập Nhật Trên Máy Chủ (09:00)'}
                {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' &&
                  '1. Biên Bản Sự Cố Thiết Bị (Supervisor Audit)'}
                {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' &&
                  '1. Hồ Sơ Đợt Đã Đóng Băng Khóa Cứng (13:00)'}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-200 text-slate-700">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && 'Thiết Bị 1 (Trước)'}
              {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' && 'Lệnh 09:30'}
              {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' && 'Chính Sách v2.2'}
              {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' && 'Quy Chuẩn Q17/42A'}
              {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' && 'ĐÃ ĐÓNG (13:00)'}
            </span>
          </div>

          {/* Ảnh Cột Trái */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                ? 'Ảnh sơ bộ chụp từ Thiết Bị 1 (Máy phụ)'
                : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                ? 'Bằng chứng hiện trường: Thiết bị rơi vỡ màn hình (DEV-HH-TAB-712)'
                : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                ? 'Ảnh khảo sát vị trí ổ gà lưu trên máy chủ'
                : 'Ảnh hiện trạng lưu trữ trên máy chủ'}
            </span>
            <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group">
              <SafeImage
                src={
                  selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a?.photo_url
                    ? selectedConflict.duplicate_device_a.photo_url
                    : selectedConflict.server_state.server_photo_url
                }
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

          {/* Nội dung chi tiết Cột Trái theo ngữ cảnh từng loại lỗi */}
          <div className="space-y-2 text-xs">
            {/* TRƯỜNG HỢP CA 1: ASSIGNMENT_REASSIGNED (Đổi đội khi ngoại tuyến) */}
            {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider">
                    Lịch sử điều chuyển đội thi công (Q04):
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                    Cách biệt: 2 giờ 30 phút
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                        <Icon name="schedule" size={12} className="text-brand-gold" />
                        MỐC 1 • 07:00:00 SÁNG
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedConflict.server_state.initial_assignee || 'Tổ cơ động Hoàng Hải 02 (KS Phạm Văn Hùng)'}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Giao ban đầu
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-slate-400 py-0.5">
                    <Icon name="arrow_downward" size={16} className="text-brand-gold" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/90 border border-blue-200">
                    <div>
                      <div className="text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1">
                        <Icon name="schedule" size={12} className="text-blue-600" />
                        MỐC 2 • 09:30:10 SÁNG
                      </div>
                      <div className="font-bold text-blue-900 mt-0.5">
                        {selectedConflict.server_state.current_assignee}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                      Lệnh điều chuyển
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Trường hợp 2: DUPLICATE_WORK_ATTEMPT (Trùng 2 máy) */}
            {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a && (
              <>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Người nộp & Thiết bị phụ:</span>
                  <div className="font-bold text-slate-800">{selectedConflict.duplicate_device_a.name}</div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {selectedConflict.duplicate_device_a.device_id} • {selectedConflict.duplicate_device_a.device_model}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Số liệu đo đạc sơ bộ (Thiết bị 1):</span>
                  <div className="font-bold text-blue-700 text-sm">
                    {selectedConflict.duplicate_device_a.measured_value}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Phương pháp: <strong>{selectedConflict.duplicate_device_a.measurement_type}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Mã băm SHA-256 bản nộp 1:</span>
                  <div className="font-mono text-[10px] text-slate-600 bg-slate-50 p-1 rounded border border-slate-100 break-all select-all">
                    {selectedConflict.duplicate_device_a.sha256_hash}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Ghi chú từ máy phụ:</span>
                  <p className="text-slate-600 text-[11px] italic">"{selectedConflict.duplicate_device_a.notes}"</p>
                </div>
              </>
            )}

            {/* Các trường hợp khác: POLICY, RESCUE, AGGREGATE */}
            {selectedConflict.conflict_type !== 'DUPLICATE_WORK_ATTEMPT' && (
              <>
                {selectedConflict.conflict_type !== 'ASSIGNMENT_REASSIGNED' && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 block text-[11px]">
                      {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                        ? 'Đơn vị phụ trách thẩm tra thiết bị:'
                        : 'Đội thi công hiện hành trên hệ thống:'}
                    </span>
                    <span className="font-bold text-slate-800">{selectedConflict.server_state.current_assignee}</span>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Trạng thái & Tiêu chuẩn quy định:</span>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-semibold text-slate-700">{selectedConflict.server_state.current_status}</span>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedConflict.server_state.policy_version}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">
                    {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                      ? 'Nội dung chính sách v2.2 mới ban hành:'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'Căn cứ pháp lý thẩm quyền cứu hộ:'
                      : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                      ? 'Ràng buộc đóng băng hồ sơ đợt (BR-26):'
                      : 'Quy định kỹ thuật đang áp dụng:'}
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {selectedConflict.server_state.policy_summary}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">
                    {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'Biên bản xác nhận sự cố thiết bị tại hiện trường:'
                      : 'Ghi chú từ Văn phòng điều hành:'}
                  </span>
                  <p className="text-slate-600 text-[11px] italic">"{selectedConflict.server_state.server_notes}"</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
              ? 'Trạng thái: Ghi nhận bản nháp Thiết Bị 1'
              : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
              ? 'Trạng thái: Khóa cứng bất biến BR-26'
              : 'Trạng thái: Khóa sửa đổi trực tiếp'}
          </span>
          <span className="font-mono font-bold text-slate-600">
            {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
              ? 'Decision 42A'
              : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
              ? 'TCVN 8864 Dưỡng 3m'
              : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
              ? 'Invariant #3'
              : 'BR-16 Lock'}
          </span>
        </div>
      </Card>
    </div>
  )
}
