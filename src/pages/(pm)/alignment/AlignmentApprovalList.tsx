import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/ui/Icon'
import { Tooltip } from '../../../components/ui/Tooltip'
import { projectService } from '../../../api/services'
import { HubProject } from '../projects/types'
import { useAuthStore } from '../../../store/authStore'
import { calculateCoordsLengthKm } from './alignmentGeometryHelpers'

export const AlignmentApprovalList: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<HubProject[]>([])

  const epoch = useAuthStore(state => state.authEpoch)
  const [error, setError] = useState('')
  const request = useRef(0)
  const loadData = useCallback(async () => {
    const attempt = ++request.current
    const current = () => attempt === request.current && useAuthStore.getState().authEpoch === epoch
    try {
      const list = await projectService.fetchProjects()
      if (current()) { setProjects(list); setError('') }
    } catch { if (current()) setError('Không tải được danh mục dự án. Vui lòng thử lại.') }
  }, [epoch])
  useEffect(() => { void loadData(); return () => { request.current++ } }, [loadData])

  return (
    <div className="space-y-5 font-body">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
            <Icon name="alt_route" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight font-headline">
              Danh mục thẩm định &amp; Phê duyệt tim tuyến
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Giám sát kiểm tra hình học tim tuyến, bề rộng và hệ thống tuyến nhánh do PM nạp lên trước khi khóa phiên bản chính thức.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/sup/projects')}
          className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Icon name="folder_open" size={16} className="text-slate-500" />
          <span>Xem tất cả dự án</span>
        </button>
      </div>

      {error && <p role="alert" className="text-xs text-rose-700">{error}<button type="button" className="ml-3 underline" onClick={() => { void loadData() }}>Thử lại</button></p>}
      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Mã &amp; Tên công trình</th>
                <th className="py-3 px-4">Kỹ sư PM phụ trách</th>
                <th className="py-3 px-4">Khối lượng tim tuyến</th>
                <th className="py-3 px-4 text-center">Phân đoạn lý trình</th>
                <th className="py-3 px-4">Trạng thái hồ sơ</th>
                <th className="py-3 px-4 text-right">Thao tác thẩm định</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((prj) => {
                const alignState = { status: 'UNKNOWN' }
                const alignData: { coords?: [number, number][]; branches?: any[]; segments?: any[] } = {}

                const mainlineCoords = alignData.coords || []
                const branches = alignData.branches || []
                const segments = alignData.segments || []

                const mainlineLen = mainlineCoords.length >= 2 ? calculateCoordsLengthKm(mainlineCoords) : 0
                const branchesLen = branches.reduce((acc: number, b: any) => {
                  const bLen = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : 0) || b.lengthKm || 0
                  return acc + bLen
                }, 0)
                const totalLen = parseFloat((mainlineLen + branchesLen).toFixed(3)) || prj.length_km || 0

                const isPending = alignState.status === 'PENDING_APPROVAL'
                const isConfirmed = alignState.status === 'CONFIRMED'

                const mainlineSegmentsCount = segments.length
                const branchSegmentsCount = branches.reduce((acc: number, b: any) => {
                  const bCount = (b.segments && Array.isArray(b.segments) && b.segments.length > 0)
                    ? b.segments.length
                    : (b.lengthKm > 0 || (b.coords && b.coords.length >= 2) ? 1 : 0)
                  return acc + bCount
                }, 0)
                const totalSegmentsCount = mainlineSegmentsCount + branchSegmentsCount

                // Nội dung Tooltip chi tiết phân rã khi có nhiều nhánh
                const branchesTooltipContent = branches.length > 0 ? (
                  <div className="p-2 space-y-2 min-w-[280px] max-w-[340px] text-left">
                    <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wider border-b border-slate-700/80 pb-1.5 flex items-center justify-between">
                      <span>Cơ cấu tuyến ({branches.length + 1} tuyến)</span>
                      <span className="font-mono text-brand-gold">{totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${Math.round(totalLen * 1000)}m`}</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-3 text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
                          <span className="font-semibold text-white">Trục chính</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          {mainlineSegmentsCount} đoạn • {mainlineLen >= 1 ? `${mainlineLen.toFixed(2)}km` : `${Math.round(mainlineLen * 1000)}m`}
                        </span>
                      </div>
                      {branches.map((b: any, bIdx: number) => {
                        const bLen = (b.coords && b.coords.length >= 2 ? calculateCoordsLengthKm(b.coords) : 0) || b.lengthKm || 0
                        const bSegsCount = (b.segments && Array.isArray(b.segments) && b.segments.length > 0) ? b.segments.length : 1
                        const bDiverge = b.branchStationText || (b.branchStationKm ? `Km ${b.branchStationKm.toFixed(3).replace('.', '+')}` : '')
                        return (
                          <div key={b.id || b.code || bIdx} className="flex items-center justify-between gap-3 text-slate-300 border-t border-slate-800/80 pt-1">
                            <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                              <span className="truncate font-medium">{b.name || `Nhánh #${bIdx + 1}`}</span>
                              {bDiverge && <span className="text-[10px] text-slate-400 font-mono">({bDiverge})</span>}
                            </span>
                            <span className="font-mono text-amber-300 shrink-0 text-right">
                              {bSegsCount} đoạn • {bLen >= 1 ? `${bLen.toFixed(2)}km` : `${Math.round(bLen * 1000)}m`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="pt-1.5 border-t border-slate-700/80 flex items-center justify-between text-[11px] font-bold text-white font-mono">
                      <span>Tổng cộng toàn dự án:</span>
                      <span className="text-emerald-400">{totalSegmentsCount} đoạn • {totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${Math.round(totalLen * 1000)}m`}</span>
                    </div>
                  </div>
                ) : null

                return (
                  <tr key={prj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-brand-goldMuted">{prj.code}</div>
                      <div className="font-bold text-slate-900 mt-0.5">{prj.name}</div>
                      <div className="text-[11px] text-slate-400">{prj.region}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{prj.pm_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {prj.pm_role_badge}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{prj.pm_email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {totalLen > 0 ? (
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {totalLen >= 1 ? `${totalLen.toFixed(2)} km` : `${Math.round(totalLen * 1000)}m`}
                          </span>
                          {mainlineLen > 0 ? (
                            branches.length > 0 && branchesTooltipContent ? (
                              <Tooltip content={branchesTooltipContent} position="top">
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5 inline-flex items-center gap-1 border-b border-dotted border-slate-400 cursor-help">
                                  <span>Trục chính: {mainlineLen >= 1 ? `${mainlineLen.toFixed(2)}km` : `${Math.round(mainlineLen * 1000)}m`} • {branches.length} nhánh ({branchesLen >= 1 ? `${branchesLen.toFixed(2)}km` : `${Math.round(branchesLen * 1000)}m`})</span>
                                  <Icon name="info" size={12} className="text-slate-400" />
                                </div>
                              </Tooltip>
                            ) : (
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                Trục chính: {mainlineLen >= 1 ? `${mainlineLen.toFixed(2)}km` : `${Math.round(mainlineLen * 1000)}m`}
                              </div>
                            )
                          ) : (
                            <div className="text-[11px] text-amber-600 font-mono mt-0.5 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                              <span>Chưa đọc hình học máy chủ</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa đọc hình học máy chủ</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {totalSegmentsCount > 0 ? (
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {totalSegmentsCount} đoạn
                          </span>
                          {branches.length > 0 && branchesTooltipContent ? (
                            <div className="flex justify-center mt-0.5">
                              <Tooltip content={branchesTooltipContent} position="top">
                                <span className="text-[11px] text-slate-500 font-mono inline-flex items-center gap-1 border-b border-dotted border-slate-400 cursor-help">
                                  <span>Trục chính: {mainlineSegmentsCount} đoạn • {branches.length} nhánh ({branchSegmentsCount} đoạn)</span>
                                  <Icon name="info" size={12} className="text-slate-400" />
                                </span>
                              </Tooltip>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Trục chính: {mainlineSegmentsCount} đoạn
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono font-bold text-slate-400 text-sm">Chưa đọc phân đoạn</span>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Cần đọc phiên bản máy chủ</div>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          Chờ Supervisor duyệt
                        </span>
                      ) : isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Icon name="check" size={12} className="text-emerald-700" />
                          Đã khóa tim tuyến
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Chưa đọc trạng thái tuyến
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/sup/projects/${prj.id}/alignment`)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1 ${
                          isPending
                            ? 'bg-brand-gold hover:bg-brand-goldMuted text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <span>{isPending ? 'Thẩm duyệt tim tuyến' : 'Xem bản đồ GIS'}</span>
                        <Icon name="arrow_forward" size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AlignmentApprovalList
