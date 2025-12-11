import { useContext } from 'react'
import { AuthContext } from '../context/AuthProvider'
import SiteHeader from '../components/SiteHeader'

export default function Profile() {
  const { user, clearToken } = useContext(AuthContext)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  const doLogout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.warn('Logout request failed', e)
    }
    // clear client-side state
    clearToken()
    window.location.href = '/login'
  }

  return (
    <>
      <SiteHeader />
      <div style={{minHeight:'80vh', padding: 24}}>
        <div style={{maxWidth:720, margin:'0 auto'}}>
          <h1>Profile</h1>
          <div style={{background:'#fff', padding:20, borderRadius:12, boxShadow:'0 8px 24px rgba(15,23,42,0.06)'}}>
            <dl>
              <dt style={{fontWeight:700}}>Email</dt>
              <dd style={{marginBottom:12}}>{user ? user.email : '—'}</dd>

              <dt style={{fontWeight:700}}>Role</dt>
              <dd style={{marginBottom:12}}>{user ? user.role : 'traveler'}</dd>
            </dl>

            <div style={{marginTop:20}}>
              <button onClick={doLogout} style={{padding:'0.75rem 1.25rem', background:'#ef4444', color:'#fff', border:'none', borderRadius:8, cursor:'pointer'}}>Log out</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
