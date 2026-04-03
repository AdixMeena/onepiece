import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../context/AuthContext'
import { supabase, askAI } from '../lib/clients'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { FileText, Upload, Sparkles, Copy, Save, X } from 'lucide-react'

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const MODES = [
  { id: 'notes', label: '📝 Key Notes', desc: 'Structured notes from PDF' },
  { id: 'questions', label: '❓ Important Questions', desc: 'Likely exam questions' },
  { id: 'both', label: '🎯 Notes + Q&A', desc: 'Both notes and questions' },
]

async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        // Use PDF.js via CDN for text extraction
        if (!window.pdfjsLib) {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          document.head.appendChild(script)
          await new Promise(r => script.onload = r)
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        }
        const pdf = await window.pdfjsLib.getDocument({ data: e.target.result }).promise
        let text = ''
        for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map(item => item.str).join(' ') + '\n'
        }
        resolve(text.slice(0, 8000))
      } catch (err) {
        reject(new Error('Failed to extract PDF text. Try a text-based PDF.'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export default function PDFExtractor() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [level, setLevel] = useState('Beginner')
  const [mode, setMode] = useState('both')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [saved, setSaved] = useState(false)

  const onDrop = useCallback(files => {
    if (files[0]) {
      setFile(files[0])
      setResult('')
      setSaved(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
  })

  async function handleExtract() {
    if (!file) return toast.error('Upload a PDF first!')
    setLoading(true)
    setResult('')
    setSaved(false)

    try {
      const text = await extractTextFromPDF(file)
      if (!text.trim()) throw new Error('No readable text found in PDF')

      const modePrompts = {
        notes: `Create comprehensive, structured study notes`,
        questions: `Extract the most important questions and provide detailed answers`,
        both: `First create comprehensive study notes, then extract important questions with detailed answers`,
      }

      const prompt = `You are analyzing a PDF document for a ${level} level student.

PDF Content:
"""
${text}
"""

Task: ${modePrompts[mode]}

Format in Hinglish (English + helpful Hindi) for a ${level} level student.

${mode !== 'questions' ? `## 📚 Study Notes
### Key Concepts
[Explain main concepts at ${level} level]

### Important Points
[Bullet points of crucial information]

### Summary
[Brief summary of the document]

` : ''}${mode !== 'notes' ? `## ❓ Important Questions & Answers

[For each important question:]
**Q1: [Question]**
Ans: [Detailed answer at ${level} level]

[Include 5-8 questions based on the content]
` : ''}

## 💡 Quick Revision Tips
[3-4 tips to remember this content]`

      const answer = await askAI([{ role: 'user', content: prompt }])
      setResult(answer)
      toast.success('Extraction complete! 🎉')
    } catch (err) {
      toast.error(err.message || 'Failed to process PDF')
    } finally {
      setLoading(false)
    }
  }

  async function saveResult() {
    const { error } = await supabase.from('pdf_extractions').insert({
      user_id: user.id,
      file_name: file.name,
      level, mode, result,
    })
    if (error) return toast.error('Failed to save')
    setSaved(true)
    toast.success('Saved to library! 📚')
  }

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="#a78bfa" />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>PDF Note Extractor</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Apna PDF upload karo → AI important notes aur questions nikal dega, tere level ke hisaab se 📄✨
        </p>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
        {/* Dropzone */}
        {!file ? (
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.3s',
              marginBottom: 16,
            }}
          >
            <input {...getInputProps()} />
            <Upload size={36} style={{ color: isDragActive ? '#a78bfa' : '#334155', margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Syne', fontWeight: 600, color: isDragActive ? '#a78bfa' : '#64748b', fontSize: '0.95rem', marginBottom: 4 }}>
              {isDragActive ? 'Drop it here! 🎯' : 'Drag & drop your PDF'}
            </p>
            <p style={{ color: '#334155', fontSize: '0.8rem' }}>or click to browse · Max 20MB</p>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 12, marginBottom: 16,
          }}>
            <FileText size={20} color="#a78bfa" />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button onClick={() => { setFile(null); setResult('') }} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Level */}
          <div>
            <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>Your Level</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)} style={{
                  flex: 1, padding: '9px 8px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'Syne', fontWeight: 600, fontSize: '0.8rem',
                  border: level === l ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  background: level === l ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                  color: level === l ? '#a78bfa' : '#64748b', transition: 'all 0.2s',
                }}>
                  {l === 'Beginner' ? '🌱' : l === 'Intermediate' ? '🔥' : '⚡'} {l}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Syne', fontWeight: 600, display: 'block', marginBottom: 8 }}>What to Extract</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} style={{
                  flex: 1, minWidth: 120, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: mode === m.id ? '1px solid rgba(167,139,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  background: mode === m.id ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '0.8rem', color: mode === m.id ? '#a78bfa' : '#94a3b8', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#475569' }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button className="nebula-btn" onClick={handleExtract} disabled={loading || !file}
            style={{ padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? '⏳ Processing...' : <><Sparkles size={16} /> Extract & Analyze</>}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
          <p style={{ color: '#94a3b8', fontFamily: 'Syne', fontWeight: 600 }}>Reading your PDF...</p>
          <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: 4 }}>AI notes bana raha hai, ek second 🤖</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <span className="label-tag">✨ Extracted Content</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ghost-btn" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!') }}
                style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Copy size={13} /> Copy
              </button>
              <button className={saved ? 'aurora-btn' : 'nebula-btn'} onClick={saveResult}
                style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5 }}
                disabled={saved}>
                <Save size={13} /> {saved ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>
          <div className="markdown-body" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
          <div style={{
            marginTop: 24, padding: '16px', borderRadius: 12,
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Test yourself on this PDF? 🧠</span>
            <button className="nebula-btn" onClick={() => { localStorage.setItem('pluton_quiz_context', result); window.location.href = '/quiz' }}
              style={{ padding: '8px 18px', fontSize: '0.8rem' }}>Generate Quiz →</button>
          </div>
        </div>
      )}
    </div>
  )
}
