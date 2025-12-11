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
"[project]/pages/admin/index.js [client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AuthProvider.jsx [client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
function RoleSelect({ currentRole, onChange, disabled = false }) {
    const roles = [
        'traveler',
        'admin'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
        disabled: disabled,
        value: currentRole,
        onChange: (e)=>onChange(e.target.value),
        style: {
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #d0d0d0',
            backgroundColor: '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            fontFamily: 'inherit'
        },
        children: roles.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                value: r,
                children: r
            }, r, false, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 24,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/pages/admin/index.js",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = RoleSelect;
// Stats card component
function StatsCard({ title, value, icon, color = '#3b82f6' }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: `2px solid ${color}`,
            flex: 1,
            minWidth: '150px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px'
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: color
                },
                children: value ?? '—'
            }, void 0, false, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: '20px',
                    marginTop: '8px'
                },
                children: icon
            }, void 0, false, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 44,
                columnNumber: 16
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/admin/index.js",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c1 = StatsCard;
function AdminPage() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$client$5d$__$28$ecmascript$29$__["AuthContext"]);
    const [users, setUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [itineraries, setItineraries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [pageSize, setPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(10);
    const [total, setTotal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [searchQ, setSearchQ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [auditLogs, setAuditLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [auditPage, setAuditPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [auditPageSize, setAuditPageSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(10);
    const [auditTotal, setAuditTotal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [auditActorFilter, setAuditActorFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [auditTargetFilter, setAuditTargetFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [analytics, setAnalytics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [analyticsLoading, setAnalyticsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [analyticsError, setAnalyticsError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminPage.useEffect": ()=>{
            if (!user) return;
            // load users and itineraries
            const load = {
                "AdminPage.useEffect.load": async ()=>{
                    setLoading(true);
                    setError(null);
                    try {
                        const [uRes, iRes] = await Promise.all([
                            fetch(`${apiUrl}/admin/users`, {
                                credentials: 'include'
                            }),
                            fetch(`${apiUrl}/admin/itineraries?page=${page}&page_size=${pageSize}${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`, {
                                credentials: 'include'
                            })
                        ]);
                        if (!uRes.ok) throw new Error(`Users fetch failed: ${uRes.status}`);
                        if (!iRes.ok) throw new Error(`Itineraries fetch failed: ${iRes.status}`);
                        const usersJson = await uRes.json();
                        const itinsJson = await iRes.json();
                        setUsers(usersJson);
                        setItineraries(itinsJson.items || itinsJson);
                        setTotal(itinsJson.total || 0);
                    } catch (e) {
                        console.error('Admin load error', e);
                        setError(e.message || String(e));
                    } finally{
                        setLoading(false);
                    }
                }
            }["AdminPage.useEffect.load"];
            load();
        }
    }["AdminPage.useEffect"], [
        user
    ]);
    // load admin analytics (total itineraries, top destinations)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminPage.useEffect": ()=>{
            if (!user) return;
            const loadAnalytics = {
                "AdminPage.useEffect.loadAnalytics": async ()=>{
                    setAnalyticsLoading(true);
                    setAnalyticsError(null);
                    try {
                        const res = await fetch(`${apiUrl}/analytics/admin/analytics`, {
                            credentials: 'include'
                        });
                        if (!res.ok) {
                            const txt = await res.text();
                            throw new Error(txt || `Status ${res.status}`);
                        }
                        const json = await res.json();
                        setAnalytics(json);
                    } catch (e) {
                        console.error('Failed to load analytics', e);
                        setAnalyticsError(e.message || String(e));
                    } finally{
                        setAnalyticsLoading(false);
                    }
                }
            }["AdminPage.useEffect.loadAnalytics"];
            loadAnalytics();
        }
    }["AdminPage.useEffect"], [
        user
    ]);
    const updateRole = async (userId, newRole)=>{
        // confirmation dialog
        const ok = window.confirm(`Change role for user to '${newRole}'?`);
        if (!ok) return;
        try {
            const res = await fetch(`${apiUrl}/admin/users/${userId}/role`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: newRole
                })
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || `Status ${res.status}`);
            }
            const updated = await res.json();
            setUsers((prev)=>prev.map((u)=>u.id === updated.id ? updated : u));
        } catch (e) {
            alert('Failed to update role: ' + (e.message || e));
        }
    };
    // load audit logs
    const loadAudits = async ()=>{
        try {
            const url = `${apiUrl}/admin/role-changes?page=${auditPage}&page_size=${auditPageSize}${auditActorFilter ? `&actor_email=${encodeURIComponent(auditActorFilter)}` : ''}${auditTargetFilter ? `&target_email=${encodeURIComponent(auditTargetFilter)}` : ''}`;
            const res = await fetch(url, {
                credentials: 'include'
            });
            if (!res.ok) {
                console.error('Failed to load audits', res.status);
                return;
            }
            const json = await res.json();
            setAuditLogs(json.items || []);
            setAuditTotal(json.total || 0);
        } catch (e) {
            console.error('Audit load error', e);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminPage.useEffect": ()=>{
            if (!user) return;
            loadAudits();
        }
    }["AdminPage.useEffect"], [
        user,
        auditPage,
        auditPageSize,
        auditActorFilter,
        auditTargetFilter
    ]);
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '40px 20px',
                minHeight: '80vh',
                backgroundColor: '#f9fafb'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '20px',
                            color: '#dc2626',
                            fontWeight: 600
                        },
                        children: "Access Denied"
                    }, void 0, false, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 171,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: '#666',
                            marginTop: '8px'
                        },
                        children: "Please log in to view the admin panel."
                    }, void 0, false, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 172,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 170,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/admin/index.js",
            lineNumber: 169,
            columnNumber: 7
        }, this);
    }
    if (user.role !== 'admin') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                padding: '40px 20px',
                minHeight: '80vh',
                backgroundColor: '#f9fafb'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '20px',
                            color: '#dc2626',
                            fontWeight: 600
                        },
                        children: "Insufficient Privileges"
                    }, void 0, false, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 182,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            color: '#666',
                            marginTop: '8px'
                        },
                        children: "You do not have admin access to this panel."
                    }, void 0, false, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 181,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/pages/admin/index.js",
            lineNumber: 180,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            paddingBottom: '40px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '24px 20px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                margin: 0,
                                fontSize: '28px',
                                fontWeight: 700,
                                color: '#1f2937'
                            },
                            children: "Admin Dashboard"
                        }, void 0, false, {
                            fileName: "[project]/pages/admin/index.js",
                            lineNumber: 194,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                margin: '8px 0 0 0',
                                color: '#6b7280',
                                fontSize: '14px'
                            },
                            children: "Manage users, itineraries, and view system analytics"
                        }, void 0, false, {
                            fileName: "[project]/pages/admin/index.js",
                            lineNumber: 195,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/admin/index.js",
                    lineNumber: 193,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '24px 20px'
                },
                children: [
                    analyticsLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '16px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            color: '#6b7280'
                        },
                        children: "📊 Loading analytics…"
                    }, void 0, false, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 202,
                        columnNumber: 11
                    }, this) : analyticsError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '16px',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '8px',
                            border: '1px solid #fca5a5'
                        },
                        children: [
                            "⚠️ Analytics error: ",
                            analyticsError
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this) : analytics ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginBottom: '32px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#1f2937'
                                },
                                children: "📊 Analytics Overview"
                            }, void 0, false, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 209,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsCard, {
                                        title: "Total Itineraries Generated",
                                        value: analytics.total_itineraries_generated,
                                        icon: "✈️",
                                        color: "#10b981"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsCard, {
                                        title: "Top Destination",
                                        value: analytics.top_5_destinations?.[0]?.destination,
                                        icon: "🌍",
                                        color: "#3b82f6"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 217,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsCard, {
                                        title: "Most Popular Destination Count",
                                        value: analytics.top_5_destinations?.[0]?.count,
                                        icon: "📌",
                                        color: "#f59e0b"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 223,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 210,
                                columnNumber: 13
                            }, this),
                            analytics.top_5_destinations && analytics.top_5_destinations.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '24px',
                                    backgroundColor: '#fff',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            marginTop: 0,
                                            marginBottom: '16px',
                                            color: '#1f2937',
                                            fontSize: '16px',
                                            fontWeight: 600
                                        },
                                        children: "🏆 Top 5 Destinations"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 233,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                            gap: '12px'
                                        },
                                        children: analytics.top_5_destinations.map((d, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px',
                                                    backgroundColor: '#f3f4f6',
                                                    borderRadius: '6px',
                                                    borderLeft: `4px solid ${[
                                                        '#10b981',
                                                        '#3b82f6',
                                                        '#f59e0b',
                                                        '#ef4444',
                                                        '#8b5cf6'
                                                    ][idx]}`
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            color: '#6b7280',
                                                            marginBottom: '4px'
                                                        },
                                                        children: [
                                                            "#",
                                                            idx + 1
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 242,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 600,
                                                            color: '#1f2937'
                                                        },
                                                        children: d.destination
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 243,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            color: '#9ca3af',
                                                            marginTop: '4px'
                                                        },
                                                        children: [
                                                            d.count,
                                                            " itineraries"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 244,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/pages/admin/index.js",
                                                lineNumber: 236,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 234,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 232,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: {
                            marginBottom: '32px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#1f2937'
                                },
                                children: "👥 Users Management"
                            }, void 0, false, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 255,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    overflow: 'hidden'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: '#f9fafb'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'center',
                                                flexWrap: 'wrap'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#6b7280'
                                                },
                                                children: [
                                                    "Total users: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: '#1f2937',
                                                            fontWeight: 700
                                                        },
                                                        children: users.length
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 260,
                                                        columnNumber: 32
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/admin/index.js",
                                                lineNumber: 259,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/admin/index.js",
                                            lineNumber: 258,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 257,
                                        columnNumber: 13
                                    }, this),
                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '32px',
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        },
                                        children: "Loading users…"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 266,
                                        columnNumber: 15
                                    }, this) : users.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '32px',
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        },
                                        children: "No users found."
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 268,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            overflowX: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            style: {
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                fontSize: '14px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        style: {
                                                            backgroundColor: '#f9fafb',
                                                            borderBottom: '1px solid #e5e7eb'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    padding: '12px 16px',
                                                                    textAlign: 'left',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Email"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 278,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    padding: '12px 16px',
                                                                    textAlign: 'left',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Role"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 279,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    padding: '12px 16px',
                                                                    textAlign: 'left',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Actions"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 280,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 277,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 276,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: users.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            style: {
                                                                borderBottom: '1px solid #e5e7eb',
                                                                transition: 'background-color 0.2s'
                                                            },
                                                            onMouseEnter: (e)=>e.currentTarget.style.backgroundColor = '#f9fafb',
                                                            onMouseLeave: (e)=>e.currentTarget.style.backgroundColor = 'transparent',
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        padding: '12px 16px',
                                                                        color: '#1f2937'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: u.email
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 287,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/admin/index.js",
                                                                    lineNumber: 286,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        padding: '12px 16px'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            padding: '4px 8px',
                                                                            borderRadius: '4px',
                                                                            fontSize: '12px',
                                                                            fontWeight: 600,
                                                                            backgroundColor: u.role === 'admin' ? '#dbeafe' : '#dcfce7',
                                                                            color: u.role === 'admin' ? '#1e40af' : '#166534'
                                                                        },
                                                                        children: u.role
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 290,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/admin/index.js",
                                                                    lineNumber: 289,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        padding: '12px 16px'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RoleSelect, {
                                                                                currentRole: u.role,
                                                                                onChange: (r)=>updateRole(u.id, r),
                                                                                disabled: u.role === 'admin' && u.email !== user.email
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/admin/index.js",
                                                                                lineNumber: 303,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            u.role === 'admin' && u.email !== user.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    fontSize: '11px',
                                                                                    color: '#9ca3af',
                                                                                    marginTop: '4px'
                                                                                },
                                                                                children: "Cannot change other admins"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/pages/admin/index.js",
                                                                                lineNumber: 309,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 302,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/admin/index.js",
                                                                    lineNumber: 301,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, u.id, true, {
                                                            fileName: "[project]/pages/admin/index.js",
                                                            lineNumber: 285,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 283,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/admin/index.js",
                                            lineNumber: 271,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 270,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 254,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        style: {
                            marginBottom: '32px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#1f2937'
                                },
                                children: "📋 Itineraries"
                            }, void 0, false, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 324,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    overflow: 'hidden'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: '#f9fafb'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'center',
                                                flexWrap: 'wrap'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    placeholder: "🔍 Search by title...",
                                                    value: searchQ,
                                                    onChange: (e)=>setSearchQ(e.target.value),
                                                    style: {
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d0d0d0',
                                                        fontSize: '14px',
                                                        fontFamily: 'inherit',
                                                        flex: 1,
                                                        minWidth: '200px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 328,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setPage(1);
                                                        setLoading(true);
                                                    },
                                                    style: {
                                                        padding: '8px 16px',
                                                        backgroundColor: '#3b82f6',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        fontSize: '14px'
                                                    },
                                                    onMouseEnter: (e)=>e.target.style.backgroundColor = '#2563eb',
                                                    onMouseLeave: (e)=>e.target.style.backgroundColor = '#3b82f6',
                                                    children: "Search"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 342,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        marginLeft: 'auto',
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: '#6b7280'
                                                    },
                                                    children: [
                                                        "Total: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#1f2937'
                                                            },
                                                            children: total
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/admin/index.js",
                                                            lineNumber: 360,
                                                            columnNumber: 26
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 359,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/admin/index.js",
                                            lineNumber: 327,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 326,
                                        columnNumber: 13
                                    }, this),
                                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '32px',
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        },
                                        children: "Loading itineraries…"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 366,
                                        columnNumber: 15
                                    }, this) : itineraries.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '32px',
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        },
                                        children: "No itineraries found."
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 368,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    borderTop: '1px solid #e5e7eb'
                                                },
                                                children: itineraries.map((it, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            padding: '16px',
                                                            borderBottom: '1px solid #e5e7eb',
                                                            transition: 'background-color 0.2s'
                                                        },
                                                        onMouseEnter: (e)=>e.currentTarget.style.backgroundColor = '#f9fafb',
                                                        onMouseLeave: (e)=>e.currentTarget.style.backgroundColor = 'transparent',
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: 600,
                                                                    color: '#1f2937',
                                                                    marginBottom: '8px'
                                                                },
                                                                children: [
                                                                    idx + 1,
                                                                    ". ",
                                                                    it.title || '(untitled)'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 383,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    gap: '12px',
                                                                    flexWrap: 'wrap',
                                                                    fontSize: '13px',
                                                                    color: '#6b7280'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            "👤 ",
                                                                            it.user_email || it.user_id || '—'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 387,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: [
                                                                            "📅 ",
                                                                            it.created_at ? new Date(it.created_at).toLocaleDateString() : '—'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 388,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 386,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, it.id, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 373,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/pages/admin/index.js",
                                                lineNumber: 371,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '16px',
                                                    backgroundColor: '#f9fafb',
                                                    borderTop: '1px solid #e5e7eb',
                                                    display: 'flex',
                                                    gap: '12px',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    flexWrap: 'wrap'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '8px',
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                disabled: page <= 1,
                                                                onClick: ()=>setPage((p)=>Math.max(1, p - 1)),
                                                                style: {
                                                                    padding: '6px 12px',
                                                                    border: '1px solid #d0d0d0',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: page <= 1 ? '#f3f4f6' : '#fff',
                                                                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                                                    opacity: page <= 1 ? 0.5 : 1,
                                                                    fontSize: '14px'
                                                                },
                                                                children: "← Prev"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 396,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '14px',
                                                                    color: '#6b7280',
                                                                    fontWeight: 600
                                                                },
                                                                children: [
                                                                    "Page ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: '#1f2937'
                                                                        },
                                                                        children: page
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 412,
                                                                        columnNumber: 28
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 411,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                disabled: page * pageSize >= total,
                                                                onClick: ()=>setPage((p)=>p + 1),
                                                                style: {
                                                                    padding: '6px 12px',
                                                                    border: '1px solid #d0d0d0',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: page * pageSize >= total ? '#f3f4f6' : '#fff',
                                                                    cursor: page * pageSize >= total ? 'not-allowed' : 'pointer',
                                                                    opacity: page * pageSize >= total ? 0.5 : 1,
                                                                    fontSize: '14px'
                                                                },
                                                                children: "Next →"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 414,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 395,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '8px',
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    fontSize: '14px',
                                                                    color: '#6b7280',
                                                                    fontWeight: 600
                                                                },
                                                                children: "Page size:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 431,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                value: pageSize,
                                                                onChange: (e)=>{
                                                                    setPageSize(Number(e.target.value));
                                                                    setPage(1);
                                                                },
                                                                style: {
                                                                    padding: '6px 10px',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid #d0d0d0',
                                                                    backgroundColor: '#fff',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: 5,
                                                                        children: "5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 444,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: 10,
                                                                        children: "10"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 445,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: 20,
                                                                        children: "20"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 446,
                                                                        columnNumber: 23
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 432,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 430,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/admin/index.js",
                                                lineNumber: 394,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 370,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 325,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 323,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    marginBottom: '16px',
                                    color: '#1f2937'
                                },
                                children: "📝 Role Change Audit Log"
                            }, void 0, false, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 457,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    overflow: 'hidden'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '16px',
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: '#f9fafb'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'center',
                                                flexWrap: 'wrap'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    placeholder: "Filter by actor email...",
                                                    value: auditActorFilter,
                                                    onChange: (e)=>setAuditActorFilter(e.target.value),
                                                    style: {
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d0d0d0',
                                                        fontSize: '14px',
                                                        fontFamily: 'inherit',
                                                        flex: 1,
                                                        minWidth: '180px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 461,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    placeholder: "Filter by target email...",
                                                    value: auditTargetFilter,
                                                    onChange: (e)=>setAuditTargetFilter(e.target.value),
                                                    style: {
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #d0d0d0',
                                                        fontSize: '14px',
                                                        fontFamily: 'inherit',
                                                        flex: 1,
                                                        minWidth: '180px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 475,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setAuditPage(1);
                                                        loadAudits();
                                                    },
                                                    style: {
                                                        padding: '8px 16px',
                                                        backgroundColor: '#3b82f6',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        fontSize: '14px'
                                                    },
                                                    onMouseEnter: (e)=>e.target.style.backgroundColor = '#2563eb',
                                                    onMouseLeave: (e)=>e.target.style.backgroundColor = '#3b82f6',
                                                    children: "Filter"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 489,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        marginLeft: 'auto',
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        color: '#6b7280'
                                                    },
                                                    children: [
                                                        "Total: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#1f2937'
                                                            },
                                                            children: auditTotal
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/admin/index.js",
                                                            lineNumber: 507,
                                                            columnNumber: 26
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 506,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/admin/index.js",
                                            lineNumber: 460,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 459,
                                        columnNumber: 13
                                    }, this),
                                    auditLogs.length === 0 && !loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '32px',
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        },
                                        children: "No audit logs found."
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 513,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            overflowX: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            style: {
                                                width: '100%',
                                                borderCollapse: 'collapse',
                                                fontSize: '14px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        style: {
                                                            backgroundColor: '#f9fafb',
                                                            borderBottom: '1px solid #e5e7eb'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    padding: '12px 16px',
                                                                    textAlign: 'left',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Timestamp"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 523,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    padding: '12px 16px',
                                                                    textAlign: 'left',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Actor"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 524,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    padding: '12px 16px',
                                                                    textAlign: 'left',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Target"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 525,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    padding: '12px 16px',
                                                                    textAlign: 'left',
                                                                    fontWeight: 600,
                                                                    color: '#6b7280'
                                                                },
                                                                children: "Change"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 526,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 522,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 521,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: auditLogs.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            style: {
                                                                borderBottom: '1px solid #e5e7eb',
                                                                transition: 'background-color 0.2s'
                                                            },
                                                            onMouseEnter: (e)=>e.currentTarget.style.backgroundColor = '#f9fafb',
                                                            onMouseLeave: (e)=>e.currentTarget.style.backgroundColor = 'transparent',
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        padding: '12px 16px',
                                                                        color: '#1f2937'
                                                                    },
                                                                    children: new Date(a.timestamp).toLocaleString()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/admin/index.js",
                                                                    lineNumber: 537,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        padding: '12px 16px',
                                                                        color: '#1f2937'
                                                                    },
                                                                    children: a.actor_email || a.actor_id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/admin/index.js",
                                                                    lineNumber: 540,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        padding: '12px 16px',
                                                                        color: '#1f2937'
                                                                    },
                                                                    children: a.target_email || a.target_id
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/admin/index.js",
                                                                    lineNumber: 543,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        padding: '12px 16px'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            padding: '4px 8px',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: '#fef3c7',
                                                                            color: '#92400e',
                                                                            fontSize: '12px',
                                                                            fontWeight: 600
                                                                        },
                                                                        children: [
                                                                            a.previous_role,
                                                                            " → ",
                                                                            a.new_role
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/pages/admin/index.js",
                                                                        lineNumber: 547,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/admin/index.js",
                                                                    lineNumber: 546,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, a.id, true, {
                                                            fileName: "[project]/pages/admin/index.js",
                                                            lineNumber: 531,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/admin/index.js",
                                                    lineNumber: 529,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/admin/index.js",
                                            lineNumber: 516,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 515,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '16px',
                                            backgroundColor: '#f9fafb',
                                            borderTop: '1px solid #e5e7eb',
                                            display: 'flex',
                                            gap: '12px',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        disabled: auditPage <= 1,
                                                        onClick: ()=>setAuditPage((p)=>Math.max(1, p - 1)),
                                                        style: {
                                                            padding: '6px 12px',
                                                            border: '1px solid #d0d0d0',
                                                            borderRadius: '6px',
                                                            backgroundColor: auditPage <= 1 ? '#f3f4f6' : '#fff',
                                                            cursor: auditPage <= 1 ? 'not-allowed' : 'pointer',
                                                            opacity: auditPage <= 1 ? 0.5 : 1,
                                                            fontSize: '14px'
                                                        },
                                                        children: "← Prev"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 567,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '14px',
                                                            color: '#6b7280',
                                                            fontWeight: 600
                                                        },
                                                        children: [
                                                            "Page ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    color: '#1f2937'
                                                                },
                                                                children: auditPage
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 583,
                                                                columnNumber: 24
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 582,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        disabled: auditPage * auditPageSize >= auditTotal,
                                                        onClick: ()=>setAuditPage((p)=>p + 1),
                                                        style: {
                                                            padding: '6px 12px',
                                                            border: '1px solid #d0d0d0',
                                                            borderRadius: '6px',
                                                            backgroundColor: auditPage * auditPageSize >= auditTotal ? '#f3f4f6' : '#fff',
                                                            cursor: auditPage * auditPageSize >= auditTotal ? 'not-allowed' : 'pointer',
                                                            opacity: auditPage * auditPageSize >= auditTotal ? 0.5 : 1,
                                                            fontSize: '14px'
                                                        },
                                                        children: "Next →"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 585,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/admin/index.js",
                                                lineNumber: 566,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontSize: '14px',
                                                            color: '#6b7280',
                                                            fontWeight: 600
                                                        },
                                                        children: "Page size:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 602,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: auditPageSize,
                                                        onChange: (e)=>{
                                                            setAuditPageSize(Number(e.target.value));
                                                            setAuditPage(1);
                                                        },
                                                        style: {
                                                            padding: '6px 10px',
                                                            borderRadius: '4px',
                                                            border: '1px solid #d0d0d0',
                                                            backgroundColor: '#fff',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: 5,
                                                                children: "5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 615,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: 10,
                                                                children: "10"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 616,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: 20,
                                                                children: "20"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/admin/index.js",
                                                                lineNumber: 617,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/admin/index.js",
                                                        lineNumber: 603,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/admin/index.js",
                                                lineNumber: 601,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/admin/index.js",
                                        lineNumber: 565,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/admin/index.js",
                                lineNumber: 458,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/admin/index.js",
                        lineNumber: 456,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/admin/index.js",
                lineNumber: 199,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/admin/index.js",
        lineNumber: 190,
        columnNumber: 5
    }, this);
}
_s(AdminPage, "yaFGMcyWyEEnKiY/BBdkx176tpo=");
_c2 = AdminPage;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "RoleSelect");
__turbopack_context__.k.register(_c1, "StatsCard");
__turbopack_context__.k.register(_c2, "AdminPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/pages/admin/index.js [client] (ecmascript)\" } [client] (ecmascript)", ((__turbopack_context__, module, exports) => {

const PAGE_PATH = "/admin";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_context__.r("[project]/pages/admin/index.js [client] (ecmascript)");
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
"[hmr-entry]/hmr-entry.js { ENTRY => \"[project]/pages/admin/index.js\" }", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.r("[next]/entry/page-loader.ts { PAGE => \"[project]/pages/admin/index.js [client] (ecmascript)\" } [client] (ecmascript)");
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__1abeb204._.js.map