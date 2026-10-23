import { createBrowserRouter } from 'react-router'
import PublicLayout from './layouts/PublicLayout'
import CareerDetail from './pages/CareerDetail'
import CmsPage from './pages/CmsPage'
import CsrDetail from './pages/CsrDetail'
import { NotFound, PageLoading, RouteError } from './pages/ErrorView'
import ProductDetail from './pages/ProductDetail'

/** CMS page slug for each public URL (see backend PageSeeder / SitemapController). */
const CMS_PAGES = [
  ['/', 'home'],
  ['/about', 'about'],
  ['/spare-parts', 'spare-parts'],
  ['/transportation', 'transportation'],
  ['/hotel', 'hotel'],
  ['/csr', 'csr'],
  ['/gallery', 'gallery'],
  ['/careers', 'careers'],
  ['/contact', 'contact'],
]

export const routes = [
  {
    // The admin panel is a separate, lazily loaded bundle
    path: '/admin/*',
    lazy: () => import('./admin/AdminApp').then((module) => ({ Component: module.default })),
    hydrateFallbackElement: <PageLoading />,
    errorElement: <RouteError />,
  },
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      ...CMS_PAGES.map(([path, slug]) => ({ path, element: <CmsPage key={slug} slug={slug} /> })),
      { path: '/spare-parts/:slug', element: <ProductDetail /> },
      { path: '/careers/:slug', element: <CareerDetail /> },
      { path: '/csr/:slug', element: <CsrDetail /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
