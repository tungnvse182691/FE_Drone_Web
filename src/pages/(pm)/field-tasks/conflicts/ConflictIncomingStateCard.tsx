import React from 'react'
import { Smartphone, Clock, FileCheck, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Card } from '../../../../components/ui/Card'
import { SyncConflictItem } from '../../../../types/domain'
import { SafeImage } from '../../../../components/common/SafeImage'
import { ConflictResolutionActions } from './ConflictResolutionActions'

export interface ConflictIncomingStateCardProps {
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

export const ConflictIncomingStateCard: React.FC<ConflictIncomingStateCardProps> = ({
  selectedConflict,
  isPM,
  isSupervisor,
  handleOpenResolve
}) => {
  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      <Card className="p-4 bg-white border-2 border-brand-gold/40 shadow-xs flex-1 flex flex-col justify-between relative">
        <div className="space-y-4">
          {/* TiÃªu Ä‘á» & NhÃ£n cá»™t 2 thay Ä‘á»•i Ä‘á»™ng theo tá»«ng loáº¡i xung Ä‘á»™t */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-brand-gold" />
              <span className="font-bold text-slate-900 font-sansation text-sm uppercase tracking-wide">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' &&
                  '2. Báº£n Ná»™p Thiáº¿t Bá»‹ 2 (MÃ¡y ChÃ­nh - Äá»™i TrÆ°á»Ÿng 15:10)'}
                {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' &&
                  '2. Káº¿t Quáº£ Thá»±c Táº¿ Äá»™i 02 ÄÃ£ Thi CÃ´ng Xong (10:15)'}
                {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' &&
                  '2. Äá» Xuáº¥t Fast Track Cá»§a Ká»¹ SÆ° Hiá»‡n TrÆ°á»ng (11:45)'}
                {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' &&
                  '2. GÃ³i Dá»¯ Liá»‡u SQLite Tráº¯c Äá»‹a TrÃ­ch Xuáº¥t Qua ADB'}
                {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' &&
                  '2. Chá»©ng Cá»© Thi CÃ´ng Gá»­i Muá»™n Tá»« Hiá»‡n TrÆ°á»ng (14:20)'}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FBF6E9] text-brand-goldMuted border border-[#F1E5C6] font-bold">
              {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT' && 'Thiáº¿t Bá»‹ 2 (Báº£n Äo Chuáº©n)'}
              {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED' && 'Tá»• 02 HoÃ n ThÃ nh (10:15)'}
              {selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH' && 'Snapshot v1.8 (07:00)'}
              {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING' && 'TrÃ­ch Xuáº¥t ADB An ToÃ n'}
              {selectedConflict.conflict_type === 'AGGREGATE_VERSION_CONFLICT' && 'Gá»­i Muá»™n (Offline 11h45)'}
            </span>
          </div>

          {/* 2 áº¢nh Thá»±c Táº¿ TrÆ°á»›c/Sau vá»›i SafeImage vectorType ká»¹ thuáº­t cÃ´ng trÃ¬nh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                  ? 'áº¢nh thÆ°á»›c dÆ°á»¡ng 3m (TCVN 8864)'
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? 'áº¢nh tráº¯c Ä‘á»‹a sá»¥t lÃºn chÃªnh cá»‘t'
                  : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? 'áº¢nh Ä‘o dÆ°á»¡ng Ä‘á»™ sÃ¢u á»• gÃ  (62mm)'
                  : 'áº¢nh Ä‘o Ä‘áº¡c thÆ°á»›c váº¡ch (Chá»¥p ngoáº¡i tuyáº¿n)'}
              </span>
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group">
                <SafeImage
                  src={selectedConflict.incoming_data.photo_evidence_url}
                  alt="áº¢nh thÆ°á»›c Ä‘o thá»±c táº¿"
                  vectorType={
                    selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? 'POTHOLE_BEFORE'
                      : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                      ? 'CRACK_OPTICAL'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'BRIDGE_SETTLEMENT'
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                      ? 'RUTTING_3M_BEAM'
                      : 'EXPANSION_JOINT'
                  }
                  chainage={selectedConflict.chainage}
                  value={selectedConflict.incoming_data.measured_value}
                />
                {/* Floating Timestamp Badge */}
                <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                  <Clock className="w-3 h-3 text-brand-gold" />
                  <span>{selectedConflict.offline_actor.captured_at}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                  <span className="text-white text-[10px] font-mono leading-tight">
                    GPS: {selectedConflict.incoming_data.gps_coords} (Â±{selectedConflict.incoming_data.accuracy_m}m)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                {selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                  ? 'áº¢nh cÃ o bÃ³c táº¡o pháº³ng (Wirtgen 1.0m)'
                  : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                  ? 'áº¢nh kiá»ƒm tra khe co giÃ£n má»‘ cáº§u'
                  : selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                  ? 'áº¢nh vÃ¡ pháº³ng Carboncor Asphalt K95'
                  : 'áº¢nh sau hoÃ n thiá»‡n thi cÃ´ng'}
              </span>
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group">
                <SafeImage
                  src={selectedConflict.incoming_data.photo_after_url}
                  alt="áº¢nh hoÃ n thiá»‡n"
                  vectorType={
                    selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                      ? 'POTHOLE_AFTER'
                      : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                      ? 'CRACK_OPTICAL'
                      : selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                      ? 'BRIDGE_SETTLEMENT'
                      : selectedConflict.conflict_type === 'DUPLICATE_WORK_ATTEMPT'
                      ? 'RUTTING_AFTER_MILLING'
                      : 'EXPANSION_JOINT_MASTIC'
                  }
                  chainage={selectedConflict.chainage}
                  value="Äáº¦M LÃˆN K95 HOÃ€N THIá»†N"
                />
                {/* Floating Timestamp Badge */}
                <div className="absolute top-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 shadow-md z-10">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>HoÃ n táº¥t: {selectedConflict.offline_actor.captured_at}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
                  <span className="text-white text-[10px] font-mono leading-tight">
                    Thá»i Ä‘iá»ƒm chá»¥p: {selectedConflict.offline_actor.captured_at}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Báº£ng phÃ¢n tÃ­ch thá»i gian cÃ´ng tÃ¡c ngoáº¡i tuyáº¿n */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-brand-gold" />
                Nháº­t kÃ½ thá»i gian ngoáº¡i tuyáº¿n (Offline Work Log):
              </span>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                Máº¥t sÃ³ng: {selectedConflict.offline_actor.offline_duration}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Báº¯t Ä‘áº§u máº¥t sÃ³ng:</div>
                <div className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? '07:30 SÃ¡ng'
                    : selectedConflict.conflict_type === 'POLICY_VERSION_MISMATCH'
                    ? '07:35 SÃ¡ng'
                    : 'LÃºc ra hiá»‡n trÆ°á»ng'}
                </div>
                <div className="text-[10px] text-slate-500">Khu vá»±c lÃµm sÃ³ng Ä‘Ã¨o</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Thá»i Ä‘iá»ƒm thi cÃ´ng xong:</div>
                <div className="font-mono font-bold text-emerald-800 mt-0.5">
                  {selectedConflict.offline_actor.captured_at}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">Chá»¥p áº£nh & bÄƒm SHA</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Thá»i Ä‘iá»ƒm Ä‘á»“ng bá»™ 4G:</div>
                <div className="font-mono font-bold text-blue-800 mt-0.5">
                  {selectedConflict.conflict_type === 'ASSIGNMENT_REASSIGNED'
                    ? '11:45 TrÆ°a'
                    : 'Khi báº¯t láº¡i sÃ³ng'}
                </div>
                <div className="text-[10px] text-blue-700 font-semibold">PhÃ¡t sinh xung Ä‘á»™t</div>
              </div>
            </div>
          </div>

          {/* Chi tiáº¿t Ä‘o Ä‘áº¡c vÃ  thÃ´ng tin thiáº¿t bá»‹ thá»£ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-brand-gold" />
                <span>
                  {selectedConflict.conflict_type === 'DEVICE_RESCUE_PENDING'
                    ? 'Sá»‘ liá»‡u tráº¯c Ä‘á»‹a phá»¥c há»“i thÃ nh cÃ´ng:'
                    : 'Káº¿t quáº£ Ä‘o Ä‘áº¡c thá»±c táº¿ táº¡i hiá»‡n trÆ°á»ng:'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-sansation text-brand-goldMuted">
                {selectedConflict.incoming_data.measured_value}
              </div>
              <div className="text-[11px] text-slate-600">
                Loáº¡i kiá»ƒm tra: <strong>{selectedConflict.incoming_data.measurement_type}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-brand-gold" />
                <span>ThÃ´ng sá»‘ thiáº¿t bá»‹ & Ká»¹ sÆ° ná»™p:</span>
              </div>
              <div className="text-xs font-bold text-slate-900">
                {selectedConflict.offline_actor.name} ({selectedConflict.offline_actor.team})
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                ID: {selectedConflict.offline_actor.device_id} â€¢ {selectedConflict.offline_actor.device_model}
              </div>
            </div>
          </div>

          {/* ToÃ n váº¹n chuá»—i chá»©ng cá»© (Chain of Custody SHA-256) */}
          <div className="p-3 rounded-xl bg-[#FBF6E9]/40 border border-[#F1E5C6] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-goldMuted flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                Chuá»—i chá»©ng cá»© sá»‘ (Chain of Custody SHA-256):
              </span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-brand-border text-emerald-800 font-bold">
                VERIFIED MATCH
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-700 break-all select-all bg-white p-2 rounded border border-slate-200">
              {selectedConflict.incoming_data.sha256_hash}
            </div>
            <div className="text-[11px] text-slate-600 pt-1">
              Ghi chÃº hiá»‡n trÆ°á»ng: <em>"{selectedConflict.incoming_data.notes}"</em>
            </div>
          </div>

          {/* Lá»‹ch sá»­ phÃ¢n giáº£i náº¿u Ä‘Ã£ quyáº¿t Ä‘á»‹nh */}
          {selectedConflict.resolution && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Quyáº¿t Ä‘á»‹nh phÃ¢n giáº£i: {selectedConflict.resolution.decision}
                </span>
                <span className="font-mono text-[10px] text-emerald-700">
                  {selectedConflict.resolution.decided_at}
                </span>
              </div>
              <div className="text-emerald-800 text-[11px]">
                NgÆ°á»i kÃ½ duyá»‡t:{' '}
                <strong>
                  {selectedConflict.resolution.decided_by} ({selectedConflict.resolution.decided_by_role})
                </strong>
              </div>
              <div className="text-slate-700 text-[11px] bg-white/80 p-2 rounded border border-emerald-100 italic">
                LÃ½ do: "{selectedConflict.resolution.reason}"
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                MÃ£ kiá»ƒm toÃ¡n: {selectedConflict.resolution.audit_hash}
              </div>
            </div>
          )}
        </div>

        {/* 7. Cá»¤M NÃšT THAO TÃC PHÃ‚N GIáº¢I THEO NGá»® Cáº¢NH Tá»ªNG LOáº I XUNG Äá»˜T */}
        <ConflictResolutionActions
          selectedConflict={selectedConflict}
          isPM={isPM}
          isSupervisor={isSupervisor}
          handleOpenResolve={handleOpenResolve}
        />
      </Card>
    </div>
  )
}
