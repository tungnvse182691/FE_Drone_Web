import React from 'react'
import {
  SplitSquareVertical,
  Sparkles,
  GitBranch,
  Plus,
  Trash2,
  Upload
} from 'lucide-react'
import { SegmentItem, BranchItem } from './types'
import { SidebarSegmentCard } from './SidebarSegmentCard'

export interface SidebarSegmentsTabProps {
  segments: SegmentItem[]
  selectedSegmentId: string | null
  onSelectSegment: (seg: SegmentItem) => void
  splitDistance: number
  onSetSplitDistance: (val: number) => void
  splitSortOrder: 'asc' | 'desc'
  onSetSplitSortOrder: (val: 'asc' | 'desc') => void
  onApplyAutoSplit: () => void
  onOpenAddSegmentModal: () => void
  onSelectAllRoute: () => void
  currentCoords?: [number, number][]
  currentKmPoints: number[]
  importedLengthKm: number
  slabLengthM: number
  onOpenSplitModal: (seg: SegmentItem) => void
  onEditSegment: (seg: SegmentItem) => void
  onDeleteSegment: (id: string) => void
  onSnapSegment: (id: string) => void
  // Quản lý Tuyến nhánh
  branches?: BranchItem[]
  selectedTargetType?: 'MAINLINE' | string
  onSelectTargetType?: (type: 'MAINLINE' | string) => void
  onOpenAddBranchModal?: () => void
  onDeleteBranch?: (branchId: string) => void
  onClearAllSegments?: () => void
  onClearMainline?: () => void
  onOpenImportModal?: () => void
  mainlineLengthKm?: number
}

