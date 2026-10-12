import React from 'react'
import { Icon } from '../../../components/ui/Icon'
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
      className={`transition-colors hover:bg-slate-50/80 border-b border-slate-100 font-body ${
        isItemEvidence || isItemReconsider ? 'bg-sky-50/20' : ''
      }`}
    >
      {/* Cột 1: Mã & Khuyết tật */}
      <td className="py-3 px-3 align-top min-w-[150px]">
        <div className="flex items-start gap-2.5">
          <Tooltip content="Bấm để xem ảnh chi tiết & thông số">
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
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Icon name="zoom_in" size={16} />
              </div>
            </div>
          </Tooltip>
          <div>
            <span className="font-mono font-bold text-slate-900 text-xs block">{item.item_code}</span>
            <span className="text-[11px] text-slate-500 font-mono block">
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
      <td className="py-3 px-3 align-top whitespace-nowrap">
        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] font-semibold text-slate-800 border border-slate-200">
          {item.chainage}
        </span>
        <span className="block text-slate-500 text-[11px] mt-1 font-normal">{item.lane_info}</span>
      </td>

      {/* Cột 3: Hư hại & Đo đạc */}
      <td className="py-3 px-3 align-top min-w-[170px]">
        <span className="font-semibold text-slate-900 text-xs block">{item.defect_title}</span>
        <span className="text-slate-500 text-[11px] block mt-0.5">{item.defect_measurements}</span>
      </td>

      {/* Cột 4: Phương án kỹ thuật */}
      <td className="py-3 px-3 align-top min-w-[210px]">
        <TruncatedText
          text={item.solution_title}
          lines={2}
          className="text-slate-900 font-medium text-xs block"
        />
        <span className="text-slate-400 text-[11px] block mt-0.5">{item.solution_standard}</span>
        {isItemEvidence && (
          <div className="text-[#0284C7] text-[11px] font-medium flex items-center gap-1 mt-1 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            <Icon name="info" size={14} className="shrink-0" />
            <span>Yêu cầu bổ sung minh chứng</span>
          </div>
        )}
        {isItemReconsider && (
          <div className="text-amber-800 text-[11px] font-medium flex items-center gap-1 mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Icon name="sync" size={14} className="shrink-0" />
            <span>Yêu cầu PM xem lại giải pháp</span>
          </div>
        )}
        {isItemRejected && item.supervisor_notes && (
          <div className="text-rose-700 text-[11px] font-normal flex items-start gap-1 mt-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <Icon name="close" size={14} className="shrink-0 mt-0.5" />
            <span className="line-clamp-2">{item.supervisor_notes}</span>
          </div>
        )}
      </td>

      {/* Cột 5: Khối lượng kỹ thuật */}
      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
        <span className="font-mono font-bold text-slate-900 text-xs">{item.volume_display}</span>
        <span className="text-[11px] text-slate-500 block">{item.volume_sub}</span>
      </td>

      {/* Cột 6: Trạng thái duyệt (Chuẩn DESIGN.md) */}
      <td className="py-3 px-3 align-top text-center whitespace-nowrap">
        {isItemApproved && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E9F7EC] text-[#2F9E44] font-medium text-[11px] border border-emerald-200">
            <Icon name="check" size={13} />
            Đã duyệt
          </span>
        )}
        {isItemEvidence && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-medium text-[11px] border border-sky-200">
            <Icon name="info" size={13} />
            Cần minh chứng
          </span>
        )}
        {isItemReconsider && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3E2] text-[#F59E0B] font-medium text-[11px] border border-amber-200">
            <Icon name="sync" size={13} />
            Xem xét lại
          </span>
        )}
        {isItemRejected && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FDECEC] text-[#E5484D] font-medium text-[11px] border border-rose-200">
            <Icon name="close" size={13} />
            Từ chối
          </span>
        )}
        {item.status === 'PENDING' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8F9FA] text-[#2D3748] font-medium text-[11px] border border-slate-200">
            <Icon name="schedule" size={13} />
            Chờ duyệt
          </span>
        )}
      </td>

      {/* Cột 7: Thao tác Thẩm định */}
      <td className="py-3 px-3 align-top text-center whitespace-nowrap min-w-[130px]">
        {isSupervisor ? (
          <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <Tooltip content="Phê duyệt hạng mục này">
              <button
                onClick={() => onQuickApprove(item.id)}
                type="button"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition cursor-pointer ${
                  isItemApproved
                    ? 'bg-[#E9F7EC] text-[#2F9E44] ring-1 ring-emerald-300'
                    : 'bg-white text-slate-500 hover:text-[#2F9E44] hover:bg-emerald-50'
                }`}
              >
                <Icon name="check" size={15} />
              </button>
            </Tooltip>

            <Tooltip content="Yêu cầu bổ sung ảnh/thước đo thực địa">
              <button
                onClick={() => onOpenDecisionModal(item, 'EVIDENCE')}
                type="button"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition cursor-pointer ${
                  isItemEvidence
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-white text-slate-500 hover:text-[#0284C7] hover:bg-sky-50'
                }`}
              >
                <Icon name="photo_camera" size={15} />
              </button>
            </Tooltip>

            <Tooltip content="Yêu cầu PM xem xét lại giải pháp">
              <button
                onClick={() => onOpenDecisionModal(item, 'RECONSIDER')}
                type="button"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition cursor-pointer ${
                  isItemReconsider
                    ? 'bg-[#F59E0B] text-white'
                    : 'bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Icon name="sync" size={15} />
              </button>
            </Tooltip>

            <Tooltip content="Từ chối giải pháp kỹ thuật này">
              <button
                onClick={() => onOpenDecisionModal(item, 'REJECT')}
                type="button"
                className={`w-7 h-7 rounded-md flex items-center justify-center transition cursor-pointer ${
                  isItemRejected
                    ? 'bg-[#E5484D] text-white'
                    : 'bg-white text-slate-500 hover:text-[#E5484D] hover:bg-rose-50'
                }`}
              >
                <Icon name="close" size={15} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <Tooltip content="Quyền thẩm định và phê duyệt thuộc về Giám sát / Chủ đầu tư">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-400 bg-slate-50 border border-slate-200">
              <Icon name="lock" size={13} />
              <span>Giám sát thẩm duyệt</span>
            </div>
          </Tooltip>
        )}
      </td>

      {/* Cột 8: Phân công Tổ thi công */}
      <td className="py-3 px-3 align-top whitespace-nowrap">
        {isSupervisor ? (
          item.assigned_crew ? (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                <Icon name="construction" size={14} className="text-brand-gold" />
                <span>{item.assigned_crew}</span>
              </span>
              <span className="text-[10px] text-slate-400 pl-1">PM đã phân công</span>
            </div>
          ) : isItemApproved ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-amber-800 bg-amber-50 border border-amber-200">
              <Icon name="schedule" size={12} className="text-amber-600" />
              <span>Chờ PM giao việc</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-400 bg-slate-50 border border-slate-200">
              <span>{isItemRejected ? 'Bị từ chối' : 'Chưa thẩm duyệt'}</span>
            </span>
          )
        ) : (
          isItemApproved ? (
            <select
              value={item.assigned_crew}
              onChange={(e) => onCrewChange(item.id, e.target.value)}
              className="w-44 bg-white border border-slate-200 text-slate-800 text-xs py-1 px-2 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-brand-gold font-normal cursor-pointer"
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
                  className="w-44 bg-slate-100 text-slate-400 text-xs py-1 px-2 rounded-lg border border-slate-200 cursor-not-allowed font-normal"
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
