module.exports = [
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
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebaseClient.js [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
                // exchange with backend to obtain app access token
                const backendResp = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["exchangeFirebaseTokenWithBackend"])(res.idToken);
                // If backend returns an `access_token` store it as a fallback.
                // Prefer backend-set HttpOnly cookie (no client storage) when the backend chooses that.
                if (backendResp && backendResp.access_token) {
                    localStorage.setItem('access_token', backendResp.access_token);
                }
            }
            // Redirect after sign-in; assume backend used HttpOnly cookie when no access_token was returned.
            window.location.href = '/';
        } catch (e) {
            console.error(e);
            setMsg('Google sign-in failed');
        }
    };
    const doEmailSignUp = async ()=>{
        // Call backend register endpoint
        try {
            const resp = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName || ''
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
                localStorage.setItem('access_token', data.access_token);
                window.location.href = '/';
                return;
            }
            setMsg('Registration succeeded but no access token returned');
        } catch (e) {
            console.error(e);
            setMsg('Sign up failed: ' + (e.message || e));
        }
    };
    const doEmailSignIn = async ()=>{
        // Call backend login endpoint
        try {
            const resp = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
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
            if (data && data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                window.location.href = '/';
                return;
            }
            setMsg('Login succeeded but no access token returned');
        } catch (e) {
            console.error(e);
            setMsg('Sign in failed: ' + (e.message || e));
        }
    };
    // initialize if configured
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebaseClient$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["initFirebase"])();
    } catch (e) {}
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            padding: 20,
            maxWidth: 640,
            margin: '0 auto'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                children: "Login"
            }, void 0, false, {
                fileName: "[project]/pages/login.js",
                lineNumber: 91,
                columnNumber: 7
            }, this),
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    color: 'red'
                },
                children: msg
            }, void 0, false, {
                fileName: "[project]/pages/login.js",
                lineNumber: 92,
                columnNumber: 15
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: 12
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                    onClick: doGoogle,
                    children: "Sign in with Google"
                }, void 0, false, {
                    fileName: "[project]/pages/login.js",
                    lineNumber: 95,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/login.js",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    borderTop: '1px solid #eee',
                    paddingTop: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                        children: "Email / Password"
                    }, void 0, false, {
                        fileName: "[project]/pages/login.js",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("form", {
                        onSubmit: (e)=>{
                            e.preventDefault();
                            doEmailSignIn();
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    placeholder: "email",
                                    type: "email",
                                    value: email,
                                    onChange: (e)=>setEmail(e.target.value),
                                    style: {
                                        width: '100%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    placeholder: "password",
                                    type: "password",
                                    value: password,
                                    onChange: (e)=>setPassword(e.target.value),
                                    style: {
                                        width: '100%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                    placeholder: "Full name (for sign up)",
                                    value: fullName,
                                    onChange: (e)=>setFullName(e.target.value),
                                    style: {
                                        width: '100%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/pages/login.js",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        children: "Sign in"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 111,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: doEmailSignUp,
                                        style: {
                                            marginLeft: 8
                                        },
                                        children: "Sign up"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/login.js",
                                        lineNumber: 112,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/login.js",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/login.js",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/login.js",
                lineNumber: 98,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/login.js",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f3be0caf._.js.map