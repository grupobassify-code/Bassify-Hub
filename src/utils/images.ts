import soundwaveImg from '../assets/images/ps_app_soundwave_studio_1792032421478.jpg';
import odysseyImg from '../assets/images/ps_game_scifi_odyssey_1792032420390.jpg';
import cyberKartImg from '../assets/images/ps_game_cyber_kart_1792032422740.jpg';
import psEventImg from '../assets/images/ps_news_playstation_event_1792032422581.jpg';

// Map of bundled images for Vite production builds
export const BUNDLED_IMAGES = {
  soundwave: soundwaveImg,
  odyssey: odysseyImg,
  cyberKart: cyberKartImg,
  psEvent: psEventImg,
};

// Curated high quality presets for games, apps, news and events (online CDN & bundled)
export const CONTENT_IMAGE_PRESETS = [
  {
    label: 'Bassify Studio (Audio/App)',
    logoUrl: soundwaveImg,
    bannerUrl: soundwaveImg,
    category: 'app',
  },
  {
    label: 'Aetheria Sci-Fi Odyssey (Juego)',
    logoUrl: odysseyImg,
    bannerUrl: odysseyImg,
    category: 'game',
  },
  {
    label: 'CyberKart Drift (Juego)',
    logoUrl: cyberKartImg,
    bannerUrl: cyberKartImg,
    category: 'game',
  },
  {
    label: 'Bassify PlayStation Event (Evento)',
    logoUrl: psEventImg,
    bannerUrl: psEventImg,
    category: 'event',
  },
  {
    label: 'Cyberpunk Neon City',
    logoUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1280&q=80',
    category: 'game',
  },
  {
    label: 'Cosmic Space Explorer',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80',
    category: 'game',
  },
  {
    label: 'PlayStation Esports Arena',
    logoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1280&q=80',
    category: 'event',
  },
  {
    label: 'Pro Audio Workstation',
    logoUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1280&q=80',
    category: 'app',
  },
];

/**
 * Generates an elegant SVG placeholder in Bassify Blue theme so no broken image icons ever show
 */
export const createSvgPlaceholder = (title: string = 'Bassify Hub', type: string = 'game'): string => {
  const safeTitle = (title || 'Bassify Hub').substring(0, 24);
  const typeLabel = (type || 'CONTENIDO').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050d1d" />
        <stop offset="50%" stop-color="#0a1936" />
        <stop offset="100%" stop-color="#002b66" />
      </linearGradient>
      <linearGradient id="circle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0070d1" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.05" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg-grad)" />
    <circle cx="400" cy="225" r="180" fill="url(#circle-grad)" />
    <circle cx="400" cy="225" r="120" stroke="#0070d1" stroke-width="2" stroke-dasharray="6 6" fill="none" opacity="0.4" />
    
    <!-- Geometric decorative lines -->
    <path d="M 100 350 L 300 200 L 500 280 L 700 150" stroke="#0070d1" stroke-width="3" fill="none" opacity="0.25" />
    <path d="M 150 400 L 350 250 L 550 330 L 750 200" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.18" />

    <!-- Bassify Hub Logo Graphic -->
    <g transform="translate(360, 130) scale(1.6)">
      <polygon points="25,5 45,20 45,45 25,60 5,45 5,20" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="25" cy="32.5" r="8" fill="#0070d1"/>
    </g>

    <text x="400" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="1">
      ${safeTitle}
    </text>
    <rect x="340" y="295" width="120" height="24" rx="12" fill="#00439c" opacity="0.8"/>
    <text x="400" y="311" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#38bdf8" letter-spacing="2">
      ${typeLabel}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Resolves any image URL safely:
 * - If it was stored as "/src/assets/images/...", maps to the bundled asset or public path
 * - Returns clean URL
 */
export const getSafeImageUrl = (url?: string, type: string = 'game', title: string = 'Bassify'): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return createSvgPlaceholder(title, type);
  }

  const trimmed = url.trim();

  // If it points to old /src/assets/images/...
  if (trimmed.includes('ps_app_soundwave_studio')) {
    return soundwaveImg;
  }
  if (trimmed.includes('ps_game_scifi_odyssey')) {
    return odysseyImg;
  }
  if (trimmed.includes('ps_game_cyber_kart')) {
    return cyberKartImg;
  }
  if (trimmed.includes('ps_news_playstation_event')) {
    return psEventImg;
  }

  return trimmed;
};
