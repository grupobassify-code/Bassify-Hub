// Web Audio API Sound Effects & Slap Bass Chill Lounge Engine
// Provides subtle button sounds and an ambient relaxed slap-bass menu groove

type SlapType = 'slap' | 'pop' | 'thumb' | 'ghost';

export interface BassNote {
  note: string; // e.g., 'D2', 'A2', 'C3', 'D3', 'F2', 'G2'
  time: number; // in beats (0 to 16)
  duration: number; // in beats
  type: SlapType;
  velocity?: number; // 0.1 to 1.0
}

export interface MusicGroove {
  title: string;
  key: string;
  bpm: number;
  description: string;
  chords: Array<{ name: string; notes: string[]; time: number; duration: number }>;
  bassline: BassNote[];
}

// Note name to frequency helper
const NOTE_FREQS: Record<string, number> = {
  'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
  'C2': 65.41, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'Ab2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'Db3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'C5': 523.25,
};

export const getFreq = (note: string): number => {
  return NOTE_FREQS[note] || 73.42;
};

// Default high-quality calm & relaxed slap bass groove (82 BPM in D minor)
export const DEFAULT_SLAP_CHILL_GROOVE: MusicGroove = {
  title: 'Bassify Chill Lounge — Slap & Groove',
  key: 'D menor (Chill Funk / Lo-Fi)',
  bpm: 82,
  description: 'Bajo slap suave con toque de pulgar cálido, pops aterciopelados y acordes de piano Rhodes.',
  chords: [
    { name: 'Dm9', notes: ['F3', 'A3', 'C4', 'E4'], time: 0, duration: 4 },
    { name: 'Bbmaj9', notes: ['F3', 'A3', 'D4', 'F4'], time: 4, duration: 4 },
    { name: 'Gm9', notes: ['Bb3', 'D4', 'F4', 'A4'], time: 8, duration: 4 },
    { name: 'A7#9', notes: ['G3', 'C#4', 'E4', 'C4'], time: 12, duration: 4 },
  ],
  bassline: [
    // Bar 1: Dm9 groove (Thumb slaps + octave pops)
    { note: 'D2', time: 0.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'D2', time: 0.75, duration: 0.25, type: 'ghost', velocity: 0.4 },
    { note: 'D3', time: 1.0, duration: 0.5, type: 'pop', velocity: 0.8 },
    { note: 'C3', time: 1.75, duration: 0.5, type: 'pop', velocity: 0.7 },
    { note: 'D2', time: 2.5, duration: 0.5, type: 'slap', velocity: 0.8 },
    { note: 'F2', time: 3.25, duration: 0.35, type: 'slap', velocity: 0.7 },
    { note: 'G2', time: 3.65, duration: 0.35, type: 'slap', velocity: 0.75 },

    // Bar 2: Bbmaj9
    { note: 'Bb1', time: 4.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'Bb2', time: 4.75, duration: 0.5, type: 'pop', velocity: 0.85 },
    { note: 'A2', time: 5.5, duration: 0.4, type: 'pop', velocity: 0.65 },
    { note: 'Bb1', time: 6.25, duration: 0.5, type: 'slap', velocity: 0.8 },
    { note: 'D2', time: 7.0, duration: 0.4, type: 'slap', velocity: 0.7 },
    { note: 'F2', time: 7.5, duration: 0.5, type: 'pop', velocity: 0.75 },

    // Bar 3: Gm9
    { note: 'G1', time: 8.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'G2', time: 8.75, duration: 0.5, type: 'pop', velocity: 0.85 },
    { note: 'F2', time: 9.5, duration: 0.4, type: 'pop', velocity: 0.6 },
    { note: 'G1', time: 10.25, duration: 0.5, type: 'slap', velocity: 0.75 },
    { note: 'Bb2', time: 11.0, duration: 0.4, type: 'pop', velocity: 0.8 },
    { note: 'C3', time: 11.5, duration: 0.5, type: 'pop', velocity: 0.85 },

    // Bar 4: A7alt turn-around
    { note: 'A1', time: 12.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'A2', time: 12.75, duration: 0.5, type: 'pop', velocity: 0.8 },
    { note: 'G2', time: 13.5, duration: 0.4, type: 'pop', velocity: 0.65 },
    { note: 'A1', time: 14.25, duration: 0.4, type: 'slap', velocity: 0.75 },
    { note: 'C3', time: 14.75, duration: 0.4, type: 'pop', velocity: 0.75 },
    { note: 'C#3', time: 15.25, duration: 0.75, type: 'pop', velocity: 0.8 },
  ],
};

