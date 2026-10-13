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
      <td className="py-2.5 px-2.5 align-top">
        <div className="flex items-start gap-2">
          <Tooltip content="Bấm để xem ảnh chi tiết & thông số">
            <div
              onClick={() => onViewPhoto(item)}
              className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 cursor-pointer relative group/img bg-slate-100"
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
                <Icon name="zoom_in" size={14} />
              </div>
            </div>
          </Tooltip>
          <div className="min-w-0 flex-1">
            <Tooltip content={`Mã hạng mục: ${item.item_code} | Khiếm khuyết: ${item.defect_code}`}>
              <div className="cursor-help">
                <span className="font-mono font-bold text-slate-900 text-xs block truncate">{item.item_code}</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">
                  {item.defect_code}
                </span>
              </div>
            </Tooltip>
            {item.pilot_name && (
              <Tooltip content={`Kỹ sư UAV: ${item.pilot_name} • Thiết bị: ${item.drone_model || 'Matrice 350 RTK'}`}>
                <span className="text-[9px] text-slate-400 block truncate mt-0.5 cursor-help" title={`${item.pilot_name} • ${item.drone_model}`}>
                  {item.pilot_name.replace('Kỹ sư UAV ', '')} • {item.drone_model?.replace('DJI ', '') || 'M350'}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </td>

      {/* Cột 2: Vị trí & Lý trình */}
      <td className="py-2.5 px-2 align-top">
        <Tooltip content={`Lý trình: ${item.chainage} • Làn đường: ${item.lane_info}`}>
          <div className="cursor-help">
            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold text-slate-800 border border-slate-200 block w-fit truncate">
              {item.chainage}
            </span>
            <span className="block text-slate-500 text-[10px] mt-1 font-normal line-clamp-2 leading-tight" title={item.lane_info}>
              {item.lane_info}
            </span>
          </div>
        </Tooltip>
      </td>

      {/* Cột 3: Hư hại & Đo đạc */}
      <td className="py-2.5 px-2.5 align-top">
        <Tooltip
          content={
            <div className="space-y-1">
              <p className="font-bold text-white text-xs">{item.defect_title}</p>
              <p className="text-[11px] text-amber-300 font-mono">{item.defect_measurements}</p>
            </div>
          }
        >
          <div className="cursor-help">
            <span className="font-semibold text-slate-900 text-xs block line-clamp-2 leading-snug" title={item.defect_title}>
              {item.defect_title}
            </span>
            <span className="text-slate-500 text-[10px] block mt-0.5 line-clamp-2 font-mono" title={item.defect_measurements}>
              {item.defect_measurements}
            </span>
          </div>
        </Tooltip>
      </td>

      {/* Cột 4: Phương án kỹ thuật */}
      <td className="py-2.5 px-2.5 align-top">
        <Tooltip
          content={
            <div className="space-y-1 max-w-xs">
              <p className="font-bold text-white text-xs">{item.solution_title}</p>
              <p className="text-[11px] text-slate-300">Tiêu chuẩn: {item.solution_standard}</p>
              {item.supervisor_notes && (
                <p className="text-[11px] text-rose-300 border-t border-slate-700 pt-1 mt-1">
                  Ý kiến giám sát: {item.supervisor_notes}
                </p>
              )}
            </div>
          }
        >
          <div className="cursor-help">
            <span className="text-slate-900 font-medium text-xs block leading-snug line-clamp-2" title={item.solution_title}>
              {item.solution_title}
            </span>
            <span className="text-slate-400 text-[10px] block mt-0.5 truncate" title={item.solution_standard}>
              {item.solution_standard}
            </span>
          </div>
        </Tooltip>
        {isItemEvidence && (
          <Tooltip content="Giám sát yêu cầu chụp ảnh thước đo thực địa hoặc bay lại drone để xác minh">
            <div className="text-[#0284C7] text-[10px] font-medium flex items-center gap-1 mt-1 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 cursor-help">
              <Icon name="info" size={12} className="shrink-0" />
              <span className="truncate">Cần bổ sung minh chứng</span>
            </div>
          </Tooltip>
        )}
        {isItemReconsider && (
          <Tooltip content="Giám sát yêu cầu PM xem lại định mức hoặc giải pháp thi công theo TCVN 8819">
            <div className="text-amber-800 text-[10px] font-medium flex items-center gap-1 mt-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-help">
              <Icon name="sync" size={12} className="shrink-0" />
              <span className="truncate">Cần xem lại giải pháp</span>
            </div>
          </Tooltip>
        )}
        {isItemRejected && item.supervisor_notes && (
          <Tooltip content={`Lý do từ chối: ${item.supervisor_notes}`}>
            <div className="text-rose-700 text-[10px] font-normal flex items-start gap-1 mt-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 cursor-help">
              <Icon name="close" size={12} className="shrink-0 mt-0.5" />
              <span className="line-clamp-2 leading-tight">{item.supervisor_notes}</span>
            </div>
          </Tooltip>
        )}
      </td>

      {/* Cột 5: Khối lượng kỹ thuật */}
      <td className="py-2.5 px-2 align-top text-right">
        <Tooltip content={`Khối lượng kỹ thuật đề xuất: ${item.volume_display} • Độ sâu: ${item.volume_sub}`}>
          <div className="cursor-help">
            <span className="font-mono font-bold text-slate-900 text-xs block">{item.volume_display}</span>
            <span className="text-[10px] text-slate-500 block">{item.volume_sub}</span>
          </div>
        </Tooltip>
      </td>

      {/* Cột 6: Trạng thái duyệt */}
      <td className="py-2.5 px-2 align-top text-center">
        {isItemApproved && (
          <Tooltip content="Hạng mục đã được Giám sát phê duyệt phương án kỹ thuật">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E9F7EC] text-[#2F9E44] font-medium text-[10px] border border-emerald-200 cursor-help">
              <Icon name="check" size={11} />
              Đã duyệt
            </span>
          </Tooltip>
        )}
        {isItemEvidence && (
          <Tooltip content="Đang chờ PM gửi bổ sung ảnh/số đo hiện trường">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-medium text-[10px] border border-sky-200 cursor-help">
              <Icon name="info" size={11} />
              Cần minh chứng
            </span>
          </Tooltip>
        )}
        {isItemReconsider && (
          <Tooltip content="Yêu cầu PM điều chỉnh phương án kỹ thuật">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3E2] text-[#F59E0B] font-medium text-[10px] border border-amber-200 cursor-help">
              <Icon name="sync" size={11} />
              Xem xét lại
            </span>
          </Tooltip>
        )}
        {isItemRejected && (
          <Tooltip content={`Hạng mục bị từ chối: ${item.supervisor_notes || 'Không đạt chuẩn kỹ thuật'}`}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FDECEC] text-[#E5484D] font-medium text-[10px] border border-rose-200 cursor-help">
              <Icon name="close" size={11} />
              Từ chối
            </span>
          </Tooltip>
        )}
        {item.status === 'PENDING' && (
          <Tooltip content="Đang chờ Giám sát thẩm định kỹ thuật">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F8F9FA] text-[#2D3748] font-medium text-[10px] border border-slate-200 cursor-help">
              <Icon name="schedule" size={11} />
              Chờ duyệt
            </span>
          </Tooltip>
        )}
      </td>

      {/* Cột 7: Thao tác Thẩm định */}
      <td className="py-2.5 px-2 align-top text-center">
        {isSupervisor ? (
          <div className="inline-flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <Tooltip content="Phê duyệt hạng mục này">
              <button
                onClick={() => onQuickApprove(item.id)}
                type="button"
                className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer ${
                  isItemApproved
                    ? 'bg-[#E9F7EC] text-[#2F9E44] ring-1 ring-emerald-300'
                    : 'bg-white text-slate-500 hover:text-[#2F9E44] hover:bg-emerald-50'
                }`}
              >
                <Icon name="check" size={13} />
              </button>
            </Tooltip>

            <Tooltip content="Yêu cầu bổ sung ảnh/thước đo thực địa">
              <button
                onClick={() => onOpenDecisionModal(item, 'EVIDENCE')}
                type="button"
                className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer ${
                  isItemEvidence
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-white text-slate-500 hover:text-[#0284C7] hover:bg-sky-50'
                }`}
              >
                <Icon name="photo_camera" size={13} />
              </button>
            </Tooltip>

            <Tooltip content="Yêu cầu PM xem xét lại giải pháp">
              <button
                onClick={() => onOpenDecisionModal(item, 'RECONSIDER')}
                type="button"
                className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer ${
                  isItemReconsider
                    ? 'bg-[#F59E0B] text-white'
                    : 'bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Icon name="sync" size={13} />
              </button>
            </Tooltip>

            <Tooltip content="Từ chối giải pháp kỹ thuật này">
              <button
                onClick={() => onOpenDecisionModal(item, 'REJECT')}
                type="button"
                className={`w-6 h-6 rounded flex items-center justify-center transition cursor-pointer ${
                  isItemRejected
                    ? 'bg-[#E5484D] text-white'
                    : 'bg-white text-slate-500 hover:text-[#E5484D] hover:bg-rose-50'
                }`}
              >
                <Icon name="close" size={13} />
              </button>
            </Tooltip>
          </div>
        ) : (
          <Tooltip content="Quyền thẩm định và phê duyệt thuộc về Giám sát / Chủ đầu tư">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-50 border border-slate-200">
              <Icon name="lock" size={11} />
              <span>Giám sát duyệt</span>
            </div>
          </Tooltip>
        )}
      </td>

      {/* Cột 8: Phân công Tổ thi công */}
      <td className="py-2.5 px-2 align-top">
        {isSupervisor ? (
          item.assigned_crew ? (
            <Tooltip content={`Đội thi công được phân công: ${item.assigned_crew}`}>
              <div className="flex flex-col gap-0.5 cursor-help">
                <div className="inline-flex items-start gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  <Icon name="construction" size={12} className="text-brand-gold shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-tight" title={item.assigned_crew}>
                    {item.assigned_crew}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 pl-0.5">PM đã giao</span>
              </div>
            </Tooltip>
          ) : isItemApproved ? (
            <Tooltip content="Hạng mục đã duyệt, đang chờ Chỉ huy trưởng (PM) giao việc cho tổ đội">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-amber-800 bg-amber-50 border border-amber-200 cursor-help">
                <Icon name="schedule" size={11} className="text-amber-600 shrink-0" />
                <span>Chờ giao</span>
              </span>
            </Tooltip>
          ) : (
            <Tooltip content="Chỉ phân công đội thi công sau khi Giám sát phê duyệt phương án">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-slate-400 bg-slate-50 border border-slate-200 cursor-help">
                <span>{isItemRejected ? 'Từ chối' : 'Chưa duyệt'}</span>
              </span>
            </Tooltip>
          )
        ) : (
          isItemApproved ? (
            <select
              value={item.assigned_crew}
              onChange={(e) => onCrewChange(item.id, e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 text-[11px] py-1 px-1.5 rounded-lg shadow-2xs focus:outline-none focus:ring-1 focus:ring-brand-gold font-normal cursor-pointer"
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
                  className="w-full bg-slate-100 text-slate-400 text-[11px] py-1 px-1.5 rounded-lg border border-slate-200 cursor-not-allowed font-normal"
                >
                  <option>
                    {isItemRejected ? '-- Từ chối --' : '-- Chưa giao --'}
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
