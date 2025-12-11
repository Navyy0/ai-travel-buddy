import { useEffect, useState, useRef } from 'react'

export default function PlaceAutocomplete({ value, onChange, placeholder }) {
  const [input, setInput] = useState(value || '')
  const [predictions, setPredictions] = useState([])
  const timeoutRef = useRef(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  useEffect(() => {
    setInput(value || '')
  }, [value])

  const doSearch = async (q) => {
    if (!apiUrl) {
      setPredictions([])
      return
    }

    try {
      const r = await fetch(`${apiUrl}/places/search?q=${encodeURIComponent(q)}`, { credentials: 'include' })
      if (r.ok) {
        const data = await r.json()
        // expect { results: [{place_name, lat, lon, display_name, type}, ...] }
        if (data && Array.isArray(data.results)) {
          setPredictions(
            data.results.map(p => ({
              description: p.place_name || p.display_name || 'Unknown',
              place_name: p.place_name || p.display_name,
              lat: p.lat,
              lon: p.lon,
            }))
          )
          return
        }
      }
    } catch (e) {
      console.warn('Backend search failed', e)
    }
    setPredictions([])
  }

  const onInput = (v) => {
    setInput(v)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const q = (v || '').trim()
      // Only query when user typed at least 3 characters to reduce rate
      if (q && q.length >= 3) doSearch(q)
      else setPredictions([])
    }, 250)
  }

  const pick = (desc, lat, lon) => {
    setInput(desc)
    setPredictions([])
    // Pass destination name to parent form
    onChange && onChange(desc)
  }

  return (
    <>
      <style jsx>{`
        .autocomplete-container {
          position: relative;
          width: 100%;
        }

        .autocomplete-input {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface-elevated);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .autocomplete-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .autocomplete-input::placeholder {
          color: var(--text-tertiary);
        }

        .predictions-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          margin-top: 0.25rem;
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          max-height: 300px;
          overflow-y: auto;
        }

        .prediction-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.15s ease;
          border-bottom: 1px solid var(--border-light);
        }

        .prediction-item:last-child {
          border-bottom: none;
        }

        .prediction-item:hover {
          background: var(--surface);
        }

        .prediction-text {
          color: var(--text-primary);
          font-size: 0.9375rem;
        }
      `}</style>

      <div className="autocomplete-container">
        <input
          value={input}
          placeholder={placeholder || ''}
          onChange={e => onInput(e.target.value)}
          className="autocomplete-input"
        />
        {predictions && predictions.length > 0 && (
          <div className="predictions-dropdown">
            {predictions.map((p, i) => (
              <div
                key={i}
                className="prediction-item"
                onClick={() => pick(p.description, p.lat, p.lon)}
              >
                <div className="prediction-text">{p.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
