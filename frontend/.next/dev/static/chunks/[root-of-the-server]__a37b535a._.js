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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
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
    // Build style URL with API key
    let styleUrl = ("TURBOPACK compile-time value", "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=7ESZWDQZLm4OdPwfVF5yDpyBiLM0qOkm74TMC93i") || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MAP_STYLE_URL;
    // If using Ola Maps style but API key not in URL, add it
    if (styleUrl?.includes('api.olamaps.io') && !styleUrl.includes('api_key=')) {
        const apiKey = ("TURBOPACK compile-time value", "7ESZWDQZLm4OdPwfVF5yDpyBiLM0qOkm74TMC93i");
        styleUrl = `${styleUrl}?api_key=${apiKey}`;
    }
    // Fallback to demo tiles if no style configured
    styleUrl = styleUrl || 'https://demotiles.maplibre.org/style.json';
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
                        lineNumber: 301,
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
                                lineNumber: 303,
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
                                    lineNumber: 318,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 302,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MapView.jsx",
                lineNumber: 290,
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
                        lineNumber: 350,
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
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Sightseeing"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 354,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 352,
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
                                        lineNumber: 357,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Accommodation"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 358,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 356,
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
                                        lineNumber: 361,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Restaurant"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 362,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 360,
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
                                        lineNumber: 365,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Other"
                                    }, void 0, false, {
                                        fileName: "[project]/components/MapView.jsx",
                                        lineNumber: 366,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/MapView.jsx",
                                lineNumber: 364,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MapView.jsx",
                        lineNumber: 351,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MapView.jsx",
                lineNumber: 339,
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
                lineNumber: 371,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/MapView.jsx",
        lineNumber: 287,
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
"[project]/utils/buildStaticMapUrl.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Build Ola Maps static map URL
 * 
 * @param {Object} options
 * @param {number} options.lat - Center latitude
 * @param {number} options.lon - Center longitude
 * @param {number} options.zoom - Zoom level (default 14)
 * @param {number} options.width - Image width in pixels (default 800)
 * @param {number} options.height - Image height in pixels (default 600)
 * @param {Array} options.markers - Array of {lat, lon} for markers
 * @param {Array} options.path - Array of {lat, lon} for path/route
 * @param {string} options.apiKey - Ola Maps API key
 * @returns {string} Complete static map URL
 */ __turbopack_context__.s([
    "buildStaticMapUrl",
    ()=>buildStaticMapUrl
]);
function buildStaticMapUrl({ lat, lon, zoom = 14, width = 800, height = 600, markers = [], path = [], apiKey }) {
    if (!apiKey) {
        console.error('buildStaticMapUrl: apiKey is required');
        return '';
    }
    if (lat === undefined || lon === undefined) {
        console.error('buildStaticMapUrl: lat and lon are required');
        return '';
    }
    // Base URL: https://api.olamaps.io/tiles/v1/styles/default-light-standard/static/{lon},{lat},{zoom}/{width}x{height}.png
    let url = `https://api.olamaps.io/tiles/v1/styles/default-light-standard/static/${lon},${lat},${zoom}/${width}x${height}.png`;
    // Add API key
    url += `?api_key=${apiKey}`;
    // Add markers
    if (markers && Array.isArray(markers) && markers.length > 0) {
        markers.forEach((marker)=>{
            if (marker.lat !== undefined && marker.lon !== undefined) {
                url += `&marker=${marker.lon},${marker.lat}|red|scale:0.9`;
            }
        });
    }
    // Add path/route
    if (path && Array.isArray(path) && path.length > 0) {
        const pathStr = path.filter((p)=>p.lat !== undefined && p.lon !== undefined).map((p)=>`${p.lon},${p.lat}`).join('|');
        if (pathStr) {
            url += `&path=${pathStr}|width:6|stroke:%230044ff`;
        }
    }
    return url;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/StaticMap.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StaticMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$buildStaticMapUrl$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/buildStaticMapUrl.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function StaticMap({ lat, lon, zoom = 14, width = 800, height = 600, markers = [], path = [], className = '', showLoader = true }) {
    _s();
    const containerId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(`static-map-${Math.random().toString(36).slice(2)}`);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imageUrl, setImageUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StaticMap.useEffect": ()=>{
            if (lat === undefined || lon === undefined) {
                setError('Missing required props: lat and lon');
                setLoading(false);
                return;
            }
            const apiKey = ("TURBOPACK compile-time value", "7ESZWDQZLm4OdPwfVF5yDpyBiLM0qOkm74TMC93i");
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                // Build the static map URL
                const url = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$buildStaticMapUrl$2e$js__$5b$client$5d$__$28$ecmascript$29$__["buildStaticMapUrl"])({
                    lat,
                    lon,
                    zoom,
                    width,
                    height,
                    markers,
                    path,
                    apiKey
                });
                if (!url) {
                    setError('Failed to build map URL');
                    setLoading(false);
                    return;
                }
                setImageUrl(url);
                setLoading(false);
            } catch (err) {
                console.error('StaticMap error:', err);
                setError(`Error: ${err.message}`);
                setLoading(false);
            }
        }
    }["StaticMap.useEffect"], [
        lat,
        lon,
        zoom,
        width,
        height,
        markers,
        path
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: containerId.current,
        className: `static-map ${className}`,
        style: {
            position: 'relative',
            width: '100%',
            maxWidth: `${width}px`,
            overflow: 'hidden'
        },
        children: [
            loading && showLoader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: `${height}px`,
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#666'
                },
                children: "Loading map..."
            }, void 0, false, {
                fileName: "[project]/components/StaticMap.jsx",
                lineNumber: 88,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: `${height}px`,
                    backgroundColor: '#ffe6e6',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#cc0000',
                    padding: '12px',
                    textAlign: 'center'
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/components/StaticMap.jsx",
                lineNumber: 106,
                columnNumber: 9
            }, this),
            !error && imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: imageUrl,
                alt: "Static map",
                style: {
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px'
                },
                onLoad: ()=>{
                    setLoading(false);
                },
                onError: ()=>{
                    setError('Failed to load map image');
                }
            }, void 0, false, {
                fileName: "[project]/components/StaticMap.jsx",
                lineNumber: 126,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/StaticMap.jsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(StaticMap, "alsBNQ30NLZ7UA8LbwwECbxlzZI=");
_c = StaticMap;
var _c;
__turbopack_context__.k.register(_c, "StaticMap");
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StaticMap$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/StaticMap.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ItineraryCard$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ItineraryCard.jsx [client] (ecmascript)");
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
    const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
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
    if (!itinerary) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: 20
        },
        children: [
            "No itinerary found. Create one on the ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                href: "/",
                children: "planner"
            }, void 0, false, {
                fileName: "[project]/pages/results.js",
                lineNumber: 21,
                columnNumber: 90
            }, this),
            "."
        ]
    }, void 0, true, {
        fileName: "[project]/pages/results.js",
        lineNumber: 21,
        columnNumber: 26
    }, this);
    // collect places for map and any route geometries with enhanced metadata
    const places = [];
    const routes = [];
    let globalOrder = 1;
    // Safely process day plans
    const dayPlans = Array.isArray(itinerary.day_plans) ? itinerary.day_plans : [];
    console.log('Processing', dayPlans.length, 'day plans for map');
    dayPlans.forEach((dp)=>{
        const day = dp.day || 1;
        const activities = Array.isArray(dp?.activities) ? dp.activities : [];
        console.log(`Day ${day}: Processing ${activities.length} activities`);
        activities.forEach((a)=>{
            // Backend returns 'lon', but we check for both 'lon' and 'lng'
            const placeInfo = a?.place_info || {};
            const lat = placeInfo.lat;
            const lon = placeInfo.lon || placeInfo.lng;
            console.log(`Activity "${a.title}": lat=${lat}, lon=${lon}, place_info=`, placeInfo);
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
                console.log(`✓ Added place: ${a.title} at (${lat}, ${lon})`);
            } else {
                // Debug: log why place wasn't added
                console.warn('✗ Place not added - lat:', lat, 'lon:', lon, 'activity:', a.title, 'place_info:', placeInfo);
            }
            // Backend uses 'route_geojson' not 'route'
            const travel = a?.travel_from_previous || {};
            const routeGeometry = travel.route_geojson || travel.route;
            if (routeGeometry) {
                routes.push({
                    geometry: routeGeometry,
                    day: day
                });
                console.log(`✓ Added route for day ${day}`);
            }
        });
    });
    console.log(`Total places found: ${places.length}, Total routes: ${routes.length}`);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "13c880358c44fc36",
                children: ".results-container.jsx-13c880358c44fc36{--primary:#06b6d4;--primary-light:#60a5fa;--accent:#f59e0b;--surface:#fff;--surface-elevated:linear-gradient(180deg,#fffffff2,#fafafffa);--border:#0f172a0f;--border-light:#0f172a08;--text-primary:#0f172a;--text-secondary:#475569;--text-tertiary:#6b7280;--radius-md:12px;--radius-xl:18px;--shadow-md:0 6px 18px #0814280f;--shadow-lg:0 12px 30px #08142814;min-height:100vh;color:var(--text-primary);background:linear-gradient(135deg,#f0f9ff 0%,#fef3c7 100%);padding:2rem}.results-content.jsx-13c880358c44fc36{max-width:1200px;margin:0 auto}.results-header.jsx-13c880358c44fc36{background:var(--surface-elevated);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border:1px solid var(--border);grid-template-columns:1fr 320px;align-items:start;gap:1rem;margin-bottom:1.5rem;padding:1.5rem;display:grid}.header-actions.jsx-13c880358c44fc36{flex-direction:column;align-items:stretch;gap:.75rem;margin-top:.25rem;display:flex}.btn-primary.jsx-13c880358c44fc36{background:linear-gradient(135deg,var(--primary)0%,var(--primary-light)100%);color:#fff;cursor:pointer;box-shadow:var(--shadow-md);border:none;border-radius:12px;padding:.85rem 1.5rem;font-size:.95rem;font-weight:700;transition:transform .18s,box-shadow .18s}.btn-primary.jsx-13c880358c44fc36:hover:not(:disabled){box-shadow:var(--shadow-lg);transform:translateY(-3px)}.btn-primary.jsx-13c880358c44fc36:disabled{opacity:.6;cursor:not-allowed}.btn-secondary.jsx-13c880358c44fc36{color:var(--text-primary);border:1px solid var(--border);cursor:pointer;background:0 0;border-radius:12px;padding:.75rem 1rem;font-weight:700}.save-message.jsx-13c880358c44fc36{color:#059669;background:#10b98114;border:1px solid #10b9812e;border-radius:10px;align-items:center;padding:.6rem .85rem;font-size:.9rem;display:inline-flex}.save-message.error.jsx-13c880358c44fc36{color:#ef4444;background:#ef44440f;border-color:#ef44441f}.back-link.jsx-13c880358c44fc36{color:var(--text-secondary);align-items:center;gap:.5rem;margin-top:.8rem;font-size:.95rem;text-decoration:none;display:inline-flex}.back-link.jsx-13c880358c44fc36:hover{color:var(--primary)}.map-section.jsx-13c880358c44fc36{border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);border:1px solid var(--border);background:linear-gradient(#ffffffe6,#fafafff2);margin-top:1.5rem;padding:1.5rem}.map-header.jsx-13c880358c44fc36{color:var(--text-secondary);margin-bottom:1rem;font-size:.95rem}.warning-box.jsx-13c880358c44fc36{background:#f59e0b14;border:1px solid #f59e0b24;border-radius:12px;margin-bottom:1rem;padding:1.25rem}.warning-box.jsx-13c880358c44fc36 strong.jsx-13c880358c44fc36{color:var(--text-primary);margin-bottom:.5rem;display:block}.day-pill.jsx-13c880358c44fc36{color:#fff;border-radius:999px;padding:6px 10px;font-size:.85rem;font-weight:700;display:inline-block}.day-pill.day-1.jsx-13c880358c44fc36{background:linear-gradient(90deg,#06b6d4,#60a5fa)}.day-pill.day-2.jsx-13c880358c44fc36{background:linear-gradient(90deg,#10b981,#34d399)}.day-pill.day-3.jsx-13c880358c44fc36{background:linear-gradient(90deg,#f59e0b,#fb923c)}.day-pill.day-4.jsx-13c880358c44fc36{background:linear-gradient(90deg,#ef4444,#fb7185)}.day-pill.day-5.jsx-13c880358c44fc36{background:linear-gradient(90deg,#f97316,#fb923c)}@media (width<=880px){.results-header.jsx-13c880358c44fc36{grid-template-columns:1fr}.header-actions.jsx-13c880358c44fc36{flex-direction:row;justify-content:space-between;align-items:center}.header-actions.jsx-13c880358c44fc36>button.jsx-13c880358c44fc36{flex:1}}"
            }, void 0, false, void 0, this),
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
                                    lineNumber: 213,
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
                                                    const accessToken = localStorage.getItem('access_token');
                                                    const headers = {
                                                        'Content-Type': 'application/json'
                                                    };
                                                    if (accessToken) {
                                                        headers['Authorization'] = `Bearer ${accessToken}`;
                                                    }
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
                                            lineNumber: 215,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                try {
                                                    const content = JSON.stringify(itinerary, null, 2);
                                                    const blob = new Blob([
                                                        content
                                                    ], {
                                                        type: 'application/json'
                                                    });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    const safeTitle = itinerary && itinerary.title ? String(itinerary.title).replace(/[^a-z0-9_-]/gi, '_') : 'itinerary';
                                                    a.href = url;
                                                    a.download = `${safeTitle}-${Date.now()}.json`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    a.remove();
                                                    URL.revokeObjectURL(url);
                                                } catch (err) {
                                                    console.error('Export failed', err);
                                                    setSaveMsg && setSaveMsg('Export failed');
                                                }
                                            },
                                            className: "jsx-13c880358c44fc36" + " " + "btn-secondary",
                                            children: "📥 Export JSON"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 255,
                                            columnNumber: 15
                                        }, this),
                                        saveMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-13c880358c44fc36" + " " + `save-message ${saveMsg.includes('failed') || saveMsg.includes('error') ? 'error' : ''}`,
                                            children: saveMsg
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 279,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 214,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "/",
                                    className: "jsx-13c880358c44fc36" + " " + "back-link",
                                    children: "← Back to Planner"
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 284,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 212,
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
                                            lineNumber: 292,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-13c880358c44fc36",
                                            children: "The itinerary activities don't have location coordinates. This might happen if:"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 293,
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
                                                    lineNumber: 297,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                    className: "jsx-13c880358c44fc36",
                                                    children: "Activities don't have valid location information"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/results.js",
                                                    lineNumber: 298,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 296,
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
                                            lineNumber: 300,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 291,
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
                                    lineNumber: 305,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MapView$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                    places: places,
                                    routes: routes,
                                    height: 500
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 309,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 289,
                            columnNumber: 11
                        }, this),
                        dayPlans && dayPlans.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginTop: '2rem'
                            },
                            className: "jsx-13c880358c44fc36" + " " + "map-section",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-13c880358c44fc36" + " " + "map-header",
                                    children: "📸 Static Map Previews"
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 315,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '0.9rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '1.5rem'
                                    },
                                    className: "jsx-13c880358c44fc36",
                                    children: "Shareable map previews for each day"
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 316,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                                        gap: '2rem'
                                    },
                                    className: "jsx-13c880358c44fc36",
                                    children: dayPlans.map((dayPlan)=>{
                                        const dayActivities = dayPlan.activities || [];
                                        if (dayActivities.length === 0) return null;
                                        // Get valid coordinates for this day
                                        const dayPlaces = dayActivities.filter((a)=>{
                                            const pi = a?.place_info || {};
                                            return pi.lat && pi.lon;
                                        }).map((a)=>({
                                                lat: a.place_info.lat,
                                                lon: a.place_info.lon
                                            }));
                                        if (dayPlaces.length === 0) return null;
                                        // Calculate center point
                                        const centerLat = dayPlaces.reduce((sum, p)=>sum + p.lat, 0) / dayPlaces.length;
                                        const centerLon = dayPlaces.reduce((sum, p)=>sum + p.lon, 0) / dayPlaces.length;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-13c880358c44fc36",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    style: {
                                                        fontSize: '1rem',
                                                        fontWeight: '600',
                                                        marginBottom: '0.75rem'
                                                    },
                                                    className: "jsx-13c880358c44fc36",
                                                    children: [
                                                        "Day ",
                                                        dayPlan.day,
                                                        " - ",
                                                        dayActivities.length,
                                                        " activities"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/results.js",
                                                    lineNumber: 341,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StaticMap$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                                    lat: centerLat,
                                                    lon: centerLon,
                                                    zoom: 13,
                                                    width: 500,
                                                    height: 300,
                                                    markers: dayPlaces
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/results.js",
                                                    lineNumber: 344,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, `static-map-day-${dayPlan.day}`, true, {
                                            fileName: "[project]/pages/results.js",
                                            lineNumber: 340,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/pages/results.js",
                                    lineNumber: 320,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/results.js",
                            lineNumber: 314,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/results.js",
                    lineNumber: 211,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/results.js",
                lineNumber: 210,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Results, "muDJMuKfQ+xFrShFjjkylGA+riE=");
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

//# sourceMappingURL=%5Broot-of-the-server%5D__a37b535a._.js.map