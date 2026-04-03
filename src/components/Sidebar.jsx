import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Youtube, FileText, Brain, MessageCircle,
  Map, CheckSquare, User, LogOut, Zap, BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/youtube', icon: Youtube, label: 'YT Summarizer' },
  { to: '/pdf', icon: FileText, label: 'PDF Notes' },
  { to: '/quiz', icon: Brain, label: 'Quiz Lab' },
  { to: '/chat', icon: MessageCircle, label: 'Doubt Finisher' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/todo', icon: CheckSquare, label: 'To-Do & Journal' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar({ onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    toast.success('See you soon! 👋')
    navigate('/')
  }

  const levelColors = {
    Beginner: '#34d399',
    Intermediate: '#fbbf24',
    Advanced: '#f87171',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.4)'
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Pluton
          </span>
        </div>
      </div>

      {/* User mini profile */}
      {profile && (
        <div className="mx-4 mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', color: 'white', flexShrink: 0
            }}>
              {profile.name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: levelColors[profile.level] || '#a78bfa', fontWeight: 600 }}>
                {profile.level} · {profile.xp || 0} XP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(124,58,237,0.1))',
              border: '1px solid rgba(124,58,237,0.3)',
            } : {
              border: '1px solid transparent',
            }}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ color: isActive ? '#a78bfa' : 'inherit', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Syne', fontWeight: 500, fontSize: '0.85rem' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 transition-all duration-200"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={17} />
          <span style={{ fontFamily: 'Syne', fontWeight: 500, fontSize: '0.85rem' }}>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
