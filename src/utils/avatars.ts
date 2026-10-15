// Colección de avatares minimalistas basados en figuras geométricas y vectores
// Diseñados con temática Bassify Hub azul y blanco (sin personas reales)

export const createSvgAvatar = (shape: string, bgGradient: [string, string], iconSvg: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad-${shape}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="28" fill="url(#grad-${shape})" />
    <g transform="translate(15, 15) scale(0.7)" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconSvg}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_FIGURE_AVATARS = [
  {
    id: 'bassify-crown',
    name: 'Corona Bassify (Admin)',
    url: createSvgAvatar('crown', ['#003791', '#0070d1'], `
      <path d="M10 30 L25 80 L75 80 L90 30 L65 55 L50 20 L35 55 Z" fill="rgba(255,255,255,0.18)" stroke="#ffffff" stroke-width="4"/>
      <circle cx="50" cy="20" r="4" fill="#38bdf8" stroke="none" />
      <circle cx="10" cy="30" r="4" fill="#38bdf8" stroke="none" />
      <circle cx="90" cy="30" r="4" fill="#38bdf8" stroke="none" />
    `),
  },
  {
    id: 'game-controller',
    name: 'Mando Gamer',
    url: createSvgAvatar('gamepad', ['#0f2b5c', '#1d4ed8'], `
      <rect x="10" y="30" width="80" height="50" rx="20" fill="rgba(255,255,255,0.12)" stroke="#ffffff" stroke-width="4"/>
      <path d="M28 45 L28 65 M18 55 L38 55" stroke="#38bdf8" stroke-width="4"/>
      <circle cx="70" cy="50" r="4" fill="#ffffff" stroke="none"/>
      <circle cx="80" cy="60" r="4" fill="#ffffff" stroke="none"/>
      <circle cx="60" cy="60" r="4" fill="#ffffff" stroke="none"/>
      <circle cx="70" cy="70" r="4" fill="#ffffff" stroke="none"/>
    `),
  },
  {
    id: 'sound-wave',
    name: 'Frecuencia Sonora',
    url: createSvgAvatar('wave', ['#031b4d', '#0284c7'], `
      <path d="M15 50 L25 30 L35 70 L45 20 L55 80 L65 35 L75 65 L85 50" stroke="#ffffff" stroke-width="5" fill="none"/>
      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
    `),
  },
  {
    id: 'geometric-cube',
    name: 'Cubo Isométrico',
    url: createSvgAvatar('cube', ['#1e1b4b', '#4338ca'], `
      <path d="M50 15 L85 35 L85 75 L50 95 L15 75 L15 35 Z" fill="rgba(255,255,255,0.1)" stroke="#ffffff" stroke-width="4"/>
      <path d="M50 15 L50 95 M50 55 L85 35 M50 55 L15 35" stroke="#38bdf8" stroke-width="3"/>
    `),
  },
  {
    id: 'geometric-shield',
    name: 'Escudo Guardián',
    url: createSvgAvatar('shield', ['#0f172a', '#2563eb'], `
      <path d="M50 15 L85 25 L85 55 C85 75 50 90 50 90 C50 90 15 75 15 55 L15 25 Z" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="4"/>
      <path d="M35 50 L45 60 L65 40" stroke="#38bdf8" stroke-width="5"/>
    `),
  },
  {
    id: 'minimal-star',
    name: 'Estrella Geométrica',
    url: createSvgAvatar('star', ['#0b1a3d', '#3b82f6'], `
      <polygon points="50,15 61,38 86,41 68,59 73,84 50,71 27,84 32,59 14,41 39,38" fill="rgba(255,255,255,0.18)" stroke="#ffffff" stroke-width="3.5"/>
      <circle cx="50" cy="50" r="10" fill="#38bdf8" stroke="none"/>
    `),
  },
  {
    id: 'abstract-avatar',
    name: 'Figura Minimalista',
    url: createSvgAvatar('user', ['#1e293b', '#0369a1'], `
      <circle cx="50" cy="35" r="18" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="4"/>
      <path d="M20 85 C20 65 35 60 50 60 C65 60 80 65 80 85" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="4"/>
    `),
  },
  {
    id: 'spark-crystal',
    name: 'Cristal Poligonal',
    url: createSvgAvatar('crystal', ['#082f49', '#0284c7'], `
      <polygon points="50,10 80,35 80,65 50,90 20,65 20,35" fill="rgba(255,255,255,0.12)" stroke="#ffffff" stroke-width="4"/>
      <line x1="50" y1="10" x2="50" y2="90" stroke="#38bdf8" stroke-width="3"/>
      <line x1="20" y1="35" x2="80" y2="65" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <line x1="20" y1="65" x2="80" y2="35" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    `),
  },
  {
    id: 'cyber-hexagon',
    name: 'Hexágono Digital',
    url: createSvgAvatar('hexagon', ['#0a192f', '#0284c7'], `
      <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="rgba(56,189,248,0.12)" stroke="#ffffff" stroke-width="4"/>
      <circle cx="50" cy="50" r="16" stroke="#38bdf8" stroke-width="3" fill="none"/>
      <circle cx="50" cy="50" r="6" fill="#ffffff" stroke="none"/>
    `),
  },
  {
    id: 'orbital-ring',
    name: 'Planeta Orbital',
    url: createSvgAvatar('orbit', ['#0c1938', '#2563eb'], `
      <circle cx="50" cy="50" r="24" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="4"/>
      <ellipse cx="50" cy="50" rx="42" ry="14" stroke="#38bdf8" stroke-width="3" transform="rotate(-25 50 50)" fill="none"/>
      <circle cx="78" cy="38" r="4" fill="#38bdf8" stroke="none"/>
    `),
  },
  {
    id: 'prism-triangle',
    name: 'Prisma Triángulo',
    url: createSvgAvatar('triangle', ['#1e1b4b', '#1d4ed8'], `
      <polygon points="50,15 90,85 10,85" fill="rgba(255,255,255,0.15)" stroke="#ffffff" stroke-width="4"/>
      <polygon points="50,40 75,80 25,80" stroke="#38bdf8" stroke-width="3" fill="none"/>
    `),
  },
  {
    id: 'pulse-radar',
    name: 'Pulso de Radar',
    url: createSvgAvatar('radar', ['#08203e', '#0369a1'], `
      <circle cx="50" cy="50" r="38" stroke="#ffffff" stroke-width="3" fill="none"/>
      <circle cx="50" cy="50" r="26" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3" fill="none"/>
      <circle cx="50" cy="50" r="14" stroke="#ffffff" stroke-width="2" fill="none"/>
      <line x1="50" y1="50" x2="78" y2="22" stroke="#38bdf8" stroke-width="4"/>
      <circle cx="50" cy="50" r="4" fill="#38bdf8" stroke="none"/>
    `),
  },
];

export const DEFAULT_ADMIN_AVATAR = DEFAULT_FIGURE_AVATARS[0].url;
export const DEFAULT_GUEST_AVATAR = DEFAULT_FIGURE_AVATARS[1].url;
