import React, { useState } from "react";

export default function PackingSuggestions() {
  const [lat, setLat] = useState(37.7749);
  const [lon, setLon] = useState(-122.4194);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function fetchSuggestions() {
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("http://localhost:8000/weather/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: { lat: Number(lat), lon: Number(lon) },
          start_date: start,
          end_date: end,
          use_gemini: true,
        }),
      });
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  function copyEmbed() {
    const snippet = `<iframe src=\"https://your-site.example/embed/packing?lat=${lat}&lon=${lon}&start=${start}&end=${end}\" width=\"600\" height=\"400\"></iframe>`;
    navigator.clipboard.writeText(snippet);
    alert("Embed snippet copied to clipboard");
  }

  function shareOnTwitter() {
    if (!result || !result.data) return;
    const text = encodeURIComponent(`Packing suggestions: ${result.data.enriched_text || result.data.suggested_items}`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }

  return (
    <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 6 }}>
      <h3>Packing Suggestions</h3>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="lat" />
        <input value={lon} onChange={(e) => setLon(e.target.value)} placeholder="lon" />
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button onClick={fetchSuggestions} disabled={loading}>Get</button>
      </div>

      {loading && <p>Loading...</p>}

      {result && result.ok && result.data && (
        <div style={{ marginTop: 12 }}>
          <h4>Suggested Items</h4>
          <ul>
            {result.data.suggested_items && result.data.suggested_items.map((it) => <li key={it}>{it}</li>)}
          </ul>
          {result.data.enriched_text && (
            <div>
              <h4>Notes</h4>
              <div style={{ whiteSpace: "pre-wrap" }}>{result.data.enriched_text}</div>
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            <button onClick={copyEmbed}>Copy embed snippet</button>
            <button onClick={shareOnTwitter} style={{ marginLeft: 8 }}>Share on Twitter</button>
          </div>
        </div>
      )}

      {result && !result.ok && <div style={{ color: "red" }}>{String(result.error || "Unknown error")}</div>}
    </div>
  );
}
