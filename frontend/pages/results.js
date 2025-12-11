import { useEffect, useState, useMemo } from 'react'
import MapView from '../components/MapView.jsx'
import ItineraryCard from '../components/ItineraryCard'
import SiteHeader from '../components/SiteHeader'

export default function Results() {
  const [itinerary, setItinerary] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [regenerating, setRegenerating] = useState(false)
  const [packing, setPacking] = useState(null)
  const [packingLoading, setPackingLoading] = useState(false)
  const [packingError, setPackingError] = useState(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  // Load itinerary from session storage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('latest_itinerary')
      if (raw) setItinerary(JSON.parse(raw))
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Derive dayPlans, places and routes using useMemo so effects can depend on them
  // NOTE: These MUST be before any conditional returns (Rules of Hooks)
  const dayPlans = useMemo(() => Array.isArray(itinerary?.day_plans) ? itinerary.day_plans : [], [itinerary])

  const { places, routes } = useMemo(() => {
    const p = []
    const r = []
    let globalOrder = 1
    try {
      dayPlans.forEach(dp => {
        const day = dp.day || 1
        const activities = Array.isArray(dp?.activities) ? dp.activities : []
        activities.forEach(a => {
          const placeInfo = a?.place_info || {}
          const lat = placeInfo?.lat
          const lon = placeInfo?.lon ?? placeInfo?.lng
          if (lat != null && lon != null && typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
            p.push({
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
          if (routeGeometry) r.push({ geometry: routeGeometry, day })
        })
      })
    } catch (e) {
      console.error('Error computing places/routes', e)
    }
    return { places: p, routes: r }
  }, [dayPlans])

  console.log(`Total places found: ${places.length}, Total routes: ${routes.length}`)

  // Automatically fetch packing suggestions based on itinerary and available place coords
  async function fetchPackingSuggestions() {
    setPackingLoading(true)
    setPackingError(null)
    setPacking(null)
    try {
      let lat = null, lon = null
      if (itinerary && itinerary.destination && (itinerary.destination.lat || itinerary.destination.lon)) {
        lat = itinerary.destination.lat || itinerary.destination.latitude || null
        lon = itinerary.destination.lon || itinerary.destination.longitude || null
      }
      if ((lat == null || lon == null) && places.length > 0) {
        lat = places[0].lat
        lon = places[0].lng
      }

      let start = itinerary?.start_date || itinerary?.startDate || null
      let end = itinerary?.end_date || itinerary?.endDate || null
      if (!start || !end) {
        try {
          const firstDay = dayPlans[0]
          const lastDay = dayPlans[dayPlans.length - 1]
          if (firstDay && firstDay.date) start = firstDay.date
          if (lastDay && lastDay.date) end = lastDay.date
        } catch (e) {}
      }

      if (!lat || !lon) {
        setPackingError('No location available for packing suggestions')
        return
      }
      if (!start) start = new Date().toISOString().slice(0,10)
      if (!end) {
        const d = new Date(start)
        d.setDate(d.getDate() + 2)
        end = d.toISOString().slice(0,10)
      }

      const resp = await fetch(`${apiUrl || ''}/weather/packing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { lat: Number(lat), lon: Number(lon) }, start_date: start, end_date: end, use_gemini: true })
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(`Weather API error: ${resp.status} ${txt}`)
      }
      const data = await resp.json()
      if (!data.ok) throw new Error('Invalid response from packing API')
      setPacking(data.data)
    } catch (e) {
      console.error('Packing error', e)
      setPackingError(String(e))
    } finally {
      setPackingLoading(false)
    }
  }

  // Trigger packing fetch when itinerary or places change
  useEffect(() => {
    if (!itinerary) return
    if (packing || packingLoading || packingError) return
    fetchPackingSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itinerary, places.length, places[0]?.lat, places[0]?.lng])

  // Early return if no itinerary loaded
  if (!itinerary) return (
    <div style={{padding:20}}>
      <div style={{maxWidth: 900, margin: '0 auto'}}>
        <div style={{height: 220, borderRadius: 12, background: 'linear-gradient(90deg,#f3f4f6,#e6eef8)', marginBottom: 12}} />
        <div style={{display: 'flex', gap: 12}}>
          <div style={{flex: 1}}>
            <div style={{height: 14, width: '60%', background: '#e6eef8', borderRadius: 6, marginBottom: 8}} />
            <div style={{height: 12, width: '40%', background: '#eef6fb', borderRadius: 6, marginBottom: 8}} />
            <div style={{height: 12, width: '90%', background: '#eef6fb', borderRadius: 6}} />
          </div>
          <div style={{width: 320}}>
            <div style={{height: 40, background: '#e6eef8', borderRadius: 8}} />
          </div>
        </div>
        <p style={{color: '#475569', marginTop: 12}}>No itinerary found. Create one on the <a href="/">planner</a>.</p>
      </div>
    </div>
  )

  async function downloadPdf() {
    setDownloadingPdf(true)
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default
      
      // Create a container with the itinerary content
      const element = document.createElement('div')
      element.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1>${itinerary.title || 'Itinerary'}</h1>
          <p><strong>Destination:</strong> ${itinerary.destination?.place_name || itinerary.destination || 'N/A'}</p>
          <p><strong>Dates:</strong> ${itinerary.start_date || itinerary.startDate || 'N/A'} to ${itinerary.end_date || itinerary.endDate || 'N/A'}</p>
          
          ${(itinerary.day_plans || []).map((day, idx) => `
            <div style="page-break-inside: avoid; margin-top: 20px;">
              <h2>Day ${day.day || idx + 1}</h2>
              ${(day.activities || []).map(activity => `
                <div style="margin-left: 20px; margin-bottom: 15px;">
                  <h3>${activity.title || 'Activity'}</h3>
                  <p><strong>Time:</strong> ${activity.time || 'N/A'}</p>
                  <p><strong>Duration:</strong> ${activity.duration_minutes || activity.duration || 'N/A'} minutes</p>
                  <p><strong>Type:</strong> ${activity.activity_type || activity.activityType || 'N/A'}</p>
                  <p>${activity.description || ''}</p>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `
      
      const options = {
        margin: 10,
        filename: `${(itinerary.title || 'itinerary').replace(/[^a-z0-9]/gi, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      }
      
      html2pdf().set(options).from(element).save()
    } catch (e) {
      console.error('PDF download error', e)
      setSaveMsg('Failed to generate PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <>
      <style jsx>{`
        .results-container {
          --primary: #06b6d4; /* teal/cyan */
          --primary-light: #60a5fa;
          --accent: #f59e0b; /* amber */
          --surface: #ffffff;
          --surface-elevated: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,255,0.98));
          --border: rgba(15, 23, 42, 0.06);
          --border-light: rgba(15,23,42,0.03);
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-tertiary: #6b7280;
          --radius-md: 12px;
          --radius-xl: 18px;
          --shadow-md: 0 6px 18px rgba(8, 20, 40, 0.06);
          --shadow-lg: 0 12px 30px rgba(8, 20, 40, 0.08);

          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #fef3c7 100%);
          padding: 2rem;
          color: var(--text-primary);
        }

        .results-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .results-header {
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
          margin-bottom: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1rem;
          align-items: start;
        }

        /* Itinerary card container (left) */
        .results-header > :global(.itinerary-card),
        .results-header > :global(.itinerary-card *) {
          /* allow ItineraryCard to inherit nice spacing */
        }

        /* Actions column */
        .header-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: stretch;
          margin-top: 0.25rem;
        }

        .btn-primary {
          padding: 0.85rem 1.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: var(--shadow-md);
        }

        .btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-secondary {
          padding: 0.75rem 1rem;
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .save-message {
          padding: 0.6rem 0.85rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16,185,129,0.18);
          border-radius: 10px;
          color: #059669;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
        }

        .save-message.error { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.12); color: #ef4444; }

        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); text-decoration: none; font-size: 0.95rem; margin-top: 0.8rem; }
        .back-link:hover { color: var(--primary); }

        .map-section {
          background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95));
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
          margin-top: 1.5rem;
        }

        .map-header { margin-bottom: 1rem; font-size: 0.95rem; color: var(--text-secondary); }

        .warning-box { padding: 1.25rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245,158,11,0.14); border-radius: 12px; margin-bottom: 1rem; }
        .warning-box strong { display:block; color: var(--text-primary); margin-bottom:0.5rem }

        /* Small decorative day pill for list items */
        .day-pill { display:inline-block; padding:6px 10px; border-radius:999px; font-weight:700; color:#fff; font-size:0.85rem }
        .day-pill.day-1 { background: linear-gradient(90deg,#06b6d4,#60a5fa) }
        .day-pill.day-2 { background: linear-gradient(90deg,#10b981,#34d399) }
        .day-pill.day-3 { background: linear-gradient(90deg,#f59e0b,#fb923c) }
        .day-pill.day-4 { background: linear-gradient(90deg,#ef4444,#fb7185) }
        .day-pill.day-5 { background: linear-gradient(90deg,#f97316,#fb923c) }

        /* Responsive adjustments */
        @media (max-width: 880px) {
          .results-header { grid-template-columns: 1fr; }
          .header-actions { flex-direction: row; justify-content: space-between; align-items: center; }
          .header-actions > button { flex: 1; }
        }

      `}</style>

      <SiteHeader />
      <div className="results-container">
        <div className="results-content">
          <div className="results-header">
            <ItineraryCard itinerary={itinerary} />
            <div className="header-actions">
              <button 
                disabled={saving} 
                onClick={async () => {
                  try {
                    setSaveMsg(null)
                    setSaving(true)
                    const headers = { 'Content-Type': 'application/json' }
                    // Use cookie-based authentication; include credentials so HttpOnly cookie is sent
                    const resp = await fetch(`${apiUrl}/itineraries`, {
                      method: 'POST',
                      headers: headers,
                      body: JSON.stringify(itinerary),
                      credentials: 'include'
                    })
                    if (!resp.ok) {
                      const txt = await resp.text()
                      setSaveMsg(`Save failed: ${resp.status} ${txt}`)
                    } else {
                      const saved = await resp.json()
                      setSaveMsg('✓ Saved successfully!')
                      if (saved && (saved.id || saved._id)) {
                        const id = saved.id || saved._id
                        sessionStorage.setItem('latest_saved_itinerary_id', id)
                      }
                    }
                  } catch (e) {
                    console.error(e)
                    setSaveMsg('Network error saving itinerary')
                  } finally {
                    setSaving(false)
                  }
                }}
                className="btn-primary"
              >
                {saving ? 'Saving…' : '💾 Save Itinerary'}
              </button>
              <button
                onClick={async () => {
                  // Regenerate the itinerary using the last generation payload
                  try {
                    setRegenerating(true)
                    setSaveMsg(null)
                    const rawPayload = sessionStorage.getItem('latest_generation_payload')
                    let payload = null
                    if (rawPayload) {
                      payload = JSON.parse(rawPayload)
                    } else {
                      // Try to derive a minimal payload from the displayed itinerary
                      payload = {
                        destination: itinerary.destination || itinerary.title || '',
                        start_date: itinerary.start_date || itinerary.startDate || '',
                        end_date: itinerary.end_date || itinerary.endDate || '',
                        preferences: itinerary.preferences || []
                      }
                    }

                    if (!payload || !payload.destination) {
                      setSaveMsg('No generation payload available to regenerate')
                      return
                    }

                    const resp = await fetch(`${apiUrl}/generate`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                      credentials: 'include'
                    })

                    if (!resp.ok) {
                      const txt = await resp.text()
                      setSaveMsg(`Regenerate failed: ${resp.status} ${txt}`)
                      return
                    }

                    const newItin = await resp.json()
                    sessionStorage.setItem('latest_itinerary', JSON.stringify(newItin))
                    // update latest payload too
                    try { sessionStorage.setItem('latest_generation_payload', JSON.stringify(payload)) } catch(e){}
                    setItinerary(newItin)
                    setSaveMsg('✓ Regenerated successfully')
                  } catch (e) {
                    console.error('Regenerate error', e)
                    setSaveMsg('Network error during regenerate')
                  } finally {
                    setRegenerating(false)
                  }
                }}
                className="btn-secondary"
              >
                {regenerating ? 'Regenerating…' : '🔁 Regenerate'}
              </button>
              <button 
                onClick={downloadPdf}
                className="btn-secondary"
                disabled={downloadingPdf}
              >
                {downloadingPdf ? 'Generating PDF…' : '📄 Download PDF'}
              </button>
              {saveMsg && (
                <div className={`save-message ${saveMsg.includes('failed') || saveMsg.includes('error') ? 'error' : ''}`}>
                  {saveMsg}
                </div>
              )}
            </div>
            <a href="/" className="back-link">
              ← Back to Planner
            </a>
          </div>

          {/* Packing suggestions panel */}
          <div style={{marginTop: 12, marginBottom: 12}}>
            {packingLoading && <div style={{padding:12, borderRadius:8, background:'#f8fafc'}}>Loading packing suggestions…</div>}
            {packingError && <div style={{padding:12, borderRadius:8, background:'#fff1f2', color:'#b91c1c'}}>{packingError}</div>}
            {packing && (
              <div style={{padding:16, borderRadius:8, background:'#ffffff', border:'1px solid rgba(15,23,42,0.06)', boxShadow:'0 6px 18px rgba(8, 20, 40, 0.06)'}}>
                <strong style={{fontSize:'1.1rem'}}>📦 Packing Suggestions</strong>
                <div style={{marginTop:12}}>
                  {packing.suggested_items && packing.suggested_items.length ? (
                    <>
                      <div style={{marginBottom:12}}>
                        {packing.suggested_items.map((it) => (
                          <div key={it} style={{display:'inline-block', padding:'6px 12px', background:'#e0f2fe', borderRadius:'6px', marginRight:'8px', marginBottom:'8px', fontSize:'0.9rem'}}>
                            ✓ {it}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div>No suggestions available.</div>
                  )}
                  {packing.enriched_text && (
                    <div style={{marginTop:12, whiteSpace:'pre-wrap', color:'#334155', fontSize:'0.95rem', lineHeight:'1.6'}}>{packing.enriched_text}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="map-section">
            {places.length === 0 ? (
              <div className="warning-box">
                <strong>No places found on map</strong>
                <p>
                  The itinerary activities don't have location coordinates. This might happen if:
                </p>
                <ul>
                  <li>Location search failed during itinerary generation</li>
                  <li>Activities don't have valid location information</li>
                </ul>
                <p style={{marginTop: '0.75rem', fontSize: '0.85em', color: 'var(--text-tertiary)'}}>
                  Check the browser console (F12) for detailed debugging information.
                </p>
              </div>
            ) : (
              <div className="map-header">
                Showing {places.length} place{places.length !== 1 ? 's' : ''} on map
              </div>
            )}
            <MapView places={places} routes={routes} height={500} />
          </div>
        </div>
      </div>
    </>
  )
}
