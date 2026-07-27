// ── AI Vocal Strumming Pattern & Rhythm Voice Detector (Web Audio API) ──────
// Uses Time-Domain RMS Onset Detection + Live Pattern Dispatch + Audio Feedback

export interface VocalStrumResult {
  pattern: string[]
  displayPattern: string
  detectedBpm: number
  confidence: number
}

export class StrumVoiceDetector {
  private audioCtx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private isListening = false
  private onsetTimes: number[] = []
  private onsetEnergies: number[] = []
  private animFrameId: number | null = null
  private ambientNoiseFloor = 0.05
  private onResultCallback?: (result: VocalStrumResult) => void
  private onVolumeCallback?: (volume: number) => void

  async startListening(
    onResult: (result: VocalStrumResult) => void,
    onVolume?: (volume: number) => void
  ) {
    if (this.isListening) return
    this.onResultCallback = onResult
    this.onVolumeCallback = onVolume

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      this.stream = stream

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioCtx = new AudioContextClass()
      const source = this.audioCtx.createMediaStreamSource(stream)

      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = 512
      this.analyser.smoothingTimeConstant = 0.2
      source.connect(this.analyser)

      this.isListening = true
      this.onsetTimes = []
      this.onsetEnergies = []
      this.ambientNoiseFloor = 0.05
      this.detectLoop()
    } catch (err) {
      console.error('Microphone access error for voice strum detector:', err)
      throw err
    }
  }

  stopListening(): VocalStrumResult | null {
    this.isListening = false
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }

    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop())
      this.stream = null
    }

    const finalResult = this.analyzeCapturedOnsets()

    if (this.audioCtx) {
      this.audioCtx.close()
      this.audioCtx = null
    }

    return finalResult
  }

  private detectLoop = () => {
    if (!this.isListening || !this.analyser) return

    const bufferLength = this.analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteTimeDomainData(dataArray)

    // Calculate RMS volume level
    let sumSquares = 0
    for (let i = 0; i < bufferLength; i++) {
      const norm = (dataArray[i] - 128) / 128
      sumSquares += norm * norm
    }
    const rms = Math.sqrt(sumSquares / bufferLength)

    // Dynamic background noise tracking
    this.ambientNoiseFloor = this.ambientNoiseFloor * 0.95 + rms * 0.05
    this.onVolumeCallback?.(Math.min(1.0, rms * 4.0))

    const now = performance.now()
    const lastOnset = this.onsetTimes[this.onsetTimes.length - 1] || 0

    // Onset threshold: RMS volume significantly above ambient floor
    const threshold = Math.max(0.08, this.ambientNoiseFloor * 2.5)

    if (rms > threshold && now - lastOnset > 140) {
      this.onsetTimes.push(now)
      this.onsetEnergies.push(rms)
      this.playFeedbackClick()

      // Dispatch live updated pattern
      const liveResult = this.analyzeCapturedOnsets()
      if (liveResult && this.onResultCallback) {
        this.onResultCallback(liveResult)
      }
    }

    this.animFrameId = requestAnimationFrame(this.detectLoop)
  }

  private playFeedbackClick() {
    if (!this.audioCtx) return
    try {
      const osc = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime)
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03)
      osc.connect(gain)
      gain.connect(this.audioCtx.destination)
      osc.start()
      osc.stop(this.audioCtx.currentTime + 0.03)
    } catch {
      // Ignore click audio restriction
    }
  }

  private analyzeCapturedOnsets(): VocalStrumResult | null {
    if (this.onsetTimes.length < 1) {
      return {
        pattern: ['D', 'D', 'U', 'U', 'D', 'U'],
        displayPattern: '↓ ↓ ↑ ↑ ↓ ↑',
        detectedBpm: 100,
        confidence: 0.5,
      }
    }

    if (this.onsetTimes.length === 1) {
      return {
        pattern: ['D'],
        displayPattern: '↓',
        detectedBpm: 100,
        confidence: 0.6,
      }
    }

    // Calculate time intervals between vocal stroke beats
    const intervals: number[] = []
    for (let i = 1; i < this.onsetTimes.length; i++) {
      intervals.push(this.onsetTimes[i] - this.onsetTimes[i - 1])
    }

    const sorted = [...intervals].sort((a, b) => a - b)
    const medianInterval = sorted[Math.floor(sorted.length / 2)] || 300
    const detectedBpm = Math.round(Math.min(180, Math.max(60, 60 / (medianInterval / 1000))))

    // Construct pattern array with pauses '.'
    const pattern: string[] = ['D']

    intervals.forEach((interval, idx) => {
      // Large gap = rest beat '.'
      if (interval > medianInterval * 1.55) {
        pattern.push('.')
      }

      const energy = this.onsetEnergies[idx + 1] || 0.1
      if (energy > 0.22) {
        pattern.push('D') // Strong accent stroke
      } else {
        pattern.push(idx % 2 === 0 ? 'U' : 'D') // Alternating stroke
      }
    })

    const displayPattern = pattern.map(s => (s === 'D' ? '↓' : s === 'U' ? '↑' : s === 'X' ? '✕' : '•')).join(' ')

    return {
      pattern,
      displayPattern,
      detectedBpm,
      confidence: 0.92,
    }
  }

  getIsListening() {
    return this.isListening
  }
}
