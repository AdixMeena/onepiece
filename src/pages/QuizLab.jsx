import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, askAI } from '../lib/clients'
import toast from 'react-hot-toast'
import { Brain, Sparkles, Check, X, RotateCcw, Trophy } from 'lucide-react'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const SOURCES = ['Custom Topic', 'From Notes (paste)', 'From Saved Content']

export default function QuizLab() {
  const { user } = useAuth()
  const [level, setLevel] = useState('Beginner')
  const [source, setSource] = useState('Custom Topic')
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [numQ, setNumQ] = useState(5)
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const ctx = localStorage.getItem('pluton_quiz_context')
    if (ctx) {
      setSource('From Notes (paste)')
      setNotes(ctx)
      localStorage.removeItem('pluton_quiz_context')
    }
  }, [])

  async function generateQuiz() {
    const context = source === 'Custom Topic' ? `Topic: ${topic}` : `Notes/Content:\n${notes}`
    if (!context.trim() || (source === 'Custom Topic' && !topic.trim())) return toast.error('Enter a topic or notes!')
    
    setLoading(true)
    setQuiz(null)
    setAnswers({})
    setSubmitted(false)

    try {
      const prompt = `Create a quiz for a ${level} level student.

${context}

Generate exactly ${numQ} multiple choice questions. Return ONLY valid JSON (no markdown, no backticks):

{
  "title": "Quiz title",
  "questions": [
    {
      "id": 1,
      "question": "Question text in Hinglish if helpful",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": 0,
      "explanation": "Explanation in simple Hinglish"
    }
  ]
}

correct is 0-indexed. Make questions appropriate for ${level} level. Return ONLY the JSON object.`

      const raw = await askAI([{ role: 'user', content: prompt }], 'You are a quiz generator. Return only valid JSON, no markdown formatting, no backticks.')
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setQuiz(parsed)
      toast.success(`${numQ} questions ready! 🧠`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate quiz. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function selectAnswer(qId, optIdx) {
    if (submitted) return
    setAnswers(a => ({ ...a, [qId]: optIdx }))
  }

  function submitQuiz() {
    if (!quiz) return
    let correct = 0
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++
    })
    setScore(correct)
    setSubmitted(true)

    // Save to DB
    supabase.from('quizzes').insert({
      user_id: user.id,
      title: quiz.title,
      level,
      score: correct,
      total: quiz.questions.length,
      questions: quiz.questions,
    })
    toast.success(`Quiz complete! ${correct}/${quiz.questions.length} correct 🎉`)
  }

  function reset() {
    setQuiz(null)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  const getOptionStyle = (q, optIdx) => {
    const isSelected = answers[q.id] === optIdx
    const isCorrect = q.correct === optIdx
    
    if (!submitted) {
      return {
        background: isSelected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
        border: isSelected ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
        color: isSelected ? '#a78bfa' : '#94a3b8',
      }
    }
    if (isCorrect) return { background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399' }
    if (isSelected && !isCorrect) return { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }
    return { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#334155' }
  }

  const pct = quiz ? Math.round((score / quiz.questions.length) * 100) : 0

  return (
    <div style={{ padding: '28px 24px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="#fbbf24" />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Quiz Lab</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Apne knowledge ko test karo — notes se ya kisi bhi topic par quiz banao 🧠
        </p>
      </div>

      {!quiz && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Source */}
            <div>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>Quiz Source</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SOURCES.map(s => (
                  <button key={s} onClick={() => setSource(s)} style={{
                    padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Syne', fontWeight: 600, fontSize: '0.78rem',
                    border: source === s ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: source === s ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                    color: source === s ? '#fbbf24' : '#64748b', transition: 'all 0.2s',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {source === 'Custom Topic' ? (
              <input className="input-field" placeholder="e.g. Newton's Laws of Motion, Python Loops, Mughal Empire..." value={topic} onChange={e => setTopic(e.target.value)} />
            ) : (
              <textarea className="input-field" placeholder="Paste your notes or summary here..." value={notes} onChange={e => setNotes(e.target.value)}
                style={{ minHeight: 120, resize: 'vertical' }} />
            )}

            {/* Level */}
            <div>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>Your Level</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)} style={{
                    flex: 1, padding: '9px 8px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Syne', fontWeight: 600, fontSize: '0.8rem',
                    border: level === l ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: level === l ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                    color: level === l ? '#fbbf24' : '#64748b', transition: 'all 0.2s',
                  }}>
                    {l === 'Beginner' ? '🌱' : l === 'Intermediate' ? '🔥' : '⚡'} {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Number of Questions: <span style={{ color: '#fbbf24' }}>{numQ}</span>
              </label>
              <input type="range" min={3} max={15} value={numQ} onChange={e => setNumQ(+e.target.value)}
                style={{ width: '100%', accentColor: '#fbbf24' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontSize: '0.72rem', marginTop: 4 }}>
                <span>3</span><span>15</span>
              </div>
            </div>

            <button className="nebula-btn" onClick={generateQuiz} disabled={loading}
              style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
              {loading ? '⏳ Generating...' : <><Sparkles size={16} /> Generate Quiz</>}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🧠</div>
          <p style={{ color: '#94a3b8', fontFamily: 'Syne', fontWeight: 600 }}>Quiz ban raha hai...</p>
        </div>
      )}

      {/* Score card */}
      {submitted && (
        <div className="glass-card animate-fade-in" style={{ padding: '28px 24px', marginBottom: 20, textAlign: 'center' }}>
          <Trophy size={36} style={{ color: pct >= 70 ? '#fbbf24' : '#f87171', margin: '0 auto 12px' }} />
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#f1f5f9' }}>{score}/{quiz.questions.length}</h2>
          <p style={{ color: pct >= 70 ? '#34d399' : '#f87171', fontFamily: 'Syne', fontWeight: 600, marginTop: 4 }}>
            {pct >= 80 ? '🔥 Excellent! Bahut accha kiya!' : pct >= 60 ? '👍 Good job! Thoda aur practice karo' : '💪 Keep practicing! Hoga!'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            <button className="ghost-btn" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={14} /> New Quiz
            </button>
            <button className="nebula-btn" onClick={generateQuiz} style={{ padding: '9px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Quiz questions */}
      {quiz && !loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-title">{quiz.title}</h2>
            {!submitted && (
              <button className="ghost-btn" onClick={reset} style={{ padding: '7px 14px', fontSize: '0.78rem' }}>
                ← Change
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {quiz.questions.map((q, qi) => (
              <div key={q.id} className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#fbbf24', fontSize: '0.95rem', flexShrink: 0 }}>Q{qi + 1}</span>
                  <p style={{ color: '#e2e8f0', fontWeight: 500, lineHeight: 1.5, fontSize: '0.9rem' }}>{q.question}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => selectAnswer(q.id, oi)} style={{
                      padding: '11px 14px', borderRadius: 10, cursor: submitted ? 'default' : 'pointer',
                      textAlign: 'left', fontSize: '0.875rem', lineHeight: 1.4, transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 10,
                      ...getOptionStyle(q, oi),
                    }}>
                      {submitted && q.correct === oi && <Check size={14} style={{ flexShrink: 0 }} />}
                      {submitted && answers[q.id] === oi && q.correct !== oi && <X size={14} style={{ flexShrink: 0 }} />}
                      {opt}
                    </button>
                  ))}
                </div>
                {submitted && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(139,92,246,0.08)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.2)' }}>
                    <p style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>💡 Explanation</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!submitted && (
            <button className="nebula-btn" onClick={submitQuiz}
              style={{ width: '100%', marginTop: 20, padding: '14px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #d97706, #b45309)' }}
              disabled={Object.keys(answers).length < quiz.questions.length}>
              {Object.keys(answers).length < quiz.questions.length
                ? `Answer ${quiz.questions.length - Object.keys(answers).length} more to submit`
                : '🎯 Submit Quiz'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
