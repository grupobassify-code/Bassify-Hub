// Bassify Hub Audio System & Soundtrack Engine
// Spotify-style Music Player & Playlist Engine + Ambient Audio
// Official Background Music: "The Calculated Fall" (Cyberpunk / PlayStation OST)

export interface AudioSystemState {
  isPlaying: boolean;
  volume: number;
  sfxEnabled: boolean;
  currentTrackTitle: string;
  artist: string;
  bpm: number;
  mode: 'file' | 'synth';
  currentTime: number;
  duration: number;
  audioSrc: string;
  coverUrl: string;
  albumTitle: string;
  songId?: string;
  hasPlaylist: boolean;
  playlistCount: number;
  playlistIndex: number;
}

export interface PlayableTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  albumId?: string;
  albumTitle?: string;
  duration?: number;
}

type SlapType = 'slap' | 'pop' | 'thumb' | 'ghost';

export interface BassNote {
  note: string;
  time: number;
  duration: number;
  type: SlapType;
  velocity?: number;
}

export interface MusicGroove {
  title: string;
  key: string;
  bpm: number;
  description: string;
  chords: Array<{ name: string; notes: string[]; time: number; duration: number }>;
  bassline: BassNote[];
}

const NOTE_FREQS: Record<string, number> = {
  'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
  'C2': 65.41, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'Ab2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'Db3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'C5': 523.25,
};

export const getFreq = (note: string): number => {
  return NOTE_FREQS[note] || 73.42;
};

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
    { note: 'D2', time: 0.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'D2', time: 0.75, duration: 0.25, type: 'ghost', velocity: 0.4 },
    { note: 'D3', time: 1.0, duration: 0.5, type: 'pop', velocity: 0.8 },
    { note: 'C3', time: 1.75, duration: 0.5, type: 'pop', velocity: 0.7 },
    { note: 'D2', time: 2.5, duration: 0.5, type: 'slap', velocity: 0.8 },
    { note: 'F2', time: 3.25, duration: 0.35, type: 'slap', velocity: 0.7 },
    { note: 'G2', time: 3.65, duration: 0.35, type: 'slap', velocity: 0.75 },
    { note: 'Bb1', time: 4.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'Bb2', time: 4.75, duration: 0.5, type: 'pop', velocity: 0.85 },
    { note: 'A2', time: 5.5, duration: 0.4, type: 'pop', velocity: 0.65 },
    { note: 'Bb1', time: 6.25, duration: 0.5, type: 'slap', velocity: 0.8 },
    { note: 'D2', time: 7.0, duration: 0.4, type: 'slap', velocity: 0.7 },
    { note: 'F2', time: 7.5, duration: 0.5, type: 'pop', velocity: 0.75 },
    { note: 'G1', time: 8.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'G2', time: 8.75, duration: 0.5, type: 'pop', velocity: 0.85 },
    { note: 'F2', time: 9.5, duration: 0.4, type: 'pop', velocity: 0.6 },
    { note: 'G1', time: 10.25, duration: 0.5, type: 'slap', velocity: 0.75 },
    { note: 'Bb2', time: 11.0, duration: 0.4, type: 'pop', velocity: 0.8 },
    { note: 'C3', time: 11.5, duration: 0.5, type: 'pop', velocity: 0.85 },
    { note: 'A1', time: 12.0, duration: 0.75, type: 'slap', velocity: 0.9 },
    { note: 'A2', time: 12.75, duration: 0.5, type: 'pop', velocity: 0.8 },
    { note: 'G2', time: 13.5, duration: 0.4, type: 'pop', velocity: 0.65 },
    { note: 'A1', time: 14.25, duration: 0.4, type: 'slap', velocity: 0.75 },
    { note: 'C3', time: 14.75, duration: 0.4, type: 'pop', velocity: 0.75 },
    { note: 'C#3', time: 15.25, duration: 0.75, type: 'pop', velocity: 0.8 },
  ],
};

export const OFFICIAL_BACKGROUND_TRACK: PlayableTrack = {
  id: 'song_the_calculated_fall',
  title: 'The Calculated Fall',
  artist: 'Bassify Sound Studio',
  audioUrl: '/assets/aistudio/The_Calculated_Fall_2c310fa9.mp3',
  coverUrl: '/assets/images/ps_game_scifi_odyssey_1792032420390.jpg',
  albumTitle: 'Bassify Official Soundtrack Vol. 1',
  duration: 182,
};

