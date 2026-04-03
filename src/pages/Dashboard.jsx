import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/clients'
import toast from 'react-hot-toast'
import {
  Plus, Flame, Zap, Brain, BookOpen, Youtube, FileText,
  Map, Trash2, BarChart2, Star, TrendingUp, X
} from 'lucide-react'

const SUBJECT_ICONS = ['📐', '🔬', '💻', '📚', '🎨', '🧬', '⚗️', '🌍', '📊', '🎯', '🧮', '🏛️']
const SUBJECT_COLORS = ['#7c3aed', '#059669', '#dc2626', '#2563eb', '#d97706', '#7c3aed', '#0891b2', '#db2777']

export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({ yt: 0, pdf: 0, quiz: 0 })
  const [showAdd, setShowAdd] = useState(false)
  const [newSubject, setNewSubject] = useState({ name: '', icon: '📚', color: '#7c3aed', description: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) { fetchSubjects(); fetchStats() } }, [user])

  async function fetchSubjects() {
    setLoading(true)
    const { data } = await supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setSubjects(data || [])
    setLoading(false)
  }

  async function fetchStats() {
    const [yt, pdf, quiz] = await Promise.all([
      supabase.from('yt_summaries').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('pdf_extractions').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('quizzes').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])
    setStats({ yt: yt.count || 0, pdf: pdf.count || 0, quiz: quiz.count || 0 })
  }

  async function addSubject() {
    if (!newSubject.name.trim()) return toast.error('Subject name required')
    const { error } = await supabase.from('subjects').insert({
      user_id: user.id,
      name: newSubject.name,
      icon: newSubject.icon,
      color: newSubject.color,
      description: newSubject.description,
      progress: 0,
      level: 'Beginner',
    })
    if (error) return toast.error('Failed to add subject')
    toast.success(`${newSubject.icon} ${newSubject.name} added!`)
    setShowAdd(false)
    setNewSubject({ name: '', icon: '📚', color: '#7c3aed', description: '' })
    fetchSubjects()
  }

  async function deleteSubject(id) {
    await supabase.from('subjects').delete().eq('id', id)
    setSubjects(s => s.filter(x => x.id !== id))
    toast.success('Subject removed')
  }

  const levelColor = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171' }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="animate-fade-in-up stagger-1" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Hey, {profile?.name?.split(' ')[0] || 'Explorer'} 👋
            </h1>
            <p className="animate-fade-in-up stagger-2" style={{ color: '#64748b', marginTop: 4, fontSize: '0.9rem' }}>
              Ready to level up today? Let's go 🚀
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10,
            }}>
              <Flame size={16} color="#fbbf24" />
              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#fbbf24', fontSize: '0.875rem' }}>{profile?.streak || 0} day streak</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10,
            }}>
              <Zap size={16} color="#a78bfa" />
              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#a78bfa', fontSize: '0.875rem' }}>{profile?.xp || 0} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'YT Summaries', value: stats.yt, icon: Youtube, color: '#ef4444' },
          { label: 'PDFs Analyzed', value: stats.pdf, icon: FileText, color: '#a78bfa' },
          { label: 'Quizzes Done', value: stats.quiz, icon: Brain, color: '#fbbf24' },
          { label: 'Subjects', value: subjects.length, icon: BookOpen, color: '#34d399' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card" style={{ padding: '20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              <Icon size={16} color={color} />
            </div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: '#f1f5f9' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up stagger-3" style={{ marginBottom: 32 }}>
        <h2 className="section-title" style={{ marginBottom: 14 }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Summarize YT', icon: Youtube, path: '/youtube', color: '#ef4444' },
            { label: 'Analyze PDF', icon: FileText, path: '/pdf', color: '#a78bfa' },
            { label: 'Take a Quiz', icon: Brain, path: '/quiz', color: '#fbbf24' },
            { label: 'Ask a Doubt', icon: BookOpen, path: '/chat', color: '#34d399' },
            { label: 'View Roadmap', icon: Map, path: '/roadmap', color: '#60a5fa' },
            { label: 'To-Do / Journal', icon: Star, path: '/todo', color: '#f472b6' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="glass-card-hover"
              style={{ padding: '18px 14px', cursor: 'pointer', border: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
              <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.3 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* My Subjects */}
      <div className="animate-fade-in-up stagger-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title">My Subjects</h2>
          <button
            className="nebula-btn"
            onClick={() => setShowAdd(true)}
            style={{ padding: '8px 18px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} /> Add Subject
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🪐</div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No subjects yet</h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: 20 }}>Add your first subject to start tracking your learning journey</p>
            <button className="nebula-btn" onClick={() => setShowAdd(true)}>Add Your First Subject</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {subjects.map(sub => (
              <div key={sub.id} className="glass-card" style={{ padding: '22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${sub.color}, transparent)`,
                }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '1.8rem' }}>{sub.icon}</span>
                    <div>
                      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>{sub.name}</h3>
                      <span style={{ fontSize: '0.7rem', color: levelColor[sub.level] || '#a78bfa', fontWeight: 600 }}>{sub.level}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSubject(sub.id)}
                    style={{ color: '#334155', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#334155'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {sub.description && (
                  <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 10, lineHeight: 1.5 }}>{sub.description}</p>
                )}
                {/* Progress bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'Syne', fontWeight: 600 }}>Progress</span>
                    <span style={{ fontSize: '0.72rem', color: sub.color, fontWeight: 700 }}>{sub.progress || 0}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 100 }}>
                    <div style={{ height: '100%', width: `${sub.progress || 0}%`, background: `linear-gradient(90deg, ${sub.color}, ${sub.color}aa)`, borderRadius: 100, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button
                    onClick={() => navigate(`/roadmap?subject=${sub.id}`)}
                    className="ghost-btn"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                  >
                    <Map size={12} /> Roadmap
                  </button>
                  <button
                    onClick={() => navigate(`/quiz?subject=${sub.id}`)}
                    className="ghost-btn"
                    style={{ flex: 1, padding: '7px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                  >
                    <Brain size={12} /> Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowAdd(false)} />
          <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: '32px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 className="section-title">Add New Subject</h3>
              <button onClick={() => setShowAdd(false)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input className="input-field" placeholder="Subject name (e.g. Physics, DSA...)" value={newSubject.name} onChange={e => setNewSubject(s => ({ ...s, name: e.target.value }))} />
              <input className="input-field" placeholder="Short description (optional)" value={newSubject.description} onChange={e => setNewSubject(s => ({ ...s, description: e.target.value }))} />

              <div>
                <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>Pick an Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SUBJECT_ICONS.map(ico => (
                    <button
                      key={ico}
                      onClick={() => setNewSubject(s => ({ ...s, icon: ico }))}
                      style={{
                        width: 40, height: 40, borderRadius: 10, fontSize: '1.2rem',
                        background: newSubject.icon === ico ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                        border: newSubject.icon === ico ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >{ico}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>Pick a Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SUBJECT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewSubject(s => ({ ...s, color: c }))}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                        outline: newSubject.color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: 2, transition: 'outline 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button className="nebula-btn" onClick={addSubject} style={{ marginTop: 8, width: '100%', padding: '13px' }}>
                ✨ Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
