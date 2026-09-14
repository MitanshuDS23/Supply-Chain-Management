import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Truck, Warehouse, ShoppingCart, Sparkles, Users as UsersIcon,
  LogOut, Boxes,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { initials } from './ui.jsx'
import { Auth } from '../api/client.js'

const NAV = [
  { section: 'Overview' },
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { section: 'Catalog' },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { section: 'Operations' },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { section: 'Administration' },
  { to: '/users', label: 'Users', icon: UsersIcon },
]

const TITLES = {
  '/': ['Dashboard', 'Real-time overview of your supply chain'],
  '/products': ['Products', 'Manage your product catalog'],
  '/suppliers': ['Suppliers', 'Manage suppliers and their ratings'],
  '/inventory': ['Inventory', 'Track stock levels and movements'],
  '/orders': ['Orders', 'Place, track and fulfil orders'],
  '/recommendations': ['Recommendations', 'AI-driven restocking suggestions'],
  '/users': ['Users', 'Manage user accounts and access'],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [title, sub] = TITLES[pathname] || ['SupplyChain', '']

  const doLogout = async () => {
    try { await Auth.logout() } catch { /* ignore */ }
    logout()
    nav('/login')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo"><Boxes size={19} /></div>
          <span>SupplyChain<small>Management Console</small></span>
        </div>
        <nav className="nav">
          {NAV.map((item, i) =>
            item.section
              ? <div className="nav-section" key={i}>{item.section}</div>
              : <NavLink key={i} to={item.to} end={item.end}><item.icon size={18} /><span>{item.label}</span></NavLink>
          )}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">{initials(user?.fullName || user?.id)}</div>
            <div className="u-meta" style={{ flex: 1, minWidth: 0 }}>
              <div className="u-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName || user?.id || 'Guest'}</div>
              <div className="u-role">{user?.type || 'user'}</div>
            </div>
            <button className="btn btn-ghost btn-icon" title="Sign out" onClick={doLogout} style={{ color: 'var(--text-faint)' }}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            {sub && <div className="sub">{sub}</div>}
          </div>
          <div className="row">
            <div className="avatar" style={{ width: 36, height: 36 }}>{initials(user?.fullName || user?.id)}</div>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
