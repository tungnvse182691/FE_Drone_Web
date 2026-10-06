import { useState, useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { SegmentItem } from './types'
import { initAlignmentMapLayers, syncMapDataDirect } from './alignmentMapSetup'

export interface UseAlignmentMapStateParams {
  segments: SegmentItem[]
  currentCoords: [number, number][]
  currentKmPoints: number[]
  selectedSegmentId: string | null
  setSelectedSegmentId: (id: string | null) => void
  showToast: (msg: string) => void
  slabLengthM: number
  slabThicknessCm: number
  contractionSpacingM: number
  expansionSpacingM: number
  expansionGapMm: number
  initialCoords: [number, number][]
  initialStationText: string
}

export function useAlignmentMapState({
  segments,
  currentCoords,
  currentKmPoints,
  selectedSegmentId,
  setSelectedSegmentId,
  showToast,
  slabLengthM,
  slabThicknessCm,
  contractionSpacingM,
  expansionSpacingM,
  expansionGapMm,
  initialCoords,
  initialStationText,
}: UseAlignmentMapStateParams) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)

  const [mapLayer, setMapLayer] = useState<'SATELLITE' | 'VECTOR' | 'PLANNING'>('SATELLITE')
  const [showSlabsAndJoints, setShowSlabsAndJoints] = useState<boolean>(true)
  const [rulerActive, setRulerActive] = useState<boolean>(false)
  const [rulerPoints, setRulerPoints] = useState<[number, number][]>([])

  const [cursorPos, setCursorPos] = useState({
    lng: initialCoords[0] ? initialCoords[0][0] : 108.0825,
    lat: initialCoords[0] ? initialCoords[0][1] : 16.2731,
    station: initialStationText.split(' ')[0],
    elevation: '+14.2m'
  })

  const syncMap = (
    updatedSegs: SegmentItem[],
    selId: string | null = selectedSegmentId,
    coords: [number, number][] = currentCoords,
    kmPts: number[] = currentKmPoints
  ) => {
    syncMapDataDirect(
      mapRef.current,
      updatedSegs,
      selId,
      coords,
      kmPts,
      markersRef,
      setSelectedSegmentId,
      showToast,
      {
        slabLenM: slabLengthM,
        thicknessCm: slabThicknessCm,
        contractionSpacingM,
        expansionSpacingM,
        expansionGapMm
      }
    )
  }

  // Khởi tạo MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapLibreStyle(mapLayer === 'VECTOR' ? 'STREETS' : 'SATELLITE'),
      center: [108.1651, 16.2052],
      zoom: 11.2,
      minZoom: 4,
      maxZoom: 20,
      maxPitch: 60,
      pitch: 32,
      bearing: -18
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('mousemove', (e: maplibregl.MapMouseEvent) => {
      const lng = parseFloat(e.lngLat.lng.toFixed(4))
      const lat = parseFloat(e.lngLat.lat.toFixed(4))
      const t = Math.min(Math.max((lng - 108.0825) / (108.2418 - 108.0825), 0), 1)
      const approxKm = 1020 + t * 25
      const kmMain = Math.floor(approxKm)
      const meters = Math.round((approxKm - kmMain) * 1000)

      setCursorPos({
        lng,
        lat,
        station: `Km ${kmMain}+${String(meters).padStart(3, '0')}`,
        elevation: `+${(12 + t * 8).toFixed(1)}m`
      })
    })

    map.on('click', (e: maplibregl.MapMouseEvent) => {
      if (rulerActive) {
        setRulerPoints((prev) => {
          const next = [...prev, [e.lngLat.lng, e.lngLat.lat] as [number, number]]
          if (next.length === 2) {
            const dLng = next[1][0] - next[0][0]
            const dLat = next[1][1] - next[0][1]
            const distKm = Math.sqrt(dLng * dLng + dLat * dLat) * 111
            showToast(`Thước đo: Cự ly ${distKm >= 1 ? `${distKm.toFixed(2)} km` : `${(distKm * 1000).toFixed(0)} m`}`)
            return []
          }
          return next
        })
      }
    })

    map.on('load', () => {
      initAlignmentMapLayers({
        map,
        segments,
        currentCoords,
        currentKmPoints,
        selectedSegmentId,
        popupRef,
        markersRef,
        onSelectSegmentId: setSelectedSegmentId,
        showToast
      })
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      map.remove()
    }
  }, [])

  // Đồng bộ GeoJSON và Markers khi state thay đổi
  useEffect(() => {
    syncMap(segments, selectedSegmentId, currentCoords, currentKmPoints)
  }, [
    segments,
    selectedSegmentId,
    currentCoords,
    currentKmPoints,
    slabLengthM,
    slabThicknessCm,
    contractionSpacingM,
    expansionSpacingM,
    expansionGapMm
  ])

  // Chuyển đổi lớp bản đồ
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (!map.isStyleLoaded()) return

    if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', mapLayer === 'SATELLITE' || mapLayer === 'PLANNING' ? 'visible' : 'none')
    }
    if (map.getLayer('osm-layer')) {
      map.setLayoutProperty('osm-layer', 'visibility', mapLayer === 'VECTOR' ? 'visible' : 'none')
    }
    if (map.getLayer('planning-corridor-layer')) {
      map.setLayoutProperty('planning-corridor-layer', 'visibility', mapLayer === 'PLANNING' ? 'visible' : 'none')
    }
  }, [mapLayer])

  // Bật/tắt hiển thị Lưới tấm bê tông & Khe nối
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    if (!map.isStyleLoaded()) return

    const slabLayers = [
      'slabs-outline-shadow',
      'slabs-outline-layer',
      'slabs-label-layer',
      'joints-contraction-layer',
      'joints-expansion-layer',
      'joints-expansion-label-layer',
      'edges-dimension-line-layer',
      'edges-label-layer'
    ]

    slabLayers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', showSlabsAndJoints ? 'visible' : 'none')
      }
    })
  }, [showSlabsAndJoints])

  const handleFitBounds = (coords: [number, number][] = currentCoords) => {
    if (mapRef.current) {
      if (coords.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        coords.forEach((c) => bounds.extend(c))
        mapRef.current.fitBounds(bounds, { padding: 60, speed: 1.1 })
      } else {
        mapRef.current.flyTo({
          center: [108.1651, 16.2052],
          zoom: 11.2,
          pitch: 30,
          bearing: -18,
          speed: 1.1
        })
      }
    }
  }

  return {
    mapContainerRef,
    mapRef,
    popupRef,
    markersRef,
    mapLayer,
    setMapLayer,
    showSlabsAndJoints,
    setShowSlabsAndJoints,
    rulerActive,
    setRulerActive,
    setRulerPoints,
    cursorPos,
    setCursorPos,
    syncMap,
    handleFitBounds
  }
}
