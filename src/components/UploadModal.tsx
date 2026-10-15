import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemType, ItemStatus } from '../types';
import { ADMIN_EMAIL } from '../data/initialData';
import { BUNDLED_IMAGES, CONTENT_IMAGE_PRESETS, getSafeImageUrl } from '../utils/images';
import { SafeImage } from './SafeImage';

export const UploadModal: React.FC = () => {
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    editingItem,
    setEditingItem,
    isAdmin,
    currentUser,
    setIsAuthModalOpen,
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

  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

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
      setLogoUrl(getSafeImageUrl(editingItem.logoUrl, editingItem.type, editingItem.title));
      setBannerUrl(getSafeImageUrl(editingItem.bannerUrl, editingItem.type, editingItem.title));
      setDownloadUrl(editingItem.downloadUrl);
      setFileSize(editingItem.fileSize);
      setVersion(editingItem.version);
      setEventDate(editingItem.eventDate || '');
      setEventLocation(editingItem.eventLocation || '');
      setScreenshots((editingItem.screenshots || []).map(s => getSafeImageUrl(s, editingItem.type, editingItem.title)));
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
      setLogoUrl(BUNDLED_IMAGES.soundwave);
      setBannerUrl(BUNDLED_IMAGES.odyssey);
      setDownloadUrl('https://bassify.hub/downloads');
      setFileSize('2.5 GB');
      setVersion('v1.0.0');
      setEventDate('');
      setEventLocation('');
      setScreenshots([BUNDLED_IMAGES.odyssey, BUNDLED_IMAGES.cyberKart]);
    }
  }, [editingItem, isUploadModalOpen]);

  if (!isUploadModalOpen) return null;

  const handleClose = () => {
    setIsUploadModalOpen(false);
    setEditingItem(null);
  };

  // Direct local file upload for Logo (PC or Mobile)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona una imagen válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen debe pesar menos de 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setLogoUrl(ev.target.result as string);
        showToast('¡Logo cargado exitosamente!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct local file upload for Banner (PC or Mobile)
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona una imagen válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen debe pesar menos de 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        setBannerUrl(ev.target.result as string);
        showToast('¡Banner horizontal cargado exitosamente!');
      }
    };
    reader.readAsDataURL(file);
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
      showToast('Solo grupobassify@gmail.com con contraseña verificada puede publicar.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      showToast('Por favor completa el título y la descripción del contenido.');
      return;
    }

    const finalLogo = logoUrl.trim() || BUNDLED_IMAGES.soundwave;
    const finalBanner = bannerUrl.trim() || finalLogo;

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
      logoUrl: finalLogo,
      bannerUrl: finalBanner,
      screenshots: screenshots.length > 0 ? screenshots : [finalBanner],
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
              Actualmente estás como <span className="font-mono text-white bg-slate-800 px-1 py-0.5 rounded">{currentUser.email}</span>.
              Únicamente el administrador oficial verificado con contraseña en <strong className="font-mono text-blue-400">grupobassify@gmail.com</strong> puede publicar contenidos en Bassify Hub.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleClose();
                  setIsAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00439c] text-white hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                <span>Ingresar con Contraseña de grupobassify@gmail.com</span>
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
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
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

            {/* ESTADO Y DESTACADO */}
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

            {/* 2. DATOS BÁSICOS */}
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

            {/* 3. LOGO 512x512 PIXELES (Upload o Presets) */}
            <div className="p-4 rounded-2xl bg-[#0b162c] border border-[#1b2e56] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    Logo del Contenido (512 x 512 px) *
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Sube desde tu dispositivo o selecciona un preset online
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                  512×512 px (1:1)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-dashed border-blue-500/50 bg-[#060c18] shrink-0 flex items-center justify-center shadow-inner">
                  <SafeImage
                    src={logoUrl}
                    fallbackTitle={title || 'Logo'}
                    itemType={type}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black/80 text-white font-mono px-1 rounded">
                    512×512
                  </span>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      placeholder="URL de la imagen del Logo..."
                      className="flex-1 bg-[#081022] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 font-mono"
                    />

                    {/* Local File Upload Button */}
                    <input
                      type="file"
                      ref={logoFileRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Subir Foto</span>
                    </button>
                  </div>

                  {/* Preset Quick Selectors */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400">Presets online listos:</span>
                    {CONTENT_IMAGE_PRESETS.slice(0, 4).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLogoUrl(preset.logoUrl);
                          if (!bannerUrl || bannerUrl === BUNDLED_IMAGES.odyssey) {
                            setBannerUrl(preset.bannerUrl);
                          }
                        }}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Banner Horizontal (16:9)
                  </label>
                  <button
                    type="button"
                    onClick={() => bannerFileRef.current?.click()}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Subir de PC/Móvil</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={bannerFileRef}
                  onChange={handleBannerUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  placeholder="URL del Banner 16:9 o sube tu archivo..."
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
                  Tamaño de Descarga
                </label>
                <input
                  type="text"
                  value={fileSize}
                  onChange={e => setFileSize(e.target.value)}
                  placeholder="Ej. 1.2 GB, 250 MB..."
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
                  placeholder="Ej. v1.0.0, v2.3.1..."
                  className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Si es evento */}
            {type === 'event' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-blue-950/30 border border-blue-900/50">
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full bg-[#081022] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-300 mb-1">
                    Lugar o Canal
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                    placeholder="Ej. Servidor Discord #voz-chill, Madrid Arena..."
                    className="w-full bg-[#081022] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            )}

            {/* 6. DESCRIPCIONES */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción Corta (Vista previa en tarjeta)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="Una frase llamativa de resumen..."
                className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descripción Completa (Página de Detalle) *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe todas las características, historia, requisitos..."
                className="w-full bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            {/* 7. CAPTURAS DE PANTALLA */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Capturas de Pantalla (Screenshots)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={screenshotInput}
                  onChange={e => setScreenshotInput(e.target.value)}
                  placeholder="URL de la captura de pantalla..."
                  className="flex-1 bg-[#0b162c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddScreenshot}
                  className="px-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir</span>
                </button>
              </div>

              {screenshots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {screenshots.map((url, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-700">
                      <SafeImage
                        src={url}
                        alt={`Captura ${i + 1}`}
                        itemType={type}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(i)}
                        className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#16274a]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#00439c] hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{editingItem ? 'Guardar Cambios' : 'Publicar en Bassify Hub'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
