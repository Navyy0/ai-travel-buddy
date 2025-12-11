import { useContext } from 'react'
import PlannerForm from '../components/PlannerForm'
import { AuthContext } from '../context/AuthProvider'
import SiteHeader from '../components/SiteHeader'

export default function Home() {
  const { user, clearToken } = useContext(AuthContext)

  return (
    <>
      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 0;
        }

        .header {
          background: var(--surface-elevated);
          border-bottom: 1px solid var(--border);
          padding: 1.25rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
        }

        @media (prefers-color-scheme: dark) {
          .header {
            background: rgba(15, 23, 42, 0.9);
          }
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .saved-link {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .saved-link:hover {
          background: var(--border-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .user-greeting {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .user-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-top: 0.25rem;
        }

        .logout-btn {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: var(--surface);
          border-color: var(--border);
          color: var(--text-primary);
        }

        .login-link {
          padding: 0.625rem 1.25rem;
          background: var(--primary);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9375rem;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .login-link:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .main-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 4rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .form-section {
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 3rem;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border);
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .form-description {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .welcome-card {
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 4rem 3rem;
          text-align: center;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border);
        }

        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .welcome-text {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .main-content {
            padding: 2rem 1rem;
          }

          .form-section,
          .welcome-card {
            padding: 2rem 1.5rem;
          }

          .header-content {
            padding: 0 1rem;
          }

          .user-section {
            gap: 1rem;
          }

          .user-info {
            display: none;
          }
        }
      `}</style>

      <div className="page-container">
        <SiteHeader />

        <main className="main-content">
          {user ? (
            <div className="form-section">
              <div className="form-header">
                <h1 className="form-title">Plan Your Perfect Trip</h1>
                <p className="form-description">
                  Tell us about your destination, dates, and preferences. We'll create a personalized itinerary just for you.
                </p>
              </div>
              <PlannerForm />
            </div>
          ) : (
            <div>
              <div className="hero-section">
                <h1 className="hero-title">
                  Plan Your Next Adventure
                </h1>
                <p className="hero-subtitle">
                  Create personalized travel itineraries powered by AI. Discover amazing destinations, plan your journey, and make unforgettable memories.
                </p>
              </div>
              <div className="welcome-card">
                <h2 className="welcome-title">Get Started</h2>
                <p className="welcome-text">
                  Sign in to start planning your perfect trip and generate custom itineraries tailored to your preferences.
                </p>
                <a href="/login" className="login-link">
                  Sign In to Continue
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
