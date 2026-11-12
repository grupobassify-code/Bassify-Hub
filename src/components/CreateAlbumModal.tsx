import React, { useState } from 'react';
import { X, Disc, Image as ImageIcon, Music, Upload, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { audio } from '../utils/audioSystem';
import { processAndUploadImage } from '../utils/mediaUpload';
import { SafeImage } from './SafeImage';

const PRESET_COVERS = [
  { label: 'Soundwave Studio', url: '/assets/images/ps_app_soundwave_studio_1792032421478.jpg' },
  { label: 'Cyber Kart Neon', url: '/assets/images/ps_game_cyber_kart_1792032422740.jpg' },
  { label: 'Sci-Fi Odyssey', url: '/assets/images/ps_game_scifi_odyssey_1792032420390.jpg' },
  { label: 'PlayStation Arena', url: '/assets/images/ps_news_playstation_event_1792032422581.jpg' },
];

export const CreateAlbumModal: React.FC = () => {
  const { isCreateAlbumModalOpen, setIsCreateAlbumModalOpen, addAlbum, isAdmin } = useApp();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Bassify Sound Studio');
  const [genre, setGenre] = useState('Cyberpunk / OST');
  const [releaseYear, setReleaseYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  if (!isCreateAlbumModalOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setError(err?.message || 'No se pudo procesar la portada del álbum.');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdmin) {
      setError('Solo el administrador puede crear nuevos álbumes.');
      return;
    }

    if (!title.trim()) {
      setError('El nombre del álbum es obligatorio.');
      return;
    }

    if (!artist.trim()) {
      setError('El artista o creador es obligatorio.');
      return;
    }

    if (!coverUrl.trim()) {
      setError('Debes asignar una imagen de portada para el álbum (512x512 píxeles).');
      return;
    }

    setIsSubmitting(true);
    audio.playButtonClick();

    try {
      const res = await addAlbum({
        title: title.trim(),
        artist: artist.trim(),
        genre: genre.trim() || 'Varios',
        releaseYear: releaseYear.trim() || '2026',
        description: description.trim() || 'Álbum oficial de la comunidad Bassify Hub.',
        coverUrl: coverUrl.trim(),
        isOfficial: true,
        authorEmail: 'grupobassify@gmail.com',
      });

      if (res.success) {
        setTitle('');
        setDescription('');
      } else {
        setError(res.error || 'No se pudo crear el álbum. Intenta nuevamente.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al crear el álbum.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#091428] border border-[#1e3868] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#182d54] bg-gradient-to-r from-[#0d1f40] to-[#0a1730]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-cyan-400">
              <Disc className="w-5 h-5 animate-spin [animation-duration:8s]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Crear Nuevo Álbum
                <span className="text-[10px] bg-blue-600/30 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-blue-500/40 font-normal">
                  ADMIN
                </span>
              </h3>
              <p className="text-xs text-slate-400">Crea una colección o playlist como en Spotify con portada 512x512</p>
            </div>
          </div>
          <button
            onClick={() => {
              audio.playButtonClick();
              setIsCreateAlbumModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
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
                Nombre del Álbum <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Cyberpunk Velocity Vol. 1"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Artista o Creador <span className="text-cyan-400">*</span>
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

          {/* Row 2: Genre & Release Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Género Musical</label>
              <input
                type="text"
                placeholder="Ej. Synthwave / Cyberpunk / OST"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Año de Lanzamiento</label>
              <input
                type="text"
                placeholder="2026"
                value={releaseYear}
                onChange={e => setReleaseYear(e.target.value)}
                className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Descripción del Álbum</label>
            <textarea
              rows={2}
              placeholder="Breve reseña sobre el estilo sonoro o temática del álbum..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl p-3 text-xs focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* 512x512 Album Cover Section (INDEPENDENT OF SONG IMAGES) */}
          <div className="bg-[#0c1830] border border-[#1a315b] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  Portada del Álbum (512x512 píxeles)
                </label>
                <p className="text-[11px] text-slate-400">
                  Esta imagen es independiente de las canciones que contendrá
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                512 x 512 px
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 items-center">
              {/* Square 512x512 Preview */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-cyan-400/50 bg-[#070e1c] shadow-lg shrink-0 group">
                <SafeImage
                  src={coverUrl}
                  alt="Portada del Álbum"
                  fallbackTitle={title || 'Álbum'}
                  itemType="album"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-xs py-1 text-center text-[9px] font-mono text-cyan-300">
                  512 × 512
                </div>
              </div>

              {/* Upload & Preset Options */}
              <div className="flex-1 space-y-2 w-full">
                <div>
                  <span className="text-[11px] font-medium text-slate-300 block mb-1">
                    Subir imagen desde tu dispositivo:
                  </span>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-[#122347] hover:bg-[#1a3266] border border-[#223f7a] rounded-xl text-xs text-cyan-200 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingCover ? 'Procesando portada...' : 'Cargar archivo (JPG, PNG, WEBP)'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploadingCover} className="hidden" />
                  </label>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-300 block mb-1">
                    O ingresa la URL de la portada:
                  </span>
                  <input
                    type="text"
                    placeholder="https://... o ruta de imagen"
                    value={coverUrl}
                    onChange={e => setCoverUrl(e.target.value)}
                    className="w-full bg-[#0d1a33] border border-[#1e345e] focus:border-cyan-400 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>

                {/* Presets Selection */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Portadas recomendadas de Bassify:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COVERS.map(p => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => {
                          audio.playButtonClick();
                          setCoverUrl(p.url);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#182d54]">
            <button
              type="button"
              onClick={() => {
                audio.playButtonClick();
                setIsCreateAlbumModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingCover}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00439c] to-[#0070d1] hover:brightness-110 active:scale-95 text-white shadow-lg shadow-blue-900/50 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isUploadingCover ? 'Subiendo Portada...' : isSubmitting ? 'Guardando Álbum...' : 'Crear Álbum'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
