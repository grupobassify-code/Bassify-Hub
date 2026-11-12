import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Music,
  Sliders,
  Bell,
  BellOff,
  Check,
  Disc3,
  Loader2,
  RotateCcw,
  Radio,
  Repeat,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { audio, AudioSystemState, OFFICIAL_BACKGROUND_TRACK } from '../utils/audioSystem';

export const MusicPlayerWidget: React.FC = () => {
  const [audioState, setAudioState] = useState<AudioSystemState>(audio.getState());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = audio.subscribe(state => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = () => {
    audio.playButtonClick();
    audio.toggleMusic();
  };

  const handleToggleSfx = () => {
    audio.playButtonClick();
    audio.toggleSfx();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audio.setVolume(val);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audio.seek(time);
  };

  const handleRestart = () => {
    audio.playButtonClick();
    audio.restartMusic();
  };

  const handleSwitchToOfficialBg = () => {
    audio.playButtonClick();
    audio.setTrackMode('file');
    setStatusMessage('🎵 Música de fondo: "The Calculated Fall" activada.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSwitchToSlapSynth = () => {
    audio.playButtonClick();
    audio.setTrackMode('synth');
    setStatusMessage('🎸 Bajo slap lounge activado.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleGenerateGeminiGroove = async () => {
    audio.playButtonClick();
    setIsGenerating(true);
    setStatusMessage('Componiendo nuevo bajo slap con Gemini AI...');

    try {
      const res = await fetch('/api/gemini/generate-menu-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success && data.groove) {
        audio.setGroove(data.groove);
        audio.playSuccessSound();
        setStatusMessage(
          data.source === 'gemini-3.8-flash'
            ? '✨ ¡Groove slap generado por Gemini AI!'
            : '🎵 Groove de bajo slap relajado cargado.'
        );
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage('No se pudo generar la variación.');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error fetching Gemini groove:', err);
      setStatusMessage('Error al conectar con el compositor Gemini.');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (seconds?: number) => {
    if (seconds === undefined || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isOfficialTrack = audioState.mode === 'file';

  return (
    <div className="relative select-none">
      {/* Compact Header Bar Audio Control */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0a162e] border border-[#1a2d54] hover:border-blue-500/50 rounded-xl px-2 py-1 transition-all shadow-sm">
        {/* Play/Pause Main Button */}
        <button
          onClick={handleTogglePlay}
          onMouseEnter={() => audio.playButtonHover()}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            audioState.isPlaying
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50'
              : 'bg-[#132345] text-slate-300 hover:text-white hover:bg-[#1a305f]'
          }`}
          title={
            audioState.isPlaying
              ? `Pausar música de fondo (${audioState.currentTrackTitle})`
              : `Reproducir música de fondo (${audioState.currentTrackTitle})`
          }
        >
          {audioState.isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xl:inline text-[11px] font-medium tracking-tight">
                {isOfficialTrack ? 'Música: The Calculated Fall' : 'Bajo Slap'}
              </span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span className="hidden xl:inline text-[11px] font-medium tracking-tight">
                {isOfficialTrack ? 'The Calculated Fall' : 'Música'}
              </span>
            </>
          )}
        </button>

        {/* Animated equalizer bars when active */}
        {audioState.isPlaying && (
          <div className="hidden xs:flex items-end gap-0.5 h-3.5 px-1 py-0.5" title="Reproduciendo música de fondo">
            <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce [animation-duration:550ms]" style={{ height: '75%' }} />
            <span className="w-0.5 bg-blue-400 rounded-full animate-bounce [animation-duration:800ms]" style={{ height: '100%' }} />
            <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:650ms]" style={{ height: '50%' }} />
            <span className="w-0.5 bg-sky-300 rounded-full animate-bounce [animation-duration:700ms]" style={{ height: '90%' }} />
          </div>
        )}

        {/* Quick Official Song badge on desktop */}
        <div className="hidden lg:flex items-center gap-1 text-[10px] text-blue-300/80 font-mono bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/40">
          <Music className="w-3 h-3 text-cyan-400" />
          <span className="max-w-[110px] truncate">{audioState.currentTrackTitle}</span>
        </div>

        {/* Sound FX Toggle (Clicks / Hover) */}
        <button
          onClick={handleToggleSfx}
          onMouseEnter={() => audio.playButtonHover()}
          className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
            audioState.sfxEnabled
              ? 'text-cyan-400 hover:text-cyan-300 hover:bg-[#132345]'
              : 'text-slate-500 hover:text-slate-400 hover:bg-[#132345]'
          }`}
          title={audioState.sfxEnabled ? 'Efectos de sonido en botones: Activo' : 'Efectos de sonido: Silenciado'}
        >
          {audioState.sfxEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        </button>

        {/* Open Options Flyout */}
        <button
          onClick={() => {
            audio.playButtonClick();
            setIsPanelOpen(!isPanelOpen);
          }}
          onMouseEnter={() => audio.playButtonHover()}
          className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
            isPanelOpen ? 'bg-[#152a55] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#132345]'
          }`}
          title="Panel de música de fondo y volumen"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Flyout Panel for Details & Fine-tuning */}
      {isPanelOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-[#091428] border border-[#1e3563] rounded-2xl shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#182a4d] mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-950/90 border border-blue-500/40 text-blue-400 shadow-inner">
                <Disc3 className={`w-5 h-5 text-cyan-400 ${audioState.isPlaying ? 'animate-spin [animation-duration:3s]' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase">Música de Fondo</h4>
                <p className="text-[10px] text-cyan-300 font-mono">Banda Sonora Oficial Bassify</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                audioState.isPlaying ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {audioState.isPlaying ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SONANDO
                </>
              ) : (
                'PAUSADO'
              )}
            </span>
          </div>

          {/* Current Track Card */}
          <div className="bg-gradient-to-br from-[#0e1d38] to-[#0a162b] border border-[#1c3360] rounded-xl p-3 mb-3 shadow-md">
            <div className="flex gap-3 items-start mb-2">
              {audioState.coverUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/40 shrink-0 bg-[#070e1c]">
                  <img
                    src={audioState.coverUrl}
                    alt={audioState.currentTrackTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[7px] font-mono text-cyan-300 text-center py-0.2">
                    512×512
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                  <span className="truncate pr-1">{audioState.currentTrackTitle}</span>
                  <span className="text-[9px] bg-blue-900/60 text-cyan-300 px-1.5 py-0.2 rounded font-mono shrink-0">
                    {audioState.hasPlaylist
                      ? `${audioState.playlistIndex + 1}/${audioState.playlistCount}`
                      : isOfficialTrack
                      ? 'OST Oficial'
                      : `${audioState.bpm} BPM`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate">
                  {audioState.artist}
                  {audioState.albumTitle ? ` • ${audioState.albumTitle}` : ''}
                </p>
              </div>
            </div>

            {/* Scrubber / Timeline for audio file */}
            {isOfficialTrack && (
              <div className="space-y-1 pt-1 border-t border-[#192b4f]">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{formatTime(audioState.currentTime)}</span>
                  <div className="flex items-center gap-1 text-cyan-400/80">
                    <Repeat className="w-3 h-3" />
                    <span>{audioState.hasPlaylist ? 'Auto-avance' : 'Bucle Activo'}</span>
                  </div>
                  <span>{formatTime(audioState.duration || OFFICIAL_BACKGROUND_TRACK.duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={audioState.duration || OFFICIAL_BACKGROUND_TRACK.duration}
                  step="0.5"
                  value={audioState.currentTime}
                  onChange={handleSeek}
                  className="w-full accent-cyan-400 bg-[#16274a] h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Quick playback actions */}
            <div className="mt-2.5 pt-2 border-t border-[#172a4e] flex items-center justify-between">
              <div className="flex items-center gap-1">
                {audioState.hasPlaylist && (
                  <button
                    onClick={() => {
                      audio.playButtonClick();
                      audio.prevTrack();
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#152a55] transition-colors cursor-pointer"
                    title="Pista anterior"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleTogglePlay}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    audioState.isPlaying
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                      : 'bg-[#152a55] hover:bg-[#1c366e] text-cyan-200'
                  }`}
                >
                  {audioState.isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      <span>Reproducir</span>
                    </>
                  )}
                </button>

                {audioState.hasPlaylist && (
                  <button
                    onClick={() => {
                      audio.playButtonClick();
                      audio.nextTrack();
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#152a55] transition-colors cursor-pointer"
                    title="Siguiente pista"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isOfficialTrack && !audioState.hasPlaylist && (
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-[#14264b] transition-colors cursor-pointer"
                  title="Reiniciar canción"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reiniciar</span>
                </button>
              )}
            </div>
          </div>

          {/* Volume Control Slider */}
          <div className="space-y-1.5 mb-3 bg-[#0d1a33] p-2.5 rounded-xl border border-[#192f5b]">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                {audioState.volume > 0 ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                Volumen de Música
              </span>
              <span className="font-mono text-cyan-300 font-semibold">{Math.round(audioState.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={audioState.volume}
              onChange={handleVolumeChange}
              className="w-full accent-blue-500 bg-[#16274a] h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Soundtrack Selector */}
          <div className="space-y-1.5 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Seleccionar Pista de Fondo
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleSwitchToOfficialBg}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isOfficialTrack
                    ? 'bg-blue-600/20 border-cyan-400/50 text-white shadow-sm'
                    : 'bg-[#0d1a33] border-[#182e58] text-slate-300 hover:bg-[#132549]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Radio className={`w-3 h-3 ${isOfficialTrack ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-bold truncate">The Calculated Fall</span>
                </div>
                <span className="text-[9px] text-slate-400 block font-mono">Banda Sonora Oficial</span>
              </button>

              <button
                onClick={handleSwitchToSlapSynth}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  !isOfficialTrack
                    ? 'bg-blue-600/20 border-cyan-400/50 text-white shadow-sm'
                    : 'bg-[#0d1a33] border-[#182e58] text-slate-300 hover:bg-[#132549]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Music className={`w-3 h-3 ${!isOfficialTrack ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-bold truncate">Bajo Slap Chill</span>
                </div>
                <span className="text-[9px] text-slate-400 block font-mono">Lounge Synthesizer</span>
              </button>
            </div>
          </div>

          {/* Button Sound FX Setting */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#0d1a33] border border-[#192f5b] mb-3">
            <div className="flex items-center gap-2">
              {audioState.sfxEnabled ? (
                <Bell className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-slate-500" />
              )}
              <div>
                <span className="text-xs font-medium text-slate-200 block">Efectos de Botones</span>
                <span className="text-[10px] text-slate-400 block">Sonidos PlayStation al pulsar y navegar</span>
              </div>
            </div>
            <button
              onClick={handleToggleSfx}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                audioState.sfxEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {audioState.sfxEnabled ? 'ACTIVO' : 'MUDO'}
            </button>
          </div>

          {/* Gemini AI Generator Option */}
          <button
            onClick={handleGenerateGeminiGroove}
            disabled={isGenerating}
            onMouseEnter={() => audio.playButtonHover()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#003882] to-[#0062b8] hover:brightness-110 active:scale-95 text-white shadow-md shadow-blue-900/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                <span>Generando con Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Componer Variación con Gemini AI</span>
              </>
            )}
          </button>

          {/* Status Message */}
          {statusMessage && (
            <div className="mt-2.5 p-2 bg-blue-950/90 border border-blue-500/40 rounded-xl text-[11px] text-cyan-200 flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
