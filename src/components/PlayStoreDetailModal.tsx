import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Heart,
  MessageSquare,
  ThumbsUp,
  Send,
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Hammer,
  RefreshCw,
  Bookmark,
  Flag,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContentItem } from '../types';

interface PlayStoreDetailModalProps {
  item: ContentItem;
  onClose: () => void;
}

export const PlayStoreDetailModal: React.FC<PlayStoreDetailModalProps> = ({ item, onClose }) => {
  const {
    isAdmin,
    currentUser,
    deleteItem,
    setEditingItem,
    setIsUploadModalOpen,
    toggleLikeItem,
    toggleFeatured,
    toggleBookmark,
    isBookmarked,
    addComment,
    deleteComment,
    likeComment,
    setReportingTarget,
    showToast,
  } = useApp();

  const [activeImage, setActiveImage] = useState<string>(item.screenshots[0] || item.bannerUrl);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [isDownloading, setIsDownloading] = useState(false);

  const isLiked = item.likedBy.includes(currentUser.email);

  const handleDownload = () => {
    setIsDownloading(true);
    showToast(`Iniciando descarga de ${item.title} (${item.fileSize})...`);
    setTimeout(() => {
      setIsDownloading(false);
      showToast(`¡Descarga completada con éxito!`);
      if (item.downloadUrl && item.downloadUrl !== '#') {
        window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Enlace copiado al portapapeles.');
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(item.id, commentText, userRating);
    setCommentText('');
  };

  const handleEdit = () => {
    setEditingItem(item);
    setIsUploadModalOpen(true);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar "${item.title}"?`)) {
      deleteItem(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#091224] border border-[#1b2c4e] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
          title="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner Header */}
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={item.bannerUrl || activeImage}
            alt={item.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091224] via-[#091224]/50 to-transparent" />

          {/* Admin Tag & Quick Admin Tools */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 flex-wrap max-w-[80%]">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-[#00439c] text-white px-2.5 sm:px-3 py-1 rounded-full shadow-md font-mono">
              {item.type}
            </span>

            {item.isFeatured && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-amber-400 text-black px-2.5 sm:px-3 py-1 rounded-full shadow-md">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" />
                Destacado
              </span>
            )}

            {item.status === 'in_development' && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-500/40 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md">
                <Hammer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                En Desarrollo
              </span>
            )}

            {item.status === 'update' && (
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md">
                <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Actualización
              </span>
            )}

            {item.isOfficialBassify && (
              <span className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                Oficial Bassify
              </span>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <button
                  onClick={() => toggleFeatured(item.id)}
                  className={`text-[10px] sm:text-xs flex items-center gap-1 font-medium px-1.5 py-0.5 rounded transition-colors ${
                    item.isFeatured ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Marcar o desmarcar como destacado"
                >
                  <Star className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                  {item.isFeatured ? 'Destacado' : 'Destacar'}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={handleEdit}
                  className="text-[10px] sm:text-xs text-blue-300 hover:text-white flex items-center gap-1 font-medium px-1.5 py-0.5"
                  title="Editar publicación"
                >
                  <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Editar
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={handleDelete}
                  className="text-[10px] sm:text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1 font-medium px-1.5 py-0.5"
                  title="Eliminar publicación"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Play Store Info Header (Logo 512x512 + Metadata + Action CTAs) */}
        <div className="px-4 sm:px-8 -mt-12 sm:-mt-20 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pb-6 border-b border-[#18294a] text-center sm:text-left">
            {/* 512x512 Icon + Names */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-5">
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-[#091224] bg-slate-900 shadow-2xl shrink-0">
                <img
                  src={item.logoUrl}
                  alt={`${item.title} icon`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {item.title}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-blue-400 mt-0.5 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span>{item.developer}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{item.genre}</span>
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-mono">
                  v{item.version} · {item.releaseDate}
                </p>
              </div>
            </div>

            {/* Action Buttons: Instalar / Descargar + Like + Compartir */}
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-[#0055cb] to-[#00439c] text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-900/50 cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDownloading
                    ? 'Descargando...'
                    : item.type === 'event'
                    ? 'Inscribirme / Asistir'
                    : item.type === 'news'
                    ? 'Leer Completo'
                    : 'Instalar Juego Completo'}
                </span>
              </button>

              <button
                onClick={() => toggleLikeItem(item.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isLiked
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-[#121f3b] text-slate-300 border-[#20345d] hover:text-white hover:bg-[#18294e]'
                }`}
                title="Me gusta"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => toggleBookmark(item.id)}
                className={`p-3 rounded-xl border transition-colors ${
                  isBookmarked(item.id)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#121f3b] text-slate-300 border-[#20345d] hover:text-white hover:bg-[#18294e]'
                }`}
                title={isBookmarked(item.id) ? 'Guardado en tu perfil' : 'Guardar en mi perfil'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked(item.id) ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-xl bg-[#121f3b] text-slate-300 border border-[#20345d] hover:text-white hover:bg-[#18294e] transition-colors cursor-pointer"
                title="Compartir enlace"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Denunciar publicación */}
              <button
                onClick={() => setReportingTarget({
                  type: 'content',
                  id: item.id,
                  title: item.title,
                  content: item.shortDescription || item.description,
                  authorEmail: item.authorEmail,
                })}
                className="p-3 rounded-xl bg-[#121f3b] text-slate-400 border border-[#20345d] hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Denunciar este contenido por ofensivo o inapropiado"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Metrics Strip (Exact Google Play Store layout) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-b border-[#18294a] text-center">
            {/* Rating */}
            <div className="p-2 bg-[#0e1a32] rounded-xl border border-[#1b2f56]">
              <div className="flex items-center justify-center gap-1 text-amber-300 font-bold text-base">
                <span>{item.rating}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.reviewCount} reseñas</p>
            </div>

            {/* Downloads / Views */}
            <div className="p-2 bg-[#0e1a32] rounded-xl border border-[#1b2f56]">
              <p className="text-base font-bold text-white font-mono">{item.downloadsCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {item.type === 'news' ? 'Lecturas' : item.type === 'event' ? 'Participantes' : 'Descargas'}
              </p>
            </div>

            {/* File Size */}
            <div className="p-2 bg-[#0e1a32] rounded-xl border border-[#1b2f56]">
              <p className="text-base font-bold text-white font-mono">{item.fileSize}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tamaño de archivo</p>
            </div>

            {/* Clasificación / Verified */}
            <div className="p-2 bg-[#0e1a32] rounded-xl border border-[#1b2f56]">
              <p className="text-base font-bold text-emerald-400">Verificado</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Admin Bassify Hub</p>
            </div>
          </div>

          {/* For Updates: Highlighted Patch Notes Box */}
          {item.status === 'update' && item.updateNotes && (
            <div className="my-5 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Novedades de esta Actualización ({item.version})</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{item.updateNotes}</p>
            </div>
          )}

          {/* For Events: Detailed Date and Venue */}
          {item.type === 'event' && (item.eventDate || item.eventLocation) && (
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/40 border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-blue-300 tracking-wider">
                  Detalles del Evento en Bassify Hub
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm text-white font-semibold">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>{item.eventDate || 'Fecha por confirmar'}</span>
                </div>
                {item.eventLocation && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.eventLocation}</span>
                  </div>
                )}
              </div>

              <a
                href={item.downloadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                <span>Acceder a la Sala / Transmisión</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Screenshots Gallery Section (Google Play Store Style) */}
          {item.screenshots && item.screenshots.length > 0 && (
            <div className="py-6 border-b border-[#18294a]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Capturas de Pantalla y Arte Gráfico
              </h2>

              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
                {item.screenshots.map((shot, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(shot)}
                    className={`relative h-44 sm:h-52 aspect-[16/9] rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                      activeImage === shot
                        ? 'border-blue-400 ring-2 ring-blue-500/30'
                        : 'border-[#1b2d52] hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={shot}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Description & About Section */}
          <div className="py-6 border-b border-[#18294a]">
            <h2 className="text-base font-bold text-white mb-2">
              Sobre este contenido
            </h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
              {item.description}
            </div>

            {/* External Links */}
            {item.downloadUrl && item.downloadUrl !== '#' && (
              <div className="mt-4 pt-3 flex items-center gap-2">
                <a
                  href={item.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visitar enlace de descarga o web oficial</span>
                </a>
              </div>
            )}
          </div>

          {/* Community Reviews & Comments Section (Discord + Play Store Hybrid) */}
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Opiniones y Reseñas de Bassify Hub
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comentarios y puntuaciones de los miembros de la comunidad
                </p>
              </div>

              <span className="text-xs font-mono bg-blue-950/60 text-blue-300 border border-blue-900/40 px-2.5 py-1 rounded-lg">
                {item.comments.length} comentarios
              </span>
            </div>

            {/* Write a review form */}
            <form onSubmit={handlePostComment} className="bg-[#0e1932] border border-[#1b2e56] rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-blue-500/40"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-semibold text-white">{currentUser.name}</span>
                  {isAdmin && (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono">
                      ADMIN
                    </span>
                  )}
                </div>

                {/* Star rating selector */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= userRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-300 ml-1 font-mono">{userRating}.0</span>
                </div>
              </div>

              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Escribe tu opinión, consejos o feedback para la comunidad de Bassify Hub..."
                rows={2}
                className="w-full bg-[#081022] border border-[#1b2d54] text-xs text-white placeholder-slate-500 rounded-xl p-3 focus:outline-none focus:border-blue-400 transition-colors resize-none"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Filtro activo: Las palabras ofensivas se sustituyen por <strong>####</strong></span>
                </span>

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-all shadow-md cursor-pointer self-end sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Reseña</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {item.comments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Aún no hay comentarios sobre este contenido. ¡Sé el primero en dejar una reseña!
                </div>
              ) : (
                item.comments.map(comment => {
                  const isCommentLiked = (comment.likedBy || []).includes(currentUser.email);
                  const canDelete = isAdmin || currentUser.email.toLowerCase() === comment.authorEmail.toLowerCase();
                  return (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-xl bg-[#0c162d] border border-[#172747] space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-7 h-7 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{comment.authorName}</span>
                              {comment.authorEmail.toLowerCase() === 'grupobassify@gmail.com' && (
                                <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                          </div>
                        </div>

                        {comment.rating && (
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(comment.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pl-9">
                        {comment.content}
                      </p>

                      <div className="pl-9 flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => likeComment(item.id, comment.id)}
                            className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                              isCommentLiked ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{comment.likes || 0}</span>
                          </button>

                          {/* Denunciar comentario ofensivo */}
                          <button
                            onClick={() => setReportingTarget({
                              type: 'comment',
                              id: comment.id,
                              title: `Comentario en ${item.title}`,
                              content: comment.content,
                              authorEmail: comment.authorEmail,
                            })}
                            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Denunciar este comentario"
                          >
                            <Flag className="w-3 h-3" />
                            <span>Denunciar</span>
                          </button>
                        </div>

                        {/* Admin or Author Delete Action */}
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar este comentario?')) {
                                deleteComment(item.id, comment.id);
                              }
                            }}
                            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar comentario"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
