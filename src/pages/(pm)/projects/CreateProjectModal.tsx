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
  retentionAmount: string
  onChangeRetentionAmount: (val: string) => void
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
  retentionAmount,
  onChangeRetentionAmount,
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
                Khá»Ÿi táº¡o dá»± Ã¡n báº£o hÃ nh Ä‘Æ°á»ng bá»™ má»›i
              </h2>
              <p className="text-xs text-slate-500">
                Há»‡ thá»‘ng tá»± Ä‘á»™ng thiáº¿t láº­p pháº¡m vi lÃ½ trÃ¬nh vÃ  cáº¥p quyá»n quáº£n lÃ½ cho PM phá»¥ trÃ¡ch.
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
                TÃªn dá»± Ã¡n Ä‘Æ°á»ng bá»™ <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => onChangeProjectName(e.target.value)}
                placeholder="VD: Quá»‘c lá»™ 14 - Äoáº¡n ChÆ¡n ThÃ nh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                MÃ£ dá»± Ã¡n (PRJ) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => onChangeProjectCode(e.target.value.toUpperCase())}
                placeholder="VD: PRJ-QL14-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 font-mono font-bold text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <span className="text-[10px] text-slate-400">Äá»‹nh dáº¡ng mÃ£ chuáº©n: PRJ-[MÃƒ_TUYáº¾N]-[STT]</span>
            </div>
          </div>

          {/* Region & PM Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                Khu vá»±c Ä‘á»‹a lÃ½ / Tá»‰nh thÃ nh quáº£n lÃ½ <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={projectRegion}
                onChange={(e) => onChangeProjectRegion(e.target.value)}
                placeholder="VD: BÃ¬nh PhÆ°á»›c - BÃ¬nh DÆ°Æ¡ng, Thá»«a ThiÃªn Huáº¿, HÃ  Ná»™i..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700">
                  Chá»‰ Ä‘á»‹nh Ká»¹ sÆ° PM <span className="text-rose-600">*</span>
                </label>
                <span className="text-[10px] font-bold text-brand-goldMuted bg-brand-gold/15 px-1.5 py-0.2 rounded">
                  CCHN Háº¡ng I
                </span>
              </div>
              <select
                value={projectPM}
                onChange={(e) => onChangeProjectPM(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              >
                <option value="Äá»— Quá»‘c HoÃ ng (pmhoang@gmail.com)">Ká»¹ sÆ° Äá»— Quá»‘c HoÃ ng (pmhoang@gmail.com)</option>
                <option value="Tráº§n Minh TÃ¢m (tam.tm@hoanghai-infra.vn)">Ká»¹ sÆ° Tráº§n Minh TÃ¢m (tam.tm@hoanghai-infra.vn)</option>
                <option value="LÃª VÄƒn CÆ°á»ng (cuong.lv@hoanghai-infra.vn)">Ká»¹ sÆ° LÃª VÄƒn CÆ°á»ng (cuong.lv@hoanghai-infra.vn)</option>
                <option value="-- Äá»ƒ trá»‘ng --">-- Äá»ƒ trá»‘ng (PhÃ¢n cÃ´ng sau táº¡i Quáº£n trá»‹ há»‡ thá»‘ng) --</option>
              </select>
            </div>
          </div>

          {/* Warranty Period */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-brand-gold" />
              Khung thá»i gian hiá»‡u lá»±c báº£o hÃ nh (BiÃªn báº£n nghiá»‡m thu Ä‘Æ°a vÃ o sá»­ dá»¥ng)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">NgÃ y báº¯t Ä‘áº§u hiá»‡u lá»±c</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onChangeStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">NgÃ y káº¿t thÃºc báº£o hÃ nh (36 thÃ¡ng)</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onChangeEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* GiÃ¡ trá»‹ giá»¯ láº¡i báº£o hÃ nh há»£p Ä‘á»“ng (v2.2 DA04 / retained_value) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                Khoáº£n tiá»n báº£o lÃ£nh giá»¯ láº¡i báº£o hÃ nh (VNÄ)
              </span>
              <span className="text-[10px] font-mono font-bold text-brand-goldMuted bg-brand-gold/15 px-2 py-0.5 rounded">
                Quy chuáº©n v2.2 (DA04 / retained_value)
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={retentionAmount}
                onChange={(e) => onChangeRetentionAmount(e.target.value)}
                placeholder="VD: 15.500.000.000 â‚« (5% giÃ¡ trá»‹ há»£p Ä‘á»“ng)"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Khoáº£n tiá»n báº£o lÃ£nh há»£p Ä‘á»“ng chá»§ Ä‘áº§u tÆ° giá»¯ láº¡i (thÆ°á»ng 3% â€“ 5% giÃ¡ trá»‹ cÃ´ng trÃ¬nh) Ä‘á»ƒ báº£o Ä‘áº£m nghÄ©a vá»¥ sá»­a chá»¯a O&amp;M cá»§a nhÃ  tháº§u HoÃ ng Háº£i.
            </p>
          </div>

          {/* Pháº¡m vi lÃ½ trÃ¬nh tuyáº¿n Ä‘Æ°á»ng (Km báº¯t Ä‘áº§u - Km káº¿t thÃºc - Tá»•ng chiá»u dÃ i) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <Route className="w-4 h-4 text-brand-gold" />
              Pháº¡m vi lÃ½ trÃ¬nh &amp; Quy mÃ´ tuyáº¿n Ä‘Æ°á»ng
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  LÃ½ trÃ¬nh báº¯t Ä‘áº§u <span className="text-rose-600">*</span>
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
                  LÃ½ trÃ¬nh káº¿t thÃºc <span className="text-rose-600">*</span>
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
                  Chiá»u dÃ i tuyáº¿n (Km) <span className="text-rose-600">*</span>
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
              <strong className="text-slate-900">Quy Ä‘á»‹nh tháº©m quyá»n (Nghá»‹ Ä‘á»‹nh 06/2021/NÄ-CP):</strong> Sau khi khá»Ÿi táº¡o, dá»± Ã¡n sáº½ Ä‘Æ°á»£c Ä‘Æ°a vÃ o danh má»¥c báº£o hÃ nh. ToÃ n bá»™ viá»‡c quáº£n lÃ½, phÃ¢n cÃ´ng vÃ  bá»• sung nhÃ¢n sá»± dá»± Ã¡n Ä‘Æ°á»£c quáº£n trá»‹ táº­p trung táº¡i <strong>Quáº£n trá»‹ há»‡ thá»‘ng</strong> (Supervisor).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition cursor-pointer text-xs"
            >
              Há»§y bá»
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-gold hover:bg-brand-goldMuted text-white rounded-xl font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Khá»Ÿi táº¡o dá»± Ã¡n</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
