import React from 'react'
import { Clock, Smartphone, ShieldAlert, Archive, ArrowRight } from 'lucide-react'
import { Card } from '../../../../components/ui/Card'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'

export interface ConflictServerStateCardProps {
  selectedConflict: SyncConflictItem
}

export const ConflictServerStateCard: React.FC<ConflictServerStateCardProps> = ({
  selectedConflict
}) => {
  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <Card className="p-4 bg-slate-50 border border-slate-200 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* TiÃªu Ä‘á» & NhÃ£n cá»™t 1 thay Ä‘á»•i Ä‘á»™ng theo tá»«ng loáº¡i xung Ä‘á»™t */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' ? (
                <Smartphone className="w-4 h-4 text-blue-600" />
              ) : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' ? (
                <ShieldAlert className="w-4 h-4 text-purple-600" />
              ) : (
                <Archive className="w-4 h-4 text-slate-600" />
              )}
              <span className="font-bold text-slate-900 font-sansation text-sm uppercase tracking-wide">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                  '1. Báº£n Ná»™p Thiáº¿t Bá»‹ 1 (MÃ¡y Phá»¥ - 14:00)'}
                {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                  '1. Lá»‡nh PhÃ¢n CÃ´ng Má»›i TrÃªn MÃ¡y Chá»§ (09:30)'}
                {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                  '1. ChÃ­nh SÃ¡ch Má»›i Cáº­p Nháº­t TrÃªn MÃ¡y Chá»§ (09:00)'}
                {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' &&
                  '1. BiÃªn Báº£n Sá»± Cá»‘ Thiáº¿t Bá»‹ (Supervisor Audit)'}
                {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' &&
                  '1. Há»“ SÆ¡ Äá»£t ÄÃ£ ÄÃ³ng BÄƒng KhÃ³a Cá»©ng (13:00)'}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-200 text-slate-700">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && 'Thiáº¿t Bá»‹ 1 (TrÆ°á»›c)'}
              {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' && 'Lá»‡nh 09:30'}
              {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' && 'ChÃ­nh SÃ¡ch v2.2'}
              {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' && 'Quy Chuáº©n Q17/42A'}
              {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' && 'ÄÃƒ ÄÃ“NG (13:00)'}
            </span>
          </div>

          {/* áº¢nh Cá»™t TrÃ¡i: Sá»­ dá»¥ng Ä‘á»“ há»a SVG ká»¹ thuáº­t cÃ´ng trÃ¬nh chÃ¢n thá»±c */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                ? 'áº¢nh sÆ¡ bá»™ chá»¥p tá»« Thiáº¿t Bá»‹ 1 (MÃ¡y phá»¥)'
                : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                ? 'Báº±ng chá»©ng hiá»‡n trÆ°á»ng: Thiáº¿t bá»‹ rÆ¡i vá»¡ mÃ n hÃ¬nh (DEV-HH-TAB-712)'
                : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                ? 'áº¢nh kháº£o sÃ¡t vá»‹ trÃ­ á»• gÃ  lÆ°u trÃªn mÃ¡y chá»§'
                : 'áº¢nh hiá»‡n tráº¡ng lÆ°u trá»¯ trÃªn mÃ¡y chá»§'}
            </span>
            <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group">
              <SafeImage
                src={
                  selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a?.photo_url
                    ? selectedConflict.duplicate_device_a.photo_url
                    : selectedConflict.server_state.server_photo_url
                }
                alt="áº¢nh Cá»™t TrÃ¡i"
                vectorType={
                  selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? 'DRONE_SURVEY_MAP'
                    : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? 'DRONE_SURVEY_MAP'
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'BROKEN_DEVICE_INCIDENT'
                    : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'RUTTING_3M_BEAM'
                    : 'EXPANSION_JOINT'
                }
                chainage={selectedConflict.chainage}
                value={
                  selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'THIáº¾T Bá»Š Há»ŽNG Váº¬T LÃ'
                    : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                    ? 'LÃšN SÆ  Bá»˜ ~20mm'
                    : undefined
                }
              />
              {/* Floating Top Timestamp Badge */}
              <div className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1.5 shadow-md z-10">
                <Clock className="w-3 h-3 text-brand-gold" />
                <span>
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a
                    ? selectedConflict.duplicate_device_a.captured_at
                    : selectedConflict.server_state.last_updated}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                <span className="text-white text-[11px] font-mono font-medium">
                  {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a
                    ? `Thiáº¿t bá»‹ 1 ghi nháº­n lÃºc: ${selectedConflict.duplicate_device_a.captured_at}`
                    : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? `Thá»i Ä‘iá»ƒm xáº£y ra sá»± cá»‘ há»ng mÃ¡y: ${selectedConflict.server_state.last_updated}`
                    : `MÃ¡y chá»§ cáº­p nháº­t lÃºc: ${selectedConflict.server_state.last_updated}`}
                </span>
              </div>
            </div>
          </div>

          {/* Ná»™i dung chi tiáº¿t Cá»™t TrÃ¡i theo ngá»¯ cáº£nh tá»«ng loáº¡i lá»—i */}
          <div className="space-y-2 text-xs">
            {/* TRÆ¯á»œNG Há»¢P CA 1: ASSIGNMENT_REASSIGNED (Äá»•i Ä‘á»™i khi ngoáº¡i tuyáº¿n) */}
            {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 block text-[11px] font-bold uppercase tracking-wider">
                    Lá»‹ch sá»­ Ä‘iá»u chuyá»ƒn Ä‘á»™i thi cÃ´ng (Q04):
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                    CÃ¡ch biá»‡t: 2 giá» 30 phÃºt
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-gold" />
                        Má»C 1 â€¢ 07:00:00 SÃNG
                      </div>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedConflict.server_state.initial_assignee || 'Tá»• cÆ¡ Ä‘á»™ng HoÃ ng Háº£i 02 (KS Pháº¡m VÄƒn HÃ¹ng)'}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Giao ban Ä‘áº§u
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-slate-400 py-0.5">
                    <ArrowRight className="w-4 h-4 text-brand-gold" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/90 border border-blue-200">
                    <div>
                      <div className="text-[10px] font-mono text-blue-700 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        Má»C 2 â€¢ 09:30:10 SÃNG
                      </div>
                      <div className="font-bold text-blue-900 mt-0.5">
                        {selectedConflict.server_state.current_assignee}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                      Lá»‡nh Ä‘iá»u chuyá»ƒn
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TrÆ°á»ng há»£p 2: DUPLICATE_WORK_ATTEMPT (TrÃ¹ng 2 mÃ¡y) */}
            {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && selectedConflict.duplicate_device_a && (
              <>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">NgÆ°á»i ná»™p & Thiáº¿t bá»‹ phá»¥:</span>
                  <div className="font-bold text-slate-800">{selectedConflict.duplicate_device_a.name}</div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {selectedConflict.duplicate_device_a.device_id} â€¢ {selectedConflict.duplicate_device_a.device_model}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Sá»‘ liá»‡u Ä‘o Ä‘áº¡c sÆ¡ bá»™ (Thiáº¿t bá»‹ 1):</span>
                  <div className="font-bold text-blue-700 font-sansation text-sm">
                    {selectedConflict.duplicate_device_a.measured_value}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    PhÆ°Æ¡ng phÃ¡p: <strong>{selectedConflict.duplicate_device_a.measurement_type}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">MÃ£ bÄƒm SHA-256 báº£n ná»™p 1:</span>
                  <div className="font-mono text-[10px] text-slate-600 bg-slate-50 p-1 rounded border border-slate-100 break-all select-all">
                    {selectedConflict.duplicate_device_a.sha256_hash}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Ghi chÃº tá»« mÃ¡y phá»¥:</span>
                  <p className="text-slate-600 text-[11px] italic">"{selectedConflict.duplicate_device_a.notes}"</p>
                </div>
              </>
            )}

            {/* CÃ¡c trÆ°á»ng há»£p khÃ¡c: POLICY, RESCUE, AGGREGATE */}
            {selectedConflict.conflict_type !== 'DUPLICATE_WORK_ATTEMPT' && (
              <>
                {selectedConflict.conflict_type !== 'ASSIGNMENT_REASSIGNED' && (
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                    <span className="text-slate-500 block text-[11px]">
                      {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                        ? 'ÄÆ¡n vá»‹ phá»¥ trÃ¡ch tháº©m tra thiáº¿t bá»‹:'
                        : 'Äá»™i thi cÃ´ng hiá»‡n hÃ nh trÃªn há»‡ thá»‘ng:'}
                    </span>
                    <span className="font-bold text-slate-800">{selectedConflict.server_state.current_assignee}</span>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Tráº¡ng thÃ¡i & TiÃªu chuáº©n quy Ä‘á»‹nh:</span>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="font-semibold text-slate-700">{selectedConflict.server_state.current_status}</span>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedConflict.server_state.policy_version}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">
                    {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                      ? 'Ná»™i dung chÃ­nh sÃ¡ch v2.2 má»›i ban hÃ nh:'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'CÄƒn cá»© phÃ¡p lÃ½ tháº©m quyá»n cá»©u há»™:'
                      : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
                      ? 'RÃ ng buá»™c Ä‘Ã³ng bÄƒng há»“ sÆ¡ Ä‘á»£t (BR-26):'
                      : 'Quy Ä‘á»‹nh ká»¹ thuáº­t Ä‘ang Ã¡p dá»¥ng:'}
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {selectedConflict.server_state.policy_summary}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="text-slate-500 block text-[11px]">
                    {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'BiÃªn báº£n xÃ¡c nháº­n sá»± cá»‘ thiáº¿t bá»‹ táº¡i hiá»‡n trÆ°á»ng:'
                      : 'Ghi chÃº tá»« VÄƒn phÃ²ng Ä‘iá»u hÃ nh:'}
                  </span>
                  <p className="text-slate-600 text-[11px] italic">"{selectedConflict.server_state.server_notes}"</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
              ? 'Tráº¡ng thÃ¡i: Ghi nháº­n báº£n nhÃ¡p Thiáº¿t Bá»‹ 1'
              : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
              ? 'Tráº¡ng thÃ¡i: KhÃ³a cá»©ng báº¥t biáº¿n BR-26'
              : 'Tráº¡ng thÃ¡i: KhÃ³a sá»­a Ä‘á»•i trá»±c tiáº¿p'}
          </span>
          <span className="font-mono font-bold text-slate-600">
            {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
              ? 'Decision 42A'
              : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
              ? 'TCVN 8864 DÆ°á»¡ng 3m'
              : selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT'
              ? 'Invariant #3'
              : 'BR-16 Lock'}
          </span>
        </div>
      </Card>
    </div>
  )
}
