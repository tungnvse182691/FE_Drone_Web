import { useRef } from 'react'

/**
 * Chốt in-flight đồng bộ bằng ref (không chờ render lại như state `busy`),
 * chặn double-click / Enter lặp gửi lệnh ghi hai lần.
 * Dùng: `if (!guard.acquire()) return` trước await, `guard.release()` trong finally.
 */
export function useSubmitGuard() {
  const inFlight = useRef(false)
  const guard = useRef({
    acquire: () => {
      if (inFlight.current) return false
      inFlight.current = true
      return true
    },
    release: () => {
      inFlight.current = false
    },
  })
  return guard.current
}
