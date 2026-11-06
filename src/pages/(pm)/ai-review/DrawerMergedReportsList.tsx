import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { TriageCase } from './types'

export interface DrawerMergedReportsListProps {
  selectedCase: TriageCase
  cases: TriageCase[]
  isSupervisor?: boolean
  onUnlinkReport: (childId: string) => void
}

export const DrawerMergedReportsList: React.FC<DrawerMergedReportsListProps> = ({
  selectedCase,
  cases,
  isSupervisor = false,
  onUnlinkReport,
}) => {
  // State quản lý báo cáo con đang được mở xem ảnh đối chiếu
  const [comparingReportCode, setComparingReportCode] = useState<string | null>(null)
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null)

  if (!selectedCase.linked_report_ids || selectedCase.linked_report_ids.length === 0) {
    return null
  }

  return (
    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      {/* Tiêu đề nhóm */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Icon name="link" size={16} className="text-brand-gold" />
          <span>Báo cáo hiện trường đã gộp ({selectedCase.linked_report_ids.length})</span>
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
          Hồ sơ gốc
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-normal">
        Các phản ánh hư hỏng tại vị trí lân cận đã được gộp vào hồ sơ này. Bấm vào từng báo cáo để xem lại ảnh lỗi cũ hoặc đối chiếu trước khi ra quyết định tách.
      </p>

      {/* Danh sách báo cáo đã gộp */}
      <div className="space-y-2.5">
        {selectedCase.linked_report_ids.map((code) => {
          const secondary = cases.find((c) => c.code === code || c.id === code)
          const dupInfo = selectedCase.cluster_duplicates?.find((d) => d.code === code)
          const displayChannel =
            secondary?.reporter_channel ||
            secondary?.source_label ||
            dupInfo?.source ||
            'Ứng dụng Người dân'
          const displayReporter =
            secondary?.reporter_name || dupInfo?.reporter || 'Người dân phản ánh'
          const displayDesc =
            secondary?.description ||
            'Phản ánh hư hỏng mặt đường tại vị trí lân cận đã được gộp bằng chứng'
          const displayImage =
            secondary?.image_url ||
            selectedCase.image_url ||
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
          const displayTime = secondary?.created_at || selectedCase.created_at || 'Tiếp nhận gần đây'
          const displayGps = secondary?.gps || selectedCase.gps

          const isComparing = comparingReportCode === code
          const reportShortCode = code.length > 12 ? `#REP-${code.slice(0, 8).toUpperCase()}` : code

          return (
            <div
              key={code}
              className={`border rounded-xl transition-all ${
                isComparing
                  ? 'bg-amber-50/40 border-brand-gold ring-1 ring-brand-gold/30'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              } p-3 text-xs shadow-2xs space-y-3`}
            >
              {/* Dòng tóm tắt báo cáo */}
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  onClick={() => setComparingReportCode(isComparing ? null : code)}
                  title="Bấm để xem ảnh và đối chiếu lỗi cũ"
                >
                  {/* Thumbnail ảnh với hiệu ứng xem nhanh */}
                  <div className="relative group/thumb w-14 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                    <img
                      src={displayImage}
                      alt={code}
                      className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 flex items-center justify-center text-white transition-colors">
                      <Icon name="search" size={14} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {reportShortCode}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                        {displayChannel}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {displayTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-800 font-semibold truncate mt-0.5">
                      {displayReporter}
                    </p>
                    <p className="text-[11px] text-slate-500 italic truncate mt-0.5">
                      "{displayDesc}"
                    </p>
                  </div>
                </div>

                {/* Các nút thao tác */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setComparingReportCode(isComparing ? null : code)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isComparing
                        ? 'bg-brand-gold text-white border-brand-gold shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title={isComparing ? 'Đóng so sánh' : 'Xem ảnh và đối chiếu lỗi cũ'}
                  >
                    <Icon name={isComparing ? 'expand_less' : 'visibility'} size={14} />
                    <span>{isComparing ? 'Thu gọn' : 'Xem ảnh lỗi cũ'}</span>
                  </button>

                  {!isSupervisor && (
                    <button
                      type="button"
                      onClick={() => onUnlinkReport(secondary?.id || code)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                      title="Tách phản ánh này khỏi hồ sơ gốc để chuyển thành ca độc lập trong CSDL"
                    >
                      <Icon name="link_off" size={14} />
                      <span>Tách hồ sơ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Panel xem ảnh & đối chiếu song song khi bấm xem */}
              {isComparing && (
                <div className="pt-3 border-t border-amber-200/80 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Icon name="compare" size={15} className="text-brand-gold" />
                      <span>Đối chiếu hiện trường: Ảnh hồ sơ chính vs Báo cáo đã gộp</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setComparingReportCode(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cột 1: Ảnh của ca chính */}
                    <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">1. Ảnh Hồ sơ chính ({selectedCase.code})</span>
                        <button
                          type="button"
                          onClick={() => setZoomedImage({ url: selectedCase.image_url, title: `Hồ sơ chính: ${selectedCase.code}` })}
                          className="text-[10px] text-brand-gold hover:underline font-semibold flex items-center gap-0.5"
                        >
                          <Icon name="zoom_in" size={12} />
                          <span>Phóng to</span>
                        </button>
                      </div>
                      <div className="w-full h-36 rounded-md overflow-hidden bg-slate-900 border border-slate-100">
                        <img
                          src={selectedCase.image_url}
                          alt="Ảnh hồ sơ chính"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                        <span>GPS: {selectedCase.gps.lat}°, {selectedCase.gps.lng}°</span>
                        <span>{selectedCase.created_at}</span>
                      </div>
                    </div>

                    {/* Cột 2: Ảnh của báo cáo con */}
                    <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">2. Ảnh Báo cáo đã gộp ({reportShortCode})</span>
                        <button
                          type="button"
                          onClick={() => setZoomedImage({ url: displayImage, title: `Báo cáo đã gộp: ${reportShortCode}` })}
                          className="text-[10px] text-brand-gold hover:underline font-semibold flex items-center gap-0.5"
                        >
                          <Icon name="zoom_in" size={12} />
                          <span>Phóng to</span>
                        </button>
                      </div>
                      <div className="w-full h-36 rounded-md overflow-hidden bg-slate-900 border border-slate-100">
                        <img
                          src={displayImage}
                          alt="Ảnh báo cáo đã gộp"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                        <span>GPS: {displayGps?.lat ?? selectedCase.gps.lat}°, {displayGps?.lng ?? selectedCase.gps.lng}°</span>
                        <span>{displayTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin chi tiết phản ánh người dân */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Người gửi: <strong>{displayReporter}</strong></span>
                      <span>Kênh tiếp nhận: <strong>{displayChannel}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-700 italic pt-1 border-t border-slate-100">
                      Nội dung phản ánh ban đầu: "{displayDesc}"
                    </p>
                  </div>

                  {/* Hành động quyết định nếu phát hiện gộp sai */}
                  {!isSupervisor && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Nếu đây là 2 hư hỏng riêng biệt, hãy bấm tách để quản lý thành ca độc lập:
                      </span>
                      <button
                        type="button"
                        onClick={() => onUnlinkReport(secondary?.id || code)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Icon name="link_off" size={14} />
                        <span>Xác nhận tách hồ sơ này</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal phóng to ảnh lỗi khi người dùng bấm xem chi tiết */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <span className="font-bold text-sm text-brand-gold">{zoomedImage.title}</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="w-full h-80 rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
