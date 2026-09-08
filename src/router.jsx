import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from './stores/auth'

// Lazy-loaded pages
const SplashPage = lazy(() => import('./views/SplashPage.jsx'))
const DashboardPage = lazy(() => import('./views/DashboardPage.jsx'))
const ProfilePage = lazy(() => import('./views/ProfilePage.jsx'))
const StatsPage = lazy(() => import('./views/StatsPage.jsx'))
const CoupleLinkPage = lazy(() => import('./views/CoupleLinkPage.jsx'))
const ListenGamePage = lazy(() => import('./views/ListenGamePage.jsx'))
const WordleDuelPage = lazy(() => import('./views/WordleDuelPage.jsx'))
const QuizSoloPage = lazy(() => import('./views/QuizSoloPage.jsx'))
const SpeedRoundPage = lazy(() => import('./views/SpeedRoundPage.jsx'))
const EchoTypePage = lazy(() => import('./views/EchoTypePage.jsx'))
const LevelTestPage = lazy(() => import('./views/LevelTestPage.jsx'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: 'var(--bg-default)',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-body-sm-size)',
    }}>
      Memuat...
    </div>
  )
}

function ProtectedRoute({ children }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const authReady = useAuthStore((s) => s.authReady)

  if (!authReady) return <PageLoader />
  if (!currentUser) return <Navigate to="/" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const authReady = useAuthStore((s) => s.authReady)

  if (!authReady) return <PageLoader />
  if (currentUser) return <Navigate to="/dashboard" replace />
  return children
}

function withSuspense(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicOnlyRoute>{withSuspense(SplashPage)}</PublicOnlyRoute>,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute>{withSuspense(DashboardPage)}</ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute>{withSuspense(ProfilePage)}</ProtectedRoute>,
  },
  {
    path: '/stats',
    element: <ProtectedRoute>{withSuspense(StatsPage)}</ProtectedRoute>,
  },
  {
    path: '/couple-link',
    element: <ProtectedRoute>{withSuspense(CoupleLinkPage)}</ProtectedRoute>,
  },
  {
    path: '/listen',
    element: <ProtectedRoute>{withSuspense(ListenGamePage)}</ProtectedRoute>,
  },
  {
    path: '/duel',
    element: <ProtectedRoute>{withSuspense(WordleDuelPage)}</ProtectedRoute>,
  },
  {
    path: '/quiz',
    element: <ProtectedRoute>{withSuspense(QuizSoloPage)}</ProtectedRoute>,
  },
  {
    path: '/speedround',
    element: <ProtectedRoute>{withSuspense(SpeedRoundPage)}</ProtectedRoute>,
  },
  {
    path: '/echo',
    element: <ProtectedRoute>{withSuspense(EchoTypePage)}</ProtectedRoute>,
  },
  {
    path: '/leveltest',
    element: <ProtectedRoute>{withSuspense(LevelTestPage)}</ProtectedRoute>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
