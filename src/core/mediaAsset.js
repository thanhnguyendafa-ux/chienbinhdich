import { MEDIA_BASE } from '../config/mediaConfig.js';

export function normalizeMediaPath(value) {
  const path = String(value ?? '').trim().replace(/^\/+/, '');
  if (!path) return '';
  if (/^(?:https?:)?\/\//i.test(path)) throw new Error('Media paths must be relative to MEDIA_BASE.');
  if (path.split('/').some(part => !part || part === '.' || part === '..')) throw new Error(`Invalid media path: ${path}`);
  return path;
}

export function mediaAssetUrl(value) {
  const path = normalizeMediaPath(value);
  return path ? `${MEDIA_BASE}/${path}` : '';
}
