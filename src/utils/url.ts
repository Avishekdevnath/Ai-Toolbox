export function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
}

export function getAppBaseUrl(): string {
  const appBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (appBase) {
    return normalizeBaseUrl(appBase);
  }

  // fallback for server-side or special routes
  const main = process.env.MAIN_URL;
  if (main) {
    return normalizeBaseUrl(main);
  }

  // fallback to current host in browser
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
}

export function getShareBaseUrl(): string {
  const main = process.env.NEXT_PUBLIC_MAIN_URL || process.env.MAIN_URL;
  if (main) {
    return normalizeBaseUrl(main);
  }

  const shortBase = process.env.NEXT_PUBLIC_SHORT_BASE_URL;
  if (shortBase) {
    return normalizeBaseUrl(shortBase);
  }

  return getAppBaseUrl();
}
