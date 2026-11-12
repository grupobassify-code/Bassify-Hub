import React, { useState, useEffect } from 'react';
import {
  Music,
  Disc,
  Play,
  Pause,
  Plus,
  Heart,
  Clock,
  Sparkles,
  ArrowLeft,
  Trash2,
  Radio,
  Volume2,
  Calendar,
  Layers,
  Check,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { audio, AudioSystemState } from '../utils/audioSystem';
import { MusicAlbum, MusicSong } from '../types';
import { SafeImage } from './SafeImage';

export const MusicSection: React.FC = () => {
  const {
    albums,
    songs,
    activeAlbumDetail,
    setActiveAlbumDetail,
    setIsCreateAlbumModalOpen,
    setIsCreateSongModalOpen,
    setSelectedAlbumForNewSong,
    deleteAlbum,
    deleteSong,
    toggleLikeSong,
    setSongAsBackground,
    isAdmin,
  } = useApp();

  const [musicTab, setMusicTab] = useState<'albums' | 'all_songs'>('albums');
  const [filterQuery, setFilterQuery] = useState('');
  const [audioState, setAudioState] = useState<AudioSystemState>(audio.getState());

  useEffect(() => {
    const unsub = audio.subscribe(state => setAudioState(state));
    return () => unsub();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getAlbumSongs = (albumId: string) => {
    return songs.filter(s => s.albumId === albumId);
  };

  const getAlbumTotalDuration = (albumSongs: MusicSong[]) => {
    const totalSecs = albumSongs.reduce((acc, s) => acc + (s.duration || 0), 0);
    return formatDuration(totalSecs);
  };

  const handlePlayAlbum = (album: MusicAlbum) => {
    audio.playButtonClick();
    const albumSongs = getAlbumSongs(album.id);
    if (albumSongs.length > 0) {
      audio.playAlbum(album, albumSongs, 0);
    }
  };

  const handlePlaySong = (song: MusicSong, albumTitle?: string) => {
    audio.playButtonClick();
    const surroundingPlaylist = song.albumId ? getAlbumSongs(song.albumId) : songs;
    audio.playSong(
      {
        ...song,
        albumTitle: albumTitle || albums.find(a => a.id === song.albumId)?.title,
      },
      surroundingPlaylist
    );
  };

  const handleOpenAddSongToAlbum = (albumId: string) => {
    audio.playButtonClick();
    setSelectedAlbumForNewSong(albumId);
    setIsCreateSongModalOpen(true);
  };

  const isSongPlaying = (songId: string) => {
    return audioState.isPlaying && audioState.songId === songId;
  };

  const isAlbumPlaying = (albumId: string) => {
    if (!audioState.isPlaying || !audioState.songId) return false;
    const current = songs.find(s => s.id === audioState.songId);
    return current?.albumId === albumId;
  };

  // FILTERED LISTS
  const filteredAlbums = albums.filter(
    a =>
      a.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
      a.genre.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredSongs = songs.filter(
    s =>
      s.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // If in Album Detail View
  if (activeAlbumDetail) {
    const currentAlbum = albums.find(a => a.id === activeAlbumDetail.id) || activeAlbumDetail;
    const albumSongs = getAlbumSongs(currentAlbum.id);
    const isPlayingThisAlbum = isAlbumPlaying(currentAlbum.id);

    return (
      <div className="flex-1 overflow-y-auto bg-[#070e1c] text-slate-200 scrollbar-thin pb-24 md:pb-8">
        {/* Back navigation header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              audio.playButtonClick();
              setActiveAlbumDetail(null);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-[#0f1d38] hover:bg-[#162a52] px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-[#1b3360]"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Volver a Álbumes & Playlists</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm(`¿Estás seguro de eliminar el álbum "${currentAlbum.title}" y sus canciones?`)) {
                  deleteAlbum(currentAlbum.id);
                  setActiveAlbumDetail(null);
                }
              }}
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Álbum</span>
            </button>
          )}
        </div>

        {/* Hero Album Banner (Spotify Style with 512x512 Cover Artwork) */}
        <div className="relative border-b border-[#152342] bg-gradient-to-b from-[#0e2147] via-[#09152b] to-[#070e1c] px-4 sm:px-8 md:px-10 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
            {/* Square 512x512 Album Artwork with ambient glow */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-950/60 border-2 border-cyan-500/40 shrink-0 bg-[#060c18] group">
              <SafeImage
                src={currentAlbum.coverUrl}
                alt={currentAlbum.title}
                fallbackTitle={currentAlbum.title}
                itemType="album"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                512 × 512 px
              </div>
            </div>

            {/* Album Metadata Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-full">
                  Álbum Oficial
                </span>
                <span className="text-xs text-slate-400 font-medium">• {currentAlbum.genre}</span>
                <span className="text-xs text-slate-400 font-medium">• {currentAlbum.releaseYear}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {currentAlbum.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {currentAlbum.description}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-slate-400 font-medium pt-1">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-blue-400" />
                  {currentAlbum.artist}
                </span>
                <span>•</span>
                <span>{albumSongs.length} {albumSongs.length === 1 ? 'canción' : 'canciones'}</span>
                <span>•</span>
                <span>{getAlbumTotalDuration(albumSongs)} duración total</span>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                <button
                  onClick={() => handlePlayAlbum(currentAlbum)}
                  disabled={albumSongs.length === 0}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white shadow-xl transition-all cursor-pointer ${
                    isPlayingThisAlbum
                      ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/40 text-black'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 shadow-blue-900/50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {isPlayingThisAlbum ? (
                    <>
                      <Volume2 className="w-4 h-4 text-black animate-pulse" />
                      <span>Reproduciendo Álbum</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Reproducir Álbum</span>
                    </>
                  )}
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleOpenAddSongToAlbum(currentAlbum.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#14264d] hover:bg-[#1c366e] text-cyan-300 border border-cyan-500/40 transition-colors shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Añadir Canción a este Álbum</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracklist Table */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#142344]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4 text-cyan-400" />
              Lista de Canciones ({albumSongs.length})
            </h3>
            <span className="text-xs text-slate-400">
              Cada canción incluye su propia carátula independiente 512x512
            </span>
          </div>

          {albumSongs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#091326] rounded-3xl border border-[#16274a] mt-6">
              <Disc className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-spin [animation-duration:12s]" />
              <h4 className="text-sm font-bold text-white">Este álbum aún no tiene canciones cargadas</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isAdmin
                  ? 'Haz clic en el botón "+ Añadir Canción a este Álbum" para cargar archivos MP3 y carátula 512x512.'
                  : 'El administrador aún no ha cargado canciones a este álbum.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleOpenAddSongToAlbum(currentAlbum.id)}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00439c] text-white hover:bg-blue-600 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cargar Primera Canción</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#12203d]">
              {albumSongs.map((song, index) => {
                const playing = isSongPlaying(song.id);
                return (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                      playing
                        ? 'bg-blue-950/60 border border-cyan-500/40 text-cyan-200'
                        : 'hover:bg-[#0c1833] text-slate-300'
                    }`}
                  >
                    {/* Left: Index + Independent 512x512 Song Cover + Title */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-5 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => handlePlaySong(song, currentAlbum.title)}
                        className="w-5 text-center hidden group-hover:flex items-center justify-center text-cyan-400 cursor-pointer"
                        title={playing ? 'Pausar' : 'Reproducir'}
                      >
                        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      {/* Independent Song Cover (512x512) */}
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-cyan-500/30 bg-[#070e1c] shrink-0">
                        <SafeImage
                          src={song.coverUrl}
                          alt={song.title}
                          fallbackTitle={song.title}
                          itemType="song"
                          className="w-full h-full object-cover"
                        />
                        {playing && (
                          <div className="absolute inset-0 bg-blue-950/70 flex items-center justify-center">
                            <Volume2 className="w-4 h-4 text-cyan-300 animate-pulse" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs font-bold truncate ${
                              playing ? 'text-cyan-300' : 'text-white'
                            }`}
                          >
                            {song.title}
                          </h4>
                          {playing && (
                            <span className="text-[9px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                              Sonando
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{song.artist}</p>
                      </div>
                    </div>

                    {/* Right: Actions, Duration, Like */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          audio.playButtonClick();
                          toggleLikeSong(song.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          song.isLiked
                            ? 'text-rose-400 hover:text-rose-300'
                            : 'text-slate-500 hover:text-rose-400'
                        }`}
                        title={song.isLiked ? 'Quitar Me Gusta' : 'Dar Me Gusta'}
                      >
                        <Heart
                          className={`w-4 h-4 ${song.isLiked ? 'fill-current' : ''}`}
                        />
                      </button>

                      <button
                        onClick={() => {
                          audio.playButtonClick();
                          setSongAsBackground(song);
                        }}
                        className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 bg-[#0f1d3a] hover:bg-[#162a52] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Fijar esta canción como tema musical de fondo de la aplicación"
                      >
                        <Radio className="w-3 h-3 text-cyan-400" />
                        <span>Fondo Web</span>
                      </button>

                      <span className="text-xs font-mono text-slate-400 w-12 text-right">
                        {formatDuration(song.duration)}
                      </span>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la canción "${song.title}"?`)) {
                              deleteSong(song.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Eliminar canción (Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN VIEW: Albums Grid and Songs List
  return (
    <div className="flex-1 overflow-y-auto bg-[#070e1c] text-slate-200 scrollbar-thin pb-24 md:pb-8">
      {/* Editorial Header Banner */}
      <div className="relative border-b border-[#152342] bg-gradient-to-r from-[#0b162c] via-[#0d1f40] to-[#070e1c] px-4 sm:px-8 md:px-10 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <Music className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Bassify Sound & Playlists
              </span>
              <span className="text-[10px] bg-blue-900/40 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-700/40">
                Estilo Spotify
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Música & Álbumes Oficiales
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Explora álbumes, bandas sonoras y canciones creadas por la comunidad. Cada álbum y canción cuenta con su propia carátula independiente de 512x512 píxeles.
            </p>
          </div>

          {/* Admin Management Buttons */}
          {isAdmin ? (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#091428] border border-blue-900/50 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <div className="hidden sm:block pr-2 border-r border-[#152445]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Conectado</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">grupobassi@gmail.com</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setIsCreateAlbumModalOpen(true);
                  }}
                  onMouseEnter={() => audio.playButtonHover()}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-[#00439c] hover:bg-blue-600 text-white transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Disc className="w-3.5 h-3.5" />
                  <span>+ Crear Álbum</span>
                </button>

                <button
                  onClick={() => {
                    audio.playButtonClick();
                    setSelectedAlbumForNewSong(null);
                    setIsCreateSongModalOpen(true);
                  }}
                  onMouseEnter={() => audio.playButtonHover()}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Crear Canción</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-[#0c1833] border border-[#1b3360] px-4 py-2.5 rounded-2xl text-xs text-slate-300">
              <Disc className="w-4 h-4 text-cyan-400" />
              <span>{albums.length} Álbumes • {songs.length} Pistas</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs and Search Toolbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#142344]">
          {/* Section Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playButtonClick();
                setMusicTab('albums');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                musicTab === 'albums'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'bg-[#0c172e] text-slate-400 hover:text-white hover:bg-[#122142]'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Álbumes & Playlists ({albums.length})</span>
            </button>

            <button
              onClick={() => {
                audio.playButtonClick();
                setMusicTab('all_songs');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                musicTab === 'all_songs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'bg-[#0c172e] text-slate-400 hover:text-white hover:bg-[#122142]'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Todas las Canciones ({songs.length})</span>
            </button>
          </div>

          {/* Quick Filter */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar en música..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="w-full bg-[#0c172e] border border-[#1b2f56] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* TAB 1: ALBUMS GRID */}
        {musicTab === 'albums' && (
          <div className="py-6">
            {filteredAlbums.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#091326] rounded-3xl border border-[#16274a]">
                <Disc className="w-14 h-14 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No se encontraron álbumes</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {isAdmin
                    ? 'Comienza creando tu primer álbum musical con portada 512x512 y cargando canciones MP3.'
                    : 'Aún no hay álbumes cargados en esta sección.'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setIsCreateAlbumModalOpen(true)}
                    className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00439c] text-white hover:bg-blue-600 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Primer Álbum</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredAlbums.map(album => {
                  const albumTracks = getAlbumSongs(album.id);
                  const isPlaying = isAlbumPlaying(album.id);

                  return (
                    <div
                      key={album.id}
                      onClick={() => {
                        audio.playButtonClick();
                        setActiveAlbumDetail(album);
                      }}
                      className="group bg-[#091428] hover:bg-[#0e1d3a] border border-[#16274a] hover:border-cyan-500/50 rounded-2xl p-3 sm:p-4 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col cursor-pointer"
                    >
                      {/* 512x512 Square Cover Artwork */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#060c18] border border-cyan-500/20 mb-3 shadow-inner">
                        <SafeImage
                          src={album.coverUrl}
                          alt={album.title}
                          fallbackTitle={album.title}
                          itemType="album"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* 512x512 indicator tag */}
                        <div className="absolute top-1.5 left-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-300">
                          512x512
                        </div>

                        {/* Hover Play Button (Spotify style floating green/cyan button) */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handlePlayAlbum(album);
                          }}
                          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 cursor-pointer ${
                            isPlaying
                              ? 'bg-cyan-400 text-black scale-100 opacity-100'
                              : 'bg-blue-600 group-hover:bg-cyan-500 group-hover:text-black opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                          }`}
                          title="Reproducir Álbum"
                        >
                          {isPlaying ? (
                            <Volume2 className="w-5 h-5 animate-pulse" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      {/* Album Title & Metadata */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {album.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{album.artist}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#142344] text-[10px] text-slate-400">
                          <span className="font-mono">{albumTracks.length} pistas</span>
                          <span className="bg-[#122244] text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                            {album.genre}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL SONGS LIST */}
        {musicTab === 'all_songs' && (
          <div className="py-6">
            <div className="bg-[#091428] rounded-2xl border border-[#16274a] p-3 sm:p-4 divide-y divide-[#132242]">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No se encontraron canciones coincidentes.
                </div>
              ) : (
                filteredSongs.map((song, index) => {
                  const playing = isSongPlaying(song.id);
                  const songAlbum = albums.find(a => a.id === song.albumId);

                  return (
                    <div
                      key={song.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                        playing ? 'bg-blue-950/70 border border-cyan-500/40 text-cyan-200' : 'hover:bg-[#0d1c3a]'
                      }`}
                    >
                      {/* Left: Index + Independent 512x512 Song Cover + Title */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="w-5 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => handlePlaySong(song, songAlbum?.title)}
                          className="w-5 text-center hidden group-hover:flex items-center justify-center text-cyan-400 cursor-pointer"
                        >
                          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        {/* Song's Independent Cover (512x512) */}
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-cyan-500/30 bg-[#070e1c] shrink-0">
                          <SafeImage
                            src={song.coverUrl}
                            alt={song.title}
                            fallbackTitle={song.title}
                            itemType="song"
                            className="w-full h-full object-cover"
                          />
                          {playing && (
                            <div className="absolute inset-0 bg-blue-950/70 flex items-center justify-center">
                              <Volume2 className="w-4 h-4 text-cyan-300 animate-pulse" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold truncate ${playing ? 'text-cyan-300' : 'text-white'}`}>
                              {song.title}
                            </h4>
                            {playing && (
                              <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded">
                                Sonando
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {song.artist} {songAlbum ? `• ${songAlbum.title}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions, Duration, Like */}
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => {
                            audio.playButtonClick();
                            toggleLikeSong(song.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            song.isLiked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'
                          }`}
                          title="Me Gusta"
                        >
                          <Heart className={`w-4 h-4 ${song.isLiked ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => {
                            audio.playButtonClick();
                            setSongAsBackground(song);
                          }}
                          className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 bg-[#0f1d3a] hover:bg-[#162a52] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          title="Fijar como música de fondo de la aplicación"
                        >
                          <Radio className="w-3 h-3 text-cyan-400" />
                          <span>Fondo Web</span>
                        </button>

                        <span className="text-xs font-mono text-slate-400 w-12 text-right">
                          {formatDuration(song.duration)}
                        </span>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar la canción "${song.title}"?`)) {
                                deleteSong(song.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Eliminar canción (Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
