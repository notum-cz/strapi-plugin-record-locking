/**
 * Gets the value of a specified cookie.
 *
 * @param name - The name of the cookie to retrieve.
 * @returns The decoded cookie value if found, otherwise null.
 */
export const getCookieValue = (name: string): string | null => {
    let result = null;
    const cookieArray = document.cookie.split(';');
    cookieArray.forEach((cookie) => {
      const [key, value] = cookie.split('=').map((item) => item.trim());
      if (key === name) {
        result = decodeURIComponent(value);
      }
    });
    return result;
  };