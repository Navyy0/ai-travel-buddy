import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

let authInstance = null

export function initFirebase() {
  if (getApps().length) return getAuth()
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  }
  if (!config.apiKey) return null
  const app = initializeApp(config)
  authInstance = getAuth(app)
  return authInstance
}

export async function googleSignIn() {
  const auth = authInstance || initFirebase()
  if (!auth) throw new Error('Firebase not configured')
  const provider = new GoogleAuthProvider()
  // signInWithPopup returns a UserCredential; extract ID token for backend exchange
  try {
    const userCred = await signInWithPopup(auth, provider)
    // Modern SDK: userCred.user.getIdToken() returns the Firebase ID token (JWT)
    const idToken = await userCred.user.getIdToken()
    return { user: userCred.user, idToken }
  } catch (error) {
    // Handle popup blocked or closed errors
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was closed or blocked. Please try again.')
    }
    throw error
  }
}

export async function exchangeFirebaseTokenWithBackend(idToken) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL not configured')
  const resp = await fetch(`${apiUrl}/auth/firebase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
    // allow backend to set HttpOnly cookies
    credentials: 'include'
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Backend token exchange failed: ${resp.status} ${text}`)
  }
  return await resp.json()
}

export function emailSignUp(email, password) {
  const auth = authInstance || initFirebase()
  if (!auth) throw new Error('Firebase not configured')
  return createUserWithEmailAndPassword(auth, email, password)
}

export function emailSignIn(email, password) {
  const auth = authInstance || initFirebase()
  if (!auth) throw new Error('Firebase not configured')
  return signInWithEmailAndPassword(auth, email, password)
}
