import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, askAI } from '../lib/clients'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { MessageCircle, Send, Trash2, Sparkles, Bot, User } from 'lucide-react'

const SUGGESTIONS = [
  "Newton's laws kya hain? Simple explain karo",
  "What is Big O notation? Beginner ke liye",
  "Photosynthesis ka process explain karo",
  "Difference between RAM and ROM?",
  "French Revolution kab aur kyun hua?",
  "Python mein list aur tuple mein kya fark hai?",
]

export default function DoubtFinisher() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey! Main Pluton AI hoon 🤖✨\n\nTumhara **Doubt Finisher** — koi bhi sawaal pucho, main samjhaunga apni language mein!\n\nBeginner se Advanced tak, har level ke liye explain karta hoon. Kya doubt hai aaj? 🚀`,
      id: Date.now(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
      const systemPrompt = `You are Pluton AI — a friendly, brilliant study assistant. 
The student's level is: ${profile?.level || 'Beginner'}.
Explain concepts in Hinglish (English + Hindi mix). Be encouraging, use examples, analogies.
Use emojis to keep it fun. Format responses clearly with markdown.
If asked something off-topic from studying, gently bring it back to learning.`

      const answer = await askAI([...history, { role: 'user', content: msg }], systemPrompt)
      setMessages(prev => [...prev, { role: 'assistant', content: answer, id: Date.now() }])

      // Save to DB
      await supabase.from('chat_messages').insert([
        { user_id: user.id, role: 'user', content: msg },
        { user_id: user.id, role: 'assistant', content: answer },
      ])
    } catch (err) {
      toast.error('Something went wrong. Try again!')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: `Chat clear ho gaya! 🧹 Naya sawaal pucho — main ready hoon! 🚀`,
      id: Date.now(),
    }])
    toast.success('Chat cleared!')
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', maxWidth: 800, margin: '0 auto', padding: '0 24px' }} className="lg-full-h">
      {/* Header */}
      <div style={{ padding: '24px 0 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={20} color="#34d399" />
            </div>
            <div>
              <h1 className="section-title" style={{ fontSize: '1.4rem' }}>Doubt Finisher</h1>
              <p style={{ color: '#64748b', fontSize: '0.75rem' }}>AI powered · Hinglish · {profile?.level || 'Beginner'} Level</p>
            </div>
          </div>
          <button className="ghost-btn" onClick={clearChat} style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #7c3aed, #4c1d95)'
                : 'linear-gradient(135deg, #059669, #047857)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: msg.role === 'user' ? '0 0 12px rgba(124,58,237,0.3)' : '0 0 12px rgba(5,150,105,0.3)',
            }}>
              {msg.role === 'user'
                ? <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>{profile?.name?.[0]?.toUpperCase() || 'U'}</span>
                : <Bot size={16} color="white" />}
            </div>
            <div style={{
              maxWidth: '75%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user' ? '18px 6px 18px 18px' : '6px 18px 18px 18px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(124,58,237,0.15))'
                : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user'
                ? '1px solid rgba(124,58,237,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: '#e2e8f0',
            }}>
              {msg.role === 'assistant' ? (
                <div className="markdown-body" style={{ fontSize: '0.875rem' }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="white" />
            </div>
            <div style={{ padding: '14px 18px', borderRadius: '6px 18px 18px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#34d399',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (shown when only greeting) */}
      {messages.length === 1 && (
        <div style={{ flexShrink: 0, marginBottom: 12 }}>
          <p style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'Syne', fontWeight: 600, marginBottom: 8 }}>TRY ASKING:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{
                padding: '7px 12px', borderRadius: 20, fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)'; e.currentTarget.style.color = '#34d399' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#64748b' }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ flexShrink: 0, paddingBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            className="input-field"
            placeholder="Apna doubt yahan likho... (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            rows={1}
            style={{ resize: 'none', flex: 1, maxHeight: 120, overflowY: 'auto', lineHeight: 1.6 }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 46, height: 46, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: input.trim() ? 'linear-gradient(135deg, #059669, #047857)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s', flexShrink: 0,
              boxShadow: input.trim() ? '0 4px 15px rgba(5,150,105,0.3)' : 'none',
            }}
          >
            <Send size={18} color={input.trim() ? 'white' : '#334155'} />
          </button>
        </div>
        <p style={{ color: '#1e293b', fontSize: '0.7rem', marginTop: 6, textAlign: 'center' }}>Shift+Enter for new line · Enter to send</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @media (min-width: 1024px) {
          .lg-full-h { height: calc(100vh - 40px) !important; }
        }
      `}</style>
    </div>
  )
}
