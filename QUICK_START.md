# 🚀 OLA MAPS INTEGRATION - QUICK START GUIDE

## ⚡ 5-Minute Setup

### Step 1: Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```
**Expected**: Server runs on http://localhost:8000

### Step 2: Start Frontend  
```bash
cd frontend
npm run dev
```
**Expected**: UI runs on http://localhost:3000

### Step 3: Test Endpoints
```bash
# Search places
curl "http://localhost:8000/places/search?q=Taj%20Mahal&limit=5"

# Reverse geocode
curl "http://localhost:8000/places/reverse?lat=27.1751&lon=78.0421"

# Get directions
curl "http://localhost:8000/routes/directions?origin_lat=27.1751&origin_lon=78.0421&dest_lat=28.6562&dest_lon=77.2410"
```

### Step 4: Run Full Tests
```bash
cd backend
python test_ola_integration_full.py
```

---

## ✅ What's Implemented

| Component | File | Status |
|-----------|------|--------|
| Ola Maps Service | `backend/app/services/ola_maps.py` | ✅ 380 lines |
| Search/Details/Reverse | `backend/app/routes/places.py` | ✅ 3 endpoints |
| Directions Route | `backend/app/routes/routes.py` | ✅ 1 endpoint |
| Map Component | `frontend/components/MapView.jsx` | ✅ Verified |
| Autocomplete | `frontend/components/PlaceAutocomplete.jsx` | ✅ Verified |
| Results Page | `frontend/pages/results.js` | ✅ Verified |
| Caching (24h TTL) | `ola_maps.py` | ✅ Implemented |
| Retry Logic | `ola_maps.py` | ✅ Exponential backoff |
| Error Handling | All services | ✅ 403/429/5xx handled |

---

## 🔗 API Endpoints

### Places
```
GET /places/search?q=query&limit=5
GET /places/details?place_id=id
GET /places/reverse?lat=27.1751&lon=78.0421
```

### Routes
```
GET /routes/directions?origin_lat=27.1751&origin_lon=78.0421&dest_lat=28.6562&dest_lon=77.2410&profile=driving
```

### Itinerary
```
POST /generate {destination, start_date, end_date, ...}
```

---

## 🎯 Key Features

✅ **Autocomplete Search** - Type to find places (cached)  
✅ **Map Display** - Markers for activities, polylines for routes  
✅ **Route Calculation** - Distance, time, and polyline (cached)  
✅ **24h Caching** - MongoDB-backed with TTL  
✅ **Retry Logic** - Auto-retry on rate limit/server error  
✅ **Error Handling** - Graceful handling of API failures  
✅ **Fallback Routes** - Directions works with `/routing/v1` and `/routes/v1`  

---

## 📝 Configuration Files

### Backend `.env`
```
OLA_MAPS_API_KEY=7ESZWDQZLm4OdPwfVF5yDpyBiLM0qOkm74TMC93i
OLA_PROJECT_ID=6e264bdb-4b5d-4ead-a9ff-cddf4dc055b5
MONGO_URI=mongodb://localhost:27017/tripplan
JWT_SECRET=your_jwt_secret
FIREBASE_API_KEY=your_firebase_key
GEMINI_API_KEY=your_gemini_key
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OLA_MAPS_API_KEY=7ESZWDQZLm4OdPwfVF5yDpyBiLM0qOkm74TMC93i
NEXT_PUBLIC_OLA_MAPS_STYLE=https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json
```

---

## 🧪 Testing

### Run All Tests
```bash
cd backend && python test_ola_integration_full.py
```

### Verify Installation
```bash
bash VERIFY_OLA_INTEGRATION.sh
```

### Manual Test - Search
```bash
curl "http://localhost:8000/places/search?q=Agra&limit=5" | jq
```

Expected:
```json
{
  "results": [
    {
      "place_id": "...",
      "name": "Agra",
      "display_name": "Agra, India",
      "lat": 27.1751,
      "lon": 78.0421,
      "category": "city"
    }
  ]
}
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | Check `OLA_MAPS_API_KEY` in `.env` |
| 429 Rate Limited | Wait or increase cache TTL |
| 503 Service Unavailable | Ola API down (check status) |
| Empty results | Query may not exist; try more specific name |
| No map rendering | Check browser console for errors |
| Slow responses | Normal for first request; cached after |

---

## 📚 Documentation

- **Full Implementation**: See `OLA_MAPS_IMPLEMENTATION_COMPLETE.md`
- **Architecture**: See `OLA_MAPS_INTEGRATION_SUMMARY.md`
- **Original Migration**: See `OLA_MAPS_INTEGRATION.md`

---

## 🎉 You're All Set!

**Backend**: ✅ Running on http://localhost:8000  
**Frontend**: ✅ Running on http://localhost:3000  
**Tests**: ✅ All passing  
**Docs**: ✅ Complete  

### Now You Can:
1. 🔍 Search for places
2. 🗺️ View maps with markers and routes
3. 📍 Get directions between locations
4. 💾 Cache results for 24 hours
5. 🚀 Generate full itineraries with enriched data

**Happy trip planning! 🌍✈️🗺️**
