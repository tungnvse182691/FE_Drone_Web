import React from 'react'
import { CaseItem } from './types'
import { NO_DATA, fmtTime, missingReasonText } from './acceptanceLabels'

export interface TechnicalCriteriaCardProps {
  currentItem: CaseItem
  isSupervisorView: boolean
  onAcceptItem: () => void
}

const READINESS_LABEL: Record<string, string> = {
  COMPLETE: 'Bản nộp đủ dữ liệu theo BE',
  INCOMPLETE: 'Bản nộp chưa đủ dữ liệu theo BE',
}

export const TechnicalCriteriaCard: React.FC<TechnicalCriteriaCardProps> = ({
  currentItem
}) => {
  const measurements = currentItem.measurements || []
  const reasons = currentItem.missing_reasons || []
  const supplement = currentItem.pending_step === 'SUPPLEMENT'
  return (
    <section className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
      {/* Tiêu đề: chỉ nêu dữ liệu đối chiếu có nguồn, không nêu kết luận đạt/không đạt */}
      <div className="pb-2 border-b border-slate-100">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 font-sansation">
          <span className="material-symbols-outlined text-[20px] text-[#C9A227]">description</span>
          <span>Đối chiếu bản nộp &amp; hồ sơ nghiệm thu</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Số liệu lấy từ bản nộp hiện hành của Crew và trạng thái do BE trả về. Mục chưa có nguồn hiển thị “{NO_DATA}”; đây chưa phải biên bản nghiệm thu được xác nhận.
        </p>
      </div>

      {/* Cần bổ sung hồ sơ (PM review SUPPLEMENT) — khác với yêu cầu sửa lại */}
      {supplement && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs space-y-1" role="status">
          <div className="flex items-center gap-1.5 text-sky-900 font-semibold">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>PM đã yêu cầu bổ sung hồ sơ — đang chờ Crew nộp bản bổ sung</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            Đang xem bản nộp #{currentItem.submission_revision ?? '—'} (lần thi công #{currentItem.attempts_count ?? '—'}). Nội dung yêu cầu bổ sung do PM nhập đã được gửi cho Crew; BE chưa có API cho PM/Giám sát đọc lại nội dung này.
          </p>
        </div>
      )}

      {/* Cần sửa lại (hiệu chỉnh/correction sau quyết định) */}
      {currentItem.status === 'REWORK_REQUIRED' && (
        <div className="p-3 bg-[#FDECEC] border border-rose-200 rounded-lg space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-[#E5484D] font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>Hạng mục cần sửa lại (quyết định hiệu chỉnh của BE)</span>
          </div>
          <p className="text-slate-800 leading-relaxed">
            <strong className="text-slate-900">Lý do:</strong> {currentItem.rework_reason || `${NO_DATA} (BE chưa trả lý do ở màn này)`}
          </p>
        </div>
      )}

      {currentItem.load_notes && currentItem.load_notes.length > 0 && (
        <div role="alert" className="p-2.5 text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg space-y-0.5">
          {currentItem.load_notes.map((n, i) => (<div key={i}>{n}</div>))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
        {/* 1. Số đo trong bản nộp */}
        <div className="bg-[#F8F9FA] p-3 rounded-lg border border-slate-200 space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">1. Số đo trong bản nộp</span>
          {!currentItem.submission_id ? (
            <p className="text-slate-600">{NO_DATA}: chưa có bản nộp.</p>
          ) : measurements.length === 0 ? (
            <p className="text-slate-600">Bản nộp không có số đo.</p>
          ) : (
            <ul className="space-y-1 text-slate-800">
              {measurements.map((m, i) => (
                <li key={i} className="leading-snug">
                  <span className="font-medium">{m.type || 'Số đo'}</span>:{' '}
                  {m.state === 'KNOWN' && m.value != null ? `${m.value} ${m.unit || ''}`.trim() : `Chưa xác định${m.unknownReason ? ` (${m.unknownReason})` : ''}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 2. Kết quả kiểm tra bản nộp do BE trả */}
        <div className="bg-[#F8F9FA] p-3 rounded-lg border border-slate-200 space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">2. Kiểm tra bản nộp (BE)</span>
          {!currentItem.readiness ? (
            <p className="text-slate-600">{NO_DATA}</p>
          ) : (
            <>
              <p className="text-slate-800 font-medium">{READINESS_LABEL[currentItem.readiness] || currentItem.readiness}</p>
              {reasons.length > 0 && (
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {reasons.map((r) => (<li key={r} className="leading-snug">{missingReasonText(r)}</li>))}
                </ul>
              )}
            </>
          )}
          <p className="text-[11px] text-slate-500 leading-snug">Kết quả toàn vẹn ảnh/EXIF: BE chưa trả kết luận cho hạng mục này; ảnh lỗi tải là trạng thái riêng ở khung ảnh.</p>
        </div>

        {/* 3. Mốc thời gian */}
        <div className="bg-[#F8F9FA] p-3 rounded-lg border border-slate-200 space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">3. Mốc thời gian</span>
          <div className="space-y-0.5 text-slate-800">
            <div>Bắt đầu thi công: <strong className="font-medium">{fmtTime(currentItem.construction_start)}</strong></div>
            <div>Kết thúc thi công: <strong className="font-medium">{fmtTime(currentItem.construction_end)}</strong></div>
            <div>Nộp bản nộp: <strong className="font-medium">{fmtTime(currentItem.submitted_at)}</strong></div>
          </div>
        </div>

        {/* 4. Tiêu chuẩn / bảo hành */}
        <div className="bg-[#F8F9FA] p-3 rounded-lg border border-slate-200 space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">4. Ngưỡng tiêu chuẩn &amp; bảo hành</span>
          <p className="text-slate-700 leading-snug">{NO_DATA}: BE chưa trả ngưỡng K, độ phẳng, thời hạn/đơn vị bảo hành cho hạng mục này.</p>
        </div>
      </div>
    </section>
  )
}
export default TechnicalCriteriaCard
