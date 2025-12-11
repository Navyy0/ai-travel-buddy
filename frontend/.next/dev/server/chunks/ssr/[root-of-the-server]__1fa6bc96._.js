module.exports = [
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
"[project]/components/SiteHeader.jsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SiteHeader
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AuthProvider.jsx [ssr] (ecmascript)");
;
;
;
function SiteHeader() {
    const { user, clearToken } = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthProvider$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["AuthContext"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("header", {
        style: {
            background: 'rgba(255,255,255,0.9)',
            borderBottom: '1px solid rgba(15,23,42,0.06)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            style: {
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    },
                    children: user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
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
                            user.role === 'admin' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    fontSize: 12
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: 'var(--text-tertiary)'
                                        },
                                        children: "Welcome"
                                    }, void 0, false, {
                                        fileName: "[project]/components/SiteHeader.jsx",
                                        lineNumber: 20,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
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
                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("a", {
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
}),
"[project]/pages/itinerary/[id]/edit.js [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditItinerary
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SiteHeader$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SiteHeader.jsx [ssr] (ecmascript)");
;
;
;
;
const apiUrl = ("TURBOPACK compile-time value", "http://localhost:8000") || '';
function EditItinerary() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { id } = router.query;
    const [itinerary, setItinerary] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!id) return;
        setLoading(true);
        fetch(`${apiUrl}/itineraries/${id}`, {
            credentials: 'include'
        }).then((r)=>{
            if (!r.ok) throw new Error('Failed to fetch');
            return r.json();
        }).then((data)=>setItinerary(data)).catch((e)=>{
            console.error(e);
            setItinerary(null);
        }).finally(()=>setLoading(false));
    }, [
        id,
        apiUrl
    ]);
    const updateTitle = (t)=>setItinerary((prev)=>({
                ...prev,
                title: t
            }));
    const updateDescription = (d)=>setItinerary((prev)=>({
                ...prev,
                description: d
            }));
    const updateDayNote = (index, note)=>{
        setItinerary((prev)=>{
            const copy = {
                ...prev
            };
            copy.day_plans = Array.isArray(copy.day_plans) ? [
                ...copy.day_plans
            ] : [];
            copy.day_plans[index] = {
                ...copy.day_plans[index] || {},
                notes: note
            };
            return copy;
        });
    };
    const doSave = async ()=>{
        if (!itinerary) return;
        setSaving(true);
        try {
            // prepare minimal payload
            const payload = {
                title: itinerary.title,
                description: itinerary.description,
                day_plans: itinerary.day_plans
            };
            const resp = await fetch(`${apiUrl}/itineraries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            if (!resp.ok) {
                const txt = await resp.text();
                alert('Save failed: ' + resp.status + ' ' + txt);
                return;
            }
            const updated = await resp.json();
            setItinerary(updated);
            alert('Saved successfully');
            router.push('/saved');
        } catch (e) {
            console.error(e);
            alert('Network error');
        } finally{
            setSaving(false);
        }
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            padding: 20
        },
        children: "Loading…"
    }, void 0, false, {
        fileName: "[project]/pages/itinerary/[id]/edit.js",
        lineNumber: 74,
        columnNumber: 23
    }, this);
    if (!itinerary) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        style: {
            padding: 20
        },
        children: "Itinerary not found or you are not authorized."
    }, void 0, false, {
        fileName: "[project]/pages/itinerary/[id]/edit.js",
        lineNumber: 75,
        columnNumber: 26
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SiteHeader$2e$jsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/pages/itinerary/[id]/edit.js",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                style: {
                    padding: 24,
                    minHeight: '80vh'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    style: {
                        maxWidth: 900,
                        margin: '0 auto'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h1", {
                            children: "Edit Itinerary"
                        }, void 0, false, {
                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                            lineNumber: 82,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#fff',
                                padding: 20,
                                borderRadius: 12
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                fontWeight: 700
                                            },
                                            children: "Title"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                                            lineNumber: 85,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            value: itinerary.title || '',
                                            onChange: (e)=>updateTitle(e.target.value),
                                            style: {
                                                width: '100%',
                                                padding: 10,
                                                borderRadius: 8,
                                                border: '1px solid #e6e6e6'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                                            lineNumber: 86,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/itinerary/[id]/edit.js",
                                    lineNumber: 84,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            style: {
                                                display: 'block',
                                                fontWeight: 700
                                            },
                                            children: "Description / Notes"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                                            lineNumber: 89,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                            value: itinerary.description || '',
                                            onChange: (e)=>updateDescription(e.target.value),
                                            style: {
                                                width: '100%',
                                                padding: 10,
                                                borderRadius: 8,
                                                border: '1px solid #e6e6e6'
                                            },
                                            rows: 4
                                        }, void 0, false, {
                                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                                            lineNumber: 90,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/itinerary/[id]/edit.js",
                                    lineNumber: 88,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginTop: 16
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                            children: "Day notes"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                                            lineNumber: 94,
                                            columnNumber: 13
                                        }, this),
                                        Array.isArray(itinerary.day_plans) && itinerary.day_plans.map((d, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginBottom: 12
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 700
                                                        },
                                                        children: [
                                                            "Day ",
                                                            d.day || idx + 1,
                                                            " ",
                                                            d.title ? '— ' + d.title : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/itinerary/[id]/edit.js",
                                                        lineNumber: 97,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                                        value: d.notes || '',
                                                        onChange: (e)=>updateDayNote(idx, e.target.value),
                                                        style: {
                                                            width: '100%',
                                                            padding: 10,
                                                            borderRadius: 8,
                                                            border: '1px solid #e6e6e6'
                                                        },
                                                        rows: 2
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/itinerary/[id]/edit.js",
                                                        lineNumber: 98,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, idx, true, {
                                                fileName: "[project]/pages/itinerary/[id]/edit.js",
                                                lineNumber: 96,
                                                columnNumber: 15
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/itinerary/[id]/edit.js",
                                    lineNumber: 93,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginTop: 18,
                                        display: 'flex',
                                        gap: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: doSave,
                                            disabled: saving,
                                            style: {
                                                padding: '0.75rem 1.25rem',
                                                background: '#06b6d4',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8
                                            },
                                            children: saving ? 'Saving…' : 'Save changes'
                                        }, void 0, false, {
                                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                                            lineNumber: 104,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>router.push('/saved'),
                                            style: {
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: 8
                                            },
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                                            lineNumber: 105,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/itinerary/[id]/edit.js",
                                    lineNumber: 103,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/itinerary/[id]/edit.js",
                            lineNumber: 83,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/itinerary/[id]/edit.js",
                    lineNumber: 81,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/itinerary/[id]/edit.js",
                lineNumber: 80,
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

//# sourceMappingURL=%5Broot-of-the-server%5D__1fa6bc96._.js.map