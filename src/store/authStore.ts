import { create } from 'zustand'
import { RoleCode } from '../types/enums'
import { User } from '../types/domain'
import { fetchCsrfToken, loginApi, logoutApi, getSessionApi, renewSessionApi, SessionResponse, webLoginErrorMessage, webSessionErrorMessage } from '../api/auth'

interface AuthState {
  user: User | null
  token: null
  csrfToken: string | null
  isAuthenticated: boolean
  mustChangePassword: boolean
  status: 'checking' | 'authenticating' | 'authenticated' | 'anonymous' | 'logging-out' | 'error'
  authError: string | null
  authEpoch: number
  setSession: (session: SessionResponse) => void
  setCsrfToken: (token: string) => void
  loginWithCredentials: (email: string, password: string) => Promise<void>
  checkSession: () => Promise<boolean>
  recoverSession: () => Promise<void>
  ensureCsrfToken: () => Promise<string>
  logout: () => Promise<void>
  expireSession: (message: string) => void
  updateUser: (data: Partial<User>) => void
}

function sessionToUser(session: SessionResponse): User {
  const u = session.user
  const role = u.role === 'SUPERVISOR' ? RoleCode.SUPERVISOR
    : u.role === 'PM' || u.role === RoleCode.PROJECT_MANAGER ? RoleCode.PROJECT_MANAGER : null
  if (!role || !u.id || typeof session.mustChangePassword !== 'boolean') {
    throw new Error('Tài khoản hoặc vai trò không được hỗ trợ trên Web PM/Giám sát.')
  }
  return {
    id: u.id, role, email: u.email || '', username: u.email || '',
    full_name: u.displayName || u.fullName || '', must_change_password: session.mustChangePassword,
  } as User
}

