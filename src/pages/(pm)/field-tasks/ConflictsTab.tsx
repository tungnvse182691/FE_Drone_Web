import React, { useState } from 'react'
import { SyncConflictItem } from '../../../types/domain'
import { Icon } from '../../../components/ui/Icon'
import { ConflictFilterBar } from './conflicts/ConflictFilterBar'
import { ConflictQueueTable } from './conflicts/ConflictQueueTable'
import { ConflictTimelineAudit } from './conflicts/ConflictTimelineAudit'
import { ConflictServerStateCard } from './conflicts/ConflictServerStateCard'
import { ConflictIncomingStateCard } from './conflicts/ConflictIncomingStateCard'

export interface ConflictsTabProps {
  conflicts: SyncConflictItem[]
  filteredConflicts: SyncConflictItem[]
  selectedConflict: SyncConflictItem | null
  setSelectedConflictId: (id: string) => void
  filterType: string
  setFilterType: (type: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  stats: {
    total: number
    pending: number
    reassign: number
    policyMismatch: number
    rescuePending: number
  }
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
      | 'REQUEST_ADDITIONAL_EVIDENCE'
  ) => void
  activeSubTab?: 'QUEUE' | 'DETAIL'
  setActiveSubTab?: (tab: 'QUEUE' | 'DETAIL') => void
}

