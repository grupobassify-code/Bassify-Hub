import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ContentItem,
  SectionType,
  UserProfile,
  ChatMessage,
  DiscordChannel,
  ItemType,
  CommentItem,
  ReportItem,
  ReportReason,
  ModerationSettings,
} from '../types';
import {
  ADMIN_EMAIL,
  DEFAULT_ADMIN_USER,
  DEFAULT_GUEST_USER,
  INITIAL_CONTENT,
  CHANNELS,
  INITIAL_CHAT_MESSAGES,
} from '../data/initialData';
import { DEFAULT_ADMIN_AVATAR, DEFAULT_GUEST_AVATAR } from '../utils/avatars';
import { censorProfanity } from '../utils/moderation';

interface ReportingTarget {
  type: 'content' | 'comment' | 'chat';
  id: string;
  title?: string;
  content: string;
  authorEmail?: string;
}

interface AppContextType {
  currentUser: UserProfile;
  isAdmin: boolean;
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
  activeChannel: string;
  setActiveChannel: (channelId: string) => void;
  items: ContentItem[];
  filteredItems: ContentItem[];
  selectedItem: ContentItem | null;
  setSelectedItem: (item: ContentItem | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  sortBy: 'recent' | 'rating' | 'popular';
  setSortBy: (sort: 'recent' | 'rating' | 'popular') => void;

  // Modals & Navigation
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isTableModalOpen: boolean;
  setIsTableModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  editingItem: ContentItem | null;
  setEditingItem: (item: ContentItem | null) => void;
  isChatSidebarOpen: boolean;
  setIsChatSidebarOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Profile & Bookmarks
  toggleBookmark: (itemId: string) => void;
  isBookmarked: (itemId: string) => boolean;
  updateUserProfile: (settings: { name?: string; avatar?: string; bio?: string }) => void;
  clearAllContent: () => void;

  // Actions
  loginAs: (email: string, name?: string) => void;
  logout: () => void;
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'comments' | 'likes' | 'likedBy'>) => void;
  updateItem: (id: string, updated: Partial<ContentItem>) => void;
  deleteItem: (id: string) => void;
  toggleLikeItem: (id: string) => void;
  toggleFeatured: (id: string) => void;
  addComment: (itemId: string, content: string, rating?: number) => void;
  deleteComment: (itemId: string, commentId: string) => void;
  likeComment: (itemId: string, commentId: string) => void;

  // Discord Chat
  channels: DiscordChannel[];
  chatMessages: ChatMessage[];
  sendMessage: (channelId: string, content: string) => void;

