import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/clients'
import toast from 'react-hot-toast'
import { User, Zap, Flame, Brain, FileText, Youtube, Save, Edit2, BarChart2, Star, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const levelColors = { Beginner: '#34d399', Intermediate: '#fbbf24', Advanced: '#f87171' }

export default function Profile() {
  const { profile, user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', level: 'Beginner', bio: '' })
  const [stats, setStats] = useState({ yt: 0, pdf: 0, quiz: 0, subjects: 0, todos: 0, journals: 0 })
  const [quizHistory, setQuizHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', level: profile.level || 'Beginner', bio: profile.bio || '' })
      fetchStats()
      fetchQuizHistory()
    }
  }, [profile])

  async function fetchStats() {
    const [yt, pdf, quiz, subjects, todos, journals] = await Promise.all([
      supabase.from('yt_summaries').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('pdf_extractions').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('quizzes').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('subjects').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('todos').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('journals').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])
    setStats({ yt: yt.count || 0, pdf: pdf.count || 0, quiz: quiz.count || 0, subjects: subjects.count || 0, todos: todos.count || 0, journals: journals.count || 0 })
  }

  async function fetchQuizHistory() {
    const { data } = await supabase.from('quizzes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    setQuizHistory(data || [])
    // Make chart data
    const chartData = (data || []).slice(0, 7).reverse().map((q, i) => ({
      name: `Quiz ${i + 1}`,
      score: Math.round((q.score / q.total) * 100),
    }))
    setWeeklyData(chartData)
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      await updateProfile({ name: form.name, level: form.level, bio: form.bio })
      setEditing(false)
      toast.success('Profile updated! ✨')
    } catch { toast.error('Failed to update') }
    setSaving(false)
  }

  const xpToLevel = (xp) => {
    if (xp >= 1000) return 'Advanced'
    if (xp >= 300) return 'Intermediate'
    return 'Beginner'
  }

  const xpProgress = () => {
    const xp = profile?.xp || 0
    if (xp >= 1000) return 100
    if (xp >= 300) return ((xp - 300) / 700) * 100
    return (xp / 300) * 100
  }

  const xpNext = () => {
    const xp = profile?.xp || 0
    if (xp >= 1000) return 'Max Level!'
    if (xp >= 300) return `${1000 - xp} XP to Advanced`
    return `${300 - xp} XP to Intermediate`
  }

  const achievements = [
    { icon: '🎥', label: 'Video Learner', desc: 'Summarize 5 videos', done: stats.yt >= 5 },
    { icon: '📄', label: 'PDF Master', desc: 'Analyze 3 PDFs', done: stats.pdf >= 3 },
    { icon: '🧠', label: 'Quiz Champion', desc: 'Complete 10 quizzes', done: stats.quiz >= 10 },
    { icon: '📚', label: 'Subject Builder', desc: 'Add 3 subjects', done: stats.subjects >= 3 },
    { icon: '✅', label: 'Task Manager', desc: 'Add 10 tasks', done: stats.todos >= 10 },
    { icon: '📖', label: 'Journaler', desc: 'Write 5 journal entries', done: stats.journals >= 5 },
  ]

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="#a78bfa" />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>My Profile</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Profile card */}
        <div className="glass-card" style={{ padding: '28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: 'white',
                boxShadow: '0 0 30px rgba(124,58,237,0.3)',
              }}>
                {profile?.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, color: '#f1f5f9', fontSize: '1.1rem' }}>{profile?.name}</div>
                <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: 2 }}>{profile?.email}</div>
                <span style={{ fontSize: '0.7rem', color: levelColors[profile?.level] || '#a78bfa', fontWeight: 700, background: `${levelColors[profile?.level]}18`, padding: '2px 8px', borderRadius: 100, marginTop: 4, display: 'inline-block' }}>
                  {profile?.level || 'Beginner'}
                </span>
              </div>
            </div>
            <button onClick={() => setEditing(e => !e)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
              <Edit2 size={16} />
            </button>
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input className="input-field" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ padding: '10px 14px' }} />
              <textarea className="input-field" placeholder="Short bio (optional)" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ padding: '10px 14px', resize: 'none', minHeight: 70 }} />
              <div>
                <label style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 6 }}>Your Level</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setForm(f => ({ ...f, level: l }))} style={{
                      flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: '0.75rem',
                      border: form.level === l ? `1px solid ${levelColors[l]}60` : '1px solid rgba(255,255,255,0.08)',
                      background: form.level === l ? `${levelColors[l]}15` : 'rgba(255,255,255,0.03)',
                      color: form.level === l ? levelColors[l] : '#64748b', transition: 'all 0.2s',
                    }}>{l}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="nebula-btn" onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', fontSize: '0.82rem' }}>
                  <Save size={13} style={{ display: 'inline', marginRight: 5 }} />{saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="ghost-btn" onClick={() => setEditing(false)} style={{ padding: '10px 14px', fontSize: '0.82rem' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {profile?.bio && <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 16 }}>{profile.bio}</p>}
              {/* XP bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={13} color="#a78bfa" />
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Syne', fontWeight: 600 }}>{profile?.xp || 0} XP</span>
                  </div>
                  <span style={{ color: '#334155', fontSize: '0.72rem' }}>{xpNext()}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                  <div style={{ height: '100%', width: `${xpProgress()}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 100, transition: 'width 0.5s' }} />
                </div>
              </div>
              {/* Streak */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10 }}>
                <Flame size={16} color="#fbbf24" />
                <span style={{ color: '#fbbf24', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem' }}>{profile?.streak || 0} Day Streak</span>
              </div>
            </>
          )}
        </div>

        {/* Stats card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: 16 }}>📊 Learning Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'YT Videos', value: stats.yt, color: '#ef4444', icon: '🎥' },
              { label: 'PDFs', value: stats.pdf, color: '#a78bfa', icon: '📄' },
              { label: 'Quizzes', value: stats.quiz, color: '#fbbf24', icon: '🧠' },
              { label: 'Subjects', value: stats.subjects, color: '#34d399', icon: '📚' },
              { label: 'Tasks Done', value: stats.todos, color: '#f472b6', icon: '✅' },
              { label: 'Journal Entries', value: stats.journals, color: '#60a5fa', icon: '📖' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color }}>{value}</div>
                <div style={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz history chart */}
      {weeklyData.length > 0 && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: 20 }}>📈 Recent Quiz Scores</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0d1225', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'Syne', color: '#f1f5f9' }}
                formatter={(v) => [`${v}%`, 'Score']}
              />
              <Bar dataKey="score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Achievements */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: 16 }}>🏆 Achievements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {achievements.map(a => (
            <div key={a.label} style={{
              padding: '14px 16px', borderRadius: 12,
              background: a.done ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
              border: a.done ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.06)',
              opacity: a.done ? 1 : 0.5,
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 6, filter: a.done ? 'none' : 'grayscale(100%)' }}>{a.icon}</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, color: a.done ? '#f1f5f9' : '#475569', fontSize: '0.82rem' }}>{a.label}</div>
              <div style={{ color: a.done ? '#34d399' : '#334155', fontSize: '0.72rem', marginTop: 2 }}>{a.done ? '✓ Unlocked!' : a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
