import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: on ? '#fff' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
      <motion.div animate={{ x: on ? 22 : 2 }} style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: on ? '#000' : 'rgba(255,255,255,0.45)' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
    </button>
  )
}

const ROW_STYLE = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties

interface Props { onBack: () => void }

export default function SettingsScreen({ onBack }: Props) {
  const [theme, setTheme]         = useState<'dark'|'light'|'auto'>('dark')
  const [profile, setProfile]     = useState('Classic')
  const [volume, setVolume]       = useState(0.75)
  const [sensitivity, setSensitivity] = useState(0.6)
  const [highContrast, setHC]    = useState(false)
  const [reducedMotion, setRM]   = useState(false)
  const [cloudSync, setCS]       = useState(true)
  const [dynBand, setDB]         = useState(true)
  const [hand, setHand]          = useState<'right'|'left'>('right')

  return (
    <div className="screen-bg" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '28px 20px 24px' }}>
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={17} style={{ color: 'rgba(255,255,255,0.6)' }} /></button>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>Settings</h1>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* ── Appearance ── */}
        <Section label="Appearance">
          <div style={ROW_STYLE}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Theme</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['dark', 'light', 'auto'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{ padding: '6px 14px', borderRadius: 3, fontSize: 12, cursor: 'pointer', border: `1px solid ${theme === t ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`, background: theme === t ? 'rgba(255,255,255,0.07)' : 'transparent', color: theme === t ? '#fff' : 'rgba(255,255,255,0.35)', fontWeight: theme === t ? 500 : 400, transition: 'all 0.15s', textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Gesture Profile ── */}
        <Section label="Gesture Profile">
          {['Classic', 'Worship', 'Bollywood', 'Blues'].map((p, i, arr) => (
            <button key={p} onClick={() => setProfile(p)} style={{ ...ROW_STYLE, width: '100%', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: 14, color: profile === p ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: profile === p ? 500 : 400 }}>{p}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: profile === p ? '#fff' : 'transparent', border: `1px solid ${profile === p ? '#fff' : 'rgba(255,255,255,0.2)'}`, transition: 'all 0.2s' }} />
            </button>
          ))}
        </Section>

        {/* ── Audio ── */}
        <Section label="Audio">
          <div style={{ ...ROW_STYLE }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Dynamic Band</span>
            <Toggle on={dynBand} onChange={setDB} />
          </div>
          <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Volume</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(volume * 100)}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVolume(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ ...ROW_STYLE }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Quality</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Standard', 'High', 'Lossless'].map(q => (
                <button key={q} style={{ padding: '6px 12px', borderRadius: 3, fontSize: 12, cursor: 'pointer', border: `1px solid ${q === 'High' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`, background: q === 'High' ? 'rgba(255,255,255,0.07)' : 'transparent', color: q === 'High' ? '#fff' : 'rgba(255,255,255,0.35)', fontWeight: q === 'High' ? 500 : 400 }}>{q}</button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Gestures ── */}
        <Section label="Gestures">
          <div style={{ ...ROW_STYLE }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Dominant hand</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['right', 'left'] as const).map(h => (
                <button key={h} onClick={() => setHand(h)} style={{ padding: '6px 14px', borderRadius: 3, fontSize: 12, cursor: 'pointer', border: `1px solid ${hand === h ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'}`, background: hand === h ? 'rgba(255,255,255,0.07)' : 'transparent', color: hand === h ? '#fff' : 'rgba(255,255,255,0.35)', textTransform: 'capitalize', transition: 'all 0.15s' }}>{h}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Sensitivity</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(sensitivity * 100)}%</span>
            </div>
            <input type="range" min={0.1} max={1} step={0.01} value={sensitivity} onChange={e => setSensitivity(+e.target.value)} style={{ width: '100%' }} />
          </div>
        </Section>

        {/* ── Accessibility ── */}
        <Section label="Accessibility">
          <div style={ROW_STYLE}><span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>High Contrast</span><Toggle on={highContrast} onChange={setHC} /></div>
          <div style={{ ...ROW_STYLE, borderBottom: 'none' }}><span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Reduce Motion</span><Toggle on={reducedMotion} onChange={setRM} /></div>
        </Section>

        {/* ── Account ── */}
        <Section label="Account">
          <div style={ROW_STYLE}><span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Cloud Sync</span><Toggle on={cloudSync} onChange={setCS} /></div>
          <div style={{ padding: '16px 0', borderBottom: 'none' }}>
            <button style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, color: 'rgba(239,68,68,0.7)', fontSize: 13, cursor: 'pointer' }}>Sign Out</button>
          </div>
        </Section>

        {/* ── About ── */}
        <Section label="About">
          {[
            { l: 'Version', v: '1.0.0 Beta' },
            { l: 'Help & FAQ', v: '→' },
            { l: 'Privacy Policy', v: '→' },
          ].map((r, i, arr) => (
            <div key={r.l} style={{ ...ROW_STYLE, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{r.l}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>{r.v}</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '20px 0 8px' }}>{label}</p>
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0 16px' }}>
        {children}
      </div>
    </div>
  )
}
