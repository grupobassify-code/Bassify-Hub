import React from 'react';
import {
  Smartphone,
  Gamepad2,
  Newspaper,
  Calendar,
  Star,
  Hammer,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContentCard } from './ContentCard';
import { SectionType } from '../types';

export const MainContent: React.FC = () => {
  const {
    activeSection,
    filteredItems,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    setSortBy,
    items,
    isAdmin,
    setIsUploadModalOpen,
  } = useApp();

  const sectionMeta: Record<SectionType, { title: string; subtitle: string; icon: React.ReactNode }> = {
    apps: {
      title: '1. Aplicaciones & Software',
      subtitle: 'Herramientas de audio, utilidades de control y software de creación optimizados',
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
    },
    games: {
      title: '2. Juegos Completos',
      subtitle: 'Títulos completos curados, RPGs de acción, aventuras espaciales y velocidad arcade',
      icon: <Gamepad2 className="w-5 h-5 text-blue-400" />,
    },
    news: {
      title: '3. Noticias & Comunicados',
      subtitle: 'Notas oficiales, anuncios de la comunidad Bassify Hub y artículos editoriales',
      icon: <Newspaper className="w-5 h-5 text-blue-400" />,
    },
    events: {
      title: '4. Eventos & Torneos',
      subtitle: 'Campeonatos eSports, Game Jams comunitarias y transmisiones en salas de voz',
      icon: <Calendar className="w-5 h-5 text-blue-400" />,
    },
    featured: {
      title: 'Contenido Destacado por el Admin',
      subtitle: 'Selección de títulos, aplicaciones y novedades verificadas y promovidas por grupobassify@gmail.com',
      icon: <Star className="w-5 h-5 text-amber-400" />,
    },
    in_development: {
      title: 'Contenido en Desarrollo',
      subtitle: 'Proyectos en fase alpha y beta, prototipos tecnológicos y próximos estrenos de la comunidad',
      icon: <Hammer className="w-5 h-5 text-sky-400" />,
    },
    updates: {
      title: 'Actualizaciones & Parches',
      subtitle: 'Últimas versiones lanzadas, optimizaciones de rendimiento y notas de parches recientes',
      icon: <RefreshCw className="w-5 h-5 text-emerald-400" />,
    },
  };

  const currentMeta = sectionMeta[activeSection];

  // Dynamic genres for currently displayed section items
  let sectionPool = items;
  if (activeSection === 'apps') sectionPool = items.filter(i => i.type === 'app');
  else if (activeSection === 'games') sectionPool = items.filter(i => i.type === 'game');
  else if (activeSection === 'news') sectionPool = items.filter(i => i.type === 'news');
  else if (activeSection === 'events') sectionPool = items.filter(i => i.type === 'event');
  else if (activeSection === 'featured') sectionPool = items.filter(i => i.isFeatured);
  else if (activeSection === 'in_development') sectionPool = items.filter(i => i.status === 'in_development');
  else if (activeSection === 'updates') sectionPool = items.filter(i => i.status === 'update');

  const genres = ['all', ...Array.from(new Set(sectionPool.map(i => i.genre)))];

  return (
    <div className="flex-1 overflow-y-auto bg-[#070e1c] text-slate-200 scrollbar-thin pb-24 md:pb-8">
      {/* Editorial Header Banner */}
      <div className="relative border-b border-[#152342] bg-gradient-to-r from-[#0b162c] via-[#0d1c3a] to-[#070e1c] px-4 sm:px-8 md:px-10 py-5 sm:py-7">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                {currentMeta.icon}
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Bassify Hub
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {currentMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {currentMeta.subtitle}
            </p>
          </div>

          {/* ADMIN ONLY FAST ACTION: STRICTLY HIDDEN FOR NORMAL USERS */}
          {isAdmin && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#091428] border border-blue-900/50 shadow-lg flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Conectado</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">grupobassify@gmail.com</p>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00439c] hover:bg-blue-600 text-white transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Subir Aquí</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-10 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#142344]">
          {/* Genre Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-blue-400" />
              Género:
            </span>
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  selectedGenre === g
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#0c172e] text-slate-400 hover:text-white hover:bg-[#122142]'
                }`}
              >
                {g === 'all' ? 'Todos' : g}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'recent' | 'rating' | 'popular')}
              className="bg-[#0c172e] border border-[#1b2f56] text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-400"
            >
              <option value="recent">Más recientes</option>
              <option value="rating">Mejor valorados ★</option>
              <option value="popular">Más populares ♥</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="py-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#091326] rounded-3xl border border-[#16274a]">
              <div className="w-16 h-16 rounded-2xl bg-blue-950/40 border border-blue-900/40 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">
                {items.length === 0
                  ? 'Catálogo Limpio y Listo para Tus Contenidos'
                  : 'No hay publicaciones en esta sección'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {items.length === 0
                  ? isAdmin
                    ? 'Se han eliminado los contenidos previos. Como administrador oficial (grupobassify@gmail.com), ya puedes comenzar a subir tus propios juegos, aplicaciones, noticias y eventos.'
                    : 'Aún no hay publicaciones oficiales. El administrador subirá nuevos juegos y aplicaciones pronto.'
                  : `No se encontraron contenidos activos para los filtros actuales en ${currentMeta.title}.`}
              </p>

              <div className="mt-5 flex items-center justify-center gap-3">
                {selectedGenre !== 'all' && (
                  <button
                    onClick={() => setSelectedGenre('all')}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-[#132242] text-slate-200 hover:text-white transition-colors"
                  >
                    Mostrar todos los géneros
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-[#00439c] text-white hover:brightness-110 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Subir Mi Primer Contenido</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
