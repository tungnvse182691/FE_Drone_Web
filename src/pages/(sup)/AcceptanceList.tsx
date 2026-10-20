import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import {
  acceptanceService,
  AcceptancePackage,
  INITIAL_ACCEPTANCE_RECORDS
} from '../../api/services/acceptanceService'
import { Icon } from '../../components/ui/Icon'

export const AcceptanceList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isSupervisorView = user?.role === RoleCode.SUPERVISOR
  const basePath = isSupervisorView ? '/sup' : '/pm'

  const [packages, setPackages] = useState<AcceptancePackage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedProject, setSelectedProject] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Tải danh sách gói thầu từ Mock API bất đồng bộ
  useEffect(() => {
    let isMounted = true
    const fetchPackages = async () => {
      try {
        setIsLoading(true)
        const data = await acceptanceService.getAcceptancePackages()
        if (isMounted) {
          setPackages(data)
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách nghiệm thu:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchPackages()
    return () => {
      isMounted = false
    }
  }, [])

  // Danh sách dự án duy nhất để làm bộ lọc
  const projectsList = useMemo(() => {
    const map = new Map<string, string>()
    packages.forEach((p) => map.set(p.project_id, p.project_name))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [packages])

  // Lọc dữ liệu theo điều kiện
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      let matchStatus = selectedStatus === 'ALL'
      if (selectedStatus === 'CLOSED') {
        matchStatus = Boolean(pkg.is_closed)
      } else if (selectedStatus === 'PASSED') {
        matchStatus = pkg.status === 'PASSED' && !pkg.is_closed
      } else if (selectedStatus !== 'ALL') {
        matchStatus = pkg.status === selectedStatus
      }

      const matchProject = selectedProject === 'ALL' || pkg.project_id === selectedProject
      const q = searchQuery.trim().toLowerCase()
      const matchQuery =
        !q ||
        pkg.code.toLowerCase().includes(q) ||
        pkg.case_code.toLowerCase().includes(q) ||
        pkg.title.toLowerCase().includes(q) ||
        pkg.project_name.toLowerCase().includes(q) ||
        pkg.chainage_display.toLowerCase().includes(q)
      return matchStatus && matchProject && matchQuery
    })
  }, [packages, selectedStatus, selectedProject, searchQuery])

  // Thống kê nhanh KPI
  const stats = useMemo(() => {
    const total = packages.length
    const pending = packages.filter((p) => p.status === 'PENDING_INSPECTION').length
    const rework = packages.filter((p) => p.status === 'REWORK_REQUIRED').length
    const closed = packages.filter((p) => p.is_closed).length
    const passed = packages.filter((p) => p.status === 'PASSED' && !p.is_closed).length
    return { total, pending, rework, closed, passed }
  }, [packages])

  return (
    <div className="space-y-6 pb-16 text-[#1A1D20]">
      {/* HEADER SECTION & BREADCRUMB */}
      <section className="bg-white border border-[#E2E5E9] rounded-[20px] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <button
                onClick={() => navigate(`${basePath}/dashboard`)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <Icon name="chevron_right" size={14} className="text-slate-400" />
              <span className="text-slate-900 font-medium">Nghiệm thu chất lượng công trình</span>
            </nav>
            <h1 className="text-2xl font-bold text-slate-900 font-headline">
              Danh sách hồ sơ &amp; Gói thầu chờ nghiệm thu
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kiểm tra hồ sơ Trước/Sau, đối chứng độ chặt K98 và tiến hành nghiệm thu hoặc yêu cầu sửa lại theo TCVN 8819:2011.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F8F9FA] border border-slate-200 text-slate-700 shadow-2xs">
              <Icon
                name={isSupervisorView ? 'verified_user' : 'engineering'}
                size={16}
                className="text-[#C9A227]"
              />
              <span>{isSupervisorView ? 'Kỹ sư Giám sát' : 'Chỉ huy trưởng (PM)'}</span>
            </div>
          </div>
        </div>

        {/* KPI METRIC CARDS (4 thẻ có điểm nhấn) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* KPI 1: Tổng số */}
          <div
            className="rounded-[20px] overflow-hidden transition-all duration-300 relative bg-white hover:-translate-y-1 shadow-2xs"
            style={{
              border: '1.5px solid #E5D8B4',
              background: 'linear-gradient(180deg, #FFFDF5 0%, #ffffff 45%)'
            }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #C9A227 0%, #8C6D1F 100%)' }} />
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
                  <span className="absolute inset-0 rounded-full bg-[#C9A227]/20" />
                </div>
                <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Tổng số gói thi công</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-sansation pt-1">{stats.total}</div>
            </div>
          </div>

          {/* KPI 2: Chờ nghiệm thu */}
          <div
            className="rounded-[20px] overflow-hidden transition-all duration-300 relative bg-white hover:-translate-y-1 shadow-2xs"
            style={{
              border: '1.5px solid #E3D3AC',
              background: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)'
            }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #B45309 0%, #92400E 100%)' }} />
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                  <span className="absolute inset-0 rounded-full bg-[#B45309]/20" />
                </div>
                <span className="text-[11px] text-[#B45309] font-bold uppercase tracking-wider">Chờ nghiệm thu</span>
              </div>
              <div className="text-2xl font-bold text-[#B45309] font-sansation pt-1">{stats.pending}</div>
            </div>
          </div>

          {/* KPI 3: Yêu cầu sửa lại */}
          <div
            className="rounded-[20px] overflow-hidden transition-all duration-300 relative bg-white hover:-translate-y-1 shadow-2xs"
            style={{
              border: '1.5px solid #E6A8A8',
              background: 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)'
            }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #B91C1C 0%, #7F1D1D 100%)' }} />
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]" />
                  <span className="absolute inset-0 rounded-full bg-[#B91C1C]/20" />
                </div>
                <span className="text-[11px] text-[#B91C1C] font-bold uppercase tracking-wider">Yêu cầu sửa lại</span>
              </div>
              <div className="text-2xl font-bold text-[#B91C1C] font-sansation pt-1">{stats.rework}</div>
            </div>
          </div>

          {/* KPI 4: Đã đóng gói / Đạt chuẩn */}
          <div
            className="rounded-[20px] overflow-hidden transition-all duration-300 relative bg-white hover:-translate-y-1 shadow-2xs"
            style={{
              border: '1.5px solid #A7C4B8',
              background: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)'
            }}
          >
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #047857 0%, #065F46 100%)' }} />
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#047857]" />
                  <span className="absolute inset-0 rounded-full bg-[#047857]/20" />
                </div>
                <span className="text-[11px] text-[#047857] font-bold uppercase tracking-wider">Đã đóng gói / Đạt</span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold text-[#047857] font-sansation">{stats.closed}</span>
                <span className="text-[11px] text-slate-500 font-medium">({stats.passed} chờ đóng)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & TOOLBAR */}
      <section className="bg-white border border-[#E2E5E9] rounded-[20px] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'PENDING_INSPECTION', label: 'Chờ nghiệm thu' },
              { id: 'REWORK_REQUIRED', label: 'Cần sửa lại' },
              { id: 'PASSED', label: 'Chờ đóng đợt' },
              { id: 'CLOSED', label: 'Đã đóng gói' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#C9A227] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Project Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Icon name="search" size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã gói, mã vụ việc, lý trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 w-full sm:w-64 focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-[#F8F9FA] border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#C9A227] cursor-pointer"
              >
                <option value="ALL">Tất cả dự án bảo hành</option>
                {projectsList.map((prj) => (
                  <option key={prj.id} value={prj.id}>
                    {prj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* LƯỚI THẺ NGHIỆM THU (GRID 3 CỘT THAY CHO BẢNG) */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-[20px] border border-[#E2E5E9] text-slate-500 shadow-2xs">
          <Icon name="sync" size={20} className="animate-spin text-[#C9A227] mr-2" />
          <span className="text-xs font-semibold">Đang tải danh sách gói nghiệm thu...</span>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-[20px] border border-[#E2E5E9] text-slate-500 space-y-2 shadow-2xs">
          <Icon name="inventory_2" size={36} className="text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Không tìm thấy gói nghiệm thu nào phù hợp</p>
          <p className="text-xs text-slate-400">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const isClosed = Boolean(pkg.is_closed)
            const isPassed = pkg.status === 'PASSED' && !isClosed
            const isRework = pkg.status === 'REWORK_REQUIRED'

            const cfg = (() => {
              if (isClosed || isPassed) {
                return {
                  border: '#A7C4B8',
                  gradient: 'linear-gradient(90deg, #047857 0%, #065F46 100%)',
                  dot: '#047857',
                  halo: 'rgba(4, 120, 87, 0.15)',
                  bgTint: 'linear-gradient(180deg, #F0FDF7 0%, #ffffff 45%)',
                  hoverShadow: '0 12px 28px rgba(4, 120, 87, 0.15)'
                }
              }
              if (isRework) {
                return {
                  border: '#E6A8A8',
                  gradient: 'linear-gradient(90deg, #B91C1C 0%, #7F1D1D 100%)',
                  dot: '#B91C1C',
                  halo: 'rgba(185, 28, 28, 0.15)',
                  bgTint: 'linear-gradient(180deg, #FEF2F2 0%, #ffffff 45%)',
                  hoverShadow: '0 12px 28px rgba(185, 28, 28, 0.15)'
                }
              }
              return {
                border: '#E3D3AC',
                gradient: 'linear-gradient(90deg, #B45309 0%, #92400E 100%)',
                dot: '#B45309',
                halo: 'rgba(180, 83, 9, 0.15)',
                bgTint: 'linear-gradient(180deg, #FFFBEB 0%, #ffffff 45%)',
                hoverShadow: '0 12px 28px rgba(180, 83, 9, 0.15)'
              }
            })()

            // Lấy ảnh mẫu Trước / Sau từ records
            const matchedRecord = INITIAL_ACCEPTANCE_RECORDS.find((r) => r.package_id === pkg.id) || INITIAL_ACCEPTANCE_RECORDS[0]
            const beforePhoto = matchedRecord?.before_photo
            const afterPhoto = matchedRecord?.after_photo
            const progressRatio = pkg.total_items > 0 ? Math.round((pkg.accepted_items / pkg.total_items) * 100) : 0

            return (
              <div
                key={pkg.id}
                onClick={() => navigate(`${basePath}/acceptance/${pkg.id}`)}
                style={{
                  border: `1.5px solid ${cfg.border}`,
                  background: cfg.bgTint,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="rounded-[20px] overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg relative group"
              >
                {/* 4px top gradient line */}
                <div className="h-1 w-full" style={{ background: cfg.gradient }} />

                <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                  {/* Hàng 1: Mã gói & Badges */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Dot 10px + Halo 4px */}
                        <div className="relative flex items-center justify-center w-4 h-4 shrink-0 mt-0.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                          <span className="absolute inset-0 rounded-full" style={{ backgroundColor: cfg.halo }} />
                        </div>
                        <span className="font-mono font-bold text-sm text-slate-900">{pkg.code}</span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {pkg.case_code}
                        </span>
                      </div>

                      {/* Badge trạng thái */}
                      <div className="shrink-0">
                        {isClosed ? (
                          <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#1A1D20] text-white border border-[#2D3748]">
                            <Icon name="lock" size={13} className="text-[#C9A227]" />
                            <span>ĐÃ ĐÓNG GÓI</span>
                          </span>
                        ) : isPassed ? (
                          <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#F0FDF7] text-[#047857] border border-[#A7C4B8]">
                            <Icon name="check_circle" size={13} />
                            <span>{pkg.status_label}</span>
                          </span>
                        ) : isRework ? (
                          <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#E6A8A8]">
                            <Icon name="replay" size={13} />
                            <span>{pkg.status_label}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-[14px] py-[5px] rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#E3D3AC]">
                            <Icon name="schedule" size={13} />
                            <span>{pkg.status_label}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-[#C9A227] transition-colors">
                      {pkg.title}
                    </h3>
                  </div>

                  {/* Ảnh Đối Chứng Trước / Sau */}
                  <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1">
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group/img">
                        <img
                          src={beforePhoto}
                          alt="Trước thi công"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Trước
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 border border-emerald-300 relative group/img">
                        <img
                          src={afterPhoto}
                          alt="Sau thi công"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-emerald-900/80 text-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Sau
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin metadata */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Icon name="near_me" size={14} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{pkg.project_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Icon name="location_on" size={14} className="text-[#C9A227] shrink-0" />
                      <span className="text-slate-700">{pkg.chainage_display}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Icon name="engineering" size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{pkg.contractor_name}</span>
                    </div>
                  </div>

                  {/* Thanh tiến độ */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span>Tiến độ: {pkg.accepted_items}/{pkg.total_items} hạng mục</span>
                      <span className="font-mono font-bold text-slate-700">{progressRatio}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/80">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isClosed || isPassed
                            ? 'bg-[#047857]'
                            : isRework
                            ? 'bg-[#B91C1C]'
                            : 'bg-[#C9A227]'
                        }`}
                        style={{ width: `${progressRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* Hàng nút hành động (whitespace-nowrap không bị rớt dòng) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    {isClosed ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`${basePath}/acceptance/${pkg.id}`)
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E5E9] whitespace-nowrap"
                      >
                        <Icon name="inventory_2" size={14} className="text-slate-500" />
                        <span>Xem hồ sơ</span>
                      </button>
                    ) : isPassed ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`${basePath}/acceptance/${pkg.id}`)
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer bg-[#1A1D20] hover:bg-black text-[#F1E5C6] whitespace-nowrap"
                        title="Hạng mục đã đạt 100%, vào kiểm tra và đóng đợt thi công"
                      >
                        <Icon name="lock" size={14} className="text-[#C9A227]" />
                        <span>Đóng đợt ngay</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`${basePath}/acceptance/${pkg.id}`)
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer bg-[#C9A227] hover:bg-[#B38E1F] text-white whitespace-nowrap"
                      >
                        <span>Vào nghiệm thu</span>
                        <Icon name="arrow_forward" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AcceptanceList
