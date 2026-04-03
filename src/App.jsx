import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'

import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import YTSummarizer from './pages/YTSummarizer'
import PDFExtractor from './pages/PDFExtractor'
import QuizLab from './pages/QuizLab'
import DoubtFinisher from './pages/DoubtFinisher'
import Roadmap from './pages/Roadmap'
import TodoJournal from './pages/TodoJournal'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected - inside app shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="youtube" element={<YTSummarizer />} />
            <Route path="pdf" element={<PDFExtractor />} />
            <Route path="quiz" element={<QuizLab />} />
            <Route path="chat" element={<DoubtFinisher />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="todo" element={<TodoJournal />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1225',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.875rem',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#0d1225' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0d1225' } },
        }}
      />
    </AuthProvider>
  )
}
