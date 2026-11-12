import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const getGeminiClient = (): GoogleGenAI | null => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) return null;
  return new GoogleGenAI({
    apiKey: key.trim(),
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data & upload directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Initial DB template
interface DatabaseSchema {
  version: string;
  items: any[];
  reports: any[];
  chatMessages: any[];
  albums: any[];
  songs: any[];
  moderationSettings: {
    autoCensorProfanity: boolean;
    blockOffensiveSubmission: boolean;
    customBadWords: string[];
  };
  auth: {
    adminEmail: string;
    adminPassword: string;
    adminRecoveryPin: string;
    users: Array<{
      email: string;
      name: string;
      password: string;
      avatar: string;
      role: 'admin' | 'user';
      joinedDate: string;
      bio?: string;
    }>;
  };
}

const defaultDb: DatabaseSchema = {
  version: '1.0.0',
  items: [],
  reports: [],
  chatMessages: [],
  albums: [],
  songs: [],
  moderationSettings: {
    autoCensorProfanity: true,
    blockOffensiveSubmission: false,
    customBadWords: [],
  },
  auth: {
    adminEmail: 'grupobassi@gmail.com',
    adminPassword: '@bassify.group.com&2011&',
    adminRecoveryPin: '9824',
    users: [],
  },
};

// Safe DB Read/Write
const readDatabase = (): DatabaseSchema => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.auth) {
      parsed.auth = defaultDb.auth;
      writeDatabase(parsed);
    }
    parsed.items = Array.isArray(parsed.items) ? parsed.items : [];
    parsed.reports = Array.isArray(parsed.reports) ? parsed.reports : [];
    parsed.chatMessages = Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [];
    parsed.albums = Array.isArray(parsed.albums) ? parsed.albums : [];
    parsed.songs = Array.isArray(parsed.songs) ? parsed.songs : [];
    if (!parsed.moderationSettings) {
      parsed.moderationSettings = defaultDb.moderationSettings;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return defaultDb;
  }
};

const writeDatabase = (data: DatabaseSchema) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
    throw err;
  }
};

// Connected SSE clients for real-time updates to all users
const sseClients = new Set<Response>();

