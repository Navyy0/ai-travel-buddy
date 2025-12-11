(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_context__.s([
    "connect",
    ()=>connect,
    "setHooks",
    ()=>setHooks,
    "subscribeToUpdate",
    ()=>subscribeToUpdate
]);
function connect({ addMessageListener, sendMessage, onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case 'turbopack-connected':
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn('[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.');
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error('A separate HMR handler was already registered');
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: 'turbopack-subscribe',
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: 'turbopack-unsubscribe',
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: 'ChunkListUpdate',
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted' || updateA.type === 'deleted' && updateB.type === 'added') {
        return undefined;
    }
    if (updateA.type === 'partial') {
        invariant(updateA.instruction, 'Partial updates are unsupported');
    }
    if (updateB.type === 'partial') {
        invariant(updateB.instruction, 'Partial updates are unsupported');
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: 'EcmascriptMergedUpdate',
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === 'added' && updateB.type === 'deleted') {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === 'deleted' && updateB.type === 'added') {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: 'partial',
            added,
            deleted
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'partial') {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: 'partial',
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === 'added' && updateB.type === 'partial') {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: 'added',
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === 'partial' && updateB.type === 'deleted') {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: 'deleted',
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    'bug',
    'error',
    'fatal'
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    'bug',
    'fatal',
    'error',
    'warning',
    'info',
    'log'
];
const CATEGORY_ORDER = [
    'parse',
    'resolve',
    'code generation',
    'rendering',
    'typescript',
    'other'
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case 'issues':
            break;
        case 'partial':
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkListPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkListPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === 'notFound') {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}),
"[project]/components/MapView.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MapView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/maplibre-gl/dist/maplibre-gl.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
    _s();
    const mapContainer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [selectedDay, setSelectedDay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Use free MapLibre style - data from backend (which uses Ola)
    const styleUrl = 'https://demotiles.maplibre.org/style.json';
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MapView.useEffect": ()=>{
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
            let validPlaces = places.filter({
                "MapView.useEffect.validPlaces": (p)=>{
                    const lat = p.lat;
                    const lon = p.lon || p.lng;
                    return lat != null && lon != null && !isNaN(lat) && !isNaN(lon);
                }
            }["MapView.useEffect.validPlaces"]);
            // Apply day filter if selected
            if (selectedDay !== null) {
                validPlaces = validPlaces.filter({
                    "MapView.useEffect": (p)=>(p.day || 1) === selectedDay
                }["MapView.useEffect"]);
            }
            if (validPlaces.length === 0) {
                // If no valid places, show default map
                map.current = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Map({
                    container: mapContainer.current,
                    style: styleUrl,
                    center: [
                        0,
                        0
                    ],
                    zoom: 2
                });
                return ({
                    "MapView.useEffect": ()=>{
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
                    }
                })["MapView.useEffect"];
            }
            // Calculate bounds to fit all places
            const lons = validPlaces.map({
                "MapView.useEffect.lons": (p)=>p.lon || p.lng
            }["MapView.useEffect.lons"]);
            const lats = validPlaces.map({
                "MapView.useEffect.lats": (p)=>p.lat
            }["MapView.useEffect.lats"]);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            // Initialize map
            map.current = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Map({
                container: mapContainer.current,
                style: styleUrl,
                center: [
                    (minLon + maxLon) / 2,
                    (minLat + maxLat) / 2
                ],
                zoom: 10
            });
            // Function to add markers and routes
            const addMarkersAndRoutes = {
                "MapView.useEffect.addMarkersAndRoutes": ()=>{
                    console.log('MapView: Adding markers for', validPlaces.length, 'places');
                    console.log('MapView: Places data:', validPlaces);
                    if (validPlaces.length === 0) {
                        console.warn('MapView: No valid places to display on map!');
                        return;
                    }
                    // Add markers for each place with enhanced styling
                    validPlaces.forEach({
                        "MapView.useEffect.addMarkersAndRoutes": (place, index)=>{
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
                                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Marker(el).setLngLat([
                                    lon,
                                    lat
                                ]).setPopup(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].Popup({
                                    offset: 25
                                }).setHTML(popupContent)).addTo(map.current);
                            }
                        }
                    }["MapView.useEffect.addMarkersAndRoutes"]);
                    // Filter routes by selected day if filter is active
                    const filteredRoutes = selectedDay !== null ? routes.filter({
                        "MapView.useEffect.addMarkersAndRoutes": (r)=>(r.day || 1) === selectedDay
                    }["MapView.useEffect.addMarkersAndRoutes"]) : routes;
                    // Add route lines if provided (color-coded by day)
                    filteredRoutes.forEach({
                        "MapView.useEffect.addMarkersAndRoutes": (route, idx)=>{
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
                        }
                    }["MapView.useEffect.addMarkersAndRoutes"]);
                    // Fit map to show all markers
                    if (validPlaces.length > 1) {
                        const bounds = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$maplibre$2d$gl$2f$dist$2f$maplibre$2d$gl$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].LngLatBounds();
                        validPlaces.forEach({
                            "MapView.useEffect.addMarkersAndRoutes": (p)=>{
                                bounds.extend([
                                    p.lon || p.lng,
                                    p.lat
                                ]);
                            }
                        }["MapView.useEffect.addMarkersAndRoutes"]);
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
                }
            }["MapView.useEffect.addMarkersAndRoutes"];
            // Wait for map to load before adding markers and routes (defensive checks)
            if (map.current && typeof map.current.loaded === 'function' && map.current.loaded()) {
                // Map already loaded, add markers immediately
                addMarkersAndRoutes();
            } else if (map.current && typeof map.current.on === 'function') {
                // Map not loaded yet, wait for load event
                map.current.on('load', addMarkersAndRoutes);
            }
            return ({
                "MapView.useEffect": ()=>{
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
                }
            })["MapView.useEffect"];
        }
    }["MapView.useEffect"], [
        places,
        routes,
        styleUrl,
        selectedDay
    ]);
    // Get unique days for legend
    const uniqueDays = [
        ...new Set(places.map((p)=>p.day || 1))
    ].sort((a, b)=>a - b);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'relative'
        },
        children: [
            uniqueDays.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '4px',
                            flexWrap: 'wrap',
                            maxWidth: '200px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                            uniqueDays.map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_s(MapView, "i6Yt9TV66rUz3FnP4bvcgNHKx0Q=");
_c = MapView;
var _c;
__turbopack_context__.k.register(_c, "MapView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DayCard.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DayCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
;
function DayCard({ dayPlan }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            borderTop: '1px solid #f1f1f1',
            paddingTop: 12,
            marginTop: 12
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: dayPlan.theme
            }, void 0, false, {
                fileName: "[project]/components/DayCard.jsx",
                lineNumber: 5,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                children: (dayPlan.activities || []).map((a, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        style: {
                            marginBottom: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                            a.place_info && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
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
_c = DayCard;
var _c;
__turbopack_context__.k.register(_c, "DayCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ItineraryCard.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ItineraryCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DayCard$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DayCard.jsx [client] (ecmascript)");
;
;
function ItineraryCard({ itinerary }) {
    if (!itinerary) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            border: '1px solid #eee',
            padding: 12,
            borderRadius: 6
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: itinerary.title || 'Itinerary'
            }, void 0, false, {
                fileName: "[project]/components/ItineraryCard.jsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: itinerary.description
            }, void 0, false, {
                fileName: "[project]/components/ItineraryCard.jsx",
                lineNumber: 9,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: (itinerary.day_plans || []).map((dp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DayCard$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
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
_c = ItineraryCard;
var _c;
__turbopack_context__.k.register(_c, "ItineraryCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/context/AuthProvider.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthContext",
    ()=>AuthContext,
    "AuthProvider",
    ()=>AuthProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["createContext"])({
    token: null,
    user: null,
    setToken: ()=>{},
    clearToken: ()=>{}
});
function AuthProvider({ children }) {
    _s();
    const [token, setTokenState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Fetch user profile using HttpOnly cookie (no Authorization header)
    const fetchUser = async ()=>{
        try {
            const res = await fetch(`${apiUrl}/auth/me`, {
                credentials: 'include'
            });
            if (!res.ok) {
                setUser(null);
                return;
            }
            const data = await res.json();
            setUser(data);
        } catch (e) {
            console.warn('AuthProvider: failed to fetch user', e);
            setUser(null);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            // On mount, try to fetch current user via cookie-based session
            fetchUser();
        }
    }["AuthProvider.useEffect"], []);
    const setToken = (t)=>{
        // Token is managed by HttpOnly cookie set by backend. Trigger user refresh.
        setTokenState(t);
        fetchUser();
    };
    const clearToken = ()=>{
        // Clear local state; backend cookie invalidation can be added separately
        setTokenState(null);
        setUser(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            token,
            user,
            setToken,
            clearToken
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/context/AuthProvider.jsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "vZzJNs3DWVKWJ75MxrfzZAEA6Xw=");
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SiteHeader.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SiteHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AuthProvider.jsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function SiteHeader() {
    _s();
    const { user, clearToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["AuthContext"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        style: {
            background: 'rgba(255,255,255,0.9)',
            borderBottom: '1px solid rgba(15,23,42,0.06)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        fontSize: 18,
                        fontWeight: 800
                    },
                    className: "logo",
                    children: "✈️ Trip Planner"
                }, void 0, false, {
                    fileName: "[project]/components/SiteHeader.jsx",
                    lineNumber: 10,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    },
                    children: user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/saved",
                                style: {
                                    padding: '0.45rem 0.8rem',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8,
                                    textDecoration: 'none'
                                },
                                children: "📋 Saved"
                            }, void 0, false, {
                                fileName: "[project]/components/SiteHeader.jsx",
                                lineNumber: 15,
                                columnNumber: 15
                            }, this),
                            user.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/admin",
                                style: {
                                    padding: '0.45rem 0.8rem',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8,
                                    textDecoration: 'none'
                                },
                                children: "🛠️ Admin"
                            }, void 0, false, {
                                fileName: "[project]/components/SiteHeader.jsx",
                                lineNumber: 17,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    fontSize: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: 'var(--text-tertiary)'
                                        },
                                        children: "Welcome"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SiteHeader.jsx",
                                        lineNumber: 20,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontWeight: 700
                                        },
                                        children: user.full_name || user.email
                                    }, void 0, false, {
                                        fileName: "[project]/components/SiteHeader.jsx",
                                        lineNumber: 21,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SiteHeader.jsx",
                                lineNumber: 19,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: clearToken,
                                style: {
                                    marginLeft: 8,
                                    padding: '0.45rem 0.8rem',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)'
                                },
                                children: "Logout"
                            }, void 0, false, {
                                fileName: "[project]/components/SiteHeader.jsx",
                                lineNumber: 23,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/login",
                        style: {
                            padding: '0.5rem 0.9rem',
                            background: 'var(--primary)',
                            color: '#fff',
                            borderRadius: 8,
                            textDecoration: 'none'
                        },
                        children: "Sign in"
                    }, void 0, false, {
                        fileName: "[project]/components/SiteHeader.jsx",
                        lineNumber: 26,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/SiteHeader.jsx",
                    lineNumber: 12,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/SiteHeader.jsx",
            lineNumber: 9,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/SiteHeader.jsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_s(SiteHeader, "QVUxtqJivXj8CzwrtYtdlidYrHw=");
_c = SiteHeader;
var _c;
__turbopack_context__.k.register(_c, "SiteHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/results.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Results
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MapView$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MapView.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ItineraryCard$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ItineraryCard.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SiteHeader$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SiteHeader.jsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function Results() {
    _s();
    const [itinerary, setItinerary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saveMsg, setSaveMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [regenerating, setRegenerating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [packing, setPacking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [packingLoading, setPackingLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [packingError, setPackingError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [downloadingPdf, setDownloadingPdf] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
    // Load itinerary from session storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Results.useEffect": ()=>{
            try {
                const raw = sessionStorage.getItem('latest_itinerary');
                if (raw) setItinerary(JSON.parse(raw));
            } catch (e) {
                console.error(e);
            }
        }
    }["Results.useEffect"], []);
    // Derive dayPlans, places and routes using useMemo so effects can depend on them
    // NOTE: These MUST be before any conditional returns (Rules of Hooks)
    const dayPlans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Results.useMemo[dayPlans]": ()=>Array.isArray(itinerary?.day_plans) ? itinerary.day_plans : []
    }["Results.useMemo[dayPlans]"], [
        itinerary
    ]);
    const { places, routes } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Results.useMemo": ()=>{
            const p = [];
            const r = [];
            let globalOrder = 1;
            try {
                dayPlans.forEach({
                    "Results.useMemo": (dp)=>{
                        const day = dp.day || 1;
                        const activities = Array.isArray(dp?.activities) ? dp.activities : [];
                        activities.forEach({
                            "Results.useMemo": (a)=>{
                                const placeInfo = a?.place_info || {};
                                const lat = placeInfo?.lat;
                                const lon = placeInfo?.lon ?? placeInfo?.lng;
                                if (lat != null && lon != null && typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon)) {
                                    p.push({
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
                                if (routeGeometry) r.push({
                                    geometry: routeGeometry,
                                    day
                                });
                            }
                        }["Results.useMemo"]);
                    }
                }["Results.useMemo"]);
            } catch (e) {
                console.error('Error computing places/routes', e);
            }
            return {
                places: p,
                routes: r
            };
        }
    }["Results.useMemo"], [
        dayPlans
    ]);
    console.log(`Total places found: ${places.length}, Total routes: ${routes.length}`);
    // Automatically fetch packing suggestions based on itinerary and available place coords
    async function fetchPackingSuggestions() {
        setPackingLoading(true);
        setPackingError(null);
        setPacking(null);
        try {
            let lat = null, lon = null;
            if (itinerary && itinerary.destination && (itinerary.destination.lat || itinerary.destination.lon)) {
                lat = itinerary.destination.lat || itinerary.destination.latitude || null;
                lon = itinerary.destination.lon || itinerary.destination.longitude || null;
            }
            if ((lat == null || lon == null) && places.length > 0) {
                lat = places[0].lat;
                lon = places[0].lng;
            }
            let start = itinerary?.start_date || itinerary?.startDate || null;
            let end = itinerary?.end_date || itinerary?.endDate || null;
            if (!start || !end) {
                try {
                    const firstDay = dayPlans[0];
                    const lastDay = dayPlans[dayPlans.length - 1];
                    if (firstDay && firstDay.date) start = firstDay.date;
                    if (lastDay && lastDay.date) end = lastDay.date;
                } catch (e) {}
            }
            if (!lat || !lon) {
                setPackingError('No location available for packing suggestions');
                return;
            }
            if (!start) start = new Date().toISOString().slice(0, 10);
            if (!end) {
                const d = new Date(start);
                d.setDate(d.getDate() + 2);
                end = d.toISOString().slice(0, 10);
            }
            const resp = await fetch(`${apiUrl || ''}/weather/packing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    location: {
                        lat: Number(lat),
                        lon: Number(lon)
                    },
                    start_date: start,
                    end_date: end,
                    use_gemini: true
                })
            });
            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(`Weather API error: ${resp.status} ${txt}`);
            }
            const data = await resp.json();
            if (!data.ok) throw new Error('Invalid response from packing API');
            setPacking(data.data);
        } catch (e) {
            console.error('Packing error', e);
            setPackingError(String(e));
        } finally{
            setPackingLoading(false);
        }
    }
    // Trigger packing fetch when itinerary or places change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Results.useEffect": ()=>{
            if (!itinerary) return;
            if (packing || packingLoading || packingError) return;
            fetchPackingSuggestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["Results.useEffect"], [
        itinerary,
        places.length,
        places[0]?.lat,
        places[0]?.lng
    ]);
    // Early return if no itinerary loaded
    if (!itinerary) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: 20
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 900,
                margin: '0 auto'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 220,
                        borderRadius: 12,
                        background: 'linear-gradient(90deg,#f3f4f6,#e6eef8)',
                        marginBottom: 12
                    }
                }, void 0, false, {
                    fileName: "[project]/pages/results.js",
                    lineNumber: 140,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: 12
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        height: 14,
                                        width: '60%',
                                        background: '#e6eef8',
                                        borderRadius: 6,
                                        marginBottom: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 143,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        height: 12,
                                        width: '40%',
                                        background: '#eef6fb',
                                        borderRadius: 6,
                                        marginBottom: 8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 144,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        height: 12,
                                        width: '90%',
                                        background: '#eef6fb',
                                        borderRadius: 6
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 142,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 320
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    height: 40,
                                    background: '#e6eef8',
                                    borderRadius: 8
                                }
                            }, void 0, false, {
                                fileName: "[project]/pages/results.js",
                                lineNumber: 148,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/results.js",
                    lineNumber: 141,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: '#475569',
                        marginTop: 12
                    },
                    children: [
                        "No itinerary found. Create one on the ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "/",
                            children: "planner"
                        }, void 0, false, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 151,
                            columnNumber: 92
                        }, this),
                        "."
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/results.js",
                    lineNumber: 151,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/pages/results.js",
            lineNumber: 139,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/pages/results.js",
        lineNumber: 138,
        columnNumber: 5
    }, this);
    async function downloadPdf() {
        setDownloadingPdf(true);
        try {
            // Dynamically import html2pdf
            const html2pdf = (await __turbopack_context__.A("[project]/node_modules/html2pdf.js/dist/html2pdf.js [client] (ecmascript, async loader)")).default;
            // Create a container with the itinerary content
            const element = document.createElement('div');
            element.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1>${itinerary.title || 'Itinerary'}</h1>
          <p><strong>Destination:</strong> ${itinerary.destination?.place_name || itinerary.destination || 'N/A'}</p>
          <p><strong>Dates:</strong> ${itinerary.start_date || itinerary.startDate || 'N/A'} to ${itinerary.end_date || itinerary.endDate || 'N/A'}</p>
          
          ${(itinerary.day_plans || []).map((day, idx)=>`
            <div style="page-break-inside: avoid; margin-top: 20px;">
              <h2>Day ${day.day || idx + 1}</h2>
              ${(day.activities || []).map((activity)=>`
                <div style="margin-left: 20px; margin-bottom: 15px;">
                  <h3>${activity.title || 'Activity'}</h3>
                  <p><strong>Time:</strong> ${activity.time || 'N/A'}</p>
                  <p><strong>Duration:</strong> ${activity.duration_minutes || activity.duration || 'N/A'} minutes</p>
                  <p><strong>Type:</strong> ${activity.activity_type || activity.activityType || 'N/A'}</p>
                  <p>${activity.description || ''}</p>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `;
            const options = {
                margin: 10,
                filename: `${(itinerary.title || 'itinerary').replace(/[^a-z0-9]/gi, '_')}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2
                },
                jsPDF: {
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                }
            };
            html2pdf().set(options).from(element).save();
        } catch (e) {
            console.error('PDF download error', e);
            setSaveMsg('Failed to generate PDF');
        } finally{
            setDownloadingPdf(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "13c880358c44fc36",
                children: ".results-container.jsx-13c880358c44fc36{--primary:#06b6d4;--primary-light:#60a5fa;--accent:#f59e0b;--surface:#fff;--surface-elevated:linear-gradient(180deg,#fffffff2,#fafafffa);--border:#0f172a0f;--border-light:#0f172a08;--text-primary:#0f172a;--text-secondary:#475569;--text-tertiary:#6b7280;--radius-md:12px;--radius-xl:18px;--shadow-md:0 6px 18px #0814280f;--shadow-lg:0 12px 30px #08142814;min-height:100vh;color:var(--text-primary);background:linear-gradient(135deg,#f0f9ff 0%,#fef3c7 100%);padding:2rem}.results-content.jsx-13c880358c44fc36{max-width:1200px;margin:0 auto}.results-header.jsx-13c880358c44fc36{background:var(--surface-elevated);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border:1px solid var(--border);grid-template-columns:1fr 320px;align-items:start;gap:1rem;margin-bottom:1.5rem;padding:1.5rem;display:grid}.header-actions.jsx-13c880358c44fc36{flex-direction:column;align-items:stretch;gap:.75rem;margin-top:.25rem;display:flex}.btn-primary.jsx-13c880358c44fc36{background:linear-gradient(135deg,var(--primary)0%,var(--primary-light)100%);color:#fff;cursor:pointer;box-shadow:var(--shadow-md);border:none;border-radius:12px;padding:.85rem 1.5rem;font-size:.95rem;font-weight:700;transition:transform .18s,box-shadow .18s}.btn-primary.jsx-13c880358c44fc36:hover:not(:disabled){box-shadow:var(--shadow-lg);transform:translateY(-3px)}.btn-primary.jsx-13c880358c44fc36:disabled{opacity:.6;cursor:not-allowed}.btn-secondary.jsx-13c880358c44fc36{color:var(--text-primary);border:1px solid var(--border);cursor:pointer;background:0 0;border-radius:12px;padding:.75rem 1rem;font-weight:700}.save-message.jsx-13c880358c44fc36{color:#059669;background:#10b98114;border:1px solid #10b9812e;border-radius:10px;align-items:center;padding:.6rem .85rem;font-size:.9rem;display:inline-flex}.save-message.error.jsx-13c880358c44fc36{color:#ef4444;background:#ef44440f;border-color:#ef44441f}.back-link.jsx-13c880358c44fc36{color:var(--text-secondary);align-items:center;gap:.5rem;margin-top:.8rem;font-size:.95rem;text-decoration:none;display:inline-flex}.back-link.jsx-13c880358c44fc36:hover{color:var(--primary)}.map-section.jsx-13c880358c44fc36{border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border:1px solid var(--border);background:linear-gradient(#ffffffe6,#fafafff2);margin-top:1.5rem;padding:1.5rem}.map-header.jsx-13c880358c44fc36{color:var(--text-secondary);margin-bottom:1rem;font-size:.95rem}.warning-box.jsx-13c880358c44fc36{background:#f59e0b14;border:1px solid #f59e0b24;border-radius:12px;margin-bottom:1rem;padding:1.25rem}.warning-box.jsx-13c880358c44fc36 strong.jsx-13c880358c44fc36{color:var(--text-primary);margin-bottom:.5rem;display:block}.day-pill.jsx-13c880358c44fc36{color:#fff;border-radius:999px;padding:6px 10px;font-size:.85rem;font-weight:700;display:inline-block}.day-pill.day-1.jsx-13c880358c44fc36{background:linear-gradient(90deg,#06b6d4,#60a5fa)}.day-pill.day-2.jsx-13c880358c44fc36{background:linear-gradient(90deg,#10b981,#34d399)}.day-pill.day-3.jsx-13c880358c44fc36{background:linear-gradient(90deg,#f59e0b,#fb923c)}.day-pill.day-4.jsx-13c880358c44fc36{background:linear-gradient(90deg,#ef4444,#fb7185)}.day-pill.day-5.jsx-13c880358c44fc36{background:linear-gradient(90deg,#f97316,#fb923c)}@media (width<=880px){.results-header.jsx-13c880358c44fc36{grid-template-columns:1fr}.header-actions.jsx-13c880358c44fc36{flex-direction:row;justify-content:space-between;align-items:center}.header-actions.jsx-13c880358c44fc36>button.jsx-13c880358c44fc36{flex:1}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SiteHeader$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/results.js",
                lineNumber: 335,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-13c880358c44fc36" + " " + "results-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-13c880358c44fc36" + " " + "results-content",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-13c880358c44fc36" + " " + "results-header",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ItineraryCard$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    itinerary: itinerary
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 339,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-13c880358c44fc36" + " " + "header-actions",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            disabled: saving,
                                            onClick: async ()=>{
                                                try {
                                                    setSaveMsg(null);
                                                    setSaving(true);
                                                    const headers = {
                                                        'Content-Type': 'application/json'
                                                    };
                                                    // Use cookie-based authentication; include credentials so HttpOnly cookie is sent
                                                    const resp = await fetch(`${apiUrl}/itineraries`, {
                                                        method: 'POST',
                                                        headers: headers,
                                                        body: JSON.stringify(itinerary),
                                                        credentials: 'include'
                                                    });
                                                    if (!resp.ok) {
                                                        const txt = await resp.text();
                                                        setSaveMsg(`Save failed: ${resp.status} ${txt}`);
                                                    } else {
                                                        const saved = await resp.json();
                                                        setSaveMsg('✓ Saved successfully!');
                                                        if (saved && (saved.id || saved._id)) {
                                                            const id = saved.id || saved._id;
                                                            sessionStorage.setItem('latest_saved_itinerary_id', id);
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                    setSaveMsg('Network error saving itinerary');
                                                } finally{
                                                    setSaving(false);
                                                }
                                            },
                                            className: "jsx-13c880358c44fc36" + " " + "btn-primary",
                                            children: saving ? 'Saving…' : '💾 Save Itinerary'
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 341,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: async ()=>{
                                                // Regenerate the itinerary using the last generation payload
                                                try {
                                                    setRegenerating(true);
                                                    setSaveMsg(null);
                                                    const rawPayload = sessionStorage.getItem('latest_generation_payload');
                                                    let payload = null;
                                                    if (rawPayload) {
                                                        payload = JSON.parse(rawPayload);
                                                    } else {
                                                        // Try to derive a minimal payload from the displayed itinerary
                                                        payload = {
                                                            destination: itinerary.destination || itinerary.title || '',
                                                            start_date: itinerary.start_date || itinerary.startDate || '',
                                                            end_date: itinerary.end_date || itinerary.endDate || '',
                                                            preferences: itinerary.preferences || []
                                                        };
                                                    }
                                                    if (!payload || !payload.destination) {
                                                        setSaveMsg('No generation payload available to regenerate');
                                                        return;
                                                    }
                                                    const resp = await fetch(`${apiUrl}/generate`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify(payload),
                                                        credentials: 'include'
                                                    });
                                                    if (!resp.ok) {
                                                        const txt = await resp.text();
                                                        setSaveMsg(`Regenerate failed: ${resp.status} ${txt}`);
                                                        return;
                                                    }
                                                    const newItin = await resp.json();
                                                    sessionStorage.setItem('latest_itinerary', JSON.stringify(newItin));
                                                    // update latest payload too
                                                    try {
                                                        sessionStorage.setItem('latest_generation_payload', JSON.stringify(payload));
                                                    } catch (e) {}
                                                    setItinerary(newItin);
                                                    setSaveMsg('✓ Regenerated successfully');
                                                } catch (e) {
                                                    console.error('Regenerate error', e);
                                                    setSaveMsg('Network error during regenerate');
                                                } finally{
                                                    setRegenerating(false);
                                                }
                                            },
                                            className: "jsx-13c880358c44fc36" + " " + "btn-secondary",
                                            children: regenerating ? 'Regenerating…' : '🔁 Regenerate'
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 377,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: downloadPdf,
                                            disabled: downloadingPdf,
                                            className: "jsx-13c880358c44fc36" + " " + "btn-secondary",
                                            children: downloadingPdf ? 'Generating PDF…' : '📄 Download PDF'
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 432,
                                            columnNumber: 15
                                        }, this),
                                        saveMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-13c880358c44fc36" + " " + `save-message ${saveMsg.includes('failed') || saveMsg.includes('error') ? 'error' : ''}`,
                                            children: saveMsg
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 440,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 340,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "/",
                                    className: "jsx-13c880358c44fc36" + " " + "back-link",
                                    children: "← Back to Planner"
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 445,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 338,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: 12,
                                marginBottom: 12
                            },
                            className: "jsx-13c880358c44fc36",
                            children: [
                                packingLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: 12,
                                        borderRadius: 8,
                                        background: '#f8fafc'
                                    },
                                    className: "jsx-13c880358c44fc36",
                                    children: "Loading packing suggestions…"
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 452,
                                    columnNumber: 32
                                }, this),
                                packingError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: 12,
                                        borderRadius: 8,
                                        background: '#fff1f2',
                                        color: '#b91c1c'
                                    },
                                    className: "jsx-13c880358c44fc36",
                                    children: packingError
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 453,
                                    columnNumber: 30
                                }, this),
                                packing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: 16,
                                        borderRadius: 8,
                                        background: '#ffffff',
                                        border: '1px solid rgba(15,23,42,0.06)',
                                        boxShadow: '0 6px 18px rgba(8, 20, 40, 0.06)'
                                    },
                                    className: "jsx-13c880358c44fc36",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                fontSize: '1.1rem'
                                            },
                                            className: "jsx-13c880358c44fc36",
                                            children: "📦 Packing Suggestions"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 456,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                marginTop: 12
                                            },
                                            className: "jsx-13c880358c44fc36",
                                            children: [
                                                packing.suggested_items && packing.suggested_items.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            marginBottom: 12
                                                        },
                                                        className: "jsx-13c880358c44fc36",
                                                        children: packing.suggested_items.map((it)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'inline-block',
                                                                    padding: '6px 12px',
                                                                    background: '#e0f2fe',
                                                                    borderRadius: '6px',
                                                                    marginRight: '8px',
                                                                    marginBottom: '8px',
                                                                    fontSize: '0.9rem'
                                                                },
                                                                className: "jsx-13c880358c44fc36",
                                                                children: [
                                                                    "✓ ",
                                                                    it
                                                                ]
                                                            }, it, true, {
                                                                fileName: "[project]/pages/results.js",
                                                                lineNumber: 462,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/results.js",
                                                        lineNumber: 460,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-13c880358c44fc36",
                                                    children: "No suggestions available."
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/results.js",
                                                    lineNumber: 469,
                                                    columnNumber: 21
                                                }, this),
                                                packing.enriched_text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        marginTop: 12,
                                                        whiteSpace: 'pre-wrap',
                                                        color: '#334155',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.6'
                                                    },
                                                    className: "jsx-13c880358c44fc36",
                                                    children: packing.enriched_text
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/results.js",
                                                    lineNumber: 472,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 457,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 455,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 451,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-13c880358c44fc36" + " " + "map-section",
                            children: [
                                places.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-13c880358c44fc36" + " " + "warning-box",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "jsx-13c880358c44fc36",
                                            children: "No places found on map"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 482,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-13c880358c44fc36",
                                            children: "The itinerary activities don't have location coordinates. This might happen if:"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 483,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                            className: "jsx-13c880358c44fc36",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "jsx-13c880358c44fc36",
                                                    children: "Location search failed during itinerary generation"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/results.js",
                                                    lineNumber: 487,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "jsx-13c880358c44fc36",
                                                    children: "Activities don't have valid location information"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/results.js",
                                                    lineNumber: 488,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 486,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                marginTop: '0.75rem',
                                                fontSize: '0.85em',
                                                color: 'var(--text-tertiary)'
                                            },
                                            className: "jsx-13c880358c44fc36",
                                            children: "Check the browser console (F12) for detailed debugging information."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 490,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 481,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-13c880358c44fc36" + " " + "map-header",
                                    children: [
                                        "Showing ",
                                        places.length,
                                        " place",
                                        places.length !== 1 ? 's' : '',
                                        " on map"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 495,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MapView$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    places: places,
                                    routes: routes,
                                    height: 500
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 499,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 479,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/results.js",
                    lineNumber: 337,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/results.js",
                lineNumber: 336,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Results, "wdouJZ/iD1gALIl0avCuk8DeIxA=");
_c = Results;
var _c;
__turbopack_context__.k.register(_c, "Results");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/results.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/results";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/results.js [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}),
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/results\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/results.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__40b26ed3._.js.map