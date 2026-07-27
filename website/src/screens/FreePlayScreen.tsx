import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings, Play, Pause, Square } from 'lucide-react'
import { playStrum, playPluckNote } from '../utils/guitarSound'

const CHORDS = [
  { name: 'Em', gesture: '✊', fingers: 'Fist', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
  { name: 'Am', gesture: '☝️', fingers: '1 finger', notes: ['A2', 'E3', 'A3', 'C4', 'E4'] },
  { name: 'G',  gesture: '✌️', fingers: '2 fingers', notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'] },
  { name: 'C',  gesture: '🤟', fingers: '3 fingers', notes: ['C3', 'E3', 'G3', 'C4', 'E4'] },
  { name: 'D',  gesture: '🖐️', fingers: '4 fingers', notes: ['D3', 'A3', 'D4', 'F#4'] },
  { name: 'F',  gesture: '✋', fingers: 'Open palm', notes: ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'] },
]

const PROFILES = ['Classic', 'Worship', 'Bollywood', 'Blues']
const PATTERNS  = ['Folk', 'Rock', 'Basic', 'Waltz', 'Fingerpick']

const TIMELINE = ['G', 'D', 'Em', 'C', 'G', 'D', 'Am', 'F']

interface Props { onBack: () => void }

export default function FreePlayScreen({ onBack }: Props) {
  const [active, setActive] = useState<typeof CHORDS[0] | null>(null)
  const [playing, setPlaying] = useState(false)
  const [tempo, setTempo] = useState(100)
  const [capo, setCapo] = useState(0)
  const [profile, setProfile] = useState(0)
  const [pattern, setPattern] = useState('Folk')
  const [recording, setRecording] = useState(false)
  const [beat, setBeat] = useState(0)
  const [waveData, setWaveData] = useState<number[]>(Array(28).fill(0.1))
  const [camActive, setCamActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    async function initCam() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        stream = mediaStream
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {})
          }
        }
        setCamActive(true)
      } catch (err) {
        console.warn('FreePlay camera error:', err)
        setCamActive(false)
      }
    }
    initCam()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleChordSelect = (chord: typeof CHORDS[0]) => {
    setActive(chord)
    playStrum(chord.notes, 0.16)
  }

  useEffect(() => {
    if (!playing) { setWaveData(Array(28).fill(0.1)); return }
    const iv = setInterval(() => {
      setWaveData(Array(28).fill(0).map(() => 0.15 + Math.random() * 0.85))
      setBeat(b => {
        const nextB = (b + 1) % TIMELINE.length
        const currentChordName = TIMELINE[nextB]
        const matchedChord = CHORDS.find(c => c.name === currentChordName)
        if (matchedChord) {
          setActive(matchedChord)
          playStrum(matchedChord.notes, 0.14)
        }
        return nextB
      })
    }, (60 / tempo) * 1000 * 1.2)
    return () => clearInterval(iv)
  }, [playing, tempo])

  return (
    <div className="screen-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 20px 16px' }}>
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em' }}>Free Play</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>Show a gesture to play</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setRecording(r => !r)}
            className="icon-btn"
            style={{
              borderColor: recording ? 'rgba(239,68,68,0.5)' : undefined,
              gap: 6,
              width: 'auto',
              padding: '0 12px',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: recording ? '#EF4444' : 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 11, color: recording ? '#EF4444' : 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
              {recording ? 'REC' : 'REC'}
            </span>
          </button>
          <button className="icon-btn"><Settings size={15} style={{ color: 'rgba(255,255,255,0.4)' }} /></button>
        </div>
      </div>

      {/* Camera view */}
      <div style={{ margin: '0 20px', position: 'relative' }}>
        <div style={{
          height: '32vh',
          background: '#080808',
          border: `1px solid ${recording ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.3s',
        }}>
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              opacity: camActive ? 0.65 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />

          {/* Corner brackets */}
          {[{ top: 12, left: 12 }, { top: 12, right: 12 }, { bottom: 12, left: 12 }, { bottom: 12, right: 12 }].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 16, height: 16,
              borderTop: i < 2 ? '1px solid rgba(255,255,255,0.25)' : undefined,
              borderBottom: i >= 2 ? '1px solid rgba(255,255,255,0.25)' : undefined,
              borderLeft: i === 0 || i === 2 ? '1px solid rgba(255,255,255,0.25)' : undefined,
              borderRight: i === 1 || i === 3 ? '1px solid rgba(255,255,255,0.25)' : undefined,
              ...pos,
            }} />
          ))}

          {/* Hand prompt */}
          {!active && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.4 }}>🤚</div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Camera detecting</p>
            </div>
          )}

          {/* Active chord display */}
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.18 }}
                style={{ textAlign: 'center', position: 'absolute' }}
              >
                <div style={{ fontSize: 36, marginBottom: 6 }}>{active.gesture}</div>
                <div style={{ fontSize: 72, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff' }}>
                  {active.name}
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {active.fingers}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waveform bottom strip */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'flex-end', height: 32, padding: '0 12px 6px', gap: 2 }}>
            {waveData.map((v, i) => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.2)', borderRadius: 1, height: `${v * 100}%`, transition: 'height 0.1s ease' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Beat timeline */}
      <div style={{ margin: '12px 20px 0', padding: '16px 16px', background: '#080808', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {TIMELINE.map((chord, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: 44, height: 34,
                borderRadius: 4,
                border: `1px solid ${i === beat && playing ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                background: i === beat && playing ? 'rgba(255,255,255,0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: i === beat && playing ? 600 : 300,
                color: i === beat && playing ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.15s',
              }}
            >
              {chord}
            </div>
          ))}
        </div>
      </div>

      {/* Chord pad */}
      <div style={{ margin: '12px 20px 0', padding: '12px', background: '#080808', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {CHORDS.map(chord => (
            <button
              key={chord.name}
              onMouseEnter={() => playPluckNote(chord.notes[0], 0.1)}
              onClick={() => handleChordSelect(chord)}
              style={{
                padding: '10px 4px',
                borderRadius: 4,
                border: `1px solid ${active?.name === chord.name ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                background: active?.name === chord.name ? 'rgba(255,255,255,0.07)' : 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>{chord.gesture}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: active?.name === chord.name ? '#fff' : 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
                {chord.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ margin: '12px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: '16px', background: '#080808', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tempo</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{tempo} BPM</span>
          </div>
          <input type="range" min={40} max={220} value={tempo} onChange={e => setTempo(+e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ padding: '16px', background: '#080808', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Capo</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setCapo(c => Math.max(0, c - 1))} style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>−</button>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#fff', width: 16, textAlign: 'center' }}>{capo}</span>
              <button onClick={() => setCapo(c => Math.min(12, c + 1))} style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>+</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Folk', 'Rock', 'Blues'].map(p => (
              <button key={p} onClick={() => setPattern(p)} style={{
                flex: 1, padding: '6px 0', borderRadius: 3, fontSize: 10, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                border: `1px solid ${pattern === p ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                background: pattern === p ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: pattern === p ? '#fff' : 'rgba(255,255,255,0.3)',
                letterSpacing: '0.04em',
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        marginTop: 'auto',
        padding: '16px 20px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Profile pills */}
        <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto' }}>
          {PROFILES.map((p, i) => (
            <button key={p} onClick={() => setProfile(i)} style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 3, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
              border: `1px solid ${profile === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: profile === i ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: profile === i ? '#fff' : 'rgba(255,255,255,0.3)',
              fontWeight: profile === i ? 500 : 400,
            }}>{p}</button>
          ))}
        </div>

        {/* Play button */}
        <button
          onClick={() => setPlaying(p => !p)}
          style={{
            width: 48, height: 48, borderRadius: 6,
            background: playing ? '#fff' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${playing ? '#fff' : 'rgba(255,255,255,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          {playing
            ? <Pause size={18} style={{ color: '#000' }} fill="#000" />
            : <Play size={18} style={{ color: '#fff' }} fill="#fff" />}
        </button>
      </div>
    </div>
  )
}