class AudioSystem {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicVolume = 0.28;
  private sfxVolume = 0.25;
  private sfxEnabled = true;
  private currentGroove: MusicGroove = DEFAULT_SLAP_CHILL_GROOVE;
  private loopTimer: number | null = null;
  private nextLoopTime = 0;
  private subscribers: Array<(state: AudioSystemState) => void> = [];

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public subscribe(cb: (state: AudioSystemState) => void) {
    this.subscribers.push(cb);
    cb(this.getState());
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    const st = this.getState();
    this.subscribers.forEach(cb => cb(st));
  }

  public getState(): AudioSystemState {
    return {
      isPlaying: this.isMusicPlaying,
      volume: this.musicVolume,
      sfxEnabled: this.sfxEnabled,
      currentTrackTitle: this.currentGroove.title,
      bpm: this.currentGroove.bpm,
    };
  }

  // ==========================================
  // DISCRETE SLEEK BUTTON SOUNDS
  // ==========================================

  /**
   * Subtle, clean PlayStation-style button click pop
   */
  public playButtonClick() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Soft oscillator chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.038);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio not permitted or suspended
    }
  }

  /**
   * Ultra-short subtle hover tick
   */
  public playButtonHover() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.015);

      gain.gain.setValueAtTime(this.sfxVolume * 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
    } catch {
      // Ignore
    }
  }

  /**
   * Tab switch / Navigation tick
   */
  public playNavSound() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.05);

      gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.052);
    } catch {
      // Ignore
    }
  }

  /**
   * Pleasant ascending confirmation chime
   */
  public playSuccessSound() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      [
        { f: 587.33, t: 0.0, d: 0.08 }, // D5
        { f: 880.00, t: 0.06, d: 0.12 }, // A5
      ].forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.d);
      });
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // SLAP BASS CHILL LOUNGE MUSIC SYNTHESIZER
  // ==========================================

  /**
   * Synthesize a Slap Bass Note
   * Slap: punchy thumb attack with pitch drop + sub fundamental
   * Pop: sharp octave snap with high-pass/resonant bite
   */
  private playSlapBass(freq: number, startTime: number, duration: number, type: SlapType, velocity = 0.8) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = startTime;

    // Master bass gain
    const bassGain = ctx.createGain();
    const velFactor = Math.min(1.0, Math.max(0.2, velocity));
    bassGain.gain.setValueAtTime(this.musicVolume * 0.9 * velFactor, now);
    bassGain.connect(ctx.destination);

    // 1. Fundamental Oscillator (Triangle for woody bass warmth)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';

    // Fast pitch envelope for thumb impact slap
    if (type === 'slap' || type === 'thumb') {
      osc1.frequency.setValueAtTime(freq * 1.8, now);
      osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.025);
    } else if (type === 'pop') {
      osc1.frequency.setValueAtTime(freq * 1.3, now);
      osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.018);
    } else {
      osc1.frequency.setValueAtTime(freq, now);
    }

    // 2. Sub-bass sine for punch
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq, now);

    // Filter to shape slap vs pop character
    const filter = ctx.createBiquadFilter();
    if (type === 'pop') {
      // Snappy metallic pluck pop
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      filter.Q.value = 4.0;
    } else if (type === 'ghost') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.Q.value = 2.0;
    } else {
      // Thumb Slap: Warm thump
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      filter.Q.value = 2.5;
    }

    // Amplitude envelope
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.9, now + 0.008);

    const decayTime = type === 'ghost' ? 0.06 : Math.max(0.12, duration * 0.9);
    env.gain.exponentialRampToValueAtTime(0.35, now + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

    // 3. Metallic Snap Click (Noise burst for the fret snap)
    if (type === 'pop' || type === 'slap') {
      const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate);
      const data = clickBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.004));
      }
      const clickSrc = ctx.createBufferSource();
      clickSrc.buffer = clickBuffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'highpass';
      clickFilter.frequency.value = type === 'pop' ? 2400 : 1200;

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(this.musicVolume * (type === 'pop' ? 0.35 : 0.2), now);

      clickSrc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickSrc.start(now);
    }

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(env);
    env.connect(bassGain);

    osc1.start(now);
    osc2.start(now);

    const stopTime = now + decayTime + 0.05;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
  }

  /**
   * Warm Fender Rhodes style chilled electric piano chord
   */
  private playRhodesChord(notes: string[], startTime: number, duration: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = startTime;

    const chordGain = ctx.createGain();
    chordGain.gain.setValueAtTime(this.musicVolume * 0.32, now);
    chordGain.connect(ctx.destination);

    notes.forEach(note => {
      const freq = getFreq(note);
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const env = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle warm 2nd harmonic for Rhodes chime
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + duration * 0.8);

      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.4, now + 0.03);
      env.gain.exponentialRampToValueAtTime(0.18, now + 0.3);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(env);
      env.connect(chordGain);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + duration + 0.05);
      oscHarmonic.stop(now + duration + 0.05);
    });
  }

  /**
   * Soft chill drum hits (lo-fi mellow acoustic drums)
   */
  private playChillDrum(type: 'kick' | 'snare' | 'hihat', startTime: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = startTime;

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      gain.gain.setValueAtTime(this.musicVolume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'snare') {
      // Soft brushed rim/snare
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      oscGain.gain.setValueAtTime(this.musicVolume * 0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);

      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.musicVolume * 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } else if (type === 'hihat') {
      // Delicate closed hat
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7500;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.musicVolume * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    }
  }

  /**
   * Schedules a full 16-beat cycle of the chill slap bass groove
   */
  private scheduleCycle(cycleStartTime: number) {
    if (!this.ctx || !this.isMusicPlaying) return;
    const ctx = this.ctx;
    const groove = this.currentGroove;
    const beatDuration = 60 / groove.bpm; // Seconds per beat (~0.73s at 82 BPM)
    const cycleDuration = beatDuration * 16; // 16 beats per loop (~11.7s)

    // 1. Schedule Chords
    groove.chords.forEach(c => {
      const chordStart = cycleStartTime + c.time * beatDuration;
      const chordLen = c.duration * beatDuration;
      if (chordStart >= ctx.currentTime - 0.1) {
        this.playRhodesChord(c.notes, chordStart, chordLen);
      }
    });

    // 2. Schedule Slap Bassline
    groove.bassline.forEach(b => {
      const noteStart = cycleStartTime + b.time * beatDuration;
      const noteLen = b.duration * beatDuration;
      const freq = getFreq(b.note);
      if (noteStart >= ctx.currentTime - 0.1) {
        this.playSlapBass(freq, noteStart, noteLen, b.type, b.velocity || 0.8);
      }
    });

    // 3. Schedule Relaxed Drum Groove (16 beats)
    for (let beat = 0; beat < 16; beat++) {
      const beatTime = cycleStartTime + beat * beatDuration;
      if (beatTime >= ctx.currentTime - 0.1) {
        // Soft Kick on beats 0, 2.5, 4, 6.5, 8, 10.5, 12, 14.5
        if (beat % 4 === 0) {
          this.playChillDrum('kick', beatTime);
        } else if (beat % 4 === 2) {
          this.playChillDrum('kick', beatTime + beatDuration * 0.5);
        }

        // Soft Snare/Rim on 1, 3 (backbeat)
        if (beat % 4 === 1 || beat % 4 === 3) {
          this.playChillDrum('snare', beatTime);
        }

        // Swung delicate hi-hats
        this.playChillDrum('hihat', beatTime);
        this.playChillDrum('hihat', beatTime + beatDuration * 0.65); // slight jazz swing
      }
    }

    // Schedule next cycle
    this.nextLoopTime = cycleStartTime + cycleDuration;
    const timeUntilNext = (this.nextLoopTime - ctx.currentTime) * 1000 - 150; // Schedule 150ms before

    this.loopTimer = window.setTimeout(() => {
      if (this.isMusicPlaying) {
        this.scheduleCycle(this.nextLoopTime);
      }
    }, Math.max(50, timeUntilNext));
  }

  // ==========================================
  // PLAYBACK CONTROLS
  // ==========================================

  public async startMusic() {
    try {
      const ctx = this.initContext();
      if (this.isMusicPlaying) return;

      this.isMusicPlaying = true;
      this.notify();

      const startTime = ctx.currentTime + 0.05;
      this.scheduleCycle(startTime);
    } catch (e) {
      console.warn('Could not start music:', e);
      this.isMusicPlaying = false;
      this.notify();
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.notify();
  }

  public toggleMusic() {
    if (this.isMusicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public setVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  public toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    this.notify();
    if (this.sfxEnabled) {
      this.playButtonClick();
    }
  }

  public setGroove(groove: MusicGroove) {
    this.currentGroove = groove;
    this.notify();
    if (this.isMusicPlaying) {
      // Restart loop with new groove
      this.stopMusic();
      this.startMusic();
    }
  }

  public getCurrentGroove(): MusicGroove {
    return this.currentGroove;
  }
}

export interface AudioSystemState {
  isPlaying: boolean;
  volume: number;
  sfxEnabled: boolean;
  currentTrackTitle: string;
  bpm: number;
}

// Global Singleton
export const audio = new AudioSystem();
