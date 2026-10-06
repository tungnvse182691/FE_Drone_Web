import { PasswordRules } from '../../../types/domain'

export type { PasswordRules }

export type InvitationDemoState = 'valid' | 'expired'

export interface PasswordStrength {
  score: number
  label: string
  color: string
  barColor: string
}
