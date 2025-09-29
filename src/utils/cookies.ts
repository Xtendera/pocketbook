export const setCookie = (name: string, value: string, days = 365): void => {
  if (typeof document === 'undefined') return; // SSR guard

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // SSR guard

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

export const DEMO_WARNING_COOKIE = 'pocketbook_demo_warning_accepted';

export const isDemoWarningAccepted = (): boolean => {
  return hasCookie(DEMO_WARNING_COOKIE);
};

export const setDemoWarningAccepted = (): void => {
  setCookie(DEMO_WARNING_COOKIE, 'true');
};

export const JWT_COOKIE = 'jwt';

export const getJwtToken = (): string | null => {
  return getCookie(JWT_COOKIE);
};

export const setJwtToken = (token: string, days = 7): void => {
  setCookie(JWT_COOKIE, token, days);
};

export const clearJwtToken = (): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${JWT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
};

export const parseJwtFromCookieString = (
  cookieString: string | undefined,
): string | null => {
  if (!cookieString) return null;

  const jwtMatch = cookieString.match(/(?:^|; )jwt=([^;]+)/);
  return jwtMatch ? jwtMatch[1] : null;
};
