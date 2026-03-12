import { createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import Home from '@/pages/Home'
import Portfolio from '@/pages/Portfolio'
import PortfolioDetail from '@/pages/PortfolioDetail'
import QuoteRequest from '@/pages/QuoteRequest'
import MyQuotes from '@/pages/MyQuotes'
import AdminDashboard from '@/pages/Admin/Dashboard'
import AdminQuoteDetail from '@/pages/Admin/QuoteDetail'

export const router = createBrowserRouter([
  { path: '/',                  element: <Home /> },
  { path: '/portfolio',         element: <Portfolio /> },
  { path: '/portfolio/:id',     element: <PortfolioDetail /> },
  { path: '/quote',             element: <QuoteRequest /> },
  {
    path: '/my-quotes',
    element: (
      <PrivateRoute role="CLIENT">
        <MyQuotes />
      </PrivateRoute>
    ),
  },
  // TODO: restore PrivateRoute role="ADMIN" before OAuth integration (Phase 3)
  { path: '/admin',             element: <AdminDashboard /> },
  { path: '/admin/quotes/:id',  element: <AdminQuoteDetail /> },
])
