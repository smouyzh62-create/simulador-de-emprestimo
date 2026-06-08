const PIXEL_STORAGE_KEY = 'bb_fb_pixel_id';
const DEFAULT_PIXEL_ID = '1331608285582024';
const FACEBOOK_TRACKING_URL = 'https://www.facebook.com/tr';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function normalizePixelId(value: string | null | undefined) {
  const id = (value || '').replace(/\D/g, '').trim();
  return id || null;
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function cookieDomain() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  return host === 'hgsswsvip.top' || host.endsWith('.hgsswsvip.top') ? '; domain=.hgsswsvip.top' : '';
}

export function getFacebookPixelId() {
  try {
    const localId = normalizePixelId(localStorage.getItem(PIXEL_STORAGE_KEY));
    if (localId) return localId;
  } catch {}

  const cookieId = normalizePixelId(getCookie(PIXEL_STORAGE_KEY));
  return cookieId || DEFAULT_PIXEL_ID;
}

export function saveFacebookPixelId(value: string) {
  const id = normalizePixelId(value);

  if (id) {
    localStorage.setItem(PIXEL_STORAGE_KEY, id);
    document.cookie = `${PIXEL_STORAGE_KEY}=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax${cookieDomain()}`;
    return id;
  }

  localStorage.removeItem(PIXEL_STORAGE_KEY);
  document.cookie = `${PIXEL_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax${cookieDomain()}`;
  return '';
}

export function initializeFacebookPixel() {
  const pixelId = getFacebookPixelId();
  if (!pixelId || typeof window === 'undefined') return null;

  const win = window;
  if (!win.fbq) {
    const fbq = function (...args: unknown[]) {
      const q = fbq as typeof fbq & { queue: unknown[][]; callMethod?: (...args: unknown[]) => void };
      if (q.callMethod) q.callMethod(...args);
      else q.queue.push(args);
    } as typeof window.fbq & { queue: unknown[][]; loaded: boolean; version: string; push: typeof fbq };

    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.push = fbq;
    win.fbq = fbq;
    win._fbq = fbq;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  win.fbq('init', pixelId);
  win.fbq('track', 'PageView');
  sendFacebookPixelImage(pixelId, 'PageView');
  return pixelId;
}

function sendFacebookPixelImage(pixelId: string, eventName: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({
    id: pixelId,
    ev: eventName,
    noscript: '1',
  });

  Object.entries(params).forEach(([key, value]) => {
    query.set(`cd[${key}]`, value);
  });

  const img = new Image(1, 1);
  img.style.display = 'none';
  img.src = `${FACEBOOK_TRACKING_URL}?${query.toString()}`;

  if (document.body) document.body.appendChild(img);
  else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(img), { once: true });
}

export function trackFacebookContact(channel: 'whatsapp' | 'telegram') {
  const pixelId = getFacebookPixelId();
  if (!pixelId || typeof window === 'undefined') return;

  if (!window.fbq) initializeFacebookPixel();

  try {
    window.fbq?.('track', 'Contact', { channel });
    window.fbq?.('track', 'Lead', { channel });
  } catch {}

  sendFacebookPixelImage(pixelId, 'Contact', { channel });
  sendFacebookPixelImage(pixelId, 'Lead', { channel });
}
