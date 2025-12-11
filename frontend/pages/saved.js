import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ItineraryCard from '../components/ItineraryCard'
import MapView from '../components/MapView.jsx'
import SiteHeader from '../components/SiteHeader'

export default function Saved() {
  const router = useRouter()
  const [items, setItems] = useState(null)
  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  const deleteItinerary = async (id) => {
    const ok = window.confirm('Delete this itinerary? This cannot be undone.')
    if (!ok) return
    try {
      const res = await fetch(`${apiUrl}/itineraries/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const txt = await res.text()
        alert('Delete failed: ' + (txt || res.status))
        return
      }
      setItems(prev => Array.isArray(prev) ? prev.filter(i => (i.id || i._id) !== id) : prev)
      if (selectedItinerary && (selectedItinerary.id || selectedItinerary._id) === id) setSelectedItinerary(null)
    } catch (e) {
      console.error('Delete failed', e)
      alert('Network error while deleting')
    }
  }

  useEffect(() => {
    // Attempt to fetch saved itineraries using cookie-based auth
    fetch(`${apiUrl}/itineraries`, { credentials: 'include' })
      .then(r => {
        if (r.status === 401) {
          router.replace('/login')
          return []
        }
        return r.json()
      })
      .then(data => setItems(data || []))
      .catch(() => setItems([]))
  }, [router, apiUrl])

  return (
    <>
      <style jsx>{`
        .saved-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem;
        }

        .saved-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .saved-header {
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
          margin-bottom: 2rem;
        }

        .saved-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .saved-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .back-btn {
          padding: 0.75rem 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .back-btn:hover {
          background: var(--border-light);
          border-color: var(--border);
        }

        .itinerary-detail {
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }

        .itinerary-list {
          display: grid;
          gap: 1rem;
        }

        .itinerary-item {
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .itinerary-item:hover {
          background: var(--surface);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .itinerary-item-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .itinerary-item-destination {
          color: var(--text-secondary);
          margin: 0 0 0.75rem 0;
          font-size: 0.9375rem;
        }

        .itinerary-item-description {
          color: var(--text-tertiary);
          font-size: 0.9em;
          margin: 0 0 1rem 0;
          line-height: 1.5;
        }

        .itinerary-item-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.85em;
          color: var(--text-tertiary);
        }

        .itinerary-item-hint {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: var(--primary);
          font-weight: 500;
        }

        .loading-state,
        .empty-state {
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }

        .loading-state {
          color: var(--text-secondary);
          font-size: 1.125rem;
        }

        .empty-state-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-state-text {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .empty-state-link {
          display: inline-block;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-md);
        }

        .empty-state-link:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .map-container {
          margin-top: 2rem;
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }

        @media (max-width: 768px) {
          .saved-container {
            padding: 1rem;
          }

          .saved-header,
          .itinerary-detail {
            padding: 1.5rem;
          }

          .itinerary-item-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>

      <SiteHeader />
      <div className="saved-container">
        <div className="saved-content">
          {!items ? (
            <div className="loading-state">
              <div style={{display:'grid', gap:12}}>
                <div style={{height:18, width:'40%', background:'#eef2ff', borderRadius:8}} />
                <div style={{height:120, background:'#f8fafc', borderRadius:12}} />
                <div style={{height:120, background:'#f8fafc', borderRadius:12}} />
              </div>
            </div>
          ) : !items.length ? (
            <div className="empty-state">
              <h2 className="empty-state-title">No Saved Itineraries</h2>
              <p className="empty-state-text">
                You haven't saved any itineraries yet. Create your first trip plan to get started!
              </p>
              <a href="/" className="empty-state-link">
                Create New Itinerary
              </a>
            </div>
          ) : selectedItinerary ? (() => {
            // Extract places and routes for map
            const places = []
            const routes = []
            let globalOrder = 1
            const dayPlans = Array.isArray(selectedItinerary.day_plans) ? selectedItinerary.day_plans : []
            dayPlans.forEach(dp => {
              const day = dp.day || 1
              const activities = Array.isArray(dp?.activities) ? dp.activities : []
              activities.forEach(a => {
                const placeInfo = a?.place_info || {}
                const lat = placeInfo.lat
                const lon = placeInfo.lon || placeInfo.lng
                
                if (lat != null && lon != null && typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
                  places.push({
                    lat: lat,
                    lng: lon,
                    name: placeInfo.place_name || placeInfo.name || a.title || 'Unknown',
                    title: a.title,
                    day: day,
                    order: globalOrder++,
                    activityType: a.activity_type || a.activityType || 'other',
                    time: a.time,
                    duration: a.duration_minutes || a.duration,
                    description: a.description
                  })
                }
                
                const travel = a?.travel_from_previous || {}
                const routeGeometry = travel.route_geojson || travel.route
                if (routeGeometry) {
                  routes.push({
                    geometry: routeGeometry,
                    day: day
                  })
                }
              })
            })

            return (
              <div className="itinerary-detail">
                <button onClick={() => setSelectedItinerary(null)} className="back-btn">
                  ← Back to List
                </button>
                <ItineraryCard itinerary={selectedItinerary} />
                <div className="map-container">
                  <MapView places={places} routes={routes} height={500} />
                </div>
              </div>
            )
          })() : (
            <>
              <div className="saved-header">
                <h1 className="saved-title">Saved Itineraries</h1>
                <p className="saved-subtitle">Your travel plans at a glance</p>
              </div>
              <div className="itinerary-list">
                {items.map(it => {
                  const id = it.id || it._id
                  return (
                    <div 
                      key={id}
                      onClick={() => setSelectedItinerary(it)}
                      className="itinerary-item"
                    >
                      <h3 className="itinerary-item-title">{it.title || 'Untitled Itinerary'}</h3>
                      <p className="itinerary-item-destination">
                        📍 {it.destination || 'No destination specified'}
                      </p>
                      {it.description && (
                        <p className="itinerary-item-description">
                          {it.description.substring(0, 150)}{it.description.length > 150 ? '...' : ''}
                        </p>
                      )}
                      <div className="itinerary-item-meta">
                        {it.created_at && (
                          <span>Created: {new Date(it.created_at).toLocaleDateString()}</span>
                        )}
                        {it.day_plans && Array.isArray(it.day_plans) && (
                          <span>{it.day_plans.length} day{it.day_plans.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
                        <div className="itinerary-item-hint">Click to view details →</div>
                        <div style={{display:'flex', gap:8, alignItems:'center'}}>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/itinerary/${id}/edit`) }}
                            style={{background:'#0ea5e9', border:'none', color:'#fff', padding:'6px 10px', borderRadius:6, cursor:'pointer'}}
                            aria-label={`Edit itinerary ${id}`}
                          >
                            Edit
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteItinerary(id); }} style={{background:'transparent', border:'none', color:'#ef4444', cursor:'pointer'}}>Delete</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
