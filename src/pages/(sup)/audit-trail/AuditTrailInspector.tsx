import React from 'react'
import {
  Check,
  Copy,
  Camera,
  MapPin,
  Maximize2,
  Layers,
  Lock
} from 'lucide-react'
import { AuditEvent } from '../../../types/domain'
import { ImageModalData } from './types'

interface AuditTrailInspectorProps {
  selectedEvent: AuditEvent
  copiedEventId: boolean
  onCopyEventId: (eventId: string) => void
  onSelectImage: (img: ImageModalData) => void
}

export const AuditTrailInspector: React.FC<AuditTrailInspectorProps> = ({
  selectedEvent,
  copiedEventId,
  onCopyEventId,
  onSelectImage
}) => {
  return (
    <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-4 sticky top-20">
      {/* Drawer Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-gold text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              THÔNG TIN CHI TIẾT SỰ KIỆN
            </span>
            <span className="font-mono text-xs text-slate-500">
              {selectedEvent.occurred_at_local.split(' ')[1]}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Đối chiếu biến động &amp; Căn cứ
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-500 font-medium">Mã sự kiện:</span>
            <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-semibold">
              {selectedEvent.event_id}
            </span>
            <button
              type="button"
              onClick={() => onCopyEventId(selectedEvent.event_id)}
              className="p-1 text-slate-400 hover:text-brand-gold transition-colors"
              title="Sao chép Mã sự kiện"
            >
              {copiedEventId ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Block 1: Entity, Project & Actor Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Dự án / Tuyến đường:</span>
          <span className="font-semibold text-slate-900 text-right truncate max-w-[210px]" title={selectedEvent.project_name}>
            {selectedEvent.project_name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Thực thể tác động:</span>
          <span className="font-mono font-bold text-slate-900 truncate max-w-[210px]" title={selectedEvent.target_entity_name}>
            {selectedEvent.target_entity_name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Vị trí / Lý trình:</span>
          <span className="font-mono text-slate-700 text-right truncate max-w-[210px]">
            {selectedEvent.target_location || 'Hệ thống'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
          <span className="text-slate-500 font-medium">Tác nhân thực hiện:</span>
          <div className="flex items-center gap-1.5">
            {selectedEvent.actor_avatar && (
              <img
                src={selectedEvent.actor_avatar}
                alt={selectedEvent.actor_name}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            )}
            <span className="font-semibold text-slate-900">
              {selectedEvent.actor_name}
            </span>
            <span className="text-[10px] text-brand-goldDark font-bold font-mono">
              {selectedEvent.actor_role_label}
            </span>
          </div>
        </div>

        {/* Lý do nghiệp vụ và căn cứ quyết định (IncidentCaseHistory.reason) */}
        <div className="flex flex-col gap-1 pt-1 border-t border-slate-200">
          <span className="text-slate-500 font-medium">Lý do nghiệp vụ (Căn cứ quyết định):</span>
          <span className="text-slate-800 italic leading-relaxed">
            "{selectedEvent.reason}"
          </span>
        </div>
      </div>

      {/* Block 2: Evidence Photos Gallery (Minh chứng hình ảnh thực tế hiện trường) */}
      {selectedEvent.evidence_snapshot?.images && selectedEvent.evidence_snapshot.images.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Bằng chứng hiện trường ({selectedEvent.evidence_snapshot.images.length} ảnh)
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              EXIF GPS Validated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {selectedEvent.evidence_snapshot.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => onSelectImage(img)}
                className="group relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-md transition-all bg-slate-100"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-1.5 text-white">
                  <span className="text-[10px] font-medium truncate leading-tight">
                    {img.caption}
                  </span>
                  <span className="text-[9px] font-mono text-slate-300 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-brand-gold shrink-0" />
                    {img.gps_coordinates.split(',')[0]}
                  </span>
                </div>
                <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block 3: Visual Side-by-side State Diff (Trước / Sau) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-500" />
            Đối chiếu trạng thái dữ liệu (Before / After)
          </span>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            v2.2 Diff
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Left: Before State (Red tone) */}
          <div className="rounded-xl bg-red-50/70 border border-red-200 p-2.5 flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-[10px] text-red-700 font-bold border-b border-red-100 pb-1">
              <span>DỮ LIỆU TRƯỚC (BEFORE)</span>
              <span>{selectedEvent.from_status || 'Khởi tạo'}</span>
            </div>
            <pre className="font-mono text-[10px] text-red-900 leading-relaxed overflow-x-auto p-1 font-medium max-h-40">
              {JSON.stringify(selectedEvent.before_state || { status: selectedEvent.from_status || 'INITIAL' }, null, 2)}
            </pre>
          </div>

          {/* Right: After State (Green tone) */}
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-[10px] text-emerald-700 font-bold border-b border-emerald-100 pb-1">
              <span>DỮ LIỆU SAU (AFTER)</span>
              <span>{selectedEvent.to_status}</span>
            </div>
            <pre className="font-mono text-[10px] text-emerald-900 leading-relaxed overflow-x-auto p-1 font-medium max-h-40">
              {JSON.stringify(selectedEvent.after_state, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Block 4: Legal Disclaimer Note (BR-45, UAT-10) */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
        <Lock className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Quy chuẩn lưu trữ bảo hành BR-45:</span>{' '}
          Hồ sơ dự án bảo hành phải được lưu trữ tối thiểu đến hết thời hạn bảo hành cộng <strong>5 năm</strong>. Hồ sơ có đánh dấu tranh chấp (<strong>Legal Hold</strong>) bị nghiêm cấm xóa vĩnh viễn theo Luật Thanh tra.
        </div>
      </div>
    </div>
  )
}
