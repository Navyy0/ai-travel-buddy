import os
import requests
from typing import Optional

GEMINI_API_URL = os.getenv("GEMINI_API_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def enrich_with_gemini(prompt: str, timeout: int = 15) -> Optional[str]:
    """Call a Gemini-compatible LLM endpoint to enrich or rephrase packing suggestions.

    Expects `GEMINI_API_URL` and `GEMINI_API_KEY` to be set in env. If not set,
    returns None so callers can fall back to local heuristics.
    """
    if not GEMINI_API_URL or not GEMINI_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"prompt": prompt, "max_tokens": 400}

    try:
        resp = requests.post(GEMINI_API_URL, json=payload, headers=headers, timeout=timeout)
        resp.raise_for_status()
        data = resp.json()
        # Support simple response shapes: {"text": "..."} or {"choices":[{"text":"..."}]}
        if isinstance(data, dict):
            if "text" in data:
                return data["text"]
            if "choices" in data and isinstance(data["choices"], list) and data["choices"]:
                return data["choices"][0].get("text")
            # Some providers return {"outputs": [{"content": "..."}]}
            if "outputs" in data and isinstance(data["outputs"], list) and data["outputs"]:
                first = data["outputs"][0]
                if isinstance(first, dict) and "content" in first:
                    return first["content"]

        return None
    except Exception:
        return None
