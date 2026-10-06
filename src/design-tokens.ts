/**
 * Design Tokens — Single Source of Truth được cấu hình tại tailwind.config.js
 * File này re-export các giá trị để tương thích với tài liệu & hướng dẫn thiết kế.
 */

export const colors = {
  primary: '#C9A227', // Vàng đồng Hoàng Hải
  primaryDark: '#6B5219',
  brandGold: '#8C6D1F',
  secondary: '#2D3748', // Slate / Navy
  neutral: '#1A1D20', // Đen chữ chính
  surface: '#FFFFFF',
  surfaceAlt: '#F8F9FA', // Nền trang web xám nhạt
  onPrimary: '#FFFFFF',
  onSurface: '#1A1D20',
  border: '#E2E5E9',
  success: '#2F9E44',
  warning: '#F59E0B',
  error: '#E5484D',
  info: '#3B82F6',
} as const

export const typography = {
  fontSans: 'Roboto, sans-serif',
  fontHeadline: 'Sansation, Roboto, sans-serif',
} as const
