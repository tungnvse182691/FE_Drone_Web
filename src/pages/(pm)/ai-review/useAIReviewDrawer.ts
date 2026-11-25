import { useState } from 'react'
import { TriageCase } from './types'

export interface UseAIReviewDrawerProps {
  selectedCase: TriageCase
}

export const useAIReviewDrawer = (_props: UseAIReviewDrawerProps) => {
  // Modals state (GIS nhúng đã bỏ khỏi màn Hồ sơ thẩm định: GPS đọc theo evidence đang xem)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false)
  const [isPhotoZoomModalOpen, setIsPhotoZoomModalOpen] = useState<boolean>(false)

  return {
    isMergeModalOpen,
    setIsMergeModalOpen,
    isPhotoZoomModalOpen,
    setIsPhotoZoomModalOpen,
  }
}
