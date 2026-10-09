import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { RoleCode } from '../../types/enums'
import { acceptanceService, AcceptancePackage } from '../../api/services/acceptanceService'

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
      const matchStatus = selectedStatus === 'ALL' || pkg.status === selectedStatus
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
    const passed = packages.filter((p) => p.status === 'PASSED').length
    return { total, pending, rework, passed }
  }, [packages])

  return (
    <div className="space-y-5 pb-16 text-[#1A1D20]">
      {/* HEADER SECTION & BREADCRUMB */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <button
                onClick={() => navigate(`${basePath}/dashboard`)}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Trang chủ
              </button>
              <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
              <span className="text-slate-900 font-medium">Nghiệm thu chất lượng công trình</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sansation">
              Danh sách hồ sơ &amp; Gói thầu chờ nghiệm thu
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm tra hồ sơ Before/After, đối chứng độ chặt K98 và tiến hành nghiệm thu hoặc yêu cầu sửa lại theo TCVN 8819:2011.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700">
              <span className="material-symbols-outlined text-[16px] text-[#C9A227]">
                {isSupervisorView ? 'verified_user' : 'engineering'}
              </span>
              <span>{isSupervisorView ? 'Kỹ sư Giám sát' : 'Chỉ huy trưởng (PM)'}</span>
            </div>
          </div>
        </div>

        {/* KPI METRIC CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium block">Tổng số gói thi công</span>
            <span className="text-xl font-bold text-slate-900 font-sansation">{stats.total}</span>
          </div>
          <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/80">
            <span className="text-[11px] text-amber-800 font-medium block">Chờ nghiệm thu hiện trường</span>
            <span className="text-xl font-bold text-[#B45309] font-sansation">{stats.pending}</span>
          </div>
          <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200/80">
            <span className="text-[11px] text-rose-800 font-medium block">Yêu cầu sửa lại (Rework)</span>
            <span className="text-xl font-bold text-[#E5484D] font-sansation">{stats.rework}</span>
          </div>
          <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/80">
            <span className="text-[11px] text-emerald-800 font-medium block">Đã nghiệm thu đạt</span>
            <span className="text-xl font-bold text-[#2F9E44] font-sansation">{stats.passed}</span>
          </div>
        </div>
      </section>

      {/* FILTER & TOOLBAR */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'PENDING_INSPECTION', label: 'Chờ nghiệm thu' },
              { id: 'REWORK_REQUIRED', label: 'Cần sửa lại' },
              { id: 'PASSED', label: 'Đã hoàn thành' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
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
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm mã gói, mã vụ việc, lý trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 w-full sm:w-64 focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="relative">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:border-[#C9A227] cursor-pointer"
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

      {/* TABLE / CARD LIST */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-500">
            <span className="w-5 h-5 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin mr-2"></span>
            <span className="text-xs font-medium">Đang tải danh sách gói nghiệm thu...</span>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center p-12 text-slate-500 space-y-1">
            <span className="material-symbols-outlined text-[36px] text-slate-300 block">inventory_2</span>
            <p className="text-sm font-medium text-slate-700">Không tìm thấy gói nghiệm thu nào phù hợp</p>
            <p className="text-xs text-slate-400">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Gói đề xuất &amp; Vụ việc</th>
                  <th className="py-3 px-4">Dự án &amp; Đoạn tuyến</th>
                  <th className="py-3 px-4">Khối lượng kỹ thuật</th>
                  <th className="py-3 px-4">Đơn vị thi công &amp; SLA</th>
                  <th className="py-3 px-4 text-center">Tiến độ nghiệm thu</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Mã gói & tiêu đề */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{pkg.code}</span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {pkg.case_code}
                        </span>
                      </div>
                      <p className="font-medium text-slate-800 line-clamp-1">{pkg.title}</p>
                    </td>

                    {/* Dự án & Lý trình */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="text-slate-800 font-medium line-clamp-1">{pkg.project_name}</p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <span className="material-symbols-outlined text-[13px] text-[#C9A227]">location_on</span>
                        <span>{pkg.chainage_display}</span>
                      </span>
                    </td>

                    {/* Khối lượng kỹ thuật */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <span className="font-medium text-slate-800 block">{pkg.technical_scope}</span>
                      <span className="text-[11px] text-slate-500">TCVN 8819:2011</span>
                    </td>

                    {/* Đơn vị & SLA */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <span className="text-slate-800 line-clamp-1">{pkg.contractor_name}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          pkg.status === 'REWORK_REQUIRED'
                            ? 'text-rose-700'
                            : pkg.status === 'PASSED'
                            ? 'text-slate-500'
                            : 'text-amber-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        <span>{pkg.sla_display}</span>
                      </span>
                    </td>

                    {/* Tiến độ & Trạng thái */}
                    <td className="py-3.5 px-4 text-center space-y-1">
                      <div>
                        {pkg.status === 'PASSED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#E9F7EC] text-[#2F9E44] border border-[#C3E6CB]">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>{pkg.status_label}</span>
                          </span>
                        )}
                        {pkg.status === 'PENDING_INSPECTION' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FEF3E2] text-[#B45309] border border-[#FDE68A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>{pkg.status_label}</span>
                          </span>
                        )}
                        {pkg.status === 'REWORK_REQUIRED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FDECEC] text-[#E5484D] border border-[#F8B4B4]">
                            <span className="material-symbols-outlined text-[14px]">replay</span>
                            <span>{pkg.status_label}</span>
                          </span>
                        )}
                      </div>

                      {/* Thanh tiến độ */}
                      <div className="w-28 mx-auto bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pkg.status === 'PASSED'
                              ? 'bg-[#2F9E44]'
                              : pkg.status === 'REWORK_REQUIRED'
                              ? 'bg-[#E5484D]'
                              : 'bg-[#C9A227]'
                          }`}
                          style={{ width: `${Math.round((pkg.accepted_items / pkg.total_items) * 100)}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Nút hành động */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`${basePath}/acceptance/${pkg.id}`)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium shadow-2xs transition cursor-pointer ${
                          pkg.status === 'PASSED'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            : 'bg-[#C9A227] hover:bg-[#8C6D1F] text-white'
                        }`}
                      >
                        <span>{pkg.status === 'PASSED' ? 'Xem hồ sơ' : 'Vào nghiệm thu'}</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
export default AcceptanceList
