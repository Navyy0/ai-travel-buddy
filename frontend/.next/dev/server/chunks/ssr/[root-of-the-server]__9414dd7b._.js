module.exports = [
"[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("styled-jsx/style.js", () => require("styled-jsx/style.js"));

module.exports = mod;
}),
"[externals]/firebase/app [external] (firebase/app, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("firebase/app");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/firebase/auth [external] (firebase/auth, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("firebase/auth");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/firebaseClient.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "emailSignIn",
    ()=>emailSignIn,
    "emailSignUp",
    ()=>emailSignUp,
    "exchangeFirebaseTokenWithBackend",
    ()=>exchangeFirebaseTokenWithBackend,
    "googleSignIn",
    ()=>googleSignIn,
    "initFirebase",
    ()=>initFirebase
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase/app [external] (firebase/app, esm_import)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/firebase/auth [external] (firebase/auth, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
let authInstance = null;
function initFirebase() {
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$29$__["getApps"])().length) return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__["getAuth"])();
    const config = {
        apiKey: ("TURBOPACK compile-time value", "AIzaSyDfWPSRUN0WHyWiZVz0BmX2dbzUjksT0zY"),
        authDomain: ("TURBOPACK compile-time value", "ai-travel-4609c.firebaseapp.com"),
        projectId: ("TURBOPACK compile-time value", "ai-travel-4609c")
    };
    if (!config.apiKey) return null;
    const app = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$app__$5b$external$5d$__$28$firebase$2f$app$2c$__esm_import$29$__["initializeApp"])(config);
    authInstance = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__["getAuth"])(app);
    return authInstance;
}
async function googleSignIn() {
    const auth = authInstance || initFirebase();
    if (!auth) throw new Error('Firebase not configured');
    const provider = new __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__["GoogleAuthProvider"]();
    // signInWithPopup returns a UserCredential; extract ID token for backend exchange
    try {
        const userCred = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__["signInWithPopup"])(auth, provider);
        // Modern SDK: userCred.user.getIdToken() returns the Firebase ID token (JWT)
        const idToken = await userCred.user.getIdToken();
        return {
            user: userCred.user,
            idToken
        };
    } catch (error) {
        // Handle popup blocked or closed errors
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked') {
            throw new Error('Sign-in popup was closed or blocked. Please try again.');
        }
        throw error;
    }
}
async function exchangeFirebaseTokenWithBackend(idToken) {
    const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const resp = await fetch(`${apiUrl}/auth/firebase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_token: idToken
        }),
        // allow backend to set HttpOnly cookies
        credentials: 'include'
    });
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Backend token exchange failed: ${resp.status} ${text}`);
    }
    return await resp.json();
}
function emailSignUp(email, password) {
    const auth = authInstance || initFirebase();
    if (!auth) throw new Error('Firebase not configured');
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__["createUserWithEmailAndPassword"])(auth, email, password);
}
function emailSignIn(email, password) {
    const auth = authInstance || initFirebase();
    if (!auth) throw new Error('Firebase not configured');
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2f$auth__$5b$external$5d$__$28$firebase$2f$auth$2c$__esm_import$29$__["signInWithEmailAndPassword"])(auth, email, password);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/pages/login.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>Login
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/styled-jsx/style.js [external] (styled-jsx/style.js, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebaseClient.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function Login() {
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [fullName, setFullName] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])('');
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
    const doGoogle = async ()=>{
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["googleSignIn"])();
            // res contains { user, idToken }
            if (res && res.idToken) {
                // exchange with backend to obtain app access token (backend will set HttpOnly cookies)
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["exchangeFirebaseTokenWithBackend"])(res.idToken);
            }
            // Redirect after sign-in; assume backend used HttpOnly cookie when no access_token was returned.
            window.location.href = '/';
        } catch (e) {
            console.error(e);
            setMsg('Google sign-in failed');
        }
    };
    const doEmailSignUp = async ()=>{
        // Validate inputs
        if (!email.trim()) {
            setMsg('Please enter an email address');
            return;
        }
        if (!password.trim()) {
            setMsg('Please enter a password');
            return;
        }
        if (!fullName.trim()) {
            setMsg('Please enter your full name');
            return;
        }
        // Call backend register endpoint
        try {
            const resp = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                    full_name: fullName.trim()
                }),
                // include credentials to receive HttpOnly cookie if backend sets it
                credentials: 'include'
            });
            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(`${resp.status} ${txt}`);
            }
            const data = await resp.json();
            if (data && data.access_token) {
                // backend may return tokens in body for backward compatibility, but we rely on cookies
                window.location.href = '/';
                return;
            }
            // Successful registration; redirect (cookie-based session expected)
            window.location.href = '/';
        } catch (e) {
            console.error(e);
            setMsg('Sign up failed: ' + (e.message || e));
        }
    };
    const doEmailSignIn = async ()=>{
        // Validate inputs
        if (!email.trim()) {
            setMsg('Please enter an email address');
            return;
        }
        if (!password.trim()) {
            setMsg('Please enter a password');
            return;
        }
        // Call backend login endpoint
        try {
            const resp = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password
                }),
                // include credentials to receive HttpOnly cookie if backend sets it
                credentials: 'include'
            });
            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(`${resp.status} ${txt}`);
            }
            const data = await resp.json();
            // Login succeeded. Backend is expected to set HttpOnly cookies; redirect.
            window.location.href = '/';
        } catch (e) {
            console.error(e);
            setMsg('Sign in failed: ' + (e.message || e));
        }
    };
    // initialize if configured
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["initFirebase"])();
    } catch (e) {}
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$styled$2d$jsx$2f$style$2e$js__$5b$external$5d$__$28$styled$2d$jsx$2f$style$2e$js$2c$__cjs$29$__["default"], {
                id: "1b650fb46cde432b",
                children: '.login-container.jsx-1b650fb46cde432b{background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);justify-content:center;align-items:center;min-height:100vh;padding:2rem;display:flex}.login-card.jsx-1b650fb46cde432b{background:var(--surface-elevated);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);border:1px solid var(--border);width:100%;max-width:480px;padding:3rem}.login-header.jsx-1b650fb46cde432b{text-align:center;margin-bottom:2rem}.login-logo.jsx-1b650fb46cde432b{background:linear-gradient(135deg,var(--primary)0%,var(--secondary)100%);-webkit-text-fill-color:transparent;-webkit-background-clip:text;background-clip:text;margin-bottom:.5rem;font-size:2rem;font-weight:800}.login-subtitle.jsx-1b650fb46cde432b{color:var(--text-secondary);font-size:1rem}.error-message.jsx-1b650fb46cde432b{border:1px solid var(--error);border-radius:var(--radius-md);color:var(--error);background:#ef44441a;margin-bottom:1.5rem;padding:.875rem 1rem;font-size:.875rem}.google-btn.jsx-1b650fb46cde432b{background:var(--surface-elevated);border:1px solid var(--border);border-radius:var(--radius-md);width:100%;color:var(--text-primary);cursor:pointer;justify-content:center;align-items:center;gap:.5rem;margin-bottom:1.5rem;padding:.875rem 1.5rem;font-size:.9375rem;font-weight:600;transition:all .2s;display:flex}.google-btn.jsx-1b650fb46cde432b:hover{background:var(--surface);border-color:var(--primary);box-shadow:var(--shadow-md);transform:translateY(-1px)}.divider.jsx-1b650fb46cde432b{text-align:center;color:var(--text-tertiary);align-items:center;margin:1.5rem 0;font-size:.875rem;display:flex}.divider.jsx-1b650fb46cde432b:before,.divider.jsx-1b650fb46cde432b:after{content:"";border-bottom:1px solid var(--border);flex:1}.divider.jsx-1b650fb46cde432b:before{margin-right:.5rem}.divider.jsx-1b650fb46cde432b:after{margin-left:.5rem}.form-group.jsx-1b650fb46cde432b{margin-bottom:1.25rem}.form-label.jsx-1b650fb46cde432b{color:var(--text-primary);margin-bottom:.5rem;font-size:.875rem;font-weight:600;display:block}.form-input.jsx-1b650fb46cde432b{border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface-elevated);width:100%;color:var(--text-primary);padding:.875rem 1rem;font-size:.9375rem;transition:all .2s}.form-input.jsx-1b650fb46cde432b:focus{border-color:var(--primary);outline:none;box-shadow:0 0 0 3px #2563eb1a}.form-input.jsx-1b650fb46cde432b::placeholder{color:var(--text-tertiary)}.button-group.jsx-1b650fb46cde432b{gap:.75rem;margin-top:1.5rem;display:flex}.btn-primary.jsx-1b650fb46cde432b{background:linear-gradient(135deg,var(--primary)0%,var(--primary-light)100%);color:#fff;border-radius:var(--radius-md);cursor:pointer;box-shadow:var(--shadow-md);border:none;flex:1;padding:.875rem 1.5rem;font-size:.9375rem;font-weight:600;transition:all .2s}.btn-primary.jsx-1b650fb46cde432b:hover{box-shadow:var(--shadow-lg);transform:translateY(-2px)}.btn-secondary.jsx-1b650fb46cde432b{background:var(--surface);color:var(--text-primary);border:1px solid var(--border);border-radius:var(--radius-md);cursor:pointer;flex:1;padding:.875rem 1.5rem;font-size:.9375rem;font-weight:600;transition:all .2s}.btn-secondary.jsx-1b650fb46cde432b:hover{background:var(--border-light);border-color:var(--border)}.back-link.jsx-1b650fb46cde432b{color:var(--text-secondary);margin-top:1.5rem;font-size:.875rem;text-decoration:none;transition:color .2s;display:inline-block}.back-link.jsx-1b650fb46cde432b:hover{color:var(--primary)}@media (width<=640px){.login-card.jsx-1b650fb46cde432b{padding:2rem 1.5rem}}'
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "jsx-1b650fb46cde432b" + " " + "login-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "jsx-1b650fb46cde432b" + " " + "login-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-1b650fb46cde432b" + " " + "login-header",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-1b650fb46cde432b" + " " + "login-logo",
                                    children: "✈️ Trip Planner"
                                }, void 0, false, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 305,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "jsx-1b650fb46cde432b" + " " + "login-subtitle",
                                    children: "Sign in to plan your next adventure"
                                }, void 0, false, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 306,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/login.js",
                            lineNumber: 304,
                            columnNumber: 11
                        }, this),
                        msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-1b650fb46cde432b" + " " + "error-message",
                            children: msg
                        }, void 0, false, {
                            fileName: "[project]/pages/login.js",
                            lineNumber: 309,
                            columnNumber: 19
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            onClick: doGoogle,
                            className: "jsx-1b650fb46cde432b" + " " + "google-btn",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "jsx-1b650fb46cde432b",
                                    children: "🔵"
                                }, void 0, false, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 312,
                                    columnNumber: 13
                                }, this),
                                "Sign in with Google"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/login.js",
                            lineNumber: 311,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "jsx-1b650fb46cde432b" + " " + "divider",
                            children: "or"
                        }, void 0, false, {
                            fileName: "[project]/pages/login.js",
                            lineNumber: 316,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("form", {
                            onSubmit: (e)=>{
                                e.preventDefault();
                                doEmailSignIn();
                            },
                            className: "jsx-1b650fb46cde432b",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-1b650fb46cde432b" + " " + "form-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: "jsx-1b650fb46cde432b" + " " + "form-label",
                                            children: "Email"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 320,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            placeholder: "Enter your email",
                                            type: "email",
                                            value: email,
                                            onChange: (e)=>setEmail(e.target.value),
                                            required: true,
                                            className: "jsx-1b650fb46cde432b" + " " + "form-input"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 321,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 319,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-1b650fb46cde432b" + " " + "form-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: "jsx-1b650fb46cde432b" + " " + "form-label",
                                            children: "Password"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 332,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            placeholder: "Enter your password",
                                            type: "password",
                                            value: password,
                                            onChange: (e)=>setPassword(e.target.value),
                                            required: true,
                                            className: "jsx-1b650fb46cde432b" + " " + "form-input"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 333,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 331,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-1b650fb46cde432b" + " " + "form-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: "jsx-1b650fb46cde432b" + " " + "form-label",
                                            children: [
                                                "Full Name ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontWeight: 400,
                                                        color: 'var(--text-tertiary)'
                                                    },
                                                    className: "jsx-1b650fb46cde432b",
                                                    children: "(for sign up)"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/login.js",
                                                    lineNumber: 344,
                                                    columnNumber: 55
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 344,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            placeholder: "Enter your full name",
                                            value: fullName,
                                            onChange: (e)=>setFullName(e.target.value),
                                            className: "jsx-1b650fb46cde432b" + " " + "form-input"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 345,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 343,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "jsx-1b650fb46cde432b" + " " + "button-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "jsx-1b650fb46cde432b" + " " + "btn-primary",
                                            children: "Sign In"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 354,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: doEmailSignUp,
                                            className: "jsx-1b650fb46cde432b" + " " + "btn-secondary",
                                            children: "Sign Up"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/login.js",
                                            lineNumber: 355,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 353,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/login.js",
                            lineNumber: 318,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
                            href: "/",
                            className: "jsx-1b650fb46cde432b" + " " + "back-link",
                            children: "← Back to home"
                        }, void 0, false, {
                            fileName: "[project]/pages/login.js",
                            lineNumber: 359,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/login.js",
                    lineNumber: 303,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/login.js",
                lineNumber: 302,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9414dd7b._.js.map