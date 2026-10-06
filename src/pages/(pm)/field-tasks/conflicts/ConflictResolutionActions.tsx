import React from 'react'
import {
  Clock,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  XCircle,
  Split,
  Archive,
  ShieldCheck
} from 'lucide-react'
import { SyncConflictItem } from '../../../../types/domain'

export interface ConflictResolutionActionsProps {
  selectedConflict: SyncConflictItem
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

export const ConflictResolutionActions: React.FC<ConflictResolutionActionsProps> = ({
  selectedConflict,
  isPM,
  isSupervisor,
  handleOpenResolve
}) => {
  return (
    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <div className="text-[11px] text-slate-500">
        {selectedConflict.status === 'CONFLICT_INTAKE' ? (
          <span className="flex items-center gap-1 text-amber-700 font-semibold">
            <Clock className="w-3.5 h-3.5" /> Há»“ sÆ¡ Ä‘ang chá» quyáº¿t Ä‘á»‹nh xá»­ lÃ½
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Há»“ sÆ¡ Ä‘Ã£ Ä‘Æ°á»£c chá»‘t vÃ  lÆ°u váº¿t kiá»ƒm toÃ¡n
          </span>
        )}
      </div>

      {/* NÃšT THAO TÃC CHO PROJECT MANAGER (PM CHá»ˆ HUY TRÆ¯á»žNG) */}
      {isPM && selectedConflict.status === 'CONFLICT_INTAKE' && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* TRÆ¯á»œNG Há»¢P CA 3: DEVICE_RESCUE_PENDING (TuÃ¢n thá»§ Q17/Decision 42A - PM lÃ  Maker, khÃ´ng tá»± duyá»‡t) */}
          {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('SUBMIT_RESCUE_TO_SUP')}
                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold bg-purple-700 hover:bg-purple-800 transition shadow-sm flex items-center gap-1.5 cursor-pointer font-sansation"
                title="Theo Q17/42A: PM láº­p tá» trÃ¬nh gá»­i Supervisor kÃ½ sá»‘ phÃª duyá»‡t"
              >
                <ShieldAlert className="w-4 h-4 text-brand-gold" />
                <span>TrÃ¬nh GiÃ¡m sÃ¡t kÃ½ duyá»‡t cá»©u há»™ (Q17/42A)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>YÃªu cáº§u Äá»™i thi cÃ´ng bá»• sung biÃªn báº£n</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-rose-700 hover:bg-rose-800 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>BÃ¡c bá» dá»¯ liá»‡u há»ng & Giao Äá»™i Ä‘o láº¡i</span>
              </button>
            </>
          ) : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' ? (
            /* TRÆ¯á»œNG Há»¢P CA 5: AGGREGATE_VERSION_CONFLICT (TuÃ¢n thá»§ BR-26 & Invariant #3 - KhÃ³a cá»©ng Ä‘á»£t cÅ©) */
            <>
              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3.5 py-2 rounded-xl text-white text-xs font-bold bg-brand-gold hover:bg-brand-goldMuted transition shadow-sm flex items-center gap-1.5 cursor-pointer font-sansation ring-2 ring-brand-gold/40"
                title="TuÃ¢n thá»§ BR-26: Táº¡o phá»¥ lá»¥c Ä‘á»£t má»›i Ä‘á»ƒ giáº£i ngÃ¢n khá»‘i lÆ°á»£ng ná»™p muá»™n"
              >
                <Split className="w-4 h-4" />
                <span>Táº¡o Phá»¥ Lá»¥c Äá»£t Bá»• Sung (TuÃ¢n thá»§ BR-26)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>Báº£o lÆ°u há»“ sÆ¡ Ä‘Ã£ Ä‘Ã³ng (Tá»« chá»‘i sá»‘ liá»‡u)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3 py-2 rounded-xl text-slate-800 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5 text-slate-600" />
                <span>Chuyá»ƒn vÃ o HÃ ng Ä‘á»£i Ä‘á»£t sá»­a tiáº¿p theo</span>
              </button>
            </>
          ) : (
            /* CÃC TRÆ¯á»œNG Há»¢P CA 1, 2, 4 */
            <>
              {/* NÃºt 1: Cháº¥p nháº­n ngoáº¡i tuyáº¿n / Báº£n Ä‘o chuáº©n / Chuyá»ƒn Ä‘á»£t */}
              <button
                type="button"
                onClick={() => handleOpenResolve('ACCEPT_INCOMING')}
                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer font-sansation"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                    'Cháº¥p nháº­n Thiáº¿t Bá»‹ 2 (MÃ¡y chÃ­nh chuáº©n)'}
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                    'Cháº¥p nháº­n Äá»™i 02 (Thu há»“i lá»‡nh Äá»™i 01)'}
                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                    'Chuyá»ƒn sang Láº­p Ä‘á»£t sá»­a trÃ¬nh GiÃ¡m sÃ¡t (Policy v2.2)'}
                </span>
              </button>

              {/* NÃºt 2: Báº£o lÆ°u mÃ¡y chá»§ */}
              <button
                type="button"
                onClick={() => handleOpenResolve('KEEP_SERVER_STATE')}
                className="px-3 py-2 rounded-xl text-slate-700 text-xs font-semibold bg-slate-100 hover:bg-slate-200 transition border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-slate-500" />
                <span>
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                    'Báº£o lÆ°u Thiáº¿t Bá»‹ 1 (MÃ¡y phá»¥)'}
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                    'Báº£o lÆ°u lá»‡nh Äá»™i 01 (Há»§y káº¿t quáº£ Äá»™i 02)'}
                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                    'Báº£o lÆ°u chÃ­nh sÃ¡ch v2.2 (Tá»« chá»‘i Fast Track)'}
                </span>
              </button>

              {/* NÃºt 3: TÃ¡ch láº§n sá»­a má»›i (Fork Attempt) */}
              <button
                type="button"
                onClick={() => handleOpenResolve('FORK_NEW_ATTEMPT')}
                className="px-3 py-2 rounded-xl text-white text-xs font-semibold bg-brand-gold hover:bg-brand-goldMuted transition shadow-xs flex items-center gap-1.5 cursor-pointer font-sansation"
              >
                <Split className="w-4 h-4" />
                <span>
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                    'TÃ¡ch 2 Ä‘á»£t Ä‘o Ä‘á»‘i chá»©ng (Fork)'}
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                    'TÃ¡ch 2 láº§n sá»­a Ä‘á»™c láº­p (Fork)'}
                  {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                    'TÃ¡ch thÃ nh Äá»£t sá»­a chá»¯a ná»n mÃ³ng chuyÃªn Ä‘á»'}
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* NÃšT THAO TÃC CHO SUPERVISOR (GIÃM SÃT / CHá»¦ Äáº¦U TÆ¯) */}
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
                <span>KÃ½ sá»‘ PhÃª duyá»‡t Cá»©u Dá»¯ Liá»‡u Thiáº¿t Bá»‹ (Decision 42A)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolve('SUPERVISOR_REJECT_RESCUE')}
                className="px-3.5 py-2 rounded-xl text-rose-700 text-xs font-bold bg-rose-50 hover:bg-rose-100 transition border border-rose-300 flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Tá»« chá»‘i gÃ³i cá»©u há»™ (Báº¯t buá»™c Ä‘o láº¡i)</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              Cháº¿ Ä‘á»™ GiÃ¡m sÃ¡t: Quyá»n phÃ¢n giáº£i nghiá»‡p vá»¥ thuá»™c Chá»‰ huy trÆ°á»Ÿng PM (Maker-Checker).
            </div>
          )}
        </div>
      )}
    </div>
  )
}
