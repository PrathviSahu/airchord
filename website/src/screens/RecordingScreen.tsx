import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Square, Download } from 'lucide-react'

type Phase = 'setup' | 'countdown' | 'recording' | 'preview' | 'export'

interface Props { onBack: () => void }

export default function RecordingScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [countdown, setCountdown] = useState(3)
  const [recTime, setRecTime] = useState(0)
  const [guitarVol, setGuitarVol] = useState(0.7)
  const [voiceVol, setVoiceVol] = useState(0.5)
  const [metronome, setMetronome] = useState(false)
  const [waveG, setWaveG] = useState<number[]>(Array(40).fill(0.1))
  const [waveV, setWaveV] = useState<number[]>(Array(40).fill(0.1))
  const [chord, setChord] = useState('G')
  const CHORDS = ['G', 'Am', 'F', 'C', 'Em', 'D']

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown <= 0) { setPhase('recording'); return }
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [phase, countdown])

  useEffect(() => {
    if (phase !== 'recording') { setWaveG(Array(40).fill(0.1)); setWaveV(Array(40).fill(0.05)); return }
    const iv = setInterval(() => {
      setRecTime(t => t + 1)
      setWaveG(Array(40).fill(0).map(() => 0.1 + Math.random() * guitarVol))
      setWaveV(Array(40).fill(0).map(() => 0.05 + Math.random() * voiceVol))
      setChord(CHORDS[Math.floor(Date.now() / 2000) % CHORDS.length])
    }, 100)
    return () => clearInterval(iv)
  }, [phase, guitarVol, voiceVol])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (phase === 'countdown') return (
    <div className="screen-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={countdown}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            fontSize: 160, fontWeight: 200, lineHeight: 1, letterSpacing: '-0.06em',
            color: countdown === 0 ? '#EF4444' : '#fff',
          }}>
            {countdown > 0 ? countdown : '●'}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 16 }}>
            {countdown > 0 ? `Starting in ${countdown}` : 'Recording'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )

  if (phase === 'recording') return (
    <div className="screen-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} className="anim-slow-pulse" />
          <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 500, letterSpacing: '0.05em' }}>REC</span>
          <span style={{ fontSize: 16, fontWeight: 300, color: '#fff', fontVariantNumeric: 'tabular-nums', marginLeft: 8 }}>{fmt(recTime)}</span>
        </div>
        <span style={{ fontSize: 36, fontWeight: 200, color: '#fff', letterSpacing: '-0.03em' }}>{chord}</span>
        <button onClick={() => setPhase('preview')} className="icon-btn" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <Square size={16} style={{ color: '#EF4444' }} />
        </button>
      </div>

      {/* Camera */}
      <div style={{ margin: '0 20px', flex: 1, background: '#080808', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8, opacity: 0.3 }}>🎤</div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Camera · Recording</p>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 8px' }}>
          {/* Guitar waveform */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 20, gap: 1, marginBottom: 4 }}>
            {waveG.map((v, i) => <div key={i} style={{ flex: 1, background: 'rgba(201,168,76,0.6)', borderRadius: 1, height: `${v * 100}%`, transition: 'height 0.1s' }} />)}
          </div>
          {/* Voice waveform */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 14, gap: 1 }}>
            {waveV.map((v, i) => <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.25)', borderRadius: 1, height: `${v * 100}%`, transition: 'height 0.1s' }} />)}
          </div>
        </div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  )

  if (phase === 'preview') return (
    <div className="screen-bg" style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '28px 0 8px' }}>
        <button className="icon-btn" onClick={() => setPhase('setup')}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>Preview</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{fmt(recTime)} recorded</p>
        </div>
      </div>

      {/* Waveform timeline */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 60, gap: 1 }}>
          {Array(64).fill(0).map((_, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 1,
              background: 'rgba(255,255,255,0.3)',
              height: `${15 + Math.abs(Math.sin(i * 0.4) * 50 + Math.cos(i * 0.3) * 25)}%`,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>0:00</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{fmt(recTime)}</span>
        </div>
      </div>

      {/* Volume mixer */}
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 20 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Mixer</p>
        {[
          { label: '🎸 Guitar', val: guitarVol, set: setGuitarVol },
          { label: '🎤 Voice',  val: voiceVol,  set: setVoiceVol },
        ].map(track => (
          <div key={track.label} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{track.label}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(track.val * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={track.val} onChange={e => track.set(+e.target.value)} style={{ width: '100%' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={() => { setRecTime(0); setCountdown(3); setPhase('countdown') }} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer' }}>Retake</button>
        <button onClick={() => setPhase('export')} style={{ flex: 1, padding: '16px', background: '#fff', borderRadius: 6, color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none' }}>Save →</button>
      </div>
    </div>
  )

  if (phase === 'export') return (
    <div className="screen-bg" style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '28px 0 8px' }}>
        <button className="icon-btn" onClick={() => setPhase('preview')}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>Export</h1>
      </div>

      {[
        { id: 'mp3', label: 'MP3 Audio', desc: 'Compressed · ~2 MB' },
        { id: 'wav', label: 'WAV Lossless', desc: 'Studio quality · ~5 MB' },
        { id: 'mp4', label: 'MP4 Video', desc: 'With camera · ~15 MB' },
      ].map(f => (
        <button key={f.id} style={{ padding: '20px 20px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s' }}>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#fff', marginBottom: 4 }}>{f.label}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{f.desc}</p>
        </button>
      ))}

      <button
        onClick={onBack}
        style={{ marginTop: 12, width: '100%', padding: '18px', background: '#fff', borderRadius: 6, color: '#000', fontSize: 15, fontWeight: 600, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        <Download size={16} /> Export & Save
      </button>
    </div>
  )

  // Setup
  return (
    <div className="screen-bg" style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '28px 0 8px' }}>
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>Recording Studio</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Set up your session</p>
        </div>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 20 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>What to record</p>
        {['Free Play — Open session', 'Song from Library', 'Custom chord sequence'].map((opt, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
            <input type="radio" name="rtype" defaultChecked={i === 0} style={{ accentColor: '#fff' }} />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{opt}</span>
          </label>
        ))}
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Metronome</span>
        <button onClick={() => setMetronome(m => !m)} style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: metronome ? '#fff' : 'rgba(255,255,255,0.12)',
          position: 'relative', transition: 'background 0.2s',
        }}>
          <motion.div animate={{ x: metronome ? 20 : 2 }} style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: metronome ? '#000' : 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      <button
        onClick={() => { setCountdown(3); setPhase('countdown') }}
        style={{
          width: '100%', padding: '20px', marginTop: 16,
          background: 'transparent',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 6, color: '#EF4444', fontSize: 15, fontWeight: 500,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          letterSpacing: '0.02em',
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
        Start Recording
      </button>
    </div>
  )
}
