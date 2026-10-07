import React from 'react'
import { Route, X, Calendar, ShieldCheck, Shield, PlusCircle } from 'lucide-react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onChangeProjectName: (val: string) => void
  projectCode: string
  onChangeProjectCode: (val: string) => void
  projectRegion: string
  onChangeProjectRegion: (val: string) => void
  projectPM: string
  onChangeProjectPM: (val: string) => void
  startDate: string
  onChangeStartDate: (val: string) => void
  endDate: string
  onChangeEndDate: (val: string) => void
  inspectionStandard?: string
  onChangeInspectionStandard?: (val: string) => void
  retentionAmount?: string
  onChangeRetentionAmount?: (val: string) => void
  startKm: string
  onChangeStartKm: (val: string) => void
  endKm: string
  onChangeEndKm: (val: string) => void
  lengthKm: string
  onChangeLengthKm: (val: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  projectName,
  onChangeProjectName,
  projectCode,
  onChangeProjectCode,
  projectRegion,
  onChangeProjectRegion,
  projectPM,
  onChangeProjectPM,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  inspectionStandard = 'TCVN 8819:2011',
  onChangeInspectionStandard,
  retentionAmount: _retentionAmount,
  onChangeRetentionAmount: _onChangeRetentionAmount,
  startKm,
  onChangeStartKm,
  endKm,
  onChangeEndKm,
  lengthKm,
  onChangeLengthKm,
  onSubmit
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold text-white flex items-center justify-center shrink-0 shadow-xs">
              <Route className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight font-headline">
                Khởi tạo dự án bảo hành đường bộ mới
              </h2>
              <p className="text-xs text-slate-500">
                Hệ thống tự động thiết lập phạm vi lý trình và cấp quyền quản lý cho PM phụ trách.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Project Title & PRJ Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Tên dự án đường bộ <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => onChangeProjectName(e.target.value)}
                placeholder="VD: Quốc lộ 14 - Đoạn Chơn Thành"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Mã dự án (PRJ) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => onChangeProjectCode(e.target.value.toUpperCase())}
                placeholder="VD: PRJ-QL14-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <span className="text-[10px] text-slate-400">Định dạng mã chuẩn: PRJ-[MÃ_TUYẾN]-[STT]</span>
            </div>
          </div>

          {/* Region & PM Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Khu vực địa lý / Tỉnh thành quản lý <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectRegion}
                onChange={(e) => onChangeProjectRegion(e.target.value)}
                placeholder="VD: Bình Phước - Bình Dương, Thừa Thiên Huế, Hà Nội..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">
                  Chỉ định Kỹ sư PM <span className="text-rose-600">*</span>
                </label>
                <span className="text-[10px] font-bold text-brand-goldMuted bg-brand-gold/15 px-1.5 py-0.2 rounded">
                  CCHN Hạng I
                </span>
              </div>
              <select
                value={projectPM}
                onChange={(e) => onChangeProjectPM(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="Đỗ Quốc Hoàng (pmhoang@gmail.com)">Kỹ sư Đỗ Quốc Hoàng (pmhoang@gmail.com)</option>
                <option value="Trần Minh Tâm (tam.tm@hoanghai-infra.vn)">Kỹ sư Trần Minh Tâm (tam.tm@hoanghai-infra.vn)</option>
                <option value="Lê Văn Cường (cuong.lv@hoanghai-infra.vn)">Kỹ sư Lê Văn Cường (cuong.lv@hoanghai-infra.vn)</option>
                <option value="-- Để trống --">-- Để trống (Phân công sau tại Quản trị hệ thống) --</option>
              </select>
            </div>
          </div>

          {/* Warranty Period */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-brand-gold" />
              Khung thời gian hiệu lực bảo hành (Biên bản nghiệm thu đưa vào sử dụng)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">Ngày bắt đầu hiệu lực</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onChangeStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">Ngày kết thúc bảo hành (36 tháng)</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onChangeEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tiêu chuẩn kiểm định kỹ thuật (TCVN) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                Tiêu chuẩn nghiệm thu &amp; kiểm định kỹ thuật (TCVN)
              </span>
              <span className="text-[10px] font-mono font-bold text-brand-goldMuted bg-brand-gold/15 px-2 py-0.5 rounded">
                Quy chuẩn kỹ thuật v2.2
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={inspectionStandard}
                onChange={(e) => onChangeInspectionStandard && onChangeInspectionStandard(e.target.value)}
                placeholder="VD: TCVN 8819:2011 (Mặt đường BTN nóng)"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Quy chuẩn kỹ thuật quốc gia áp dụng cho công tác nghiệm thu bảo hành và bảo trì đường bộ.
            </p>
          </div>

          {/* Phạm vi lý trình tuyến đường (Km bắt đầu - Km kết thúc - Tổng chiều dài) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <Route className="w-4 h-4 text-brand-gold" />
              Phạm vi lý trình &amp; Quy mô tuyến đường
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Lý trình bắt đầu <span className="text-rose-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={startKm}
                  onChange={(e) => onChangeStartKm(e.target.value)}
                  placeholder="VD: Km 0+000"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Lý trình kết thúc <span className="text-rose-600">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={endKm}
                  onChange={(e) => onChangeEndKm(e.target.value)}
                  placeholder="VD: Km 28+500"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Chiều dài tuyến (Km) <span className="text-rose-600">*</span>
                </span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lengthKm}
                    onChange={(e) => onChangeLengthKm(e.target.value)}
                    placeholder="28.5"
                    className="w-full pl-3 pr-9 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    km
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory Note */}
          <div className="p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Quy định thẩm quyền (Nghị định 06/2021/NĐ-CP):</strong> Sau khi khởi tạo, dự án sẽ được đưa vào danh mục bảo hành. Toàn bộ việc quản lý, phân công và bổ sung nhân sự dự án được quản trị tập trung tại <strong>Quản trị hệ thống</strong> (Supervisor).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer text-xs"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-xl font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Khởi tạo dự án</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
