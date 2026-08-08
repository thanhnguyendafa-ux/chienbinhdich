const ASSIGNMENT_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ASSIGNMENT_CODE_LENGTH = 6;

export function resolveAccessRoute(locationLike) {
  const url = toUrl(locationLike);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/') return { kind: 'home' };
  if (pathname === '/admin') return { kind: 'admin' };

  const assignmentMatch = pathname.match(/^\/a\/([^/]+)$/);
  if (assignmentMatch) {
    const parsed = parseAssignmentPathToken(assignmentMatch[1]);
    return parsed ? { kind: 'assignment', ...parsed } : { kind: 'invalid-assignment' };
  }

  const legacySetMatch = pathname.match(/^\/s\/([^/]+)$/);
  if (legacySetMatch) {
    return { kind: 'legacy-set', setId: decodeURIComponent(legacySetMatch[1]) };
  }

  return { kind: 'not-found' };
}

export function parseAssignmentPathToken(value) {
  const decoded = decodeURIComponent(String(value ?? '')).trim();
  const match = decoded.match(/^(.*)-([A-HJ-NP-Z2-9]{6})$/i);
  if (!match) return null;

  const slug = normalizeAssignmentSlug(match[1]);
  if (!slug) return null;

  return {
    slug,
    code: match[2].toUpperCase()
  };
}

export function buildAssignmentShareUrl(locationLike, { slug, code }) {
  const normalizedSlug = normalizeAssignmentSlug(slug);
  const normalizedCode = normalizeAssignmentCode(code);
  if (!normalizedSlug || !normalizedCode) throw new Error('Assignment slug and code are required.');

  const url = toUrl(locationLike);
  if (url.origin === 'https://example.invalid' || url.protocol === 'file:' || url.origin === 'null') {
    url.pathname = `/a/${normalizedSlug}-${normalizedCode}`;
    url.search = '';
    url.hash = '';
    return url.href;
  }

  return `${url.origin}/a/${normalizedSlug}-${normalizedCode}`;
}

export function normalizeAssignmentSlug(value) {
  return String(value ?? '')
    .trim()
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function normalizeAssignmentCode(value) {
  const code = String(value ?? '').trim().toUpperCase();
  return new RegExp(`^[${ASSIGNMENT_CODE_ALPHABET}]{${ASSIGNMENT_CODE_LENGTH}}$`).test(code) ? code : '';
}

export function generateAssignmentCode(cryptoLike = globalThis.crypto) {
  if (!cryptoLike?.getRandomValues) throw new Error('Secure random generator is unavailable.');
  const values = new Uint32Array(ASSIGNMENT_CODE_LENGTH);
  cryptoLike.getRandomValues(values);
  return Array.from(values, value => ASSIGNMENT_CODE_ALPHABET[value % ASSIGNMENT_CODE_ALPHABET.length]).join('');
}

export function activityTypeSlug(activityTypes) {
  const types = Array.isArray(activityTypes) ? activityTypes : [];
  if (types.length !== 1) return 'mix';
  return ({
    typing: 'typing',
    mcq: 'mcq',
    true_false: 'tf',
    sentence_order: 'order',
    matching: 'match',
    fill_blank: 'fill',
    reading: 'read',
    writing: 'write',
    speaking: 'speak'
  })[types[0]] ?? 'mix';
}

function toUrl(locationLike) {
  const href = locationLike?.href ?? String(locationLike ?? 'https://example.invalid/');
  return new URL(href, 'https://example.invalid');
}

export const assignmentCodeAlphabet = ASSIGNMENT_CODE_ALPHABET;
export const assignmentCodeLength = ASSIGNMENT_CODE_LENGTH;