export const ConflictsTab: React.FC<ConflictsTabProps> = ({
  conflicts,
  filteredConflicts,
  selectedConflict,
  setSelectedConflictId,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  stats,
  isPM,
  isSupervisor,
  handleOpenResolve,
  activeSubTab: externalSubTab,
  setActiveSubTab: setExternalSubTab
}) => {
  // Quản lý chế độ xem dạng Tab: 'QUEUE' (Danh sách) vs 'DETAIL' (Chi tiết đối chiếu)
  const [internalSubTab, setInternalSubTab] = useState<'QUEUE' | 'DETAIL'>('QUEUE')
  const activeSubTab = externalSubTab ?? internalSubTab
  const setActiveSubTab = (tab: 'QUEUE' | 'DETAIL') => {
    if (setExternalSubTab) {
      setExternalSubTab(tab)
    } else {
      setInternalSubTab(tab)
    }
  }

  // Mở tab đối chiếu chi tiết ngay lập tức khi click vào ca
  const handleOpenDetail = (id: string) => {
    setSelectedConflictId(id)
    setActiveSubTab('DETAIL')
  }

  // Điều hướng ca kế tiếp hoặc ca trước đó trong tab chi tiết
  const currentIndex = conflicts.findIndex((c) => c.id === selectedConflict?.id)
  const prevConflict = currentIndex > 0 ? conflicts[currentIndex - 1] : null
  const nextConflict = currentIndex < conflicts.length - 1 ? conflicts[currentIndex + 1] : null

  return (
    <div className="space-y-4">
      {/* 1. THANH ĐIỀU HƯỚNG SUB-TAB: DANH SÁCH HÀNG ĐỢI VS CHI TIẾT ĐỐI CHIẾU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
        <div className="flex items-center gap-2">
          {/* Tab 1: Danh Sách Hàng Đợi */}
          <button
            type="button"
            onClick={() => setActiveSubTab('QUEUE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'QUEUE'
                ? 'bg-[#C9A227] text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <Icon
              name="format_list_bulleted"
              size={16}
              className={activeSubTab === 'QUEUE' ? 'text-slate-900' : 'text-slate-500'}
            />
            <span>Hàng Đợi Ca Xung Đột ({filteredConflicts.length})</span>
            {stats.pending > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold ${
                activeSubTab === 'QUEUE'
                  ? 'bg-black/15 text-slate-900'
                  : 'bg-amber-500/20 text-amber-700'
              }`}>
                {stats.pending}
              </span>
            )}
          </button>

          {/* Tab 2: Chi Tiết Đối Chiếu */}
          <button
            type="button"
            onClick={() => setActiveSubTab('DETAIL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'DETAIL'
                ? 'bg-[#C9A227] text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <Icon
              name="compare_arrows"
              size={16}
              className={activeSubTab === 'DETAIL' ? 'text-slate-900' : 'text-slate-500'}
            />
            <span>
              Chi Tiết Đối Chiếu {selectedConflict ? `(${selectedConflict.conflict_code})` : ''}
            </span>
            {selectedConflict?.status === 'CONFLICT_INTAKE' && (
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Thanh công cụ phụ khi đang ở Tab Chi tiết */}
        {activeSubTab === 'DETAIL' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút chuyển nhanh giữa các ca xung đột */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                disabled={!prevConflict}
                onClick={() => prevConflict && setSelectedConflictId(prevConflict.id)}
                className={`p-1.5 rounded text-xs transition cursor-pointer ${
                  prevConflict
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title={prevConflict ? `Ca trước: ${prevConflict.conflict_code}` : 'Không còn ca trước'}
              >
                <Icon name="arrow_back" size={14} />
              </button>

              <span className="text-[11px] font-mono text-slate-500 px-2 font-medium">
                {currentIndex + 1} / {conflicts.length}
              </span>

              <button
                type="button"
                disabled={!nextConflict}
                onClick={() => nextConflict && setSelectedConflictId(nextConflict.id)}
                className={`p-1.5 rounded text-xs transition cursor-pointer ${
                  nextConflict
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title={nextConflict ? `Ca kế tiếp: ${nextConflict.conflict_code}` : 'Không còn ca tiếp theo'}
              >
                <Icon name="arrow_forward" size={14} />
              </button>
            </div>

            {/* Nút quay lại danh sách hàng đợi */}
            <button
              type="button"
              onClick={() => setActiveSubTab('QUEUE')}
              className="text-xs font-semibold text-slate-700 hover:text-brand-dark flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            >
              <Icon name="arrow_back" size={14} />
              <span>Quay lại danh sách</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. NỘI DUNG SUB-TAB A: DANH SÁCH HÀNG ĐỢI XUNG ĐỘT */}
      {activeSubTab === 'QUEUE' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Thanh tìm kiếm & lọc */}
          <ConflictFilterBar
            conflicts={conflicts}
            filterType={filterType}
            setFilterType={setFilterType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            stats={stats}
          />

          {/* Bảng danh sách ca xung đột */}
          <ConflictQueueTable
            filteredConflicts={filteredConflicts}
            selectedConflict={selectedConflict}
            setSelectedConflictId={setSelectedConflictId}
            onOpenDetail={handleOpenDetail}
          />
        </div>
      )}

      {/* 3. NỘI DUNG SUB-TAB B: CHI TIẾT ĐỐI CHIẾU & PHÂN GIẢI */}
      {activeSubTab === 'DETAIL' && (
        selectedConflict ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* TIÊU ĐỀ & DÒNG THỜI GIAN DIỄN BIẾN SỰ KIỆN XUNG ĐỘT */}
            <ConflictTimelineAudit selectedConflict={selectedConflict} />

            {/* BẢNG ĐỐI CHIẾU SONG SONG SIDE-BY-SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* CỘT TRÁI (COL 1 - LG 5): DỮ LIỆU CƠ SỞ / THIẾT BỊ 1 / CHÍNH SÁCH MÁY CHỦ */}
              <ConflictServerStateCard
                selectedConflict={selectedConflict}
                isPM={isPM}
                isSupervisor={isSupervisor}
                handleOpenResolve={handleOpenResolve}
              />

              {/* CỘT PHẢI (COL 2 - LG 7): CHỨNG CỨ NGOẠI TUYẾN / THIẾT BỊ 2 / GÓI CỨU HỘ ADB */}
              <ConflictIncomingStateCard
                selectedConflict={selectedConflict}
                isPM={isPM}
                isSupervisor={isSupervisor}
                handleOpenResolve={handleOpenResolve}
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <Icon name="search_off" size={36} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">Chưa có ca xung đột nào trong dự án này</p>
            <p className="text-slate-500 text-xs mt-1">Vui lòng chọn dự án khác từ danh mục hoặc quay lại hàng đợi.</p>
          </div>
        )
      )}
    </div>
  )
}