class AudioSystem {
  private ctx: AudioContext | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  private isMusicPlaying = false;
  private musicVolume = 0.38;
  private sfxVolume = 0.25;
  private sfxEnabled = true;
  private mode: 'file' | 'synth' = 'file';
  
  // Track metadata
  private currentTrackTitle = OFFICIAL_BACKGROUND_TRACK.title;
  private currentArtist = OFFICIAL_BACKGROUND_TRACK.artist;
  private audioSrc = OFFICIAL_BACKGROUND_TRACK.audioUrl;
  private currentCoverUrl = OFFICIAL_BACKGROUND_TRACK.coverUrl;
  private currentAlbumTitle = OFFICIAL_BACKGROUND_TRACK.albumTitle || 'Banda Sonora Oficial';
  private currentSongId: string = OFFICIAL_BACKGROUND_TRACK.id;
  
  // Playlist / Queue (Spotify-style)
  private playlist: PlayableTrack[] = [OFFICIAL_BACKGROUND_TRACK];
  private playlistIndex = 0;
  
  private currentTime = 0;
  private duration = OFFICIAL_BACKGROUND_TRACK.duration || 182;
  private currentGroove: MusicGroove = DEFAULT_SLAP_CHILL_GROOVE;
  private loopTimer: number | null = null;
  private nextLoopTime = 0;
  private subscribers: Array<(state: AudioSystemState) => void> = [];
  private userInteracted = false;
  private autoplayEnabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('bassify_music_volume');
      if (savedVolume !== null) {
        this.musicVolume = parseFloat(savedVolume) || 0.38;
      }
      const savedSfx = localStorage.getItem('bassify_sfx_enabled');
      if (savedSfx !== null) {
        this.sfxEnabled = savedSfx === 'true';
      }
      this.autoplayEnabled = true;

      // 1. Immediately start playing on script load
      this.startMusic().catch(() => {});
      setTimeout(() => {
        this.startMusic().catch(() => {});
      }, 50);
      setTimeout(() => {
        this.startMusic().catch(() => {});
      }, 300);

      // 2. Also start on document ready
      if (document.readyState === 'complete') {
        this.startMusic().catch(() => {});
      } else {
        window.addEventListener('load', () => {
          this.startMusic().catch(() => {});
        }, { once: true });
        document.addEventListener('DOMContentLoaded', () => {
          this.startMusic().catch(() => {});
        }, { once: true });
      }

