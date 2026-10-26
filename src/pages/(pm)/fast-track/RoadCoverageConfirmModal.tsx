import React, { useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { RoadCoverageFact, RoadCoverageInputDto } from './types'

export interface AvailableProject {
  id: string
  code: string
  name: string
  startKm: number
  endKm: number
  obligationId: string
  defaultHandover: string
}

export const AVAILABLE_PROJECTS: AvailableProject[] = [
  {
    id: 'PRJ-QL1A-02',
    code: 'PRJ-QL1A-02',
    name: 'QL1A - Giai đoạn 2 (Km 1020 - Km 1045)',
    startKm: 1020,
    endKm: 1045,
    obligationId: 'SCO-QL1A-2026-02',
    defaultHandover: 'BB-BG-2026/QL1A-GĐ2'
  },
  {
    id: 'PRJ-QL1A-01',
    code: 'PRJ-QL1A-01',
    name: 'QL1A - Giai đoạn 1 (Km 1000 - Km 1025)',
    startKm: 1000,
    endKm: 1025,
    obligationId: 'SCO-QL1A-2026-01',
    defaultHandover: 'BB-BG-2025/QL1A-GĐ1'
  },
  {
    id: 'PRJ-CT-BN',
    code: 'PRJ-CT-BN',
    name: 'Đường nối Cao tốc Bắc - Nam (Km 0 - Km 12)',
    startKm: 0,
    endKm: 12,
    obligationId: 'SCO-CTBN-2026-01',
    defaultHandover: 'BB-BG-2026/CTBN-XL02'
  },
  {
    id: 'PRJ-PT-DG',
    code: 'PRJ-PT-DG',
    name: 'Cao tốc Phan Thiết - Dầu Giây (Km 45 - Km 65)',
    startKm: 45,
    endKm: 65,
    obligationId: 'SCO-PTDG-2026-01',
    defaultHandover: 'BB-BG-2025/PTDG-BH'
  }
]

export interface RoadCoverageConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  roadCoverage: RoadCoverageFact
  onConfirm: (input: RoadCoverageInputDto, projectInfo: { projectId: string; projectName: string; fromKm: number; toKm: number }) => void
}

