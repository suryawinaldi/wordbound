import './AuthLayout.css'

/**
 * AuthLayout — Layout for Splash, Login, and Profile Setup.
 * Deliberately excludes any navigation shell — centered composition.
 * Pure structural layout, no application state.
 *
 * Props:
 *   children — the page content
 */
export default function AuthLayout({ children }) {
  return (
    <div className="wb-auth-layout">
      <div className="wb-auth-layout__panel">
        {children}
      </div>
    </div>
  )
}
