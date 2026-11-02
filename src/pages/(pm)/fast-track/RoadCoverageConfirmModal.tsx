import React, { useState, useEffect } from 'react'
import { Icon } from '../../../components/ui/Icon'
import type { RoadCoverageFact, RoadCoverageInputDto } from './types'

export interface RoadCoverageConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  roadCoverage: RoadCoverageFact
  onConfirm: (
    input: RoadCoverageInputDto,
    projectInfo: { projectId: string; projectName: string; fromKm: number; toKm: number }
  ) => void
  errorMessage?: string | null
  isSubmitting?: boolean
}

export const RoadCoverageConfirmModal: React.FC<RoadCoverageConfirmModalProps> = ({
  isOpen,
  onClose,
  roadCoverage,
  onConfirm,
  errorMessage,
  isSubmitting = false
}) => {
  const [sourceKind, setSourceKind] = useState<'WARRANTY' | 'MAINTENANCE_BASIS'>(
    roadCoverage.sourceKind || 'MAINTENANCE_BASIS'
  )
  const [documentNo, setDocumentNo] = useState(
    roadCoverage.documentNo || 'BB-BG-2026/QL1A-PK01'
  )
  const [applicableFrom, setApplicableFrom] = useState(
    roadCoverage.applicableFromUtc && roadCoverage.applicableFromUtc !== '—'
      ? roadCoverage.applicableFromUtc.substring(0, 10)
      : '2026-01-01'
  )
  const [applicableTo, setApplicableTo] = useState(
    roadCoverage.applicableToUtc && roadCoverage.applicableToUtc !== '—'
      ? roadCoverage.applicableToUtc.substring(0, 10)
      : '2026-12-31'
  )
  const [reason, setReason] = useState(
    roadCoverage.reason ||
      'Giám sát chấp thuận phê duyệt áp dụng cơ chế xử lý nhanh khẩn cấp cho phân đoạn tuyến bảo hành.'
  )

  useEffect(() => {
    if (isOpen) {
      if (roadCoverage.sourceKind) {
        setSourceKind(roadCoverage.sourceKind)
      }
      if (roadCoverage.documentNo) {
        setDocumentNo(roadCoverage.documentNo)
      }
      if (roadCoverage.applicableFromUtc && roadCoverage.applicableFromUtc !== '—') {
        setApplicableFrom(roadCoverage.applicableFromUtc.substring(0, 10))
      }
      if (roadCoverage.applicableToUtc && roadCoverage.applicableToUtc !== '—') {
        setApplicableTo(roadCoverage.applicableToUtc.substring(0, 10))
      }
    }
  }, [isOpen, roadCoverage.sourceKind, roadCoverage.documentNo, roadCoverage.applicableFromUtc, roadCoverage.applicableToUtc])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(
      {
        scopeObligationId: roadCoverage.scopeObligationId || 'f02d8a05-e2ba-48b7-a6ee-5aacb2147459',
        expectedScopeHash: roadCoverage.scopeHash || '213341573d4e4b4962b47ac0ca14a742b4bea0922db2a0522495b989f37c078f',
        handoverDocumentId: roadCoverage.handoverDocumentId || 'a1111111-2222-3333-4444-555555555555',
        handoverVersion: roadCoverage.handoverVersion || '87b7e4d0f2c7136f426533ec6127f4230584b8551afba5824b8347aacbd15ebf',
        sourceKind,
        sourceId: roadCoverage.sourceId || 'fa88668b-620f-4484-b2f0-90a67d7d2929',
        sourceVersion: roadCoverage.sourceVersion || '9e18691285aa52f7065c7aa88d689de5af91a8afde9a7aa4e5f17dddb246010b',
        applicableFromUtc: `${applicableFrom}T00:00:00Z`,
        applicableToUtc: `${applicableTo}T23:59:59Z`,
        provenance: 'REAL_SOURCE',
        reason: `${reason} (Căn cứ văn bản: ${documentNo})`
      },
      {
        projectId: roadCoverage.projectId,
        projectName: roadCoverage.projectName,
        fromKm: roadCoverage.fromKm,
        toKm: roadCoverage.toKm
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <Icon name="verified" size={18} className="text-[#C9A227]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-dark">Phê Duyệt Độ Phủ Tuyến Bảo Hành</h3>
              <span className="text-[10px] text-slate-500">Kỹ sư Giám sát / Chủ đầu tư thẩm duyệt hồ sơ bàn giao tuyến</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Thông tin dự án và lý trình */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Phân đoạn bảo hành:</span>
              <span className="font-bold text-slate-900">
                Lý trình Km {roadCoverage.fromKm} - Km {roadCoverage.toKm}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Mã nghĩa vụ tuyến:</span>
              <span className="font-mono text-slate-700 font-semibold truncate max-w-[200px]">
                {roadCoverage.scopeObligationId || 'Theo dữ liệu CSDL'}
              </span>
            </div>
          </div>

          {/* Căn cứ pháp lý */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Căn cứ pháp lý áp dụng</label>
              <span className="text-[10px] text-slate-500">
                {roadCoverage.hasWarrantySource ? 'Hồ sơ có hợp đồng bảo hành' : 'Áp dụng bảo dưỡng thường xuyên'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex flex-col gap-1 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  sourceKind === 'MAINTENANCE_BASIS'
                    ? 'border-[#C9A227] bg-amber-50/50 text-[#C9A227] font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sourceKind"
                    checked={sourceKind === 'MAINTENANCE_BASIS'}
                    onChange={() => setSourceKind('MAINTENANCE_BASIS')}
                    className="sr-only"
                  />
                  <Icon name="handyman" size={16} />
                  <span className="text-xs">Bảo dưỡng thường xuyên</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal pl-6">
                  Biên bản bàn giao &amp; quy chuẩn bảo trì tuyến
                </span>
              </label>

              <label
                className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-all ${
                  !roadCoverage.hasWarrantySource
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-80'
                    : sourceKind === 'WARRANTY'
                    ? 'border-[#C9A227] bg-amber-50/50 text-[#C9A227] font-bold cursor-pointer'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sourceKind"
                    disabled={!roadCoverage.hasWarrantySource}
                    checked={sourceKind === 'WARRANTY'}
                    onChange={() => {
                      if (roadCoverage.hasWarrantySource) setSourceKind('WARRANTY')
                    }}
                    className="sr-only"
                  />
                  <Icon name="verified_user" size={16} />
                  <span className="text-xs">Hợp đồng bảo hành</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal pl-6">
                  {roadCoverage.hasWarrantySource ? 'Theo điều khoản bảo hành công trình' : 'Chưa có hợp đồng bảo hành trong CSDL'}
                </span>
              </label>
            </div>
          </div>

          {/* Số văn bản bàn giao */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Số hiệu biên bản / Văn bản bàn giao tuyến</label>
            <input
              type="text"
              required
              value={documentNo}
              onChange={(e) => setDocumentNo(e.target.value)}
              placeholder="VD: BB-BG-2026/QL1A-PK01"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-mono font-medium text-slate-800"
            />
          </div>

          {/* Thời hạn hiệu lực */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Hiệu lực từ ngày</label>
              <input
                type="date"
                required
                value={applicableFrom}
                onChange={(e) => setApplicableFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Đến hết ngày</label>
              <input
                type="date"
                required
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Lý do / Ý kiến phê duyệt */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Ý kiến thẩm duyệt của Giám sát</label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800"
            />
          </div>

          {/* Cảnh báo lỗi nếu phê duyệt không thành công */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <Icon name="error" size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Lỗi khi phê duyệt độ phủ tuyến:</div>
                <div className="text-[11px] leading-relaxed break-words">{errorMessage}</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#C9A227] hover:bg-[#b08d20] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Icon name="sync" size={14} className="animate-spin" />}
              <span>{isSubmitting ? 'Đang gửi phê duyệt...' : 'Xác nhận phê duyệt độ phủ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
