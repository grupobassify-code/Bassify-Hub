import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import {
  Gamepad2,
  Smartphone,
  Newspaper,
  Calendar,
  User,
  MessageSquare,
  Music,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { PlayStoreDetailModal } from './components/PlayStoreDetailModal';
import { UploadModal } from './components/UploadModal';
import { AdminTableModal } from './components/AdminTableModal';
import { DiscordChatPanel } from './components/DiscordChatPanel';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { LinkEditModal } from './components/LinkEditModal';
import { CreateAlbumModal } from './components/CreateAlbumModal';
import { CreateSongModal } from './components/CreateSongModal';
import { Toast } from './components/Toast';
import { SectionType } from './types';
import { audio } from './utils/audioSystem';
import { SafeImage } from './components/SafeImage';

const AppLayout: React.FC = () => {
  const {
    selectedItem,
    setSelectedItem,
    activeSection,
    setActiveSection,
    setIsProfileOpen,
    currentUser,
  } = useApp();

  useEffect(() => {
    // Start background soundtrack automatically when the web opens
    audio.startMusic().catch(() => {});

    const handleInitialInteraction = () => {
      audio.startMusic().catch(() => {});
    };

    window.addEventListener('pointerdown', handleInitialInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInitialInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleInitialInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleInitialInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleInitialInteraction);
      window.removeEventListener('click', handleInitialInteraction);
      window.removeEventListener('keydown', handleInitialInteraction);
      window.removeEventListener('touchstart', handleInitialInteraction);
    };
  }, []);

  const mobileNavItems: { id: SectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'games', label: 'Juegos', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'apps', label: 'Apps', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'music', label: 'Música', icon: <Music className="w-5 h-5" /> },
    { id: 'news', label: 'Noticias', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'events', label: 'Eventos', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070e1c] font-sans antialiased text-slate-100">
      {/* Discord Style Left Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <Sidebar />

      {/* Main Center Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Header />
        <MainContent />

        {/* MOBILE BOTTOM NAVIGATION BAR (Strictly for mobile phones < md) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[#091326]/95 backdrop-blur-md border-t border-[#182848] px-2 flex items-center justify-around z-30 select-none shadow-2xl">
          {mobileNavItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
                  isActive
                    ? 'text-blue-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-600/20' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* Profile Shortcut Button with User Figure Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <div className="p-0.5 rounded-lg border border-blue-500/50">
              <SafeImage
                src={currentUser.avatar}
                alt={currentUser.name}
                fallbackTitle={currentUser.name}
                itemType="avatar"
                className="w-5 h-5 rounded-md object-cover bg-[#070e1c]"
              />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Perfil</span>
          </button>
        </nav>
      </div>

      {/* Discord Live Social Chat Panel */}
      <DiscordChatPanel />

      {/* Google Play Store Style Detail View Modal */}
      {selectedItem && (
        <PlayStoreDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Content Upload / Edit Form Modal (512x512 logo, screenshots, PlayStore metadata) */}
      <UploadModal />

      {/* Admin Content Information Table Modal */}
      <AdminTableModal />

      {/* User Profile Modal (Activity, Bookmarks, Avatar Changing, Settings) */}
      <UserProfileModal />

      {/* User Login & Admin Authorization Modal */}
      <AuthModal />

      {/* Community Report Modal for Offensive Content / Bad Words */}
      <ReportModal />

      {/* Admin Quick Game Link Editor Modal */}
      <LinkEditModal />

      {/* Admin Spotify-style Album Creator Modal (512x512 artwork) */}
      <CreateAlbumModal />

      {/* Admin MP3 Track Creator Modal (Independent 512x512 cover + Album Selector) */}
      <CreateSongModal />

      {/* Action Notifications */}
      <Toast />
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error inesperado en la interfaz.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Bassify UI ErrorBoundary:', error, info);
  }

  handleRecover = () => {
    try {
      // Clear potentially oversized local cache keys while preserving user session
      localStorage.removeItem('bassify_hub_items_v1');
      localStorage.removeItem('bassify_hub_albums_v1');
      localStorage.removeItem('bassify_hub_songs_v1');
    } catch {
      // ignore storage errors
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#070e1c] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0b162c] border border-[#1d3461] rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Algo salió mal al actualizar la vista</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tus publicaciones guardadas en el servidor siguen intactas. Haz clic en recuperar para sincronizar y recargar la página.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-rose-300 bg-rose-950/40 border border-rose-900/40 rounded-lg p-2 break-words">
                {this.state.errorMessage}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleRecover}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recuperar y Recargar Bassify Hub</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
