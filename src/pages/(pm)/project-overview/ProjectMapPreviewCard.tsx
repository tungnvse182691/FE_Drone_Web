import React, { useRef, useEffect } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMapLibreStyle } from '../../../utils/maplibre'
import { Icon } from '../../../components/ui/Icon'
import { HubProject } from '../projects/types'

import { alignmentService } from '../../../api/services/alignmentService'

interface ProjectMapPreviewCardProps {
  project: HubProject
  basePath: string
  isSupervisor?: boolean
  onNavigate: (path: string) => void
  activeTab?: 'MAINLINE' | 'BRANCHES'
}

export const ProjectMapPreviewCard: React.FC<ProjectMapPreviewCardProps> = ({
  project,
  basePath,
  isSupervisor = false,
  onNavigate,
  activeTab = 'MAINLINE'
}) => {
  const previewMapContainerRef = useRef<HTMLDivElement>(null)
  const previewMapInstanceRef = useRef<maplibregl.Map | null>(null)
  const hasAlignment = project.length_km > 0

  useEffect(() => {
    if (!previewMapContainerRef.current || !hasAlignment) return

    if (previewMapInstanceRef.current) {
      previewMapInstanceRef.current.remove()
      previewMapInstanceRef.current = null
    }

    const alignState = alignmentService.getAlignmentState(project.id)
    if (alignState.status === 'DRAFT' && isSupervisor) return

    const alignData = alignmentService.getAlignmentData(project.id)
    const corridorCoords: [number, number][] =
      alignData.coords && alignData.coords.length >= 2
        ? alignData.coords
        : []

    if (corridorCoords.length < 2) return

    const branchesList = (alignData.branches || []).filter(
      (b: any) => b.coords && Array.isArray(b.coords) && b.coords.length >= 2
    )

    const centerPoint = corridorCoords[Math.floor(corridorCoords.length / 2)]

    const map = new maplibregl.Map({
      container: previewMapContainerRef.current,
      style: getMapLibreStyle('SATELLITE'),
      center: centerPoint,
      zoom: 11,
      minZoom: 6,
      maxZoom: 18,
      pitch: 28
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      // 1. Tuyến chính (Mainline)
      map.addSource('corridor-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: corridorCoords },
          properties: {}
        }
      })

      map.addLayer({
        id: 'corridor-glow',
        type: 'line',
        source: 'corridor-line',
        paint: {
          'line-color': '#C9A227',
          'line-width': 8,
          'line-opacity': activeTab === 'MAINLINE' ? 0.6 : 0.25,
          'line-blur': 3
        }
      })

      map.addLayer({
        id: 'corridor-core',
        type: 'line',
        source: 'corridor-line',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': activeTab === 'MAINLINE' ? 3.5 : 2,
          'line-opacity': activeTab === 'MAINLINE' ? 1.0 : 0.45
        }
      })

      // 2. Tuyến phụ (Branches)
      if (branchesList.length > 0) {
        const branchFeatures = branchesList.map((b: any) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: b.coords
          },
          properties: {
            id: b.id,
            code: b.code,
            name: b.name
          }
        }))

        map.addSource('branches-line', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: branchFeatures
          }
        })

        map.addLayer({
          id: 'branches-glow',
          type: 'line',
          source: 'branches-line',
          paint: {
            'line-color': '#D97706',
            'line-width': 8,
            'line-opacity': activeTab === 'BRANCHES' ? 0.65 : 0.25,
            'line-blur': 3
          }
        })

        map.addLayer({
          id: 'branches-core',
          type: 'line',
          source: 'branches-line',
          paint: {
            'line-color': '#F59E0B',
            'line-width': activeTab === 'BRANCHES' ? 4.0 : 2.5,
            'line-opacity': activeTab === 'BRANCHES' ? 1.0 : 0.45
          }
        })
      }

      // 3. Fit bounds theo activeTab
      const bounds = new maplibregl.LngLatBounds()
      if (activeTab === 'BRANCHES' && branchesList.length > 0) {
        branchesList.forEach((b: any) => {
          b.coords.forEach((c: [number, number]) => bounds.extend(c))
        })
        map.fitBounds(bounds, { padding: 35, duration: 800 })
      } else if (corridorCoords.length >= 2) {
        corridorCoords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 30, duration: 800 })
      }
    })

    previewMapInstanceRef.current = map

    return () => {
      map.remove()
      previewMapInstanceRef.current = null
    }
  }, [hasAlignment, project.id, activeTab])

  // Lấy số lượng nhánh thực tế để hiển thị Legend
  const alignData = alignmentService.getAlignmentData(project.id)
  const branchesCount = (alignData.branches || []).length

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col gap-3 font-body">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-headline">
            <Icon name="map" size={20} className="text-brand-gold" />
            <span>Không gian địa lý &amp; Bản đồ</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Hành lang tim tuyến WGS84 EPSG:4326
          </p>
        </div>
      </div>

      {hasAlignment ? (
        <>
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200">
            <div ref={previewMapContainerRef} className="w-full h-full" />

            {/* Map Legend: Phân biệt Tuyến chính vs Tuyến phụ */}
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-slate-900/85 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-[10px] font-mono border border-slate-700/60 shadow-xs">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${activeTab === 'MAINLINE' ? 'bg-brand-gold ring-1 ring-white' : 'bg-brand-gold/70'}`} />
                <span className={activeTab === 'MAINLINE' ? 'font-bold text-white' : 'text-slate-300'}>Trục chính</span>
              </span>
              {branchesCount > 0 && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${activeTab === 'BRANCHES' ? 'bg-amber-400 ring-1 ring-white' : 'bg-amber-500/70'}`} />
                    <span className={activeTab === 'BRANCHES' ? 'font-bold text-amber-300' : 'text-slate-300'}>Tuyến phụ ({branchesCount})</span>
                  </span>
                </>
              )}
            </div>

            <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded text-[10px] font-mono">
              GPS: WGS84 • UTM 48N
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-brand-gold hover:text-white text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <span>Mở bản đồ GIS chi tiết</span>
            <Icon name="arrow_forward" size={14} />
          </button>
        </>
      ) : (
        <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Icon name="alt_route" size={20} />
          </div>
          <span className="text-xs font-bold text-slate-800">Chưa có hành lang tim tuyến</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {project.status === 'CLOSED'
              ? 'Dự án đã đóng bảo hành và lưu trữ hồ sơ khi chưa phát sinh tim tuyến số.'
              : 'Dự án mới cần PM nạp tọa độ GPX hoặc file CAD/KML ở Bước 2 để hiển thị bản đồ số.'}
          </p>
          {project.status === 'CLOSED' ? (
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1">
              <Icon name="lock" size={13} />
              <span>Hồ sơ đã khóa chỉ đọc</span>
            </span>
          ) : !isSupervisor ? (
            <button
              type="button"
              onClick={() => onNavigate(`${basePath}/projects/${project.id}/alignment`)}
              className="mt-1 px-3 py-1.5 rounded-lg bg-brand-gold hover:bg-brand-goldMuted text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="alt_route" size={14} />
              <span>Thiết lập tim tuyến</span>
            </button>
          ) : (
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              Đang chờ PM nạp tim tuyến
            </span>
          )}
        </div>
      )}
    </div>
  )
}
