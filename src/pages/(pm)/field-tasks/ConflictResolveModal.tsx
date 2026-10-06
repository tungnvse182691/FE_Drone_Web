import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { SyncConflictItem } from '../../../types/domain'

export interface ConflictResolveModalProps {
  isResolveModalOpen: boolean
  setIsResolveModalOpen: (open: boolean) => void
  selectedConflict: SyncConflictItem
  pendingDecision:
    | 'ACCEPT_INCOMING'
    | 'KEEP_SERVER_STATE'
    | 'FORK_NEW_ATTEMPT'
    | 'SUBMIT_RESCUE_TO_SUP'
    | 'AUTHORIZE_RESCUE'
    | 'SUPERVISOR_REJECT_RESCUE'
    | null
  resolutionReason: string
  setResolutionReason: (reason: string) => void
  handleExecuteResolution: (e: React.FormEvent) => void
}

export const ConflictResolveModal: React.FC<ConflictResolveModalProps> = ({
  isResolveModalOpen,
  setIsResolveModalOpen,
  selectedConflict,
  pendingDecision,
  resolutionReason,
  setResolutionReason,
  handleExecuteResolution
}) => {
  if (!isResolveModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-brand-border bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-gold" />
                <h3 className="font-bold text-base text-slate-900 font-sansation">
                  XÃ¡c Nháº­n Quyáº¿t Äá»‹nh PhÃ¢n Giáº£i Xung Äá»™t
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 flex items-center justify-center cursor-pointer"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleExecuteResolution} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FBF6E9]/50 border border-[#F1E5C6] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Há»“ sÆ¡ xung Ä‘á»™t:</span>
                  <span className="font-mono font-bold text-brand-dark">{selectedConflict?.conflict_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">LÃ½ trÃ¬nh cÃ´ng trÃ¬nh:</span>
                  <span className="font-mono text-slate-800">{selectedConflict?.chainage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Quyáº¿t Ä‘á»‹nh lá»±a chá»n:</span>
                  <span className="font-bold text-brand-goldMuted">
                    {pendingDecision === 'SUBMIT_RESCUE_TO_SUP' &&
                      'TrÃ¬nh GiÃ¡m sÃ¡t phÃª duyá»‡t gÃ³i cá»©u há»™ (Q17/Decision 42A)'}
                    {pendingDecision === 'AUTHORIZE_RESCUE' &&
                      'KÃ½ sá»‘ phÃª duyá»‡t Ä‘Æ°a gÃ³i dá»¯ liá»‡u cá»©u há»™ vÃ o kho chá»©ng cá»© sá»‘ (Decision 42A)'}
                    {pendingDecision === 'SUPERVISOR_REJECT_RESCUE' &&
                      'Tá»« chá»‘i gÃ³i dá»¯ liá»‡u cá»©u há»™ (Báº¯t buá»™c Ä‘o Ä‘áº¡c láº¡i ngoÃ i hiá»‡n trÆ°á»ng)'}
                    {pendingDecision === 'ACCEPT_INCOMING' &&
                      (selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                        ? 'Cháº¥p nháº­n báº£n Ä‘o chuáº©n Thiáº¿t Bá»‹ 2 (MÃ¡y chÃ­nh)'
                        : selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                        ? 'Cháº¥p nháº­n káº¿t quáº£ Äá»™i 02 (Thu há»“i lá»‡nh Äá»™i 01)'
                        : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                        ? 'Chuyá»ƒn sang Láº­p Ä‘á»£t sá»­a trÃ¬nh GiÃ¡m sÃ¡t duyá»‡t (Policy v2.2)'
                        : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                        ? 'Chuyá»ƒn sá»‘ liá»‡u ná»™p muá»™n vÃ o HÃ ng Ä‘á»£i Ä‘á»£t sá»­a tiáº¿p theo'
                        : 'Cháº¥p nháº­n chá»©ng cá»© ngoáº¡i tuyáº¿n (Accept Incoming)')}
                    {pendingDecision === 'KEEP_SERVER_STATE' &&
                      (selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                        ? 'Báº£o lÆ°u báº£n ná»™p sÆ¡ bá»™ Thiáº¿t Bá»‹ 1 (MÃ¡y phá»¥)'
                        : selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                        ? 'Báº£o lÆ°u lá»‡nh Ä‘iá»u chuyá»ƒn Äá»™i 01 (Há»§y káº¿t quáº£ Äá»™i 02)'
                        : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                        ? 'Báº£o lÆ°u chÃ­nh sÃ¡ch v2.2 (Tá»« chá»‘i tá»± sá»­a Fast Track)'
                        : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                        ? 'Báº£o lÆ°u há»“ sÆ¡ Ä‘Ã£ Ä‘Ã³ng (Tá»« chá»‘i sá»‘ liá»‡u ná»™p muá»™n)'
                        : selectedConflict?.conflict_type === 'DEVICE_RESCUE_PENDING'
                        ? 'YÃªu cáº§u Äá»™i thi cÃ´ng ná»™p bá»• sung biÃªn báº£n xÃ¡c nháº­n sá»± cá»‘ thiáº¿t bá»‹ táº¡i hiá»‡n trÆ°á»ng'
                        : 'Báº£o lÆ°u tráº¡ng thÃ¡i mÃ¡y chá»§ (Keep Server State)')}
                    {pendingDecision === 'FORK_NEW_ATTEMPT' &&
                      (selectedConflict?.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                        ? 'TÃ¡ch thÃ nh 2 báº£n Ä‘o Ä‘á»‘i chá»©ng Ä‘á»™c láº­p'
                        : selectedConflict?.conflict_type === 'ASSIGNMENT_REASSIGNED'
                        ? 'TÃ¡ch thÃ nh 2 láº§n sá»­a chá»¯a Ä‘á»™c láº­p'
                        : selectedConflict?.conflict_type === 'POLICY_VERSION_MISMATCH'
                        ? 'TÃ¡ch thÃ nh Äá»£t sá»­a chá»¯a ná»n mÃ³ng chuyÃªn Ä‘á»'
                        : selectedConflict?.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                        ? 'Táº¡o Phá»¥ Lá»¥c Äá»£t Bá»• Sung má»›i (TuÃ¢n thá»§ BR-26 / Invariant #3)'
                        : selectedConflict?.conflict_type === 'DEVICE_RESCUE_PENDING'
                        ? 'BÃ¡c bá» dá»¯ liá»‡u há»ng & Giao Äá»™i thi cÃ´ng ra Ä‘o Ä‘áº¡c láº¡i ngoÃ i hiá»‡n trÆ°á»ng'
                        : 'TÃ¡ch thÃ nh láº§n sá»­a má»›i (Fork New Attempt)')}
                  </span>
                </div>
              </div>


              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  LÃ½ do phÃ¢n giáº£i ká»¹ thuáº­t & CÄƒn cá»© kiá»ƒm toÃ¡n (Báº¯t buá»™c)
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  placeholder="Nháº­p cÄƒn cá»© nghiá»‡p vá»¥ (VÃ­ dá»¥: ÄÃ£ Ä‘á»‘i soÃ¡t kÃ­ch thÆ°á»›c dÆ°á»¡ng Ä‘o 3m khá»›p vá»›i áº£nh hiá»‡n tráº¡ng, xÃ¡c nháº­n áº£nh cÃ³ mÃ£ hash SHA-256 nguyÃªn báº£n...)"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-500 border border-slate-200 space-y-1">
                <div>â€¢ Quyáº¿t Ä‘á»‹nh nÃ y sáº½ Ä‘Æ°á»£c kÃ½ sá»‘ vÃ  lÆ°u vÄ©nh viá»…n vÃ o nháº­t kÃ½ kiá»ƒm toÃ¡n há»‡ thá»‘ng.</div>
                <div>â€¢ Dá»¯ liá»‡u chá»©ng cá»© khÃ´ng Ä‘Æ°á»£c phÃ©p ghi Ä‘Ã¨ máº¥t lá»‹ch sá»­ (TuÃ¢n thá»§ nguyÃªn táº¯c D05 & 42A).</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Há»§y thao tÃ¡c
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold bg-brand-gold hover:bg-brand-goldMuted transition shadow-md font-sansation cursor-pointer"
                >
                  XÃ¡c nháº­n & LÆ°u váº¿t Audit
                </button>
              </div>
            </form>
          </div>
        </div>
  )
}
