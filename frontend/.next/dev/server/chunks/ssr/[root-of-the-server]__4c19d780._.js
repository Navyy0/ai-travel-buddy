module.exports = [
"[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("styled-jsx/style.js", () => require("styled-jsx/style.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/react-dom [external] (react-dom, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react-dom", () => require("react-dom"));

module.exports = mod;
}),
"[project]/components/DayCard.jsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DayCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
;
function DayCard({ dayPlan }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            borderTop: '1px solid #f1f1f1',
            paddingTop: 12,
            marginTop: 12
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                children: [
                    "Day ",
                    dayPlan.day,
                    " — ",
                    dayPlan.title
                ]
            }, void 0, true, {
                fileName: "[project]/components/DayCard.jsx",
                lineNumber: 4,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: dayPlan.theme
            }, void 0, false, {
                fileName: "[project]/components/DayCard.jsx",
                lineNumber: 5,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("ul", {
                children: (dayPlan.activities || []).map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("li", {
                        style: {
                            marginBottom: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                                children: [
                                    a.time,
                                    " — ",
                                    a.title
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DayCard.jsx",
                                lineNumber: 9,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 13
                                },
                                children: a.description
                            }, void 0, false, {
                                fileName: "[project]/components/DayCard.jsx",
                                lineNumber: 10,
                                columnNumber: 13
                            }, this),
                            (()=>{
                                const usd = Number(a.cost ?? 0);
                                const inr = Math.round(usd * 80);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        fontSize: 13
                                    },
                                    children: [
                                        "Cost: ₹",
                                        inr.toLocaleString('en-IN'),
                                        " • Duration: ",
                                        a.duration_minutes,
                                        " min"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DayCard.jsx",
                                    lineNumber: 14,
                                    columnNumber: 22
                                }, this);
                            })(),
                            a.place_info && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 13
                                },
                                children: [
                                    "Place: ",
                                    a.place_info.name || a.place_info.address || a.place_info.place_id
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DayCard.jsx",
                                lineNumber: 16,
                                columnNumber: 30
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/components/DayCard.jsx",
                        lineNumber: 8,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/DayCard.jsx",
                lineNumber: 6,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("strong", {
                        children: "Estimated budget:"
                    }, void 0, false, {
                        fileName: "[project]/components/DayCard.jsx",
                        lineNumber: 20,
                        columnNumber: 12
                    }, this),
                    " ",
                    (()=>{
                        const usdEst = Number(dayPlan.estimated_budget ?? 0);
                        const inrEst = Math.round(usdEst * 80);
                        return `₹${inrEst.toLocaleString('en-IN')}`;
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/components/DayCard.jsx",
                lineNumber: 20,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DayCard.jsx",
        lineNumber: 3,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/ItineraryCard.jsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ItineraryCard
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DayCard$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DayCard.jsx [ssr] (ecmascript)");
;
;
function ItineraryCard({ itinerary }) {
    if (!itinerary) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            border: '1px solid #eee',
            padding: 12,
            borderRadius: 6
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                children: itinerary.title || 'Itinerary'
            }, void 0, false, {
                fileName: "[project]/components/ItineraryCard.jsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                children: itinerary.description
            }, void 0, false, {
                fileName: "[project]/components/ItineraryCard.jsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                children: (itinerary.day_plans || []).map((dp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DayCard$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        dayPlan: dp
                    }, dp.day, false, {
                        fileName: "[project]/components/ItineraryCard.jsx",
                        lineNumber: 12,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/ItineraryCard.jsx",
                lineNumber: 10,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ItineraryCard.jsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
"[externals]/maplibre-gl [external] (maplibre-gl, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("maplibre-gl", () => require("maplibre-gl"));

module.exports = mod;
}),
"[project]/components/MapView.jsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapView
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$maplibre$2d$gl__$5b$external$5d$__$28$maplibre$2d$gl$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/maplibre-gl [external] (maplibre-gl, cjs)");
;
;
;
;
// Color palette for different days
const DAY_COLORS = [
    '#0d6efd',
    '#198754',
    '#ffc107',
    '#dc3545',
    '#fd7e14',
    '#20c997',
    '#0dcaf0',
    '#fd6f61',
    '#17a2b8',
    '#6c757d'
];
// Activity type colors
const ACTIVITY_COLORS = {
    sightseeing: '#007bff',
    accommodation: '#28a745',
    restaurant: '#ffc107',
    other: '#6c757d'
};
// Get color for activity type
function getActivityColor(activityType) {
    return ACTIVITY_COLORS[activityType?.toLowerCase()] || ACTIVITY_COLORS.other;
}
// Get color for day
function getDayColor(day) {
    const dayNum = typeof day === 'number' ? day : parseInt(day) || 1;
    return DAY_COLORS[(dayNum - 1) % DAY_COLORS.length];
}
function MapView({ places = [], height = 400, routes = [] }) {
    const mapContainer = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const map = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useRef"])(null);
    const [selectedDay, setSelectedDay] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    // Use free MapLibre style - data from backend (which uses Ola)
    const styleUrl = 'https://demotiles.maplibre.org/style.json';
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!mapContainer.current) return;
        // Clean up previous map instance (defensive: some map builds expose `remove` or `destroy`)
        if (map.current) {
            if (typeof map.current.remove === 'function') {
                try {
                    map.current.remove();
                } catch (err) {
                    console.warn('MapView: error while removing previous map instance', err);
                }
            } else if (typeof map.current.destroy === 'function') {
                try {
                    map.current.destroy();
                } catch (err) {
                    console.warn('MapView: error while destroying previous map instance', err);
                }
            }
            map.current = null;
        }
        // Filter valid places with coordinates and apply day filter
        let validPlaces = places.filter((p)=>{
            const lat = p.lat;
            const lon = p.lon || p.lng;
            return lat != null && lon != null && !isNaN(lat) && !isNaN(lon);
        });
        // Apply day filter if selected
        if (selectedDay !== null) {
            validPlaces = validPlaces.filter((p)=>(p.day || 1) === selectedDay);
        }
        if (validPlaces.length === 0) {
            // If no valid places, show default map
            map.current = new __TURBOPACK__imported__module__$5b$externals$5d2f$maplibre$2d$gl__$5b$external$5d$__$28$maplibre$2d$gl$2c$__cjs$29$__["default"].Map({
                container: mapContainer.current,
                style: styleUrl,
                center: [
                    0,
                    0
                ],
                zoom: 2
            });
            return ()=>{
                if (map.current) {
                    if (typeof map.current.remove === 'function') {
                        try {
                            map.current.remove();
                        } catch (err) {
                            console.warn('MapView cleanup error', err);
                        }
                    } else if (typeof map.current.destroy === 'function') {
                        try {
                            map.current.destroy();
                        } catch (err) {
                            console.warn('MapView cleanup error', err);
                        }
                    }
                }
            };
        }
        // Calculate bounds to fit all places
        const lons = validPlaces.map((p)=>p.lon || p.lng);
        const lats = validPlaces.map((p)=>p.lat);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        // Initialize map
        map.current = new __TURBOPACK__imported__module__$5b$externals$5d2f$maplibre$2d$gl__$5b$external$5d$__$28$maplibre$2d$gl$2c$__cjs$29$__["default"].Map({
            container: mapContainer.current,
            style: styleUrl,
            center: [
                (minLon + maxLon) / 2,
                (minLat + maxLat) / 2
            ],
            zoom: 10
        });
        // Function to add markers and routes
        const addMarkersAndRoutes = ()=>{
            console.log('MapView: Adding markers for', validPlaces.length, 'places');
            console.log('MapView: Places data:', validPlaces);
            if (validPlaces.length === 0) {
                console.warn('MapView: No valid places to display on map!');
                return;
            }
            // Add markers for each place with enhanced styling
            validPlaces.forEach((place, index)=>{
                const lat = place.lat;
                const lon = place.lon || place.lng;
                console.log(`MapView: Processing place ${index + 1}: "${place.name}" at (${lat}, ${lon})`);
                if (lat != null && lon != null && !isNaN(lat) && !isNaN(lon)) {
                    const order = place.order || index + 1;
                    const day = place.day || 1;
                    const activityType = place.activityType || place.activity_type || 'other';
                    const dayColor = getDayColor(day);
                    const activityColor = getActivityColor(activityType);
                    // Use activity color for marker
                    const markerColor = activityColor;
                    // Create numbered marker
                    const el = document.createElement('div');
                    el.className = 'marker';
                    el.style.width = '32px';
                    el.style.height = '32px';
                    el.style.background = markerColor;
                    el.style.borderRadius = '50%';
                    el.style.border = '3px solid #fff';
                    el.style.cursor = 'pointer';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.fontSize = '12px';
                    el.style.fontWeight = 'bold';
                    el.style.color = '#fff';
                    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    el.textContent = order;
                    el.title = `${place.name || 'Place'} (Day ${day})`;
                    // Build enhanced popup content
                    const popupContent = `
            <div style="min-width: 200px; padding: 4px;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: ${dayColor};">
                Day ${day} - Stop ${order}
              </div>
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px;">
                ${place.name || place.place_name || 'Unknown Place'}
              </div>
              ${place.title ? `<div style="color: #666; font-size: 12px; margin-bottom: 4px;">${place.title}</div>` : ''}
              ${place.time ? `<div style="color: #888; font-size: 11px; margin-bottom: 2px;">⏰ ${place.time}</div>` : ''}
              ${place.duration ? `<div style="color: #888; font-size: 11px; margin-bottom: 2px;">⏱️ ${place.duration} min</div>` : ''}
              ${place.description ? `<div style="color: #666; font-size: 11px; margin-top: 6px; max-height: 60px; overflow-y: auto;">${place.description}</div>` : ''}
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee; font-size: 10px; color: #999;">
                Type: ${activityType.charAt(0).toUpperCase() + activityType.slice(1)}
              </div>
            </div>
          `;
                    new __TURBOPACK__imported__module__$5b$externals$5d2f$maplibre$2d$gl__$5b$external$5d$__$28$maplibre$2d$gl$2c$__cjs$29$__["default"].Marker(el).setLngLat([
                        lon,
                        lat
                    ]).setPopup(new __TURBOPACK__imported__module__$5b$externals$5d2f$maplibre$2d$gl__$5b$external$5d$__$28$maplibre$2d$gl$2c$__cjs$29$__["default"].Popup({
                        offset: 25
                    }).setHTML(popupContent)).addTo(map.current);
                }
            });
            // Filter routes by selected day if filter is active
            const filteredRoutes = selectedDay !== null ? routes.filter((r)=>(r.day || 1) === selectedDay) : routes;
            // Add route lines if provided (color-coded by day)
            filteredRoutes.forEach((route, idx)=>{
                if (route && (route.geometry || route)) {
                    const sourceId = 'route-' + idx;
                    const layerId = 'route-layer-' + idx;
                    const geometry = route.geometry || route;
                    const day = route.day || 1;
                    const routeColor = getDayColor(day);
                    const opacity = 0.8;
                    if (!map.current.getSource(sourceId)) {
                        map.current.addSource(sourceId, {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                geometry: geometry
                            }
                        });
                    }
                    if (!map.current.getLayer(layerId)) {
                        map.current.addLayer({
                            id: layerId,
                            type: 'line',
                            source: sourceId,
                            paint: {
                                'line-color': routeColor,
                                'line-width': 4,
                                'line-opacity': opacity
                            }
                        });
                    } else {
                        // Update existing layer color/opacity
                        map.current.setPaintProperty(layerId, 'line-color', routeColor);
                        map.current.setPaintProperty(layerId, 'line-opacity', opacity);
                    }
                }
            });
            // Fit map to show all markers
            if (validPlaces.length > 1) {
                const bounds = new __TURBOPACK__imported__module__$5b$externals$5d2f$maplibre$2d$gl__$5b$external$5d$__$28$maplibre$2d$gl$2c$__cjs$29$__["default"].LngLatBounds();
                validPlaces.forEach((p)=>{
                    bounds.extend([
                        p.lon || p.lng,
                        p.lat
                    ]);
                });
                map.current.fitBounds(bounds, {
                    padding: 50
                });
            } else if (validPlaces.length === 1) {
                // If only one place, center on it
                const p = validPlaces[0];
                map.current.setCenter([
                    p.lon || p.lng,
                    p.lat
                ]);
                map.current.setZoom(14);
            }
        };
        // Wait for map to load before adding markers and routes (defensive checks)
        if (map.current && typeof map.current.loaded === 'function' && map.current.loaded()) {
            // Map already loaded, add markers immediately
            addMarkersAndRoutes();
        } else if (map.current && typeof map.current.on === 'function') {
            // Map not loaded yet, wait for load event
            map.current.on('load', addMarkersAndRoutes);
        }
        return ()=>{
            // Cleanup: remove event listener and destroy/remove map instance
            try {
                if (map.current && typeof map.current.off === 'function') {
                    map.current.off('load', addMarkersAndRoutes);
                }
            } catch (err) {
                console.warn('MapView: error while removing load listener', err);
            }
            if (map.current) {
                if (typeof map.current.remove === 'function') {
                    try {
                        map.current.remove();
                    } catch (err) {
                        console.warn('MapView cleanup error', err);
                    }
                } else if (typeof map.current.destroy === 'function') {
                    try {
                        map.current.destroy();
                    } catch (err) {
                        console.warn('MapView cleanup error', err);
                    }
                }
                map.current = null;
            }
        };
    }, [
        places,
        routes,
        styleUrl,
        selectedDay
    ]);
    // Get unique days for legend
    const uniqueDays = [
        ...new Set(places.map((p)=>p.day || 1))
    ].sort((a, b)=>a - b);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative'
        },
        children: [
            uniqueDays.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    fontSize: '12px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: '6px',
                            fontWeight: 'bold'
                        },
                        children: "Filter by Day:"
                    }, void 0, false, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 291,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap',
                            maxWidth: '200px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedDay(null),
                                style: {
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    border: selectedDay === null ? '2px solid #007bff' : '1px solid #ddd',
                                    background: selectedDay === null ? '#007bff' : 'white',
                                    color: selectedDay === null ? 'white' : '#333',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                },
                                children: "All Days"
                            }, void 0, false, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 293,
                                columnNumber: 13
                            }, this),
                            uniqueDays.map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedDay(selectedDay === day ? null : day),
                                    style: {
                                        padding: '4px 8px',
                                        fontSize: '11px',
                                        border: `2px solid ${getDayColor(day)}`,
                                        background: selectedDay === day ? getDayColor(day) : 'white',
                                        color: selectedDay === day ? 'white' : getDayColor(day),
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    },
                                    children: [
                                        "Day ",
                                        day
                                    ]
                                }, day, true, {
                                    fileName: "[project]/components/MapView.jsx",
                                    lineNumber: 308,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 292,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MapView.jsx",
                lineNumber: 280,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    zIndex: 1000,
                    background: 'white',
                    padding: '10px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    fontSize: '11px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: '6px',
                            fontWeight: 'bold'
                        },
                        children: "Activity Types:"
                    }, void 0, false, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 340,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: ACTIVITY_COLORS.sightseeing
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 343,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Sightseeing"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 344,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 342,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: ACTIVITY_COLORS.accommodation
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 347,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Accommodation"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 348,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 346,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: ACTIVITY_COLORS.restaurant
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 351,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Restaurant"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 352,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 350,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: ACTIVITY_COLORS.other
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 355,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Other"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 356,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 354,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 341,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MapView.jsx",
                lineNumber: 329,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                ref: mapContainer,
                style: {
                    width: '100%',
                    height: height,
                    border: '1px solid #ccc'
                }
            }, void 0, false, {
                fileName: "[project]/components/MapView.jsx",
                lineNumber: 361,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MapView.jsx",
        lineNumber: 277,
        columnNumber: 5
    }, this);
}
}),
"[project]/pages/saved.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Saved
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ItineraryCard$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ItineraryCard.jsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MapView$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MapView.jsx [ssr] (ecmascript)");
;
;
;
;
;
;
function Saved() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [selectedItinerary, setSelectedItinerary] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        // Attempt to fetch saved itineraries using cookie-based auth
        fetch(`${apiUrl}/itineraries`, {
            credentials: 'include'
        }).then((r)=>{
            if (r.status === 401) {
                router.replace('/login');
                return [];
            }
            return r.json();
        }).then((data)=>setItems(data || [])).catch(()=>setItems([]));
    }, [
        router,
        apiUrl
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "a6ca8fb2f3e23c7d",
                children: ".saved-container.jsx-a6ca8fb2f3e23c7d{background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);min-height:100vh;padding:2rem}.saved-content.jsx-a6ca8fb2f3e23c7d{max-width:1200px;margin:0 auto}.saved-header.jsx-a6ca8fb2f3e23c7d{background:var(--surface-elevated);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border:1px solid var(--border);margin-bottom:2rem;padding:2rem}.saved-title.jsx-a6ca8fb2f3e23c7d{color:var(--text-primary);margin-bottom:.5rem;font-size:2rem;font-weight:700}.saved-subtitle.jsx-a6ca8fb2f3e23c7d{color:var(--text-secondary);font-size:1rem}.back-btn.jsx-a6ca8fb2f3e23c7d{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);cursor:pointer;align-items:center;gap:.5rem;margin-bottom:1.5rem;padding:.75rem 1.5rem;font-size:.9375rem;font-weight:600;transition:all .2s;display:inline-flex}.back-btn.jsx-a6ca8fb2f3e23c7d:hover{background:var(--border-light);border-color:var(--border)}.itinerary-detail.jsx-a6ca8fb2f3e23c7d{background:var(--surface-elevated);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border:1px solid var(--border);padding:2rem}.itinerary-list.jsx-a6ca8fb2f3e23c7d{gap:1rem;display:grid}.itinerary-item.jsx-a6ca8fb2f3e23c7d{background:var(--surface-elevated);border:1px solid var(--border);border-radius:var(--radius-lg);cursor:pointer;padding:1.5rem;transition:all .2s}.itinerary-item.jsx-a6ca8fb2f3e23c7d:hover{background:var(--surface);border-color:var(--primary);box-shadow:var(--shadow-md);transform:translateY(-2px)}.itinerary-item-title.jsx-a6ca8fb2f3e23c7d{color:var(--text-primary);margin:0 0 .5rem;font-size:1.25rem;font-weight:700}.itinerary-item-destination.jsx-a6ca8fb2f3e23c7d{color:var(--text-secondary);margin:0 0 .75rem;font-size:.9375rem}.itinerary-item-description.jsx-a6ca8fb2f3e23c7d{color:var(--text-tertiary);margin:0 0 1rem;font-size:.9em;line-height:1.5}.itinerary-item-meta.jsx-a6ca8fb2f3e23c7d{color:var(--text-tertiary);gap:1.5rem;font-size:.85em;display:flex}.itinerary-item-hint.jsx-a6ca8fb2f3e23c7d{color:var(--primary);margin-top:.75rem;font-size:.875rem;font-weight:500}.loading-state.jsx-a6ca8fb2f3e23c7d,.empty-state.jsx-a6ca8fb2f3e23c7d{background:var(--surface-elevated);border-radius:var(--radius-xl);text-align:center;box-shadow:var(--shadow-lg);border:1px solid var(--border);padding:4rem 2rem}.loading-state.jsx-a6ca8fb2f3e23c7d{color:var(--text-secondary);font-size:1.125rem}.empty-state-title.jsx-a6ca8fb2f3e23c7d{color:var(--text-primary);margin-bottom:.5rem;font-size:1.5rem;font-weight:700}.empty-state-text.jsx-a6ca8fb2f3e23c7d{color:var(--text-secondary);margin-bottom:1.5rem}.empty-state-link.jsx-a6ca8fb2f3e23c7d{background:linear-gradient(135deg,var(--primary)0%,var(--primary-light)100%);color:#fff;border-radius:var(--radius-md);box-shadow:var(--shadow-md);padding:.875rem 1.5rem;font-weight:600;text-decoration:none;transition:all .2s;display:inline-block}.empty-state-link.jsx-a6ca8fb2f3e23c7d:hover{box-shadow:var(--shadow-lg);transform:translateY(-2px)}.map-container.jsx-a6ca8fb2f3e23c7d{background:var(--surface-elevated);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border:1px solid var(--border);margin-top:2rem;padding:2rem}@media (width<=768px){.saved-container.jsx-a6ca8fb2f3e23c7d{padding:1rem}.saved-header.jsx-a6ca8fb2f3e23c7d,.itinerary-detail.jsx-a6ca8fb2f3e23c7d{padding:1.5rem}.itinerary-item-meta.jsx-a6ca8fb2f3e23c7d{flex-direction:column;gap:.5rem}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-a6ca8fb2f3e23c7d" + " " + "saved-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-a6ca8fb2f3e23c7d" + " " + "saved-content",
                    children: !items ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "jsx-a6ca8fb2f3e23c7d" + " " + "loading-state",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gap: 12
                            },
                            className: "jsx-a6ca8fb2f3e23c7d",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        height: 18,
                                        width: '40%',
                                        background: '#eef2ff',
                                        borderRadius: 8
                                    },
                                    className: "jsx-a6ca8fb2f3e23c7d"
                                }, void 0, false, {
                                    fileName: "[project]/pages/saved.js",
                                    lineNumber: 220,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        height: 120,
                                        background: '#f8fafc',
                                        borderRadius: 12
                                    },
                                    className: "jsx-a6ca8fb2f3e23c7d"
                                }, void 0, false, {
                                    fileName: "[project]/pages/saved.js",
                                    lineNumber: 221,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        height: 120,
                                        background: '#f8fafc',
                                        borderRadius: 12
                                    },
                                    className: "jsx-a6ca8fb2f3e23c7d"
                                }, void 0, false, {
                                    fileName: "[project]/pages/saved.js",
                                    lineNumber: 222,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/saved.js",
                            lineNumber: 219,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/saved.js",
                        lineNumber: 218,
                        columnNumber: 13
                    }, this) : !items.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "jsx-a6ca8fb2f3e23c7d" + " " + "empty-state",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "empty-state-title",
                                children: "No Saved Itineraries"
                            }, void 0, false, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 227,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "empty-state-text",
                                children: "You haven't saved any itineraries yet. Create your first trip plan to get started!"
                            }, void 0, false, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 228,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                                href: "/",
                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "empty-state-link",
                                children: "Create New Itinerary"
                            }, void 0, false, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 231,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/saved.js",
                        lineNumber: 226,
                        columnNumber: 13
                    }, this) : selectedItinerary ? (()=>{
                        // Extract places and routes for map
                        const places = [];
                        const routes = [];
                        let globalOrder = 1;
                        const dayPlans = Array.isArray(selectedItinerary.day_plans) ? selectedItinerary.day_plans : [];
                        dayPlans.forEach((dp)=>{
                            const day = dp.day || 1;
                            const activities = Array.isArray(dp?.activities) ? dp.activities : [];
                            activities.forEach((a)=>{
                                const placeInfo = a?.place_info || {};
                                const lat = placeInfo.lat;
                                const lon = placeInfo.lon || placeInfo.lng;
                                if (lat != null && lon != null && typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
                                    places.push({
                                        lat: lat,
                                        lng: lon,
                                        name: placeInfo.place_name || placeInfo.name || a.title || 'Unknown',
                                        title: a.title,
                                        day: day,
                                        order: globalOrder++,
                                        activityType: a.activity_type || a.activityType || 'other',
                                        time: a.time,
                                        duration: a.duration_minutes || a.duration,
                                        description: a.description
                                    });
                                }
                                const travel = a?.travel_from_previous || {};
                                const routeGeometry = travel.route_geojson || travel.route;
                                if (routeGeometry) {
                                    routes.push({
                                        geometry: routeGeometry,
                                        day: day
                                    });
                                }
                            });
                        });
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-detail",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedItinerary(null),
                                    className: "jsx-a6ca8fb2f3e23c7d" + " " + "back-btn",
                                    children: "← Back to List"
                                }, void 0, false, {
                                    fileName: "[project]/pages/saved.js",
                                    lineNumber: 277,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ItineraryCard$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    itinerary: selectedItinerary
                                }, void 0, false, {
                                    fileName: "[project]/pages/saved.js",
                                    lineNumber: 280,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-a6ca8fb2f3e23c7d" + " " + "map-container",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MapView$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        places: places,
                                        routes: routes,
                                        height: 500
                                    }, void 0, false, {
                                        fileName: "[project]/pages/saved.js",
                                        lineNumber: 282,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/pages/saved.js",
                                    lineNumber: 281,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/saved.js",
                            lineNumber: 276,
                            columnNumber: 15
                        }, this);
                    })() : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "saved-header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                                        className: "jsx-a6ca8fb2f3e23c7d" + " " + "saved-title",
                                        children: "Saved Itineraries"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/saved.js",
                                        lineNumber: 289,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        className: "jsx-a6ca8fb2f3e23c7d" + " " + "saved-subtitle",
                                        children: "Your travel plans at a glance"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/saved.js",
                                        lineNumber: 290,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 288,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-list",
                                children: items.map((it)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        onClick: ()=>setSelectedItinerary(it),
                                        className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-item-title",
                                                children: it.title || 'Untitled Itinerary'
                                            }, void 0, false, {
                                                fileName: "[project]/pages/saved.js",
                                                lineNumber: 299,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-item-destination",
                                                children: [
                                                    "📍 ",
                                                    it.destination || 'No destination specified'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/saved.js",
                                                lineNumber: 300,
                                                columnNumber: 21
                                            }, this),
                                            it.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-item-description",
                                                children: [
                                                    it.description.substring(0, 150),
                                                    it.description.length > 150 ? '...' : ''
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/saved.js",
                                                lineNumber: 304,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-item-meta",
                                                children: [
                                                    it.created_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "jsx-a6ca8fb2f3e23c7d",
                                                        children: [
                                                            "Created: ",
                                                            new Date(it.created_at).toLocaleDateString()
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/saved.js",
                                                        lineNumber: 310,
                                                        columnNumber: 25
                                                    }, this),
                                                    it.day_plans && Array.isArray(it.day_plans) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "jsx-a6ca8fb2f3e23c7d",
                                                        children: [
                                                            it.day_plans.length,
                                                            " day",
                                                            it.day_plans.length !== 1 ? 's' : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/saved.js",
                                                        lineNumber: 313,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/saved.js",
                                                lineNumber: 308,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "jsx-a6ca8fb2f3e23c7d" + " " + "itinerary-item-hint",
                                                children: "Click to view details →"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/saved.js",
                                                lineNumber: 316,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, it.id || it._id, true, {
                                        fileName: "[project]/pages/saved.js",
                                        lineNumber: 294,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 292,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/pages/saved.js",
                    lineNumber: 216,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/saved.js",
                lineNumber: 215,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4c19d780._.js.map