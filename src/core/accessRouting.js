import { normalizeLessonSlug, parseLegacyAssignmentToken } from './lessonLinks.js';

export function resolveAccessRoute(locationLike) {
  const url = toUrl(locationLike);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/') return { kind: 'home' };
  if (pathname === '/admin') return { kind: 'admin' };

  const lessonMatch = pathname.match(/^\/a\/([^/]+)$/);
  if (lessonMatch) {
    const token = decodeURIComponent(lessonMatch[1]).trim();
    const legacy = parseLegacyAssignmentToken(token);
    if (legacy) return { kind: 'legacy-assignment', ...legacy };
    const slug = normalizeLessonSlug(token);
    return slug ? { kind: 'lesson-link', slug } : { kind: 'invalid-lesson-link' };
  }

  const legacySetMatch = pathname.match(/^\/s\/([^/]+)$/);
  if (legacySetMatch) {
    return { kind: 'legacy-set', setId: decodeURIComponent(legacySetMatch[1]) };
  }

  return { kind: 'not-found' };
}

function toUrl(locationLike) {
  const href = locationLike?.href ?? String(locationLike ?? 'https://example.invalid/');
  return new URL(href, 'https://example.invalid');
}