export const RoadCoverageConfirmModal: React.FC<RoadCoverageConfirmModalProps> = ({
  isOpen,
  onClose,
  roadCoverage,
  onConfirm
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(roadCoverage.projectId || 'PRJ-QL1A-02')
  const [sourceKind, setSourceKind] = useState<'WARRANTY' | 'MAINTENANCE_BASIS'>(roadCoverage.sourceKind || 'WARRANTY')
  const [handoverVersion, setHandoverVersion] = useState(roadCoverage.handoverVersion || 'BB-BG-2026/QL1A-GĐ2')
  const [applicableFrom, setApplicableFrom] = useState(roadCoverage.applicableFromUtc || '2026-01-01')
  const [applicableTo, setApplicableTo] = useState(roadCoverage.applicableToUtc || '2026-12-31')
  const [reason, setReason] = useState(
    roadCoverage.reason ||
      'Chấp thuận áp dụng cơ chế xử lý khẩn cấp theo Biên bản bàn giao và thẩm định hiện trường đợt 4/2026.'
  )

  if (!isOpen) return null

  const currentSelectedProj = AVAILABLE_PROJECTS.find((p) => p.id === selectedProjectId) || AVAILABLE_PROJECTS[0]

  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId)
    const p = AVAILABLE_PROJECTS.find((item) => item.id === projId)
    if (p) {
      setHandoverVersion(p.defaultHandover)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(
      {
        scopeObligationId: currentSelectedProj.obligationId,
        handoverDocumentId: 'DOC-HD-2026-01',
        handoverVersion,
        sourceKind,
        applicableFromUtc: applicableFrom,
        applicableToUtc: applicableTo,
        provenance: 'REAL_SOURCE',
        reason: reason.trim()
      },
      {
        projectId: currentSelectedProj.id,
        projectName: currentSelectedProj.name,
        fromKm: currentSelectedProj.startKm,
        toKm: currentSelectedProj.endKm
      }
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              <Icon name="verified_user" size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Phê Duyệt Độ Phủ Tuyến Bảo Hành</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xác nhận căn cứ pháp lý &amp; phạm vi tuyến đường áp dụng cơ chế xử lý khẩn cấp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Tuyến đường & Phạm vi lý trình (Cho phép chọn linh hoạt) */}
          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1">
              1. Dự án / Tuyến đường bảo hành phê duyệt: <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A227] font-semibold cursor-pointer"
            >
              {AVAILABLE_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>

            <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Icon name="route" size={14} className="text-amber-800 shrink-0" />
                <span>Phạm vi: Km {currentSelectedProj.startKm} &rarr; Km {currentSelectedProj.endKm}</span>
              </div>
              <span className="font-mono text-slate-500">Mã nghĩa vụ: {currentSelectedProj.obligationId}</span>
            </div>
          </div>

          {/* 2. Căn cứ nguồn pháp lý (sourceKind) */}
          <div className="flex flex-col">
            <label className="font-bold text-slate-700 mb-1.5">
              2. Căn cứ nguồn pháp lý trách nhiệm: <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSourceKind('WARRANTY')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  sourceKind === 'WARRANTY'
                    ? 'bg-amber-50 border-[#C9A227] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1.5">
                  <Icon name="handshake" size={15} className={sourceKind === 'WARRANTY' ? 'text-amber-800' : 'text-slate-400'} />
                  <span>Bảo hành công trình</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                  Trách nhiệm bảo hành sau thi công theo hợp đồng
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSourceKind('MAINTENANCE_BASIS')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  sourceKind === 'MAINTENANCE_BASIS'
                    ? 'bg-amber-50 border-[#C9A227] text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[11px] flex items-center gap-1.5">
                  <Icon name="engineering" size={15} className={sourceKind === 'MAINTENANCE_BASIS' ? 'text-amber-800' : 'text-slate-400'} />
                  <span>Bảo dưỡng thường xuyên</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1 leading-tight">
                  Hợp đồng bảo trì, tuần kiểm định kỳ hàng quý
                </span>
              </button>
            </div>
          </div>

          {/* 3. Số hiệu văn bản bàn giao & Thời hạn hiệu lực */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 flex flex-col">
              <label className="font-bold text-slate-700 mb-1">
                3. Số hiệu văn bản: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={handoverVersion}
                onChange={(e) => setHandoverVersion(e.target.value)}
                placeholder="VD: BB-BG-2026/QL1A-GĐ2"
                className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A227] font-semibold"
              />
            </div>

            <div className="sm:col-span-1 flex flex-col">
              <label className="font-bold text-slate-700 mb-1">
                Hiệu lực từ ngày: <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={applicableFrom}
                onChange={(e) => setApplicableFrom(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div className="sm:col-span-1 flex flex-col">
              <label className="font-bold text-slate-700 mb-1">
                Hết hạn vào ngày: <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A227]"
              />
            </div>
          </div>

          {/* 4. Căn cứ / Lý do phê duyệt của Giám sát */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                4. Căn cứ / Lý do phê duyệt của Giám sát: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Tối đa 1000 ký tự</span>
            </div>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập ghi chú phê duyệt độ phủ tuyến gửi Chỉ huy trưởng..."
              className="w-full bg-slate-50 text-slate-800 text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#C9A227] focus:bg-white transition-colors"
            />
          </div>

          {/* Hộp thông báo thẩm quyền */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2.5">
            <Icon name="check_circle" size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Sau khi Giám sát phê duyệt độ phủ tuyến, phạm vi hiệu lực pháp lý của dự án được xác lập chính thức. Chỉ huy trưởng dự án (PM) mới đủ điều kiện kích hoạt điều phối nhanh cho các hư hỏng nằm trong tuyến đường này.
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
            <span className="text-[11px] text-slate-500 font-medium truncate">
              Người thực hiện: Giám sát / Chủ đầu tư
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#C9A227] hover:bg-[#b08d20] text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Icon name="verified" size={15} />
                <span>Xác nhận phê duyệt độ phủ tuyến</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

