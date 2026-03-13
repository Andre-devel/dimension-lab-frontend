import { createBrowserRouter } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import Home from '@/pages/Home'
import Portfolio from '@/pages/Portfolio'
import PortfolioDetail from '@/pages/PortfolioDetail'
import QuoteRequest from '@/pages/QuoteRequest'
import MyQuotes from '@/pages/MyQuotes'
import AdminDashboard from '@/pages/Admin/Dashboard'
import AdminQuoteDetail from '@/pages/Admin/QuoteDetail'
import PortfolioAdmin from '@/pages/Admin/PortfolioAdmin'
import NewPortfolioItem from '@/pages/Admin/PortfolioAdmin/NewPortfolioItem'
import EditPortfolioItem from '@/pages/Admin/PortfolioAdmin/EditPortfolioItem'

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
  {
    path: '/admin',
    element: (
      <PrivateRoute role="ADMIN">
        <AdminDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/quotes/:id',
    element: (
      <PrivateRoute role="ADMIN">
        <AdminQuoteDetail />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/portfolio',
    element: (
      <PrivateRoute role="ADMIN">
        <PortfolioAdmin />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/portfolio/new',
    element: (
      <PrivateRoute role="ADMIN">
        <NewPortfolioItem />
      </PrivateRoute>
    ),
  },
  {
    path: '/admin/portfolio/:id/edit',
    element: (
      <PrivateRoute role="ADMIN">
        <EditPortfolioItem />
      </PrivateRoute>
    ),
  },
])
