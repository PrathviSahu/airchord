/**
 * AirChord Audio Engine
 * Proper Karplus-Strong synthesis for realistic guitar sound
 */

// Guitar note frequencies (standard tuning E2-E4)
const NOTE_FREQ: Record<string, number> = {
  'E2': 82.41,  'F2': 87.31,  'G2': 98.00,  'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25,
};

// Standard open chord voicings (6 strings low→high)
const CHORD_VOICINGS: Record<string, (string | null)[]> = {
  'Em': ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
  'Am': ['E2', 'A2', 'E3', 'A3', 'C4', 'E4'],
  'G':  ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
  'C':  ['C3', 'E3', 'G3', 'C4', 'E4', null],   // 5 strings
  'D':  [null, 'D3', 'A3', 'D4', 'F#4', null],   // 4 strings
  'F':  ['F2', 'C3', 'F3', 'A3', 'C4', 'F4'],
  'E':  ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  'A':  ['A2', 'E3', 'A3', 'C#4', 'E4', null],   // 5 strings
  'Dm': [null, 'D3', 'A3', 'D4', 'F4', null],     // 4 strings
  'B7': ['B2', 'D#3', 'A3', 'D4', 'F#4', null],   // 5 strings
  'G7': ['G2', 'B2', 'D3', 'F3', 'B3', 'G4'],
  'C7': ['C3', 'E3', 'G3', 'Bb3', 'C4', null],    // 5 strings
};

// Karplus-Strong: excite a delay line with noise, then filter
function karplusStrong(
  ctx: AudioContext,
  freq: number,
  duration: number,
  bodyGain: GainNode
) {
  const sampleRate = ctx.sampleRate;
  const period = Math.round(sampleRate / freq);
  const numSamples = Math.round(sampleRate * duration);

  // Create buffer with noise burst (excitation)
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Fill with noise burst (first period)
  for (let i = 0; i < period; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  // Karplus-Strong: each sample = average of two previous in delay line
  for (let i = period; i < numSamples; i++) {
    data[i] = (data[i - period] + data[i - period + 1]) * 0.5 * 0.996;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Envelope: quick attack, long decay
  const envelope = ctx.createGain();
  const now = ctx.currentTime;
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(0.35, now + 0.003); // 3ms attack
  envelope.gain.exponentialRampToValueAtTime(0.15, now + 0.1); // initial decay
  envelope.gain.exponentialRampToValueAtTime(0.001, now + duration); // long tail

  // Warmth filter
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(freq * 6, 8000);
  filter.Q.value = 0.7;

  // Body resonance (subtle)
  const bodyResonance = ctx.createBiquadFilter();
  bodyResonance.type = 'peaking';
  bodyResonance.frequency.value = 200;
  bodyResonance.Q.value = 2;
  bodyResonance.gain.value = 3;

  source.connect(filter);
  filter.connect(bodyResonance);
  bodyResonance.connect(envelope);
  envelope.connect(bodyGain);

  source.start(now);
  source.stop(now + duration);

  return source;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentChord: string = '';
  private activeSources: AudioBufferSourceNode[] = [];

  async init() {
    this.ctx = new AudioContext({ latencyHint: 'interactive' });
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.ctx.destination);

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  playChord(chordName: string, velocity: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    if (chordName === this.currentChord) return;

    this.stopCurrentChord();
    const voicing = CHORD_VOICINGS[chordName];
    if (!voicing) return;

    this.currentChord = chordName;

    voicing.forEach((noteName, stringIndex) => {
      if (!noteName) return; // muted string

      const freq = NOTE_FREQ[noteName];
      if (!freq) return;

      const duration = 2.5 - (stringIndex * 0.1); // lower strings ring longer

      // Per-string gain (lower strings slightly louder)
      const stringGain = this.ctx!.createGain();
      const baseVelocity = (0.6 + (stringIndex * 0.05)) * velocity;
      stringGain.gain.value = baseVelocity;

      const source = karplusStrong(this.ctx!, freq, duration, stringGain);
      stringGain.connect(this.masterGain!);

      this.activeSources.push(source);
    });
  }

  stopCurrentChord() {
    const now = this.ctx?.currentTime ?? 0;
    this.activeSources.forEach(src => {
      try { src.stop(now + 0.05); } catch {}
    });
    this.activeSources = [];
  }

  setVolume(vol: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, vol));
    }
  }

  destroy() {
    this.stopCurrentChord();
    this.ctx?.close();
  }
}
