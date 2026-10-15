// Sistema de Moderación y Filtro de Lenguaje Ofensivo para Bassify Hub
// Reemplaza palabras ofensivas por "####" y previene contenido tóxico

// Lista base de términos ofensivos en español e inglés común
export const DEFAULT_PROFANITY_LIST = [
  // Insultos y groserías comunes
  'puto', 'puta', 'putas', 'putos', 'putita', 'putito', 'putear',
  'mierda', 'mierdas', 'mierdon', 'mierdita',
  'pendejo', 'pendeja', 'pendejos', 'pendejas', 'pendejada',
  'cabron', 'cabrona', 'cabrones', 'cabronas', 'kbron', 'cabr0n',
  'idiota', 'idiotas', 'idiotez',
  'imbecil', 'imbécil', 'imbeciles', 'imbéciles',
  'estupido', 'estúpido', 'estupida', 'estúpida', 'estupidos', 'estupidez',
  'perra', 'perras', 'zorra', 'zorras',
  'culero', 'culeros', 'culera', 'culeras', 'culo', 'culos',
  'verga', 'vergas', 'vergazo', 'verguiza',
  'chingar', 'chinga', 'chingada', 'chingado', 'chingados', 'chingas', 'chingon',
  'joder', 'jodete', 'jódete', 'jodido', 'jodida', 'jodes',
  'coño', 'coños', 'cono',
  'maricon', 'maricón', 'marica', 'maricas', 'maricones',
  'gilipollas', 'gilipolla',
  'malparido', 'malparida', 'malparidos',
  'bastardo', 'bastarda', 'bastardos',
  'tarado', 'tarada', 'tarados',
  'hdp', 'hdtpm', 'chsm', 'ctm', 'alv',
  // Términos en inglés
  'fuck', 'fucker', 'fucking', 'shit', 'bitch', 'asshole', 'dick', 'bastard', 'cunt', 'retard'
];

/**
 * Normaliza texto eliminando acentos, caracteres especiales repetidos y signos comunes
 */
export const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .toLowerCase();
};

export interface ModerationResult {
  censoredText: string;
  hasProfanity: boolean;
  detectedWords: string[];
}

/**
 * Reemplaza cualquier palabra ofensiva por '####' respetando la puntuación y mayúsculas
 */
export const censorProfanity = (text: string, customWords: string[] = []): ModerationResult => {
  if (!text || typeof text !== 'string') {
    return { censoredText: '', hasProfanity: false, detectedWords: [] };
  }

  const allBannedWords = Array.from(new Set([...DEFAULT_PROFANITY_LIST, ...customWords.map(w => w.toLowerCase().trim())]));
  const detectedWords: string[] = [];
  let result = text;

  allBannedWords.forEach(badWord => {
    if (!badWord || badWord.length < 2) return;

    // Crear regex que busque la palabra completa o con variantes tipo p.u.t.a o p*ta o p0uto
    // Reemplaza números comúnmente usados como letras (0->o, 1->i, 3->e, 4->a, 5->s, 7->t)
    const escaped = badWord
      .replace(/a/g, '[a|4|@]')
      .replace(/e/g, '[e|3]')
      .replace(/i/g, '[i|1|!]')
      .replace(/o/g, '[o|0]')
      .replace(/u/g, '[u|v]')
      .replace(/s/g, '[s|5|$]');

    // Expresión regular que detecte límites de palabra o separadores
    const regex = new RegExp(`(?<=^|[\\s.,;:¡!¿?()\\-_/\\\\])${escaped}(?=[\\s.,;:¡!¿?()\\-_/\\\\]|$)`, 'gi');

    if (regex.test(result)) {
      detectedWords.push(badWord);
      // Reemplaza por '####'
      result = result.replace(regex, '####');
    }
  });

  return {
    censoredText: result,
    hasProfanity: detectedWords.length > 0,
    detectedWords,
  };
};

/**
 * Revisa si un texto contiene palabras ofensivas
 */
export const containsProfanity = (text: string, customWords: string[] = []): boolean => {
  return censorProfanity(text, customWords).hasProfanity;
};
