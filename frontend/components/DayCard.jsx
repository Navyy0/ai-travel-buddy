export default function DayCard({ dayPlan }) {
  return (
    <div style={{borderTop: '1px solid #f1f1f1', paddingTop:12, marginTop:12}}>
      <h3>Day {dayPlan.day} — {dayPlan.title}</h3>
      <p>{dayPlan.theme}</p>
      <ul>
        {(dayPlan.activities || []).map((a, i) => (
          <li key={i} style={{marginBottom:8}}>
            <strong>{a.time} — {a.title}</strong>
            <div style={{fontSize:13}}>{a.description}</div>
            {(() => {
              const usd = Number(a.cost ?? 0)
              const inr = Math.round(usd * 80)
              return <div style={{fontSize:13}}>Cost: ₹{inr.toLocaleString('en-IN')} • Duration: {a.duration_minutes} min</div>
            })()}
            {a.place_info && <div style={{fontSize:13}}>Place: {a.place_info.name || a.place_info.address || a.place_info.place_id}</div>}
          </li>
        ))}
      </ul>
      <div><strong>Estimated budget:</strong> {(() => {
        const usdEst = Number(dayPlan.estimated_budget ?? 0)
        const inrEst = Math.round(usdEst * 80)
        return `₹${inrEst.toLocaleString('en-IN')}`
      })()}</div>
    </div>
  )
}
