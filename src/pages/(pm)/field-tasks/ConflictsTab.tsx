import React from 'react'
import {
  Search,
  Clock,
  Smartphone,
  Split,
  Eye,
  Archive,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Layers,
  MapPin,
  ExternalLink,
  FileCheck,
  Zap,
  FileText,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Hash,
  UserCheck
} from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SyncConflictItem } from '../../../types/domain'
import { SafeImage } from './SafeImage'

export interface ConflictsTabProps {
  conflicts: SyncConflictItem[]
  filteredConflicts: SyncConflictItem[]
  selectedConflict: SyncConflictItem
  setSelectedConflictId: (id: string) => void
  filterType: string
  setFilterType: (type: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  stats: {
    total: number
    pending: number
    reassign: number
    policyMismatch: number
    rescuePending: number
  }
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

export const ConflictsTab: React.FC<ConflictsTabProps> = ({
  conflicts,
  filteredConflicts,
  selectedConflict,
  setSelectedConflictId,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  stats,
  isPM,
  isSupervisor,
  handleOpenResolve
}) => {
  return (
    <div className="space-y-6">
          {/* 4. THANH CÔNG CỤ TÌM KIẾM VÀ BỘ LỌC TRẠNG THÁI */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-brand-border shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-[#C9A227] text-white shadow-xs font-sansation'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tất cả ({conflicts.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'PENDING'
                    ? 'bg-[#C9A227] text-white shadow-xs font-sansation'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Chờ phân giải ({stats.pending})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('RESCUE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'RESCUE'
                    ? 'bg-purple-600 text-white shadow-xs font-sansation'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cứu dữ liệu thiết bị ({stats.rescuePending})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('RESOLVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'RESOLVED'
                    ? 'bg-[#C9A227] text-white shadow-xs font-sansation'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Đã phân giải ({conflicts.length - stats.pending})
              </button>
            </div>

            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã xung đột, mã lỗi, lý trình, thợ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>
          </div>

          {/* 5. KHU VỰC CHÍNH: BẢNG HÀNG ĐỢI XUNG ĐỘT (GRID VIEW) */}
          <Card className="overflow-hidden border border-brand-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-slate-50 text-slate-600">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Mã Xung Đột</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Khiếm Khuyết & Lý Trình</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Loại Xung Đột</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Đội Ngoại Tuyến</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Thời Gian Bắt Lại Mạng</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Mã Băm SHA-256</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-center">Trạng Thái</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Chi Tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConflicts.map((item) => {
                    const isSelected = item.id === selectedConflict.id
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedConflictId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#FBF6E9]/60 border-l-4 border-l-[#C9A227]' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[#8C6D1F]">
                          <div className="flex items-center gap-1.5">
                            <span>{item.conflict_code}</span>
                            {item.severity === 'CRITICAL' && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{item.defect_type_label}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {item.defect_code} • {item.chainage}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              item.conflict_type === 'DEVICE_RESCUE_PENDING'
                                ? 'bg-purple-100 text-purple-800'
                                : item.conflict_type === 'ASSIGNMENT_REASSIGNED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.conflict_type === 'DEVICE_RESCUE_PENDING' && <Smartphone className="w-3 h-3" />}
                            {item.conflict_type === 'ASSIGNMENT_REASSIGNED' && <Split className="w-3 h-3" />}
                            {item.conflict_type_label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{item.offline_actor.name}</div>
                          <div className="text-[11px] text-slate-500">{item.offline_actor.team}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                            <span>{item.offline_actor.captured_at}</span>
                          </div>
                          <div className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-amber-200/70">
                            Mất sóng: {item.offline_actor.offline_duration}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.incoming_data.sha256_hash.substring(0, 10)}...
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              item.status === 'CONFLICT_INTAKE'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : item.status === 'RESCUE_AUTHORIZED'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {item.status_label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedConflictId(item.id)
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-[#C9A227] text-white border-[#C9A227]'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Xem đối chiếu Side-by-side"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 6. KHU VỰC ĐỐI CHIẾU TRỰC QUAN SIDE-BY-SIDE */}
          {selectedConflict && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]"></span>
                  <h2 className="text-lg font-bold font-sansation text-brand-dark">
                    Bảng Đối Chiếu Hiện Trạng: {selectedConflict.conflict_code} — {selectedConflict.chainage}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1A1D20] text-[#F1E5C6] font-mono text-[11px] font-bold shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
                    <span>Ngoại tuyến sync: {selectedConflict.offline_actor.captured_at}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Mã nhiệm vụ: <strong className="text-slate-800">{selectedConflict.task_code}</strong> | Tuyến:{' '}
                    <strong className="text-slate-800">{selectedConflict.route_name}</strong>
                  </span>
                </div>
              </div>

              {/* DÒNG THỜI GIAN DIỄN BIẾN SỰ KIỆN XUNG ĐỘT (AUDIT TIMELINE LOG - Q04/D05) */}
              {selectedConflict.timeline && selectedConflict.timeline.length > 0 && (
                <Card className="p-4 bg-white border border-[#E2E5E9] shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C9A227]" />
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800 font-sansation">
                        Dòng Thời Gian Diễn Biến Xung Đột ({selectedConflict.conflict_code})
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Nguyên tắc xử lý: <strong className="text-slate-800">Q04 / D05 Không Tự Ý Ghi Đè (No Silent Overwrite)</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {selectedConflict.timeline.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all shadow-2xs relative ${
                          step.type === 'alert'
                            ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                            : step.type === 'warning'
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                            : step.type === 'success'
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-blue-50/80 border-blue-300 text-blue-950'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-white border border-current shadow-2xs flex items-center gap-1 text-slate-900">
                              <Clock className="w-3 h-3 text-[#C9A227] shrink-0" />
                              {step.time}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-2xs ${
                                step.type === 'alert'
                                  ? 'bg-rose-200 text-rose-900 border border-rose-300'
                                  : step.type === 'warning'
                                  ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                  : step.type === 'success'
                                  ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                                  : 'bg-blue-200 text-blue-900 border border-blue-300'
                              }`}
                            >
                              {step.badge}
                            </span>
                          </div>
                          <div className="font-bold font-sansation text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-mono flex items-center justify-center font-bold shrink-0">
                              {idx + 1}
                            </span>
                            <span>{step.event}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{step.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ========================================================================= */}
                {/* CỘT TRÁI (COL 1): DỮ LIỆU CƠ SỞ / THIẾT BỊ 1 / CHÍNH SÁCH MÁY CHỦ - 5 COLS */}
                {/* ========================================================================= */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <Card className="p-4 bg-slate-50 border border-slate-200 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Tiêu đề & Nhãn cột 1 thay đổi động theo từng loại xung đột */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' ? (
                            <Smartphone className="w-4 h-4 text-blue-600" />
                          ) : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
                            <ShieldAlert className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Archive className="w-4 h-4 text-slate-600" />
                          )}
                          <span className="font-bold text-slate-900 font-sansation text-sm uppercase tracking-wide">
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

                      {/* Ảnh Cột Trái: Sử dụng đồ họa SVG kỹ thuật công trình chân thực */}
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
                            <Clock className="w-3 h-3 text-[#C9A227]" />
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
                                    <Clock className="w-3 h-3 text-[#C9A227]" />
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
                                <ArrowRight className="w-4 h-4 text-[#C9A227]" />
                              </div>
                              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/90 border border-blue-200">
                                <div>
                                  <div className="text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-blue-600" />
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
                              <div className="font-bold text-blue-700 font-sansation text-sm">
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

                {/* ========================================================================= */}
                {/* CỘT PHẢI (COL 2): CHỨNG CỨ NGOẠI TUYẾN / THIẾT BỊ 2 / GÓI CỨU HỘ ADB - 7 COLS */}
                {/* ========================================================================= */}
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
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-500">
                        {selectedConflict.status === 'CONFLICT_INTAKE' ? (
                          <span className="flex items-center gap-1 text-amber-700 font-semibold">
                            <Clock className="w-3.5 h-3.5" /> Hồ sơ đang chờ quyết định xử lý
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Hồ sơ đã được chốt và lưu vết kiểm toán
                          </span>
                        )}
                      </div>

                      {/* NÚT THAO TÁC CHO PROJECT MANAGER (PM CHỈ HUY TRƯỞNG) */}
                      {isPM && selectedConflict.status === 'CONFLICT_INTAKE' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* TRƯỜNG HỢP CA 3: DEVICE_RESCUE_PENDING (Tuân thủ Q17/Decision 42A - PM là Maker, không tự duyệt) */}
                          {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenResolve('SUBMIT_RESCUE_TO_SUP')}
                                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold bg-purple-700 hover:bg-purple-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer font-sansation"
                                title="Theo Q17/42A: PM lập tờ trình gửi Supervisor ký số phê duyệt"
                              >
                                <ShieldAlert className="w-4 h-4 text-[#C9A227]" />
                                <span>Trình Giám sát ký duyệt cứu hộ (Q17/42A)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                                <span>Yêu cầu Đội thi công bổ sung biên bản</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-rose-700 hover:bg-rose-800 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Bác bỏ dữ liệu hỏng & Giao Đội đo lại</span>
                              </button>
                            </>
                          ) : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' ? (
                            /* TRƯỜNG HỢP CA 5: AGGREGATE_VERSION_CONFLICT (Tuân thủ BR-26 & Invariant #3 - Khóa cứng đợt cũ) */
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold bg-[#C9A227] hover:bg-[#8C6D1F] transition shadow-sm flex items-center gap-1.5 cursor-pointer font-sansation ring-2 ring-[#C9A227]/40"
                                title="Tuân thủ BR-26: Tạo phụ lục đợt mới để giải ngân khối lượng nộp muộn"
                              >
                                <Split className="w-4 h-4" />
                                <span>Tạo Phụ Lục Đợt Bổ Sung (Tuân thủ BR-26)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4 text-slate-500" />
                                <span>Bảo lưu hồ sơ đã đóng (Từ chối số liệu)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                                className="px-3 py-2 rounded-xl text-slate-800 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5 text-slate-600" />
                                <span>Chuyển vào Hàng đợi đợt sửa tiếp theo</span>
                              </button>
                            </>
                          ) : (
                            /* CÁC TRƯỜNG HỢP CA 1, 2, 4 */
                            <>
                              {/* Nút 1: Chấp nhận ngoại tuyến / Bản đo chuẩn / Chuyển đợt */}
                              <button
                                type="button"
                                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer font-sansation"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                                    'Chấp nhận Thiết Bị 2 (Máy chính chuẩn)'}
                                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                                    'Chấp nhận Đội 02 (Thu hồi lệnh Đội 01)'}
                                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                                    'Chuyển sang Lập đợt sửa trình Giám sát (Policy v2.2)'}
                                </span>
                              </button>

                              {/* Nút 2: Bảo lưu máy chủ */}
                              <button
                                type="button"
                                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4 text-slate-500" />
                                <span>
                                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                                    'Bảo lưu Thiết Bị 1 (Máy phụ)'}
                                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                                    'Bảo lưu lệnh Đội 01 (Hủy kết quả Đội 02)'}
                                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                                    'Bảo lưu chính sách v2.2 (Từ chối Fast Track)'}
                                </span>
                              </button>

                              {/* Nút 3: Tách lần sửa mới (Fork Attempt) */}
                              <button
                                type="button"
                                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-[#C9A227] hover:bg-[#8C6D1F] transition shadow-xs flex items-center gap-1.5 cursor-pointer font-sansation"
                              >
                                <Split className="w-4 h-4" />
                                <span>
                                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                                    'Tách 2 đợt đo đối chứng (Fork)'}
                                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                                    'Tách 2 lần sửa độc lập (Fork)'}
                                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                                    'Tách thành Đợt sửa chữa nền móng chuyên đề'}
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* NÚT THAO TÁC CHO SUPERVISOR (GIÁM SÁT / CHỦ ĐẦU TƯ) */}
                      {isSupervisor && selectedConflict.status === 'CONFLICT_INTAKE' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenResolve('AUTHORIZE_RESCUE')}
                                className="px-4 py-2 rounded-xl text-white text-xs font-bold bg-purple-700 hover:bg-purple-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer font-sansation"
                              >
                                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                                <span>Ký số Phê duyệt Cứu Dữ Liệu Thiết Bị (Decision 42A)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenResolve('SUPERVISOR_REJECT_RESCUE')}
                                className="px-3.5 py-2 rounded-xl text-rose-700 text-xs font-bold bg-rose-50 hover:bg-rose-100 transition border border-rose-300 flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>Từ chối gói cứu hộ (Bắt buộc đo lại)</span>
                              </button>
                            </>
                          ) : (
                            <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                              Chế độ Giám sát: Quyền phân giải nghiệp vụ thuộc Chỉ huy trưởng PM (Maker-Checker).
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

    </div>
  )
}
