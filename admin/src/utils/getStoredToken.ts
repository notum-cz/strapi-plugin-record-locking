/**
 * Gets the value of a specified cookie.
 *
 * @param name - The name of the cookie to retrieve.
 * @returns The decoded cookie value if found, otherwise null.
 */
const getCookieValue = (name: string): string | null => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`));
  
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

/**
 * Returns jwtToken from localStorage or sessionStorage or cookie (preference in that order).
 *
 * @returns The jwtToken value as string if found, otherwise empty string.
 */
export const getStoredToken = (): string => {
    for (const storage of [localStorage, sessionStorage]) {
      const raw = storage.getItem('jwtToken');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          console.warn('Invalid JSON token found in storage');
        }
      }
    }
    return getCookieValue('jwtToken') || '';
};