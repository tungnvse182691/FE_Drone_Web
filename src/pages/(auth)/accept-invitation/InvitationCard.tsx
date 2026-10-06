import React from 'react'
import {
  Route,
  Mail,
  Check,
  ShieldCheck,
  BadgeAlert,
  Lock,
  Timer
} from 'lucide-react'

export interface InvitationCardProps {
  token?: string
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ token }) => {
  return (
    <div>
      {/* Brand & Status Badge Row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-brand-gold p-0.5 flex items-center justify-center shadow-xs">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-brand-gold">
              <Route className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 font-headline">HoÃ ng Háº£i</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-gold/10 text-brand-goldMuted font-mono text-[11px] font-bold">PRO</span>
            </div>
            <span className="text-xs text-slate-500">RoadGuard Civil Platform v2.2</span>
          </div>
        </div>

        {/* Invitation Badge Circle */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#EDF7ED] flex items-center justify-center shadow-2xs">
            <Mail className="w-6 h-6 text-[#1B5E20]" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1B5E20] text-white flex items-center justify-center shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-snug font-headline">
          Báº¡n nháº­n Ä‘Æ°á»£c lá»i má»i tham gia dá»± Ã¡n
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Supervisor <strong className="text-slate-900 font-semibold">Nguyá»…n VÄƒn An</strong> (Ban QLDA) Ä‘Ã£ gá»­i lá»i má»i tham gia quáº£n trá»‹ &amp; váº­n hÃ nh dá»± Ã¡n háº¡ táº§ng giao thÃ´ng trá»ng Ä‘iá»ƒm.
        </p>
      </div>

      {/* Project Summary Box (#FAF8F5) */}
      <div
        className="rounded-xl p-4 sm:p-5 mb-6 border border-slate-200 relative overflow-hidden"
        style={{ backgroundColor: '#FAF8F5', borderRadius: '12px' }}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5">
          <span className="text-xs uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            Chi tiáº¿t phÃ¢n cÃ´ng nhÃ¢n sá»±
          </span>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">
            MÃƒ: {token ? `#${token}` : '#IVT-2026-98F'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10 text-xs">
          {/* Item 1: Project Name */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-brand-gold">
              <Route className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-500">Dá»± Ã¡n cÃ´ng trÃ¬nh</span>
              <p className="text-sm font-bold text-slate-900 truncate">Quá»‘c lá»™ 1A - Giai Ä‘oáº¡n 2</p>
              <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-white rounded-full font-mono text-[10px] text-brand-goldMuted font-semibold border border-slate-200">
                <span>Km 1024 - Km 1045</span>
                <span className="text-slate-300">â€¢</span>
                <span>PRJ-QL1A-02</span>
              </div>
            </div>
          </div>

          {/* Item 2: Assigned Role */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-brand-gold">
              <BadgeAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-500">Vai trÃ² bá»• nhiá»‡m</span>
              <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold text-white shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="text-xs font-semibold tracking-wide">Project Manager (PM)</span>
              </div>
            </div>
          </div>

          {/* Item 3: Email Receiver */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-brand-gold">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Email xÃ¡c thá»±c</span>
                <span className="inline-flex items-center text-[10px] text-slate-500 font-medium bg-black/5 px-1.5 py-0.2 rounded-full">
                  <Lock className="w-2.5 h-2.5 mr-0.5" /> Read-only
                </span>
              </div>
              <p className="font-mono text-slate-900 text-xs truncate mt-0.5 font-semibold">
                pmhoang@gmail.com
              </p>
            </div>
          </div>

          {/* Item 4: Expiration Window */}
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-amber-600">
              <Timer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-500">Thá»i háº¡n liÃªn káº¿t</span>
              <div className="mt-0.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                <span className="text-xs font-bold">CÃ²n 48 giá»</span>
                <span className="text-[10px] text-[#D97706]/80">(23:59 02/10/2026)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default InvitationCard
