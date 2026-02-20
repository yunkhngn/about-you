import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/components/AuthProvider'
import { SongsProvider } from '@/components/SongsProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { SongEditor } from '@/components/editor/SongEditor'
import { RightPanel } from '@/components/layout/RightPanel'
import { TopBar } from '@/components/layout/TopBar'
import AuthPage from '@/pages/AuthPage'
import SharedSongPage from '@/pages/SharedSongPage'
import NotFoundPage from '@/pages/NotFoundPage'
import LandingPage from '@/pages/LandingPage'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />
  return children
}

function Workspace() {
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  return (
    <SongsProvider>
      <div className="h-screen flex flex-col overflow-hidden relative">
        <TopBar
          toggleLeft={() => setLeftOpen(!leftOpen)}
          toggleRight={() => setRightOpen(!rightOpen)}
        />
        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar isOpen={leftOpen} onClose={() => setLeftOpen(false)} />
          <SongEditor className="flex-1" />
          <RightPanel isOpen={rightOpen} onClose={() => setRightOpen(false)} />
        </div>
      </div>
    </SongsProvider>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route path="/s/:shareId" element={<SharedSongPage />} />
        <Route
          path="/"
          element={
            user ? <Workspace /> : <LandingPage />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
