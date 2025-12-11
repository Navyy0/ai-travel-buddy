import { useContext } from 'react'
import { AuthContext } from '../context/AuthProvider'

export default function SiteHeader() {
  const { user, clearToken } = useContext(AuthContext)

  return (
    <header style={{background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid rgba(15,23,42,0.06)', padding: '1rem 0', position: 'sticky', top: 0, zIndex: 100}}>
      <div style={{maxWidth:1200, margin:'0 auto', padding: '0 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontSize:18, fontWeight:800}} className="logo">✈️ Trip Planner</div>

        <div style={{display:'flex', alignItems:'center', gap:12}}>
          {user ? (
            <>
              <a href="/saved" style={{padding:'0.45rem 0.8rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, textDecoration:'none'}}>📋 Saved</a>
              {user.role === 'admin' && (
                <a href="/admin" style={{padding:'0.45rem 0.8rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, textDecoration:'none'}}>🛠️ Admin</a>
              )}
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', fontSize:12}}>
                <div style={{color:'var(--text-tertiary)'}}>Welcome</div>
                <div style={{fontWeight:700}}>{user.full_name || user.email}</div>
              </div>
              <button onClick={clearToken} style={{marginLeft:8, padding:'0.45rem 0.8rem', borderRadius:8, border:'1px solid var(--border)'}}>Logout</button>
            </>
          ) : (
            <a href="/login" style={{padding:'0.5rem 0.9rem', background:'var(--primary)', color:'#fff', borderRadius:8, textDecoration:'none'}}>Sign in</a>
          )}
        </div>
      </div>
    </header>
  )
}