// Only logout intent survives reload. No credential or cached identity is restored.
function loggedOut(): boolean { return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rg_web_logged_out') === '1' }
function lockReload(): void { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('rg_web_logged_out', '1') }
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.removeItem('rg_token')
  sessionStorage.removeItem('rg_user')
}
let authMutation: Promise<unknown> = Promise.resolve()
function serializeAuth<T>(action: () => Promise<T>): Promise<T> {
  const run = () => typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('roadguard-web-auth', action) : action()
  const result = authMutation.then(run, run)
  authMutation = result.catch(() => undefined)
  return result
}
let bootstrap: { epoch: number; promise: Promise<boolean> } | null = null
let recovery: { epoch: number; promise: Promise<void> } | null = null
let csrf: { epoch: number; promise: Promise<string> } | null = null
// Cookies are shared across tabs; invalidate local readers without sharing credentials.
const sessionEvents = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('roadguard-web-session') : null
function assertEpoch(epoch: number): void {
  if (useAuthStore.getState().authEpoch !== epoch) throw new Error('Phiên đã thay đổi; bỏ phản hồi xác thực cũ.')
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, token: null, csrfToken: null, isAuthenticated: false, mustChangePassword: false,
  status: loggedOut() ? 'anonymous' : 'checking', authError: null, authEpoch: 0,

  setSession: session => {
    const user = sessionToUser(session)
    set({ user, isAuthenticated: true, mustChangePassword: user.must_change_password, status: 'authenticated', authError: null })
  },
  setCsrfToken: csrfToken => set({ csrfToken }),

  ensureCsrfToken: async () => {
    const epoch = get().authEpoch
    if (get().csrfToken) return get().csrfToken!
    if (csrf?.epoch === epoch) return csrf.promise
    const promise = fetchCsrfToken().then(data => {
      assertEpoch(epoch)
      if (!data.requestToken || data.headerName !== 'X-CSRF-TOKEN') throw new Error('Không lấy được CSRF token hợp lệ.')
      set({ csrfToken: data.requestToken })
      return data.requestToken
    }).finally(() => { if (csrf?.epoch === epoch) csrf = null })
    csrf = { epoch, promise }
    return promise
  },

  loginWithCredentials: async (email, password) => {
    if (get().status === 'logging-out' || get().status === 'authenticating') throw new Error('Đang xử lý xác thực; vui lòng chờ.')
    const epoch = get().authEpoch + 1
    set({ authEpoch: epoch, user: null, csrfToken: null, isAuthenticated: false, mustChangePassword: false, status: 'authenticating', authError: null })
    sessionEvents?.postMessage('invalidate')
    await serializeAuth(async () => {
      let readingSession = false
      try {
        assertEpoch(epoch)
        const token = await get().ensureCsrfToken()
        assertEpoch(epoch)
        await loginApi({ email, password }, token)
        assertEpoch(epoch)
        readingSession = true
        const session = await getSessionApi()
        assertEpoch(epoch)
        get().setSession(session)
        set({ csrfToken: null })
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('rg_web_logged_out')
        sessionEvents?.postMessage('invalidate')
      } catch (error) {
        if (readingSession && error && typeof error === 'object') Object.assign(error, { authContext: 'session' })
        if (get().authEpoch === epoch) {
          lockReload()
          set({ user: null, isAuthenticated: false, status: 'anonymous', authError: readingSession
            ? webSessionErrorMessage(error as any) : webLoginErrorMessage(error as any) })
        }
        throw error
      }
    })
  },

  recoverSession: async () => {
    const epoch = get().authEpoch
    if (recovery?.epoch === epoch) return recovery.promise
    const expected = get().user
    const promise = (async () => {
      try {
        let session: SessionResponse
        try { session = await getSessionApi() }
        catch (error: any) {
          if (error?.response?.status !== 401) throw error
          session = await serializeAuth(async () => {
            assertEpoch(epoch)
            set({ csrfToken: null })
            const token = await get().ensureCsrfToken()
            assertEpoch(epoch)
            return renewSessionApi(token)
          })
        }
        assertEpoch(epoch)
        let user: User
        try { user = sessionToUser(session) }
        catch (error) {
          get().expireSession('Tài khoản hoặc vai trò không được hỗ trợ trên Web PM/Giám sát.')
          throw error
        }
        if (expected && (expected.id !== user.id || expected.role !== user.role)) {
          get().expireSession('Tài khoản phiên đã thay đổi. Vui lòng đăng nhập lại.')
          throw new Error('Tài khoản phiên đã thay đổi.')
        }
        // Same actor renewal must not invalidate active readers merely by replacing the user object.
        if (!expected || expected.must_change_password !== user.must_change_password) get().setSession(session)
        set({ csrfToken: null })
      } catch (error: any) {
        if (get().authEpoch === epoch) {
          if (error?.response?.status === 401) get().expireSession(webSessionErrorMessage(error))
          else set({ authError: webSessionErrorMessage(error) })
        }
        throw error
      }
    })().finally(() => { if (recovery?.epoch === epoch) recovery = null })
    recovery = { epoch, promise }
    return promise
  },

  checkSession: async () => {
    if (loggedOut()) { set({ status: 'anonymous' }); return false }
    const epoch = get().authEpoch
    if (bootstrap?.epoch === epoch) return bootstrap.promise
    set({ status: 'checking', authError: null })
    const promise = (async () => {
      try {
        await get().recoverSession()
        assertEpoch(epoch)
        set({ status: 'authenticated' })
        return true
      } catch (error: any) {
        if (get().authEpoch === epoch) set({ status: 'error', authError: webSessionErrorMessage(error) })
        return false
      }
    })().finally(() => { if (bootstrap?.epoch === epoch) bootstrap = null })
    bootstrap = { epoch, promise }
    return promise
  },

  expireSession: authError => {
    lockReload()
    set({ authEpoch: get().authEpoch + 1, user: null, csrfToken: null, isAuthenticated: false, mustChangePassword: false, status: 'anonymous', authError })
  },

  logout: async () => {
    if (get().status === 'logging-out') return
    const epoch = get().authEpoch + 1
    lockReload()
    set({ authEpoch: epoch, user: null, csrfToken: null, isAuthenticated: false, mustChangePassword: false, status: 'logging-out', authError: null })
    sessionEvents?.postMessage('invalidate')
    await serializeAuth(async () => {
      let warning: string | null = null
      try {
        assertEpoch(epoch)
        const token = await get().ensureCsrfToken()
        assertEpoch(epoch)
        await logoutApi(token)
      } catch {
        warning = 'Đã khóa phiên trên trình duyệt; chưa xác nhận thu hồi phiên trên máy chủ. Hãy thử đăng xuất lại khi kết nối ổn định.'
      } finally {
        if (get().authEpoch === epoch) set({ user: null, csrfToken: null, isAuthenticated: false, status: 'anonymous', authError: warning })
      }
    })
  },

  updateUser: data => set(state => ({ user: state.user ? { ...state.user, ...data } : null })),
}))

if (sessionEvents) sessionEvents.onmessage = event => {
  if (event.data === 'invalidate') useAuthStore.getState().expireSession('Phiên đã thay đổi ở tab khác. Vui lòng đăng nhập lại.')
}
