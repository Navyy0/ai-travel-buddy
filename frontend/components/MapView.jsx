import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Color palette for different days
const DAY_COLORS = [
  '#0d6efd', // Day 1 - Blue
  '#198754', // Day 2 - Green
  '#ffc107', // Day 3 - Yellow/Orange
  '#dc3545', // Day 4 - Red
  '#fd7e14', // Day 5 - Orange
  '#20c997', // Day 6 - Teal
  '#0dcaf0', // Day 7 - Cyan
  '#fd6f61', // Day 8 - Coral
  '#17a2b8', // Day 9 - Cyan (alternate)
  '#6c757d', // Day 10+ - Gray
]

// Activity type colors
const ACTIVITY_COLORS = {
  sightseeing: '#007bff',  // Blue
  accommodation: '#28a745', // Green
  restaurant: '#ffc107',    // Orange/Yellow
  other: '#6c757d',         // Gray
}

// Get color for activity type
function getActivityColor(activityType) {
  return ACTIVITY_COLORS[activityType?.toLowerCase()] || ACTIVITY_COLORS.other
}

// Get color for day
function getDayColor(day) {
  const dayNum = typeof day === 'number' ? day : parseInt(day) || 1
  return DAY_COLORS[(dayNum - 1) % DAY_COLORS.length]
}

