import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#03040a', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite' }}>⚡</div>
        <p style={{ fontFamily: 'Syne', fontWeight: 600, color: '#475569' }}>Loading Pluton...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return user ? children : <Navigate to="/auth" replace />
}
