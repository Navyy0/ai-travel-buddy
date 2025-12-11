# AI Travel Buddy

An intelligent travel planning application powered by AI to help users discover destinations, plan itineraries, and get personalized travel recommendations.

## Project Structure

```
├── backend/          # FastAPI backend server
├── frontend/         # Next.js frontend application
├── wordpress-plugin/ # Simple WP plugin to embed the planner via shortcode
├── infra/            # Infrastructure as Code (Docker, Kubernetes configs)
├── docs/             # Project documentation
└── README.md         # This file
```

## Tech Stack

### Backend
- Framework: FastAPI
- Database: MongoDB (Motor async client)
- AI: Google Gemini API (via `google.generativeai`)
- Authentication: JWT + optional Firebase integration
- Maps: Ola Maps (autocomplete, reverse, directions)

### Frontend
- Framework: Next.js (Pages), React
- Map: MapLibre (map rendering)
- Auth: Firebase (frontend), cookie-based JWT for backend API calls

## Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (local or remote)
- API Keys / Secrets:
  - `GEMINI_API_KEY` — Google Gemini API key (required for generation)
  - `OLA_MAPS_API_KEY` — Ola Maps API key (place search, reverse, directions)
  - Firebase credentials/config (optional for Firebase auth flows)

## Environment Setup (quick)

1. Backend (Windows example):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start dev server:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` (for local dev usually `http://localhost:8000`).

3. WordPress plugin (optional): copy `wordpress-plugin/ai-travel-buddy/` to your WordPress `wp-content/plugins/` folder, activate, then enter planner URL in Settings → AI Travel Buddy.

---

**Backend — What, Why & How**

This section documents the backend design, important files, why certain choices were made, and how to run/test the server.

### What the backend does

- Exposes a REST API used by the Next.js frontend and other clients.
- Generates AI-driven itineraries via Google Gemini and enriches them with map/place data (Ola Maps).
- Persists user accounts and saved itineraries to MongoDB.
- Provides authentication routes (email/password and Firebase token flows).

### Why (design decisions)

- Async FastAPI + Motor: chosen for non-blocking IO to support concurrent API calls to external services (Gemini, Ola Maps) without blocking worker threads.
- Gemini model hard-coded to `gemini-2.5-flash`: enforces a single supported model for generation to maintain predictable prompts and output format.
- Ola Maps wrapper: centralizes retry/backoff and caching logic (cache stored in Mongo `places_cache`) to reduce API calls and improve resilience.
- Pydantic validation: AI output is validated and normalized server-side (important because AI can produce noisy output). This prevents invalid data from being stored.

### Important backend files (summary)

- `backend/app/main.py` — FastAPI app creation, CORS policy, router includes, and startup/shutdown hooks (connects to Mongo, creates indexes).
- `backend/app/db/mongo.py` — Motor client lifecycle, `get_db()` helper, collection/index bootstrapping, cache helpers.
- `backend/app/models/indexes.py` — Index creation logic executed at startup (users.email, itineraries.user_id, TTL on places cache).
- `backend/app/routes/auth.py` — Register/login/logout, Firebase login, token refresh, and `get_current_user` dependency (reads `Authorization` header or cookie).
- `backend/app/routes/itineraries.py` — CRUD endpoints for itineraries with ownership checks and Pydantic validation.
- `backend/app/routes/generate.py` — `POST /generate` — drives the AI generation pipeline and enriches results via maps/directions.
- `backend/app/routes/places.py` — `/places` endpoints (search, details, reverse) delegating to Ola Maps service.
- `backend/app/services/ai_client.py` — wraps `google.generativeai`, constructs detailed prompts, extracts JSON from AI responses with multiple fallbacks, validates against Pydantic models.
- `backend/app/services/ola_maps.py` — HTTP client + retry/backoff + cache helpers for place search, details, reverse geocoding, and directions.

### How the generation pipeline works (high-level)

