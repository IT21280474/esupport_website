import { Navigate, Route, Routes, useLocation } from 'react-router'
import { useSeo } from '../hooks/useSeo'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from './auth/AuthPages'
import ResourceManager from './components/ResourceManager'
import { ToastProvider } from './components/Toast'
import { Btn, EmptyState, Spinner } from './components/ui'
import AdminLayout from './layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import GalleryManager from './pages/GalleryManager'
import MediaLibrary from './pages/MediaLibrary'
import { PageEditor, PagesList } from './pages/Pages'
import Settings from './pages/Settings'
import { ApplicationDetail, ApplicationList, InquiryDetail, InquiryList } from './pages/Submissions'
import { ActivityLog, Profile, Users } from './pages/System'
import { RESOURCES } from './resources'

/** Server-enforced permissions are mirrored here only to avoid showing dead ends. */
function Allow({ permission, children }) {
  const { can } = useAuth()
  if (permission && !can(permission)) {
    return (
      <EmptyState
        icon="lock"
        title="You don’t have access to this area"
        text="Ask a Super Admin if you need this permission."
        action={
          <Btn to="/admin" variant="secondary">
            Back to dashboard
          </Btn>
        }
      />
    )
  }
  return children
}

function RequireAuth({ children }) {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <Spinner className="min-h-svh" label="Checking your session…" />
  if (status === 'guest') return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return children
}

function GuestOnly({ children }) {
  const { status } = useAuth()
  if (status === 'loading') return <Spinner className="min-h-svh" />
  if (status === 'authenticated') return <Navigate to="/admin" replace />
  return children
}

const RESOURCE_ROUTES = [
  ['products', 'manage_products'],
  ['product-categories', 'manage_products'],
  ['vehicle-types', 'manage_products'],
  ['brands', 'manage_products'],
  ['transportation-services', 'manage_transportation'],
  ['fleet-items', 'manage_transportation'],
  ['hotel-rooms', 'manage_hotel'],
  ['hotel-amenities', 'manage_hotel'],
  ['csr-projects', 'manage_csr'],
  ['csr-categories', 'manage_csr'],
  ['careers', 'manage_careers'],
]

function AdminRoutes() {
  useSeo({ title: 'Admin', noindex: true })

  return (
    <Routes>
      <Route path="login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="forgot-password" element={<GuestOnly><ForgotPasswordPage /></GuestOnly>} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="pages" element={<Allow permission="manage_pages"><PagesList /></Allow>} />
        <Route path="pages/:id" element={<Allow permission="manage_pages"><PageEditor /></Allow>} />
        <Route path="media" element={<Allow permission="manage_media"><MediaLibrary /></Allow>} />
        <Route path="gallery" element={<Allow permission="manage_gallery"><GalleryManager /></Allow>} />
        <Route
          path="gallery/albums/*"
          element={<Allow permission="manage_gallery"><ResourceManager config={RESOURCES['gallery-albums']} basePath="/admin/gallery/albums" /></Allow>}
        />
        {RESOURCE_ROUTES.map(([key, permission]) => (
          <Route key={key} path={`${key}/*`} element={<Allow permission={permission}><ResourceManager config={RESOURCES[key]} basePath={`/admin/${key}`} /></Allow>} />
        ))}
        <Route path="inquiries" element={<Allow permission="manage_inquiries"><InquiryList /></Allow>} />
        <Route path="inquiries/:id" element={<Allow permission="manage_inquiries"><InquiryDetail /></Allow>} />
        <Route path="applications" element={<Allow permission="manage_applications"><ApplicationList /></Allow>} />
        <Route path="applications/:id" element={<Allow permission="manage_applications"><ApplicationDetail /></Allow>} />
        <Route path="settings" element={<Allow permission="manage_settings"><Settings /></Allow>} />
        <Route path="users" element={<Allow permission="manage_users"><Users /></Allow>} />
        <Route path="activity" element={<Allow permission="view_activity"><ActivityLog /></Allow>} />
        <Route path="*" element={<EmptyState icon="info" title="Page not found" action={<Btn to="/admin" variant="secondary">Back to dashboard</Btn>} />} />
      </Route>
    </Routes>
  )
}

/** The admin panel (lazy-loaded at /admin/*). */
export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