export const SidebarSegmentsTab: React.FC<SidebarSegmentsTabProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  splitDistance,
  onSetSplitDistance,
  splitSortOrder,
  onSetSplitSortOrder,
  onApplyAutoSplit,
  onOpenAddSegmentModal,
  onSelectAllRoute,
  currentCoords = [],
  currentKmPoints,
  importedLengthKm,
  slabLengthM,
  onOpenSplitModal,
  onEditSegment,
  onDeleteSegment,
  onSnapSegment,
  branches = [],
  selectedTargetType = 'MAINLINE',
  onSelectTargetType,
  onOpenAddBranchModal,
  onDeleteBranch,
  onClearAllSegments,
  onClearMainline,
  onOpenImportModal,
  mainlineLengthKm
}) => {
  const isAllSelected = selectedSegmentId === 'ALL'
  const isMain = selectedTargetType === 'MAINLINE'
  const totalLen = segments.reduce((sum, s) => sum + (s.lengthKm || 0), 0) || (importedLengthKm || 25.0)
  const displayMainlineKm = mainlineLengthKm || importedLengthKm || 0.0
  const mainlineLenText = displayMainlineKm >= 1 ? `${displayMainlineKm.toFixed(1)} km` : `${(displayMainlineKm * 1000).toFixed(0)}m`

  return (
    <>
      {/* KHỐI 1: CHỌN ĐỐI TƯỢNG PHÂN ĐOẠN (TRỤC CHÍNH HOẶC TUYẾN NHÁNH) */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-brand-gold" />
            <span>Đối tượng Tuyến</span>
          </span>
          <div className="flex items-center gap-1.5">
            {selectedTargetType !== 'MAINLINE' && onDeleteBranch && (
              <button
                type="button"
                onClick={() => {
                  const br = branches.find((b) => b.id === selectedTargetType)
                  if (confirm(`Bạn có chắc muốn xóa tuyến nhánh [${br?.name || ''}] để nhập lại không?`)) {
                    onDeleteBranch(selectedTargetType)
                  }
                }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 hover:bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200 transition-colors cursor-pointer"
                title="Xóa tuyến nhánh này nếu nhập sai muốn nhập lại"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa nhánh này</span>
              </button>
            )}
            {selectedTargetType === 'MAINLINE' && onClearMainline && currentCoords.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ tim tuyến trục chính và các mốc lý trình của dự án này không? Bản đồ sẽ trở về trạng thái trống để bạn nhập hoặc vẽ lại từ đầu.')) {
                    onClearMainline()
                  }
                }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 hover:bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200 transition-colors cursor-pointer"
                title="Xóa toàn bộ tim tuyến chính để nhập hoặc vẽ lại từ đầu"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa tuyến chính</span>
              </button>
            )}
            {onOpenAddBranchModal && (
              <button
                type="button"
                onClick={onOpenAddBranchModal}
                className="text-[11px] font-bold text-[#8F7212] hover:text-brand-dark flex items-center gap-1 bg-amber-50 hover:bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tạo tuyến nhánh</span>
              </button>
            )}
          </div>
        </div>

        <select
          value={selectedTargetType}
          onChange={(e) => onSelectTargetType && onSelectTargetType(e.target.value)}
          className="w-full h-8.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
        >
          <option value="MAINLINE">
            Trục chính {currentCoords.length === 0 ? '(Chưa có tim tuyến)' : `(${mainlineLenText})`}
          </option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.lengthKm.toFixed(2)} km - rẽ tại {b.branchStationText})
            </option>
          ))}
        </select>
      </div>

      {/* KHỐI 2: CHIA ĐOẠN TỰ ĐỘNG THEO CỰ LY KM */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
            <SplitSquareVertical className="w-3.5 h-3.5 text-brand-gold" />
            <span>Chia đoạn theo cự ly Km</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            Chiều dài: {importedLengthKm >= 1 ? `${importedLengthKm.toFixed(2)} km` : `${(importedLengthKm * 1000).toFixed(0)} m`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative flex items-center">
            <input
              type="number"
              step="0.05"
              min="0.01"
              max="50"
              value={splitDistance}
              onChange={(e) => onSetSplitDistance(parseFloat(e.target.value) || 0.1)}
              className="w-full h-8.5 pl-3 pr-14 bg-white border border-slate-300 rounded-lg font-mono text-xs font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="Nhập km..."
            />
            <span className="absolute right-2.5 text-[11px] text-slate-500 font-medium pointer-events-none">
              km/đoạn
            </span>
          </div>

          <select
            value={splitSortOrder}
            onChange={(e) => onSetSplitSortOrder(e.target.value as any)}
            className="h-8.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer"
          >
            <option value="asc">Km tăng dần</option>
            <option value="desc">Km giảm dần</option>
          </select>
        </div>

        {/* Nút chọn nhanh cự ly mẫu */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">Mẫu:</span>
          {[0.2, 0.25, 0.5, 1.0, 2.5, 5.0].map((kmVal) => (
            <button
              key={kmVal}
              type="button"
              onClick={() => {
                onSetSplitDistance(kmVal)
                setTimeout(() => onApplyAutoSplit(), 50)
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                splitDistance === kmVal
                  ? 'bg-brand-gold text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-gold'
              }`}
            >
              {kmVal >= 1 ? `${kmVal}km` : `${kmVal * 1000}m`}
            </button>
          ))}
        </div>

        {/* Chỉ giữ nút Áp dụng chia đoạn (đã xóa nút Thêm đoạn mới đơn lẻ theo yêu cầu) */}
        <div>
          <button
            type="button"
            onClick={onApplyAutoSplit}
            className="w-full h-8.5 rounded-lg bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Áp dụng chia đoạn tự động</span>
          </button>
        </div>
      </div>

      {/* DANH SÁCH PHÂN ĐOẠN: MỤC TOÀN TUYẾN Ở TRÊN CÙNG, BÊN DƯỚI LÀ CÁC PHÂN ĐOẠN CHI TIẾT */}
      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-0.5">
        {/* CARD TOÀN TUYẾN (DÀNH CHO CẢ TUYẾN CHÍNH LẪN TUYẾN NHÁNH) */}
        {(() => {
          const isMain = selectedTargetType === 'MAINLINE'
          const curBranch = !isMain ? branches.find((b) => b.id === selectedTargetType) : null
          const hasCoords = isMain ? currentCoords.length > 0 : true
          const title = isMain
            ? hasCoords
              ? `Toàn tuyến chính (${mainlineLenText})`
              : `Toàn tuyến chính (Chưa có tim tuyến)`
            : `Toàn tuyến nhánh: ${curBranch?.name || 'Tuyến nhánh'}`
          const subTitle = isMain
            ? !hasCoords
              ? `Chưa có dữ liệu tim đường • Bấm "Nhập Tuyến / Tọa độ (WF-02)" để nạp`
              : segments.length > 0
              ? `Toàn bộ ${segments.length} phân đoạn liên tục • Chuẩn trắc địa WGS84`
              : `Chưa phân đoạn • Vui lòng chọn cự ly và bấm "Áp dụng chia đoạn tự động"`
            : `Tổng chiều dài ${(curBranch?.lengthKm || 0).toFixed(2)} km • ${segments.length} phân đoạn • Rẽ tại ${curBranch?.branchStationText || ''}`

          return (
            <div
              onClick={onSelectAllRoute}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                isAllSelected
                  ? 'bg-amber-50/60 border-brand-gold shadow-xs ring-1 ring-brand-gold/30'
                  : 'bg-white border-slate-200 hover:border-brand-gold/60 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                      isMain ? (hasCoords ? 'bg-brand-gold' : 'bg-slate-400') : 'bg-amber-600'
                    }`}
                  />
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isMain && !hasCoords ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      CHƯA CÓ TIM TUYẾN
                    </span>
                  ) : segments.length > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      HỢP LỆ
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      CHƯA CHIA ĐOẠN
                    </span>
                  )}
                  {!isMain && curBranch && onDeleteBranch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Bạn có chắc muốn xóa tuyến nhánh [${curBranch.name}] để nhập lại không?`)) {
                          onDeleteBranch(curBranch.id)
                        }
                      }}
                      className="p-1 hover:bg-rose-100/80 rounded-md text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa tuyến nhánh này nếu nhập sai muốn nhập lại"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-tight">
                {subTitle}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                <span>Nhấn để chọn và xem toàn bộ tuyến trên bản đồ</span>
                <span className="font-mono font-bold text-brand-gold">
                  {isAllSelected ? '● Đang chọn toàn tuyến' : 'Xem toàn tuyến'}
                </span>
              </div>
            </div>
          )
        })()}

        {/* TIÊU ĐỀ PHÂN ĐOẠN CHI TIẾT */}
        <div className="flex items-center justify-between px-1 pt-1 pb-0.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Phân đoạn chi tiết ({segments.length})</span>
          {segments.length > 0 && onClearAllSegments ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa toàn bộ phân đoạn để thiết lập lại từ đầu không?')) {
                  onClearAllSegments()
                }
              }}
              className="text-[10px] lowercase text-rose-500 hover:text-rose-700 font-semibold cursor-pointer hover:underline"
            >
              Xóa tất cả
            </button>
          ) : (
            <span className="text-[10px] lowercase text-slate-400 font-normal">
              {segments.length > 0 ? 'Bấm chọn để xem từng đoạn' : 'Trống'}
            </span>
          )}
        </div>

        {/* DANH SÁCH CÁC PHÂN ĐOẠN CON BÊN DƯỚI */}
        {isMain && currentCoords.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center flex flex-col items-center gap-2 my-2">
            <span className="text-xs font-bold text-amber-900">
              Dự án mới chưa có tim tuyến &amp; phân đoạn
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dự án này chưa được thiết lập tim tuyến đường. Bạn có thể bấm nút <strong className="text-amber-800">"Nhập Tuyến / Tọa độ (WF-02)"</strong> để tải lên tệp KML / GeoJSON / CSV hoặc dán chuỗi tọa độ.
            </p>
            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="mt-1 px-3 py-1.5 bg-brand-gold hover:bg-[#B38E1F] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập Tuyến / Tọa độ ngay</span>
              </button>
            )}
          </div>
        ) : segments.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 text-center flex flex-col items-center gap-2 my-2">
            <span className="text-xs font-bold text-amber-900">
              Tuyến đường chưa có phân đoạn nào
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Dự án mới cần được thiết lập phân đoạn. Vui lòng chọn cự ly (ví dụ: 1km, 2.5km, 5km) ở trên và bấm <strong className="text-amber-800">"Áp dụng chia đoạn tự động"</strong> để hệ thống tự động sinh các phân đoạn phủ kín chiều dài tuyến ({mainlineLenText}).
            </p>
          </div>
        ) : (
          segments.map((seg) => (
            <SidebarSegmentCard
              key={seg.id}
              segment={seg}
              isSelected={selectedSegmentId === seg.id}
              onSelect={() => onSelectSegment(seg)}
              onSnap={() => onSnapSegment(seg.id)}
              onEdit={() => onEditSegment(seg)}
              onOpenSplit={() => onOpenSplitModal(seg)}
              onDelete={() => onDeleteSegment(seg.id)}
            />
          ))
        )}
      </div>
    </>
  )
}