1. Frontend posts a generation request to `POST /generate` with trip parameters (destination, dates, preferences, budget).
2. `AIClient.generate_itinerary()` builds a long prompt asking Gemini to return ONLY valid JSON in a specified itinerary schema.
3. The code calls Gemini synchronously via the `google.generativeai` client and attempts to parse JSON from the model output using multiple extraction strategies (raw JSON parse, fenced code block detection, brace substring extraction).
4. The returned itinerary JSON is validated and normalized to Pydantic models (`Itinerary`, `DayPlan`, `Activity`).
5. For each activity with a location, the backend enriches it using `maps.search_place()` and, where possible, computes directions and estimated travel costs via `maps.get_directions()`.
6. A final enriched itinerary is returned to the client (generation is NOT automatically saved — client may `POST /itineraries` to save).

### Environment variables used by backend

- `MONGO_URI` — MongoDB connection string (default: `mongodb://localhost:27017`).
- `GEMINI_API_KEY` — Google Gemini API key (required for AI generation).
- `OLA_MAPS_API_KEY` — Ola Maps API key (used by `ola_maps.py`).
- `OLA_PROJECT_ID` — (optional) project id for Ola Maps.
- Firebase credentials/config (if using Firebase auth flows).

### Run & Test (short)

- Run tests (from `backend/`):

```powershell
cd backend
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```

- Start server locally:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open API docs at `http://localhost:8000/docs` to exercise endpoints.

### Common troubleshooting

- If Gemini generation fails, confirm `GEMINI_API_KEY` is present and has quota. The AI client logs helpful messages when a key is missing.
- If place enrichment returns empty results, verify `OLA_MAPS_API_KEY` and that the Ola Maps project allows your usage.
- If Mongo connection fails, check `MONGO_URI` and ensure Mongo is accessible from your environment.

### Maintenance notes and TODOs

- Consider making the Gemini model configurable via env var instead of a hard-coded constant to support future model upgrades.
- Add server-side rate-limiting and request queuing for generation to avoid accidental cost spikes.
- Add more unit tests around `ai_client._extract_json_from_response()` to cover edge cases in model outputs.
# AI Travel Buddy

An intelligent travel planning application powered by AI to help users discover destinations, plan itineraries, and get personalized travel recommendations.

## Project Structure

```
├── backend/          # FastAPI backend server
├── frontend/         # Next.js frontend application
├── wordpress-plugin/ # Simple WP plugin to embed the planner via shortcode
└── README.md         # This file
```

## Tech Stack

- Backend: FastAPI, Motor (async MongoDB client), Pydantic, JWT auth, optional Firebase integration
- AI: Google Gemini API (via `google.generativeai`)
- Maps & Geodata: Ola Maps (autocomplete, place details, directions)
- Frontend: Next.js (Pages), React, MapLibre

## Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (local or remote)
- API Keys / Secrets:
  - `GEMINI_API_KEY` — Google Gemini API key (required for generation)
  - `OLA_MAPS_API_KEY` — Ola Maps API key (place search, reverse, directions)
  - Firebase credentials/config (optional for Firebase auth flows)

## Quick environment setup

1. Backend (Windows example):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start dev server:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` (for local dev usually `http://localhost:8000`).

3. WordPress plugin (optional): copy `wordpress-plugin/ai-travel-buddy/` to your WordPress `wp-content/plugins/` folder, activate, then enter planner URL in Settings → AI Travel Buddy.

---

## Backend — What, Why & How (consolidated)

What it does
- Exposes REST APIs used by the Next.js frontend and other clients.
- Generates AI-driven itineraries via Google Gemini and enriches them with place/directions data from Ola Maps.
- Persists user accounts and saved itineraries to MongoDB.

Why (design choices)
- Async FastAPI + Motor: non-blocking IO to handle concurrent external calls (Gemini, Ola Maps).
- Strict Pydantic schemas: server-side validation of AI outputs to avoid storing malformed data.
- Centralized Ola Maps wrapper: handles retries, backoff, and caching (`places_cache`) to reduce external API usage.

How generation works (high-level)
1. Frontend POSTs to `POST /generate` with trip parameters.
2. `AIClient.generate_itinerary()` builds a strict prompt and calls Gemini, extracts JSON, and validates it.
3. Backend enriches activities with place details and directions (time/cost estimates) via the maps service.
4. Enriched itinerary is returned to the client (generation is not auto-saved).

