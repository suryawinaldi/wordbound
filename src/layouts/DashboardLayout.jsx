import './DashboardLayout.css'

/**
 * DashboardLayout — Specific arrangement for the Dashboard screen only.
 * Single column on mobile, two columns on desktop (1024px+).
 * Pure structural layout, no application state.
 *
 * Props:
 *   primary   — the main column (Greeting, Continue-Learning, Games)
 *   secondary — the desktop-only column (Stats, Achievements)
 */
export default function DashboardLayout({ primary, secondary }) {
  return (
    <div className="wb-dashboard-layout">
      <div className="wb-dashboard-layout__primary">
        {primary}
      </div>
      <div className="wb-dashboard-layout__secondary">
        {secondary}
      </div>
    </div>
  )
}
