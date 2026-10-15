import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Bookmark,
  Activity,
  Settings,
  ShieldCheck,
  Star,
  Download,
  Trash2,
  ExternalLink,
  MessageSquare,
  Heart,
  Save,
  Camera,
  Upload,
  Check,
  Sparkles,
  Link as LinkIcon,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContentItem } from '../types';
import { DEFAULT_FIGURE_AVATARS, DEFAULT_ADMIN_AVATAR, DEFAULT_GUEST_AVATAR } from '../utils/avatars';

export const UserProfileModal: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    currentUser,
    isAdmin,
    items,
    setSelectedItem,
    toggleBookmark,
    updateUserProfile,
    clearAllContent,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'activity' | 'bookmarks' | 'settings'>('activity');

  // Form states for account settings
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isProfileOpen) return null;

  // Bookmarked items
  const bookmarkedItems = items.filter(i => (currentUser.bookmarks || []).includes(i.id));

  // User uploaded items
  const userUploads = items.filter(i => i.authorEmail.toLowerCase() === currentUser.email.toLowerCase());

  // User comments activity
  const userComments: { item: ContentItem; comment: any }[] = [];
  items.forEach(item => {
    item.comments.forEach(c => {
      if (c.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        userComments.push({ item, comment: c });
      }
    });
  });

  // User liked items
  const likedItems = items.filter(i => i.likedBy.includes(currentUser.email));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, avatar, bio });
    showToast('¡Perfil y foto actualizados con éxito!');
  };

  const handleOpenItem = (item: ContentItem) => {
    setSelectedItem(item);
    setIsProfileOpen(false);
  };

  // Handle local image file upload (great for mobile smartphones and desktop)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('La imagen debe pesar menos de 3 MB para guardarse en el perfil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatar(result);
        showToast('Foto cargada desde tu dispositivo. Haz clic en Guardar Ajustes.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setAvatar(customUrlInput.trim());
    setShowCustomUrlInput(false);
    setCustomUrlInput('');
    showToast('URL de imagen aplicada a la vista previa.');
  };

  const handleResetToDefault = () => {
    const defaultAv = isAdmin ? DEFAULT_ADMIN_AVATAR : DEFAULT_GUEST_AVATAR;
    setAvatar(defaultAv);
    showToast('Foto restablecida a figura predeterminada.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#091326] border border-[#1b2f56] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header Profile Hero */}
        <div className="relative p-4 sm:p-6 md:p-8 bg-gradient-to-r from-[#0b1834] via-[#0e2147] to-[#081226] border-b border-[#18294a] shrink-0">
          <button
            onClick={() => setIsProfileOpen(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-10"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left pt-2 sm:pt-0">
            {/* Avatar with quick change indicator */}
            <div className="relative group shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-500/60 shadow-xl bg-[#070e1c]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#091326] bg-emerald-500 shadow-sm" />
              
              <button
                onClick={() => setActiveTab('settings')}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-5 h-5 text-blue-300" />
                <span>Cambiar</span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight break-words">
                  {currentUser.name}
                </h2>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-mono font-bold shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    ADMINISTRADOR
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                    MIEMBRO
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 font-mono mt-0.5 break-all">{currentUser.email}</p>
              <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
                {currentUser.bio || 'Sin biografía especificada.'}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-slate-400">
                <span>Miembro: <strong className="text-slate-200">{currentUser.joinedDate || 'Octubre 2026'}</strong></span>
                <span>·</span>
                <span>Guardados: <strong className="text-blue-300 font-mono">{(currentUser.bookmarks || []).length}</strong></span>
                <span>·</span>
                <span>Reseñas: <strong className="text-blue-300 font-mono">{userComments.length}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Activity, Bookmarked, Settings) */}
        <div className="flex items-center border-b border-[#18294a] bg-[#0c1830] px-4 sm:px-6 shrink-0 gap-3 sm:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 sm:py-3.5 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'activity'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Actividad</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-3 sm:py-3.5 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Guardados ({(currentUser.bookmarks || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 sm:py-3.5 flex items-center gap-1.5 sm:gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-blue-400 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Foto & Ajustes</span>
          </button>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {/* TAB 1: USER ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Admin Uploaded Content Section */}
              {isAdmin && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Tus Publicaciones en Bassify Hub ({userUploads.length})
                    </h3>
                  </div>

                  {userUploads.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-[#0b162c] border border-[#16274a] text-center text-xs text-slate-400">
                      Aún no has subido contenidos propios. Usa el botón <strong className="text-white">+ Subir Contenido</strong> de la barra lateral o del menú superior.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userUploads.map(up => (
                        <div
                          key={up.id}
                          onClick={() => handleOpenItem(up)}
                          className="p-3 rounded-xl bg-[#0b162c] border border-[#1b2f56] hover:border-blue-400 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          <img
                            src={up.logoUrl}
                            alt={up.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{up.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{up.genre} · {up.version}</p>
                          </div>
                          <span className="text-[10px] font-mono text-blue-300 bg-blue-950 px-2 py-0.5 rounded uppercase">
                            {up.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User Posted Reviews and Comments */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Reseñas y Opiniones Publicadas ({userComments.length})
                </h3>

                {userComments.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#0b162c] border border-[#16274a] text-center text-xs text-slate-500">
                    Aún no has publicado comentarios ni reseñas en ningún juego o app.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {userComments.map(({ item, comment }) => (
                      <div
                        key={comment.id}
                        className="p-3.5 rounded-xl bg-[#0b162c] border border-[#18294a] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleOpenItem(item)}
                            className="text-xs font-bold text-blue-400 hover:underline truncate max-w-sm"
                          >
                            En: {item.title}
                          </button>
                          {comment.rating && (
                            <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{comment.rating}.0</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-300">{comment.content}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{comment.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Liked Items */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" />
                  Contenidos que te gustan ({likedItems.length})
                </h3>

                {likedItems.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#0b162c] border border-[#16274a] text-center text-xs text-slate-500">
                    Aún no le has dado Me Gusta a ningún contenido.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {likedItems.map(lk => (
                      <div
                        key={lk.id}
                        onClick={() => handleOpenItem(lk)}
                        className="p-2.5 rounded-xl bg-[#0b162c] border border-[#18294a] hover:border-slate-500 cursor-pointer flex items-center gap-2.5"
                      >
                        <img
                          src={lk.logoUrl}
                          alt={lk.title}
                          className="w-8 h-8 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1 truncate">
                          <p className="text-xs font-semibold text-white truncate">{lk.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{lk.genre}</p>
                        </div>
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOKMARKED CONTENT */}
          {activeTab === 'bookmarks' && (
            <div>
              {bookmarkedItems.length === 0 ? (
                <div className="text-center py-12 px-4 bg-[#0b162c] rounded-2xl border border-[#16274a]">
                  <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">No tienes contenidos guardados</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Puedes guardar tus juegos, apps y noticias favoritos haciendo clic en el icono de marcador dentro de la ficha.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarkedItems.map(bk => (
                    <div
                      key={bk.id}
                      className="p-4 rounded-2xl bg-[#0b162c] border border-[#18294a] hover:border-blue-400 transition-colors flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={bk.logoUrl}
                          alt={bk.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-mono uppercase bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded font-bold">
                            {bk.type}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate mt-1">{bk.title}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{bk.developer}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#142344] flex items-center justify-between">
                        <button
                          onClick={() => handleOpenItem(bk)}
                          className="text-xs font-bold text-blue-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Ver Detalles</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleBookmark(bk.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Eliminar de guardados"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT & AVATAR SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              {/* SECTION: FOTO DE PERFIL (AVATAR CHANGER) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#070e1c] border border-[#1b2f56] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-blue-400" />
                      Foto de Perfil (Figuras Minimalistas & Personalizadas)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Elige una figura geométrica simple o sube una imagen desde tu celular o computadora.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[11px] text-slate-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    title="Restablecer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Restablecer</span>
                  </button>
                </div>

                {/* Live Preview & Actions Row */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-[#0b162c] border border-[#18294a]">
                  <div className="relative shrink-0">
                    <img
                      src={avatar}
                      alt="Vista previa"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-md bg-[#050b17]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border border-[#091326] text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <p className="text-xs font-semibold text-white">
                      Vista previa del avatar seleccionado
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Esta imagen representará tu usuario en el chat de Discord, comentarios y catálogo.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      {/* Hidden File Input for mobile camera / gallery upload */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#14264c] hover:bg-[#1c366d] text-blue-200 hover:text-white rounded-lg text-xs font-medium border border-[#234282] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir desde dispositivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                        className="px-3 py-1.5 bg-[#0e1b36] hover:bg-[#14264c] text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-[#1b2e56] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Usar URL</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Custom URL Input dropdown */}
                {showCustomUrlInput && (
                  <div className="p-3 rounded-xl bg-[#0b162c] border border-blue-900/40 flex items-center gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={e => setCustomUrlInput(e.target.value)}
                      placeholder="https://ejemplo.com/mi-avatar.png"
                      className="flex-1 bg-[#060c18] border border-[#1b2f56] text-xs text-white rounded-lg p-2 focus:outline-none focus:border-blue-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                )}

                {/* GRID DE FIGURAS PREDETERMINADAS (SIMPLES, NO PERSONAS REALES) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Colección de Figuras Bassify (Simples & Minimalistas)
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono font-bold">12 Figuras</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
                    {DEFAULT_FIGURE_AVATARS.map((fig) => {
                      const isSelected = avatar === fig.url;
                      return (
                        <button
                          key={fig.id}
                          type="button"
                          onClick={() => setAvatar(fig.url)}
                          className={`relative group p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-950/80 border-2 border-blue-400 ring-2 ring-blue-500/30'
                              : 'bg-[#0b162c] border border-[#18294a] hover:border-slate-500 hover:bg-[#101f3e]'
                          }`}
                        >
                          <img
                            src={fig.url}
                            alt={fig.name}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain drop-shadow"
                          />
                          <span className="text-[9px] text-slate-300 text-center truncate w-full group-hover:text-white font-medium">
                            {fig.name.split(' ')[0]}
                          </span>

                          {isSelected && (
                            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* USER BASIC DATA */}
              <div className="space-y-4">
                {/* Email (Readonly identity) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico de la Cuenta
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070e1c] border border-[#18294a] text-xs font-mono text-slate-300">
                    <span className="truncate mr-2">{currentUser.email}</span>
                    {isAdmin && (
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold shrink-0">
                        ADMIN
                      </span>
                    )}
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre de Usuario Visible *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#070e1c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Biografía / Estado
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Escribe algo sobre ti o sobre tus intereses en Bassify Hub..."
                    className="w-full bg-[#070e1c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>
              </div>

              {/* Admin Special: Clear all content if desired */}
              {isAdmin && (
                <div className="pt-2">
                  <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-red-300">Vaciar Catálogo de Contenidos</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Elimina todos los contenidos registrados para comenzar una carga desde cero.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('¿Deseas vaciar todos los contenidos registrados en Bassify Hub?')) {
                          clearAllContent();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Ajustes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
