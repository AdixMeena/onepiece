import { useMemo } from 'react'

export default function StarField({ count = 80 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 5,
  })), [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            '--duration': `${s.duration}s`,
            '--delay': `${s.delay}s`,
            opacity: 0.4,
          }}
        />
      ))}
      {/* Nebula glows */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '15%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)',
      }} />
    </div>
  )
}
