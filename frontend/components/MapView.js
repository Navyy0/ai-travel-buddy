import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function MapView({ places = [], height = 400, routes = [] }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://demotiles.maplibre.org/style.json'

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: places.length > 0 ? [places[0].lon || places[0].lng, places[0].lat] : [0, 0],
      zoom: 12,
    })

    places.forEach((place, index) => {
      const lat = place.lat
      const lon = place.lon || place.lng
      if (lat && lon) {
        const el = document.createElement('div')
        el.className = 'marker'
        el.style.width = '20px'
        el.style.height = '20px'
        el.style.background = '#007bff'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid #fff'

        new maplibregl.Marker(el)
          .setLngLat([lon, lat])
          .setPopup(new maplibregl.Popup().setHTML(`<div><strong>${place.name || place.place_name || 'Place ' + (index + 1)}</strong></div>`))
          .addTo(map.current)
      }
    })

    // Add route lines if provided
    map.current.on('load', () => {
      routes.forEach((route, idx) => {
        if (route && route.geometry) {
          const sourceId = `route-${idx}`
          const layerId = `route-layer-${idx}`
          if (!map.current.getSource(sourceId)) {
            map.current.addSource(sourceId, { type: 'geojson', data: route.geometry })
          }
          if (!map.current.getLayer(layerId)) {
            map.current.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              paint: { 'line-color': '#007bff', 'line-width': 3, 'line-opacity': 0.8 },
            })
          }
        }
      })
    })

    return () => {
      if (map.current) map.current.remove()
    }
  }, [places, routes, styleUrl])

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: height, border: '1px solid #ccc' }}
    />
  )
}
