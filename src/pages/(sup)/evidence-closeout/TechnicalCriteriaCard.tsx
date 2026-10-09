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
    <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
      {/* Tiêu đề & tiêu chuẩn kỹ thuật */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 font-sansation">
            <span className="material-symbols-outlined text-[20px] text-[#C9A227]">description</span>
            <span>Biên bản nghiệm thu kỹ thuật &amp; Pháp lý hoàn công</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm chứng chất lượng thi công theo quy chuẩn kỹ thuật quốc gia TCVN 8819:2011 &amp; 22 TCN 211-06.
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-0.5 bg-slate-50 rounded-md font-medium border border-slate-200 text-slate-700">
          TCVN 8819:2011
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 text-xs">
        {/* Metric 1: Khối lượng thi công */}
        <div className="bg-slate-50 p-3.5 rounded-lg space-y-2 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">1. Khối lượng thi công</span>
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">architecture</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {currentItem.area_m2} m² <span className="text-xs font-normal text-slate-500">(Cắt mép chuẩn)</span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Cào bóc sâu {currentItem.depth_cm} cm (vượt chiều sâu khuyết tật 0.5 cm để triệt tiêu nứt ngầm chân móng).
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-700 bg-white p-2 rounded-md border border-slate-200 space-y-0.5">
            <span className="font-semibold block text-[#C9A227]">Vật liệu sử dụng:</span>
            <div>• Bê tông nhựa C12.5: <strong>{currentItem.volume_btn_c125_kg} kg</strong></div>
            <div>• Nhũ tương dính bám CRS-1: <strong>{currentItem.tack_coat_crs1}</strong></div>
          </div>
        </div>

        {/* Metric 2: Tính toàn vẹn số */}
        <div className="bg-slate-50 p-3.5 rounded-lg space-y-2 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">2. Tính toàn vẹn số</span>
              <span className="material-symbols-outlined text-[16px] text-[#2F9E44]">check_circle</span>
            </div>
            <div className="text-base font-bold text-[#2F9E44] flex items-center gap-1.5">
              <span>PASS</span>
              <span className="text-xs font-normal text-slate-500">(Chữ ký số hợp lệ)</span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Checksum SHA-256 đối chiếu khớp 100% thời gian thực. Không phát hiện chỉnh sửa metadata ảnh hiện trường.
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-700 bg-white p-2 rounded-md border border-slate-200">
            <span className="font-semibold block text-[#C9A227] mb-0.5">Quy trình thẩm quyền:</span>
            <span>Đã lưu → Phân loại → Giao việc → Đã sửa → <strong className="text-[#2F9E44]">{currentItem.status === 'ACCEPTED' ? 'ĐÃ DUYỆT' : 'ĐANG DUYỆT'}</strong></span>
          </div>
        </div>

        {/* Metric 3: Đo đạc nghiệm thu */}
        <div className="bg-slate-50 p-3.5 rounded-lg space-y-2 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">3. Đo đạc nghiệm thu</span>
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">straighten</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              K = {currentItem.compaction_k98} <span className="text-xs font-semibold text-[#2F9E44]">(Đạt K ≥ 0.98)</span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Kiểm tra độ bằng phẳng thước 3m: Khe hở ≤ {currentItem.flatness_3m_gap_mm} mm (Giới hạn: 3.0 mm).
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-700 bg-white p-2 rounded-md border border-slate-200">
            <span className="font-semibold block text-[#C9A227] mb-0.5">Độ nhám rắc cát:</span>
            <span>Đạt <strong>{currentItem.sand_patch_roughness_mm} mm</strong> (Đạt tiêu chuẩn an toàn mặt đường).</span>
          </div>
        </div>

        {/* Metric 4: Cam kết bảo hành */}
        <div className="bg-slate-50 p-3.5 rounded-lg space-y-2 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold">4. Bảo hành &amp; Trách nhiệm</span>
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">verified</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              12 Tháng <span className="text-xs font-normal text-slate-500">(Đến 30/08/2027)</span>
            </div>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Cam kết bảo hành kết cấu vá mặt đường, chống lún vệt bánh xe và bong tróc mép mối nối.
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-700 bg-white p-2 rounded-md border border-slate-200">
            <span className="font-semibold block text-[#C9A227] mb-0.5">Đơn vị chịu trách nhiệm:</span>
            <span>Xí nghiệp Quản lý Đường bộ 2 (Nhà thầu phụ trách tuyến).</span>
          </div>
        </div>
      </div>

      {/* Thông tin chữ ký điện tử */}
      <div className="mt-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm bg-white text-[#C9A227] border border-slate-200">
            GS
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-slate-900 font-sansation">Kỹ sư Giám sát trưởng (ID: GS-2041)</div>
            <div className="text-slate-500">Ban Quản lý Hạ tầng Hoàng Hải Miền Trung</div>
            <div className="font-mono text-[11px] text-slate-600">
              Mã xác thực: SHA-256: 540211ab89c9a227e2e5e9
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-700 font-medium px-2.5 py-1 bg-white rounded-md border border-slate-200 inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2F9E44]">fingerprint</span>
            <span>{currentItem.status === 'ACCEPTED' ? 'Đã ký số xác thực' : 'Khóa điện tử sẵn sàng'}</span>
          </span>
        </div>
      </div>
    </section>
  )
}
export default TechnicalCriteriaCard