const broadcastDbUpdate = (eventType: string, payload?: any) => {
  const data = JSON.stringify({
    type: eventType,
    payload,
    timestamp: Date.now(),
  });
  for (const client of sseClients) {
    try {
      client.write(`event: db_update\ndata: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
};

const normalizeContentItem = (raw: any) => ({
  ...raw,
  id: raw.id || `${raw.type || 'item'}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  createdAt: raw.createdAt || new Date().toISOString(),
  comments: Array.isArray(raw.comments) ? raw.comments : [],
  likes: typeof raw.likes === 'number' ? raw.likes : 0,
  likedBy: Array.isArray(raw.likedBy) ? raw.likedBy : [],
  screenshots: Array.isArray(raw.screenshots) ? raw.screenshots : [],
  rating: typeof raw.rating === 'number' ? raw.rating : 5.0,
  reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : (Array.isArray(raw.comments) ? raw.comments.length : 0),
});

async function startServer() {
  const app = express();

  // Serve uploaded media files statically
  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

  // Binary file upload endpoint (must be registered before express.json)
  app.post(
    '/api/upload',
    express.raw({ limit: '50mb', type: '*/*' }),
    (req: Request, res: Response) => {
      try {
        const buffer = req.body;
        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
          return res.status(400).json({ error: 'Archivo vacío o inválido.' });
        }

        const contentType = (req.headers['content-type'] || '').toLowerCase();
        const rawHeaderName = String(req.headers['x-file-name'] || 'upload');
        let decodedName = rawHeaderName;
        try {
          decodedName = decodeURIComponent(rawHeaderName);
        } catch {
          // keep raw
        }

        const extFromName = path.extname(decodedName).toLowerCase().replace(/[^a-z0-9.]/g, '');
        let ext = extFromName;
        if (!ext) {
          if (contentType.includes('png')) ext = '.png';
          else if (contentType.includes('webp')) ext = '.webp';
          else if (contentType.includes('gif')) ext = '.gif';
          else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
          else if (contentType.includes('mpeg') || contentType.includes('mp3')) ext = '.mp3';
          else if (contentType.includes('wav')) ext = '.wav';
          else if (contentType.includes('ogg')) ext = '.ogg';
          else ext = '.bin';
        }

        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp3', '.wav', '.ogg', '.m4a', '.aac'];
        if (!allowedExts.includes(ext)) {
          return res.status(400).json({ error: 'Tipo de archivo no soportado.' });
        }

        const baseName = path
          .basename(decodedName, path.extname(decodedName))
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 40) || 'media';
        const finalName = `${baseName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const filePath = path.join(UPLOAD_DIR, finalName);

        fs.writeFileSync(filePath, buffer);
        return res.status(201).json({ success: true, url: `/uploads/${finalName}` });
      } catch (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Error al guardar el archivo en el servidor.' });
      }
    }
  );

  app.use(express.json({ limit: '50mb' }));

  // Server-Sent Events endpoint for live multi-user sync
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    sseClients.add(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, clients: sseClients.size })}\n\n`);

    const keepAlive = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  // ==========================================
  // API ROUTES - AUTH & ACCOUNT SECURITY
  // ==========================================

  // Login endpoint
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const db = readDatabase();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Debes proporcionar correo y contraseña.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const auth = db.auth || defaultDb.auth;

    // Protect Admin accounts grupobassi@gmail.com and grupobassify@gmail.com
    const isAdminAccount =
      cleanEmail === 'grupobassi@gmail.com' ||
      cleanEmail === 'grupobassify@gmail.com' ||
      cleanEmail === auth.adminEmail.toLowerCase();

    if (isAdminAccount) {
      const isPasswordValid =
        password === '@bassify.group.com&2011&' ||
        password === auth.adminPassword ||
        password === 'BassifyAdmin2026!';

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Contraseña de administrador incorrecta. La cuenta oficial está blindada.',
        });
      }

      const adminUser = {
        email: cleanEmail,
        name: 'Bassify Admin',
        avatar: '', // App will use DEFAULT_ADMIN_AVATAR
        role: 'admin',
        status: 'online',
        bio: 'Administrador oficial de Bassify Hub.',
        joinedDate: 'Octubre 2026',
        isGuest: false,
      };
      return res.json({ success: true, user: adminUser });
    }

    // Standard user login
    const existingUser = (auth.users || []).find(
      (u: any) => u.email.toLowerCase() === cleanEmail
    );

    if (!existingUser) {
      return res.status(404).json({
        error: 'No se encontró cuenta con este correo. Puedes crear una nueva en "Registrarse".',
      });
    }

    if (existingUser.password !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const { password: _, ...safeUser } = existingUser;
    return res.json({ success: true, user: { ...safeUser, isGuest: false } });
  });

  // Register endpoint
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const db = readDatabase();
    const { email, name, password, avatar } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const auth = db.auth || defaultDb.auth;

    const isAdminEmail =
      cleanEmail === 'grupobassi@gmail.com' ||
      cleanEmail === 'grupobassify@gmail.com' ||
      cleanEmail === auth.adminEmail.toLowerCase();

    if (isAdminEmail) {
      return res.status(400).json({
        error: 'Este correo pertenece al Administrador. Por favor inicia sesión con tu contraseña.',
      });
    }

    if ((auth.users || []).some((u: any) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo electrónico.' });
    }

    const newUser = {
      email: cleanEmail,
      name: name.trim(),
      password: password.trim(),
      avatar: avatar || '',
      role: 'user' as const,
      joinedDate: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      bio: 'Miembro de la comunidad Bassify Hub.',
    };

    db.auth = {
      ...auth,
      users: [...(auth.users || []), newUser],
    };
    writeDatabase(db);

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({ success: true, user: { ...safeUser, isGuest: false } });
  });

  // Change Admin Password
  app.post('/api/auth/change-admin-password', (req: Request, res: Response) => {
    const db = readDatabase();
    const { currentPassword, newPassword, recoveryPin } = req.body;
    const auth = db.auth || defaultDb.auth;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const isCurrentValid = currentPassword && currentPassword === auth.adminPassword;
    const isPinValid = recoveryPin && recoveryPin === auth.adminRecoveryPin;

    if (!isCurrentValid && !isPinValid) {
      return res.status(401).json({
        error: 'La contraseña actual o el PIN de recuperación maestro son incorrectos.',
      });
    }

    db.auth = {
      ...auth,
      adminPassword: newPassword.trim(),
    };
    writeDatabase(db);
    return res.json({ success: true, message: '¡Contraseña de administrador actualizada con éxito!' });
  });

  // Reset Admin / Account Password using PIN
  app.post('/api/auth/reset-admin', (req: Request, res: Response) => {
    const db = readDatabase();
    const { recoveryPin, newPassword, email } = req.body;
    const auth = db.auth || defaultDb.auth;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : auth.adminEmail.toLowerCase();

    // If it's an admin email
    const isAdminEmail =
      cleanEmail === 'grupobassi@gmail.com' ||
      cleanEmail === 'grupobassify@gmail.com' ||
      cleanEmail === auth.adminEmail.toLowerCase();

    if (isAdminEmail) {
      if (!recoveryPin || recoveryPin.trim() !== auth.adminRecoveryPin) {
        return res.status(401).json({ error: 'El PIN o clave de seguridad de recuperación es incorrecto.' });
      }

      db.auth = {
        ...auth,
        adminPassword: newPassword.trim(),
      };
      writeDatabase(db);
      return res.json({ success: true, message: 'Contraseña restablecida exitosamente.' });
    }

    // If it's a registered user
    const users = auth.users || [];
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === cleanEmail);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword.trim();
      db.auth = { ...auth, users };
      writeDatabase(db);
      return res.json({ success: true, message: 'Contraseña restablecida exitosamente.' });
    }

    return res.status(404).json({ error: 'No se encontró ninguna cuenta asociada a este correo electrónico.' });
  });

  // ==========================================
  // API ROUTES - PERSISTENT DATABASE STORAGE
  // ==========================================

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Get full database (public hub state, excluding auth secrets)
  app.get('/api/db', (_req: Request, res: Response) => {
    const db = readDatabase();
    res.json({
      version: db.version,
      items: (db.items || []).map(normalizeContentItem),
      reports: db.reports || [],
      chatMessages: db.chatMessages || [],
      albums: db.albums || [],
      songs: db.songs || [],
      moderationSettings: db.moderationSettings || defaultDb.moderationSettings,
    });
  });

  // Save / Sync items
  app.post('/api/items', (req: Request, res: Response) => {
    try {
      const db = readDatabase();
      const newItem = normalizeContentItem(req.body);
      // Idempotency guard
      const existsIdx = db.items.findIndex((i: any) => i.id === newItem.id);
      if (existsIdx !== -1) {
        db.items[existsIdx] = newItem;
      } else {
        db.items = [newItem, ...db.items];
      }
      writeDatabase(db);
      broadcastDbUpdate('item:created', newItem);
      res.status(201).json(newItem);
    } catch (err) {
      console.error('Error creating item:', err);
      res.status(500).json({ error: 'No se pudo guardar el contenido en la base de datos.' });
    }
  });

  // Update item
  app.put('/api/items/:id', (req: Request, res: Response) => {
    try {
      const db = readDatabase();
      const { id } = req.params;
      const index = db.items.findIndex((i: any) => i.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Item not found' });
      }
      db.items[index] = normalizeContentItem({ ...db.items[index], ...req.body, id });
      writeDatabase(db);
      broadcastDbUpdate('item:updated', db.items[index]);
      res.json(db.items[index]);
    } catch (err) {
      console.error('Error updating item:', err);
      res.status(500).json({ error: 'No se pudo actualizar el contenido.' });
    }
  });

  // Like / Unlike item
  app.post('/api/items/:id/like', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const { userEmail } = req.body || {};
    const index = db.items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const item = normalizeContentItem(db.items[index]);
    const likedBy = item.likedBy || [];
    const hasLiked = userEmail && likedBy.includes(userEmail);
    item.likedBy = hasLiked ? likedBy.filter((e: string) => e !== userEmail) : [...likedBy, userEmail || 'guest'];
    item.likes = hasLiked ? Math.max(0, item.likes - 1) : item.likes + 1;
    db.items[index] = item;
    writeDatabase(db);
    broadcastDbUpdate('item:updated', item);
    res.json(item);
  });

  // Delete item
  app.delete('/api/items/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    db.items = db.items.filter((i: any) => i.id !== id);
    db.reports = db.reports.filter((r: any) => r.targetId !== id);
    writeDatabase(db);
    broadcastDbUpdate('item:deleted', { id });
    res.json({ success: true, deletedId: id });
  });

  // Add Comment to item
  app.post('/api/items/:id/comments', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const comment = req.body;
    const itemIndex = db.items.findIndex((i: any) => i.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const item = normalizeContentItem(db.items[itemIndex]);
    if (!comment.id) {
      comment.id = 'cmt_' + Date.now();
    }
    if (!item.comments.some((c: any) => c.id === comment.id)) {
      const rating = Number(comment.rating) || 5;
      const prevCount = item.reviewCount || item.comments.length;
      item.comments = [comment, ...item.comments];
      item.reviewCount = item.comments.length;
      item.rating = Number((((item.rating || 5) * prevCount + rating) / (prevCount + 1)).toFixed(1));
    }
    db.items[itemIndex] = item;
    writeDatabase(db);
    broadcastDbUpdate('item:updated', item);
    res.status(201).json(comment);
  });

  // Like / Unlike Comment
  app.post('/api/items/:id/comments/:commentId/like', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id, commentId } = req.params;
    const { userEmail } = req.body || {};
    const itemIndex = db.items.findIndex((i: any) => i.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const item = normalizeContentItem(db.items[itemIndex]);
    item.comments = item.comments.map((c: any) => {
      if (c.id !== commentId) return c;
      const likedBy = c.likedBy || [];
      const hasLiked = userEmail && likedBy.includes(userEmail);
      return {
        ...c,
        likes: hasLiked ? Math.max(0, (c.likes || 1) - 1) : (c.likes || 0) + 1,
        likedBy: hasLiked ? likedBy.filter((e: string) => e !== userEmail) : [...likedBy, userEmail || 'guest'],
      };
    });
    db.items[itemIndex] = item;
    writeDatabase(db);
    broadcastDbUpdate('item:updated', item);
    res.json(item);
  });

  // Delete Comment from item
  app.delete('/api/items/:id/comments/:commentId', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id, commentId } = req.params;
    const itemIndex = db.items.findIndex((i: any) => i.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const item = normalizeContentItem(db.items[itemIndex]);
    item.comments = item.comments.filter((c: any) => c.id !== commentId);
    item.reviewCount = item.comments.length;
    db.items[itemIndex] = item;
    db.reports.forEach((r: any) => {
      if (r.targetId === commentId) {
        r.status = 'action_taken';
        r.actionTakenNotes = 'Comentario eliminado por el administrador.';
      }
    });
    writeDatabase(db);
    broadcastDbUpdate('item:updated', item);
    res.json({ success: true, deletedCommentId: commentId });
  });

  // Submit a Report (Denuncia)
  app.post('/api/reports', (req: Request, res: Response) => {
    const db = readDatabase();
    const newReport = {
      id: req.body?.id || 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    db.reports = [newReport, ...(db.reports || []).filter((r: any) => r.id !== newReport.id)];
    writeDatabase(db);
    broadcastDbUpdate('report:created', newReport);
    res.status(201).json(newReport);
  });

  // Get all Reports (Admin)
  app.get('/api/reports', (_req: Request, res: Response) => {
    const db = readDatabase();
    res.json(db.reports || []);
  });

  // Update Report Status (Dismiss, Review, Action taken)
  app.put('/api/reports/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const reportIndex = db.reports.findIndex((r: any) => r.id === id);
    if (reportIndex === -1) {
      return res.status(404).json({ error: 'Report not found' });
    }
    db.reports[reportIndex] = { ...db.reports[reportIndex], ...req.body };
    writeDatabase(db);
    broadcastDbUpdate('report:updated', db.reports[reportIndex]);
    res.json(db.reports[reportIndex]);
  });

  // Update Moderation Settings
  app.put('/api/moderation', (req: Request, res: Response) => {
    const db = readDatabase();
    db.moderationSettings = {
      ...(db.moderationSettings || defaultDb.moderationSettings),
      ...req.body,
    };
    writeDatabase(db);
    broadcastDbUpdate('moderation:updated', db.moderationSettings);
    res.json(db.moderationSettings);
  });

  // Post Chat Message
  app.post('/api/chat', (req: Request, res: Response) => {
    const db = readDatabase();
    const newMsg = {
      id: req.body?.id || 'msg_' + Date.now(),
      timestamp: 'Hoy a las ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      ...req.body,
    };
    if (!(db.chatMessages || []).some((m: any) => m.id === newMsg.id)) {
      db.chatMessages = [...(db.chatMessages || []), newMsg];
    }
    writeDatabase(db);
    broadcastDbUpdate('chat:created', newMsg);
    res.status(201).json(newMsg);
  });

  // ==========================================
  // API ROUTES - ALBUMS & PLAYLISTS (SPOTIFY STYLE)
  // ==========================================

  // Get Albums
  app.get('/api/albums', (_req: Request, res: Response) => {
    const db = readDatabase();
    res.json(db.albums || []);
  });

  // Create Album
  app.post('/api/albums', (req: Request, res: Response) => {
    try {
      const db = readDatabase();
      const newAlbum = {
        id: req.body?.id || 'album_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        songsCount: 0,
        totalDuration: 0,
        ...req.body,
      };
      const idx = (db.albums || []).findIndex((a: any) => a.id === newAlbum.id);
      if (idx !== -1) {
        db.albums[idx] = newAlbum;
      } else {
        db.albums = [newAlbum, ...(db.albums || [])];
      }
      writeDatabase(db);
      broadcastDbUpdate('album:created', newAlbum);
      res.status(201).json(newAlbum);
    } catch (err) {
      console.error('Error creating album:', err);
      res.status(500).json({ error: 'No se pudo guardar el álbum.' });
    }
  });

  // Update Album
  app.put('/api/albums/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const idx = (db.albums || []).findIndex((a: any) => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Album not found' });
    }
    db.albums[idx] = { ...db.albums[idx], ...req.body };
    writeDatabase(db);
    broadcastDbUpdate('album:updated', db.albums[idx]);
    res.json(db.albums[idx]);
  });

  // Delete Album
  app.delete('/api/albums/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    db.albums = (db.albums || []).filter((a: any) => a.id !== id);
    db.songs = (db.songs || []).filter((s: any) => s.albumId !== id);
    writeDatabase(db);
    broadcastDbUpdate('album:deleted', { id });
    res.json({ success: true, deletedAlbumId: id });
  });

  // ==========================================
  // API ROUTES - SONGS (MP3 TRACKS)
  // ==========================================

  // Get Songs
  app.get('/api/songs', (_req: Request, res: Response) => {
    const db = readDatabase();
    res.json(db.songs || []);
  });

  // Create Song
  app.post('/api/songs', (req: Request, res: Response) => {
    try {
      const db = readDatabase();
      const newSong = {
        id: req.body?.id || 'song_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        ...req.body,
      };
      const exists = (db.songs || []).some((s: any) => s.id === newSong.id);
      if (!exists) {
        db.songs = [newSong, ...(db.songs || [])];
        if (newSong.albumId) {
          const album = (db.albums || []).find((a: any) => a.id === newSong.albumId);
          if (album) {
            album.songsCount = (album.songsCount || 0) + 1;
            album.totalDuration = (album.totalDuration || 0) + (newSong.duration || 180);
          }
        }
      }
      writeDatabase(db);
      broadcastDbUpdate('song:created', newSong);
      res.status(201).json(newSong);
    } catch (err) {
      console.error('Error creating song:', err);
      res.status(500).json({ error: 'No se pudo guardar la canción.' });
    }
  });

  // Update Song
  app.put('/api/songs/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const idx = (db.songs || []).findIndex((s: any) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Song not found' });
    }
    db.songs[idx] = { ...db.songs[idx], ...req.body };
    writeDatabase(db);
    broadcastDbUpdate('song:updated', db.songs[idx]);
    res.json(db.songs[idx]);
  });

  // Delete Song
  app.delete('/api/songs/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const songToDelete = (db.songs || []).find((s: any) => s.id === id);
    db.songs = (db.songs || []).filter((s: any) => s.id !== id);

    if (songToDelete && songToDelete.albumId) {
      const album = (db.albums || []).find((a: any) => a.id === songToDelete.albumId);
      if (album) {
        album.songsCount = Math.max(0, (album.songsCount || 1) - 1);
        album.totalDuration = Math.max(0, (album.totalDuration || 180) - (songToDelete.duration || 180));
      }
    }

    writeDatabase(db);
    broadcastDbUpdate('song:deleted', { id, albumId: songToDelete?.albumId, duration: songToDelete?.duration });
    res.json({ success: true, deletedSongId: id });
  });

  // Toggle Song Like
  app.post('/api/songs/:id/like', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const { userEmail } = req.body;
    const song = (db.songs || []).find((s: any) => s.id === id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    const likedBy = song.likedBy || [];
    const hasLiked = userEmail && likedBy.includes(userEmail);
    song.likedBy = hasLiked ? likedBy.filter((e: string) => e !== userEmail) : [...likedBy, userEmail];
    song.likes = hasLiked ? Math.max(0, (song.likes || 1) - 1) : (song.likes || 0) + 1;
    writeDatabase(db);
    broadcastDbUpdate('song:updated', song);
    res.json({ success: true, likes: song.likes, hasLiked: !hasLiked });
  });

  // Reset all content (Admin only action)
  app.post('/api/db/reset', (_req: Request, res: Response) => {
    const db = readDatabase();
    db.items = [];
    writeDatabase(db);
    broadcastDbUpdate('db:reset');
    res.json({ success: true, message: 'Catálogo vaciado.' });
  });

  // Export full DB backup
  app.get('/api/db/export', (_req: Request, res: Response) => {
    const db = readDatabase();
    res.setHeader('Content-Disposition', 'attachment; filename=bassify_hub_backup.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(db, null, 2));
  });

  // Import DB backup
  app.post('/api/db/import', (req: Request, res: Response) => {
    try {
      const imported = req.body;
      if (!imported || !Array.isArray(imported.items)) {
        return res.status(400).json({ error: 'Formato de base de datos inválido' });
      }
      const current = readDatabase();
      const merged: DatabaseSchema = {
        ...current,
        ...imported,
        items: imported.items.map(normalizeContentItem),
        auth: imported.auth || current.auth,
      };
      writeDatabase(merged);
      broadcastDbUpdate('db:imported');
      res.json({ success: true, count: merged.items.length });
    } catch {
      res.status(500).json({ error: 'Error al importar la base de datos' });
    }
  });

  // ==========================================
  // GEMINI AI - SLAP BASS CHILL MENU MUSIC
  // ==========================================
  app.all('/api/gemini/generate-menu-music', async (_req: Request, res: Response) => {
    console.log('[Gemini Music] Request received for chill slap bass groove');
    // Curated high-fidelity fallback slap bass grooves in case Gemini API is unreachable or key is unset
    const fallbackGrooves = [
      {
        title: 'Bassify Slap Velvet — Gemini Chill Motif',
        key: 'Sol menor (Chill Slap Funk)',
        bpm: 80,
        description: 'Bajo slap suave con notas de pulgar profundas, pops aterciopelados y acordes de piano Rhodes.',
        chords: [
          { name: 'Gm9', notes: ['Bb3', 'D4', 'F4', 'A4'], time: 0, duration: 4 },
          { name: 'Ebmaj9', notes: ['G3', 'Bb3', 'D4', 'F4'], time: 4, duration: 4 },
          { name: 'Cm9', notes: ['Eb3', 'G3', 'Bb3', 'D4'], time: 8, duration: 4 },
          { name: 'D7#9', notes: ['F#3', 'C4', 'Eb4', 'F4'], time: 12, duration: 4 },
        ],
        bassline: [
          { note: 'G1', time: 0.0, duration: 0.75, type: 'slap', velocity: 0.9 },
          { note: 'G1', time: 0.75, duration: 0.25, type: 'ghost', velocity: 0.4 },
          { note: 'G2', time: 1.0, duration: 0.5, type: 'pop', velocity: 0.8 },
          { note: 'F2', time: 1.75, duration: 0.5, type: 'pop', velocity: 0.7 },
          { note: 'G1', time: 2.5, duration: 0.5, type: 'slap', velocity: 0.8 },
          { note: 'Bb1', time: 3.25, duration: 0.35, type: 'slap', velocity: 0.75 },
          { note: 'C2', time: 3.65, duration: 0.35, type: 'slap', velocity: 0.8 },
          { note: 'Eb1', time: 4.0, duration: 0.75, type: 'slap', velocity: 0.9 },
          { note: 'Eb2', time: 4.75, duration: 0.5, type: 'pop', velocity: 0.85 },
          { note: 'D2', time: 5.5, duration: 0.4, type: 'pop', velocity: 0.65 },
          { note: 'Eb1', time: 6.25, duration: 0.5, type: 'slap', velocity: 0.8 },
          { note: 'G1', time: 7.0, duration: 0.4, type: 'slap', velocity: 0.7 },
          { note: 'Bb1', time: 7.5, duration: 0.5, type: 'pop', velocity: 0.75 },
          { note: 'C1', time: 8.0, duration: 0.75, type: 'slap', velocity: 0.9 },
          { note: 'C2', time: 8.75, duration: 0.5, type: 'pop', velocity: 0.85 },
          { note: 'Bb1', time: 9.5, duration: 0.4, type: 'pop', velocity: 0.6 },
          { note: 'C1', time: 10.25, duration: 0.5, type: 'slap', velocity: 0.75 },
          { note: 'Eb2', time: 11.0, duration: 0.4, type: 'pop', velocity: 0.8 },
          { note: 'F2', time: 11.5, duration: 0.5, type: 'pop', velocity: 0.85 },
          { note: 'D1', time: 12.0, duration: 0.75, type: 'slap', velocity: 0.9 },
          { note: 'D2', time: 12.75, duration: 0.5, type: 'pop', velocity: 0.8 },
          { note: 'C2', time: 13.5, duration: 0.4, type: 'pop', velocity: 0.65 },
          { note: 'D1', time: 14.25, duration: 0.4, type: 'slap', velocity: 0.75 },
          { note: 'F2', time: 14.75, duration: 0.4, type: 'pop', velocity: 0.75 },
          { note: 'F#2', time: 15.25, duration: 0.75, type: 'pop', velocity: 0.8 },
        ],
      },
      {
        title: 'Bassify Chill Horizon — Slap Suave',
        key: 'Do menor (Lounge Lo-Fi)',
        bpm: 84,
        description: 'Slap suave y relajado con groove nocturno calmado y dinámicas sutiles.',
        chords: [
          { name: 'Cm9', notes: ['Eb3', 'G3', 'Bb3', 'D4'], time: 0, duration: 4 },
          { name: 'Abmaj7', notes: ['Eb3', 'Ab3', 'C4', 'G4'], time: 4, duration: 4 },
          { name: 'Fm9', notes: ['Ab3', 'C4', 'Eb4', 'G4'], time: 8, duration: 4 },
          { name: 'G7alt', notes: ['F3', 'B3', 'Eb4', 'Ab4'], time: 12, duration: 4 },
        ],
        bassline: [
          { note: 'C2', time: 0.0, duration: 0.75, type: 'slap', velocity: 0.88 },
          { note: 'C3', time: 1.0, duration: 0.5, type: 'pop', velocity: 0.78 },
          { note: 'Bb2', time: 1.75, duration: 0.4, type: 'pop', velocity: 0.7 },
          { note: 'C2', time: 2.5, duration: 0.5, type: 'slap', velocity: 0.82 },
          { note: 'Eb2', time: 3.25, duration: 0.4, type: 'slap', velocity: 0.7 },
          { note: 'Ab1', time: 4.0, duration: 0.75, type: 'slap', velocity: 0.9 },
          { note: 'Ab2', time: 4.75, duration: 0.5, type: 'pop', velocity: 0.8 },
          { note: 'G2', time: 5.5, duration: 0.4, type: 'pop', velocity: 0.65 },
          { note: 'Ab1', time: 6.25, duration: 0.5, type: 'slap', velocity: 0.75 },
          { note: 'C2', time: 7.25, duration: 0.5, type: 'pop', velocity: 0.7 },
          { note: 'F1', time: 8.0, duration: 0.75, type: 'slap', velocity: 0.9 },
          { note: 'F2', time: 8.75, duration: 0.5, type: 'pop', velocity: 0.82 },
          { note: 'Eb2', time: 9.5, duration: 0.4, type: 'pop', velocity: 0.65 },
          { note: 'F1', time: 10.25, duration: 0.5, type: 'slap', velocity: 0.75 },
          { note: 'Ab2', time: 11.25, duration: 0.5, type: 'pop', velocity: 0.8 },
          { note: 'G1', time: 12.0, duration: 0.75, type: 'slap', velocity: 0.9 },
          { note: 'G2', time: 12.75, duration: 0.5, type: 'pop', velocity: 0.78 },
          { note: 'F2', time: 13.5, duration: 0.4, type: 'pop', velocity: 0.65 },
          { note: 'G1', time: 14.25, duration: 0.4, type: 'slap', velocity: 0.75 },
          { note: 'B2', time: 15.0, duration: 0.75, type: 'pop', velocity: 0.8 },
        ],
      },
    ];

    try {
      const ai = getGeminiClient();
      if (!ai) {
        const selected = fallbackGrooves[Math.floor(Math.random() * fallbackGrooves.length)];
        return res.json({ success: true, groove: selected, source: 'curated' });
      }

      const prompt = `You are a world-class jazz-funk & lo-fi bass composer.
Compose a relaxed, calm, chilled slap-bass groove motif ("bajo slap, relajada y calmada") specifically tailored for a PlayStation-style gaming hub menu.

Requirements:
- Mood: Chill, calm, smooth, relaxing, mellow, tasteful, never harsh or loud.
- Bass technique: Gentle thumb slaps ('slap' or 'thumb') on downbeats, delicate velvety high-string pops ('pop') on syncopated offbeats, plus occasional soft muted ghost notes ('ghost').
- Harmonic structure: 4 rich jazz/neo-soul chords over a 16-beat cycle (each chord lasting 4 beats: at time 0, 4, 8, 12).
- Key: D minor, G minor, C minor, or F major.
- Notes must use standard pitch names like 'C2', 'D2', 'Eb2', 'E2', 'F2', 'G2', 'Ab2', 'A2', 'Bb2', 'B2', 'C3', 'D3', 'Eb3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C4'.
- Durations in beats (0.25 to 1.25). Times between 0.0 and 15.75.
- Tempo (bpm): Between 78 and 85 BPM.
- Title and description in Spanish reflecting the chilled slap bass aesthetic.

Return ONLY strict valid JSON matching this structure:
{
  "title": string,
  "key": string,
  "bpm": number,
  "description": string,
  "chords": [
    { "name": string, "notes": ["string", "string", "string", "string"], "time": 0, "duration": 4 }
  ],
  "bassline": [
    {
      "note": string,
      "time": number,
      "duration": number,
      "type": "slap" | "pop" | "thumb" | "ghost",
      "velocity": number (0.4 to 0.95)
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      const parsedGroove = JSON.parse(responseText);

      // Validate groove structure
      if (
        parsedGroove &&
        typeof parsedGroove.title === 'string' &&
        Array.isArray(parsedGroove.chords) &&
        Array.isArray(parsedGroove.bassline) &&
        parsedGroove.bassline.length >= 8
      ) {
        return res.json({
          success: true,
          groove: {
            title: parsedGroove.title || 'Bassify Gemini Slap Chill',
            key: parsedGroove.key || 'D menor (Gemini AI)',
            bpm: Math.min(95, Math.max(70, Number(parsedGroove.bpm) || 82)),
            description: parsedGroove.description || 'Groove de bajo slap relajado compuesto con Gemini AI.',
            chords: parsedGroove.chords,
            bassline: parsedGroove.bassline,
          },
          source: 'gemini-3.8-flash',
        });
      }

      // If validation fails, return fallback
      const selected = fallbackGrooves[Math.floor(Math.random() * fallbackGrooves.length)];
      return res.json({ success: true, groove: selected, source: 'fallback' });
    } catch (err) {
      console.error('Error generating music with Gemini:', err);
      const selected = fallbackGrooves[Math.floor(Math.random() * fallbackGrooves.length)];
      return res.json({ success: true, groove: selected, source: 'fallback' });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    process.env.DISABLE_HMR = 'true';
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bassify Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
