import './AppShell.css'

/**
 * AppShell — The application's top-level structural layout.
 * Provides consistent, responsive placement for all app regions.
 * Pure structural layout, no application state.
 *
 * Props:
 *   header     — top of the page
 *   navigation — persistent app navigation (NavigationShell)
 *   footer     — bottom of the page (rarely used)
 *   modal      — fixed, full-viewport region for modals
 *   overlay    — fixed, full-viewport region for toasts/reward popups
 *   children   — the current page's main content
 */
export default function AppShell({ header, navigation, footer, modal, overlay, children }) {
  return (
    <div className="wb-app-shell">
      <a href="#wb-app-shell-main" className="wb-app-shell__skip-link">
        Skip to main content
      </a>

      <header className="wb-app-shell__header">
        {header}
      </header>

      <div className="wb-app-shell__body">
        <nav className="wb-app-shell__navigation" aria-label="Primary">
          {navigation}
        </nav>

        <main id="wb-app-shell-main" className="wb-app-shell__main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <footer className="wb-app-shell__footer">
        {footer}
      </footer>

      <div className="wb-app-shell__modal-layer">
        {modal}
      </div>

      <div className="wb-app-shell__overlay-layer">
        {overlay}
      </div>
    </div>
  )
}
