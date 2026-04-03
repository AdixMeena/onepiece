import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StarField from '../components/StarField'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!form.name.trim()) throw new Error('Name is required')
        if (form.password.length < 6) throw new Error('Password must be 6+ characters')
        await signUp(form.email, form.password, form.name)
        toast.success('Account created! Welcome to Pluton 🚀')
        navigate('/dashboard')
      } else {
        await signIn(form.email, form.password)
        toast.success('Welcome back! ✨')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#03040a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative',
    }}>
      <StarField count={80} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(124,58,237,0.5)',
            }}>
              <Zap size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: '#f1f5f9' }}>Pluton</span>
          </Link>
          <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: 8 }}>
            {mode === 'login' ? 'Welcome back, explorer 👋' : 'Begin your learning journey 🚀'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '36px 32px' }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 28,
          }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'Syne', fontWeight: 600, fontSize: '0.85rem',
                  background: mode === m ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                  color: mode === m ? 'white' : '#64748b',
                  transition: 'all 0.25s',
                  boxShadow: mode === m ? '0 4px 15px rgba(124,58,237,0.3)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                className="input-field"
                style={{ paddingLeft: 42 }}
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                className="input-field"
                style={{ paddingLeft: 42, paddingRight: 46 }}
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              className="nebula-btn"
              style={{ marginTop: 8, width: '100%', padding: '14px', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: '#1e293b', fontSize: '0.75rem', marginTop: 24 }}>
          By continuing, you agree to Pluton's Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}
