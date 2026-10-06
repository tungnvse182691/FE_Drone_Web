import React from 'react'
import {
  ZoomIn,
  Info,
  RotateCcw,
  X,
  Check,
  Clock,
  Camera,
  Construction,
  Lock,
  AlertCircle
} from 'lucide-react'
import { RepairItemDetail, CREW_OPTIONS } from './types'
import { Tooltip } from '../../../components/ui/Tooltip'
import { TruncatedText } from '../../../components/ui/TruncatedText'

export interface ItemsTableRowProps {
  item: RepairItemDetail
  isSupervisor: boolean
  onViewPhoto: (item: RepairItemDetail) => void
  onQuickApprove: (itemId: string) => void
  onOpenDecisionModal: (item: RepairItemDetail, type: 'EVIDENCE' | 'RECONSIDER' | 'REJECT') => void
  onCrewChange: (itemId: string, newCrew: string) => void
}

export const ItemsTableRow: React.FC<ItemsTableRowProps> = ({
  item,
  isSupervisor,
  onViewPhoto,
  onQuickApprove,
  onOpenDecisionModal,
  onCrewChange
}) => {
  const isItemApproved = item.status === 'APPROVED'
  const isItemEvidence = item.status === 'REQUEST_EVIDENCE'
  const isItemReconsider = item.status === 'REQUEST_RECONSIDER'
  const isItemRejected = item.status === 'REJECTED'

  return (
    <tr
      className={`transition-colors hover:bg-slate-50/70 group ${
        isItemEvidence || isItemReconsider ? 'bg-sky-50/20' : ''
      }`}
    >
      {/* Cột 1: Mã & Khuyết tật */}
      <td className="py-3.5 px-3.5 align-top min-w-[150px]">
        <div className="flex items-start gap-2.5">
          <Tooltip content="Bấm để xem ảnh phóng to & thông số bay">
            <div
              onClick={() => onViewPhoto(item)}
              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer relative group/img bg-slate-100"
            >
              <img
                src={item.image_url}
                alt=""
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
                }}
                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>
          </Tooltip>
          <div>
            <span className="font-mono font-bold text-slate-900 block">{item.item_code}</span>
            <span className="text-[11px] text-slate-500 font-medium font-mono block">
              {item.defect_code}
            </span>
            {item.pilot_name && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {item.pilot_name.replace('Kỹ sư UAV ', '')} • {item.drone_model?.replace('DJI ', '') || 'M350'}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Cột 2: Vị trí & Lý trình */}
      <td className="py-3.5 px-3 align-top whitespace-nowrap">
        <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold text-slate-800 border border-slate-200">
          {item.chainage}
        </span>
        <span className="block text-slate-500 text-[11px] mt-1 font-medium">{item.lane_info}</span>
      </td>

      {/* Cột 3: Hư hại & Đo đạc */}
      <td className="py-3.5 px-3 align-top min-w-[180px]">
        <span className="font-semibold text-slate-900 block">{item.defect_title}</span>
        <span className="text-slate-500 text-[11px] block mt-0.5">{item.defect_measurements}</span>
      </td>

      {/* Cột 4: Phương án kỹ thuật */}
      <td className="py-3.5 px-3 align-top min-w-[220px]">
        <TruncatedText
          text={item.solution_title}
          lines={2}
          className="text-slate-900 font-medium block"
        />
        <span className="text-slate-500 text-[11px] block mt-0.5">{item.solution_standard}</span>
        {isItemEvidence && (
          <div className="text-[#0284C7] text-[11px] font-semibold flex items-center gap-1 mt-1 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Đang yêu cầu bổ sung minh chứng</span>
          </div>
        )}
        {isItemReconsider && (
          <div className="text-amber-700 text-[11px] font-semibold flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Yêu cầu PM xem xét lại giải pháp</span>
          </div>
        )}
        {isItemRejected && item.supervisor_notes && (
          <div className="text-rose-700 text-[11px] font-medium flex items-start gap-1 mt-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{item.supervisor_notes}</span>
          </div>
        )}
      </td>

      {/* Cột 5: Khối lượng kỹ thuật */}
      <td className="py-3.5 px-3 align-top text-right whitespace-nowrap">
        <span className="font-mono font-bold text-slate-900 text-sm">{item.volume_display}</span>
        <span className="text-[11px] text-slate-500 block">{item.volume_sub}</span>
      </td>

      {/* Cột 6: Trạng thái duyệt */}
      <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
        {isItemApproved && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDF7ED] text-[#1B5E20] font-bold text-[11px] border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            Đã phê duyệt
          </span>
        )}
        {isItemEvidence && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-[11px] border border-sky-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Cần minh chứng
          </span>
        )}
        {isItemReconsider && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5" />
            Xem xét lại
          </span>
        )}
        {isItemRejected && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] font-bold text-[11px] border border-rose-200">
            <X className="w-3.5 h-3.5" />
            Từ chối
          </span>
        )}
        {item.status === 'PENDING' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            Chờ thẩm định
          </span>
        )}
      </td>

      {/* Cột 7: Thao tác Thẩm định */}
      <td className="py-3.5 px-3.5 align-top text-center whitespace-nowrap min-w-[140px]">
        {isSupervisor ? (
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-[#E2E5E9]">
            <Tooltip content="Phê duyệt hạng mục này">
              <button
                onClick={() => onQuickApprove(item.id)}
                type="button"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isItemApproved
                    ? 'bg-[#EDF7ED] text-[#1B5E20] shadow-xs ring-1 ring-emerald-300'
                    : 'bg-white text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip content="Yêu cầu bổ sung ảnh/thước đo thực địa">
              <button
                onClick={() => onOpenDecisionModal(item, 'EVIDENCE')}
                type="button"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isItemEvidence
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white text-slate-500 hover:text-[#0284C7] hover:bg-sky-50'
                }`}
              >
                <Camera className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip content="Yêu cầu PM xem xét lại giải pháp">
              <button
                onClick={() => onOpenDecisionModal(item, 'RECONSIDER')}
                type="button"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isItemReconsider
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </Tooltip>

            <Tooltip content="Từ chối giải pháp kỹ thuật này">
              <button
                onClick={() => onOpenDecisionModal(item, 'REJECT')}
                type="button"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                  isItemRejected
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'bg-white text-slate-500 hover:text-[#DC2626] hover:bg-rose-50'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <Tooltip content="Quyền thẩm định và phê duyệt thuộc về Giám sát / Chủ đầu tư">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Giám sát thẩm duyệt</span>
            </div>
          </Tooltip>
        )}
      </td>

      {/* Cột 8: Phân công Tổ thi công */}
      <td className="py-3.5 px-3 align-top whitespace-nowrap">
        {isSupervisor ? (
          item.assigned_crew ? (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                <Construction className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{item.assigned_crew}</span>
              </span>
              <span className="text-[10px] text-slate-400 pl-1 font-medium">PM đã phân công</span>
            </div>
          ) : isItemApproved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Chờ PM giao việc</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
              <span>{isItemRejected ? 'Bị từ chối' : 'Chưa thẩm duyệt'}</span>
            </span>
          )
        ) : (
          isItemApproved ? (
            <select
              value={item.assigned_crew}
              onChange={(e) => onCrewChange(item.id, e.target.value)}
              className="w-48 bg-white border border-[#E2E5E9] text-slate-800 text-xs py-1.5 px-2.5 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#C9A227] font-medium cursor-pointer"
            >
              {CREW_OPTIONS.map((crew) => (
                <option key={crew} value={crew}>
                  {crew}
                </option>
              ))}
            </select>
          ) : (
            <Tooltip content="Chỉ phân công đội thi công sau khi Giám sát đã phê duyệt phương án">
              <div className="relative">
                <select
                  disabled
                  className="w-48 bg-slate-100 text-slate-400 text-xs py-1.5 px-2.5 rounded-lg border border-[#E2E5E9] cursor-not-allowed font-medium"
                >
                  <option>
                    {isItemRejected ? '-- Bị từ chối phương án --' : '-- Chưa thể phân công --'}
                  </option>
                </select>
              </div>
            </Tooltip>
          )
        )}
      </td>
    </tr>
  )
}
