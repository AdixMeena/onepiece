import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Sidebar from './Sidebar'
import StarField from './StarField'
import { Menu, X, LayoutDashboard, Youtube, FileText, Brain, MessageCircle, Map, CheckSquare, User } from 'lucide-react'

const mobileNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/youtube', icon: Youtube, label: 'YT' },
  { to: '/pdf', icon: FileText, label: 'PDF' },
  { to: '/quiz', icon: Brain, label: 'Quiz' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#03040a' }}>
      <StarField count={60} />

      {/* Desktop Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'rgba(8,12,24,0.95)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 40, overflowY: 'auto',
        display: 'none',
      }} className="lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 260,
            background: 'rgba(8,12,24,0.98)', backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            animation: 'slideInLeft 0.25s ease',
          }}>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <button onClick={() => setSidebarOpen(false)} style={{ color: '#64748b', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X size={20} />
              </button>
            </div>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: 0,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        paddingBottom: '5rem', // space for mobile nav
      }} className="lg:ml-60 lg:pb-0">
        {/* Mobile top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(3,4,10,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }} className="lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ color: '#94a3b8', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>
            ⚡ Pluton
          </span>
        </div>

        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(8,12,24,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }} className="lg:hidden">
        {mobileNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center py-2 gap-0.5"
            style={({ isActive }) => ({
              color: isActive ? '#a78bfa' : '#475569',
              textDecoration: 'none',
              transition: 'color 0.2s',
            })}
          >
            <Icon size={20} />
            <span style={{ fontSize: '0.6rem', fontFamily: 'Syne', fontWeight: 600 }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .lg\\:block { display: none; }
        .lg\\:ml-60 { margin-left: 0; }
        .lg\\:pb-0 { padding-bottom: 5rem; }
        .lg\\:hidden { display: flex; }
        @media (min-width: 1024px) {
          .lg\\:block { display: block !important; }
          .lg\\:ml-60 { margin-left: 240px !important; }
          .lg\\:pb-0 { padding-bottom: 0 !important; }
          .lg\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
