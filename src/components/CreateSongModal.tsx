import React, { useState, useEffect } from 'react';
import { X, Music, Upload, Image as ImageIcon, Disc, Check, AlertCircle, Play, Pause } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { audio } from '../utils/audioSystem';
import { processAndUploadImage, uploadAudioFile } from '../utils/mediaUpload';
import { SafeImage } from './SafeImage';

const PRESET_SONG_COVERS = [
  { label: 'Sci-Fi Odyssey', url: '/assets/images/ps_game_scifi_odyssey_1792032420390.jpg' },
  { label: 'PlayStation Arena', url: '/assets/images/ps_news_playstation_event_1792032422581.jpg' },
  { label: 'Soundwave Beats', url: '/assets/images/ps_app_soundwave_studio_1792032421478.jpg' },
  { label: 'Cyber Kart Velocity', url: '/assets/images/ps_game_cyber_kart_1792032422740.jpg' },
];

export const CreateSongModal: React.FC = () => {
  const {
    isCreateSongModalOpen,
    setIsCreateSongModalOpen,
    albums,
    addSong,
    isAdmin,
    selectedAlbumForNewSong,
    setSelectedAlbumForNewSong,
  } = useApp();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Bassify Sound Studio');
  const [albumId, setAlbumId] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_SONG_COVERS[0].url);
  const [audioUrl, setAudioUrl] = useState('/assets/aistudio/The_Calculated_Fall_2c310fa9.mp3');
  const [audioFileName, setAudioFileName] = useState('The_Calculated_Fall_2c310fa9.mp3');
  const [duration, setDuration] = useState(182);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewAudioEl, setPreviewAudioEl] = useState<HTMLAudioElement | null>(null);

  // Sync pre-selected album
  useEffect(() => {
    if (selectedAlbumForNewSong) {
      setAlbumId(selectedAlbumForNewSong);
    } else if (albums.length > 0 && !albumId) {
      setAlbumId(albums[0].id);
    }
  }, [selectedAlbumForNewSong, albums]);

  if (!isCreateSongModalOpen) return null;

  const handleSongCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      e.target.value = '';
      return;
    }

    setIsUploadingCover(true);
    setError(null);
    try {
      const { url } = await processAndUploadImage(file, { maxDimension: 512, squareCrop: true });
      setCoverUrl(url);
    } catch (err: any) {
      setError(err?.message || 'No se pudo procesar la carátula de la canción.');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFileName(file.name);
    setError(null);

    // Auto-detect title from filename if not yet filled
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }

    // Detect duration quickly via local objectURL
    const objUrl = URL.createObjectURL(file);
    const tempAudio = new Audio(objUrl);
    tempAudio.addEventListener('loadedmetadata', () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDuration(Math.round(tempAudio.duration));
      }
      URL.revokeObjectURL(objUrl);
    });
    tempAudio.addEventListener('error', () => {
      URL.revokeObjectURL(objUrl);
    });

    setIsUploadingAudio(true);
    try {
      const { url } = await uploadAudioFile(file);
      setAudioUrl(url);
    } catch (err: any) {
      setError(err?.message || 'No se pudo subir el archivo de audio al servidor.');
    } finally {
      setIsUploadingAudio(false);
      e.target.value = '';
    }
  };

  const togglePreview = () => {
    if (previewPlaying && previewAudioEl) {
      previewAudioEl.pause();
      setPreviewPlaying(false);
    } else {
      const el = new Audio(audioUrl);
      el.volume = 0.5;
      el.play().catch(() => {});
      el.addEventListener('ended', () => setPreviewPlaying(false));
      setPreviewAudioEl(el);
      setPreviewPlaying(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdmin) {
      setError('Solo el administrador puede subir canciones.');
      return;
    }

    if (!title.trim()) {
      setError('El título de la canción es obligatorio.');
      return;
    }

    if (!artist.trim()) {
      setError('El nombre del artista es obligatorio.');
      return;
    }

    if (!albumId) {
      setError('Debes especificar a qué álbum pertenecerá esta canción.');
      return;
    }

    if (!audioUrl) {
      setError('Debes cargar o especificar el archivo de audio MP3.');
      return;
    }

    if (!coverUrl) {
      setError('Debes asignar una portada para la canción (512x512 píxeles).');
      return;
    }

    if (previewAudioEl) {
      previewAudioEl.pause();
      setPreviewPlaying(false);
    }

    setIsSubmitting(true);
    audio.playButtonClick();

    try {
      const res = await addSong({
        title: title.trim(),
        artist: artist.trim(),
        albumId,
        coverUrl: coverUrl.trim(),
        audioUrl: audioUrl.trim(),
        duration: duration || 180,
      });

      if (res.success) {
        setTitle('');
        setSelectedAlbumForNewSong(null);
      } else {
        setError(res.error || 'No se pudo guardar la canción en el álbum.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al guardar la canción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#091428] border border-[#1e3868] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#182d54] bg-gradient-to-r from-[#0d1f40] to-[#0a1730]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Crear & Cargar Canción MP3
                <span className="text-[10px] bg-cyan-600/30 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/40 font-normal">
                  ADMIN
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sube tu archivo de música, asigna portada independiente 512x512 y elige el álbum
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              if (previewAudioEl) previewAudioEl.pause();
              setIsCreateSongModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Nombre de la Canción <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. The Calculated Fall"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Artista de la Pista <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Bassify Sound Studio"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                required
                className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* MP3 Audio File Section */}
          <div className="bg-[#0b162b] border border-[#193059] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Music className="w-4 h-4 text-cyan-400" />
                Archivo de Música MP3 <span className="text-cyan-400">*</span>
              </label>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Duración: {formatDuration(duration)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 items-center">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#122347] hover:bg-[#1a3266] border border-[#223f7a] rounded-xl text-xs text-cyan-200 cursor-pointer transition-colors w-full">
                <Upload className="w-4 h-4" />
                <span className="truncate">
                  {isUploadingAudio
                    ? 'Subiendo audio al servidor...'
                    : audioFileName
                    ? `Archivo: ${audioFileName}`
                    : 'Cargar archivo MP3 desde dispositivo'}
                </span>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/*"
                  onChange={handleAudioFileUpload}
                  disabled={isUploadingAudio}
                  className="hidden"
                />
              </label>

              {audioUrl && (
                <button
                  type="button"
                  onClick={togglePreview}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-xl text-xs font-semibold text-cyan-200 cursor-pointer shrink-0"
                >
                  {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{previewPlaying ? 'Pausar' : 'Escuchar'}</span>
                </button>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">O ingresa URL directa de audio MP3:</span>
              <input
                type="text"
                placeholder="https://... o /assets/aistudio/...mp3"
                value={audioUrl}
                onChange={e => setAudioUrl(e.target.value)}
                className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Independent Song Cover (512x512) */}
          <div className="bg-[#0b162b] border border-[#193059] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  Portada Independiente de la Canción (512x512)
                </label>
                <p className="text-[11px] text-slate-400">
                  Cada canción tiene su propia carátula independiente a la del álbum
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                512 x 512 px
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 items-center">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 border-cyan-400/50 bg-[#070e1c] shadow-md shrink-0">
                <SafeImage
                  src={coverUrl}
                  alt="Carátula de la Canción"
                  fallbackTitle={title || 'Canción'}
                  itemType="song"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/75 py-0.5 text-center text-[8px] font-mono text-cyan-300">
                  512 × 512
                </div>
              </div>

              <div className="flex-1 space-y-2 w-full">
                <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#122347] hover:bg-[#1a3266] border border-[#223f7a] rounded-xl text-xs text-cyan-200 cursor-pointer transition-colors w-full">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingCover ? 'Procesando portada...' : 'Subir portada de canción'}</span>
                  <input type="file" accept="image/*" onChange={handleSongCoverUpload} disabled={isUploadingCover} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder="URL de imagen 512x512"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none font-mono"
                />

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SONG_COVERS.map(p => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => {
                        audio.playButtonClick();
                        setCoverUrl(p.url);
                      }}
                      className={`text-[9px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        coverUrl === p.url
                          ? 'bg-blue-600 text-white border-blue-400 font-bold'
                          : 'bg-[#101e3d] text-slate-300 border-[#1c3563] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CRITICAL: Especificar en qué álbum se añadirá la canción */}
          <div className="bg-gradient-to-r from-[#0d1f40] to-[#0d1a33] border-2 border-cyan-500/50 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Disc className="w-4 h-4 text-cyan-400" />
                Especificar en qué Álbum se añade la Canción <span className="text-cyan-400">*</span>
              </label>
              <span className="text-[10px] text-cyan-300 font-mono">Paso Final</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Selecciona el álbum o playlist destino donde figurará esta canción:
            </p>

            {albums.length === 0 ? (
              <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200">
                Aún no has creado ningún álbum. Por favor crea un álbum primero con "+ Crear Álbum".
              </div>
            ) : (
              <select
                value={albumId}
                onChange={e => setAlbumId(e.target.value)}
                required
                className="w-full bg-[#081224] border border-[#234580] focus:border-cyan-400 text-white rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-colors cursor-pointer"
              >
                <option value="" disabled>
                  -- Seleccionar Álbum Destino --
                </option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>
                    💿 {a.title} ({a.artist} • {a.genre})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#182d54]">
            <button
              type="button"
              onClick={() => {
                audio.playButtonClick();
                if (previewAudioEl) previewAudioEl.pause();
                setIsCreateSongModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover || isUploadingAudio || albums.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00439c] to-[#0070d1] hover:brightness-110 active:scale-95 text-white shadow-lg shadow-blue-900/50 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {isUploadingAudio
                  ? 'Subiendo Audio...'
                  : isUploadingCover
                  ? 'Subiendo Portada...'
                  : isSubmitting
                  ? 'Guardando Canción...'
                  : 'Guardar Canción en el Álbum'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
