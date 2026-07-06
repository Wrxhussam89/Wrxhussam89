import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/services', label: 'Services', icon: '🔧' },
  { to: '/remote-programming', label: 'Remote', icon: '💻' },
  { to: '/booking', label: 'Book', icon: '📅' },
  { to: '/portal', label: 'Account', icon: '👤' },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{t.icon}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
