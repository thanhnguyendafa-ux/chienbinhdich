const loadedStyles = new Map();

export function ensureStyles(paths) {
  return Promise.all((paths ?? []).map(ensureStyle));
}

function ensureStyle(path) {
  const href = new URL(path, globalThis.location?.origin ?? 'https://example.invalid').pathname;
  if (loadedStyles.has(href)) return loadedStyles.get(href);

  const existing = [...(globalThis.document?.querySelectorAll?.('link[rel="stylesheet"]') ?? [])]
    .find(link => new URL(link.href, globalThis.location?.origin ?? 'https://example.invalid').pathname === href);
  if (existing) {
    const ready = Promise.resolve(existing);
    loadedStyles.set(href, ready);
    return ready;
  }

  if (!globalThis.document?.head) return Promise.resolve(null);
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => resolve(link), { once: true });
    link.addEventListener('error', () => reject(new Error(`Không tải được stylesheet: ${href}`)), { once: true });
    document.head.appendChild(link);
  });
  loadedStyles.set(href, promise);
  return promise;
}
