import React from 'react'
import {
  FileCheck,
  Sliders,
  Award,
  Fingerprint,
  Wrench,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { CaseItem } from './types'

export interface TechnicalCriteriaCardProps {
  currentItem: CaseItem
  isSupervisorView: boolean
  onAcceptItem: () => void
}

export const TechnicalCriteriaCard: React.FC<TechnicalCriteriaCardProps> = ({
  currentItem,
  isSupervisorView,
  onAcceptItem
}) => {
  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E2E5E9] shadow-xs space-y-4">
      {/* TECHNICAL SPECIFICATIONS & AUDIT CARD (4 METRIC BOXES THEO TCVN 8819:2011) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-sansation">
              <FileCheck className="w-5 h-5 text-[#C9A227]" />
              Biên bản nghiệm thu kỹ thuật &amp; Pháp lý hồ sơ hoàn công
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuỗi kiểm chứng chất lượng thi công theo quy chuẩn kỹ thuật quốc gia TCVN 8819:2011 &amp; 22 TCN 211-06.
            </p>
          </div>
          <span className="font-mono text-xs px-3 py-1 bg-slate-100 rounded-full font-semibold border border-slate-200 text-slate-700">
            Tiêu chuẩn áp dụng: TCVN 8819 / 22 TCN 211-06
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
          {/* Metric 1: Kích thước & Khối lượng hoàn công */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">1. Khối lượng thi công</span>
                <Wrench className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                {currentItem.area_m2} m² <span className="text-xs font-normal text-slate-500">(Cắt mép vuông vắn)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Quy cách cào bóc: Sâu {currentItem.depth_cm} cm (vượt chiều sâu khuyết tật 0.5 cm để triệt tiêu nứt ngầm chân móng).
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
              <span className="font-bold block text-[#92700C]">Vật liệu sử dụng:</span>
              <div>• Bê tông nhựa nóng C12.5: <strong>{currentItem.volume_btn_c125_kg} kg</strong></div>
              <div>• Nhũ tương dính bám CRS-1: <strong>{currentItem.tack_coat_crs1}</strong></div>
            </div>
          </div>

          {/* Metric 2: Toàn vẹn dữ liệu & Pháp lý số */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">2. Tính toàn vẹn số</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-emerald-800 flex items-center gap-1.5">
                <span>PASS</span>
                <span className="text-xs font-normal text-slate-500">(Chữ ký số hợp lệ)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Checksum SHA-256 đối chiếu khớp 100% thời gian thực. Không phát hiện chỉnh sửa metadata ảnh hiện trường.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Quy tắc thẩm quyền chuỗi:</span>
              <span>Đã lưu → Phân loại → Giao việc → Đã sửa → <strong className="text-emerald-700">{currentItem.status === 'ACCEPTED' ? 'ĐÃ DUYỆT' : 'ĐANG DUYỆT'}</strong> → Đã công bố.</span>
            </div>
          </div>

          {/* Metric 3: Chỉ số kỹ thuật đo đạc nghiệm thu */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">3. Đo đạc nghiệm thu</span>
                <Sliders className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                K = {currentItem.compaction_k98} <span className="text-xs font-semibold text-emerald-700">(Đạt K ≥ 0.98)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Kiểm tra độ bằng phẳng thước 3m: Khe hở lớn nhất đạt ≤ {currentItem.flatness_3m_gap_mm} mm (Giới hạn: 3.0 mm).
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Độ nhám rắc cát:</span>
              <span>Đạt <strong>{currentItem.sand_patch_roughness_mm} mm</strong> (Đạt tiêu chuẩn an toàn cao tốc).</span>
            </div>
          </div>

          {/* Metric 4: Đánh giá & Cam kết bảo hành */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">4. Bảo hành &amp; Pháp nhân</span>
                <Award className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                12 Tháng <span className="text-xs font-normal text-slate-500">(Đến 30/08/2027)</span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Cam kết bảo hành kết cấu vá mặt đường, chống lún vệt bánh xe và bong tróc mép mối nối.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold block text-[#92700C] mb-0.5">Đơn vị chịu trách nhiệm:</span>
              <span>Xí nghiệp Quản lý Đường bộ 2 (Nhà thầu phụ trách tuyến Km 1020 - Km 1045).</span>
            </div>
          </div>
        </div>

        {/* Signatures & Authority Sign-off block */}
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#FEF9E7] text-[#92700C] border border-[#FDE68A] shadow-xs">
              H
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="font-bold text-sm text-slate-900 font-sansation">Kỹ sư Giám sát trưởng (ID: GS-2041)</div>
              <div className="text-slate-600">Kỹ sư Giám sát trưởng hiện trường • Ban Quản lý Hạ tầng Hoàng Hải Miền Trung</div>
              <div className="font-mono text-[11px] text-emerald-800">
                Mã xác thực toàn vẹn biên bản: SHA256: 540211ab89c9a227e2e5e9
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Trạng thái xác thực điện tử</span>
              <span className="text-xs text-emerald-800 font-semibold px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                {currentItem.status === 'ACCEPTED' ? 'Đã ký số xác thực thành công' : 'Khóa điện tử sẵn sàng ký số'}
              </span>
            </div>
          </div>
        </div>
      </section>

  )
}