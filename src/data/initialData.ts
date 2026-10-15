import { ContentItem, DiscordChannel, ChatMessage, UserProfile } from '../types';
import { DEFAULT_ADMIN_AVATAR, DEFAULT_GUEST_AVATAR, DEFAULT_FIGURE_AVATARS } from '../utils/avatars';

export const ADMIN_EMAIL = 'grupobassify@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'BassifyAdmin2026!';
export const DEFAULT_ADMIN_RECOVERY_PIN = '9824';

export const DEFAULT_INITIAL_GUEST_USER: UserProfile = {
  email: 'invitado@bassify.local',
  name: 'Invitado',
  avatar: DEFAULT_FIGURE_AVATARS[6].url,
  role: 'user',
  status: 'online',
  bio: 'Visitante de la comunidad Bassify Hub. Inicia sesión para guardar favoritos y comentar.',
  joinedDate: 'Octubre 2026',
  bookmarks: [],
  isGuest: true,
};

export const DEFAULT_ADMIN_USER: UserProfile = {
  email: ADMIN_EMAIL,
  name: 'Bassify Admin',
  avatar: DEFAULT_ADMIN_AVATAR,
  role: 'admin',
  status: 'online',
  bio: 'Administrador oficial de Bassify Hub. Publicador y curador de juegos, aplicaciones, noticias y eventos.',
  joinedDate: 'Octubre 2026',
  bookmarks: [],
  isGuest: false,
};

export const DEFAULT_GUEST_USER: UserProfile = {
  email: 'usuario_gamer@bassify.net',
  name: 'BassifyGamer',
  avatar: DEFAULT_GUEST_AVATAR,
  role: 'user',
  status: 'online',
  bio: 'Miembro entusiasta de la comunidad Bassify Hub.',
  joinedDate: 'Octubre 2026',
  bookmarks: [],
  isGuest: false,
};

export const CHANNELS: DiscordChannel[] = [
  {
    id: 'anuncios',
    name: 'anuncios-oficiales',
    description: 'Novedades oficiales del ecosistema Bassify Hub y lanzamientos',
    type: 'text',
  },
  {
    id: 'general',
    name: 'charla-general',
    description: 'Comunidad de videojugadores, charlas y debates de Bassify Hub',
    type: 'text',
  },
  {
    id: 'feedback-juegos',
    name: 'resenas-y-feedback',
    description: 'Comparte tus reviews y feedback de juegos y apps subidas por el admin',
    type: 'text',
  },
  {
    id: 'soporte',
    name: 'soporte-tecnico',
    description: 'Dudas sobre descargas, rendimiento e instalación en Bassify Hub',
    type: 'text',
  },
  {
    id: 'voz-chill',
    name: 'Lounge Bassify',
    description: 'Canal de voz activo para charlar',
    type: 'voice',
  },
  {
    id: 'voz-partidas',
    name: 'Squad Partidas 1',
    description: 'Canal de voz para juego cooperativo',
    type: 'voice',
  },
];

// ELIMINADOS TODOS LOS CONTENIDOS DEMO PREVIOS.
// La plataforma queda totalmente limpia para que el administrador pueda subir sus propios contenidos.
export const INITIAL_CONTENT: ContentItem[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    channelId: 'anuncios',
    authorEmail: ADMIN_EMAIL,
    authorName: 'Bassify Admin',
    authorAvatar: DEFAULT_ADMIN_AVATAR,
    isAdmin: true,
    content: '¡Bienvenidos a Bassify Hub! La plataforma está lista y limpia para la carga de nuevos juegos, apps, noticias y eventos oficiales.',
    timestamp: '18:15',
  },
  {
    id: 'm2',
    channelId: 'general',
    authorEmail: 'usuario_gamer@bassify.net',
    authorName: 'BassifyGamer',
    authorAvatar: DEFAULT_GUEST_AVATAR,
    isAdmin: false,
    content: '¡Hola a todos! Esperando con ansias los nuevos lanzamientos que el admin subirá al Hub.',
    timestamp: '18:32',
  },
];
