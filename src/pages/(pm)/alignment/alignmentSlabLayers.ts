import * as maplibregl from 'maplibre-gl'

export function setupSlabsAndJointsLayers(map: maplibregl.Map) {
  // A transparent hit surface uses the actual polygons; it creates no additional slabs.
  if (!map.getLayer('slabs-fill-layer')) map.addLayer({ id: 'slabs-fill-layer', type: 'fill', source: 'slabs-source', minzoom: 16,
    paint: { 'fill-color': '#0F172A', 'fill-opacity': 0.01 } })

  // 1. Viền đổ bóng dưới đáy tấm bê tông
  if (!map.getLayer('slabs-outline-shadow')) {
    map.addLayer({
      id: 'slabs-outline-shadow',
      type: 'line',
      source: 'slabs-source',
      minzoom: 16,
      maxzoom: 24,
      paint: {
        'line-color': '#000000',
        'line-width': ['interpolate', ['linear'], ['zoom'], 16, 1.6, 21, 3],
        'line-opacity': 0.85
      }
    })
  }

  // 2. Viền chính của từng tấm bê tông
  if (!map.getLayer('slabs-outline-layer')) {
    map.addLayer({
      id: 'slabs-outline-layer',
      type: 'line',
      source: 'slabs-source',
      minzoom: 16,
      maxzoom: 24,
      paint: {
        'line-color': '#FFFFFF',
        'line-width': ['interpolate', ['linear'], ['zoom'], 16, 0.7, 21, 1.2],
        'line-opacity': 0.9
      }
    })
  }

  // 3. Khe co (Contraction Joint)
  if (!map.getLayer('joints-contraction-layer')) {
    map.addLayer({
      id: 'joints-contraction-layer',
      type: 'line',
      source: 'joints-source',
      filter: ['!=', ['get', 'isExpansion'], true],
      minzoom: 14.5,
      maxzoom: 24,
      paint: {
        'line-color': '#94A3B8',
        'line-width': 1.2,
        'line-dasharray': [1.5, 1.5]
      }
    })
  }

  // 4. Khe giãn (Expansion Joint)
  if (!map.getLayer('joints-expansion-layer')) {
    map.addLayer({
      id: 'joints-expansion-layer',
      type: 'line',
      source: 'joints-source',
      filter: ['get', 'isExpansion'],
      minzoom: 14.0,
      maxzoom: 24,
      paint: {
        'line-color': '#F59E0B',
        'line-width': 3.5,
        'line-opacity': 0.95
      }
    })
  }

  // 5. Đường gióng kích thước 2 mép
  if (!map.getLayer('edges-dimension-line-layer')) {
    map.addLayer({
      id: 'edges-dimension-line-layer',
      type: 'line',
      source: 'edges-source',
      filter: ['==', ['get', 'isDimensionLine'], true],
      minzoom: 13,
      maxzoom: 24,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['match', ['get', 'side'], 'LEFT', '#22D3EE', 'RIGHT', '#FB7185', '#FFFFFF'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1, 16, 1.8, 20, 3],
        'line-opacity': 1
      }
    })
  }

  // 6. Nhãn mã tấm bê tông
  if (!map.getLayer('slabs-label-layer')) {
    map.addLayer({
      id: 'slabs-label-layer',
      type: 'symbol',
      source: 'slabs-labels-source',
      minzoom: 18.5,
      maxzoom: 24,
      layout: {
        'symbol-placement': 'point',
        'text-field': ['to-string', ['get', 'sequence']],
        'text-anchor': 'center',
        'text-padding': 2,
        'text-size': ['interpolate', ['linear'], ['zoom'], 18.5, 9, 21.5, 12],
        'text-allow-overlap': false,
        'text-ignore-placement': false
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#0F172A',
        'text-halo-width': 2.5
      }
    })
  }

  // 7. Nhãn khe giãn nở
  if (!map.getLayer('joints-expansion-label-layer')) {
    map.addLayer({
      id: 'joints-expansion-label-layer',
      type: 'symbol',
      source: 'joints-source',
      filter: ['get', 'isExpansion'],
      minzoom: 16.0,
      maxzoom: 24,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 11,
        'text-offset': [0, -1.2],
        'text-allow-overlap': false,
        'text-ignore-placement': false
      },
      paint: {
        'text-color': '#F59E0B',
        'text-halo-color': '#0F172A',
        'text-halo-width': 2.5
      }
    })
  }

  // 8. Nhãn mép đường
  if (!map.getLayer('edges-label-layer')) {
    map.addLayer({
      id: 'edges-label-layer',
      type: 'symbol',
      source: 'edges-source',
      filter: ['!=', ['get', 'isDimensionLine'], true],
      minzoom: 17,
      maxzoom: 24,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 11,
        'text-allow-overlap': false,
        'text-ignore-placement': false
      },
      paint: {
        'text-color': [
          'case',
          ['==', ['get', 'side'], 'LEFT'], '#22D3EE',
          ['==', ['get', 'side'], 'RIGHT'], '#FB7185',
          '#34D399'
        ],
        'text-halo-color': '#0F172A',
        'text-halo-width': 3.0
      }
    })
  }
  // Route strokes stay above the grid; compact slab numbers stay legible in their cells.
  for (const id of ['segments-surface-outline', 'segments-glow-layer', 'segments-dash-layer', 'edges-dimension-line-layer', 'edges-label-layer', 'slabs-label-layer']) if (map.getLayer(id)) map.moveLayer(id)
}

export function setSlabGridVisibility(map: maplibregl.Map, visible: boolean) {
  for (const id of ['slabs-fill-layer', 'slabs-outline-shadow', 'slabs-outline-layer', 'slabs-label-layer', 'joints-contraction-layer', 'joints-expansion-layer', 'joints-expansion-label-layer']) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none')
  }
}

