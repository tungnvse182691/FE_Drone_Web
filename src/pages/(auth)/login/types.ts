export type LoginViewMode = 'login' | 'force'

export interface PasswordRules {
  length: boolean
  case: boolean
  number: boolean
  special: boolean
}
