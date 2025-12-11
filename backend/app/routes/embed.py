from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/embed/packing", response_class=HTMLResponse)
async def embed_packing(request: Request, lat: float = None, lon: float = None, start: str = None, end: str = None):
    """Return a minimal HTML page that can be embedded via iframe.

    The page will call the backend `/weather/packing` endpoint with the provided query params
    and render a simple packing checklist. Keep it lightweight so it can be embedded in blogs.
    """
    # Escape None to empty strings for JS usage
    lat_js = lat if lat is not None else ""
    lon_js = lon if lon is not None else ""
    start_js = start or ""
    end_js = end or ""

    html = f"""
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Packing Suggestions</title>
    <style>
      body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial;margin:0;padding:12px;background:transparent;color:#111}}
      .card{{background:#fff;border:1px solid #e6e6e6;border-radius:8px;padding:12px;max-width:720px}}
      h3{{margin:0 0 8px 0}}
      ul{{margin:8px 0}} 
    </style>
  </head>
  <body>
    <div class="card" id="root">
      <h3>Packing Suggestions</h3>
      <div id="content">Loading...</div>
    </div>

    <script>
      async function load(){{
        const root = document.getElementById('content');
        const payload = {{
          location: {{ lat: {lat_js!r}, lon: {lon_js!r} }},
          start_date: {start_js!r},
          end_date: {end_js!r},
          use_gemini: false
        }};

        try {{
          const resp = await fetch('/weather/packing', {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify(payload)
          }});
          const data = await resp.json();
          if (!data || !data.ok) {{
            root.innerText = 'Error loading suggestions';
            return;
          }}
          const d = data.data;
          let html = '';
          if (d.suggested_items && d.suggested_items.length) {{
            html += '<strong>Suggested items:</strong><ul>' + d.suggested_items.map(i => `<li>${{i}}</li>`).join('') + '</ul>';
          }} else {{
            html += '<div>No specific items suggested.</div>';
          }}
          if (d.enriched_text) html += `<div><strong>Notes:</strong><div>${{d.enriched_text}}</div></div>`;
          root.innerHTML = html;
        }} catch (err) {{
          root.innerText = 'Error fetching packing suggestions';
        }}
      }}
      load();
    </script>
  </body>
</html>
"""
    return HTMLResponse(content=html)
