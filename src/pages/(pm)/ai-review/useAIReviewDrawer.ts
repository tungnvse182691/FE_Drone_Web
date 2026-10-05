import { useState, useRef, useEffect } from 'react'
import { TriageCase } from './types'
import { initReviewGisModalMap, initReviewDrawerMap } from './reviewMapSetup'

export interface UseAIReviewDrawerProps {
  selectedCase: TriageCase
}

export const useAIReviewDrawer = ({ selectedCase }: UseAIReviewDrawerProps) => {
  // View Mode for right drawer photo card: 'PHOTO' or 'GIS_MAP'
  const [detailViewMode, setDetailViewMode] = useState<'PHOTO' | 'GIS_MAP'>('PHOTO')
  const [modalMapType, setModalMapType] = useState<'SATELLITE' | 'STREET'>('SATELLITE')

  // Modals state
  const [isGISModalOpen, setIsGISModalOpen] = useState<boolean>(false)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false)
  const [isPhotoZoomModalOpen, setIsPhotoZoomModalOpen] = useState<boolean>(false)

  // Refs for MapLibre map containers
  const modalMapContainerRef = useRef<HTMLDivElement>(null)
  const drawerMapContainerRef = useRef<HTMLDivElement>(null)

  // Effect: Khởi tạo MapLibre trong Modal GIS Preview
  useEffect(() => {
    if (!isGISModalOpen || !modalMapContainerRef.current) return
    const { cleanup } = initReviewGisModalMap(
      modalMapContainerRef.current,
      selectedCase,
      modalMapType === 'SATELLITE'
    )
    return () => cleanup()
  }, [isGISModalOpen, selectedCase, modalMapType])

  // Effect: Khởi tạo MapLibre mini trong panel Drawer khi người dùng bấm tab Bản đồ
  useEffect(() => {
    if (detailViewMode !== 'GIS_MAP' || !drawerMapContainerRef.current) return
    const { cleanup } = initReviewDrawerMap(drawerMapContainerRef.current, selectedCase)
    return () => cleanup()
  }, [detailViewMode, selectedCase])

  return {
    detailViewMode,
    setDetailViewMode,
    modalMapType,
    setModalMapType,
    isGISModalOpen,
    setIsGISModalOpen,
    isMergeModalOpen,
    setIsMergeModalOpen,
    isPhotoZoomModalOpen,
    setIsPhotoZoomModalOpen,
    modalMapContainerRef,
    drawerMapContainerRef
  }
}
