import React, { useState } from 'react';
import { Search, Plus, TableProperties, ShieldCheck, UserCheck, Star, Menu, MessageSquare, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionType } from '../types';

export const Header: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    searchQuery,
    setSearchQuery,
    isAdmin,
    currentUser,
    setIsUploadModalOpen,
    setIsTableModalOpen,
    setIsAuthModalOpen,
    setIsProfileOpen,
    setIsMobileSidebarOpen,
    isChatSidebarOpen,
    setIsChatSidebarOpen,
    reports,
  } = useApp();

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const [isSearchExpandedMobile, setIsSearchExpandedMobile] = useState(false);

  const navItems: { id: SectionType; label: string }[] = [
    { id: 'apps', label: '1. Apps' },
    { id: 'games', label: '2. Juegos' },
    { id: 'news', label: '3. Noticias' },
    { id: 'events', label: '4. Eventos' },
    { id: 'featured', label: 'Destacados' },
  ];

  return (
    <header className="h-16 px-3 sm:px-6 border-b border-[#1b2b4d] bg-[#091326] flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-20 select-none">
      {/* Zone 1: Mobile Hamburger + Brand title Bassify Hub */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5 text-blue-400" />
        </button>

        <div
          onClick={() => setActiveSection('games')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#00439c] to-[#0070d1] flex items-center justify-center text-white shadow-sm font-bold text-xs sm:text-sm shrink-0 md:hidden">
            <span>BH</span>
          </div>
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white whitespace-nowrap">
            BASSIFY HUB
          </span>
          <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/50">
            COMUNIDAD
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Clean single-line links for Desktop) */}
      <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                isActive
                  ? 'text-white border-b-2 border-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Search Bar & Primary Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Search Input - Desktop & Tablet */}
        <div className="relative hidden xs:block w-32 sm:w-48 md:w-56 lg:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar títulos, apps..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#101e38] border border-[#1d3159] text-xs text-white placeholder-slate-400 rounded-xl pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 focus:outline-none focus:border-blue-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Mobile Search Icon Toggle (for extra tiny screens < 380px) */}
        <div className="xs:hidden">
          {isSearchExpandedMobile ? (
            <div className="fixed inset-x-0 top-0 h-16 bg-[#091326] px-4 flex items-center gap-2 z-50 border-b border-[#1b2b4d]">
              <Search className="w-4 h-4 text-blue-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar contenidos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#101e38] border border-[#1d3159] text-xs text-white placeholder-slate-400 rounded-lg px-3 py-2 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchExpandedMobile(false)}
                className="p-1.5 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchExpandedMobile(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#101e38]"
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ADMIN ACTIONS: STRICTLY HIDDEN FOR NORMAL USERS */}
        {isAdmin && (
          <>
            {/* Admin Table Button (Desktop / Tablet) */}
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#142344] text-slate-200 border border-[#223a6b] hover:bg-[#1a2f5c] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Ver tabla de información y denuncias"
            >
              <TableProperties className="w-3.5 h-3.5 text-blue-400" />
              <span>Tabla Admin</span>
              {pendingReportsCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {pendingReportsCount}
                </span>
              )}
            </button>

            {/* Admin Upload Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-[#00439c] text-white hover:bg-[#0052bd] active:scale-95 transition-all shadow-sm shadow-blue-900/50 whitespace-nowrap shrink-0 cursor-pointer"
              title="Subir contenido oficial"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+ Subir</span>
            </button>
          </>
        )}

        {/* Live Chat Toggle Shortcut */}
        <button
          onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
          className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
            isChatSidebarOpen ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-[#142344]'
          }`}
          title="Chat comunitario"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* User Identity / Profile Button */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#0e1b34] hover:bg-[#152549] border border-[#1b2f57] text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
          title="Ver perfil o cambiar foto"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg object-cover border border-blue-400/50 bg-[#070e1c]"
              referrerPolicy="no-referrer"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#091326] ${
                isAdmin ? 'bg-blue-400' : 'bg-emerald-500'
              }`}
            />
          </div>
          <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
            {currentUser.name}
          </span>
          {isAdmin ? (
            <span className="hidden md:inline-block text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono font-bold">
              ADMIN
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
};
