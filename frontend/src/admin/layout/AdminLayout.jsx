import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import Icon from '../../components/common/Icon'
import { useSite } from '../../contexts/SiteContext'
import { cx } from '../../lib/format'
import { useAuth } from '../auth/AuthContext'
import { ConfirmHost } from '../components/ui'

/** Sidebar sections; each link is shown only with its permission. */
export const NAV = [
  { label: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: 'grid', end: true }] },
  {
    label: 'Website',
    items: [
      { to: '/admin/pages', label: 'Pages', icon: 'page', can: 'manage_pages' },
      { to: '/admin/media', label: 'Media library', icon: 'image', can: 'manage_media' },
      { to: '/admin/gallery', label: 'Gallery', icon: 'layers', can: 'manage_gallery' },
    ],
  },
  {
    label: 'Spare Parts',
    items: [
      { to: '/admin/products', label: 'Products', icon: 'stock', can: 'manage_products' },
      { to: '/admin/product-categories', label: 'Categories', icon: 'filter', can: 'manage_products' },
      { to: '/admin/vehicle-types', label: 'Vehicle types', icon: 'truck', can: 'manage_products' },
      { to: '/admin/brands', label: 'Brands', icon: 'award', can: 'manage_products' },
    ],
  },
  {
    label: 'Transportation',
    items: [
      { to: '/admin/transportation-services', label: 'Services', icon: 'route', can: 'manage_transportation' },
      { to: '/admin/fleet-items', label: 'Fleet', icon: 'fleet', can: 'manage_transportation' },
    ],
  },
  {
    label: 'Hotel',
    items: [
      { to: '/admin/hotel-rooms', label: 'Rooms', icon: 'bed', can: 'manage_hotel' },
      { to: '/admin/hotel-amenities', label: 'Amenities', icon: 'concierge', can: 'manage_hotel' },
    ],
  },
  {
    label: 'CSR',
    items: [
      { to: '/admin/csr-projects', label: 'Projects', icon: 'heart', can: 'manage_csr' },
      { to: '/admin/csr-categories', label: 'Focus areas', icon: 'leaf', can: 'manage_csr' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/admin/inquiries', label: 'Inquiries', icon: 'inbox', can: 'manage_inquiries' },
      { to: '/admin/careers', label: 'Jobs', icon: 'briefcase', can: 'manage_careers' },
      { to: '/admin/applications', label: 'Applications', icon: 'users', can: 'manage_applications' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: 'cog', can: 'manage_settings' },
      { to: '/admin/users', label: 'Admin users', icon: 'user', can: 'manage_users' },
      { to: '/admin/activity', label: 'Activity log', icon: 'activity', can: 'view_activity' },
    ],
  },
]

function Sidebar({ onNavigate }) {
  const { can } = useAuth()
  const { company } = useSite()

  return (
    <div className="flex h-full flex-col bg-navy-950 text-silver">
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3 border-b border-white/8 px-5 py-4 text-white">
        <img src={company.logo?.thumb || '/brand/logo-emblem.png'} alt="" className="size-9 rounded-full bg-white" />
        <span className="grid leading-tight">
          <b className="text-sm tracking-[.14em]">{company.short_name || 'MUTHUMALA'}</b>
          <small className="font-mono text-[.58rem] uppercase tracking-[.2em] text-silver-dim">Admin panel</small>
        </span>
      </Link>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((group) => {
          const items = group.items.filter((item) => !item.can || can(item.can))
          if (!items.length) return null
          return (
            <div key={group.label} className="mb-3.5">
              <p className="mb-1 px-3 font-mono text-[.6rem] uppercase tracking-[.2em] text-silver-dim/80">{group.label}</p>
              <ul className="grid gap-0.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cx('flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors', isActive ? 'bg-white/10 font-semibold text-white' : 'hover:bg-white/5 hover:text-white')
                      }
                    >
                      <Icon name={item.icon} className="size-[18px]" strokeWidth={1.6} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
      <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border-t border-white/8 px-6 py-4 text-xs text-silver-dim hover:text-white">
        <Icon name="external" className="size-4" /> View website
      </a>
    </div>
  )
}

/** Admin shell: navy sidebar (drawer on small screens) and top bar. */
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()

  // Block bodies: scroll methods return a Promise in newer browsers, which must not be an effect cleanup
  useEffect(() => {
    setDrawer(false)
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-svh bg-off text-ink lg:grid lg:grid-cols-[248px_1fr]">
      <a href="#admin-main" className="absolute -top-24 left-4 z-999 bg-white px-4 py-2 font-bold focus:top-4">
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-svh lg:block">
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-navy-950/60" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-[272px] animate-fade-in">
            <Sidebar onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-grey-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button type="button" aria-label="Open menu" onClick={() => setDrawer(true)} className="grid size-9 place-items-center rounded-md border border-grey-200 lg:hidden">
            <Icon name="menu" className="size-5" />
          </button>
          <span className="hidden font-mono text-[.66rem] uppercase tracking-[.16em] text-grey-600 lg:block">Content management</span>
          <div className="flex items-center gap-2">
            <Link to="/admin/profile" className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-off">
              <span className="grid size-8 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
              <span className="hidden text-left leading-tight sm:block">
                <b className="block text-sm">{user?.name}</b>
                <small className="text-xs text-grey-600">{user?.role?.name}</small>
              </span>
            </Link>
            <button type="button" onClick={logout} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-grey-600 hover:bg-off hover:text-navy-900">
              <Icon name="logout" className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main id="admin-main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      <ConfirmHost />
    </div>
  )
}
