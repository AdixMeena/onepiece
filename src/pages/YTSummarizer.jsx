import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, askAI } from '../lib/clients'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { Youtube, Sparkles, Copy, Save, AlertCircle, ChevronDown } from 'lucide-react'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

function getVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export default function YTSummarizer() {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [videoInfo, setVideoInfo] = useState(null)
  const [saved, setSaved] = useState(false)

  async function fetchTranscript(videoId) {
    // Use a public transcript API - timedtext
    const res = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`)
    if (!res.ok) throw new Error('No transcript available for this video')
    const data = await res.json()
    const text = data.events?.filter(e => e.segs).map(e => e.segs.map(s => s.utf8).join('')).join(' ')
    if (!text || text.trim().length < 50) throw new Error('Transcript too short or unavailable')
    return text.slice(0, 6000) // limit for AI
  }

  async function handleSummarize() {
    if (!url.trim()) return toast.error('Paste a YouTube URL first!')
    const videoId = getVideoId(url)
    if (!videoId) return toast.error('Invalid YouTube URL')
    
    setLoading(true)
    setSummary('')
    setSaved(false)

    try {
      setVideoInfo({ id: videoId, url })
      
      let transcript = ''
      try {
        transcript = await fetchTranscript(videoId)
      } catch {
        // Fallback: ask AI to summarize based on URL context
        transcript = `[Video ID: ${videoId}] - Transcript not accessible. Please summarize based on what you might know about this content, or explain that the transcript couldn't be fetched.`
      }

      const prompt = `You are summarizing a YouTube video for a ${level} level student.

Video transcript (or context):
"""
${transcript}
"""

Create comprehensive, well-structured study notes in Hinglish (English + Hindi mix where helpful).

Format your response as:
## 🎯 Video ka Summary
[2-3 line overview]

## 📌 Key Topics / Main Points
[List important concepts with explanations]

## 💡 Important Concepts Explained
[Explain key ideas at ${level} level]

## 🔑 Key Takeaways
[5-7 bullet points of what to remember]

## ❓ Possible Exam Questions
[3-4 questions this video might help answer]

Make it engaging, easy to understand for a ${level} student. Use simple language + Hindi phrases where it helps.`

      const result = await askAI([{ role: 'user', content: prompt }])
      setSummary(result)
      toast.success('Notes ready! 📝')
    } catch (err) {
      toast.error(err.message || 'Failed to summarize')
    } finally {
      setLoading(false)
    }
  }

  async function saveSummary() {
    if (!summary) return
    const { error } = await supabase.from('yt_summaries').insert({
      user_id: user.id,
      url,
      video_id: getVideoId(url),
      level,
      summary,
    })
    if (error) return toast.error('Failed to save')
    setSaved(true)
    toast.success('Saved to your library! 📚')
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary)
    toast.success('Copied to clipboard!')
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Youtube size={20} color="#ef4444" />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>YouTube Summarizer</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Koi bhi YouTube video paste karo → AI instantly smart notes bana dega, teri level ke according 🤖
        </p>
      </div>

      {/* Input card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              YouTube URL
            </label>
            <input
              className="input-field"
              placeholder="https://youtube.com/watch?v=... paste here"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Your Level
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'Syne', fontWeight: 600, fontSize: '0.82rem',
                    border: level === l ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: level === l ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                    color: level === l ? '#a78bfa' : '#64748b',
                    transition: 'all 0.2s',
                  }}
                >
                  {l === 'Beginner' ? '🌱' : l === 'Intermediate' ? '🔥' : '⚡'} {l}
                </button>
              ))}
            </div>
          </div>

          {url && getVideoId(url) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ color: '#4ade80', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600 }}>
                Valid YouTube URL detected ✓
              </span>
            </div>
          )}

          <button
            className="nebula-btn"
            onClick={handleSummarize}
            disabled={loading}
            style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? (
              <>⏳ Generating notes...</>
            ) : (
              <><Sparkles size={16} /> Generate Smart Notes</>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12, animation: 'float 2s ease-in-out infinite' }}>🤖</div>
          <p style={{ color: '#94a3b8', fontFamily: 'Syne', fontWeight: 600 }}>AI is reading the video...</p>
          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: 4 }}>Thoda ruko, notes bana raha hoon ✨</p>
        </div>
      )}

      {summary && !loading && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="label-tag">✨ AI Notes</span>
              <span style={{ color: '#475569', fontSize: '0.75rem' }}>{level} Level</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ghost-btn" onClick={copySummary} style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Copy size={13} /> Copy
              </button>
              <button
                className={saved ? 'aurora-btn' : 'nebula-btn'}
                onClick={saveSummary}
                style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                disabled={saved}
              >
                <Save size={13} /> {saved ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>

          {/* Markdown output */}
          <div className="markdown-body" style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>

          {/* Quick quiz CTA */}
          <div style={{
            marginTop: 24, padding: '16px', borderRadius: 12,
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Want to test yourself on this? 🧠
            </span>
            <button
              className="nebula-btn"
              onClick={() => {
                localStorage.setItem('pluton_quiz_context', summary)
                window.location.href = '/quiz'
              }}
              style={{ padding: '8px 18px', fontSize: '0.8rem' }}
            >
              Generate Quiz →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  )
}
