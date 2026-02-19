import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/components/AuthProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { EditorArea } from '@/components/layout/EditorArea'
import { RightPanel } from '@/components/layout/RightPanel'
import { TopBar } from '@/components/layout/TopBar'
import AuthPage from '@/pages/AuthPage'
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
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <EditorArea />
        <RightPanel />
      </div>
    </div>
  )
}

export default function App() {
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
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
