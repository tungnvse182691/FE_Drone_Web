import React from 'react'
import { CaseItem } from './types'

export interface TechnicalCriteriaCardProps {
  currentItem: CaseItem
  isSupervisorView: boolean
  onAcceptItem: () => void
}

export const TechnicalCriteriaCard: React.FC<TechnicalCriteriaCardProps> = ({
  currentItem
}) => {
  return (
    <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
      {/* Tiêu đề & tiêu chuẩn kỹ thuật */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 font-sansation">
            <span className="material-symbols-outlined text-[20px] text-[#C9A227]">description</span>
            <span>Biên bản nghiệm thu kỹ thuật &amp; Pháp lý hoàn công</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm chứng chất lượng thi công theo quy chuẩn kỹ thuật quốc gia TCVN 8819:2011 &amp; 22 TCN 211-06.
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 bg-[#F8F9FA] rounded-md font-medium border border-slate-200 text-slate-700 self-start sm:self-auto">
          TCVN 8819:2011
        </span>
      </div>

      {/* Cảnh báo yêu cầu sửa lại (Rework Banner) */}
      {currentItem.status === 'REWORK_REQUIRED' && (
        <div className="p-3.5 bg-[#FDECEC] border border-rose-200 rounded-lg space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-[#E5484D] font-semibold">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>Hạng mục bị yêu cầu sửa lại (Lần #{currentItem.attempt_number})</span>
          </div>
          <p className="text-slate-800 leading-relaxed">
            <strong className="text-slate-900">Lý do trả về:</strong> {currentItem.rework_reason || 'Chất lượng bề mặt hoặc số đo kiểm định chưa đạt tiêu chuẩn kỹ thuật.'}
          </p>
          {currentItem.rework_directives && currentItem.rework_directives.length > 0 && (
            <div className="pt-1.5 space-y-0.5 border-t border-rose-200/60">
              <span className="text-[11px] font-semibold text-[#E5484D] uppercase tracking-wider block">
                Chỉ đạo khắc phục bắt buộc:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                {currentItem.rework_directives.map((dir, i) => (
                  <li key={i}>{dir}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 4 Chỉ tiêu kỹ thuật phẳng (Minimalist Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 text-xs">
        {/* Metric 1: Khối lượng thi công */}
        <div className="bg-[#F8F9FA] p-4 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] uppercase tracking-wider font-semibold">1. Khối lượng thi công</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">square_foot</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-sansation">
              {currentItem.area_m2} m² <span className="text-xs font-normal text-slate-500">(Cắt mép chuẩn)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Cào bóc sâu {currentItem.depth_cm} cm (vượt chiều sâu khuyết tật 0.5 cm để triệt tiêu nứt ngầm chân móng).
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-0.5">
            <div>• BTN C12.5: <strong className="text-slate-800">{currentItem.volume_btn_c125_kg} kg</strong></div>
            <div>• Nhũ tương dính bám: <strong className="text-slate-800">{currentItem.tack_coat_crs1}</strong></div>
          </div>
        </div>

        {/* Metric 2: Tính toàn vẹn dữ liệu */}
        <div className="bg-[#F8F9FA] p-4 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] uppercase tracking-wider font-semibold">2. Tính toàn vẹn dữ liệu</span>
              <span className="material-symbols-outlined text-[16px] text-[#2F9E44]">verified</span>
            </div>
            <div className="text-lg font-bold text-[#2F9E44] flex items-center gap-1.5 font-sansation">
              <span>ĐẠT</span>
              <span className="text-xs font-normal text-slate-500">(Ảnh gốc hợp lệ)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Mã hash đối chiếu khớp ảnh hiện trường. Metadata thời gian và tọa độ GPS EXIF hợp lệ theo quy chuẩn.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
            Trạng thái: <strong className="text-[#2F9E44]">{currentItem.status === 'ACCEPTED' ? 'ĐÃ NGHIỆM THU ĐẠT' : 'CHỜ THẨM DUYỆT'}</strong>
          </div>
        </div>

        {/* Metric 3: Đo đạc nghiệm thu */}
        <div className="bg-[#F8F9FA] p-4 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] uppercase tracking-wider font-semibold">3. Đo đạc nghiệm thu</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">straighten</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-sansation">
              K = {currentItem.compaction_k98} <span className="text-xs font-semibold text-[#2F9E44]">(Đạt K ≥ 0.98)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Độ bằng phẳng thước 3m: Khe hở ≤ {currentItem.flatness_3m_gap_mm} mm (Giới hạn: 3.0 mm).
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
            Độ nhám rắc cát: <strong className="text-slate-800">{currentItem.sand_patch_roughness_mm} mm</strong>
          </div>
        </div>

        {/* Metric 4: Cam kết bảo hành */}
        <div className="bg-[#F8F9FA] p-4 rounded-lg border border-slate-200 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] uppercase tracking-wider font-semibold">4. Bảo hành &amp; Trách nhiệm</span>
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">verified_user</span>
            </div>
            <div className="text-lg font-bold text-slate-900 font-sansation">
              12 Tháng <span className="text-xs font-normal text-slate-500">(Đến 30/08/2027)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Cam kết bảo hành kết cấu vá mặt đường, chống lún vệt bánh xe và bong tróc mép mối nối.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 truncate" title="Xí nghiệp Quản lý Đường bộ 2">
            Đơn vị: <strong className="text-slate-800">Xí nghiệp Quản lý Đường bộ 2</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
export default TechnicalCriteriaCard