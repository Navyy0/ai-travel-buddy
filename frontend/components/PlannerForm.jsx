import { useState } from 'react'
import { useRouter } from 'next/router'
import PlaceAutocomplete from './PlaceAutocomplete'

export default function PlannerForm({ initial = {}, onComplete }) {
  const router = useRouter()
  const [destination, setDestination] = useState(initial.destination || '')
  const [startDate, setStartDate] = useState(initial.start_date || '')
  const [endDate, setEndDate] = useState(initial.end_date || '')
  const [budget, setBudget] = useState(initial.budget || '')
  const [preferences, setPreferences] = useState((initial.preferences && initial.preferences.join(', ')) || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  const handleSubmit = async (e) => {
    e && e.preventDefault()
    
    // Validate required fields
    if (!destination.trim()) {
      setError('Please enter a destination')
      setLoading(false)
      return
    }
    if (!startDate) {
      setError('Please select a start date')
      setLoading(false)
      return
    }
    if (!endDate) {
      setError('Please select an end date')
      setLoading(false)
      return
    }

    setLoading(true)
    // Convert budget entered in INR back to USD for the backend (assumes original model expects USD)
    const budgetUsd = budget ? Math.round((Number(budget) / 80) * 100) / 100 : undefined
    const payload = {
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      budget: budgetUsd,
      preferences: preferences ? preferences.split(',').map(s => s.trim()).filter(s => s) : [],
      travelers: 1,
      travel_style: 'balanced'
    }

    try {
      setError(null)
      const res = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      if (!res.ok) {
        const text = await res.text()
        setError(`Generation failed: ${res.status} ${text}`)
        setLoading(false)
        return
      }

      const data = await res.json()
      sessionStorage.setItem('latest_itinerary', JSON.stringify(data))
      // Save the original generation payload so results page can regenerate
      try { sessionStorage.setItem('latest_generation_payload', JSON.stringify(payload)) } catch (e) { /* ignore */ }
      if (onComplete) onComplete(data)
      else router.push('/results')
    } catch (err) {
      console.error(err)
      setError('Network error while generating itinerary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        .form {
          width: 100%;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .form-label-optional {
          font-weight: 400;
          color: var(--text-tertiary);
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface-elevated);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-tertiary);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-md);
          margin-top: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          margin-top: 1rem;
          padding: 0.875rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
          border-radius: var(--radius-md);
          color: var(--error);
          font-size: 0.875rem;
        }

        .loading-text {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">
            Destination
          </label>
          <PlaceAutocomplete 
            value={destination} 
            onChange={setDestination} 
            placeholder="Enter city or place name" 
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Start Date
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              End Date
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              required 
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Budget (₹ INR)<span className="form-label-optional">(optional)</span>
          </label>
          <input 
            type="number" 
            value={budget} 
            onChange={e => setBudget(e.target.value)} 
            className="form-input"
            placeholder="Enter your budget in Indian Rupees"
            min="0"
            step="1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Preferences <span className="form-label-optional">(comma separated)</span>
          </label>
          <input 
            value={preferences} 
            onChange={e => setPreferences(e.target.value)} 
            className="form-input"
            placeholder="e.g., museums, hiking, restaurants, beaches"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? (
            <span className="loading-text">
              <span className="spinner"></span>
              Generating Your Itinerary...
            </span>
          ) : (
            'Generate Itinerary'
          )}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </form>
    </>
  )
}
