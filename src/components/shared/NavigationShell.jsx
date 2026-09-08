import { NavLink } from 'react-router-dom'
import './NavigationShell.css'

export default function NavigationShell({ items, player }) {
  return (
    <nav className="wb-nav-shell" aria-label="Primary">
      <ul className="wb-nav-shell__list">
        {items.map((item) => (
          <li key={item.label} className="wb-nav-shell__item">
            <NavLink
              to={typeof item.to === 'string' ? item.to : item.to.pathname || '/'}
              className={({ isActive }) =>
                `wb-nav-shell__link${isActive ? ' wb-nav-shell__link--active' : ''}`
              }
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              {item.icon && (
                <span className="wb-nav-shell__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="wb-nav-shell__label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {player && (
        <div className="wb-nav-shell__player">
          {player}
        </div>
      )}
    </nav>
  )
}
