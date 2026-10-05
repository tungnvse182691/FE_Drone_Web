import * as maplibregl from 'maplibre-gl'

export function setupSlabsAndJointsLayers(map: maplibregl.Map) {
  if (!map.getLayer('slabs-outline-shadow')) {
    map.addLayer({
      id: 'slabs-outline-shadow',
      type: 'line',
      source: 'slabs-source',
      paint: {
        'line-color': '#000000',
        'line-width': 2.0,
        'line-opacity': 0.4
      }
    })
  }

  if (!map.getLayer('slabs-outline-layer')) {
    map.addLayer({
      id: 'slabs-outline-layer',
      type: 'line',
      source: 'slabs-source',
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 1.0,
        'line-opacity': 0.75
      }
    })
  }

  if (!map.getLayer('joints-contraction-layer')) {
    map.addLayer({
      id: 'joints-contraction-layer',
      type: 'line',
      source: 'joints-source',
      filter: ['!=', ['get', 'isExpansion'], true],
      paint: {
        'line-color': '#94A3B8',
        'line-width': 1.2,
        'line-dasharray': [1.5, 1.5]
      }
    })
  }

  if (!map.getLayer('joints-expansion-layer')) {
    map.addLayer({
      id: 'joints-expansion-layer',
      type: 'line',
      source: 'joints-source',
      filter: ['get', 'isExpansion'],
      paint: {
        'line-color': '#F59E0B',
        'line-width': 3.5,
        'line-opacity': 0.95
      }
    })
  }

  if (!map.getLayer('edges-dimension-line-layer')) {
    map.addLayer({
      id: 'edges-dimension-line-layer',
      type: 'line',
      source: 'edges-source',
      filter: ['==', ['get', 'isDimensionLine'], true],
      paint: {
        'line-color': '#38BDF8',
        'line-width': 2.0,
        'line-dasharray': [2, 1.5]
      }
    })
  }

  if (!map.getLayer('slabs-label-layer')) {
    map.addLayer({
      id: 'slabs-label-layer',
      type: 'symbol',
      source: 'slabs-source',
      minzoom: 13.5,
      layout: {
        'text-field': ['get', 'code'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 14, 9, 16, 11, 18, 13],
        'text-allow-overlap': false
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#0F172A',
        'text-halo-width': 2.5
      }
    })
  }

  if (!map.getLayer('joints-expansion-label-layer')) {
    map.addLayer({
      id: 'joints-expansion-label-layer',
      type: 'symbol',
      source: 'joints-source',
      filter: ['get', 'isExpansion'],
      minzoom: 12.0,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 11,
        'text-offset': [0, -1.2],
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#F59E0B',
        'text-halo-color': '#0F172A',
        'text-halo-width': 2.5
      }
    })
  }

  if (!map.getLayer('edges-label-layer')) {
    map.addLayer({
      id: 'edges-label-layer',
      type: 'symbol',
      source: 'edges-source',
      filter: ['!=', ['get', 'isDimensionLine'], true],
      minzoom: 11.5,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 11,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': [
          'case',
          ['==', ['get', 'side'], 'LEFT'], '#38BDF8',
          ['==', ['get', 'side'], 'RIGHT'], '#FBBF24',
          '#34D399'
        ],
        'text-halo-color': '#0F172A',
        'text-halo-width': 3.0
      }
    })
  }
}
