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
} from 'lucide-react';
import { audio, AudioSystemState, MusicGroove } from '../utils/audioSystem';

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

  const currentGroove: MusicGroove = audio.getCurrentGroove();

  return (
    <div className="relative select-none">
      {/* Compact Header Bar Audio Control */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0a162e] border border-[#1a2d54] hover:border-blue-500/50 rounded-xl px-2 py-1 transition-all shadow-sm">
        {/* Play/Pause Main Button */}
        <button
          onClick={handleTogglePlay}
          onMouseEnter={() => audio.playButtonHover()}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            audioState.isPlaying
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50 animate-pulse'
              : 'bg-[#132345] text-slate-300 hover:text-white hover:bg-[#1a305f]'
          }`}
          title={audioState.isPlaying ? 'Pausar música de inicio' : 'Reproducir bajo slap relajado'}
        >
          {audioState.isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xl:inline text-[11px]">Bajo Slap</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              <span className="hidden xl:inline text-[11px]">Música Slap</span>
            </>
          )}
        </button>

        {/* Animated equalizer bars when active */}
        {audioState.isPlaying && (
          <div className="hidden xs:flex items-end gap-0.5 h-3.5 px-1 py-0.5">
            <span className="w-0.5 bg-cyan-400 rounded-full animate-bounce [animation-duration:600ms]" style={{ height: '70%' }} />
            <span className="w-0.5 bg-blue-400 rounded-full animate-bounce [animation-duration:850ms]" style={{ height: '100%' }} />
            <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:550ms]" style={{ height: '40%' }} />
            <span className="w-0.5 bg-sky-300 rounded-full animate-bounce [animation-duration:750ms]" style={{ height: '90%' }} />
          </div>
        )}

        {/* Gemini AI Variation Trigger Button */}
        <button
          onClick={handleGenerateGeminiGroove}
          onMouseEnter={() => audio.playButtonHover()}
          disabled={isGenerating}
          className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-700/80 hover:to-indigo-700/80 text-blue-200 hover:text-white border border-blue-500/30 transition-all cursor-pointer disabled:opacity-50"
          title="Generar nueva variación de bajo slap con Gemini AI"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          )}
          <span className="hidden sm:inline text-[11px] font-mono">Gemini Slap</span>
        </button>

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
          title="Ajustes de música & volumen"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Flyout Panel for Details & Fine-tuning */}
      {isPanelOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#0a1426] border border-[#1e335f] rounded-2xl shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#182a4d] mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-500/30 text-blue-400">
                <Disc3 className={`w-4 h-4 ${audioState.isPlaying ? 'animate-spin [animation-duration:4s]' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Música de Inicio</h4>
                <p className="text-[10px] text-blue-300 font-mono">Bajo Slap Relajado • Gemini AI</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                audioState.isPlaying ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {audioState.isPlaying ? 'SONANDO' : 'PAUSADO'}
            </span>
          </div>

          {/* Current Track Details */}
          <div className="bg-[#0f1d38] border border-[#1c3360] rounded-xl p-2.5 mb-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
              <span className="truncate">{audioState.currentTrackTitle}</span>
              <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded font-mono shrink-0 ml-1">
                {audioState.bpm} BPM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {currentGroove.description}
            </p>
            <div className="mt-2 pt-1.5 border-t border-[#1a2d54] flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Tonalidad: {currentGroove.key}</span>
              <span>4 Compases (Loop)</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                {audioState.volume > 0 ? (
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                Volumen Música
              </span>
              <span className="font-mono text-slate-400">{Math.round(audioState.volume * 100)}%</span>
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
                <span className="text-[10px] text-slate-400 block">Sonidos sutiles al pulsar y navegar</span>
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

          {/* AI Generator CTA */}
          <button
            onClick={handleGenerateGeminiGroove}
            disabled={isGenerating}
            onMouseEnter={() => audio.playButtonHover()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00439c] to-[#0070d1] hover:brightness-110 active:scale-95 text-white shadow-md shadow-blue-900/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando con Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Generar Nueva Variación con Gemini</span>
              </>
            )}
          </button>

          {/* Status Toast inside Panel */}
          {statusMessage && (
            <div className="mt-2.5 p-2 bg-blue-950/80 border border-blue-500/40 rounded-xl text-[11px] text-cyan-200 flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
