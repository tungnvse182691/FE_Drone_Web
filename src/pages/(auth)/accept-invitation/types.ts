export type InvitationDemoState = 'valid' | 'expired'

export interface PasswordRules {
  length: boolean
  case: boolean
  special: boolean
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
  barColor: string
}
