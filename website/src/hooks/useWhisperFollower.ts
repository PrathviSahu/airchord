// ── useWhisperFollower ────────────────────────────────────────────────────────
//
// Replaces the browser SpeechRecognition (Web Speech API) voice follower with an
// on-device Whisper transcription pipeline (Xenova/whisper-tiny via
// @xenova/transformers). It transcribes the mic in real time, gated by a light
// energy-based VAD, and aligns the recognized words to the lyric script to
// advance / correct the current line.
//
// Why Whisper over Web Speech API:
//   - Runs locally (after first model download) — no Google dependency, offline.
//   - Multilingual (pass `language`, e.g. 'hindi' for Bollywood tracks).
//   - Deterministic, inspectable word matching against the known lyrics.
//
// Honest caveat: Whisper is trained on *speech*, not *singing* — on sung vocals
// accuracy is limited. This is therefore best used as a drift-corrector on top of
// the accurate lrclib timed lyrics, not as a primary singer tracker.

import { useEffect, useRef, useState, useCallback } from 'react'
import { pipeline, env } from '@xenova/transformers'
import { resample, alignRecognizedText } from './lyricsAlign'

// Never look for models on disk — always fetch from the Hugging Face CDN.
env.allowLocalModels = false

// whisper-tiny is multilingual (~75MB q8). For English-only you could swap to
// 'Xenova/whisper-tiny.en' to save bandwidth.
const MODEL_ID = 'Xenova/whisper-tiny'

// Module-level singleton so re-enabling the follower (pause/resume) reuses the
// already-downloaded model instead of re-fetching.
let transcriberPromise: Promise<any> | null = null
let transcriberInstance: any = null

export type WhisperStatus = 'idle' | 'loading' | 'ready' | 'unavailable'

interface UseWhisperFollowerArgs {
  /** Whether the follower should be actively listening. */
  enabled: boolean
  /** Returns the live mic MediaStream (must contain an audio track). */
  getStream: () => MediaStream | null
  /** Whisper language hint, e.g. 'english' | 'hindi'. */
  language?: string
  /** Current line index (read live, to avoid re-subscribing). */
  getCurrentLine: () => number
  /** Full lyric lines (read live). */
  getLyrics: () => { text: string }[]
  /** Advance the highlighted line to at least `lineIndex`. */
  onAdvance: (lineIndex: number) => void
  /** Surface the latest recognized text (for the UI). */
  onTranscript?: (text: string) => void
}

export function useWhisperFollower(args: UseWhisperFollowerArgs) {
  const { enabled, getStream, language, getCurrentLine, getLyrics, onAdvance, onTranscript } = args
  const [status, setStatus] = useState<WhisperStatus>('idle')
  const [progress, setProgress] = useState(0)

  // Keep the latest callbacks/values in refs so the audio graph doesn't need to
  // be rebuilt when they change.
  const cbRef = useRef({ getCurrentLine, getLyrics, onAdvance, onTranscript, language })
  cbRef.current = { getCurrentLine, getLyrics, onAdvance, onTranscript, language }

  const loadModel = useCallback(() => {
    if (transcriberPromise) return transcriberPromise
    setStatus('loading')
    setProgress(0)
    transcriberPromise = pipeline('automatic-speech-recognition', MODEL_ID, {
      device: 'webgpu',
      dtype: 'q8',
      progress_callback: (p: any) => {
        if (p?.status === 'progress' && typeof p.progress === 'number') {
          setProgress(Math.round(p.progress))
        }
      },
    } as any)
      .then((t: any) => {
        transcriberInstance = t
        return t
      })
      .catch((err: unknown) => {
        console.error('[Whisper] model load failed:', err)
        transcriberPromise = null
        setStatus('unavailable')
        throw err
      })
    return transcriberPromise
  }, [])

  useEffect(() => {
    if (!enabled) {
      setStatus(transcriberInstance ? 'idle' : 'idle')
      return
    }

    let cancelled = false
    let audioCtx: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let processor: ScriptProcessorNode | null = null
    let gain: GainNode | null = null
    let busy = false

    // VAD + segment buffering state
    const speechThresh = 0.012 // RMS energy floor for "is speaking"
    const hangoverSec = 0.45
    let speaking = false
    let silenceSamples = 0
    let segChunks: Float32Array[] = []

    const finalizeSegment = async (sampleRate: number) => {
      if (busy) { segChunks = []; return }
      const total = segChunks.reduce((n, c) => n + c.length, 0)
      if (total < sampleRate * 0.3) { segChunks = []; return } // ignore tiny blips
      const raw = new Float32Array(total)
      let off = 0
      for (const c of segChunks) { raw.set(c, off); off += c.length }
      segChunks = []
      const audio = resample(raw, sampleRate, 16000)
      busy = true
      try {
        const result = await transcriberInstance(audio, {
          language: cbRef.current.language ?? 'english',
          task: 'transcribe',
          return_timestamps: false,
        })
        const text: string = result?.text ?? ''
        if (cbRef.current.onTranscript) cbRef.current.onTranscript(text)
        const target = alignRecognizedText(text, cbRef.current.getCurrentLine(), cbRef.current.getLyrics())
        if (target != null) cbRef.current.onAdvance(target)
      } catch (err) {
        console.error('[Whisper] transcription failed:', err)
      } finally {
        busy = false
      }
    }

    const start = async () => {
      const stream = getStream()
      if (!stream || stream.getAudioTracks().length === 0) {
        setStatus('unavailable')
        return
      }
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
        if (audioCtx.state === 'suspended') await audioCtx.resume()
        const rate = audioCtx.sampleRate

        source = audioCtx.createMediaStreamSource(stream)
        processor = audioCtx.createScriptProcessor(4096, 1, 1)
        gain = audioCtx.createGain()
        gain.gain.value = 0 // keep script node pulling audio without echoing mic to speakers

        processor.onaudioprocess = (e: AudioProcessingEvent) => {
          const input = e.inputBuffer.getChannelData(0)
          // copy because the buffer is reused by the node
          const frame = Float32Array.from(input)
          let sumSq = 0
          for (let i = 0; i < frame.length; i++) sumSq += frame[i] * frame[i]
          const rms = Math.sqrt(sumSq / frame.length)

          if (rms > speechThresh) {
            speaking = true
            silenceSamples = 0
            segChunks.push(frame)
          } else if (speaking) {
            segChunks.push(frame)
            silenceSamples += frame.length
            if (silenceSamples / rate >= hangoverSec) {
              speaking = false
              silenceSamples = 0
              void finalizeSegment(rate)
            }
          }
        }

        source.connect(processor)
        processor.connect(gain)
        gain.connect(audioCtx.destination)

        try {
          await loadModel()
          if (!cancelled) setStatus('ready')
        } catch {
          // loadModel already set 'unavailable'
        }
      } catch (err) {
        console.error('[Whisper] audio init failed:', err)
        setStatus('unavailable')
      }
    }

    void start()

    return () => {
      cancelled = true
      try { processor?.disconnect() } catch {}
      try { source?.disconnect() } catch {}
      try { gain?.disconnect() } catch {}
      try { audioCtx?.close() } catch {}
    }
  }, [enabled, getStream, loadModel])

  return { status, progress }
}
