const LEGACY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LEGACY_CODE_LENGTH = 6;
const LEGACY_CODE_PATTERN = new RegExp(`^[${LEGACY_CODE_ALPHABET}]{${LEGACY_CODE_LENGTH}}$`, 'i');

export function normalizeLessonSlug(value) {
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

export function validateLessonSlug(value) {
  const slug = normalizeLessonSlug(value);
  if (!slug || slug !== String(value ?? '').trim().toLocaleLowerCase('vi')) return false;
  const parts = slug.split('-');
  const last = parts.at(-1) ?? '';
  return !(parts.length > 1 && LEGACY_CODE_PATTERN.test(last));
}

export function buildFixedLessonUrl(locationLike, descriptorOrSlug) {
  const slug = normalizeLessonSlug(
    typeof descriptorOrSlug === 'string' ? descriptorOrSlug : descriptorOrSlug?.lessonSlug
  );
  if (!slug) throw new Error('Lesson slug is required.');
  const url = toUrl(locationLike);
  if (url.origin === 'https://example.invalid' || url.protocol === 'file:' || url.origin === 'null') {
    url.pathname = `/a/${slug}`;
    url.search = '';
    url.hash = '';
    return url.href;
  }
  return `${url.origin}/a/${slug}`;
}

export function parseLegacyAssignmentToken(value) {
  const decoded = decodeURIComponent(String(value ?? '')).trim();
  const match = decoded.match(/^(.*)-([A-HJ-NP-Z2-9]{6})$/i);
  if (!match) return null;
  const slug = normalizeLessonSlug(match[1]);
  if (!slug) return null;
  return { slug, code: match[2].toUpperCase() };
}

export function buildLegacyAssignmentUrl(locationLike, assignment) {
  const slug = normalizeLessonSlug(assignment?.slug);
  const code = normalizeLegacyAssignmentCode(assignment?.code);
  if (!slug || !code) throw new Error('Legacy assignment slug and code are required.');
  const url = toUrl(locationLike);
  if (url.origin === 'https://example.invalid' || url.protocol === 'file:' || url.origin === 'null') {
    url.pathname = `/a/${slug}-${code}`;
    url.search = '';
    url.hash = '';
    return url.href;
  }
  return `${url.origin}/a/${slug}-${code}`;
}

export function normalizeLegacyAssignmentCode(value) {
  const code = String(value ?? '').trim().toUpperCase();
  return LEGACY_CODE_PATTERN.test(code) ? code : '';
}

function toUrl(locationLike) {
  const href = locationLike?.href ?? String(locationLike ?? 'https://example.invalid/');
  return new URL(href, 'https://example.invalid');
}
