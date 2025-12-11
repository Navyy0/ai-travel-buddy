import DayCard from './DayCard'

export default function ItineraryCard({ itinerary }) {
  if (!itinerary) return null

  return (
    <div style={{border: '1px solid #eee', padding: 12, borderRadius: 6}}>
      <h2>{itinerary.title || 'Itinerary'}</h2>
      <p>{itinerary.description}</p>
      <div>
        {(itinerary.day_plans || []).map(dp => (
          <DayCard key={dp.day} dayPlan={dp} />
        ))}
      </div>
    </div>
  )
}
