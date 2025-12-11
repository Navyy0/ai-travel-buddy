import requests
from datetime import datetime
from typing import Dict, Any, List
from .gemini_client import enrich_with_gemini


WEATHER_CODE_MAP = {
    # Simplified mapping of Open-Meteo weather codes to condition keywords
    0: "clear",
    1: "mainly_clear",
    2: "partly_cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing_rime_fog",
    51: "drizzle_light",
    53: "drizzle_moderate",
    55: "drizzle_dense",
    61: "rain_light",
    63: "rain_moderate",
    65: "rain_heavy",
    71: "snow_light",
    73: "snow_moderate",
    75: "snow_heavy",
    80: "rain_showers",
    81: "rain_showers_heavy",
    95: "thunderstorm",
}


def fetch_weather_open_meteo(lat: float, lon: float, start: str, end: str) -> Dict[str, Any]:
    """Fetch daily forecast from Open-Meteo (no API key required).

    Dates must be ISO 'YYYY-MM-DD'. Returns daily temps and weather codes.
    """
    url = (
        "https://api.open-meteo.com/v1/forecast?daily=temperature_2m_max,temperature_2m_min,weathercode"
        f"&latitude={lat}&longitude={lon}&start_date={start}&end_date={end}&timezone=UTC"
    )
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()


def summarize_weather_for_packing(weather_json: Dict[str, Any]) -> Dict[str, Any]:
    """Create a summary useful for packing suggestions from Open-Meteo response."""
    daily = weather_json.get("daily", {})
    dates = daily.get("time", [])
    temps_max = daily.get("temperature_2m_max", [])
    temps_min = daily.get("temperature_2m_min", [])
    codes = daily.get("weathercode", [])

    items = []
    temps = []
    conditions = []
    for i, d in enumerate(dates):
        try:
            tmin = temps_min[i]
            tmax = temps_max[i]
            code = codes[i]
        except IndexError:
            continue
        temps.append((tmin, tmax))
        conditions.append(WEATHER_CODE_MAP.get(code, "unknown"))

    avg_min = sum(t[0] for t in temps) / len(temps) if temps else None
    avg_max = sum(t[1] for t in temps) / len(temps) if temps else None

    # Simple rules
    if avg_max is not None:
        if avg_max >= 30:
            items.extend(["light shirts/t-shirts", "shorts", "sun hat", "sunglasses", "sunscreen"])
        elif avg_max >= 20:
            items.extend(["light layers", "jeans/long pants", "light jacket"])
        elif avg_max >= 10:
            items.extend(["warm layers", "sweater", "windbreaker"])
        else:
            items.extend(["warm coat", "thermal layers", "gloves", "warm hat"])

    if any("rain" in c or "drizzle" in c or "showers" in c for c in conditions):
        items.extend(["rain jacket/poncho", "umbrella", "waterproof shoes"]) 

    if any("snow" in c for c in conditions):
        items.extend(["winter boots", "insulated coat", "snow gloves"]) 

    if any("thunderstorm" in c for c in conditions):
        items.append("avoid outdoor plans during storms")

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for it in items:
        if it not in seen:
            deduped.append(it)
            seen.add(it)

    summary = {
        "avg_min_temp": avg_min,
        "avg_max_temp": avg_max,
        "conditions": list(dict.fromkeys(conditions)),
        "suggested_items": deduped,
    }
    return summary


def generate_packing_suggestions(lat: float, lon: float, start: str, end: str, use_gemini: bool = True) -> Dict[str, Any]:
    weather = fetch_weather_open_meteo(lat, lon, start, end)
    summary = summarize_weather_for_packing(weather)

    # Optionally call Gemini to enrich suggestions
    if use_gemini:
        prompt = (
            "You are a helpful travel assistant. Given the weather summary and suggested items,"
            " rewrite a concise packing checklist and give extra tips for travelers.\n\n"
            f"Weather summary: {summary}\n\nPacking items: {summary.get('suggested_items')}\n\n"
            "Return a short human-friendly checklist and tips."
        )
        enriched = enrich_with_gemini(prompt)
        if enriched:
            summary["enriched_text"] = enriched

    # Also include the raw weather for reference
    summary["raw_weather"] = weather
    return summary
