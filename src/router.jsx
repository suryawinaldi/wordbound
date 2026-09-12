import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuthStore } from './stores/auth'
import AppShell from './components/AppShell.jsx'

// Lazy-loaded pages
const SplashPage = lazy(() => import('./views/SplashPage.jsx'))
const DashboardPage = lazy(() => import('./views/DashboardPage.jsx'))
const ProfilePage = lazy(() => import('./views/ProfilePage.jsx'))
const StatsPage = lazy(() => import('./views/StatsPage.jsx'))
const CoupleLinkPage = lazy(() => import('./views/CoupleLinkPage.jsx'))
const ListenGamePage = lazy(() => import('./views/ListenGamePage.jsx'))
const QuizSoloPage = lazy(() => import('./views/QuizSoloPage.jsx'))
const MLGuessPage = lazy(() => import('./views/MLGuessPage.jsx'))
const GamesPage = lazy(() => import('./views/GamesPage.jsx'))
const RPSGamePage = lazy(() => import('./views/games/RPSGamePage.jsx'))
const XOXOGamePage = lazy(() => import('./views/games/XOXOGamePage.jsx'))
const WordleDuelPage = lazy(() => import('./views/games/WordleDuelPage.jsx'))
const MLDuelPage = lazy(() => import('./views/games/MLDuelPage.jsx'))
const MLCoopPage = lazy(() => import('./views/games/MLCoopPage.jsx'))
const ListenDuelPage = lazy(() => import('./views/games/ListenDuelPage.jsx'))
const Connect4Page = lazy(() => import('./views/games/Connect4Page.jsx'))
const MemoryMatchPage = lazy(() => import('./views/games/MemoryMatchPage.jsx'))
const QuizDuelPage = lazy(() => import('./views/games/QuizDuelPage.jsx'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      background: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
    }}>
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
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
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: withSuspense(DashboardPage) },
      { path: 'games', element: withSuspense(GamesPage) },
      { path: 'profile', element: withSuspense(ProfilePage) },
      { path: 'stats', element: withSuspense(StatsPage) },
      { path: 'couple-link', element: withSuspense(CoupleLinkPage) },
      { path: 'listen', element: withSuspense(ListenGamePage) },
      { path: 'quiz', element: withSuspense(QuizSoloPage) },
      { path: 'ml-guess', element: withSuspense(MLGuessPage) },
      { path: 'rps', element: withSuspense(RPSGamePage) },
      { path: 'xoxo', element: withSuspense(XOXOGamePage) },
      { path: 'wordle', element: withSuspense(WordleDuelPage) },
      { path: 'ml-duel', element: withSuspense(MLDuelPage) },
      { path: 'ml-coop', element: withSuspense(MLCoopPage) },
      { path: 'listen-duel', element: withSuspense(ListenDuelPage) },
      { path: 'connect4', element: withSuspense(Connect4Page) },
      { path: 'memory-match', element: withSuspense(MemoryMatchPage) },
      { path: 'quiz-duel', element: withSuspense(QuizDuelPage) },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
