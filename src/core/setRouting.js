export function resolveSetIdFromLocation(locationLike) {
  if (!locationLike) return null;
  const href = locationLike.href ?? String(locationLike);
  const url = new URL(href, 'https://example.invalid');
  const pathMatch = url.pathname.match(/^\/s\/([^/]+)\/?$/);
  if (pathMatch) return decodeURIComponent(pathMatch[1]);
  return url.searchParams.get('set');
}

export function buildSetShareUrl(locationLike, setId) {
  const href = locationLike?.href ?? String(locationLike ?? 'https://example.invalid/');
  const url = new URL(href, 'https://example.invalid');
  if (url.protocol === 'file:' || url.origin === 'null' || url.origin === 'https://example.invalid') {
    url.pathname = url.pathname || '/';
    url.search = '';
    url.searchParams.set('set', setId);
    return url.href;
  }
  return `${url.origin}/s/${encodeURIComponent(setId)}`;
}
