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
  DEFAULT_INITIAL_GUEST_USER,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_RECOVERY_PIN,
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
  isGuest: boolean;
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

  // Authentication & Security
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  changeAdminPassword: (currentPassword: string, newPassword: string, recoveryPin?: string) => Promise<{ success: boolean; error?: string }>;
  resetAdminPassword: (recoveryPin: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
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
const STORAGE_KEY_AUTH_LOCAL = 'bassify_hub_auth_v6';
const STORAGE_KEY_ADMIN_VERIFIED = 'bassify_admin_verified_v6';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state (defaults to safe Guest mode, never admin by default)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // CRITICAL SECURITY: If the saved profile is grupobassify@gmail.com,
        // it MUST have been validated via password in this browser session.
        if (parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          const isVerified = sessionStorage.getItem(STORAGE_KEY_ADMIN_VERIFIED) === 'true';
          if (!isVerified) {
            // Not verified with password in active session -> fall back to Guest!
            return DEFAULT_INITIAL_GUEST_USER;
          }
        }
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
    // All visitors start as Guest
    return DEFAULT_INITIAL_GUEST_USER;
  });

  const isAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && !currentUser.isGuest;
  const isGuest = !!currentUser.isGuest || currentUser.email === 'invitado@bassify.local';

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

  // Helper to read local auth store
  const getLocalAuth = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_LOCAL);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      adminPassword: DEFAULT_ADMIN_PASSWORD,
      adminRecoveryPin: DEFAULT_ADMIN_RECOVERY_PIN,
      users: [] as any[],
    };
  };

  const saveLocalAuth = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_LOCAL, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // Secure Login
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdminAccount = cleanEmail === ADMIN_EMAIL.toLowerCase();

    // 1. Try server API first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Credenciales inválidas.' };
      }

      const authenticatedUser: UserProfile = {
        ...data.user,
        avatar: data.user.avatar || (isAdminAccount ? DEFAULT_ADMIN_AVATAR : DEFAULT_GUEST_AVATAR),
        isGuest: false,
      };

      if (isAdminAccount) {
        sessionStorage.setItem(STORAGE_KEY_ADMIN_VERIFIED, 'true');
      }

      setCurrentUser(authenticatedUser);
      showToast(isAdminAccount ? '¡Bienvenido Administrador Bassify!' : `Sesión iniciada como ${authenticatedUser.name}.`);
      return { success: true };
    } catch {
      // 2. Client-side fallback if server is offline / standalone
      const localAuth = getLocalAuth();
      if (isAdminAccount) {
        if (password !== localAuth.adminPassword) {
          return {
            success: false,
            error: 'Contraseña de administrador incorrecta. La cuenta grupobassify@gmail.com está protegida.',
          };
        }

        sessionStorage.setItem(STORAGE_KEY_ADMIN_VERIFIED, 'true');
        setCurrentUser({
          email: ADMIN_EMAIL,
          name: 'Bassify Admin',
          avatar: DEFAULT_ADMIN_AVATAR,
          role: 'admin',
          status: 'online',
          bio: 'Administrador oficial de Bassify Hub.',
          joinedDate: 'Octubre 2026',
          isGuest: false,
        });
        showToast('¡Bienvenido Administrador Bassify!');
        return { success: true };
      }

      const foundUser = localAuth.users.find((u: any) => u.email.toLowerCase() === cleanEmail);
      if (!foundUser) {
        return { success: false, error: 'No se encontró cuenta con este correo. Puedes registrarte ahora.' };
      }
      if (foundUser.password !== password) {
        return { success: false, error: 'Contraseña incorrecta.' };
      }

      const { password: _, ...safeUser } = foundUser;
      setCurrentUser({ ...safeUser, isGuest: false });
      showToast(`Sesión iniciada como ${safeUser.name}.`);
      return { success: true };
    }
  };

  // Secure Register
  const register = async (email: string, name: string, password: string, avatar?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: 'Este correo está reservado para el Administrador oficial. Por favor inicia sesión.',
      };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name, password, avatar }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al crear la cuenta.' };
      }

      const newUser: UserProfile = {
        ...data.user,
        isGuest: false,
      };
      setCurrentUser(newUser);
      showToast(`¡Cuenta creada con éxito! Bienvenido, ${newUser.name}.`);
      return { success: true };
    } catch {
      // Local fallback
      const localAuth = getLocalAuth();
      if (localAuth.users.some((u: any) => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'Ya existe una cuenta con este correo.' };
      }

      const newUser = {
        email: cleanEmail,
        name: name.trim(),
        password: password.trim(),
        avatar: avatar || DEFAULT_GUEST_AVATAR,
        role: 'user' as const,
        status: 'online' as const,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        bio: 'Miembro de la comunidad Bassify Hub.',
        bookmarks: [],
        isGuest: false,
      };

      localAuth.users.push(newUser);
      saveLocalAuth(localAuth);

      const { password: _, ...safeUser } = newUser;
      setCurrentUser(safeUser);
      showToast(`¡Cuenta creada con éxito! Bienvenido, ${safeUser.name}.`);
      return { success: true };
    }
  };

  // Change Admin Password
  const changeAdminPassword = async (
    currentPassword: string,
    newPassword: string,
    recoveryPin?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/change-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, recoveryPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al cambiar la contraseña.' };
      }
      // Also update local
      const localAuth = getLocalAuth();
      localAuth.adminPassword = newPassword.trim();
      saveLocalAuth(localAuth);
      showToast('¡Contraseña de administrador actualizada con éxito!');
      return { success: true };
    } catch {
      const localAuth = getLocalAuth();
      const isCurrentValid = currentPassword && currentPassword === localAuth.adminPassword;
      const isPinValid = recoveryPin && recoveryPin === localAuth.adminRecoveryPin;

      if (!isCurrentValid && !isPinValid) {
        return { success: false, error: 'La contraseña actual o el PIN maestro son incorrectos.' };
      }

      localAuth.adminPassword = newPassword.trim();
      saveLocalAuth(localAuth);
      showToast('¡Contraseña de administrador actualizada con éxito!');
      return { success: true };
    }
  };

  // Reset Admin Password using master PIN
  const resetAdminPassword = async (
    recoveryPin: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/reset-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryPin, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al restablecer la contraseña.' };
      }
      const localAuth = getLocalAuth();
      localAuth.adminPassword = newPassword.trim();
      saveLocalAuth(localAuth);
      showToast('¡Contraseña restablecida con éxito!');
      return { success: true };
    } catch {
      const localAuth = getLocalAuth();
      if (recoveryPin !== localAuth.adminRecoveryPin) {
        return { success: false, error: 'El PIN maestro de recuperación no coincide.' };
      }
      localAuth.adminPassword = newPassword.trim();
      saveLocalAuth(localAuth);
      showToast('¡Contraseña restablecida con éxito!');
      return { success: true };
    }
  };

  const loginAs = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // CRITICAL: Block unauthorized login as admin through loginAs!
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      setIsAuthModalOpen(true);
      showToast('La cuenta oficial grupobassify@gmail.com está protegida. Ingresa tu contraseña.');
      return;
    }

    const newUser: UserProfile = {
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      avatar: DEFAULT_GUEST_AVATAR,
      role: 'user',
      status: 'online',
      bio: 'Miembro de la comunidad Bassify Hub',
      joinedDate: 'Octubre 2026',
      bookmarks: [],
      isGuest: false,
    };
    setCurrentUser(newUser);
    showToast(`Sesión iniciada como ${newUser.name}.`);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_VERIFIED);
    setCurrentUser(DEFAULT_INITIAL_GUEST_USER);
    showToast('Sesión cerrada. Ahora estás en modo Invitado.');
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
        isGuest,
        login,
        register,
        changeAdminPassword,
        resetAdminPassword,
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
