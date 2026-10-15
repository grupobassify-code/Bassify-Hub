import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  Star,
  Hammer,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemType, ItemStatus } from '../types';
import { ADMIN_EMAIL } from '../data/initialData';

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    editingItem,
    setEditingItem,
    isAdmin,
    currentUser,
    loginAs,
    addItem,
    updateItem,
    showToast,
  } = useApp();

  // Form states
  const [type, setType] = useState<ItemType>('game');
  const [status, setStatus] = useState<ItemStatus>('published');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [title, setTitle] = useState('');
  const [developer, setDeveloper] = useState('');
  const [genre, setGenre] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [version, setVersion] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [screenshotInput, setScreenshotInput] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);

  // Presets for quick 512x512 logo icons & banners
  const logoPresets = [
    { label: 'Bassify Sound Icon', url: '/src/assets/images/ps_app_soundwave_studio_1792032421478.jpg' },
    { label: 'Aetheria RPG Banner', url: '/src/assets/images/ps_game_scifi_odyssey_1792032420390.jpg' },
    { label: 'CyberKart Drift', url: '/src/assets/images/ps_game_cyber_kart_1792032422740.jpg' },
    { label: 'Bassify Arena Event', url: '/src/assets/images/ps_news_playstation_event_1792032422581.jpg' },
  ];

  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type);
      setStatus(editingItem.status || 'published');
      setIsFeatured(!!editingItem.isFeatured);
      setUpdateNotes(editingItem.updateNotes || '');
      setTitle(editingItem.title);
      setDeveloper(editingItem.developer);
      setGenre(editingItem.genre);
      setShortDescription(editingItem.shortDescription);
      setDescription(editingItem.description);
      setLogoUrl(editingItem.logoUrl);
      setBannerUrl(editingItem.bannerUrl);
      setDownloadUrl(editingItem.downloadUrl);
      setFileSize(editingItem.fileSize);
      setVersion(editingItem.version);
      setEventDate(editingItem.eventDate || '');
      setEventLocation(editingItem.eventLocation || '');
      setScreenshots(editingItem.screenshots || []);
    } else {
      setType('game');
      setStatus('published');
      setIsFeatured(false);
      setUpdateNotes('');
      setTitle('');
      setDeveloper('Bassify Studios');
      setGenre('Acción');
      setShortDescription('');
      setDescription('');
      setLogoUrl('/src/assets/images/ps_app_soundwave_studio_1792032421478.jpg');
      setBannerUrl('/src/assets/images/ps_game_scifi_odyssey_1792032420390.jpg');
      setDownloadUrl('https://bassify.hub/downloads');
      setFileSize('2.5 GB');
      setVersion('v1.0.0');
      setEventDate('');
      setEventLocation('');
      setScreenshots([
        '/src/assets/images/ps_game_scifi_odyssey_1792032420390.jpg',
        '/src/assets/images/ps_game_cyber_kart_1792032422740.jpg',
      ]);
    }
  }, [editingItem, isUploadModalOpen]);

  if (!isUploadModalOpen) return null;

  const handleClose = () => {
    setIsUploadModalOpen(false);
    setEditingItem(null);
  };

  const handleAddScreenshot = () => {
    if (screenshotInput.trim()) {
      setScreenshots(prev => [...prev, screenshotInput.trim()]);
      setScreenshotInput('');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      showToast('Solo grupobassify@gmail.com tiene permisos de publicación.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      showToast('Por favor completa el título y la descripción del contenido.');
      return;
    }

    const itemData = {
      type,
      status,
      isFeatured,
      updateNotes: status === 'update' ? updateNotes.trim() : undefined,
      title: title.trim(),
      developer: developer.trim() || 'Bassify Community',
      genre: genre.trim() || 'General',
      shortDescription: shortDescription.trim() || title.trim(),
      description: description.trim(),
      logoUrl: logoUrl.trim() || '/src/assets/images/ps_app_soundwave_studio_1792032421478.jpg',
      bannerUrl: bannerUrl.trim() || logoUrl.trim(),
      screenshots: screenshots.length > 0 ? screenshots : [bannerUrl || logoUrl],
      downloadUrl: downloadUrl.trim() || '#',
      fileSize: fileSize.trim() || '100 MB',
      version: version.trim() || 'v1.0.0',
      rating: 5.0,
      reviewCount: 1,
      downloadsCount: '1.000+',
      releaseDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      eventDate: type === 'event' ? eventDate : undefined,
      eventLocation: type === 'event' ? eventLocation : undefined,
      authorEmail: ADMIN_EMAIL,
      isOfficialBassify: true,
    };

    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#091326] border border-[#1b2f56] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#16274a] bg-[#0c1830] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {editingItem ? 'Editar Contenido Publicado' : 'Subir Nuevo Contenido — Bassify Hub'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-xs sm:max-w-none">
                Logo 512x512, capturas de pantalla, estado y destacados
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Admin Authorization Barrier Notice */}
        {!isAdmin ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Acceso Restringido a la Administración</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Actualmente has iniciado sesión como <span className="font-mono text-white bg-slate-800 px-1 py-0.5 rounded">{currentUser.email}</span>.
              Únicamente el correo <span className="font-mono font-bold text-blue-400">grupobassify@gmail.com</span> tiene permisos para publicar contenidos en Bassify Hub.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => loginAs(ADMIN_EMAIL, 'Bassify Admin')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00439c] text-white hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                <span>Iniciar Sesión como grupobassify@gmail.com</span>
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          /* Form for Authorized Admin (grupobassify@gmail.com) */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            {/* Admin Badge Confirmation */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Autenticado como Administrador: <strong className="text-white font-mono">{ADMIN_EMAIL}</strong>
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                PERMISOS ACTIVOS
              </span>
            </div>

            {/* 1. SECCIÓN / TIPO DE CONTENIDO */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                1. Selecciona la Sección Principal *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'app', label: '1 - Apps', desc: 'Utilidades / Softwares' },
                  { id: 'game', label: '2 - Juegos', desc: 'Juegos completos' },
                  { id: 'news', label: '3 - Noticias', desc: 'Comunicados y notas' },
                  { id: 'event', label: '4 - Eventos', desc: 'Torneos y directos' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id as ItemType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      type === opt.id
                        ? 'bg-[#00439c] border-blue-400 text-white shadow-md'
                        : 'bg-[#0b162c] border-[#18294c] text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <p className="text-xs font-bold leading-none">{opt.label}</p>
                    <p className="text-[10px] mt-1 opacity-80">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* NUEVO: ESTADO Y DESTACADO (Admin Choice) */}
            <div className="p-4 rounded-2xl bg-[#0b162c] border border-blue-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Apartados Especiales & Clasificación de Estado
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Marca si este contenido va a Destacados, En Desarrollo o Actualizaciones
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'published', label: 'Lanzamiento Completo', desc: 'Disponible y estable', icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> },
                  { id: 'in_development', label: 'En Desarrollo', desc: 'Fase Alpha/Beta/WIP', icon: <Hammer className="w-3.5 h-3.5 text-sky-400" /> },
                  { id: 'update', label: 'Actualización / Parche', desc: 'Mejoras y nuevas funciones', icon: <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> },
                ].map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as ItemStatus)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      status === st.id
                        ? 'bg-[#122449] border-blue-400 text-white'
                        : 'bg-[#081022] border-[#1b2d54] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {st.icon}
                      <span>{st.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{st.desc}</p>
                  </button>
                ))}
              </div>

              {/* Destacado Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-[#16274a]">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-bold text-white">Marcar como Contenido Destacado</span>
                    <p className="text-[10px] text-slate-400">Aparecerá en el apartado de Destacados del Admin</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              {/* Si es actualización, notas de parche */}
              {status === 'update' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Notas de la Actualización (Changelog)
                  </label>
                  <input
                    type="text"
                    value={updateNotes}
                    onChange={e => setUpdateNotes(e.target.value)}
                    placeholder="Ej. Soporte para 60 FPS, corrección de bugs, nueva interfaz..."
                    className="w-full bg-[#081022] border border-emerald-900/50 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}
            </div>

            {/* 2. DATOS BÁSICOS: Título, Desarrollador, Género */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título / Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. Aetheria, SoundWave Studio..."
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Desarrollador / Estudio
                </label>
                <input
                  type="text"
                  value={developer}
                  onChange={e => setDeveloper(e.target.value)}
                  placeholder="Ej. Bassify Studios"
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Género / Categoría *
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  placeholder="Ej. RPG, Carreras, Utilidad, Audio"
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* 3. LOGO 512x512 PIXELES */}
            <div className="p-4 rounded-2xl bg-[#0b162c] border border-[#1b2e56] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    Logo del Contenido (512 x 512 píxeles) *
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Estándar Google Play Store para ícono de alta resolución
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                  512×512 px (1:1)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* 512x512 Visual Preview Box */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-dashed border-blue-500/50 bg-[#060c18] shrink-0 flex items-center justify-center shadow-inner">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Preview Logo 512x512"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-500 text-center px-1">Sin imagen</span>
                  )}
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black/80 text-white font-mono px-1 rounded">
                    512×512
                  </span>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="URL de la imagen del Logo (512x512)..."
                    className="w-full bg-[#081022] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 font-mono"
                  />

                  {/* Preset Quick Selectors */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400">Presets disponibles:</span>
                    {logoPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLogoUrl(preset.url)}
                        className="text-[10px] bg-[#142344] hover:bg-[#1b2f5c] text-blue-200 px-2 py-0.5 rounded transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. BANNER HORIZONTAL (16:9) & LINK DE DESCARGA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Banner / Portada Horizontal (16:9)
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="URL del Banner 16:9..."
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link de Descarga / Web Oficial *
                </label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={e => setDownloadUrl(e.target.value)}
                  placeholder="https://bassify.hub/..."
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
            </div>

            {/* 5. TAMAÑO, VERSIÓN Y EVENTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tamaño del archivo (MB / GB)
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={e => setFileSize(e.target.value)}
                  placeholder="Ej. 180 MB o 4.8 GB"
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Versión
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="Ej. v1.2.0"
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {type === 'event' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-950/30 rounded-xl border border-blue-900/40">
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    placeholder="Ej. 28 de Octubre, 2026 - 19:00 UTC"
                    className="w-full bg-[#081022] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-1">
                    Lugar / Sala de Transmisión
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                    placeholder="Ej. Canal de Voz Discord Bassify Hub"
                    className="w-full bg-[#081022] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            )}

            {/* 6. GALERÍA DE CAPTURAS */}
            <div className="p-4 rounded-2xl bg-[#0b162c] border border-[#1b2e56] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Galería de Capturas de Pantalla (Screenshots)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Añade URLs de capturas para la ficha de la tienda
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">{screenshots.length} añadidas</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={screenshotInput}
                  onChange={e => setScreenshotInput(e.target.value)}
                  placeholder="https://... URL de captura"
                  className="flex-1 bg-[#081022] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddScreenshot}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>

              {screenshots.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                  {screenshots.map((shot, idx) => (
                    <div
                      key={idx}
                      className="relative w-28 h-16 rounded-lg overflow-hidden border border-[#1b2d52] shrink-0 group"
                    >
                      <img
                        src={shot}
                        alt={`Screenshot ${idx}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar captura"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. DESCRIPCIONES */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción Corta (Slogan / Resumen)
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="Una línea concisa sobre este juego o app..."
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción Completa (Estilo Google Play Store) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explica detalladamente las características principales, modos de juego, requisitos y novedades..."
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-3 focus:outline-none focus:border-blue-400 leading-relaxed"
                />
              </div>
            </div>

            {/* Footer Form CTAs */}
            <div className="pt-4 border-t border-[#16274a] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-[#00439c] text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-900/40 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{editingItem ? 'Guardar Cambios' : 'Publicar Contenido en Bassify Hub'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