export default function MapView({ places = [], height = 400, routes = [] }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [selectedDay, setSelectedDay] = useState(null)
  // Use free MapLibre style - data from backend (which uses Ola)
  const styleUrl = 'https://demotiles.maplibre.org/style.json'

  useEffect(() => {
    if (!mapContainer.current) return

    // Clean up previous map instance (defensive: some map builds expose `remove` or `destroy`)
    if (map.current) {
      if (typeof map.current.remove === 'function') {
        try {
          map.current.remove()
        } catch (err) {
          console.warn('MapView: error while removing previous map instance', err)
        }
      } else if (typeof map.current.destroy === 'function') {
        try {
          map.current.destroy()
        } catch (err) {
          console.warn('MapView: error while destroying previous map instance', err)
        }
      }
      map.current = null
    }

    // Filter valid places with coordinates and apply day filter
    let validPlaces = places.filter(p => {
      const lat = p.lat
      const lon = p.lon || p.lng
      return lat != null && lon != null && !isNaN(lat) && !isNaN(lon)
    })

    // Apply day filter if selected
    if (selectedDay !== null) {
      validPlaces = validPlaces.filter(p => (p.day || 1) === selectedDay)
    }

    if (validPlaces.length === 0) {
      // If no valid places, show default map
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [0, 0],
        zoom: 2,
      })
      return () => {
        if (map.current) {
          if (typeof map.current.remove === 'function') {
            try { map.current.remove() } catch (err) { console.warn('MapView cleanup error', err) }
          } else if (typeof map.current.destroy === 'function') {
            try { map.current.destroy() } catch (err) { console.warn('MapView cleanup error', err) }
          }
        }
      }
    }

    // Calculate bounds to fit all places
    const lons = validPlaces.map(p => p.lon || p.lng)
    const lats = validPlaces.map(p => p.lat)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [(minLon + maxLon) / 2, (minLat + maxLat) / 2],
      zoom: 10,
    })

    // Function to add markers and routes
    const addMarkersAndRoutes = () => {
      console.log('MapView: Adding markers for', validPlaces.length, 'places')
      console.log('MapView: Places data:', validPlaces)
      
      if (validPlaces.length === 0) {
        console.warn('MapView: No valid places to display on map!')
        return
      }
      
      // Add markers for each place with enhanced styling
      validPlaces.forEach((place, index) => {
        const lat = place.lat
        const lon = place.lon || place.lng
        console.log(`MapView: Processing place ${index + 1}: "${place.name}" at (${lat}, ${lon})`)
        
        if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
          const order = place.order || index + 1
          const day = place.day || 1
          const activityType = place.activityType || place.activity_type || 'other'
          const dayColor = getDayColor(day)
          const activityColor = getActivityColor(activityType)
          
          // Use activity color for marker
          const markerColor = activityColor
          
          // Create numbered marker
          const el = document.createElement('div')
          el.className = 'marker'
          el.style.width = '32px'
          el.style.height = '32px'
          el.style.background = markerColor
          el.style.borderRadius = '50%'
          el.style.border = '3px solid #fff'
          el.style.cursor = 'pointer'
          el.style.display = 'flex'
          el.style.alignItems = 'center'
          el.style.justifyContent = 'center'
          el.style.fontSize = '12px'
          el.style.fontWeight = 'bold'
          el.style.color = '#fff'
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
          el.textContent = order
          el.title = `${place.name || 'Place'} (Day ${day})`

          // Build enhanced popup content
          const popupContent = `
            <div style="min-width: 200px; padding: 4px;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: ${dayColor};">
                Day ${day} - Stop ${order}
              </div>
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">
                ${place.name || place.place_name || 'Unknown Place'}
              </div>
              ${place.title ? `<div style="color: #666; font-size: 12px; margin-bottom: 4px;">${place.title}</div>` : ''}
              ${place.time ? `<div style="color: #888; font-size: 11px; margin-bottom: 2px;">⏰ ${place.time}</div>` : ''}
              ${place.duration ? `<div style="color: #888; font-size: 11px; margin-bottom: 2px;">⏱️ ${place.duration} min</div>` : ''}
              ${place.description ? `<div style="color: #666; font-size: 11px; margin-top: 6px; max-height: 60px; overflow-y: auto;">${place.description}</div>` : ''}
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee; font-size: 10px; color: #999;">
                Type: ${activityType.charAt(0).toUpperCase() + activityType.slice(1)}
              </div>
            </div>
          `

          new maplibregl.Marker(el)
            .setLngLat([lon, lat])
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupContent))
            .addTo(map.current)
        }
      })

      // Filter routes by selected day if filter is active
      const filteredRoutes = selectedDay !== null 
        ? routes.filter(r => (r.day || 1) === selectedDay)
        : routes

      // Add route lines if provided (color-coded by day)
      filteredRoutes.forEach((route, idx) => {
        if (route && (route.geometry || route)) {
          const sourceId = 'route-' + idx
          const layerId = 'route-layer-' + idx
          const geometry = route.geometry || route
          const day = route.day || 1
          const routeColor = getDayColor(day)
          const opacity = 0.8
          
          if (!map.current.getSource(sourceId)) {
            map.current.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: geometry,
              },
            })
          }

          if (!map.current.getLayer(layerId)) {
            map.current.addLayer({
              id: layerId,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': routeColor,
                'line-width': 4,
                'line-opacity': opacity,
              },
            })
          } else {
            // Update existing layer color/opacity
            map.current.setPaintProperty(layerId, 'line-color', routeColor)
            map.current.setPaintProperty(layerId, 'line-opacity', opacity)
          }
        }
      })

      // Fit map to show all markers
      if (validPlaces.length > 1) {
        const bounds = new maplibregl.LngLatBounds()
        validPlaces.forEach(p => {
          bounds.extend([p.lon || p.lng, p.lat])
        })
        map.current.fitBounds(bounds, { padding: 50 })
      } else if (validPlaces.length === 1) {
        // If only one place, center on it
        const p = validPlaces[0]
        map.current.setCenter([p.lon || p.lng, p.lat])
        map.current.setZoom(14)
      }
    }

    // Wait for map to load before adding markers and routes (defensive checks)
    if (map.current && typeof map.current.loaded === 'function' && map.current.loaded()) {
      // Map already loaded, add markers immediately
      addMarkersAndRoutes()
    } else if (map.current && typeof map.current.on === 'function') {
      // Map not loaded yet, wait for load event
      map.current.on('load', addMarkersAndRoutes)
    }

    return () => {
      // Cleanup: remove event listener and destroy/remove map instance
      try {
        if (map.current && typeof map.current.off === 'function') {
          map.current.off('load', addMarkersAndRoutes)
        }
      } catch (err) {
        console.warn('MapView: error while removing load listener', err)
      }

      if (map.current) {
        if (typeof map.current.remove === 'function') {
          try { map.current.remove() } catch (err) { console.warn('MapView cleanup error', err) }
        } else if (typeof map.current.destroy === 'function') {
          try { map.current.destroy() } catch (err) { console.warn('MapView cleanup error', err) }
        }
        map.current = null
      }
    }
  }, [places, routes, styleUrl, selectedDay])

  // Get unique days for legend
  const uniqueDays = [...new Set(places.map(p => p.day || 1))].sort((a, b) => a - b)

  return (
    <div style={{ position: 'relative' }}>
      {/* Day Filter Toggle */}
      {uniqueDays.length > 1 && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          background: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>Filter by Day:</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
            <button
              onClick={() => setSelectedDay(null)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: selectedDay === null ? '2px solid #007bff' : '1px solid #ddd',
                background: selectedDay === null ? '#007bff' : 'white',
                color: selectedDay === null ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              All Days
            </button>
            {uniqueDays.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  border: `2px solid ${getDayColor(day)}`,
                  background: selectedDay === day ? getDayColor(day) : 'white',
                  color: selectedDay === day ? 'white' : getDayColor(day),
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '11px'
      }}>
        <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>Activity Types:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ACTIVITY_COLORS.sightseeing }}></div>
            <span>Sightseeing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ACTIVITY_COLORS.accommodation }}></div>
            <span>Accommodation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ACTIVITY_COLORS.restaurant }}></div>
            <span>Restaurant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: ACTIVITY_COLORS.other }}></div>
            <span>Other</span>
          </div>
        </div>
      </div>

      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: height,
          border: '1px solid #ccc',
        }}
      />
    </div>
  )
}
