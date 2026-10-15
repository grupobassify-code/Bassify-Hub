export type SectionType =
  | 'apps'
  | 'games'
  | 'news'
  | 'events'
  | 'featured'
  | 'in_development'
  | 'updates';

export type ItemType = 'app' | 'game' | 'news' | 'event';
export type ItemStatus = 'published' | 'in_development' | 'update';

export interface CommentItem {
  id: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  rating?: number;
  content: string;
  timestamp: string;
  likes: number;
  likedBy?: string[];
}

export interface ContentItem {
  id: string;
  type: ItemType;
  title: string;
  developer: string;
  genre: string;
  shortDescription: string;
  description: string;
  logoUrl: string; // Recommended 512x512
  bannerUrl: string;
  screenshots: string[];
  downloadUrl: string;
  fileSize: string;
  version: string;
  rating: number;
  reviewCount: number;
  downloadsCount: string;
  releaseDate: string;
  eventDate?: string;
  eventLocation?: string;
  authorEmail: string;
  isOfficialBassify?: boolean;
  isFeatured?: boolean; // Contenido destacado seleccionado por el admin
  status: ItemStatus; // 'published' | 'in_development' | 'update'
  updateNotes?: string; // Notas de la actualización si aplica
  createdAt: string;
  comments: CommentItem[];
  likes: number;
  likedBy: string[];
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  role: 'admin' | 'user';
  status: 'online' | 'idle' | 'dnd' | 'offline';
  bio?: string;
  joinedDate?: string;
  bookmarks?: string[]; // Array of content item IDs
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorEmail: string;
  authorName: string;
  authorAvatar: string;
  isAdmin: boolean;
  content: string;
  timestamp: string;
}

export interface DiscordChannel {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'voice';
  unreadCount?: number;
}

export type ReportReason =
  | 'offensive_language' // Lenguaje ofensivo / malas palabras
  | 'harassment'         // Acoso / toxicidad
  | 'spam'               // Contenido no deseado o spam
  | 'malware'            // Enlace sospechoso
  | 'fake_info'          // Información falsa
  | 'other';             // Otro motivo

export interface ReportItem {
  id: string;
  targetType: 'content' | 'comment' | 'chat';
  targetId: string; // ID del juego, app, comentario o mensaje de chat
  targetTitle?: string;
  reportedContent: string;
  authorEmail: string; // Autor del contenido denunciado
  reportedByEmail: string;
  reportedByName: string;
  reason: ReportReason;
  reasonText: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: string;
  actionTakenNotes?: string;
}

export interface ModerationSettings {
  autoCensorProfanity: boolean; // Reemplazar automáticamente por ####
  blockOffensiveSubmission: boolean; // Bloquear si contiene ofensas graves
  customBadWords: string[];
}

export interface DatabaseDump {
  version: string;
  exportedAt: string;
  items: ContentItem[];
  reports: ReportItem[];
  chatMessages: ChatMessage[];
  moderationSettings: ModerationSettings;
}

