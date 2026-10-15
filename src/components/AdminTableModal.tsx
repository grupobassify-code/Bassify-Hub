import React, { useState, useRef } from 'react';
import {
  X,
  Table,
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  Hammer,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Database,
  Sliders,
  Flag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContentItem, ItemType, ReportItem } from '../types';
import { DEFAULT_PROFANITY_LIST } from '../utils/moderation';

export const AdminTableModal: React.FC = () => {
  const {
    isTableModalOpen,
    setIsTableModalOpen,
    items,
    setSelectedItem,
    setEditingItem,
    setIsUploadModalOpen,
    deleteItem,
    deleteComment,
    toggleFeatured,
    reports,
    resolveReport,
    moderationSettings,
    updateModerationSettings,
    exportDatabase,
    importDatabase,
    isAdmin,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'reports' | 'moderation_db'>('catalog');
  const [tableSearch, setTableSearch] = useState('');
  const [tableFilter, setTableFilter] = useState<'all' | ItemType | 'featured' | 'in_development' | 'updates'>('all');
  const [newBadWord, setNewBadWord] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isTableModalOpen) return null;

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  const filteredTableItems = items.filter(item => {
    if (tableFilter === 'featured' && !item.isFeatured) return false;
    if (tableFilter === 'in_development' && item.status !== 'in_development') return false;
    if (tableFilter === 'updates' && item.status !== 'update') return false;
    if (['app', 'game', 'news', 'event'].includes(tableFilter) && item.type !== tableFilter) return false;

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.developer.toLowerCase().includes(q) ||
        item.genre.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsUploadModalOpen(true);
  };

  const handleDelete = (item: ContentItem) => {
    if (confirm(`¿Estás seguro de eliminar el registro "${item.title}" de la base de datos?`)) {
      deleteItem(item.id);
    }
  };

  const handleView = (item: ContentItem) => {
    setSelectedItem(item);
    setIsTableModalOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        await importDatabase(parsed);
      } catch {
        showToast('El archivo seleccionado no tiene un formato JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddBadWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newBadWord.trim().toLowerCase();
    if (!word) return;
    if (moderationSettings.customBadWords.includes(word)) {
      showToast('Esa palabra ya está en la lista de términos bloqueados.');
      return;
    }
    updateModerationSettings({
      customBadWords: [...moderationSettings.customBadWords, word],
    });
    setNewBadWord('');
    showToast(`Palabra "${word}" añadida al filtro.`);
  };

  const handleRemoveBadWord = (word: string) => {
    updateModerationSettings({
      customBadWords: moderationSettings.customBadWords.filter(w => w !== word),
    });
  };

  // Action on reported content
  const handleTakeActionOnReport = (report: ReportItem) => {
    if (report.targetType === 'content') {
      if (confirm(`¿Deseas eliminar la publicación reportada "${report.targetTitle || report.targetId}"?`)) {
        deleteItem(report.targetId);
        resolveReport(report.id, 'action_taken', 'Publicación eliminada por el administrador.');
      }
    } else if (report.targetType === 'comment') {
      // Find which item has this comment
      let foundItemId: string | null = null;
      items.forEach(i => {
        if (i.comments.some(c => c.id === report.targetId)) {
          foundItemId = i.id;
        }
      });
      if (foundItemId) {
        deleteComment(foundItemId, report.targetId);
      }
      resolveReport(report.id, 'action_taken', 'Comentario ofensivo eliminado.');
    } else {
      resolveReport(report.id, 'action_taken', 'Medida aplicada en el canal de chat.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#091326] border border-[#1b2f56] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#16274a] bg-[#0c1830] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Panel Administrativo Bassify Hub</span>
                {isAdmin ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    ADMIN
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                    MODO VISTA
                  </span>
                )}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Base de datos, catálogo de contenidos, centro de denuncias y filtro de malas palabras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && activeTab === 'catalog' && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsUploadModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Registro</span>
              </button>
            )}
            <button
              onClick={() => setIsTableModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Catalog, Reports, Moderation & Database) */}
        <div className="flex items-center border-b border-[#152445] bg-[#081022] px-4 sm:px-6 shrink-0 gap-2 sm:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4 text-blue-400" />
            <span>Catálogo de Contenidos ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'border-rose-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-400" />
            <span>Centro de Denuncias</span>
            {pendingReportsCount > 0 ? (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {pendingReportsCount}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">({reports.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('moderation_db')}
            className={`py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'moderation_db'
                ? 'border-emerald-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Base de Datos & Filtro ####</span>
          </button>
        </div>

        {/* TAB 1: CATALOG OF CONTENT */}
        {activeTab === 'catalog' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Filters Toolbar */}
            <div className="p-3 sm:p-4 bg-[#081022] border-b border-[#152445] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* Search in table */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  placeholder="Filtrar por título, creador o género..."
                  className="w-full bg-[#0d1830] border border-[#1d3159] text-xs text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Type & Apartados segmented control */}
              <div className="flex items-center gap-1 p-1 bg-[#0d1830] border border-[#1d3159] rounded-xl self-stretch sm:self-auto overflow-x-auto scrollbar-thin">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'app', label: 'Apps' },
                  { id: 'game', label: 'Juegos' },
                  { id: 'news', label: 'Noticias' },
                  { id: 'event', label: 'Eventos' },
                  { id: 'featured', label: '⭐ Destacados' },
                  { id: 'in_development', label: '🛠 En Desarrollo' },
                  { id: 'updates', label: '🔄 Actualizaciones' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setTableFilter(f.id as any)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      tableFilter === f.id
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Data Table */}
            <div className="flex-1 overflow-auto scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#0b162c] text-slate-400 uppercase tracking-wider text-[10px] font-mono sticky top-0 z-10 border-b border-[#1b2f56]">
                  <tr>
                    <th className="py-3 px-4">Logo (512x512)</th>
                    <th className="py-3 px-4">Título & Desarrollador</th>
                    <th className="py-3 px-4">Sección & Estado</th>
                    <th className="py-3 px-4">Género</th>
                    <th className="py-3 px-4">Versión / Tamaño</th>
                    <th className="py-3 px-4">Rating / Reseñas</th>
                    <th className="py-3 px-4 text-right">Acciones Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152445] text-slate-300">
                  {filteredTableItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No se encontraron registros en la tabla.
                      </td>
                    </tr>
                  ) : (
                    filteredTableItems.map(item => (
                      <tr key={item.id} className="hover:bg-[#0f1d3b] transition-colors group">
                        {/* Logo 512x512 cell */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#20345d] bg-[#060c18] shrink-0 shadow-sm">
                              <img
                                src={item.logoUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 hidden xl:inline">
                              512x512
                            </span>
                          </div>
                        </td>

                        {/* Title & Developer */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-300 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.developer}</p>
                        </td>

                        {/* Section & Status */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-[#14264d] text-blue-300 border border-blue-900/50">
                              {item.type}
                            </span>
                            {item.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Star className="w-2.5 h-2.5 fill-amber-300" />
                                Destacado
                              </span>
                            )}
                            {item.status === 'in_development' && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-700/40">
                                <Hammer className="w-2.5 h-2.5" />
                                En Desarrollo
                              </span>
                            )}
                            {item.status === 'update' && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/40">
                                <RefreshCw className="w-2.5 h-2.5" />
                                Actualización
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Genre */}
                        <td className="py-3 px-4">
                          <span className="text-slate-300">{item.genre}</span>
                        </td>

                        {/* Version / Size */}
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {item.version} · {item.fileSize}
                        </td>

                        {/* Rating */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{item.rating}</span>
                            <span className="text-slate-500 text-[10px] font-normal">
                              ({item.comments.length} reseñas)
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleView(item)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#16274a] rounded-lg transition-colors cursor-pointer"
                              title="Ver ficha"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => toggleFeatured(item.id)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    item.isFeatured
                                      ? 'text-amber-400 hover:bg-amber-950/40'
                                      : 'text-slate-400 hover:text-amber-400 hover:bg-[#16274a]'
                                  }`}
                                  title={item.isFeatured ? 'Retirar de destacados' : 'Marcar como destacado'}
                                >
                                  <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-amber-400' : ''}`} />
                                </button>

                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/30 rounded-lg transition-colors cursor-pointer"
                                  title="Editar registro"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar registro"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CENTRO DE DENUNCIAS (REPORT SYSTEM) */}
        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/30">
              <div className="flex items-center gap-2.5">
                <Flag className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Moderación de Denuncias Comunitarias
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Denuncias enviadas por miembros sobre publicaciones, comentarios o mensajes en Discord.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-rose-300 font-bold bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-900/50">
                {pendingReportsCount} Pendientes de Revisión
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-16 bg-[#070e1c] rounded-2xl border border-[#16274a]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-white">No hay denuncias registradas</h4>
                <p className="text-xs text-slate-400 mt-1">
                  La comunidad de Bassify Hub se mantiene limpia y respetuosa.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      rep.status === 'pending'
                        ? 'bg-[#0c162e] border-rose-900/50 shadow-md'
                        : 'bg-[#081022] border-[#18294a] opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                            rep.status === 'pending'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : rep.status === 'action_taken'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {rep.status === 'pending'
                            ? 'Pendiente'
                            : rep.status === 'action_taken'
                            ? 'Medida Aplicada'
                            : 'Desestimada'}
                        </span>
                        <span className="text-xs font-bold text-blue-300">
                          {rep.reasonText}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          · {new Date(rep.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        Denunciado por: <strong className="text-slate-200">{rep.reportedByName}</strong> ({rep.reportedByEmail})
                      </span>
                    </div>

                    {/* Reported content preview */}
                    <div className="p-3 rounded-xl bg-[#060c18] border border-[#142448]">
                      <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">
                        Tipo: {rep.targetType} {rep.targetTitle ? `· En: ${rep.targetTitle}` : ''}
                      </p>
                      <p className="text-xs text-slate-200 italic">
                        "{rep.reportedContent}"
                      </p>
                      {rep.details && (
                        <p className="text-[11px] text-amber-300 mt-2 bg-amber-950/20 p-2 rounded border border-amber-900/30">
                          <strong>Detalle del denunciante:</strong> {rep.details}
                        </p>
                      )}
                      {rep.actionTakenNotes && (
                        <p className="text-[11px] text-emerald-300 mt-2">
                          ✓ {rep.actionTakenNotes}
                        </p>
                      )}
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && rep.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#16274a]">
                        <button
                          onClick={() => resolveReport(rep.id, 'dismissed', 'Desestimada por el administrador.')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#0e1932] hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Desestimar Denuncia
                        </button>

                        <button
                          onClick={() => handleTakeActionOnReport(rep)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar Elemento Denunciado</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MODERATION & DATABASE BACKUP */}
        {activeTab === 'moderation_db' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin max-w-4xl">
            
            {/* DATABASE PERSISTENCE STATUS & BACKUP */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#081022] border border-blue-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Guardado de Base de Datos Persistente
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tus juegos, apps, noticias, comentarios y denuncias se almacenan para que nunca se pierdan.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  PERSISTENCIA ACTIVA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Export Backup */}
                <div className="p-3.5 rounded-xl bg-[#0c1830] border border-[#18294a] flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-blue-400" />
                      Descargar Copia de Seguridad
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Exporta todo el catálogo ({items.length} elementos), comentarios y denuncias en formato JSON seguro.
                    </p>
                  </div>
                  <button
                    onClick={exportDatabase}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Backup JSON</span>
                  </button>
                </div>

                {/* Import Backup */}
                <div className="p-3.5 rounded-xl bg-[#0c1830] border border-[#18294a] flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      Restaurar Base de Datos
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Carga un archivo de respaldo previo para restaurar todas tus publicaciones inmediatamente.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleImportFile}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 bg-[#14264c] hover:bg-[#1a3468] text-blue-200 hover:text-white rounded-xl text-xs font-bold border border-[#234380] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Seleccionar Archivo JSON</span>
                  </button>
                </div>
              </div>
            </div>

            {/* AUTOMATIC "####" CENSORSHIP & OFFENSIVE FILTER SETTINGS */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#081022] border border-[#1b2f56] space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Filtro Automático de Malas Palabras (####)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Censura automáticamente groserías o insultos tanto en comentarios como en el chat de Discord.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {/* Switch 1: Auto Censor with #### */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#0c1830] border border-[#18294a] cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Censura Automática con "####"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Reemplaza cualquier mala palabra por '####' al guardar el comentario o mensaje.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={moderationSettings.autoCensorProfanity}
                    onChange={e => updateModerationSettings({ autoCensorProfanity: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                {/* Switch 2: Strict Blocking Mode */}
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#0c1830] border border-[#18294a] cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Bloquear Envío si Contiene Ofensas Graves
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Impide que el usuario publique el comentario o mensaje si contiene palabras prohibidas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={moderationSettings.blockOffensiveSubmission}
                    onChange={e => updateModerationSettings({ blockOffensiveSubmission: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Custom Banned Words */}
              <div className="pt-2 border-t border-[#142344]">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Añadir Palabras Prohibidas Personalizadas
                </label>
                <form onSubmit={handleAddBadWord} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBadWord}
                    onChange={e => setNewBadWord(e.target.value)}
                    placeholder="Escribe una palabra a bloquear o censurar..."
                    className="flex-1 bg-[#060c18] border border-[#1b2f56] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Añadir al Filtro
                  </button>
                </form>

                {/* Custom tags list */}
                {moderationSettings.customBadWords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {moderationSettings.customBadWords.map(w => (
                      <span
                        key={w}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-900/50 text-[11px]"
                      >
                        <span>{w}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBadWord(w)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#060c18] border border-[#142448]">
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Diccionario Base Activo:</strong> {DEFAULT_PROFANITY_LIST.length} términos de insultos, discriminación y groserías en español e inglés ya incluidos automáticamente con sustitución por <code>####</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