      // 3. Global gesture unlock
      const onFirstInteraction = () => {
        this.userInteracted = true;
        this.startMusic().catch(() => {});
        ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown', 'wheel'].forEach(evt => {
          window.removeEventListener(evt, onFirstInteraction);
        });
      };

      ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown', 'wheel'].forEach(evt => {
        window.addEventListener(evt, onFirstInteraction, { once: true, passive: true });
      });
    }
  }

  private initAudioElement(): HTMLAudioElement {
    if (!this.bgAudio && typeof window !== 'undefined') {
      this.bgAudio = new Audio(this.audioSrc);
      this.bgAudio.autoplay = true;
      this.bgAudio.volume = this.musicVolume;
      this.bgAudio.preload = 'auto';

      this.bgAudio.addEventListener('timeupdate', () => {
        if (this.bgAudio) {
          this.currentTime = this.bgAudio.currentTime;
          if (this.bgAudio.duration && !isNaN(this.bgAudio.duration)) {
            this.duration = this.bgAudio.duration;
          }
          this.notify();
        }
      });

      this.bgAudio.addEventListener('loadedmetadata', () => {
        if (this.bgAudio && this.bgAudio.duration && !isNaN(this.bgAudio.duration)) {
          this.duration = this.bgAudio.duration;
          this.notify();
        }
      });

      this.bgAudio.addEventListener('play', () => {
        this.isMusicPlaying = true;
        this.notify();
      });

      this.bgAudio.addEventListener('pause', () => {
        if (this.mode === 'file') {
          this.isMusicPlaying = false;
          this.notify();
        }
      });

      // Spotify style: automatically advance to next track in queue when finished
      this.bgAudio.addEventListener('ended', () => {
        if (this.playlist.length > 1 && this.playlistIndex < this.playlist.length - 1) {
          this.nextTrack();
        } else if (this.playlist.length > 1 && this.playlistIndex === this.playlist.length - 1) {
          // Loop back to beginning of playlist
          this.playlistIndex = 0;
          this.loadAndPlayCurrentPlaylistItem();
        } else {
          // Single track loop
          if (this.bgAudio) {
            this.bgAudio.currentTime = 0;
            this.bgAudio.play().catch(() => {});
          }
        }
      });

      this.bgAudio.addEventListener('error', (e) => {
        console.warn('[AudioSystem] Audio error, checking fallback:', e);
        if (this.bgAudio && !this.bgAudio.src.includes('/The_Calculated_Fall_2c310fa9.mp3')) {
          this.bgAudio.src = '/The_Calculated_Fall_2c310fa9.mp3';
          if (this.isMusicPlaying) {
            this.bgAudio.play().catch(() => {});
          }
        }
      });
    }
    return this.bgAudio!;
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
    this.subscribers.forEach(cb => {
      try {
        cb(st);
      } catch (err) {
        console.error('Audio subscriber error:', err);
      }
    });
  }

  public getState(): AudioSystemState {
    return {
      isPlaying: this.isMusicPlaying,
      volume: this.musicVolume,
      sfxEnabled: this.sfxEnabled,
      currentTrackTitle: this.currentTrackTitle,
      artist: this.currentArtist,
      bpm: this.mode === 'file' ? 128 : this.currentGroove.bpm,
      mode: this.mode,
      currentTime: this.currentTime,
      duration: this.duration,
      audioSrc: this.audioSrc,
      coverUrl: this.currentCoverUrl,
      albumTitle: this.currentAlbumTitle,
      songId: this.currentSongId,
      hasPlaylist: this.playlist.length > 0,
      playlistCount: this.playlist.length,
      playlistIndex: this.playlistIndex,
    };
  }

  // ==========================================
  // PLAYBACK & PLAYLIST CONTROLS (SPOTIFY STYLE)
  // ==========================================

  public async startMusic() {
    this.autoplayEnabled = true;
    try {
      localStorage.setItem('bassify_music_autoplay', 'true');
    } catch {}

    if (this.mode === 'file') {
      try {
        const audioEl = this.initAudioElement();
        audioEl.volume = this.musicVolume;
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        this.isMusicPlaying = true;
        this.notify();
      } catch (err) {
        this.isMusicPlaying = false;
        this.notify();
      }
    } else {
      try {
        const ctx = this.initContext();
        if (this.isMusicPlaying) return;
        this.isMusicPlaying = true;
        this.notify();
        const startTime = ctx.currentTime + 0.05;
        this.scheduleCycle(startTime);
      } catch (e) {
        this.isMusicPlaying = false;
        this.notify();
      }
    }
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    this.autoplayEnabled = false;
    try {
      localStorage.setItem('bassify_music_autoplay', 'false');
    } catch {}

    if (this.bgAudio) {
      this.bgAudio.pause();
    }
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
      this.startMusic().catch(() => {});
    }
  }

  public seek(seconds: number) {
    if (this.bgAudio && this.mode === 'file') {
      const target = Math.max(0, Math.min(this.duration || 182, seconds));
      this.bgAudio.currentTime = target;
      this.currentTime = target;
      this.notify();
    }
  }

  public restartMusic() {
    if (this.bgAudio && this.mode === 'file') {
      this.bgAudio.currentTime = 0;
      this.currentTime = 0;
      if (!this.isMusicPlaying) {
        this.startMusic().catch(() => {});
      }
      this.notify();
    }
  }

  /**
   * Play any specific song directly
   */
  public playSong(track: PlayableTrack, surroundingPlaylist?: PlayableTrack[]) {
    this.stopMusic();
    this.mode = 'file';
    this.currentSongId = track.id;
    this.currentTrackTitle = track.title;
    this.currentArtist = track.artist;
    this.audioSrc = track.audioUrl || OFFICIAL_BACKGROUND_TRACK.audioUrl;
    this.currentCoverUrl = track.coverUrl || OFFICIAL_BACKGROUND_TRACK.coverUrl;
    this.currentAlbumTitle = track.albumTitle || 'Sencillo';
    this.currentTime = 0;
    this.duration = track.duration || 180;

    if (surroundingPlaylist && surroundingPlaylist.length > 0) {
      this.playlist = surroundingPlaylist;
      const idx = surroundingPlaylist.findIndex(t => t.id === track.id);
      this.playlistIndex = idx !== -1 ? idx : 0;
    } else {
      this.playlist = [track];
      this.playlistIndex = 0;
    }

    const audioEl = this.initAudioElement();
    audioEl.src = this.audioSrc;
    audioEl.currentTime = 0;
    audioEl.load();

    this.startMusic().catch(() => {});
  }

  /**
   * Play an entire Album from a given index
   */
  public playAlbum(
    album: { id: string; title: string; artist: string; coverUrl: string },
    songs: PlayableTrack[],
    startIndex = 0
  ) {
    if (!songs || songs.length === 0) return;
    const validIndex = Math.max(0, Math.min(songs.length - 1, startIndex));
    const targetSong = songs[validIndex];
    this.playSong(
      {
        ...targetSong,
        albumTitle: album.title,
      },
      songs
    );
  }

  /**
   * Skip to next track in playlist
   */
  public nextTrack() {
    if (this.playlist.length === 0) return;
    const nextIdx = (this.playlistIndex + 1) % this.playlist.length;
    this.playlistIndex = nextIdx;
    this.loadAndPlayCurrentPlaylistItem();
  }

  /**
   * Go back to previous track in playlist (or restart if >3s into song)
   */
  public prevTrack() {
    if (this.currentTime > 3) {
      this.seek(0);
      return;
    }
    if (this.playlist.length === 0) return;
    const prevIdx = this.playlistIndex > 0 ? this.playlistIndex - 1 : this.playlist.length - 1;
    this.playlistIndex = prevIdx;
    this.loadAndPlayCurrentPlaylistItem();
  }

  private loadAndPlayCurrentPlaylistItem() {
    const item = this.playlist[this.playlistIndex];
    if (!item) return;

    this.currentSongId = item.id;
    this.currentTrackTitle = item.title;
    this.currentArtist = item.artist;
    this.audioSrc = item.audioUrl || OFFICIAL_BACKGROUND_TRACK.audioUrl;
    this.currentCoverUrl = item.coverUrl || OFFICIAL_BACKGROUND_TRACK.coverUrl;
    if (item.albumTitle) this.currentAlbumTitle = item.albumTitle;
    this.currentTime = 0;
    this.duration = item.duration || 180;

    const audioEl = this.initAudioElement();
    audioEl.src = this.audioSrc;
    audioEl.currentTime = 0;
    audioEl.load();

    this.startMusic().catch(() => {});
  }

  public setVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('bassify_music_volume', this.musicVolume.toString());
    } catch {}

    if (this.bgAudio) {
      this.bgAudio.volume = this.musicVolume;
    }
    this.notify();
  }

  public toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    try {
      localStorage.setItem('bassify_sfx_enabled', this.sfxEnabled.toString());
    } catch {}
    this.notify();
    if (this.sfxEnabled) {
      this.playButtonClick();
    }
  }

  public setTrackMode(mode: 'file' | 'synth') {
    const wasPlaying = this.isMusicPlaying;
    this.stopMusic();
    this.mode = mode;

    if (mode === 'file') {
      this.audioSrc = OFFICIAL_BACKGROUND_TRACK.audioUrl;
      this.currentTrackTitle = OFFICIAL_BACKGROUND_TRACK.title;
      this.currentArtist = OFFICIAL_BACKGROUND_TRACK.artist;
      this.currentCoverUrl = OFFICIAL_BACKGROUND_TRACK.coverUrl;
      this.currentAlbumTitle = OFFICIAL_BACKGROUND_TRACK.albumTitle || 'Banda Sonora Oficial';
      if (this.bgAudio) {
        this.bgAudio.src = this.audioSrc;
      }
    } else {
      this.currentTrackTitle = this.currentGroove.title;
      this.currentArtist = 'Bajo Slap Procedural';
      this.currentAlbumTitle = 'Groove Lounge';
    }

    this.notify();
    if (wasPlaying) {
      this.startMusic().catch(() => {});
    }
  }

  public setGroove(groove: MusicGroove) {
    this.currentGroove = groove;
    this.mode = 'synth';
    this.currentTrackTitle = groove.title;
    this.currentArtist = 'Bajo Slap Gemini AI';
    this.currentAlbumTitle = 'Compositor AI';
    this.notify();
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic().catch(() => {});
    }
  }

  public getCurrentGroove(): MusicGroove {
    return this.currentGroove;
  }

  // ==========================================
  // DISCRETE SLEEK BUTTON SOUNDS (SFX)
  // ==========================================

  public playButtonClick() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

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
    } catch {}
  }

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
    } catch {}
  }

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
    } catch {}
  }

  public playSuccessSound() {
    if (!this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      [
        { f: 587.33, t: 0.0, d: 0.08 },
        { f: 880.00, t: 0.06, d: 0.12 },
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
    } catch {}
  }

  // ==========================================
  // PROCEDURAL SLAP BASS CHILL SYNTH ENGINE
  // ==========================================

  private playSlapBass(freq: number, startTime: number, duration: number, type: SlapType, velocity = 0.8) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = startTime;

    const bassGain = ctx.createGain();
    const velFactor = Math.min(1.0, Math.max(0.2, velocity));
    bassGain.gain.setValueAtTime(this.musicVolume * 0.9 * velFactor, now);
    bassGain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';

    if (type === 'slap' || type === 'thumb') {
      osc1.frequency.setValueAtTime(freq * 1.8, now);
      osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.025);
    } else if (type === 'pop') {
      osc1.frequency.setValueAtTime(freq * 1.3, now);
      osc1.frequency.exponentialRampToValueAtTime(freq, now + 0.018);
    } else {
      osc1.frequency.setValueAtTime(freq, now);
    }

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq, now);

    const filter = ctx.createBiquadFilter();
    if (type === 'pop') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      filter.Q.value = 4.0;
    } else if (type === 'ghost') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.Q.value = 2.0;
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      filter.Q.value = 2.5;
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.9, now + 0.008);

    const decayTime = type === 'ghost' ? 0.06 : Math.max(0.12, duration * 0.9);
    env.gain.exponentialRampToValueAtTime(0.35, now + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

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

  private scheduleCycle(cycleStartTime: number) {
    if (!this.ctx || !this.isMusicPlaying || this.mode !== 'synth') return;
    const ctx = this.ctx;
    const groove = this.currentGroove;
    const beatDuration = 60 / groove.bpm;
    const cycleDuration = beatDuration * 16;

    groove.chords.forEach(c => {
      const chordStart = cycleStartTime + c.time * beatDuration;
      const chordLen = c.duration * beatDuration;
      if (chordStart >= ctx.currentTime - 0.1) {
        this.playRhodesChord(c.notes, chordStart, chordLen);
      }
    });

    groove.bassline.forEach(b => {
      const noteStart = cycleStartTime + b.time * beatDuration;
      const noteLen = b.duration * beatDuration;
      const freq = getFreq(b.note);
      if (noteStart >= ctx.currentTime - 0.1) {
        this.playSlapBass(freq, noteStart, noteLen, b.type, b.velocity || 0.8);
      }
    });

    for (let beat = 0; beat < 16; beat++) {
      const beatTime = cycleStartTime + beat * beatDuration;
      if (beatTime >= ctx.currentTime - 0.1) {
        if (beat % 4 === 0) {
          this.playChillDrum('kick', beatTime);
        } else if (beat % 4 === 2) {
          this.playChillDrum('kick', beatTime + beatDuration * 0.5);
        }

        if (beat % 4 === 1 || beat % 4 === 3) {
          this.playChillDrum('snare', beatTime);
        }

        this.playChillDrum('hihat', beatTime);
        this.playChillDrum('hihat', beatTime + beatDuration * 0.65);
      }
    }

    this.nextLoopTime = cycleStartTime + cycleDuration;
    const timeUntilNext = (this.nextLoopTime - ctx.currentTime) * 1000 - 150;

    this.loopTimer = window.setTimeout(() => {
      if (this.isMusicPlaying && this.mode === 'synth') {
        this.scheduleCycle(this.nextLoopTime);
      }
    }, Math.max(50, timeUntilNext));
  }
}

export const audio = new AudioSystem();
