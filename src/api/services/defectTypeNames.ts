import { useEffect, useState } from 'react'
import { defectTypeCatalog } from './defectTypeCatalog'
import { useAuthStore } from '../../store/authStore'

/** Nhãn loại khiếm khuyết thống nhất "tên — mã" lấy từ GET /catalog/defect-types (không hardcode tên); luôn gửi BE bằng mã. */
export const defectTypeLabel = (code: string | null | undefined, names: Record<string, string>): string => {
  if (!code) return 'Chưa có dữ liệu'
  const name = names[code]
  return name && name !== code ? `${name} — ${code}` : code
}

let cache: { key: string; names: Record<string, string> } | null = null
let inflight: { key: string; promise: Promise<Record<string, string>> } | null = null

function load(key: string): Promise<Record<string, string>> {
  if (cache?.key === key) return Promise.resolve(cache.names)
  if (inflight?.key === key) return inflight.promise
  const promise = defectTypeCatalog.read().then((rows) => {
    const names = Object.fromEntries(rows.map((r) => [r.code, r.name]))
    if (inflight?.key === key) { cache = { key, names }; inflight = null }
    return names
  }).catch((e) => { if (inflight?.key === key) inflight = null; throw e })
  inflight = { key, promise }
  return promise
}

/** Danh mục chỉ PM đọc được; vai trò khác hoặc lỗi tải → names rỗng (hiển thị mã), không bịa tên. error để hiển thị khi cần. */
export function useDefectTypeNames(): { names: Record<string, string>; error: string } {
  const user = useAuthStore((s) => s.user)
  const epoch = useAuthStore((s) => s.authEpoch)
  const key = `${epoch}:${user?.id}:${user?.role}`
  const [state, setState] = useState<{ key: string; names: Record<string, string>; error: string }>({ key: '', names: {}, error: '' })
  useEffect(() => {
    let live = true
    if (user?.role !== 'PROJECT_MANAGER') { setState({ key, names: {}, error: '' }); return }
    load(key).then((names) => { if (live) setState({ key, names, error: '' }) }).catch((e) => { if (live) setState({ key, names: {}, error: e?.message || 'Không đọc được danh mục loại lỗi.' }) })
    return () => { live = false }
  }, [key, user?.role])
  return state.key === key ? { names: state.names, error: state.error } : { names: {}, error: '' }
}
