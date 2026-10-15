import React from 'react';
import {
  Gamepad2,
  Smartphone,
  Newspaper,
  Calendar,
  Star,
  Hammer,
  RefreshCw,
  Hash,
  Volume2,
  ShieldCheck,
  User,
  PlusCircle,
  TableProperties,
  MessageSquare,
  Bookmark,
  UserCheck,
  X,
  Lock,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionType } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    activeChannel,
    setActiveChannel,
    channels,
    currentUser,
    isAdmin,
    isGuest,
    logout,
    setIsUploadModalOpen,
    setIsTableModalOpen,
    setIsAuthModalOpen,
    setIsProfileOpen,
    isChatSidebarOpen,
    setIsChatSidebarOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    items,
    reports,
  } = useApp();

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  const handleSelectSection = (sectionId: SectionType) => {
    setActiveSection(sectionId);
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
  };

  const handleSelectChannel = (channelId: string) => {
    setActiveChannel(channelId);
    setIsChatSidebarOpen(true);
    if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
  };

  const mainSections: { id: SectionType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'apps',
      label: 'Apps',
      icon: <Smartphone className="w-4 h-4" />,
      count: items.filter(i => i.type === 'app').length,
    },
    {
      id: 'games',
      label: 'Juegos',
      icon: <Gamepad2 className="w-4 h-4" />,
      count: items.filter(i => i.type === 'game').length,
    },
    {
      id: 'news',
      label: 'Noticias',
      icon: <Newspaper className="w-4 h-4" />,
      count: items.filter(i => i.type === 'news').length,
    },
    {
      id: 'events',
      label: 'Eventos',
      icon: <Calendar className="w-4 h-4" />,
      count: items.filter(i => i.type === 'event').length,
    },
  ];

  const curatedSections: { id: SectionType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'featured',
      label: 'Destacados',
      icon: <Star className="w-4 h-4 text-amber-400" />,
      count: items.filter(i => i.isFeatured).length,
    },
    {
      id: 'in_development',
      label: 'En Desarrollo',
      icon: <Hammer className="w-4 h-4 text-sky-400" />,
      count: items.filter(i => i.status === 'in_development').length,
    },
    {
      id: 'updates',
      label: 'Actualizaciones',
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
      count: items.filter(i => i.status === 'update').length,
    },
  ];

  const sidebarContent = (isMobileView: boolean) => (
    <div className="flex flex-col h-full select-none text-slate-300">
      {/* Top Header - Bassify Hub Title */}
      <div className="h-16 px-4 border-b border-[#152445] flex items-center justify-between bg-[#0b162c] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00439c] to-[#0070d1] flex items-center justify-center text-white shadow-md shadow-blue-900/30 font-bold text-sm">
            <span className="tracking-tighter">BH</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              Bassify Hub
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">HUB</span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate">Comunidad & Tienda</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Chat Open Toggle */}
          <button
            onClick={() => {
              setIsChatSidebarOpen(!isChatSidebarOpen);
              if (isMobileView) setIsMobileSidebarOpen(false);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isChatSidebarOpen ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Abrir chat en vivo"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Close button on mobile drawer */}
          {isMobileView && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin">
        {/* USER PROFILE SHORTCUT BUTTON */}
        <div className="px-0.5">
          <button
            onClick={() => {
              setIsProfileOpen(true);
              if (isMobileView) setIsMobileSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#0d1c3a] border border-[#1b3260] text-blue-200 hover:bg-[#132854] hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-lg object-cover border border-blue-400/50 shrink-0"
              />
              <span className="truncate">Mi Perfil & Actividad</span>
            </div>
            {(currentUser.bookmarks || []).length > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1 shrink-0 ml-1">
                <Bookmark className="w-2.5 h-2.5" />
                {(currentUser.bookmarks || []).length}
              </span>
            )}
          </button>
        </div>

        {/* 4 MAIN SECTIONS */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <span>Secciones Principales</span>
          </div>
          <nav className="space-y-0.5">
            {mainSections.map(section => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSelectSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00439c] text-white shadow-md shadow-blue-950/50 font-semibold'
                      : 'text-slate-300 hover:bg-[#101e38] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-blue-400'}>{section.icon}</span>
                    <span>{section.label}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 font-mono rounded-md ${
                      isActive ? 'bg-white/20 text-white font-bold' : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {section.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* NUEVOS APARTADOS: Destacados, En Desarrollo, Actualizaciones */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <span>Apartados Especiales</span>
          </div>
          <nav className="space-y-0.5">
            {curatedSections.map(section => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSelectSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0e244d] text-white border border-blue-500/40 shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-[#101e38] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </div>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 font-mono rounded ${
                      isActive ? 'bg-blue-600/30 text-blue-200' : 'bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    {section.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ADMIN ACTION PANEL - STRICTLY VISIBLE ONLY FOR ADMIN (grupobassify@gmail.com) */}
        {isAdmin && (
          <div className="bg-[#0b162c] border border-blue-900/50 rounded-2xl p-3 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Gestión Admin
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                Activo
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
              Panel exclusivo de <strong className="text-white font-mono">grupobassify@gmail.com</strong>.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsUploadModalOpen(true);
                  if (isMobileView) setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-[#0051ba] text-white hover:from-blue-500 hover:to-blue-600 transition-all shadow-md shadow-blue-900/40 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Subir Nuevo Contenido
              </button>

              <button
                onClick={() => {
                  setIsTableModalOpen(true);
                  if (isMobileView) setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[#142344] text-blue-200 hover:bg-[#1a2e59] hover:text-white transition-all border border-blue-900/40 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TableProperties className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tabla & Denuncias</span>
                </div>
                {pendingReportsCount > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {pendingReportsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* DISCORD TEXT CHANNELS */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <span>Canales de Texto</span>
          </div>
          <div className="space-y-0.5">
            {channels
              .filter(c => c.type === 'text')
              .map(channel => {
                const isActive = activeChannel === channel.id;
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannel(channel.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#152445] text-white font-semibold'
                        : 'text-slate-400 hover:bg-[#0e1933] hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{channel.name}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* DISCORD VOICE CHANNELS */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <span>Canales de Voz</span>
          </div>
          <div className="space-y-0.5">
            {channels
              .filter(c => c.type === 'voice')
              .map(channel => (
                <div
                  key={channel.id}
                  onClick={() => handleSelectChannel(channel.id)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-400 hover:bg-[#0e1933] hover:text-slate-200 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                  <span className="text-[10px] text-blue-400/80 font-mono font-medium">Conectar</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* User Status Bar at the bottom (Click opens User Profile modal) */}
      <div className="p-2.5 border-t border-[#152445] bg-[#070e1c] flex items-center justify-between shrink-0">
        <div
          onClick={() => {
            setIsProfileOpen(true);
            if (isMobileView) setIsMobileSidebarOpen(false);
          }}
          className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-xl hover:bg-[#13203c] cursor-pointer transition-colors"
          title="Ver mi perfil de usuario, actividad y guardados"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover border border-blue-500/50 bg-[#0b162c]"
              referrerPolicy="no-referrer"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#070e1c] ${
                isAdmin ? 'bg-blue-400' : 'bg-emerald-500'
              }`}
            />
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white truncate">{currentUser.name}</span>
              {isAdmin && (
                <span className="text-[9px] bg-[#00439c] text-white px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate font-mono">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          {isGuest ? (
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                if (isMobileView) setIsMobileSidebarOpen(false);
              }}
              className="px-2.5 py-1.5 bg-[#00439c] hover:bg-blue-600 text-white rounded-xl text-[11px] font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
              title="Iniciar sesión"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  if (isMobileView) setIsMobileSidebarOpen(false);
                }}
                className="p-2 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Cambiar cuenta o iniciar sesión"
              >
                <UserCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  logout();
                  if (isMobileView) setIsMobileSidebarOpen(false);
                }}
                className="p-2 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Cerrar sesión (volver a Invitado)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on md and above) */}
      <aside className="w-72 bg-[#081022] border-r border-[#152445] flex flex-col h-screen shrink-0 select-none text-slate-300 hidden md:flex">
        {sidebarContent(false)}
      </aside>

      {/* MOBILE DRAWER OVERLAY & SIDEBAR (Visible on small screens when triggered) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer Container */}
          <aside className="relative w-72 xs:w-80 max-w-[85vw] bg-[#081022] border-r border-[#152445] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
