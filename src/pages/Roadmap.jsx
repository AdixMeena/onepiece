import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase, askAI } from '../lib/clients'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { Map, Sparkles, Check, Circle, ChevronDown, ChevronRight, Plus, RefreshCw } from 'lucide-react'

export default function Roadmap() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [expandedPhase, setExpandedPhase] = useState(0)

  useEffect(() => { fetchSubjects() }, [user])

  async function fetchSubjects() {
    const { data } = await supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at')
    setSubjects(data || [])
    if (data?.length) setSelectedSubject(data[0])
  }

  useEffect(() => {
    if (selectedSubject) fetchRoadmap()
  }, [selectedSubject])

  async function fetchRoadmap() {
    if (!selectedSubject) return
    const { data } = await supabase.from('roadmaps').select('*').eq('subject_id', selectedSubject.id).single()
    if (data) {
      try { setRoadmap(JSON.parse(data.roadmap_json)) }
      catch { setRoadmap(null) }
    } else {
      setRoadmap(null)
    }
  }

  async function generateRoadmap() {
    if (!selectedSubject) return
    setGenerating(true)
    try {
      const prompt = `Create a detailed learning roadmap for: "${selectedSubject.name}"
Level: ${selectedSubject.level || 'Beginner'}

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": "Subject Learning Roadmap",
  "totalWeeks": 12,
  "phases": [
    {
      "id": 1,
      "title": "Phase Title",
      "weeks": "Week 1-3",
      "description": "What this phase covers",
      "topics": [
        { "id": "t1", "title": "Topic name", "done": false, "description": "Brief what to learn" }
      ],
      "milestone": "What you'll be able to do after this phase"
    }
  ]
}
Make 3-4 phases with 4-6 topics each. Use Hinglish where helpful. Return ONLY the JSON.`

      const raw = await askAI([{ role: 'user', content: prompt }], 'You generate learning roadmaps as JSON only. No markdown, no backticks.')
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      // Save to DB
      await supabase.from('roadmaps').upsert({
        user_id: user.id,
        subject_id: selectedSubject.id,
        roadmap_json: JSON.stringify(parsed),
      }, { onConflict: 'subject_id' })

      setRoadmap(parsed)
      toast.success('Roadmap ready! 🗺️')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  async function toggleTopic(phaseIdx, topicId) {
    if (!roadmap) return
    const updated = { ...roadmap }
    const topic = updated.phases[phaseIdx].topics.find(t => t.id === topicId)
    if (topic) topic.done = !topic.done

    // Calculate progress
    const allTopics = updated.phases.flatMap(p => p.topics)
    const doneCount = allTopics.filter(t => t.done).length
    const progress = Math.round((doneCount / allTopics.length) * 100)

    setRoadmap(updated)

    // Save updated roadmap
    await supabase.from('roadmaps').update({ roadmap_json: JSON.stringify(updated) }).eq('subject_id', selectedSubject.id)
    // Update subject progress
    await supabase.from('subjects').update({ progress }).eq('id', selectedSubject.id)
  }

  const getPhaseCompletion = (phase) => {
    const done = phase.topics.filter(t => t.done).length
    return { done, total: phase.topics.length, pct: Math.round((done / phase.topics.length) * 100) }
  }

  const phaseColors = ['#7c3aed', '#059669', '#d97706', '#dc2626']

  return (
    <div style={{ padding: '28px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Map size={20} color="#60a5fa" />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>Learning Roadmap</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          AI tumhare subject ke liye ek personalized learning path banata hai 🗺️
        </p>
      </div>

      {/* Subject selector */}
      {subjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🪐</div>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No Subjects Yet</h3>
          <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: 20 }}>Dashboard mein subject add karo pehle!</p>
          <button className="nebula-btn" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
        </div>
      ) : (
        <>
          {/* Subject tabs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {subjects.map(sub => (
              <button key={sub.id} onClick={() => setSelectedSubject(sub)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'Syne', fontWeight: 600, fontSize: '0.82rem',
                border: selectedSubject?.id === sub.id ? `1px solid ${sub.color}50` : '1px solid rgba(255,255,255,0.08)',
                background: selectedSubject?.id === sub.id ? `${sub.color}18` : 'rgba(255,255,255,0.03)',
                color: selectedSubject?.id === sub.id ? sub.color : '#64748b', transition: 'all 0.2s',
              }}>
                <span>{sub.icon}</span> {sub.name}
              </button>
            ))}
          </div>

          {selectedSubject && (
            <div>
              {/* Generate / Regenerate */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem' }}>
                    {selectedSubject.icon} {selectedSubject.name} Roadmap
                  </h2>
                  {roadmap && (
                    <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 2 }}>{roadmap.totalWeeks} weeks · {roadmap.phases?.length} phases</p>
                  )}
                </div>
                <button
                  className={roadmap ? 'ghost-btn' : 'nebula-btn'}
                  onClick={generateRoadmap}
                  disabled={generating}
                  style={{ padding: '9px 18px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {generating ? '⏳ Generating...' : roadmap ? <><RefreshCw size={13} /> Regenerate</> : <><Sparkles size={14} /> Generate Roadmap</>}
                </button>
              </div>

              {generating && (
                <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗺️</div>
                  <p style={{ color: '#94a3b8', fontFamily: 'Syne', fontWeight: 600 }}>AI roadmap design kar raha hai...</p>
                </div>
              )}

              {!roadmap && !generating && (
                <div className="glass-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>✨</div>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>No roadmap yet</h3>
                  <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: 20 }}>AI ek personalized learning path banayega {selectedSubject.name} ke liye!</p>
                  <button className="nebula-btn" onClick={generateRoadmap}>
                    <Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Generate Roadmap
                  </button>
                </div>
              )}

              {roadmap && !generating && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Overall progress */}
                  <div className="glass-card" style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>Overall Progress</span>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: selectedSubject.color || '#a78bfa', fontSize: '0.9rem' }}>
                        {roadmap.phases ? Math.round((roadmap.phases.flatMap(p=>p.topics).filter(t=>t.done).length / roadmap.phases.flatMap(p=>p.topics).length) * 100) : 0}%
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                      <div style={{
                        height: '100%',
                        width: `${roadmap.phases ? Math.round((roadmap.phases.flatMap(p=>p.topics).filter(t=>t.done).length / roadmap.phases.flatMap(p=>p.topics).length) * 100) : 0}%`,
                        background: `linear-gradient(90deg, ${selectedSubject.color || '#7c3aed'}, ${selectedSubject.color || '#7c3aed'}80)`,
                        borderRadius: 100, transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>

                  {/* Phases */}
                  {roadmap.phases?.map((phase, pi) => {
                    const { done, total, pct } = getPhaseCompletion(phase)
                    const isOpen = expandedPhase === pi
                    const color = phaseColors[pi % phaseColors.length]
                    return (
                      <div key={phase.id} className="glass-card" style={{ overflow: 'hidden' }}>
                        {/* Phase header */}
                        <button
                          onClick={() => setExpandedPhase(isOpen ? -1 : pi)}
                          style={{ width: '100%', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14 }}
                        >
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                            background: pct === 100 ? `${color}30` : 'rgba(255,255,255,0.06)',
                            border: `2px solid ${pct === 100 ? color : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {pct === 100 ? <Check size={18} color={color} /> : <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>{pi + 1}</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{phase.title}</span>
                              <span style={{ fontSize: '0.7rem', color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 100 }}>{phase.weeks}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100 }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width 0.4s' }} />
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>{done}/{total}</span>
                            </div>
                          </div>
                          {isOpen ? <ChevronDown size={16} color="#475569" /> : <ChevronRight size={16} color="#475569" />}
                        </button>

                        {/* Phase content */}
                        {isOpen && (
                          <div style={{ padding: '0 22px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '14px 0', lineHeight: 1.5 }}>{phase.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {phase.topics.map(topic => (
                                <button
                                  key={topic.id}
                                  onClick={() => toggleTopic(pi, topic.id)}
                                  style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10,
                                    background: topic.done ? `${color}10` : 'rgba(255,255,255,0.03)',
                                    border: topic.done ? `1px solid ${color}30` : '1px solid rgba(255,255,255,0.07)',
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                  }}
                                >
                                  <div style={{
                                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                                    background: topic.done ? color : 'transparent',
                                    border: topic.done ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                                  }}>
                                    {topic.done && <Check size={12} color="white" />}
                                  </div>
                                  <div>
                                    <div style={{ fontFamily: 'Syne', fontWeight: 600, color: topic.done ? color : '#cbd5e1', fontSize: '0.85rem', textDecoration: topic.done ? 'line-through' : 'none', opacity: topic.done ? 0.7 : 1 }}>
                                      {topic.title}
                                    </div>
                                    {topic.description && (
                                      <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: 2, lineHeight: 1.4 }}>{topic.description}</div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                            {phase.milestone && (
                              <div style={{ marginTop: 14, padding: '10px 14px', background: `${color}10`, border: `1px solid ${color}20`, borderRadius: 10 }}>
                                <p style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'Syne', fontWeight: 600, marginBottom: 2 }}>🏁 MILESTONE</p>
                                <p style={{ color: color, fontSize: '0.8rem' }}>{phase.milestone}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
