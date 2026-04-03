import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/clients'
import toast from 'react-hot-toast'
import { CheckSquare, BookOpen, Plus, Trash2, Check, Calendar, Star, X, Edit3 } from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

const PRIORITIES = [
  { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { label: 'Medium', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { label: 'Low', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
]

const MOODS = ['😊', '😐', '😔', '🔥', '😴', '💪', '🤯', '✨']

export default function TodoJournal() {
  const { user } = useAuth()
  const [tab, setTab] = useState('todo')
  const [todos, setTodos] = useState([])
  const [journals, setJournals] = useState([])
  const [newTodo, setNewTodo] = useState({ text: '', priority: 'Medium', due: '' })
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [journalText, setJournalText] = useState('')
  const [journalMood, setJournalMood] = useState('😊')
  const [journalTitle, setJournalTitle] = useState('')
  const [savingJournal, setSavingJournal] = useState(false)
  const [editingJournal, setEditingJournal] = useState(null)

  useEffect(() => { fetchTodos(); fetchJournals() }, [user])

  async function fetchTodos() {
    const { data } = await supabase.from('todos').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTodos(data || [])
  }

  async function fetchJournals() {
    const { data } = await supabase.from('journals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setJournals(data || [])
  }

  async function addTodo() {
    if (!newTodo.text.trim()) return toast.error('Task likhna bhul gaye! 😅')
    const { data, error } = await supabase.from('todos').insert({
      user_id: user.id,
      text: newTodo.text,
      priority: newTodo.priority,
      due_date: newTodo.due || null,
      done: false,
    }).select().single()
    if (error) return toast.error('Failed to add task')
    setTodos(prev => [data, ...prev])
    setNewTodo({ text: '', priority: 'Medium', due: '' })
    setShowAddTodo(false)
    toast.success('Task added! ✅')
  }

  async function toggleTodo(id, done) {
    await supabase.from('todos').update({ done: !done }).eq('id', id)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t))
  }

  async function deleteTodo(id) {
    await supabase.from('todos').delete().eq('id', id)
    setTodos(prev => prev.filter(t => t.id !== id))
    toast.success('Task removed')
  }

  async function saveJournal() {
    if (!journalText.trim()) return toast.error('Kuch toh likho! ✍️')
    setSavingJournal(true)
    try {
      if (editingJournal) {
        const { data } = await supabase.from('journals').update({ title: journalTitle, content: journalText, mood: journalMood }).eq('id', editingJournal).select().single()
        setJournals(prev => prev.map(j => j.id === editingJournal ? data : j))
        toast.success('Updated! 📝')
        setEditingJournal(null)
      } else {
        const { data } = await supabase.from('journals').insert({ user_id: user.id, title: journalTitle || `Entry – ${format(new Date(), 'MMM d')}`, content: journalText, mood: journalMood }).select().single()
        setJournals(prev => [data, ...prev])
        toast.success('Journal entry saved! 📖')
      }
      setJournalText('')
      setJournalTitle('')
      setJournalMood('😊')
    } catch { toast.error('Failed to save') }
    setSavingJournal(false)
  }

  async function deleteJournal(id) {
    await supabase.from('journals').delete().eq('id', id)
    setJournals(prev => prev.filter(j => j.id !== id))
    toast.success('Entry deleted')
  }

  function startEdit(journal) {
    setEditingJournal(journal.id)
    setJournalTitle(journal.title)
    setJournalText(journal.content)
    setJournalMood(journal.mood)
    setTab('write')
    window.scrollTo(0, 0)
  }

  const getPriorityStyle = (p) => PRIORITIES.find(x => x.label === p) || PRIORITIES[1]
  const completedTodos = todos.filter(t => t.done).length
  const pendingTodos = todos.filter(t => !t.done)
  const doneTodos = todos.filter(t => t.done)

  const getDueLabel = (due) => {
    if (!due) return null
    const d = new Date(due)
    if (isToday(d)) return { label: 'Today', color: '#fbbf24' }
    if (isTomorrow(d)) return { label: 'Tomorrow', color: '#60a5fa' }
    if (isPast(d)) return { label: 'Overdue', color: '#ef4444' }
    return { label: format(d, 'MMM d'), color: '#64748b' }
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquare size={20} color="#f472b6" />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>To-Do & Journal</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Apna din plan karo aur apni journey journal mein capture karo ✨</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {[
          { id: 'todo', icon: CheckSquare, label: `To-Do (${pendingTodos.length})` },
          { id: 'write', icon: Edit3, label: editingJournal ? 'Edit Entry' : 'Write' },
          { id: 'entries', icon: BookOpen, label: `Journal (${journals.length})` },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, cursor: 'pointer', border: 'none',
            fontFamily: 'Syne', fontWeight: 600, fontSize: '0.82rem',
            background: tab === id ? 'linear-gradient(135deg, rgba(244,114,182,0.25), rgba(244,114,182,0.1))' : 'transparent',
            color: tab === id ? '#f472b6' : '#475569', transition: 'all 0.2s',
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* TO-DO TAB */}
      {tab === 'todo' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: todos.length, color: '#94a3b8' },
              { label: 'Pending', value: pendingTodos.length, color: '#fbbf24' },
              { label: 'Done', value: completedTodos, color: '#34d399' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, color, fontSize: '1.1rem' }}>{value}</span>
                <span style={{ color: '#475569', fontSize: '0.78rem', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Add Task */}
          <button className="nebula-btn" onClick={() => setShowAddTodo(s => !s)}
            style={{ marginBottom: 16, padding: '9px 18px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #db2777, #be185d)' }}>
            <Plus size={14} /> Add Task
          </button>

          {showAddTodo && (
            <div className="glass-card animate-fade-in" style={{ padding: '20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input-field" placeholder="What needs to be done?" value={newTodo.text} onChange={e => setNewTodo(t => ({ ...t, text: e.target.value }))
                } onKeyDown={e => e.key === 'Enter' && addTodo()} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <label style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 6 }}>Priority</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {PRIORITIES.map(p => (
                        <button key={p.label} onClick={() => setNewTodo(t => ({ ...t, priority: p.label }))} style={{
                          flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', border: 'none',
                          background: newTodo.priority === p.label ? p.bg : 'rgba(255,255,255,0.03)',
                          color: newTodo.priority === p.label ? p.color : '#475569',
                          fontFamily: 'Syne', fontWeight: 600, fontSize: '0.75rem',
                          outline: newTodo.priority === p.label ? `1px solid ${p.color}50` : '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.2s',
                        }}>{p.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <label style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 6 }}>Due Date (optional)</label>
                    <input type="date" className="input-field" value={newTodo.due} onChange={e => setNewTodo(t => ({ ...t, due: e.target.value }))} style={{ padding: '8px 12px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="nebula-btn" onClick={addTodo} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #db2777, #be185d)' }}>Add Task ✅</button>
                  <button className="ghost-btn" onClick={() => setShowAddTodo(false)} style={{ padding: '10px 16px' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Pending tasks */}
          {pendingTodos.length === 0 && doneTodos.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎯</div>
              <p style={{ color: '#475569', fontFamily: 'Syne', fontWeight: 600 }}>No tasks yet! Add your first task above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingTodos.map(todo => {
                const pri = getPriorityStyle(todo.priority)
                const dueInfo = getDueLabel(todo.due_date)
                return (
                  <div key={todo.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => toggleTodo(todo.id, todo.done)} style={{
                      width: 24, height: 24, borderRadius: '50%', border: `2px solid ${pri.color}60`, background: 'transparent', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = `${pri.color}20`}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ color: '#e2e8f0', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{todo.text}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.68rem', color: pri.color, background: pri.bg, padding: '1px 7px', borderRadius: 100, fontFamily: 'Syne', fontWeight: 600 }}>{todo.priority}</span>
                        {dueInfo && <span style={{ fontSize: '0.68rem', color: dueInfo.color, fontFamily: 'Syne', fontWeight: 600 }}>{dueInfo.label}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteTodo(todo.id)} style={{ color: '#334155', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#334155'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}

              {/* Done tasks */}
              {doneTodos.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 4px' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ color: '#334155', fontSize: '0.72rem', fontFamily: 'Syne', fontWeight: 600 }}>COMPLETED ({doneTodos.length})</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  {doneTodos.map(todo => (
                    <div key={todo.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', opacity: 0.6 }}>
                      <button onClick={() => toggleTodo(todo.id, todo.done)} style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: '#34d399', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={13} color="white" />
                      </button>
                      <span style={{ flex: 1, color: '#475569', fontSize: '0.875rem', textDecoration: 'line-through' }}>{todo.text}</span>
                      <button onClick={() => deleteTodo(todo.id)} style={{ color: '#334155', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* WRITE JOURNAL TAB */}
      {tab === 'write' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-title" style={{ fontSize: '1.1rem' }}>{editingJournal ? '✏️ Edit Entry' : '✍️ New Entry'}</h2>
            {editingJournal && (
              <button className="ghost-btn" onClick={() => { setEditingJournal(null); setJournalText(''); setJournalTitle(''); setJournalMood('😊') }}
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Cancel Edit</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input className="input-field" placeholder="Entry title (optional)" value={journalTitle} onChange={e => setJournalTitle(e.target.value)} />

            {/* Mood */}
            <div>
              <label style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>Aaj ka mood?</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {MOODS.map(m => (
                  <button key={m} onClick={() => setJournalMood(m)} style={{
                    width: 42, height: 42, borderRadius: 12, fontSize: '1.3rem', cursor: 'pointer', border: 'none',
                    background: journalMood === m ? 'rgba(244,114,182,0.2)' : 'rgba(255,255,255,0.04)',
                    outline: journalMood === m ? '2px solid rgba(244,114,182,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                  }}>{m}</button>
                ))}
              </div>
            </div>

            <textarea
              className="input-field"
              placeholder="Aaj kya hua? Kya sikha? Kaisa feel kar rahe ho? Apni thoughts likho..."
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              style={{ minHeight: 200, resize: 'vertical', lineHeight: 1.7 }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="nebula-btn" onClick={saveJournal} disabled={savingJournal}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #db2777, #be185d)' }}>
                {savingJournal ? '⏳ Saving...' : editingJournal ? '💾 Update Entry' : '📖 Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOURNAL ENTRIES TAB */}
      {tab === 'entries' && (
        <div>
          {journals.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📖</div>
              <p style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No journal entries yet</p>
              <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: 20 }}>Apni pehli entry likhna shuru karo!</p>
              <button className="nebula-btn" onClick={() => setTab('write')} style={{ background: 'linear-gradient(135deg, #db2777, #be185d)' }}>Write First Entry ✍️</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {journals.map(j => (
                <div key={j.id} className="glass-card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.4rem' }}>{j.mood}</span>
                      <div>
                        <div style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{j.title}</div>
                        <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: 1 }}>
                          {format(new Date(j.created_at), 'MMMM d, yyyy · h:mm a')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(j)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                        onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deleteJournal(j.id)} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {j.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
