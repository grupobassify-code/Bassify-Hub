import React from 'react';
import {
  Gamepad2,
  Smartphone,
  Newspaper,
  Calendar,
  User,
  MessageSquare,
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
import { Toast } from './components/Toast';
import { SectionType } from './types';

const AppLayout: React.FC = () => {
  const {
    selectedItem,
    setSelectedItem,
    activeSection,
    setActiveSection,
    setIsProfileOpen,
    currentUser,
  } = useApp();

  const mobileNavItems: { id: SectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'games', label: 'Juegos', icon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'apps', label: 'Apps', icon: <Smartphone className="w-5 h-5" /> },
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
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-md object-cover bg-[#070e1c]"
                referrerPolicy="no-referrer"
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

      {/* Action Notifications */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
