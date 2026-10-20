import React, { useState, useEffect } from 'react'
import { DefectCatalogItem } from '../../../types/domain'
import { Severity } from '../../../types/enums'

export interface DefectCatalogModalProps {
  isOpen: boolean
  mode: 'CREATE' | 'EDIT'
  initialData?: DefectCatalogItem | null
  onClose: () => void
  onSave: (item: DefectCatalogItem) => void
}

export const DefectCatalogModal: React.FC<DefectCatalogModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave
}) => {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [standardRef, setStandardRef] = useState('TCVN 8864:2011')
  const [severity, setSeverity] = useState<Severity>(Severity.MEDIUM)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'EDIT' && initialData) {
      setCode(initialData.code)
      setName(initialData.name)
      setStandardRef(initialData.standard_ref)
      setSeverity(initialData.default_severity || Severity.MEDIUM)
      setDescription(initialData.description)
    } else {
      setCode('')
      setName('')
      setStandardRef('TCVN 8864:2011')
      setSeverity(Severity.MEDIUM)
      setDescription('')
    }
    setError(null)
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Mã khiếm khuyết không được để trống.')
      return
    }
    if (!name.trim()) {
      setError('Tên loại hư hỏng không được để trống.')
      return
    }
    if (!description.trim()) {
      setError('Mô tả đặc trưng kỹ thuật không được để trống.')
      return
    }

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '_')

    onSave({
      code: formattedCode,
      name: name.trim(),
      standard_ref: standardRef.trim(),
      default_severity: severity,
      description: description.trim(),
      is_active: initialData ? initialData.is_active : true
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-brand-gold">
              <span className="material-symbols-outlined text-[20px]">
                {mode === 'CREATE' ? 'add_box' : 'edit_document'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'CREATE'
                  ? 'Thêm Mới Loại Khiếm Khuyết TCVN'
                  : `Chỉnh Sửa Khiếm Khuyết [${initialData?.code}]`}
              </h3>
              <p className="text-[11px] text-slate-500">
                Quản trị danh mục loại hư hỏng kỹ thuật chuẩn QT03 &amp; QT04
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mã định danh (Code) & Mức độ nghiêm trọng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã kỹ thuật (Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={mode === 'EDIT'}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: ALLIGATOR_CRACK"
                className={`w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg focus:outline-hidden ${
                  mode === 'EDIT'
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-800 border-slate-300 focus:border-brand-gold'
                }`}
                required
              />
              {mode === 'EDIT' && (
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Mã code bất biến theo nguyên tắc FR-36
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức độ mặc định <span className="text-rose-500">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-brand-gold text-slate-800 font-medium"
              >
                <option value={Severity.CRITICAL}>CRITICAL (Đặc biệt nghiêm trọng)</option>
                <option value={Severity.HIGH}>HIGH (Nghiêm trọng cao)</option>
                <option value={Severity.MEDIUM}>MEDIUM (Trung bình)</option>
                <option value={Severity.LOW}>LOW (Nhẹ / Chân chim)</option>
              </select>
            </div>
          </div>

          {/* Tên quy chuẩn & Tiêu chuẩn viện dẫn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên loại hư hỏng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nứt da cá sấu / nứt mai rùa"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-brand-gold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiêu chuẩn viện dẫn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={standardRef}
                onChange={(e) => setStandardRef(e.target.value)}
                placeholder="VD: TCVN 8864:2011 hoặc TCVN 8819:2011"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-brand-gold text-slate-800"
                required
              />
            </div>
          </div>

          {/* Mô tả nhận diện kỹ thuật */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả đặc trưng nhận diện kỹ thuật <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả dấu hiệu nhận diện trên mặt đường, nguyên nhân hình thành và chiều rộng/độ sâu..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:border-brand-gold text-slate-800 resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-amber-400 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>{mode === 'CREATE' ? 'Thêm Vào Danh Mục' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
