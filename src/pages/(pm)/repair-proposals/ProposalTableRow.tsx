import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  Construction,
  ShieldCheck,
  UserCheck,
  MoreVertical,
} from 'lucide-react'
import { ProposalWorkPackage } from './types'
import { Tooltip } from '../../../components/ui/Tooltip'
import { TruncatedText } from '../../../components/ui/TruncatedText'

export interface ProposalTableRowProps {
  pkg: ProposalWorkPackage
  basePath: string
  isSupervisor: boolean
  isPM: boolean
  onSubmitDraft: (id: string, code: string) => void
  onDeleteDraft: (id: string, code: string) => void
  onQuickApprove: (id: string, code: string) => void
  showToast: (msg: string) => void
  isMenuActive: boolean
  onToggleMenu: (pkg: ProposalWorkPackage, e: React.MouseEvent<HTMLButtonElement>) => void
}

export const ProposalTableRow: React.FC<ProposalTableRowProps> = ({
  pkg,
  basePath,
  isSupervisor,
  isPM,
  onSubmitDraft,
  onDeleteDraft,
  onQuickApprove,
  showToast,
  isMenuActive,
  onToggleMenu,
}) => {
  const navigate = useNavigate()
  const approvalRatio = pkg.total_items > 0 ? (pkg.approved_items / pkg.total_items) * 100 : 0

  return (
    <tr key={pkg.id} className="hover:bg-amber-50/20 transition-colors group">
      {/* Sticky Column: Mã gói */}
      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap sticky left-0 bg-white group-hover:bg-amber-50/40 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-800">{pkg.code}</span>
        </div>
      </td>

      {/* Tên gói công việc & Lý trình */}
      <td className="py-3.5 px-4 max-w-[340px]">
        <div className="flex flex-col gap-0.5">
          <TruncatedText
            text={pkg.title}
            lines={1}
            className="font-bold text-brand-dark hover:text-brand-gold cursor-pointer transition-colors text-xs"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-medium text-slate-700">{pkg.route_name}</span>
            <span>•</span>
            <span className="font-mono text-[#8F7212] font-semibold">{pkg.chainage_display}</span>
            <span>•</span>
            <span>{pkg.segments_count} phân đoạn</span>
          </div>
        </div>
      </td>

      {/* Hạng mục lỗi */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{pkg.defect_count} điểm lỗi</span>
          <span className="text-[11px] text-slate-500">{pkg.defect_summary}</span>
        </div>
      </td>

      {/* Khối lượng kỹ thuật dự kiến */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{pkg.technical_scope}</span>
          <span className="text-[11px] text-slate-500">{pkg.material_scope}</span>
        </div>
      </td>

      {/* Thời gian thi công */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{pkg.duration_days} ngày</span>
          <span className="text-[11px] text-slate-500">{pkg.date_range}</span>
        </div>
      </td>

      {/* Người lập / Ngày trình */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
            {pkg.created_by_initials}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 text-[11px]">{pkg.created_by_name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{pkg.created_at}</span>
          </div>
        </div>
      </td>

      {/* Trạng thái */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        {pkg.status === 'SUBMITTED' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Chờ phê duyệt</span>
          </span>
        )}
        {pkg.status === 'DECIDED' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã phê duyệt</span>
          </span>
        )}
        {pkg.status === 'DISPATCHED' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Construction className="w-3 h-3 text-blue-600" />
            <span>Đang thi công</span>
          </span>
        )}
        {pkg.status === 'DRAFT' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Bản nháp</span>
          </span>
        )}
      </td>

      {/* Tiến độ phê duyệt */}
      <td className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex flex-col gap-1 w-32">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-700">
              {pkg.approved_items}/{pkg.total_items} điểm
            </span>
            <span className="font-mono text-slate-500 font-bold">{Math.round(approvalRatio)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                approvalRatio === 100
                  ? 'bg-emerald-500'
                  : approvalRatio > 0
                  ? 'bg-brand-gold'
                  : 'bg-slate-300'
              }`}
              style={{ width: `${approvalRatio}%` }}
            />
          </div>
        </div>
      </td>

      {/* Sticky Column: Thao tác */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-amber-50/40 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-end gap-1.5 relative">
          {/* Vai trò Supervisor */}
          {isSupervisor && pkg.status === 'SUBMITTED' && (
            <Tooltip content="Kỹ sư Giám sát phê duyệt nhanh gói đề xuất này">
              <button
                onClick={() => onQuickApprove(pkg.id, pkg.code)}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phê duyệt</span>
              </button>
            </Tooltip>
          )}

          {isSupervisor && pkg.status === 'DECIDED' && (
            <Tooltip content="Theo dõi tiến độ tổ thi công ngoài hiện trường">
              <button
                onClick={() => {
                  showToast(`Gói [${pkg.code}] đã được phê duyệt hợp lệ. Đang chuyển hướng kiểm tra hiện trường.`)
                  navigate(`${basePath}/proposals/${pkg.id}`)
                }}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Theo dõi thi công</span>
              </button>
            </Tooltip>
          )}

          {/* Vai trò PM */}
          {isPM && pkg.status === 'DRAFT' && (
            <>
              <Tooltip content="Khóa và trình nộp hồ sơ lên Giám sát">
                <button
                  onClick={() => onSubmitDraft(pkg.id, pkg.code)}
                  type="button"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-brand-gold hover:bg-[#B38E1F] text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Trình duyệt</span>
                </button>
              </Tooltip>
              <Tooltip content="Xóa bản nháp này">
                <button
                  onClick={() => onDeleteDraft(pkg.id, pkg.code)}
                  type="button"
                  className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </>
          )}

          {/* Nút xem chi tiết / thẩm định */}
          <Tooltip content={isSupervisor ? 'Thẩm định kỹ thuật chi tiết' : 'Xem chi tiết hồ sơ gói'}>
            <button
              onClick={() => navigate(`${basePath}/proposals/${pkg.id}`)}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>{isSupervisor ? 'Thẩm định' : 'Xem hồ sơ'}</span>
            </button>
          </Tooltip>

          {/* Nút Menu tùy chọn */}
          <Tooltip content="Tùy chọn khác">
            <button
              onClick={(e) => onToggleMenu(pkg, e)}
              type="button"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isMenuActive
                  ? 'bg-slate-200 text-slate-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  )
}
