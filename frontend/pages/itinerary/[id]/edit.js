import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import SiteHeader from '../../../components/SiteHeader'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

export default function EditItinerary() {
  const router = useRouter()
  const { id } = router.query
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`${apiUrl}/itineraries/${id}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.json()
      })
      .then(data => setItinerary(data))
      .catch(e => {
        console.error(e)
        setItinerary(null)
      })
      .finally(() => setLoading(false))
  }, [id, apiUrl])

  const updateTitle = (t) => setItinerary(prev => ({...prev, title: t}))
  const updateDescription = (d) => setItinerary(prev => ({...prev, description: d}))
  const updateDayNote = (index, note) => {
    setItinerary(prev => {
      const copy = {...prev}
      copy.day_plans = Array.isArray(copy.day_plans) ? [...copy.day_plans] : []
      copy.day_plans[index] = {...(copy.day_plans[index]||{}), notes: note}
      return copy
    })
  }

  const doSave = async () => {
    if (!itinerary) return
    setSaving(true)
    try {
      // prepare minimal payload
      const payload = {
        title: itinerary.title,
        description: itinerary.description,
        day_plans: itinerary.day_plans
      }
      const resp = await fetch(`${apiUrl}/itineraries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      if (!resp.ok) {
        const txt = await resp.text()
        alert('Save failed: ' + resp.status + ' ' + txt)
        return
      }
      const updated = await resp.json()
      setItinerary(updated)
      alert('Saved successfully')
      router.push('/saved')
    } catch (e) {
      console.error(e)
      alert('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{padding:20}}>Loading…</div>
  if (!itinerary) return <div style={{padding:20}}>Itinerary not found or you are not authorized.</div>

  return (
    <>
      <SiteHeader />
      <div style={{padding:24, minHeight:'80vh'}}>
        <div style={{maxWidth:900, margin:'0 auto'}}>
        <h1>Edit Itinerary</h1>
        <div style={{background:'#fff', padding:20, borderRadius:12}}>
          <div style={{marginBottom:12}}>
            <label style={{display:'block', fontWeight:700}}>Title</label>
            <input value={itinerary.title||''} onChange={e=>updateTitle(e.target.value)} style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #e6e6e6'}} />
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block', fontWeight:700}}>Description / Notes</label>
            <textarea value={itinerary.description||''} onChange={e=>updateDescription(e.target.value)} style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #e6e6e6'}} rows={4} />
          </div>

          <div style={{marginTop:16}}>
            <h3>Day notes</h3>
            {Array.isArray(itinerary.day_plans) && itinerary.day_plans.map((d, idx) => (
              <div key={idx} style={{marginBottom:12}}>
                <div style={{fontWeight:700}}>Day {d.day || (idx+1)} {d.title ? '— ' + d.title : ''}</div>
                <textarea value={d.notes||''} onChange={e=>updateDayNote(idx, e.target.value)} style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #e6e6e6'}} rows={2} />
              </div>
            ))}
          </div>

          <div style={{marginTop:18, display:'flex', gap:12}}>
            <button onClick={doSave} disabled={saving} style={{padding:'0.75rem 1.25rem', background:'#06b6d4', color:'#fff', border:'none', borderRadius:8}}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button onClick={()=>router.push('/saved')} style={{padding:'0.75rem 1.25rem', borderRadius:8}}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