  // Reports & Moderation
  reportingTarget: ReportingTarget | null;
  setReportingTarget: (target: ReportingTarget | null) => void;
  reports: ReportItem[];
  submitReport: (report: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => void;
  resolveReport: (id: string, status: 'dismissed' | 'action_taken', notes?: string) => void;
  moderationSettings: ModerationSettings;
  updateModerationSettings: (newSettings: Partial<ModerationSettings>) => void;

  // Database Backup / Restore
  exportDatabase: () => void;
  importDatabase: (jsonData: any) => Promise<boolean>;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys for local caching
const STORAGE_KEY_CONTENT = 'bassify_hub_content_v6_db';
const STORAGE_KEY_USER = 'bassify_hub_user_v6';
const STORAGE_KEY_CHAT = 'bassify_hub_chat_v6';
const STORAGE_KEY_REPORTS = 'bassify_hub_reports_v6';
const STORAGE_KEY_MODERATION = 'bassify_hub_moderation_v6';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state (defaults to Admin grupobassify@gmail.com)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.avatar || parsed.avatar.includes('unsplash') || parsed.avatar.includes('photo-')) {
          parsed.avatar = parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
            ? DEFAULT_ADMIN_AVATAR
            : DEFAULT_GUEST_AVATAR;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ADMIN_USER;
  });

  const isAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [activeSection, setActiveSection] = useState<SectionType>('games');
  const [activeChannel, setActiveChannel] = useState<string>('anuncios');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'popular'>('recent');

  // Items state: starts clean or hydrates from server DB
  const [items, setItems] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTENT);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CONTENT;
  });

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CHAT_MESSAGES;
  });

  // Reports (denuncias)
  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Moderation settings (auto #### censor, block mode, custom bad words)
  const [moderationSettings, setModerationSettings] = useState<ModerationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODERATION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      autoCensorProfanity: true,
      blockOffensiveSubmission: false,
      customBadWords: [],
    };
  });

  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [reportingTarget, setReportingTarget] = useState<ReportingTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODERATION, JSON.stringify(moderationSettings));
  }, [moderationSettings]);

  // HYDRATE FROM SERVER DATABASE ON LOAD
  useEffect(() => {
    const fetchServerDatabase = async () => {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const dbData = await res.json();
          if (Array.isArray(dbData.items) && dbData.items.length > 0) {
            setItems(dbData.items);
          }
          if (Array.isArray(dbData.reports) && dbData.reports.length > 0) {
            setReports(dbData.reports);
          }
          if (Array.isArray(dbData.chatMessages) && dbData.chatMessages.length > 0) {
            setChatMessages(dbData.chatMessages);
          }
          if (dbData.moderationSettings) {
            setModerationSettings(dbData.moderationSettings);
          }
        }
      } catch {
        // Running in pure client preview or initial build
      }
    };
    fetchServerDatabase();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const loginAs = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isNewAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();
    const newUser: UserProfile = {
      email: cleanEmail,
      name: name?.trim() || (isNewAdmin ? 'Bassify Admin' : cleanEmail.split('@')[0]),
      avatar: isNewAdmin ? DEFAULT_ADMIN_AVATAR : DEFAULT_GUEST_AVATAR,
      role: isNewAdmin ? 'admin' : 'user',
      status: 'online',
      bio: isNewAdmin ? 'Administrador oficial de Bassify Hub' : 'Miembro de la comunidad',
      joinedDate: 'Octubre 2026',
      bookmarks: [],
    };
    setCurrentUser(newUser);
    if (isNewAdmin) {
      showToast('Sesión iniciada como Administrador (grupobassify@gmail.com).');
    } else {
      showToast(`Sesión iniciada como usuario (${cleanEmail}).`);
    }
  };

  const logout = () => {
    setCurrentUser(DEFAULT_GUEST_USER);
    showToast('Sesión cambiada a usuario estándar.');
  };

  // Profile Update
  const updateUserProfile = (settings: { name?: string; avatar?: string; bio?: string }) => {
    setCurrentUser(prev => ({
      ...prev,
      name: settings.name?.trim() || prev.name,
      avatar: settings.avatar?.trim() || prev.avatar,
      bio: settings.bio !== undefined ? settings.bio.trim() : prev.bio,
    }));
    showToast('Perfil de usuario actualizado correctamente.');
  };

  // Bookmarks Management
  const isBookmarked = (itemId: string) => {
    return (currentUser.bookmarks || []).includes(itemId);
  };

  const toggleBookmark = (itemId: string) => {
    const currentBookmarks = currentUser.bookmarks || [];
    const hasBookmark = currentBookmarks.includes(itemId);
    const updatedBookmarks = hasBookmark
      ? currentBookmarks.filter(id => id !== itemId)
      : [...currentBookmarks, itemId];

    setCurrentUser(prev => ({
      ...prev,
      bookmarks: updatedBookmarks,
    }));

    showToast(hasBookmark ? 'Eliminado de tus guardados.' : 'Guardado en tu perfil.');
  };

  // Clear all content (admin action)
  const clearAllContent = async () => {
    if (!isAdmin) {
      showToast('Solo el administrador puede reiniciar los contenidos.');
      return;
    }
    setItems([]);
    setSelectedItem(null);

    try {
      await fetch('/api/db/reset', { method: 'POST' });
    } catch {
      // offline fallback
    }

    showToast('Todos los contenidos han sido eliminados de la base de datos.');
  };

  // Content Filtering logic
  const filteredItems = items
    .filter(item => {
      let matchesSection = false;
      if (activeSection === 'apps') matchesSection = item.type === 'app';
      else if (activeSection === 'games') matchesSection = item.type === 'game';
      else if (activeSection === 'news') matchesSection = item.type === 'news';
      else if (activeSection === 'events') matchesSection = item.type === 'event';
      else if (activeSection === 'featured') matchesSection = item.isFeatured === true;
      else if (activeSection === 'in_development') matchesSection = item.status === 'in_development';
      else if (activeSection === 'updates') matchesSection = item.status === 'update';

      if (!matchesSection) return false;

      // Genre filter
      if (selectedGenre !== 'all' && item.genre !== selectedGenre) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.developer.toLowerCase().includes(query) ||
          item.genre.toLowerCase().includes(query) ||
          item.shortDescription.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popular') return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Admin Actions: ADD ITEM
  const addItem = async (itemData: Omit<ContentItem, 'id' | 'createdAt' | 'comments' | 'likes' | 'likedBy'>) => {
    if (!isAdmin) {
      showToast('Acceso denegado: Solo grupobassify@gmail.com puede subir contenidos.');
      return;
    }

    const newItem: ContentItem = {
      ...itemData,
      id: `${itemData.type}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      comments: [],
      likes: 0,
      likedBy: [],
    };

    setItems(prev => [newItem, ...prev]);
    showToast(`"${newItem.title}" guardado en la base de datos de Bassify Hub.`);
    setIsUploadModalOpen(false);

    // Save to server database
    try {
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch (e) {
      console.warn('Saved locally, server offline:', e);
    }

    // Auto post an announcement message in Discord
    const announceMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      channelId: 'anuncios',
      authorEmail: ADMIN_EMAIL,
      authorName: 'Bassify Admin',
      authorAvatar: currentUser.avatar,
      isAdmin: true,
      content: `🚀 Nuevo contenido en Bassify Hub: [${itemData.title}] (${itemData.genre}). ¡Ya disponible!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, announceMsg]);
  };

  const updateItem = async (id: string, updated: Partial<ContentItem>) => {
    if (!isAdmin) {
      showToast('Acceso denegado: Solo el administrador puede editar contenido.');
      return;
    }

    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );

    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => (prev ? { ...prev, ...updated } : null));
    }

    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Server update offline fallback:', e);
    }

    showToast('Contenido guardado y actualizado en la base de datos.');
    setEditingItem(null);
  };

  const toggleFeatured = async (id: string) => {
    if (!isAdmin) {
      showToast('Acceso denegado: Solo grupobassify@gmail.com puede gestionar destacados.');
      return;
    }

    let targetFeatured = false;
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newFeatured = !item.isFeatured;
        targetFeatured = newFeatured;
        showToast(
          newFeatured
            ? `"${item.title}" marcado como Destacado por el Admin.`
            : `"${item.title}" retirado de Destacados.`
        );
        return { ...item, isFeatured: newFeatured };
      })
    );

    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => (prev ? { ...prev, isFeatured: !prev.isFeatured } : null));
    }

    try {
      await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: targetFeatured }),
      });
    } catch {
      // offline
    }
  };

  const deleteItem = async (id: string) => {
    if (!isAdmin) {
      showToast('Acceso denegado: Solo el administrador puede eliminar contenido.');
      return;
    }

    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }

    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
    } catch {
      // offline
    }

    showToast('Contenido eliminado de la base de datos.');
  };

  const toggleLikeItem = (id: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const hasLiked = item.likedBy.includes(currentUser.email);
        const newLikedBy = hasLiked
          ? item.likedBy.filter(e => e !== currentUser.email)
          : [...item.likedBy, currentUser.email];
        return {
          ...item,
          likes: hasLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
          likedBy: newLikedBy,
        };
      })
    );

    if (selectedItem && selectedItem.id === id) {
      const hasLiked = selectedItem.likedBy.includes(currentUser.email);
      setSelectedItem(prev =>
        prev
          ? {
              ...prev,
              likes: hasLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1,
              likedBy: hasLiked
                ? prev.likedBy.filter(e => e !== currentUser.email)
                : [...prev.likedBy, currentUser.email],
            }
          : null
      );
    }
  };

  // ADD COMMENT WITH AUTOMATIC "####" CENSORSHIP & BLOCKING OF OFFENSIVE LANGUAGE
  const addComment = async (itemId: string, content: string, rating: number = 5) => {
    if (!content.trim()) return;

    // Check and censor profanity
    const modResult = censorProfanity(content.trim(), moderationSettings.customBadWords);

    // If block mode enabled and offensive words found, reject comment
    if (modResult.hasProfanity && moderationSettings.blockOffensiveSubmission) {
      showToast('⚠️ Tu comentario contiene palabras ofensivas y fue bloqueado.');
      return;
    }

    const finalContent = modResult.censoredText;

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      authorEmail: currentUser.email,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      rating,
      content: finalContent,
      timestamp: 'Justo ahora',
      likes: 0,
      likedBy: [],
    };

    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const newComments = [newComment, ...item.comments];
        const newRating = Number(
          (
            (item.rating * item.reviewCount + rating) /
            (item.reviewCount + 1)
          ).toFixed(1)
        );
        return {
          ...item,
          comments: newComments,
          reviewCount: item.reviewCount + 1,
          rating: newRating,
        };
      })
    );

    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prev =>
        prev
          ? {
              ...prev,
              comments: [newComment, ...prev.comments],
              reviewCount: prev.reviewCount + 1,
            }
          : null
      );
    }

    // Persist to server database
    try {
      await fetch(`/api/items/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });
    } catch {
      // offline
    }

    if (modResult.hasProfanity) {
      showToast('Comentario guardado (se censuraron palabras ofensivas con ####).');
    } else {
      showToast('Tu reseña ha sido guardada en la base de datos.');
    }
  };

  // DELETE COMMENT (Admin or Author can remove)
  const deleteComment = async (itemId: string, commentId: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const remaining = item.comments.filter(c => c.id !== commentId);
        return {
          ...item,
          comments: remaining,
          reviewCount: remaining.length,
        };
      })
    );

    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prev =>
        prev
          ? {
              ...prev,
              comments: prev.comments.filter(c => c.id !== commentId),
              reviewCount: Math.max(0, prev.reviewCount - 1),
            }
          : null
      );
    }

    try {
      await fetch(`/api/items/${itemId}/comments/${commentId}`, { method: 'DELETE' });
    } catch {
      // offline
    }

    showToast('Comentario eliminado de la base de datos.');
  };

  const likeComment = (itemId: string, commentId: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const updatedComments = item.comments.map(c => {
          if (c.id !== commentId) return c;
          const likedBy = c.likedBy || [];
          const hasLiked = likedBy.includes(currentUser.email);
          return {
            ...c,
            likes: hasLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
            likedBy: hasLiked
              ? likedBy.filter(e => e !== currentUser.email)
              : [...likedBy, currentUser.email],
          };
        });
        return { ...item, comments: updatedComments };
      })
    );

    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prev => {
        if (!prev) return null;
        const updatedComments = prev.comments.map(c => {
          if (c.id !== commentId) return c;
          const likedBy = c.likedBy || [];
          const hasLiked = likedBy.includes(currentUser.email);
          return {
            ...c,
            likes: hasLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
            likedBy: hasLiked
              ? likedBy.filter(e => e !== currentUser.email)
              : [...likedBy, currentUser.email],
          };
        });
        return { ...prev, comments: updatedComments };
      });
    }
  };

  // SEND CHAT MESSAGE WITH AUTOMATIC "####" CENSORSHIP
  const sendMessage = async (channelId: string, content: string) => {
    if (!content.trim()) return;

    const modResult = censorProfanity(content.trim(), moderationSettings.customBadWords);

    if (modResult.hasProfanity && moderationSettings.blockOffensiveSubmission) {
      showToast('⚠️ Mensaje bloqueado por contener términos ofensivos.');
      return;
    }

    const finalContent = modResult.censoredText;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      authorEmail: currentUser.email,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      isAdmin,
      content: finalContent,
      timestamp: 'Hoy a las ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, newMsg]);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
    } catch {
      // offline
    }

    if (modResult.hasProfanity) {
      showToast('Mensaje enviado (se aplicó censura #### a palabras ofensivas).');
    }
  };

  // SUBMIT REPORT (DENUNCIA)
  const submitReport = async (reportData: Omit<ReportItem, 'id' | 'createdAt' | 'status'>) => {
    const newReport: ReportItem = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReports(prev => [newReport, ...prev]);

    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });
    } catch {
      // offline
    }

    showToast('¡Denuncia enviada! Gracias por ayudar a mantener Bassify Hub seguro.');
  };

  // RESOLVE REPORT (ADMIN ACTION)
  const resolveReport = async (id: string, status: 'dismissed' | 'action_taken', notes?: string) => {
    if (!isAdmin) {
      showToast('Solo el administrador puede gestionar denuncias.');
      return;
    }

    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status, actionTakenNotes: notes } : r))
    );

    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actionTakenNotes: notes }),
      });
    } catch {
      // offline
    }

    showToast(status === 'action_taken' ? 'Medida aplicada a la denuncia.' : 'Denuncia desestimada.');
  };

  // UPDATE MODERATION SETTINGS
  const updateModerationSettings = (newSettings: Partial<ModerationSettings>) => {
    setModerationSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Ajustes de moderación y filtro actualizados.');
  };

  // EXPORT FULL DATABASE
  const exportDatabase = () => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      items,
      reports,
      chatMessages,
      moderationSettings,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bassify_hub_database_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada exitosamente.');
  };

  // IMPORT DATABASE
  const importDatabase = async (jsonData: any): Promise<boolean> => {
    try {
      if (!jsonData || !Array.isArray(jsonData.items)) {
        showToast('El archivo de respaldo no es un formato válido de Bassify Hub.');
        return false;
      }

      setItems(jsonData.items);
      if (Array.isArray(jsonData.reports)) setReports(jsonData.reports);
      if (Array.isArray(jsonData.chatMessages)) setChatMessages(jsonData.chatMessages);
      if (jsonData.moderationSettings) setModerationSettings(jsonData.moderationSettings);

      try {
        await fetch('/api/db/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });
      } catch {
        // offline
      }

      showToast(`¡Base de datos restaurada! Se cargaron ${jsonData.items.length} publicaciones.`);
      return true;
    } catch {
      showToast('Error al importar la base de datos.');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin,
        activeSection,
        setActiveSection,
        activeChannel,
        setActiveChannel,
        items,
        filteredItems,
        selectedItem,
        setSelectedItem,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        sortBy,
        setSortBy,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isTableModalOpen,
        setIsTableModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileOpen,
        setIsProfileOpen,
        editingItem,
        setEditingItem,
        isChatSidebarOpen,
        setIsChatSidebarOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleBookmark,
        isBookmarked,
        updateUserProfile,
        clearAllContent,
        loginAs,
        logout,
        addItem,
        updateItem,
        deleteItem,
        toggleLikeItem,
        toggleFeatured,
        addComment,
        deleteComment,
        likeComment,
        channels: CHANNELS,
        chatMessages,
        sendMessage,
        reportingTarget,
        setReportingTarget,
        reports,
        submitReport,
        resolveReport,
        moderationSettings,
        updateModerationSettings,
        exportDatabase,
        importDatabase,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
