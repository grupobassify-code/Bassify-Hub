import React from 'react';
import { Star, Download, Heart, Edit, Trash2, ArrowUpRight, Calendar, MapPin, Hammer, RefreshCw } from 'lucide-react';
import { ContentItem } from '../types';
import { useApp } from '../context/AppContext';
import { SafeImage } from './SafeImage';

interface ContentCardProps {
  item: ContentItem;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item }) => {
  const {
    setSelectedItem,
    isAdmin,
    deleteItem,
    setEditingItem,
    setIsUploadModalOpen,
    toggleLikeItem,
    toggleFeatured,
    currentUser,
  } = useApp();

  const isLiked = item.likedBy.includes(currentUser.email);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsUploadModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Estás seguro de eliminar "${item.title}"?`)) {
      deleteItem(item.id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeItem(item.id);
  };

  const handleToggleFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFeatured(item.id);
  };

  return (
    <div
      onClick={() => setSelectedItem(item)}
      className="group relative bg-[#0b162c] hover:bg-[#101f3e] border border-[#192b4f] hover:border-[#2d4d8c] rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col shadow-lg shadow-black/20"
    >
      {/* Banner Area for 16:9 context */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070e1c]">
        <SafeImage
          src={item.bannerUrl || item.logoUrl}
          alt={item.title}
          fallbackTitle={item.title}
          itemType={item.type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b162c] via-[#0b162c]/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/70 backdrop-blur-md text-blue-300 px-2 py-0.5 rounded-md border border-white/10 font-mono">
              {item.type.toUpperCase()}
            </span>

            {/* Special Badges: Destacado, En Desarrollo, Actualización */}
            {item.isFeatured && (
              <span className="text-[10px] font-bold bg-amber-500/80 text-black px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-black" />
                <span>Destacado</span>
              </span>
            )}

            {item.status === 'in_development' && (
              <span className="text-[10px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-600/40 px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1">
                <Hammer className="w-2.5 h-2.5" />
                <span>En Desarrollo</span>
              </span>
            )}

            {item.status === 'update' && (
              <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Actualización</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md rounded-md p-1 border border-white/10">
                <button
                  onClick={handleToggleFeatured}
                  className={`p-1 rounded transition-colors ${
                    item.isFeatured ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title={item.isFeatured ? 'Quitar de Destacados' : 'Marcar como Destacado (Admin)'}
                >
                  <Star className={`w-3.5 h-3.5 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1 hover:text-blue-400 text-slate-300 transition-colors"
                  title="Editar publicación (Admin)"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 hover:text-red-400 text-slate-300 transition-colors"
                  title="Eliminar publicación (Admin)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleLike}
              className={`p-1.5 rounded-md backdrop-blur-md transition-colors border border-white/10 ${
                isLiked
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/60 text-slate-300 hover:text-white'
              }`}
              title="Me gusta"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Floating 512x512 Logo Icon (Google Play Store Style) */}
        <div className="absolute -bottom-4 left-4 flex items-end gap-3 z-10">
          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-[#192b4f] bg-[#070e1c] shadow-lg shrink-0">
            <SafeImage
              src={item.logoUrl}
              alt={`${item.title} icon`}
              fallbackTitle={item.title}
              itemType={item.type}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="pt-6 p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre and Developer */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-medium text-blue-400 truncate">{item.genre}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{item.developer}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
            {item.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
            {item.shortDescription || item.description}
          </p>

          {/* For Updates: Update Notes */}
          {item.status === 'update' && item.updateNotes && (
            <p className="mt-2 text-[11px] text-emerald-300 bg-emerald-950/30 border border-emerald-900/30 p-2 rounded-lg line-clamp-2">
              <strong className="text-white">Novedades:</strong> {item.updateNotes}
            </p>
          )}

          {/* For Events: Event Date & Location */}
          {item.type === 'event' && item.eventDate && (
            <div className="mt-2.5 space-y-1 text-xs text-blue-300 bg-blue-950/40 p-2 rounded-lg border border-blue-900/30">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium">{item.eventDate}</span>
              </div>
              {item.eventLocation && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{item.eventLocation}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta Row */}
        <div className="mt-4 pt-3 border-t border-[#162544] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
            </div>

            {/* Downloads / Views */}
            <div className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <Download className="w-3 h-3 text-slate-500" />
              <span>{item.downloadsCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-blue-400 group-hover:text-white font-semibold text-xs transition-colors">
            <span>Ver ficha</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
