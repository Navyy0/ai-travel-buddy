module.exports = [
"[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("react/jsx-dev-runtime", () => require("react/jsx-dev-runtime"));

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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 13
                                },
                                children: [
                                    "Cost: $",
                                    a.cost ?? 0,
                                    " • Duration: ",
                                    a.duration_minutes,
                                    " min"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DayCard.jsx",
                                lineNumber: 11,
                                columnNumber: 13
                            }, this),
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
                                lineNumber: 12,
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
                        lineNumber: 16,
                        columnNumber: 12
                    }, this),
                    " $",
                    dayPlan.estimated_budget ?? 0
                ]
            }, void 0, true, {
                fileName: "[project]/components/DayCard.jsx",
                lineNumber: 16,
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
    '#007bff',
    '#28a745',
    '#ffc107',
    '#dc3545',
    '#6f42c1',
    '#fd7e14',
    '#20c997',
    '#e83e8c',
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
    const styleUrl = ("TURBOPACK compile-time value", "https://demotiles.maplibre.org/style.json") || 'https://demotiles.maplibre.org/style.json';
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
                        lineNumber: 290,
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
                                lineNumber: 292,
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
                                    lineNumber: 307,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 291,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MapView.jsx",
                lineNumber: 279,
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
                        lineNumber: 339,
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
                                        lineNumber: 342,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Sightseeing"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 343,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 341,
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
                                        lineNumber: 346,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Accommodation"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 347,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 345,
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
                                        lineNumber: 350,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Restaurant"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 351,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 349,
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
                                        lineNumber: 354,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        children: "Other"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 355,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 353,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 340,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MapView.jsx",
                lineNumber: 328,
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
                lineNumber: 360,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MapView.jsx",
        lineNumber: 276,
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
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ItineraryCard$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ItineraryCard.jsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MapView$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MapView.jsx [ssr] (ecmascript)");
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
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.replace('/login');
            return;
        }
        // fetch saved itineraries; prefer cookie-based auth if backend set HttpOnly cookie
        fetch(`${apiUrl}/itineraries`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            credentials: 'include'
        }).then((r)=>r.json()).then((data)=>setItems(data || [])).catch(()=>setItems([]));
    }, [
        router,
        apiUrl
    ]);
    if (!items) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            padding: 20
        },
        children: "Loading…"
    }, void 0, false, {
        fileName: "[project]/pages/saved.js",
        lineNumber: 26,
        columnNumber: 22
    }, this);
    if (!items.length) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            padding: 20
        },
        children: "No saved itineraries."
    }, void 0, false, {
        fileName: "[project]/pages/saved.js",
        lineNumber: 28,
        columnNumber: 29
    }, this);
    // If an itinerary is selected, show its details
    if (selectedItinerary) {
        // Extract places and routes for map with enhanced metadata
        const places = [];
        const routes = [];
        let globalOrder = 1;
        const dayPlans = Array.isArray(selectedItinerary.day_plans) ? selectedItinerary.day_plans : [];
        dayPlans.forEach((dp)=>{
            const day = dp.day || 1;
            const activities = Array.isArray(dp?.activities) ? dp.activities : [];
            activities.forEach((a)=>{
                // Backend returns 'lon', but we check for both 'lon' and 'lng'
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
                // Backend uses 'route_geojson' not 'route'
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
            style: {
                padding: 20,
                maxWidth: 900,
                margin: '0 auto'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                    onClick: ()=>setSelectedItinerary(null),
                    style: {
                        marginBottom: 20
                    },
                    children: "← Back to List"
                }, void 0, false, {
                    fileName: "[project]/pages/saved.js",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ItineraryCard$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                    itinerary: selectedItinerary
                }, void 0, false, {
                    fileName: "[project]/pages/saved.js",
                    lineNumber: 76,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        marginTop: 20
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MapView$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                        places: places,
                        routes: routes,
                        height: 400
                    }, void 0, false, {
                        fileName: "[project]/pages/saved.js",
                        lineNumber: 78,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/pages/saved.js",
                    lineNumber: 77,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/pages/saved.js",
            lineNumber: 74,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            padding: 20,
            maxWidth: 900,
            margin: '0 auto'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: "Saved Itineraries"
            }, void 0, false, {
                fileName: "[project]/pages/saved.js",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                },
                children: items.map((it)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        onClick: ()=>setSelectedItinerary(it),
                        style: {
                            border: '1px solid #ddd',
                            borderRadius: 8,
                            padding: 16,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: '#fff'
                        },
                        onMouseEnter: (e)=>{
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                            e.currentTarget.style.borderColor = '#007bff';
                        },
                        onMouseLeave: (e)=>{
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.borderColor = '#ddd';
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                style: {
                                    margin: 0,
                                    marginBottom: 8
                                },
                                children: it.title || 'Untitled Itinerary'
                            }, void 0, false, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                style: {
                                    margin: 0,
                                    color: '#666',
                                    marginBottom: 4
                                },
                                children: it.destination || 'No destination specified'
                            }, void 0, false, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            it.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                style: {
                                    margin: 0,
                                    color: '#888',
                                    fontSize: '0.9em'
                                },
                                children: [
                                    it.description.substring(0, 100),
                                    it.description.length > 100 ? '...' : ''
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 112,
                                columnNumber: 15
                            }, this),
                            it.created_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                style: {
                                    margin: 0,
                                    marginTop: 8,
                                    fontSize: '0.85em',
                                    color: '#999'
                                },
                                children: [
                                    "Created: ",
                                    new Date(it.created_at).toLocaleDateString()
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 115,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                style: {
                                    margin: 0,
                                    marginTop: 4,
                                    fontSize: '0.85em',
                                    color: '#999'
                                },
                                children: "Click to view details →"
                            }, void 0, false, {
                                fileName: "[project]/pages/saved.js",
                                lineNumber: 119,
                                columnNumber: 13
                            }, this)
                        ]
                    }, it.id || it._id, true, {
                        fileName: "[project]/pages/saved.js",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/pages/saved.js",
                lineNumber: 87,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/saved.js",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1b7801c1._.js.map