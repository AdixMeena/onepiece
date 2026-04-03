import { useNavigate } from 'react-router-dom'
import StarField from '../components/StarField'
import { Zap, Youtube, FileText, Brain, MessageCircle, Map, CheckSquare, ArrowRight, Star } from 'lucide-react'

const features = [
  { icon: Youtube, label: 'YT Summarizer', desc: 'Paste any YouTube link → get smart notes tailored to your level', color: '#ef4444' },
  { icon: FileText, label: 'PDF Extractor', desc: 'Upload PDFs → extract key questions & answers instantly', color: '#a78bfa' },
  { icon: Brain, label: 'Quiz Lab', desc: 'Generate quizzes from notes or YT summaries to test yourself', color: '#fbbf24' },
  { icon: MessageCircle, label: 'Doubt Finisher', desc: 'Ask anything — AI explains in Hinglish, your way', color: '#34d399' },
  { icon: Map, label: 'Roadmap Tracker', desc: 'Visual learning paths for every subject you add', color: '#60a5fa' },
  { icon: CheckSquare, label: 'To-Do & Journal', desc: 'Plan your day and reflect with your personal study journal', color: '#f472b6' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#03040a', position: 'relative', overflow: 'hidden' }}>
      <StarField count={120} />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(3,4,10,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.5)',
          }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: '#f1f5f9' }}>Pluton</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="ghost-btn" onClick={() => navigate('/auth')} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Sign In
          </button>
          <button className="nebula-btn" onClick={() => navigate('/auth?mode=signup')} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 720 }}>
          <div className="animate-fade-in-up stagger-1" style={{ marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="label-tag">✨ AI-Powered EdTech Platform</span>
          </div>

          <h1 className="animate-fade-in-up stagger-2" style={{
            fontFamily: 'Syne', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)', color: '#f1f5f9', marginBottom: 24,
          }}>
            Learn Beyond{' '}
            <span className="shimmer-text">Limits</span>
          </h1>

          <p className="animate-fade-in-up stagger-3" style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#94a3b8', lineHeight: 1.7, marginBottom: 40,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            Pluton adapts to <em>you</em>. Summarize YouTube videos, extract PDF notes, generate quizzes, track subjects — all powered by AI, all personalized to your learning level.
          </p>

          <div className="animate-fade-in-up stagger-4" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="nebula-btn"
              onClick={() => navigate('/auth?mode=signup')}
              style={{ fontSize: '1rem', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Start Learning Free <ArrowRight size={16} />
            </button>
            <button
              className="ghost-btn"
              onClick={() => navigate('/auth')}
              style={{ fontSize: '1rem', padding: '14px 32px' }}
            >
              Sign In
            </button>
          </div>

          {/* Social proof */}
          <div className="animate-fade-in-up stagger-5" style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
            </div>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Built for students, by students 🎓</span>
          </div>
        </div>

        {/* Floating orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '8%', width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)',
          borderRadius: '50%', filter: 'blur(30px)', animation: 'float 7s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', right: '10%', width: 180, height: 180,
          background: 'radial-gradient(circle, rgba(52,211,153,0.12), transparent)',
          borderRadius: '50%', filter: 'blur(30px)', animation: 'float 9s ease-in-out infinite 2s',
        }} />
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="label-tag" style={{ marginBottom: 16, display: 'inline-block' }}>Everything you need</span>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              One platform, infinite learning
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map(({ icon: Icon, label, desc, color }, i) => (
              <div key={label} className="glass-card-hover" style={{ padding: '28px 24px' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={22} color={color} />
                </div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: 8 }}>{label}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px 120px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Ready to launch your learning? 🚀
          </h2>
          <p style={{ color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
            Join Pluton today — free for students. No credit card needed.
          </p>
          <button
            className="nebula-btn"
            onClick={() => navigate('/auth?mode=signup')}
            style={{ fontSize: '1.05rem', padding: '16px 40px' }}
          >
            Create Free Account ✨
          </button>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
