import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB template
interface DatabaseSchema {
  version: string;
  items: any[];
  reports: any[];
  chatMessages: any[];
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
  moderationSettings: {
    autoCensorProfanity: true,
    blockOffensiveSubmission: false,
    customBadWords: [],
  },
  auth: {
    adminEmail: 'grupobassify@gmail.com',
    adminPassword: 'BassifyAdmin2026!',
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
  }
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

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

    // Protect Admin account grupobassify@gmail.com
    if (cleanEmail === auth.adminEmail.toLowerCase()) {
      if (password !== auth.adminPassword) {
        return res.status(401).json({
          error: 'Contraseña de administrador incorrecta. La cuenta oficial está blindada.',
        });
      }

      const adminUser = {
        email: auth.adminEmail,
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

    if (cleanEmail === auth.adminEmail.toLowerCase()) {
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

  // Reset Admin Password using PIN
  app.post('/api/auth/reset-admin', (req: Request, res: Response) => {
    const db = readDatabase();
    const { recoveryPin, newPassword } = req.body;
    const auth = db.auth || defaultDb.auth;

    if (!recoveryPin || recoveryPin !== auth.adminRecoveryPin) {
      return res.status(401).json({ error: 'PIN maestro de recuperación incorrecto.' });
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    db.auth = {
      ...auth,
      adminPassword: newPassword.trim(),
    };
    writeDatabase(db);
    return res.json({ success: true, message: 'Contraseña restablecida exitosamente.' });
  });

  // ==========================================
  // API ROUTES - PERSISTENT DATABASE STORAGE
  // ==========================================

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Get full database
  app.get('/api/db', (_req: Request, res: Response) => {
    const db = readDatabase();
    res.json(db);
  });

  // Save / Sync items
  app.post('/api/items', (req: Request, res: Response) => {
    const db = readDatabase();
    const newItem = req.body;
    if (!newItem.id) {
      newItem.id = 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    db.items = [newItem, ...db.items];
    writeDatabase(db);
    res.status(201).json(newItem);
  });

  // Update item
  app.put('/api/items/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const index = db.items.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    db.items[index] = { ...db.items[index], ...req.body };
    writeDatabase(db);
    res.json(db.items[index]);
  });

  // Delete item
  app.delete('/api/items/:id', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    db.items = db.items.filter((i: any) => i.id !== id);
    // Also remove related reports
    db.reports = db.reports.filter((r: any) => r.targetId !== id);
    writeDatabase(db);
    res.json({ success: true, deletedId: id });
  });

  // Add Comment to item
  app.post('/api/items/:id/comments', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id } = req.params;
    const comment = req.body;
    const item = db.items.find((i: any) => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (!comment.id) {
      comment.id = 'cmt_' + Date.now();
    }
    item.comments = [comment, ...(item.comments || [])];
    item.reviewCount = (item.comments || []).length;
    writeDatabase(db);
    res.status(201).json(comment);
  });

  // Delete Comment from item
  app.delete('/api/items/:id/comments/:commentId', (req: Request, res: Response) => {
    const db = readDatabase();
    const { id, commentId } = req.params;
    const item = db.items.find((i: any) => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    item.comments = (item.comments || []).filter((c: any) => c.id !== commentId);
    item.reviewCount = item.comments.length;
    // Mark associated reports as resolved/action taken
    db.reports.forEach((r: any) => {
      if (r.targetId === commentId) {
        r.status = 'action_taken';
        r.actionTakenNotes = 'Comentario eliminado por el administrador.';
      }
    });
    writeDatabase(db);
    res.json({ success: true, deletedCommentId: commentId });
  });

  // Submit a Report (Denuncia)
  app.post('/api/reports', (req: Request, res: Response) => {
    const db = readDatabase();
    const newReport = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    db.reports = [newReport, ...(db.reports || [])];
    writeDatabase(db);
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
    res.json(db.reports[reportIndex]);
  });

  // Post Chat Message
  app.post('/api/chat', (req: Request, res: Response) => {
    const db = readDatabase();
    const newMsg = {
      id: 'msg_' + Date.now(),
      timestamp: 'Hoy a las ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      ...req.body,
    };
    db.chatMessages = [...(db.chatMessages || []), newMsg];
    writeDatabase(db);
    res.status(201).json(newMsg);
  });

  // Reset all content (Admin only action)
  app.post('/api/db/reset', (_req: Request, res: Response) => {
    const db = readDatabase();
    db.items = [];
    writeDatabase(db);
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
      writeDatabase(imported);
      res.json({ success: true, count: imported.items.length });
    } catch {
      res.status(500).json({ error: 'Error al importar la base de datos' });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE INTEGRATION (DEV / PROD)
  // ==========================================
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
