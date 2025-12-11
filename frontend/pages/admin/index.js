import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthProvider'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

function RoleSelect({ currentRole, onChange, disabled = false }) {
  const roles = ['traveler', 'admin']
  return (
    <select 
      disabled={disabled} 
      value={currentRole} 
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '6px 10px',
        borderRadius: '4px',
        border: '1px solid #d0d0d0',
        backgroundColor: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontFamily: 'inherit'
      }}
    >
      {roles.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  )
}

// Stats card component
function StatsCard({ title, value, icon, color = '#3b82f6' }) {
  return (
    <div style={{
      background: '#fff',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: `2px solid ${color}`,
      flex: 1,
      minWidth: '150px'
    }}>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>{value ?? '—'}</div>
      {icon && <div style={{ fontSize: '20px', marginTop: '8px' }}>{icon}</div>}
    </div>
  )
}

export default function AdminPage() {
  const { user } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [itineraries, setItineraries] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [searchQ, setSearchQ] = useState('')
  const [auditLogs, setAuditLogs] = useState([])
  const [auditPage, setAuditPage] = useState(1)
  const [auditPageSize, setAuditPageSize] = useState(10)
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditActorFilter, setAuditActorFilter] = useState('')
  const [auditTargetFilter, setAuditTargetFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState(null)
  useEffect(() => {
    if (!user) return
    // load users and itineraries
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [uRes, iRes] = await Promise.all([
          fetch(`${apiUrl}/admin/users`, { credentials: 'include' }),
          fetch(`${apiUrl}/admin/itineraries?page=${page}&page_size=${pageSize}${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`, { credentials: 'include' })
        ])
          if (!uRes.ok) throw new Error(`Users fetch failed: ${uRes.status}`)
          if (!iRes.ok) throw new Error(`Itineraries fetch failed: ${iRes.status}`)
        const usersJson = await uRes.json()
        const itinsJson = await iRes.json()
        setUsers(usersJson)
        setItineraries(itinsJson.items || itinsJson)
        setTotal(itinsJson.total || 0)
      } catch (e) {
        console.error('Admin load error', e)
        setError(e.message || String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  // load admin analytics (total itineraries, top destinations)
  useEffect(() => {
    if (!user) return
    const loadAnalytics = async () => {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      try {
        const res = await fetch(`${apiUrl}/analytics/admin/analytics`, { credentials: 'include' })
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || `Status ${res.status}`)
        }
        const json = await res.json()
        setAnalytics(json)
      } catch (e) {
        console.error('Failed to load analytics', e)
        setAnalyticsError(e.message || String(e))
      } finally {
        setAnalyticsLoading(false)
      }
    }
    loadAnalytics()
  }, [user])

  const updateRole = async (userId, newRole) => {
    // confirmation dialog
    const ok = window.confirm(`Change role for user to '${newRole}'?`)
    if (!ok) return

    try {
      const res = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || `Status ${res.status}`)
      }

      const updated = await res.json()
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
    } catch (e) {
      alert('Failed to update role: ' + (e.message || e))
    }
  }

  // load audit logs
  const loadAudits = async () => {
    try {
      const url = `${apiUrl}/admin/role-changes?page=${auditPage}&page_size=${auditPageSize}${auditActorFilter ? `&actor_email=${encodeURIComponent(auditActorFilter)}` : ''}${auditTargetFilter ? `&target_email=${encodeURIComponent(auditTargetFilter)}` : ''}`
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) {
        console.error('Failed to load audits', res.status)
        return
      }
      const json = await res.json()
      setAuditLogs(json.items || [])
      setAuditTotal(json.total || 0)
    } catch (e) {
      console.error('Audit load error', e)
    }
  }

  useEffect(() => {
    if (!user) return
    loadAudits()
  }, [user, auditPage, auditPageSize, auditActorFilter, auditTargetFilter])

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', minHeight: '80vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', color: '#dc2626', fontWeight: 600 }}>Access Denied</div>
          <p style={{ color: '#666', marginTop: '8px' }}>Please log in to view the admin panel.</p>
        </div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div style={{ padding: '40px 20px', minHeight: '80vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', color: '#dc2626', fontWeight: 600 }}>Insufficient Privileges</div>
          <p style={{ color: '#666', marginTop: '8px' }}>You do not have admin access to this panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>Admin Dashboard</h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Manage users, itineraries, and view system analytics</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Analytics Section */}
        {analyticsLoading ? (
          <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', color: '#6b7280' }}>📊 Loading analytics…</div>
        ) : analyticsError ? (
          <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #fca5a5' }}>
            ⚠️ Analytics error: {analyticsError}
          </div>
        ) : analytics ? (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>📊 Analytics Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <StatsCard 
                title="Total Itineraries Generated" 
                value={analytics.total_itineraries_generated}
                icon="✈️"
                color="#10b981"
              />
              <StatsCard 
                title="Top Destination" 
                value={analytics.top_5_destinations?.[0]?.destination}
                icon="🌍"
                color="#3b82f6"
              />
              <StatsCard 
                title="Most Popular Destination Count" 
                value={analytics.top_5_destinations?.[0]?.count}
                icon="📌"
                color="#f59e0b"
              />
            </div>
            
            {analytics.top_5_destinations && analytics.top_5_destinations.length > 0 && (
              <div style={{ marginTop: '24px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: 600 }}>🏆 Top 5 Destinations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {analytics.top_5_destinations.map((d, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      borderLeft: `4px solid ${['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][idx]}`,
                    }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>#{idx + 1}</div>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{d.destination}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{d.count} itineraries</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Users Section */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>👥 Users Management</h2>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                  Total users: <span style={{ color: '#1f2937', fontWeight: 700 }}>{users.length}</span>
                </span>
              </div>
            </div>
            
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Loading users…</div>
            ) : users.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No users found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Email</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Role</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '12px 16px', color: '#1f2937' }}>
                          <div>{u.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: u.role === 'admin' ? '#dbeafe' : '#dcfce7',
                            color: u.role === 'admin' ? '#1e40af' : '#166534'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <RoleSelect
                              currentRole={u.role}
                              onChange={(r) => updateRole(u.id, r)}
                              disabled={u.role === 'admin' && u.email !== user.email}
                            />
                            {u.role === 'admin' && u.email !== user.email && (
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Cannot change other admins</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Itineraries Section */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>📋 Itineraries</h2>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="🔍 Search by title..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d0d0d0',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    flex: 1,
                    minWidth: '200px'
                  }}
                />
                <button
                  onClick={() => { setPage(1); setLoading(true); }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Search
                </button>
                <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                  Total: <span style={{ color: '#1f2937' }}>{total}</span>
                </span>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Loading itineraries…</div>
            ) : itineraries.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No itineraries found.</div>
            ) : (
              <div>
                <div style={{ borderTop: '1px solid #e5e7eb' }}>
                  {itineraries.map((it, idx) => (
                    <div
                      key={it.id}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                        {idx + 1}. {it.title || '(untitled)'}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#6b7280' }}>
                        <span>👤 {it.user_email || it.user_id || '—'}</span>
                        <span>📅 {it.created_at ? new Date(it.created_at).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d0d0d0',
                        borderRadius: '6px',
                        backgroundColor: page <= 1 ? '#f3f4f6' : '#fff',
                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                        opacity: page <= 1 ? 0.5 : 1,
                        fontSize: '14px'
                      }}
                    >
                      ← Prev
                    </button>
                    <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>
                      Page <span style={{ color: '#1f2937' }}>{page}</span>
                    </span>
                    <button
                      disabled={(page * pageSize) >= total}
                      onClick={() => setPage(p => p + 1)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #d0d0d0',
                        borderRadius: '6px',
                        backgroundColor: (page * pageSize) >= total ? '#f3f4f6' : '#fff',
                        cursor: (page * pageSize) >= total ? 'not-allowed' : 'pointer',
                        opacity: (page * pageSize) >= total ? 0.5 : 1,
                        fontSize: '14px'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>Page size:</label>
                    <select
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #d0d0d0',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Audit Log Section */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1f2937' }}>📝 Role Change Audit Log</h2>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  placeholder="Filter by actor email..."
                  value={auditActorFilter}
                  onChange={e => setAuditActorFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d0d0d0',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    flex: 1,
                    minWidth: '180px'
                  }}
                />
                <input
                  placeholder="Filter by target email..."
                  value={auditTargetFilter}
                  onChange={e => setAuditTargetFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d0d0d0',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    flex: 1,
                    minWidth: '180px'
                  }}
                />
                <button
                  onClick={() => { setAuditPage(1); loadAudits(); }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
                >
                  Filter
                </button>
                <span style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                  Total: <span style={{ color: '#1f2937' }}>{auditTotal}</span>
                </span>
              </div>
            </div>

            {auditLogs.length === 0 && !loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No audit logs found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Timestamp</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Actor</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Target</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(a => (
                      <tr
                        key={a.id}
                        style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', color: '#1f2937' }}>
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#1f2937' }}>
                          {a.actor_email || a.actor_id}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#1f2937' }}>
                          {a.target_email || a.target_id}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {a.previous_role} → {a.new_role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  disabled={auditPage <= 1}
                  onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    backgroundColor: auditPage <= 1 ? '#f3f4f6' : '#fff',
                    cursor: auditPage <= 1 ? 'not-allowed' : 'pointer',
                    opacity: auditPage <= 1 ? 0.5 : 1,
                    fontSize: '14px'
                  }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>
                  Page <span style={{ color: '#1f2937' }}>{auditPage}</span>
                </span>
                <button
                  disabled={(auditPage * auditPageSize) >= auditTotal}
                  onClick={() => setAuditPage(p => p + 1)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    backgroundColor: (auditPage * auditPageSize) >= auditTotal ? '#f3f4f6' : '#fff',
                    cursor: (auditPage * auditPageSize) >= auditTotal ? 'not-allowed' : 'pointer',
                    opacity: (auditPage * auditPageSize) >= auditTotal ? 0.5 : 1,
                    fontSize: '14px'
                  }}
                >
                  Next →
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600 }}>Page size:</label>
                <select
                  value={auditPageSize}
                  onChange={e => { setAuditPageSize(Number(e.target.value)); setAuditPage(1); }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #d0d0d0',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