Environment variables (backend)
- `MONGO_URI` — MongoDB connection string (default: `mongodb://localhost:27017`).
- `GEMINI_API_KEY` — Google Gemini API key.
- `OLA_MAPS_API_KEY` — Ola Maps API key.
- `OLA_PROJECT_ID` — optional.
- Firebase credentials/config — optional.

Run & test (backend)

```powershell
cd backend
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open API docs at `http://localhost:8000/docs`.

Common troubleshooting
- Confirm `GEMINI_API_KEY` and `OLA_MAPS_API_KEY` if generation or place enrichment fail.
- Check `MONGO_URI` connectivity.

Maintenance notes
- Consider making the Gemini model configurable via env var.
- Add rate-limiting for generation endpoints to control costs.

### Key backend files (consolidated per-file summary)
- `backend/app/main.py` — App creation, CORS, router registration, startup/shutdown hooks.
- `backend/app/db/mongo.py` — Motor client lifecycle and helpers (`get_db`, collection/index bootstrapping).
- `backend/app/models/indexes.py` — Index creation (users.email unique, TTL on `places_cache`).
- `backend/app/core/exceptions.py` — Centralized FastAPI exception handlers.
- `backend/app/schemas/` — Pydantic models for `Itinerary`, `DayPlan`, `Activity`, and user schemas.
- `backend/app/services/ai_client.py` — Gemini prompt builder, response extraction, and validation.
- `backend/app/services/ola_maps.py` — HTTP wrapper, retry/backoff, caching for places/directions.
- `backend/app/services/auth.py` — Password hashing, JWT creation/verification, optional Firebase flows.
- `backend/app/routes/generate.py` — Orchestrates generation + enrichment (returns enriched JSON).
- `backend/app/routes/itineraries.py` — CRUD endpoints with ownership checks.
- `backend/app/routes/places.py`, `routes.py` (directions), `weather.py`, `admin.py`, `analytics.py`, `embed.py` — supporting endpoints.

---

## Frontend — What, Why & How (consolidated)

What it does
- Presents UI for planning and viewing itineraries, map previews, PDF export, and saving to backend.

Why (design choices)
- Next.js Pages for simple routing.
- Cookie-based HttpOnly sessions simplify API auth and keep tokens out of client JS.
- MapLibre for mapping compatibility with backend GeoJSON routes.

Quick run & test (frontend)

```powershell
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to point at your running backend (e.g., `http://localhost:8000`).

### Key frontend files (consolidated)
- `frontend/pages/index.js` — Landing page with `PlannerForm`.
- `frontend/pages/results.js` — Shows generated itinerary from sessionStorage and offers Save/Download.
- `frontend/pages/saved.js` — Lists saved itineraries; Edit/Delete controls (Edit navigation added).
- `frontend/pages/itinerary/[id]/edit.js` — Edit saved itineraries (PUT updates).
- `frontend/pages/login.js` — Login & signup flows (Firebase + backend exchange).
- `frontend/components/PlannerForm.jsx` — Builds generation payload and posts to `/generate`.
- `frontend/components/PlaceAutocomplete.jsx` — Debounced place search against `/places/search`.
- `frontend/components/MapView.jsx` — Map rendering (markers, routes, popups).
- `frontend/components/ItineraryCard.jsx`, `DayCard.jsx` — UI for itineraries and days.
- `frontend/context/AuthProvider.jsx` — Manages `GET /auth/me` and exposes `user` state.

Testing & verification
- Manual: start backend and frontend, sign in, generate itinerary, save, edit, and delete flows.
- Automated: consider adding Jest + React Testing Library and Cypress/Playwright for E2E.

UX & accessibility notes
- Audit interactive elements for keyboard and screen-reader support.

---

## WordPress plugin
- `wordpress-plugin/ai-travel-buddy/` provides a shortcode to embed the planner via iframe. The plugin stores an admin-saved planner URL in settings; I can apply a small patch to prefer the saved URL if you want.

## Next steps (suggested)
- (A) Expand per-file function signatures and examples (long).
- (B) Run dev servers and smoke-test behaviors (requires permission to start processes).
- (C) Apply the WordPress plugin patch so shortcode prefers the saved admin URL.

If you want me to proceed with one of the above, tell me which and I'll continue.
- `frontend/pages/index.js`
