import { NavLink } from 'react-router-dom'
import { useT } from '../i18n'

function BottomNav() {
  const { t } = useT()

  const tabs = [
    { to: '/', label: t('nav.home'), icon: '🏠', end: true },
    { to: '/services', label: t('nav.services'), icon: '🔧' },
    { to: '/remote-programming', label: t('nav.remote'), icon: '💻' },
    { to: '/booking', label: t('nav.book'), icon: '📅' },
    { to: '/portal', label: t('nav.account'), icon: '👤' },
  ]

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
