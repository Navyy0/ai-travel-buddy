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
"[project]/components/PlaceAutocomplete.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlaceAutocomplete
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
function PlaceAutocomplete({ value, onChange, placeholder }) {
    _s();
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(value || '');
    const [predictions, setPredictions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const timeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PlaceAutocomplete.useEffect": ()=>{
            setInput(value || '');
        }
    }["PlaceAutocomplete.useEffect"], [
        value
    ]);
    const doSearch = async (q)=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const r = await fetch(`${apiUrl}/places/search?q=${encodeURIComponent(q)}`, {
                credentials: 'include'
            });
            if (r.ok) {
                const data = await r.json();
                // expect { results: [{place_name, lat, lon, display_name, type}, ...] }
                if (data && Array.isArray(data.results)) {
                    setPredictions(data.results.map((p)=>({
                            description: p.place_name || p.display_name || 'Unknown',
                            place_name: p.place_name || p.display_name,
                            lat: p.lat,
                            lon: p.lon
                        })));
                    return;
                }
            }
        } catch (e) {
            console.warn('Backend search failed', e);
        }
        setPredictions([]);
    };
    const onInput = (v)=>{
        setInput(v);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(()=>{
            const q = (v || '').trim();
            // Only query when user typed at least 3 characters to reduce rate
            if (q && q.length >= 3) doSearch(q);
            else setPredictions([]);
        }, 250);
    };
    const pick = (desc, lat, lon)=>{
        setInput(desc);
        setPredictions([]);
        // Pass destination name to parent form
        onChange && onChange(desc);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "df7a29d7d8e87fe4",
                children: ".autocomplete-container.jsx-df7a29d7d8e87fe4{width:100%;position:relative}.autocomplete-input.jsx-df7a29d7d8e87fe4{border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-elevated);width:100%;color:var(--text-primary);padding:.875rem 1rem;font-size:.9375rem;transition:all .2s}.autocomplete-input.jsx-df7a29d7d8e87fe4:focus{border-color:var(--primary);outline:none;box-shadow:0 0 0 3px #2563eb1a}.autocomplete-input.jsx-df7a29d7d8e87fe4::placeholder{color:var(--text-tertiary)}.predictions-dropdown.jsx-df7a29d7d8e87fe4{background:var(--surface-elevated);border:1px solid var(--border);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);z-index:100;max-height:300px;margin-top:.25rem;position:absolute;top:100%;left:0;right:0;overflow-y:auto}.prediction-item.jsx-df7a29d7d8e87fe4{cursor:pointer;border-bottom:1px solid var(--border-light);padding:.75rem 1rem;transition:background .15s}.prediction-item.jsx-df7a29d7d8e87fe4:last-child{border-bottom:none}.prediction-item.jsx-df7a29d7d8e87fe4:hover{background:var(--surface)}.prediction-text.jsx-df7a29d7d8e87fe4{color:var(--text-primary);font-size:.9375rem}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-df7a29d7d8e87fe4" + " " + "autocomplete-container",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: input,
                        placeholder: placeholder || '',
                        onChange: (e)=>onInput(e.target.value),
                        className: "jsx-df7a29d7d8e87fe4" + " " + "autocomplete-input"
                    }, void 0, false, {
                        fileName: "[project]/components/PlaceAutocomplete.jsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this),
                    predictions && predictions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-df7a29d7d8e87fe4" + " " + "predictions-dropdown",
                        children: predictions.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>pick(p.description, p.lat, p.lon),
                                className: "jsx-df7a29d7d8e87fe4" + " " + "prediction-item",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-df7a29d7d8e87fe4" + " " + "prediction-text",
                                    children: p.description
                                }, void 0, false, {
                                    fileName: "[project]/components/PlaceAutocomplete.jsx",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this)
                            }, i, false, {
                                fileName: "[project]/components/PlaceAutocomplete.jsx",
                                lineNumber: 135,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/PlaceAutocomplete.jsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlaceAutocomplete.jsx",
                lineNumber: 125,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(PlaceAutocomplete, "2GU5/Rd2lpn9wELhusLb3/Zfenk=");
_c = PlaceAutocomplete;
var _c;
__turbopack_context__.k.register(_c, "PlaceAutocomplete");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/PlannerForm.jsx [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlannerForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlaceAutocomplete$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PlaceAutocomplete.jsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function PlannerForm({ initial = {}, onComplete }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [destination, setDestination] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initial.destination || '');
    const [startDate, setStartDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initial.start_date || '');
    const [endDate, setEndDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initial.end_date || '');
    const [budget, setBudget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initial.budget || '');
    const [preferences, setPreferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(initial.preferences && initial.preferences.join(', ') || '');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
    const handleSubmit = async (e)=>{
        e && e.preventDefault();
        // Validate required fields
        if (!destination.trim()) {
            setError('Please enter a destination');
            setLoading(false);
            return;
        }
        if (!startDate) {
            setError('Please select a start date');
            setLoading(false);
            return;
        }
        if (!endDate) {
            setError('Please select an end date');
            setLoading(false);
            return;
        }
        setLoading(true);
        // Convert budget entered in INR back to USD for the backend (assumes original model expects USD)
        const budgetUsd = budget ? Math.round(Number(budget) / 80 * 100) / 100 : undefined;
        const payload = {
            destination: destination.trim(),
            start_date: startDate,
            end_date: endDate,
            budget: budgetUsd,
            preferences: preferences ? preferences.split(',').map((s)=>s.trim()).filter((s)=>s) : [],
            travelers: 1,
            travel_style: 'balanced'
        };
        try {
            setError(null);
            const res = await fetch(`${apiUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (!res.ok) {
                const text = await res.text();
                setError(`Generation failed: ${res.status} ${text}`);
                setLoading(false);
                return;
            }
            const data = await res.json();
            sessionStorage.setItem('latest_itinerary', JSON.stringify(data));
            // Save the original generation payload so results page can regenerate
            try {
                sessionStorage.setItem('latest_generation_payload', JSON.stringify(payload));
            } catch (e) {}
            if (onComplete) onComplete(data);
            else router.push('/results');
        } catch (err) {
            console.error(err);
            setError('Network error while generating itinerary');
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "62bbd1051b8cbf8a",
                children: ".form.jsx-62bbd1051b8cbf8a{width:100%}.form-group.jsx-62bbd1051b8cbf8a{margin-bottom:1.5rem}.form-row.jsx-62bbd1051b8cbf8a{grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;display:grid}.form-label.jsx-62bbd1051b8cbf8a{color:var(--text-primary);margin-bottom:.5rem;font-size:.875rem;font-weight:600;display:block}.form-label-optional.jsx-62bbd1051b8cbf8a{color:var(--text-tertiary);font-weight:400}.form-input.jsx-62bbd1051b8cbf8a{border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-elevated);width:100%;color:var(--text-primary);padding:.875rem 1rem;font-size:.9375rem;transition:all .2s}.form-input.jsx-62bbd1051b8cbf8a:focus{border-color:var(--primary);outline:none;box-shadow:0 0 0 3px #2563eb1a}.form-input.jsx-62bbd1051b8cbf8a::placeholder{color:var(--text-tertiary)}.submit-btn.jsx-62bbd1051b8cbf8a{background:linear-gradient(135deg,var(--primary)0%,var(--primary-light)100%);color:#fff;border-radius:var(--radius-md);cursor:pointer;width:100%;box-shadow:var(--shadow-md);border:none;margin-top:.5rem;padding:1rem 2rem;font-size:1rem;font-weight:600;transition:all .2s}.submit-btn.jsx-62bbd1051b8cbf8a:hover:not(:disabled){box-shadow:var(--shadow-lg);transform:translateY(-2px)}.submit-btn.jsx-62bbd1051b8cbf8a:active:not(:disabled){transform:translateY(0)}.submit-btn.jsx-62bbd1051b8cbf8a:disabled{opacity:.6;cursor:not-allowed;transform:none}.error-message.jsx-62bbd1051b8cbf8a{border:1px solid var(--error);border-radius:var(--radius-md);color:var(--error);background:#ef44441a;margin-top:1rem;padding:.875rem 1rem;font-size:.875rem}.loading-text.jsx-62bbd1051b8cbf8a{align-items:center;gap:.5rem;display:inline-flex}.spinner.jsx-62bbd1051b8cbf8a{border:2px solid #ffffff4d;border-top-color:#fff;border-radius:50%;width:1rem;height:1rem;animation:.6s linear infinite spin;display:inline-block}@keyframes spin{to{transform:rotate(360deg)}}@media (width<=640px){.form-row.jsx-62bbd1051b8cbf8a{grid-template-columns:1fr}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "jsx-62bbd1051b8cbf8a" + " " + "form",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "jsx-62bbd1051b8cbf8a" + " " + "form-label",
                                children: "Destination"
                            }, void 0, false, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlaceAutocomplete$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                                value: destination,
                                onChange: setDestination,
                                placeholder: "Enter city or place name"
                            }, void 0, false, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 203,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PlannerForm.jsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-row",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-62bbd1051b8cbf8a" + " " + "form-group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-label",
                                        children: "Start Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlannerForm.jsx",
                                        lineNumber: 212,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: startDate,
                                        onChange: (e)=>setStartDate(e.target.value),
                                        required: true,
                                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-input"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlannerForm.jsx",
                                        lineNumber: 215,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 211,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-62bbd1051b8cbf8a" + " " + "form-group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-label",
                                        children: "End Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlannerForm.jsx",
                                        lineNumber: 224,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: endDate,
                                        onChange: (e)=>setEndDate(e.target.value),
                                        required: true,
                                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-input"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlannerForm.jsx",
                                        lineNumber: 227,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PlannerForm.jsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "jsx-62bbd1051b8cbf8a" + " " + "form-label",
                                children: [
                                    "Budget (₹ INR)",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-label-optional",
                                        children: "(optional)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlannerForm.jsx",
                                        lineNumber: 239,
                                        columnNumber: 27
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                value: budget,
                                onChange: (e)=>setBudget(e.target.value),
                                placeholder: "Enter your budget in Indian Rupees",
                                min: "0",
                                step: "1",
                                className: "jsx-62bbd1051b8cbf8a" + " " + "form-input"
                            }, void 0, false, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PlannerForm.jsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "jsx-62bbd1051b8cbf8a" + " " + "form-label",
                                children: [
                                    "Preferences ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-62bbd1051b8cbf8a" + " " + "form-label-optional",
                                        children: "(comma separated)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlannerForm.jsx",
                                        lineNumber: 254,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 253,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: preferences,
                                onChange: (e)=>setPreferences(e.target.value),
                                placeholder: "e.g., museums, hiking, restaurants, beaches",
                                className: "jsx-62bbd1051b8cbf8a" + " " + "form-input"
                            }, void 0, false, {
                                fileName: "[project]/components/PlannerForm.jsx",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PlannerForm.jsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: loading,
                        className: "jsx-62bbd1051b8cbf8a" + " " + "submit-btn",
                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "jsx-62bbd1051b8cbf8a" + " " + "loading-text",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "jsx-62bbd1051b8cbf8a" + " " + "spinner"
                                }, void 0, false, {
                                    fileName: "[project]/components/PlannerForm.jsx",
                                    lineNumber: 271,
                                    columnNumber: 15
                                }, this),
                                "Generating Your Itinerary..."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PlannerForm.jsx",
                            lineNumber: 270,
                            columnNumber: 13
                        }, this) : 'Generate Itinerary'
                    }, void 0, false, {
                        fileName: "[project]/components/PlannerForm.jsx",
                        lineNumber: 264,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-62bbd1051b8cbf8a" + " " + "error-message",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/PlannerForm.jsx",
                        lineNumber: 280,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlannerForm.jsx",
                lineNumber: 198,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(PlannerForm, "Hgfk7g+XY8lANNMlrGX/GA2GCyo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = PlannerForm;
var _c;
__turbopack_context__.k.register(_c, "PlannerForm");
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
"[project]/pages/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlannerForm$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PlannerForm.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AuthProvider.jsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SiteHeader$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SiteHeader.jsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function Home() {
    _s();
    const { user, clearToken } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["AuthContext"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"], {
                id: "1392f21c44a122ae",
                children: ".page-container.jsx-1392f21c44a122ae{background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);min-height:100vh;padding:0}.header.jsx-1392f21c44a122ae{background:var(--surface-elevated);border-bottom:1px solid var(--border);z-index:100;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);background:#ffffffe6;padding:1.25rem 0;position:sticky;top:0}@media (prefers-color-scheme:dark){.header.jsx-1392f21c44a122ae{background:#0f172ae6}}.header-content.jsx-1392f21c44a122ae{justify-content:space-between;align-items:center;max-width:1200px;margin:0 auto;padding:0 2rem;display:flex}.logo.jsx-1392f21c44a122ae{background:linear-gradient(135deg,var(--primary)0%,var(--secondary)100%);-webkit-text-fill-color:transparent;-webkit-background-clip:text;background-clip:text;font-size:1.5rem;font-weight:800}.user-section.jsx-1392f21c44a122ae{align-items:center;gap:1rem;display:flex}.saved-link.jsx-1392f21c44a122ae{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);align-items:center;gap:.5rem;padding:.5rem 1rem;font-size:.875rem;font-weight:500;text-decoration:none;transition:all .2s;display:inline-flex}.saved-link.jsx-1392f21c44a122ae:hover{background:var(--border-light);border-color:var(--primary);color:var(--primary)}.user-info.jsx-1392f21c44a122ae{flex-direction:column;align-items:flex-end;display:flex}.user-greeting.jsx-1392f21c44a122ae{color:var(--text-tertiary);text-transform:uppercase;letter-spacing:.05em;font-size:.75rem;font-weight:500}.user-name.jsx-1392f21c44a122ae{color:var(--text-primary);margin-top:.25rem;font-size:.9375rem;font-weight:600}.logout-btn.jsx-1392f21c44a122ae{border:1px solid var(--border);border-radius:var(--radius-md);color:var(--text-secondary);background:0 0;padding:.5rem 1rem;font-size:.875rem;font-weight:500;transition:all .2s}.logout-btn.jsx-1392f21c44a122ae:hover{background:var(--surface);border-color:var(--border);color:var(--text-primary)}.login-link.jsx-1392f21c44a122ae{background:var(--primary);color:#fff;border-radius:var(--radius-md);padding:.625rem 1.25rem;font-size:.9375rem;font-weight:600;transition:all .2s;display:inline-block}.login-link.jsx-1392f21c44a122ae:hover{background:var(--primary-dark);box-shadow:var(--shadow-md);transform:translateY(-1px)}.main-content.jsx-1392f21c44a122ae{max-width:900px;margin:0 auto;padding:4rem 2rem}.hero-section.jsx-1392f21c44a122ae{text-align:center;margin-bottom:4rem}.hero-title.jsx-1392f21c44a122ae{color:var(--text-primary);margin-bottom:1.5rem;font-size:3.5rem;font-weight:800;line-height:1.1}.hero-subtitle.jsx-1392f21c44a122ae{color:var(--text-secondary);max-width:600px;margin:0 auto 2rem;font-size:1.25rem;line-height:1.6}.form-section.jsx-1392f21c44a122ae{background:var(--surface-elevated);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);border:1px solid var(--border);padding:3rem}.form-header.jsx-1392f21c44a122ae{margin-bottom:2rem}.form-title.jsx-1392f21c44a122ae{color:var(--text-primary);margin-bottom:.5rem;font-size:1.75rem;font-weight:700}.form-description.jsx-1392f21c44a122ae{color:var(--text-secondary);font-size:1rem}.welcome-card.jsx-1392f21c44a122ae{background:var(--surface-elevated);border-radius:var(--radius-xl);text-align:center;box-shadow:var(--shadow-xl);border:1px solid var(--border);padding:4rem 3rem}.welcome-title.jsx-1392f21c44a122ae{color:var(--text-primary);margin-bottom:1rem;font-size:2rem;font-weight:700}.welcome-text.jsx-1392f21c44a122ae{color:var(--text-secondary);margin-bottom:2rem;font-size:1.125rem}@media (width<=768px){.hero-title.jsx-1392f21c44a122ae{font-size:2.5rem}.main-content.jsx-1392f21c44a122ae{padding:2rem 1rem}.form-section.jsx-1392f21c44a122ae,.welcome-card.jsx-1392f21c44a122ae{padding:2rem 1.5rem}.header-content.jsx-1392f21c44a122ae{padding:0 1rem}.user-section.jsx-1392f21c44a122ae{gap:1rem}.user-info.jsx-1392f21c44a122ae{display:none}}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-1392f21c44a122ae" + " " + "page-container",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SiteHeader$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "jsx-1392f21c44a122ae" + " " + "main-content",
                        children: user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-1392f21c44a122ae" + " " + "form-section",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-1392f21c44a122ae" + " " + "form-header",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "jsx-1392f21c44a122ae" + " " + "form-title",
                                            children: "Plan Your Perfect Trip"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 243,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-1392f21c44a122ae" + " " + "form-description",
                                            children: "Tell us about your destination, dates, and preferences. We'll create a personalized itinerary just for you."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 244,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 242,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PlannerForm$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 248,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 241,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-1392f21c44a122ae",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-1392f21c44a122ae" + " " + "hero-section",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "jsx-1392f21c44a122ae" + " " + "hero-title",
                                            children: "Plan Your Next Adventure"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 253,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-1392f21c44a122ae" + " " + "hero-subtitle",
                                            children: "Create personalized travel itineraries powered by AI. Discover amazing destinations, plan your journey, and make unforgettable memories."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 256,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 252,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-1392f21c44a122ae" + " " + "welcome-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "jsx-1392f21c44a122ae" + " " + "welcome-title",
                                            children: "Get Started"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 261,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-1392f21c44a122ae" + " " + "welcome-text",
                                            children: "Sign in to start planning your perfect trip and generate custom itineraries tailored to your preferences."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 262,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "/login",
                                            className: "jsx-1392f21c44a122ae" + " " + "login-link",
                                            children: "Sign In to Continue"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/index.js",
                                            lineNumber: 265,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/index.js",
                                    lineNumber: 260,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/index.js",
                            lineNumber: 251,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/index.js",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/index.js",
                lineNumber: 236,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Home, "QVUxtqJivXj8CzwrtYtdlidYrHw=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/index.js [client] (ecmascript)");
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
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/index\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__a06ea927._.js.map