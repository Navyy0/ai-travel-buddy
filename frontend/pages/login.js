import { useState } from 'react'
import { initFirebase, googleSignIn, emailSignIn, emailSignUp, exchangeFirebaseTokenWithBackend } from '../lib/firebaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [msg, setMsg] = useState(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  const doGoogle = async () => {
    try {
      const res = await googleSignIn()
      // res contains { user, idToken }
      if (res && res.idToken) {
        // exchange with backend to obtain app access token (backend will set HttpOnly cookies)
        await exchangeFirebaseTokenWithBackend(res.idToken)
      }
      // Redirect after sign-in; assume backend used HttpOnly cookie when no access_token was returned.
      window.location.href = '/'
    } catch (e) {
      console.error(e)
      setMsg('Google sign-in failed')
    }
  }

  const doEmailSignUp = async () => {
    // Validate inputs
    if (!email.trim()) {
      setMsg('Please enter an email address')
      return
    }
    if (!password.trim()) {
      setMsg('Please enter a password')
      return
    }
    if (!fullName.trim()) {
      setMsg('Please enter your full name')
      return
    }

    // Call backend register endpoint
    try {
      const resp = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, full_name: fullName.trim() }),
        // include credentials to receive HttpOnly cookie if backend sets it
        credentials: 'include'
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(`${resp.status} ${txt}`)
      }
      const data = await resp.json()
      if (data && data.access_token) {
        // backend may return tokens in body for backward compatibility, but we rely on cookies
        window.location.href = '/'
        return
      }
      // Successful registration; redirect (cookie-based session expected)
      window.location.href = '/'
    } catch (e) {
      console.error(e)
      setMsg('Sign up failed: ' + (e.message || e))
    }
  }

  const doEmailSignIn = async () => {
    // Validate inputs
    if (!email.trim()) {
      setMsg('Please enter an email address')
      return
    }
    if (!password.trim()) {
      setMsg('Please enter a password')
      return
    }

    // Call backend login endpoint
    try {
      const resp = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        // include credentials to receive HttpOnly cookie if backend sets it
        credentials: 'include'
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(`${resp.status} ${txt}`)
      }
      const data = await resp.json()
      // Login succeeded. Backend is expected to set HttpOnly cookies; redirect.
      window.location.href = '/'
    } catch (e) {
      console.error(e)
      setMsg('Sign in failed: ' + (e.message || e))
    }
  }

  // initialize if configured
  try { initFirebase() } catch(e) { /* ignore */ }

  return (
    <>
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-card {
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 3rem;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 480px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-logo {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .error-message {
          padding: 0.875rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--error);
          border-radius: var(--radius-md);
          color: var(--error);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .google-btn {
          width: 100%;
          padding: 0.875rem 1.5rem;
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .google-btn:hover {
          background: var(--surface);
          border-color: var(--primary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: var(--text-tertiary);
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border);
        }

        .divider::before {
          margin-right: 0.5rem;
        }

        .divider::after {
          margin-left: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface-elevated);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-tertiary);
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn-primary {
          flex: 1;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-md);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
          flex: 1;
          padding: 0.875rem 1.5rem;
          background: var(--surface);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          background: var(--border-light);
          border-color: var(--border);
        }

        .back-link {
          display: inline-block;
          margin-top: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: var(--primary);
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">✈️ Trip Planner</div>
            <p className="login-subtitle">Sign in to plan your next adventure</p>
          </div>

          {msg && <div className="error-message">{msg}</div>}

          <button onClick={doGoogle} className="google-btn">
            <span>🔵</span>
            Sign in with Google
          </button>

          <div className="divider">or</div>

          <form onSubmit={(e) => { e.preventDefault(); doEmailSignIn(); }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                placeholder="Enter your email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                placeholder="Enter your password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name <span style={{fontWeight: 400, color: 'var(--text-tertiary)'}}>(for sign up)</span></label>
              <input 
                placeholder="Enter your full name" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                className="form-input"
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn-primary">Sign In</button>
              <button type="button" onClick={doEmailSignUp} className="btn-secondary">Sign Up</button>
            </div>
          </form>

          <a href="/" className="back-link">← Back to home</a>
        </div>
      </div>
    </>
  )
}
