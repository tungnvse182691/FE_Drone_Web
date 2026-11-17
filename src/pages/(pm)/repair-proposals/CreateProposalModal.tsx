import React from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { RouteSegmentOption, UnassignedDefectItem, ProposalCreateApi } from './types'
import { ProposalBOQCard } from './ProposalBOQCard'

export interface CreateProposalModalProps {
  createApi?:ProposalCreateApi
  isCreateModalOpen: boolean
  setIsCreateModalOpen: (open: boolean) => void
  formPackageName: string
  setFormPackageName: (name: string) => void
  formRouteId: string
  handleRouteChange: (routeId: string) => void
  availableRoutes: { id: string; name: string; code: string }[]
  formSegmentId: string
  handleSegmentChange: (segId: string) => void
  currentRouteSegments: RouteSegmentOption[]
  currentSegment: RouteSegmentOption | undefined
  currentRoute: { id: string; name: string; code: string } | undefined
  formContractor: string
  setFormContractor: (c: string) => void
  formDurationDays: number
  setFormDurationDays: (d: number) => void
  formTechnicalMethod: string
  setFormTechnicalMethod: (method: string) => void
  unassignedDefects: UnassignedDefectItem[]
  handleToggleDefect: (id: string) => void
  handleUpdateDefectSolution?: (id: string, solution: string) => void
  modalCalculations: { count: number; description: string }
  handleSaveDraft: (andSubmit: boolean) => void
  projectMembers?: any[]
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  formPackageName,
  setFormPackageName,
  formRouteId,
  handleRouteChange,
  availableRoutes,
  formSegmentId,
  handleSegmentChange,
  currentRouteSegments,
  currentSegment: _currentSegment,
  currentRoute: _currentRoute,
  formContractor,
  setFormContractor,
  formDurationDays,
  setFormDurationDays,
  formTechnicalMethod,
  setFormTechnicalMethod,
  unassignedDefects,
  handleToggleDefect,
  handleUpdateDefectSolution = () => {},
  modalCalculations,
  handleSaveDraft,
  projectMembers = [], createApi,
}) => {
  if (!isCreateModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold shrink-0">
              <Icon name="add" className="text-xl text-brand-gold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Khởi tạo gói đề xuất sửa chữa kỹ thuật mới</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lập nghĩa vụ và phương án kỹ thuật từ khiếm khuyết trong đúng dự án; không tự cấp quyền thi công.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {createApi?.error&&<p role="alert" className="text-rose-700">{createApi.error}</p>}
          {createApi?.onResumeOriginal&&<button type="button" onClick={createApi.onResumeOriginal} className="rg-btn text-[#8C6D1F]">Mở biểu mẫu Fast Track đang giữ lệnh để đối chiếu</button>}
          <fieldset disabled={createApi?.busy||createApi?.locked} className="space-y-5">
          {/* Tên gói */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase text-[11px]">
              {createApi?'Căn cứ đề xuất hạng mục':'Tên gói đề xuất công việc'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formPackageName}
              maxLength={2000}
              aria-label="Căn cứ đề xuất gói"
              onChange={(e) => setFormPackageName(e.target.value)}
              placeholder="Ví dụ: Xử lý ổ gà và trám nứt mặt đường đoạn Km 1028 - Km 1033..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          {/* Chọn Tuyến đường & Phân đoạn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                {createApi?'Dự án chịu trách nhiệm':'Tuyến đường phụ trách'} <span className="text-rose-500">*</span>
              </label>
              <select
                  value={formRouteId} aria-label="Dự án đề xuất gói"
                onChange={(e) => handleRouteChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                <option value="">Chọn dự án theo hồ sơ</option>
                {availableRoutes.length === 0 ? (
                  <option value="">Chưa có dữ liệu dự án</option>
                ) : (
                  availableRoutes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                {createApi?'Bộ phân đoạn tham chiếu':'Phân đoạn lý trình'} <span className="text-rose-500">*</span>
              </label>
              <select
                value={formSegmentId} aria-label="Bộ phân đoạn đề xuất gói"
                onChange={(e) => handleSegmentChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
              >
                <option value={createApi?'':'ALL'}>
                  {createApi?'Không ghim bộ phân đoạn — phạm vi theo lý trình':'Toàn tuyến'}
                </option>
                {currentRouteSegments.filter(s => s.id !== 'ALL').map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {createApi ? <div className="space-y-3"><label className="block font-semibold">Luồng đề xuất<select aria-label="Luồng đề xuất sửa chữa" value={createApi.fields.mode} onChange={e=>createApi.onChange('mode',e.target.value)} className="block w-full p-2 border rounded-xl bg-slate-50"><option value="NORMAL">Normal — Giám sát duyệt phương án</option><option value="FAST_TRACK">Fast Track — PM giao việc có điều kiện</option></select></label><p className="text-slate-500">Mỗi package gắn một khiếm khuyết. Nhập phạm vi theo căn cứ thực tế, không suy số đo từ ảnh hoặc toàn tuyến. Giao Crew và deadline ở bước giao việc.</p><div className="grid grid-cols-2 gap-3">{(['fromMeters','toMeters','offsetFromMeters','offsetToMeters'] as const).map((key,i)=><label key={key}>{['Từ lý trình (m)','Đến lý trình (m)','Độ lệch từ (m)','Độ lệch đến (m)'][i]}<input type="number" step="any" aria-label={['Từ lý trình đề xuất','Đến lý trình đề xuất','Độ lệch từ đề xuất','Độ lệch đến đề xuất'][i]} value={createApi.fields[key]} onChange={e=>createApi.onChange(key,e.target.value)} className="block w-full p-2 border rounded-xl bg-slate-50"/></label>)}</div><label className="block">Phiên bản checklist phương án<input aria-label="Checklist phương án đề xuất" maxLength={200} value={createApi.fields.checklistVersion} onChange={e=>createApi.onChange('checklistVersion',e.target.value)} className="block w-full p-2 border rounded-xl bg-slate-50"/></label></div> : <>          {/* Tổ đội thi công & Thời gian dự kiến */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Đơn vị thi công dự kiến <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="project-contractor-options"
                  value={formContractor}
                  onChange={(e) => setFormContractor(e.target.value)}
                  placeholder={projectMembers.length > 0 ? "Chọn từ nhân sự dự án hoặc nhập tên đội thi công..." : "Nhập tên đội thi công (ví dụ: Đội duy tu bảo dưỡng 01...)"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                {projectMembers.length > 0 && (
                  <datalist id="project-contractor-options">
                    {projectMembers.map((m: any) => (
                      <option
                        key={m.membershipId || m.userId}
                        value={m.displayName ? `${m.displayName} (${m.role || 'Đội thi công'})` : m.role}
                      />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[11px]">
                Thời gian thi công dự kiến (ngày) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={formDurationDays}
                onChange={(e) => setFormDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

</>}

          {/* Danh sách khiếm khuyết & Khối lượng kỹ thuật */}
          <ProposalBOQCard
            unassignedDefects={unassignedDefects}
            handleToggleDefect={handleToggleDefect}
            handleUpdateDefectSolution={handleUpdateDefectSolution}
            modalCalculations={modalCalculations}
          />

          {/* Phương án kỹ thuật sửa chữa tổng quát */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Icon name="build" className="text-sm text-brand-gold" />
                <span>Phương án kỹ thuật sửa chữa tổng quát <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                {createApi?.fields.mode==='FAST_TRACK'?'PM đề xuất Fast Track — giao có điều kiện':'PM đề xuất Normal — Giám sát duyệt'}
              </span>
            </div>

            <p className="text-slate-500">PM nhập phương án theo hồ sơ kỹ thuật có căn cứ; không tự áp công thức vật tư hoặc phương án từ mức độ hư hỏng.</p>
            <textarea
              rows={3}
              value={formTechnicalMethod} aria-label="Phương án đề xuất gói" maxLength={2000}
              onChange={(e) => setFormTechnicalMethod(e.target.value)}
              placeholder="Nhập phương án sửa chữa kỹ thuật tổng quát cho các khiếm khuyết được chọn..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold leading-relaxed"
            />
          </div>
          </fieldset>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(false)}
            type="button"
            className="px-4 py-2 rounded-xl bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          {!createApi && <button
            onClick={() => handleSaveDraft(false)}
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Lưu bản nháp</span>
          </button>}
          <button
            disabled={createApi?.busy}
            onClick={() => handleSaveDraft(true)}
            type="button"
            className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="send" className="text-sm" />
            <span>{createApi?createApi.busy?'Đang đối chiếu…':createApi.locked?'Tiếp tục / Đối chiếu yêu cầu':'Đề xuất hạng mục và GET xác nhận':'Khóa & Trình duyệt ngay'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
